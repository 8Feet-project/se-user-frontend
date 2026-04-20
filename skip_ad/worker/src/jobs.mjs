import { buildCandidateWindows } from './rules.mjs';
import { classifyCandidateWindows } from './llm.mjs';
import { derivePublishedSegments } from './consensus.mjs';
import { extractSubtitleBundle } from './subtitles.mjs';
import { uploadJsonArtifact } from './supabase.mjs';

export async function claimPendingJob(client) {
  const now = new Date().toISOString();
  const { data: pendingJobs, error } = await client
    .from('analysis_jobs')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_at', now)
    .order('scheduled_at', { ascending: true })
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  const job = pendingJobs && pendingJobs[0];
  if (!job) {
    return null;
  }

  const { data: claimed, error: claimError } = await client
    .from('analysis_jobs')
    .update({
      status: 'running',
      started_at: now,
      attempts: Number(job.attempts || 0) + 1,
    })
    .eq('id', job.id)
    .eq('status', 'pending')
    .select('*')
    .maybeSingle();

  if (claimError) {
    throw new Error(claimError.message);
  }

  return claimed;
}

export async function runAnalysisJob({ client, openai, config, logger, job }) {
  const { data: video, error: videoError } = await client
    .from('videos')
    .select('*')
    .eq('id', job.video_id)
    .single();

  if (videoError || !video) {
    throw new Error(videoError?.message || 'Video not found');
  }

  await client
    .from('videos')
    .update({
      status: 'processing',
    })
    .eq('id', video.id);

  const subtitleBundle = await extractSubtitleBundle(video, config, openai, logger);

  await uploadJsonArtifact(
    client,
    'subtitle-artifacts-private',
    video.id + '/subtitle-bundle.json',
    subtitleBundle
  );

  await persistSubtitleLines(client, video.id, subtitleBundle.lines);

  const candidateWindows = buildCandidateWindows(subtitleBundle.lines, config);
  logger.info('Generated candidate windows', { count: candidateWindows.length });

  const classifications = await classifyCandidateWindows(openai, config, candidateWindows, logger);
  logger.info('Classified candidate windows', { count: classifications.length });

  await replaceGeneratedProposals(client, video.id, classifications, subtitleBundle.lines, video.duration_ms);

  const [manualProposals, aiProposals, feedback, existingPublished] = await Promise.all([
    fetchRows(client, 'segment_proposals', {
      video_id: video.id,
      source: 'manual',
    }),
    fetchRows(client, 'segment_proposals', {
      video_id: video.id,
      source: 'ai',
    }),
    fetchRows(client, 'segment_feedback', {
      video_id: video.id,
    }),
    fetchRows(client, 'published_segments', {
      video_id: video.id,
    }),
  ]);

  const publishedSegments = derivePublishedSegments({
    aiProposals,
    manualProposals,
    feedback,
    existingPublished,
  });

  await replacePublishedSegments(client, video.id, publishedSegments);

  await client
    .from('videos')
    .update({
      status: publishedSegments.length ? 'ready' : 'processing',
      subtitle_source: subtitleBundle.source,
      subtitle_hash: String(subtitleBundle.lines.length),
    })
    .eq('id', video.id);

  await client
    .from('analysis_jobs')
    .update({
      status: 'completed',
      finished_at: new Date().toISOString(),
      error_message: null,
    })
    .eq('id', job.id);
}

export async function markJobFailed(client, jobId, message) {
  await client
    .from('analysis_jobs')
    .update({
      status: 'failed',
      error_message: message,
      finished_at: new Date().toISOString(),
    })
    .eq('id', jobId);
}

async function persistSubtitleLines(client, videoId, lines) {
  await client.from('subtitle_lines').delete().eq('video_id', videoId);

  if (!lines.length) {
    return;
  }

  const { error } = await client.from('subtitle_lines').insert(
    lines.map((line, index) => ({
      video_id: videoId,
      line_index: Number.isFinite(Number(line.line_index)) ? Number(line.line_index) : index,
      start_ms: line.start_ms,
      end_ms: line.end_ms,
      text: line.text,
      normalized_text: line.normalized_text,
    }))
  );

  if (error) {
    throw new Error(error.message);
  }
}

async function replaceGeneratedProposals(client, videoId, classifications, subtitleLines, durationMs) {
  await client
    .from('segment_proposals')
    .delete()
    .eq('video_id', videoId)
    .in('source', ['ai', 'rule']);

  if (!classifications.length) {
    return;
  }

  const byLineIndex = new Map(
    subtitleLines.map((line) => [Number(line.line_index), line])
  );

  const proposals = classifications.map((item) => {
    const startLine = byLineIndex.get(Number(item.startLineIndex)) || item.window.lines[0];
    const endLine =
      byLineIndex.get(Number(item.endLineIndex)) ||
      item.window.lines[item.window.lines.length - 1];

    const startMs = Math.max(0, Number(startLine.start_ms || startLine.startMs) - 500);
    const endMs = Math.min(
      Number(durationMs || Number(endLine.end_ms || endLine.endMs) + 700),
      Number(endLine.end_ms || endLine.endMs) + 700
    );

    return {
      video_id: videoId,
      source: 'ai',
      start_ms: startMs,
      end_ms: endMs,
      label: item.label || 'sponsor',
      confidence: Number(item.confidence || 0),
      rationale_json: {
        reason: item.reason,
        startLineIndex: item.startLineIndex,
        endLineIndex: item.endLineIndex,
        originalWindow: item.window,
      },
      status: 'pending',
    };
  });

  const { error } = await client.from('segment_proposals').insert(proposals);
  if (error) {
    throw new Error(error.message);
  }
}

async function replacePublishedSegments(client, videoId, segments) {
  await client.from('published_segments').delete().eq('video_id', videoId);

  if (!segments.length) {
    return;
  }

  const { error } = await client.from('published_segments').insert(
    segments.map((segment, index) => ({
      video_id: videoId,
      start_ms: segment.start_ms,
      end_ms: segment.end_ms,
      label: segment.label,
      score: segment.score,
      version: index + 1,
      derived_from_json: segment.derived_from_json || [],
    }))
  );

  if (error) {
    throw new Error(error.message);
  }
}

async function fetchRows(client, table, filters) {
  let query = client.from(table).select('*');
  Object.entries(filters).forEach(([key, value]) => {
    query = query.eq(key, value);
  });

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}
