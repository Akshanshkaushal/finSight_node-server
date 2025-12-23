const { SERVICE_PORTS, SERVICE_URLS, JWT_CONFIG, RATE_LIMITS } = require('../../../common/constants');

module.exports = {
  port: process.env.PORT || SERVICE_PORTS.API_GATEWAY,
  jwtSecret: process.env.JWT_SECRET || JWT_CONFIG.SECRET,
  serviceUrls: SERVICE_URLS,
  rateLimits: RATE_LIMITS
};

