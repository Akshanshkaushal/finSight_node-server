const subscriptionService = require('../services/subscriptionService');
const subscriptionRepository = require('../repositories/subscriptionRepository');

class SubscriptionController {
  async getSubscription(req, res, next) {
    try {
      const userId = req.headers['x-user-id'] || req.params.userId;
      const subscription = await subscriptionService.getSubscription(userId);
      
      res.json({
        success: true,
        data: subscription,
        correlationId: req.correlationId
      });
    } catch (error) {
      next(error);
    }
  }

  async upgradeSubscription(req, res, next) {
    try {
      const userId = req.headers['x-user-id'] || req.params.userId;
      const { paymentId } = req.body;
      
      if (!paymentId) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Payment ID is required' }
        });
      }

      const subscription = await subscriptionService.upgradeSubscription(userId, paymentId);
      
      res.json({
        success: true,
        data: subscription,
        correlationId: req.correlationId
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelSubscription(req, res, next) {
    try {
      const userId = req.headers['x-user-id'] || req.params.userId;
      const subscription = await subscriptionService.cancelSubscription(userId);
      
      res.json({
        success: true,
        data: subscription,
        correlationId: req.correlationId
      });
    } catch (error) {
      next(error);
    }
  }

  async getActivePremiumUsers(req, res, next) {
    try {
      const userIds = await subscriptionRepository.findActivePremiumUserIds();
      res.json({
        success: true,
        data: userIds,
        correlationId: req.correlationId
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SubscriptionController();

