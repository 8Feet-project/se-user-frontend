# Supabase Setup

This folder contains the initial database migration and Edge Functions for the Bili SponsorBlock shared segment flow.

## Required Environment Variables

Edge Functions expect:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Functions

- `lookup-segments`
- `request-analysis`
- `submit-mark`
- `submit-feedback`

## Migration

Apply the SQL file inside `migrations/` to create the first schema, RLS policies, and private storage buckets.
