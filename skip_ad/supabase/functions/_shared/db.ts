import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export function createServiceClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase service environment variables');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function ensureVideo(
  client: ReturnType<typeof createServiceClient>,
  payload: {
    bvid: string;
    cid: string;
    epId?: string;
    title?: string;
    durationMs?: number;
  }
) {
  const normalizedTitle = typeof payload.title === 'string' ? payload.title.trim() : '';
  const normalizedDurationMs = Number.isFinite(Number(payload.durationMs))
    ? Number(payload.durationMs)
    : 0;

  const { data: existing, error: existingError } = await client
    .from('videos')
    .select('*')
    .eq('bvid', payload.bvid)
    .eq('cid', payload.cid)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  const nextRecord = {
    bvid: payload.bvid,
    cid: payload.cid,
    ep_id: payload.epId || (existing ? existing.ep_id : null),
    title: normalizedTitle || (existing ? existing.title : ''),
    duration_ms: normalizedDurationMs || (existing ? existing.duration_ms : 0),
  };

  const { data, error } = await client
    .from('videos')
    .upsert(
      nextRecord,
      {
        onConflict: 'bvid,cid',
      }
    )
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Failed to upsert video');
  }

  return data;
}

export async function ensureDeviceProfile(
  client: ReturnType<typeof createServiceClient>,
  deviceId?: string
) {
  if (!deviceId) {
    return null;
  }

  const { error } = await client.from('device_profiles').upsert(
    {
      device_id: deviceId,
      last_seen_at: new Date().toISOString(),
    },
    {
      onConflict: 'device_id',
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  return deviceId;
}
