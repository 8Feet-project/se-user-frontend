import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createServiceClient, ensureVideo } from '../_shared/db.ts';
import { errorResponse, jsonResponse, parseJsonBody } from '../_shared/http.ts';
import { createCorsHeaders } from '../_shared/cors.ts';

type RequestAnalysisBody = {
  bvid: string;
  cid: string;
  epId?: string;
  title?: string;
  durationMs?: number;
  trigger?: 'lookup_miss' | 'manual';
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
    const body = await parseJsonBody<RequestAnalysisBody>(request);
    if (!body.bvid || !body.cid) {
      return errorResponse('Missing bvid or cid', 400, origin);
    }

    const client = createServiceClient();
    const video = await ensureVideo(client, body);

    const { data: activeJob, error: activeJobError } = await client
      .from('analysis_jobs')
      .select('id, status')
      .eq('video_id', video.id)
      .in('status', ['pending', 'running'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (activeJobError) {
      throw new Error(activeJobError.message);
    }

    if (activeJob) {
      return jsonResponse(
        {
          accepted: false,
          jobId: activeJob.id,
          status: activeJob.status,
        },
        200,
        origin
      );
    }

    const { data: job, error: insertError } = await client
      .from('analysis_jobs')
      .insert({
        video_id: video.id,
        job_type: 'ingest_subtitles',
        payload_json: {
          trigger: body.trigger || 'lookup_miss',
          bvid: body.bvid,
          cid: body.cid,
        },
        status: 'pending',
      })
      .select('id, status')
      .single();

    if (insertError || !job) {
      throw new Error(insertError?.message || 'Failed to create analysis job');
    }

    const { error: updateVideoError } = await client
      .from('videos')
      .update({
        status: 'queued',
      })
      .eq('id', video.id);

    if (updateVideoError) {
      throw new Error(updateVideoError.message);
    }

    return jsonResponse(
      {
        accepted: true,
        jobId: job.id,
        status: job.status,
      },
      200,
      origin
    );
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to request analysis',
      500,
      origin
    );
  }
});
