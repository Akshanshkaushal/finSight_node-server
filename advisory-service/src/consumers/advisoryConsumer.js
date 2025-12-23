const { KafkaConsumer } = require('../../../common/utils/kafka');
const { USER_ADVISORY_GENERATED } = require('../../../common/events');
const advisoryService = require('../services/advisoryService');
const config = require('../config');
const { createLogger } = require('../../../common/utils/logger');

const logger = createLogger('advisory-consumer');

class AdvisoryConsumer {
  constructor() {
    this.consumer = new KafkaConsumer(
      config.kafka.groupId,
      USER_ADVISORY_GENERATED,
      this.handleMessage.bind(this)
    );
  }

  async handleMessage({ value }) {
    try {
      logger.info('Processing advisory event', { advisoryId: value.advisoryId, userId: value.userId });
      await advisoryService.createAdvisory(value);
      logger.info('Successfully saved advisory', { advisoryId: value.advisoryId });
    } catch (error) {
      logger.error('Error handling advisory event:', error);
      // In production, implement retry logic or dead letter queue
    }
  }

  async start() {
    await this.consumer.start();
    logger.info('Advisory consumer started');
  }

  async stop() {
    await this.consumer.disconnect();
    logger.info('Advisory consumer stopped');
  }
}

module.exports = new AdvisoryConsumer();

