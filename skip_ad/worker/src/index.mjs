import { loadConfig } from './config.mjs';
import { createLogger } from './logger.mjs';
import { createServiceClient } from './supabase.mjs';
import { createOpenAIClient } from './llm.mjs';
import { claimPendingJob, markJobFailed, runAnalysisJob } from './jobs.mjs';

const config = loadConfig();
const logger = createLogger('bili-sponsorblock-worker');
const client = createServiceClient(config);
const openai = createOpenAIClient(config);

let stopping = false;

process.on('SIGINT', () => {
  stopping = true;
});

process.on('SIGTERM', () => {
  stopping = true;
});

async function loop() {
  logger.info('Worker booted');

  while (!stopping) {
    try {
      const job = await claimPendingJob(client);
      if (!job) {
        await delay(config.worker.pollIntervalMs);
        continue;
      }

      logger.info('Claimed job', {
        jobId: job.id,
        videoId: job.video_id,
      });

      try {
        await runAnalysisJob({
          client,
          openai,
          config,
          logger,
          job,
        });
        logger.info('Completed job', {
          jobId: job.id,
        });
      } catch (error) {
        await markJobFailed(client, job.id, error instanceof Error ? error.message : String(error));
        logger.error('Job failed', {
          jobId: job.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    } catch (error) {
      logger.error('Worker loop error', error instanceof Error ? error.message : String(error));
      await delay(config.worker.pollIntervalMs);
    }
  }

  logger.info('Worker stopped');
}

function delay(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

void loop();
