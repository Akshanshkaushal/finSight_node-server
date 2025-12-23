const notificationService = require('../services/notificationService');

class NotificationController {
  async getNotifications(req, res, next) {
    try {
      const userId = req.headers['x-user-id'] || req.params.userId;
      const options = {
        limit: parseInt(req.query.limit) || 20,
        offset: parseInt(req.query.offset) || 0
      };

      const notifications = await notificationService.getNotifications(userId, options);
      
      res.json({
        success: true,
        data: notifications,
        count: notifications.length,
        correlationId: req.correlationId
      });
    } catch (error) {
      next(error);
    }
  }

  async getNotificationById(req, res, next) {
    try {
      const { notificationId } = req.params;
      const notification = await notificationService.getNotificationById(notificationId);
      
      res.json({
        success: true,
        data: notification,
        correlationId: req.correlationId
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationController();

