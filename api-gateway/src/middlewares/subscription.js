const axios = require('axios');
const { SubscriptionLimitError } = require('../../../common/errors');
const config = require('../config');

const checkSubscription = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const response = await axios.get(`${config.serviceUrls.SUBSCRIPTION_SERVICE}/subscriptions/${userId}`, {
      headers: { 'x-correlation-id': req.correlationId }
    });
    
    req.subscription = response.data.data;
    next();
  } catch (error) {
    // Default to FREE if subscription check fails
    req.subscription = { plan: 'FREE' };
    next();
  }
};

const enforceSubscriptionLimits = (limitType) => {
  return async (req, res, next) => {
    try {
      const plan = req.subscription?.plan || 'FREE';
      const limits = config.rateLimits[plan];
      
      if (limitType === 'advisory' && plan === 'FREE') {
        // Check daily advisory limit for FREE users
        // This would require tracking in Redis or DB
        // For now, we'll let the advisory-service handle it
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { checkSubscription, enforceSubscriptionLimits };

