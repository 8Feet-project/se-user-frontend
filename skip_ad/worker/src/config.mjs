const REQUIRED_ENV_KEYS = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'OPENAI_API_KEY',
  'TRANSCRIBE_MODEL',
  'CLASSIFY_MODEL',
  'ESCALATE_MODEL',
];

export function loadConfig() {
  const missingKeys = REQUIRED_ENV_KEYS.filter((key) => !process.env[key]);
  if (missingKeys.length) {
    throw new Error('Missing environment variables: ' + missingKeys.join(', '));
  }

  return {
    supabase: {
      url: process.env.SUPABASE_URL,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      models: {
        transcribe: process.env.TRANSCRIBE_MODEL,
        classify: process.env.CLASSIFY_MODEL,
        escalate: process.env.ESCALATE_MODEL,
      },
    },
    tools: {
      ytDlpPath: process.env.YT_DLP_PATH || 'yt-dlp',
    },
    worker: {
      pollIntervalMs: Number(process.env.POLL_INTERVAL_MS || 15000),
    },
    rules: {
      introScanMs: 120000,
      maxWindowMs: 90000,
      mergeGapMs: 1500,
      keywords: [
        '赞助',
        '合作',
        '本期视频由',
        '感谢',
        '优惠码',
        '购买链接',
        '品牌方',
        '金主',
      ],
    },
  };
}
