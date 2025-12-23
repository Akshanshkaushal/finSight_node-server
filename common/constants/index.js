// Application constants

const SERVICE_PORTS = {
  API_GATEWAY: 3000,
  AUTH_SERVICE: 3001,
  USER_SERVICE: 3002,
  NEWS_SERVICE: 3003,
  FINANCE_ENGINE: 3004,
  ADVISORY_SERVICE: 3005,
  NOTIFICATION_SERVICE: 3006,
  SUBSCRIPTION_SERVICE: 3007,
  PAYMENT_SERVICE: 3008,
  ML_SERVICE: 3009
};

const SERVICE_URLS = {
  AUTH_SERVICE: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
  USER_SERVICE: process.env.USER_SERVICE_URL || 'http://user-service:3002',
  NEWS_SERVICE: process.env.NEWS_SERVICE_URL || 'http://news-service:3003',
  FINANCE_ENGINE: process.env.FINANCE_ENGINE_URL || 'http://finance-engine:3004',
  ADVISORY_SERVICE: process.env.ADVISORY_SERVICE_URL || 'http://advisory-service:3005',
  NOTIFICATION_SERVICE: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3006',
  SUBSCRIPTION_SERVICE: process.env.SUBSCRIPTION_SERVICE_URL || 'http://subscription-service:3007',
  PAYMENT_SERVICE: process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3008',
  ML_SERVICE: process.env.ML_SERVICE_URL || 'http://ml-service:3009'
};

const KAFKA_CONFIG = {
  CLIENT_ID: 'finsight-client',
  BROKERS: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
  GROUP_ID_PREFIX: 'finsight-group'
};

const REDIS_CONFIG = {
  HOST: process.env.REDIS_HOST || 'localhost',
  PORT: process.env.REDIS_PORT || 6379,
  TTL: {
    NEWS_DEDUP: 86400, // 24 hours
    RISK_CACHE: 3600, // 1 hour
    USER_PROFILE: 1800 // 30 minutes
  }
};

const JWT_CONFIG = {
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
  SECRET: process.env.JWT_SECRET || 'finsight-secret-key-change-in-production'
};

const RATE_LIMITS = {
  FREE: {
    REQUESTS_PER_MINUTE: 10,
    REQUESTS_PER_HOUR: 100
  },
  PREMIUM: {
    REQUESTS_PER_MINUTE: 60,
    REQUESTS_PER_HOUR: 1000
  }
};

const SUBSCRIPTION_LIMITS = {
  FREE: {
    MAX_ADVISORIES_PER_DAY: 5,
    MAX_NEWS_ARTICLES: 10
  },
  PREMIUM: {
    MAX_ADVISORIES_PER_DAY: -1, // unlimited
    MAX_NEWS_ARTICLES: -1 // unlimited
  }
};

module.exports = {
  SERVICE_PORTS,
  SERVICE_URLS,
  KAFKA_CONFIG,
  REDIS_CONFIG,
  JWT_CONFIG,
  RATE_LIMITS,
  SUBSCRIPTION_LIMITS
};

