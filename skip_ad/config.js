(function initBiliSponsorBlockConfig(globalScope) {
  const config = {
    overlayDurationMs: 6000,
    undoIgnoreDurationMs: 30000,
    skipPaddingSeconds: 0.15,
    debug: false,
    defaultSegmentsByVideoId: {
      // Example:
      // BV1xxxxxxxxxx: [
      //   { start: 12, end: 35.5, label: '片头推广', category: 'sponsor' }
      // ]
    },
  };

  Object.defineProperty(globalScope, 'BILI_SPONSOR_BLOCK_CONFIG', {
    value: Object.freeze(config),
    configurable: false,
    enumerable: false,
    writable: false,
  });
})(globalThis);
