const cron = require('node-cron');
const newsService = require('../services/newsService');
const { createLogger } = require('../../../common/utils/logger');
const config = require('../config');

const logger = createLogger('news-scheduler');

class NewsScheduler {
  start() {
    // Schedule news fetching
    cron.schedule(config.fetchInterval, async () => {
      logger.info('Starting scheduled news fetch');
      try {
        const verifiedNews = await newsService.fetchAndVerifyNews();
        logger.info(`Fetched and verified ${verifiedNews.length} news articles`);
      } catch (error) {
        logger.error('Error in scheduled news fetch:', error);
      }
    });

    logger.info(`News scheduler started with interval: ${config.fetchInterval}`);
  }
}

module.exports = new NewsScheduler();

