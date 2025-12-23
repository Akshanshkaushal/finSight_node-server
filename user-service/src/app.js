const express = require('express');
const sequelize = require('./config/database');
const redis = require('./config/redis');
const { correlationIdMiddleware } = require('../../common/utils/correlationId');
const { errorHandler } = require('../../common/errors');
const { createLogger } = require('../../common/utils/logger');
const config = require('./config');
const routes = require('./routes');

const app = express();
const logger = createLogger('user-service');

// Middleware
app.use(express.json());
app.use(correlationIdMiddleware);

// Health check
app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    await redis.ping();
    res.json({ status: 'ok', service: 'user-service', db: 'connected', redis: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'error', service: 'user-service', error: error.message });
  }
});

// Routes
app.use('/', routes);

// Error handling
app.use(errorHandler);

// Database sync
sequelize.sync({ alter: true }).then(() => {
  logger.info('Database synced');
}).catch(err => {
  logger.error('Database sync error:', err);
});

// Start server
const port = config.port;
app.listen(port, () => {
  logger.info(`User Service running on port ${port}`);
});

module.exports = app;

