import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createServiceClient, ensureDeviceProfile, ensureVideo } from '../_shared/db.ts';
import { errorResponse, jsonResponse, parseJsonBody } from '../_shared/http.ts';
import { createCorsHeaders } from '../_shared/cors.ts';

type SubmitFeedbackBody = {
  bvid: string;
  cid: string;
  epId?: string;
  segmentId?: string;
  action: 'confirm' | 'not_ad' | 'adjust';
  deltaStartMs?: number;
  deltaEndMs?: number;
  actor?: {
    deviceId?: string;
    userId?: string;
  };
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
    const body = await parseJsonBody<SubmitFeedbackBody>(request);
    if (!body.bvid || !body.cid) {
      return errorResponse('Missing bvid or cid', 400, origin);
    }

    if (!body.action || !['confirm', 'not_ad', 'adjust'].includes(body.action)) {
      return errorResponse('Invalid feedback action', 400, origin);
    }

    const client = createServiceClient();
    const video = await ensureVideo(client, body);
    await ensureDeviceProfile(client, body.actor?.deviceId);

    const { data: feedback, error } = await client
      .from('segment_feedback')
      .insert({
        video_id: video.id,
        segment_id: body.segmentId || null,
        action: body.action,
        delta_start_ms: Number.isFinite(Number(body.deltaStartMs)) ? Number(body.deltaStartMs) : 0,
        delta_end_ms: Number.isFinite(Number(body.deltaEndMs)) ? Number(body.deltaEndMs) : 0,
        actor_device_id: body.actor?.deviceId || null,
        actor_user_id: body.actor?.userId || null,
      })
      .select('id')
      .single();

    if (error || !feedback) {
      throw new Error(error?.message || 'Failed to submit feedback');
    }

    return jsonResponse(
      {
        accepted: true,
        feedbackId: feedback.id,
        localOverride: {
          muteUntilReload: body.action === 'not_ad',
        },
      },
      200,
      origin
    );
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to submit feedback',
      500,
      origin
    );
  }
});
