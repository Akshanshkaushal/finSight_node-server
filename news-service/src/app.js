const express = require('express');
const { connectMongo } = require('./config/mongo');
const redis = require('./config/redis');
const { correlationIdMiddleware } = require('../../common/utils/correlationId');
const { errorHandler } = require('../../common/errors');
const { createLogger } = require('../../common/utils/logger');
const config = require('./config');
const routes = require('./routes');
const newsScheduler = require('./schedulers/newsScheduler');

const app = express();
const logger = createLogger('news-service');

// Middleware
app.use(express.json());
app.use(correlationIdMiddleware);

// Health check
app.get('/health', async (req, res) => {
  try {
    await redis.ping();
    res.json({ status: 'ok', service: 'news-service', redis: 'connected', mongo: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'error', service: 'news-service', error: error.message });
  }
});

// Routes
app.use('/', routes);

// Error handling
app.use(errorHandler);

// Initialize connections and start scheduler
(async () => {
  try {
    await connectMongo();
    newsScheduler.start();
    
    const port = config.port;
    app.listen(port, () => {
      logger.info(`News Service running on port ${port}`);
    });
  } catch (error) {
    logger.error('Failed to start service:', error);
    process.exit(1);
  }
})();

module.exports = app;

