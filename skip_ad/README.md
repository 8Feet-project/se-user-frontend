# Bili SponsorBlock MVP

This folder now contains the M1 extension skeleton for shared sponsor skipping on Bilibili.

## What Changed

- Keeps the original local hardcoded segment fallback
- Adds a Manifest V3 background service worker
- Generates a persistent anonymous `device_id`
- Supports remote shared-segment lookup through Supabase Edge Functions
- Adds an in-player toolbox for manual marking and lightweight feedback
- Tries to load Bilibili subtitle tracks so marking can snap to subtitle boundaries

## Files

- `manifest.json`: MV3 entry point with background worker and permissions
- `common.js`: shared helpers used by content and background scripts
- `config.js`: local fallback rules plus remote API configuration
- `background.js`: identity, cache, remote fetch, subtitle fetch
- `page-bridge.js`: reads page-level Bilibili state from the page context
- `content.js`: skip logic, feedback overlay, manual marking toolbox
- `content.css`: overlay and toolbox styles

## Local Testing

1. Open Chrome or Edge extensions
2. Turn on developer mode
3. Click "Load unpacked"
4. Select `E:\code\SE-frontend\skip_ad`
5. Reload the extension after every code change

## Remote API Setup

Edit `config.js` and set:

```js
remoteApi: {
  enabled: true,
  functionsBaseUrl: 'https://<project-ref>.supabase.co/functions/v1',
  anonKey: '<supabase-anon-key>',
  requestTimeoutMs: 8000,
  cacheTtlMs: 24 * 60 * 60 * 1000,
  analysisCooldownMs: 10 * 60 * 1000
}
```

If `enabled` is `false`, the extension falls back to `defaultSegmentsByVideoId`.

## Manual Marking

- `Alt+[` sets the draft start boundary
- `Alt+]` sets the draft end boundary
- `Alt+\` submits the current draft
- The bottom-left toolbox also offers click buttons and `-1s / -0.5s / +0.5s / +1s` refinement
- If subtitles are available, boundaries snap to the nearest subtitle line

## Shared Feedback

After an automatic skip, the bottom-right overlay offers:

- `撤销`
- `不是广告`
- `开始太早`
- `开始太晚`
- `结束太早`
- `结束太晚`

These actions update local session behavior immediately and submit feedback to the remote API when configured.
