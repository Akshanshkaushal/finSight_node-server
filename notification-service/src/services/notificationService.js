const Notification = require('../models/Notification');
const emailService = require('./emailService');
const pushService = require('./pushService');
const { NotFoundError, SubscriptionLimitError } = require('../../../common/errors');
const axios = require('axios');
const { Op } = require('sequelize');
const config = require('../config');

class NotificationService {
  async createNotification(notificationData) {
    // Enforce subscription limits: FREE users max 20 notifications per day
    const userId = notificationData.userId;
    const plan = await this.getUserPlan(userId);
    if (plan === 'FREE') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const countToday = await Notification.count({
        where: {
          userId,
          createdAt: {
            [Op.between]: [today, tomorrow]
          }
        }
      });

      if (countToday >= 20) {
        throw new SubscriptionLimitError('FREE plan limit: max 20 notifications per day');
      }
    }

    const notification = await Notification.create({
      ...notificationData,
      status: 'PENDING'
    });

    // Send notification asynchronously
    this.sendNotification(notification).catch(err => {
      console.error('Error sending notification:', err);
    });

    return notification.toJSON();
  }

  async sendNotification(notification) {
    try {
      // Get user email (in production, fetch from user service)
      const userEmail = `user-${notification.userId}@example.com`; // Mock email

      let result;
      if (notification.notificationType === 'EMAIL') {
        result = await emailService.sendEmail(
          userEmail,
          notification.subject,
          notification.message
        );
      } else if (notification.notificationType === 'PUSH') {
        // Mock web/mobile push; in production integrate with FCM/WebPush/OneSignal
        result = await pushService.sendPush({
          userId: notification.userId,
          subject: notification.subject,
          message: notification.message,
          priority: notification.priority
        });
      } else {
        // Handle other notification types (SMS, PUSH) here
        result = { success: true, message: 'Notification sent (mock)' };
      }

      // Update notification status
      await notification.update({
        status: 'SENT',
        sentAt: new Date()
      });

      return result;
    } catch (error) {
      await notification.update({
        status: 'FAILED',
        errorMessage: error.message
      });
      throw error;
    }
  }

  async getNotifications(userId, options = {}) {
    const limit = options.limit || 20;
    const offset = options.offset || 0;

    const notifications = await Notification.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    return notifications.map(notif => notif.toJSON());
  }

  async getNotificationById(notificationId) {
    const notification = await Notification.findOne({ where: { notificationId } });
    if (!notification) {
      throw new NotFoundError('Notification');
    }
    return notification.toJSON();
  }

  async getUserPlan(userId) {
    try {
      const resp = await axios.get(`${config.subscriptionServiceUrl}/subscriptions/${userId}`, {
        timeout: 3000
      });
      return resp.data?.data?.plan || 'FREE';
    } catch (error) {
      // On failure, default to FREE to be safe
      return 'FREE';
    }
  }
}

module.exports = new NotificationService();

