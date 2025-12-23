const { createLogger } = require('../../../common/utils/logger');

const logger = createLogger('push-service');

class PushService {
  /**
   * Mock push sender. In production, integrate with Web Push (VAPID),
   * FCM/APNs, or a provider like OneSignal. Expects a user/device token
   * store to target actual endpoints.
   */
  async sendPush({ userId, subject, message, priority = 'MEDIUM' }) {
    // Simulate send
    const payload = { userId, subject, message, priority, sentAt: new Date().toISOString() };
    logger.info('Mock push notification sent', payload);
    return { success: true, ...payload };
  }
}

module.exports = new PushService();

