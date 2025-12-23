const { SERVICE_PORTS, KAFKA_CONFIG } = require('../../../common/constants');
const { SUBSCRIPTION_PLANS, SUBSCRIPTION_STATUS } = require('../../../common/enums');

module.exports = {
  port: process.env.PORT || SERVICE_PORTS.SUBSCRIPTION_SERVICE,
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'finsight_subscriptions',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
  },
  kafka: {
    brokers: process.env.KAFKA_BROKERS?.split(',') || KAFKA_CONFIG.BROKERS
  },
  defaultPlan: SUBSCRIPTION_PLANS.FREE,
  premiumPrice: process.env.PREMIUM_PRICE || 999, // INR per month
  trialPeriodDays: process.env.TRIAL_PERIOD_DAYS || 7
};

