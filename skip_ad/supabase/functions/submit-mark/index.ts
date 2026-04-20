import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createServiceClient, ensureDeviceProfile, ensureVideo } from '../_shared/db.ts';
import { errorResponse, jsonResponse, parseJsonBody } from '../_shared/http.ts';
import { createCorsHeaders } from '../_shared/cors.ts';

type SubmitMarkBody = {
  bvid: string;
  cid: string;
  epId?: string;
  startMs: number;
  endMs: number;
  label?: string;
  snappedToSubtitle?: boolean;
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
    const body = await parseJsonBody<SubmitMarkBody>(request);
    if (!body.bvid || !body.cid) {
      return errorResponse('Missing bvid or cid', 400, origin);
    }

    if (!Number.isFinite(Number(body.startMs)) || !Number.isFinite(Number(body.endMs))) {
      return errorResponse('Invalid mark boundaries', 400, origin);
    }

    if (Number(body.endMs) <= Number(body.startMs)) {
      return errorResponse('endMs must be greater than startMs', 400, origin);
    }

    const client = createServiceClient();
    const video = await ensureVideo(client, body);
    await ensureDeviceProfile(client, body.actor?.deviceId);

    const { data: proposal, error } = await client
      .from('segment_proposals')
      .insert({
        video_id: video.id,
        source: 'manual',
        start_ms: Number(body.startMs),
        end_ms: Number(body.endMs),
        label: body.label || 'manual sponsor mark',
        confidence: 0.5,
        rationale_json: {
          snappedToSubtitle: Boolean(body.snappedToSubtitle),
        },
        created_by_device_id: body.actor?.deviceId || null,
        created_by_user_id: body.actor?.userId || null,
        status: 'pending',
      })
      .select('id')
      .single();

    if (error || !proposal) {
      throw new Error(error?.message || 'Failed to create proposal');
    }

    return jsonResponse(
      {
        accepted: true,
        proposalId: proposal.id,
      },
      200,
      origin
    );
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to submit mark',
      500,
      origin
    );
  }
});
