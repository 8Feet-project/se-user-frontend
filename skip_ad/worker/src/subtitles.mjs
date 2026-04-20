import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

export async function extractSubtitleBundle(video, config, openai, logger) {
  const videoUrl = buildVideoUrl(video);
  const metadata = await fetchVideoMetadata(videoUrl, config.tools.ytDlpPath);
  const directSubtitles = await tryFetchOfficialSubtitles(metadata);

  if (directSubtitles.length) {
    logger.info('Using official subtitles', { lineCount: directSubtitles.length });
    return {
      lines: directSubtitles,
      source: 'official',
      artifact: {
        metadata,
        lineCount: directSubtitles.length,
      },
    };
  }

  logger.warn('Official subtitles missing, falling back to transcription', {
    bvid: video.bvid,
    cid: video.cid,
  });

  const transcription = await transcribeFromAudio(videoUrl, config, openai);
  return {
    lines: transcription.lines,
    source: 'transcribe',
    artifact: transcription.artifact,
  };
}

function buildVideoUrl(video) {
  return 'https://www.bilibili.com/video/' + video.bvid;
}

async function fetchVideoMetadata(videoUrl, ytDlpPath) {
  const output = await runCommand(ytDlpPath, ['--dump-single-json', '--skip-download', '--no-warnings', videoUrl]);
  return JSON.parse(output.stdout);
}

async function tryFetchOfficialSubtitles(metadata) {
  const subtitleTracks = flattenSubtitleTracks(metadata?.subtitles).concat(
    flattenSubtitleTracks(metadata?.automatic_captions)
  );

  const preferredTrack =
    subtitleTracks.find((track) => /zh-Hans|zh-CN|zh/i.test(track.language || '')) || subtitleTracks[0];

  if (!preferredTrack || !preferredTrack.url) {
    return [];
  }

  const response = await fetch(preferredTrack.url);
  if (!response.ok) {
    return [];
  }

  const parsed = await response.json();
  const rawLines = Array.isArray(parsed.body) ? parsed.body : [];
  return rawLines
    .map((line, index) => ({
      line_index: index,
      start_ms: Math.round(Number(line.from || 0) * 1000),
      end_ms: Math.round(Number(line.to || 0) * 1000),
      text: String(line.content || '').trim(),
      normalized_text: normalizeText(String(line.content || '')),
    }))
    .filter((line) => line.text && line.end_ms > line.start_ms);
}

function flattenSubtitleTracks(groupedTracks) {
  if (!groupedTracks || typeof groupedTracks !== 'object') {
    return [];
  }

  return Object.entries(groupedTracks).flatMap(([language, tracks]) => {
    if (!Array.isArray(tracks)) {
      return [];
    }

    return tracks.map((track) => ({
      language,
      url: track.url,
      ext: track.ext,
    }));
  });
}

async function transcribeFromAudio(videoUrl, config, openai) {
  const tempDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'bili-sponsorblock-'));
  const audioPath = path.join(tempDirectory, 'audio.%(ext)s');
  const finalAudioPath = path.join(tempDirectory, 'audio.mp3');

  try {
    await runCommand(config.tools.ytDlpPath, [
      '--no-warnings',
      '--no-playlist',
      '-x',
      '--audio-format',
      'mp3',
      '-o',
      audioPath,
      videoUrl,
    ]);

    const transcription = await openai.audio.transcriptions.create({
      file: await fs.open(finalAudioPath, 'r').then((fileHandle) => fileHandle.createReadStream()),
      model: config.openai.models.transcribe,
      response_format: 'verbose_json',
    });

    const lines = Array.isArray(transcription.segments)
      ? transcription.segments.map((segment, index) => ({
          line_index: index,
          start_ms: Math.round(Number(segment.start || 0) * 1000),
          end_ms: Math.round(Number(segment.end || 0) * 1000),
          text: String(segment.text || '').trim(),
          normalized_text: normalizeText(String(segment.text || '')),
        }))
      : [];

    return {
      lines: lines.filter((line) => line.text && line.end_ms > line.start_ms),
      artifact: {
        source: 'transcribe',
        segmentCount: lines.length,
      },
    };
  } finally {
    await fs.rm(tempDirectory, {
      recursive: true,
      force: true,
    });
  }
}

function normalizeText(input) {
  return input.replace(/\s+/g, ' ').trim().toLowerCase();
}

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => {
      reject(error);
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr || 'Command failed'));
        return;
      }

      resolve({
        stdout,
        stderr,
      });
    });
  });
}
