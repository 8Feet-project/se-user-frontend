(function initBiliSponsorBlockConfig(globalScope) {
  const config = {
    remoteApi: {
      enabled: false,
      functionsBaseUrl: 'https://sb.meteor041.com/functions/v1',
      anonKey: 'REPLACE_WITH_SUPABASE_PUBLISHABLE_KEY',
      requestTimeoutMs: 8000,
      cacheTtlMs: 24 * 60 * 60 * 1000,
      analysisCooldownMs: 10 * 60 * 1000,
    },
    overlayDurationMs: 6000,
    undoIgnoreDurationMs: 30000,
    skipPaddingSeconds: 0.15,
    debug: false,
    defaultSegmentsByVideoId: {
      BV1ewdhBmEux: [
        { start: 1760, end: 1816, label: '\u6d4b\u8bd5\u7247\u6bb5', category: 'sponsor' },
      ],
    },
  };

  Object.defineProperty(globalScope, 'BILI_SPONSOR_BLOCK_CONFIG', {
    value: Object.freeze(config),
    configurable: false,
    enumerable: false,
    writable: false,
  });
})(globalThis);
