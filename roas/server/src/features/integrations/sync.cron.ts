import cron from 'node-cron';
import config from '../../config/config';
import { syncAllActiveIntegrations } from './sync.service';
import logger from '../../utils/logger';

let syncTask: ReturnType<typeof cron.schedule> | null = null;

export const startSyncCron = (): void => {
  const schedule = config.syncCronSchedule;

  if (!cron.validate(schedule)) {
    logger.error(`Invalid cron schedule: ${schedule}`);
    return;
  }

  syncTask = cron.schedule(schedule, async () => {
    logger.info('Running scheduled integration sync...');
    try {
      await syncAllActiveIntegrations();
    } catch (error) {
      logger.error('Scheduled integration sync error:', error);
    }
  });

  logger.info(`Integration sync cron started with schedule: ${schedule}`);
};

export const stopSyncCron = (): void => {
  if (syncTask) {
    syncTask.stop();
    syncTask = null;
    logger.info('Integration sync cron stopped');
  }
};
