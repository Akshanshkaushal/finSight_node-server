const { SERVICE_PORTS, KAFKA_CONFIG, SERVICE_URLS } = require('../../../common/constants');

module.exports = {
  port: process.env.PORT || SERVICE_PORTS.NOTIFICATION_SERVICE,
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'finsight_notifications',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
  },
  kafka: {
    brokers: process.env.KAFKA_BROKERS?.split(',') || KAFKA_CONFIG.BROKERS,
    groupId: `${KAFKA_CONFIG.GROUP_ID_PREFIX}-notification-service`
  },
  subscriptionServiceUrl: process.env.SUBSCRIPTION_SERVICE_URL || SERVICE_URLS.SUBSCRIPTION_SERVICE,
  emailService: {
    enabled: process.env.EMAIL_SERVICE_ENABLED !== 'false',
    apiKey: process.env.EMAIL_API_KEY || 'mock-key'
  }
};

