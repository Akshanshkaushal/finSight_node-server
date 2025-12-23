const Subscription = require('../models/Subscription');
const { KafkaProducer } = require('../../../common/utils/kafka');
const { SUBSCRIPTION_UPGRADED } = require('../../../common/events');
const { SUBSCRIPTION_PLANS, SUBSCRIPTION_STATUS } = require('../../../common/enums');
const { NotFoundError, ValidationError } = require('../../../common/errors');
const config = require('../config');

class SubscriptionService {
  constructor() {
    this.producer = new KafkaProducer();
  }

  async getSubscription(userId) {
    let subscription = await Subscription.findOne({ where: { userId } });

    if (!subscription) {
      // Create default FREE subscription
      subscription = await Subscription.create({
        userId,
        plan: config.defaultPlan,
        status: SUBSCRIPTION_STATUS.ACTIVE
      });
    }

    // Check if subscription has expired
    if (subscription.expiresAt && new Date() > subscription.expiresAt) {
      await subscription.update({ status: SUBSCRIPTION_STATUS.EXPIRED });
      subscription.status = SUBSCRIPTION_STATUS.EXPIRED;
    }

    return subscription.toJSON();
  }

  async createSubscription(userId, plan = config.defaultPlan) {
    const existing = await Subscription.findOne({ where: { userId } });
    if (existing) {
      throw new ValidationError('Subscription already exists');
    }

    const expiresAt = plan === SUBSCRIPTION_PLANS.PREMIUM 
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      : null;

    const subscription = await Subscription.create({
      userId,
      plan,
      status: SUBSCRIPTION_STATUS.ACTIVE,
      expiresAt
    });

    return subscription.toJSON();
  }

  async upgradeSubscription(userId, paymentId) {
    const subscription = await Subscription.findOne({ where: { userId } });
    if (!subscription) {
      throw new NotFoundError('Subscription');
    }

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await subscription.update({
      plan: SUBSCRIPTION_PLANS.PREMIUM,
      status: SUBSCRIPTION_STATUS.ACTIVE,
      expiresAt,
      paymentId
    });

    // Publish upgrade event
    await this.producer.send(SUBSCRIPTION_UPGRADED, {
      key: userId,
      value: {
        userId,
        subscriptionId: subscription.subscriptionId,
        plan: SUBSCRIPTION_PLANS.PREMIUM,
        upgradedAt: new Date(),
        paymentId
      }
    });

    return subscription.toJSON();
  }

  async cancelSubscription(userId) {
    const subscription = await Subscription.findOne({ where: { userId } });
    if (!subscription) {
      throw new NotFoundError('Subscription');
    }

    await subscription.update({
      status: SUBSCRIPTION_STATUS.CANCELLED
    });

    return subscription.toJSON();
  }

  async renewSubscription(userId) {
    const subscription = await Subscription.findOne({ where: { userId } });
    if (!subscription) {
      throw new NotFoundError('Subscription');
    }

    if (subscription.plan === SUBSCRIPTION_PLANS.PREMIUM) {
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await subscription.update({
        status: SUBSCRIPTION_STATUS.ACTIVE,
        expiresAt
      });
    }

    return subscription.toJSON();
  }
}

module.exports = new SubscriptionService();

