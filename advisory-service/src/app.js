const express = require('express');
const sequelize = require('./config/database');
const { correlationIdMiddleware } = require('../../common/utils/correlationId');
const { errorHandler } = require('../../common/errors');
const { createLogger } = require('../../common/utils/logger');
const config = require('./config');
const routes = require('./routes');
const advisoryConsumer = require('./consumers/advisoryConsumer');

const app = express();
const logger = createLogger('advisory-service');

// Middleware
app.use(express.json());
app.use(correlationIdMiddleware);

// Health check
app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'ok', service: 'advisory-service', db: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'error', service: 'advisory-service', db: 'disconnected' });
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

// Start Kafka consumer
advisoryConsumer.start().catch(err => {
  logger.error('Failed to start Kafka consumer:', err);
});

// Start server
const port = config.port;
app.listen(port, () => {
  logger.info(`Advisory Service running on port ${port}`);
});

module.exports = app;

