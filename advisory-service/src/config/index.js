const { SERVICE_PORTS, KAFKA_CONFIG, SUBSCRIPTION_LIMITS } = require('../../../common/constants');

module.exports = {
  port: process.env.PORT || SERVICE_PORTS.ADVISORY_SERVICE,
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'finsight_advisory',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
  },
  kafka: {
    brokers: process.env.KAFKA_BROKERS?.split(',') || KAFKA_CONFIG.BROKERS,
    groupId: `${KAFKA_CONFIG.GROUP_ID_PREFIX}-advisory-service`
  },
  subscriptionServiceUrl: process.env.SUBSCRIPTION_SERVICE_URL || 'http://subscription-service:3007',
  subscriptionLimits: SUBSCRIPTION_LIMITS
};

