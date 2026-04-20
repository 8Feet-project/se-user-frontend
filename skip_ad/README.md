# Bili SponsorBlock MVP

This folder contains a Manifest V3 browser extension prototype for Bilibili video pages.

## Features

- Runs on `https://www.bilibili.com/video/*` and `https://bilibili.com/video/*`
- Finds the page `<video>` element and listens to playback updates
- Jumps to the end of configured sponsor segments
- Shows a small bottom-right overlay with a one-click undo action
- Rebinds automatically when Bilibili swaps videos in its SPA flow

## Files

- `manifest.json`: Manifest V3 entry point
- `config.js`: local segment configuration
- `content.js`: skip logic and overlay logic
- `content.css`: overlay styles

## Add Segment Rules

Edit `defaultSegmentsByVideoId` inside `config.js`:

```js
defaultSegmentsByVideoId: {
  BV1xxxxxxxxxx: [
    { start: 12, end: 35.5, label: 'Intro sponsor', category: 'sponsor' },
    { start: 420, end: 438, label: 'Mid-roll sponsor', category: 'sponsor' }
  ]
}
```

Field reference:

- `start`: segment start time in seconds
- `end`: segment end time in seconds
- `label`: overlay label for the skipped segment
- `category`: reserved for future segment types such as `intro` or `selfpromo`

## Load Locally

1. Open the extension manager page in Chrome or Edge
2. Turn on developer mode
3. Choose "Load unpacked"
4. Select `E:\code\SE-frontend\skip_ad`

## Next Steps

- Add a popup to mark sponsor start and end times from the current video
- Move rules from hardcoded config to `chrome.storage.local`
- Add a shared API so multiple users can reuse submitted segments
