const express = require('express');
const redis = require('./config/redis');
const { correlationIdMiddleware } = require('../../common/utils/correlationId');
const { errorHandler } = require('../../common/errors');
const { createLogger } = require('../../common/utils/logger');
const config = require('./config');
const routes = require('./routes');
const newsConsumer = require('./consumers/newsConsumer');

const app = express();
const logger = createLogger('finance-engine');

// Middleware
app.use(express.json());
app.use(correlationIdMiddleware);

// Health check
app.get('/health', async (req, res) => {
  try {
    await redis.ping();
    res.json({ status: 'ok', service: 'finance-engine', redis: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'error', service: 'finance-engine', error: error.message });
  }
});

// Routes
app.use('/', routes);

// Error handling
app.use(errorHandler);

// Start Kafka consumer
newsConsumer.start().catch(err => {
  logger.error('Failed to start Kafka consumer:', err);
});

// Start server
const port = config.port;
app.listen(port, () => {
  logger.info(`Finance Engine running on port ${port}`);
});

module.exports = app;

