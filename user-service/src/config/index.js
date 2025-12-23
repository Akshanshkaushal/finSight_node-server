const { SERVICE_PORTS, REDIS_CONFIG } = require('../../../common/constants');

module.exports = {
  port: process.env.PORT || SERVICE_PORTS.USER_SERVICE,
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'finsight_users',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
  },
  redis: {
    host: process.env.REDIS_HOST || REDIS_CONFIG.HOST,
    port: process.env.REDIS_PORT || REDIS_CONFIG.PORT,
    ttl: REDIS_CONFIG.TTL.USER_PROFILE
  }
};

