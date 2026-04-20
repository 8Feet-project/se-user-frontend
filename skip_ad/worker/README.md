# Worker

This service polls `analysis_jobs`, ingests subtitles, runs candidate window detection, classifies likely sponsor windows, and applies the first consensus pass.

## Requirements

- Node.js 18+
- `yt-dlp` available on the host path, or set `YT_DLP_PATH`
- Supabase service role key
- OpenAI API key for ASR and classification

## Run

1. Copy `.env.example` to your runtime environment
2. Install dependencies inside `skip_ad/worker`
3. Run `npm start`

## Current Scope

- Polls pending `ingest_subtitles` jobs
- Prefers official subtitles from `yt-dlp --dump-single-json`
- Falls back to audio download + transcription when subtitles are missing
- Generates candidate windows using fixed keyword rules
- Calls an LLM with structured JSON output
- Publishes only proposals that satisfy the current consensus rules
