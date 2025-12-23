const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');
const { correlationIdMiddleware } = require('../../common/utils/correlationId');
const { errorHandler } = require('../../common/errors');
const { createLogger } = require('../../common/utils/logger');
const config = require('./config');
const routes = require('./routes');

const app = express();
const logger = createLogger('payment-service');

// Middleware
app.use(bodyParser.json());
app.use(correlationIdMiddleware);

// Health check
app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'ok', service: 'payment-service', db: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'error', service: 'payment-service', db: 'disconnected' });
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
  logger.info(`Payment Service running on port ${port}`);
});

module.exports = app;

