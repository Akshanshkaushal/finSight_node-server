const { KafkaConsumer } = require('../../../common/utils/kafka');
const { VERIFIED_FINANCIAL_NEWS } = require('../../../common/events');
const financeEngineService = require('../services/financeEngineService');
const config = require('../config');
const { createLogger } = require('../../../common/utils/logger');

const logger = createLogger('finance-engine-consumer');

class NewsConsumer {
  constructor() {
    this.consumer = new KafkaConsumer(
      config.kafka.groupId,
      VERIFIED_FINANCIAL_NEWS,
      this.handleMessage.bind(this)
    );
  }

  async handleMessage({ value }) {
    try {
      logger.info('Processing verified financial news event', { newsId: value.newsId });
      await financeEngineService.processNewsEvent(value);
      logger.info('Successfully processed news event', { newsId: value.newsId });
    } catch (error) {
      logger.error('Error handling news event:', error);
      // In production, implement retry logic or dead letter queue
    }
  }

  async start() {
    await this.consumer.start();
    logger.info('News consumer started');
  }

  async stop() {
    await this.consumer.disconnect();
    logger.info('News consumer stopped');
  }
}

module.exports = new NewsConsumer();

