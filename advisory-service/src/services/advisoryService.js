const advisoryRepository = require('../repositories/advisoryRepository');
const axios = require('axios');
const config = require('../config');
const { SubscriptionLimitError } = require('../../../common/errors');

class AdvisoryService {
  async createAdvisory(advisoryData) {
    return await advisoryRepository.create(advisoryData);
  }

  async getAdvisories(userId, options = {}) {
    // Check subscription limits for FREE users
    const subscription = await this.getSubscription(userId);
    if (subscription.plan === 'FREE') {
      const limit = config.subscriptionLimits.FREE.MAX_ADVISORIES_PER_DAY;
      if (limit > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const count = await advisoryRepository.countByUserId(userId, today, tomorrow);
        if (count >= limit) {
          throw new SubscriptionLimitError('Daily advisory limit reached for FREE plan');
        }
      }
    }

    return await advisoryRepository.findByUserId(userId, options);
  }

  async getAdvisoryById(advisoryId) {
    return await advisoryRepository.findById(advisoryId);
  }

  async getSubscription(userId) {
    try {
      const response = await axios.get(`${config.subscriptionServiceUrl}/subscriptions/${userId}`, {
        timeout: 5000
      });
      return response.data.data || { plan: 'FREE' };
    } catch (error) {
      // Default to FREE if subscription service unavailable
      return { plan: 'FREE' };
    }
  }
}

module.exports = new AdvisoryService();

