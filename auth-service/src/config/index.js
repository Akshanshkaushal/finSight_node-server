const { SERVICE_PORTS, JWT_CONFIG } = require('../../../common/constants');

module.exports = {
  port: process.env.PORT || SERVICE_PORTS.AUTH_SERVICE,
  jwtSecret: process.env.JWT_SECRET || JWT_CONFIG.SECRET,
  accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || JWT_CONFIG.ACCESS_TOKEN_EXPIRY,
  refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || JWT_CONFIG.REFRESH_TOKEN_EXPIRY,
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'finsight_auth',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
  }
};

