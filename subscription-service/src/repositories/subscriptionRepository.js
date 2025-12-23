const Subscription = require('../models/Subscription');
const { Op } = require('sequelize');

class SubscriptionRepository {
  async findActivePremiumUserIds() {
    const now = new Date();
    const subs = await Subscription.findAll({
      attributes: ['userId'],
      where: {
        plan: 'PREMIUM',
        status: 'ACTIVE',
        [Op.or]: [
          { expiresAt: null },
          { expiresAt: { [Op.gt]: now } }
        ]
      }
    });
    return subs.map(s => s.userId);
  }
}

module.exports = new SubscriptionRepository();

