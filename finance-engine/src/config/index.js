const { SERVICE_PORTS, SERVICE_URLS, REDIS_CONFIG, KAFKA_CONFIG } = require('../../../common/constants');

module.exports = {
  port: process.env.PORT || SERVICE_PORTS.FINANCE_ENGINE,
  userServiceUrl: process.env.USER_SERVICE_URL || SERVICE_URLS.USER_SERVICE,
  subscriptionServiceUrl: process.env.SUBSCRIPTION_SERVICE_URL || SERVICE_URLS.SUBSCRIPTION_SERVICE,
  mlServiceUrl: process.env.ML_SERVICE_URL || SERVICE_URLS.ML_SERVICE,
  redis: {
    host: process.env.REDIS_HOST || REDIS_CONFIG.HOST,
    port: process.env.REDIS_PORT || REDIS_CONFIG.PORT,
    ttl: REDIS_CONFIG.TTL.RISK_CACHE
  },
  kafka: {
    brokers: process.env.KAFKA_BROKERS?.split(',') || KAFKA_CONFIG.BROKERS,
    groupId: `${KAFKA_CONFIG.GROUP_ID_PREFIX}-finance-engine`
  }
};

