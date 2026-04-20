create extension if not exists pgcrypto;

create or replace function public.set_current_timestamp_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  bvid text not null,
  cid text not null,
  ep_id text,
  title text not null default '',
  duration_ms bigint not null default 0,
  status text not null default 'missing' check (status in ('missing', 'queued', 'processing', 'ready', 'error')),
  subtitle_hash text,
  subtitle_source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (bvid, cid)
);

create table if not exists public.subtitle_lines (
  video_id uuid not null references public.videos(id) on delete cascade,
  line_index integer not null,
  start_ms integer not null check (start_ms >= 0),
  end_ms integer not null check (end_ms > start_ms),
  text text not null,
  normalized_text text,
  primary key (video_id, line_index)
);

create table if not exists public.segment_proposals (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.videos(id) on delete cascade,
  source text not null check (source in ('manual', 'rule', 'ai', 'system')),
  start_ms integer not null check (start_ms >= 0),
  end_ms integer not null check (end_ms > start_ms),
  label text not null default 'sponsor',
  confidence numeric(5,4) not null default 0,
  rationale_json jsonb not null default '{}'::jsonb,
  created_by_device_id text,
  created_by_user_id uuid,
  status text not null default 'pending' check (status in ('pending', 'published', 'rejected', 'revoked')),
  created_at timestamptz not null default now()
);

create table if not exists public.segment_feedback (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.videos(id) on delete cascade,
  segment_id uuid,
  action text not null check (action in ('confirm', 'not_ad', 'adjust')),
  delta_start_ms integer not null default 0,
  delta_end_ms integer not null default 0,
  actor_device_id text,
  actor_user_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.published_segments (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.videos(id) on delete cascade,
  start_ms integer not null check (start_ms >= 0),
  end_ms integer not null check (end_ms > start_ms),
  label text not null default 'sponsor',
  score numeric(6,3) not null default 0,
  version integer not null default 1,
  derived_from_json jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.analysis_jobs (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.videos(id) on delete cascade,
  job_type text not null check (job_type in ('ingest_subtitles')),
  payload_json jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'running', 'completed', 'failed', 'cancelled')),
  attempts integer not null default 0,
  error_message text,
  scheduled_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.user_profiles (
  user_id uuid primary key,
  display_name text,
  reputation numeric(8,3) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.device_profiles (
  device_id text primary key,
  reputation numeric(8,3) not null default 0,
  linked_user_id uuid,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_videos_status on public.videos(status);
create index if not exists idx_segment_proposals_video_status on public.segment_proposals(video_id, status);
create index if not exists idx_segment_feedback_video_created on public.segment_feedback(video_id, created_at desc);
create index if not exists idx_published_segments_video_start on public.published_segments(video_id, start_ms);
create index if not exists idx_analysis_jobs_video_status on public.analysis_jobs(video_id, status, scheduled_at);

drop trigger if exists set_videos_updated_at on public.videos;
create trigger set_videos_updated_at
before update on public.videos
for each row execute function public.set_current_timestamp_updated_at();

drop trigger if exists set_user_profiles_updated_at on public.user_profiles;
create trigger set_user_profiles_updated_at
before update on public.user_profiles
for each row execute function public.set_current_timestamp_updated_at();

drop trigger if exists set_device_profiles_updated_at on public.device_profiles;
create trigger set_device_profiles_updated_at
before update on public.device_profiles
for each row execute function public.set_current_timestamp_updated_at();

alter table public.videos enable row level security;
alter table public.subtitle_lines enable row level security;
alter table public.segment_proposals enable row level security;
alter table public.segment_feedback enable row level security;
alter table public.published_segments enable row level security;
alter table public.analysis_jobs enable row level security;
alter table public.user_profiles enable row level security;
alter table public.device_profiles enable row level security;

drop policy if exists "published segments are readable" on public.published_segments;
create policy "published segments are readable"
on public.published_segments
for select
to anon, authenticated
using (true);

drop policy if exists "segment proposals insertable" on public.segment_proposals;
create policy "segment proposals insertable"
on public.segment_proposals
for insert
to anon, authenticated
with check (true);

drop policy if exists "segment feedback insertable" on public.segment_feedback;
create policy "segment feedback insertable"
on public.segment_feedback
for insert
to anon, authenticated
with check (true);

insert into storage.buckets (id, name, public)
values
  ('subtitle-artifacts-private', 'subtitle-artifacts-private', false),
  ('debug-artifacts-private', 'debug-artifacts-private', false)
on conflict (id) do nothing;
