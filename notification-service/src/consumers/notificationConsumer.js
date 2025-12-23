const { KafkaConsumer } = require('../../../common/utils/kafka');
const { NOTIFICATION_REQUESTED } = require('../../../common/events');
const notificationService = require('../services/notificationService');
const config = require('../config');
const { createLogger } = require('../../../common/utils/logger');

const logger = createLogger('notification-consumer');

class NotificationConsumer {
  constructor() {
    this.consumer = new KafkaConsumer(
      config.kafka.groupId,
      NOTIFICATION_REQUESTED,
      this.handleMessage.bind(this)
    );
  }

  async handleMessage({ value }) {
    try {
      logger.info('Processing notification request', { userId: value.userId, advisoryId: value.advisoryId });
      await notificationService.createNotification(value);
      logger.info('Successfully created notification', { userId: value.userId });
    } catch (error) {
      logger.error('Error handling notification request:', error);
      // In production, implement retry logic or dead letter queue
    }
  }

  async start() {
    await this.consumer.start();
    logger.info('Notification consumer started');
  }

  async stop() {
    await this.consumer.disconnect();
    logger.info('Notification consumer stopped');
  }
}

module.exports = new NotificationConsumer();

