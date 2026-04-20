import { createClient } from '@supabase/supabase-js';

export function createServiceClient(config) {
  return createClient(config.supabase.url, config.supabase.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function uploadJsonArtifact(client, bucket, path, payload) {
  const { error } = await client.storage.from(bucket).upload(path, JSON.stringify(payload, null, 2), {
    contentType: 'application/json',
    upsert: true,
  });

  if (error) {
    throw new Error(error.message);
  }
}
