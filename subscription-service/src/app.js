const express = require('express');
const sequelize = require('./config/database');
const { correlationIdMiddleware } = require('../../common/utils/correlationId');
const { errorHandler } = require('../../common/errors');
const { createLogger } = require('../../common/utils/logger');
const config = require('./config');
const routes = require('./routes');
const subscriptionConsumer = require('./consumers/subscriptionConsumer');

const app = express();
const logger = createLogger('subscription-service');

// Middleware
app.use(express.json());
app.use(correlationIdMiddleware);

// Health check
app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'ok', service: 'subscription-service', db: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'error', service: 'subscription-service', db: 'disconnected' });
  }
});

// Routes
app.use('/subscriptions', routes);

// Error handling
app.use(errorHandler);

// Database sync
sequelize.sync({ alter: true }).then(() => {
  logger.info('Database synced');
}).catch(err => {
  logger.error('Database sync error:', err);
});

// Start Kafka consumer
subscriptionConsumer.start().catch(err => {
  logger.error('Failed to start Kafka consumer:', err);
});

// Start server
const port = config.port;
app.listen(port, () => {
  logger.info(`Subscription Service running on port ${port}`);
});

module.exports = app;

