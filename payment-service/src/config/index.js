const { SERVICE_PORTS } = require('../../../common/constants');

module.exports = {
  port: process.env.PORT || SERVICE_PORTS.PAYMENT_SERVICE,
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'finsight_payments',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
  },
  subscriptionServiceUrl: process.env.SUBSCRIPTION_SERVICE_URL || 'http://subscription-service:3007',
  stripe: {
    secretKey: process.env.STRIPE_SECRET || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    successUrl: process.env.STRIPE_SUCCESS_URL || 'http://localhost:5173/payments?status=success',
    cancelUrl: process.env.STRIPE_CANCEL_URL || 'http://localhost:5173/payments?status=cancel'
  }
};

