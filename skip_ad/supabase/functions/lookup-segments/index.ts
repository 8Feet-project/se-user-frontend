import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createServiceClient, ensureVideo } from '../_shared/db.ts';
import { errorResponse, jsonResponse, parseJsonBody } from '../_shared/http.ts';
import { createCorsHeaders } from '../_shared/cors.ts';

type LookupBody = {
  bvid: string;
  cid: string;
  epId?: string;
  title?: string;
  durationMs?: number;
};

serve(async (request) => {
  const origin = request.headers.get('origin') || undefined;
  if (request.method === 'OPTIONS') {
    return new Response('ok', {
      headers: createCorsHeaders(origin),
    });
  }

  if (request.method !== 'POST') {
    return errorResponse('Method not allowed', 405, origin);
  }

  try {
    const body = await parseJsonBody<LookupBody>(request);
    if (!body.bvid || !body.cid) {
      return errorResponse('Missing bvid or cid', 400, origin);
    }

    const client = createServiceClient();
    const video = await ensureVideo(client, body);

    const [{ data: publishedSegments, error: segmentError }, { data: activeJobs, error: jobError }] =
      await Promise.all([
        client
          .from('published_segments')
          .select('id, start_ms, end_ms, label, score, version')
          .eq('video_id', video.id)
          .order('start_ms', { ascending: true }),
        client
          .from('analysis_jobs')
          .select('id, status')
          .eq('video_id', video.id)
          .in('status', ['pending', 'running'])
          .order('created_at', { ascending: false })
          .limit(1),
      ]);

    if (segmentError) {
      throw new Error(segmentError.message);
    }

    if (jobError) {
      throw new Error(jobError.message);
    }

    const segments = (publishedSegments || []).map((segment) => ({
      id: segment.id,
      startMs: segment.start_ms,
      endMs: segment.end_ms,
      label: segment.label,
      score: Number(segment.score || 0),
      version: Number(segment.version || 1),
    }));

    const status = segments.length ? 'ready' : activeJobs && activeJobs.length ? 'processing' : 'missing';

    return jsonResponse(
      {
        status,
        videoId: video.id,
        segments,
        subtitleAvailable: Boolean(video.subtitle_hash || video.subtitle_source),
        requestedAnalysis: false,
      },
      200,
      origin
    );
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Lookup failed', 500, origin);
  }
});
