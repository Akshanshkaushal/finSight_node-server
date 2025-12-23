const express = require('express');
const cors = require('cors');
const { correlationIdMiddleware } = require('../../common/utils/correlationId');
const { errorHandler } = require('../../common/errors');
const { createLogger } = require('../../common/utils/logger');
const config = require('./config');
const routes = require('./routes');

const app = express();
const logger = createLogger('api-gateway');

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173'], // Allow both dev and preview ports
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-correlation-id']
}));
app.options('*', cors());
// Do NOT parse request bodies here; let downstream services handle JSON/form parsing
app.use(correlationIdMiddleware);

// Routes
app.use('/', routes);

// Error handling
app.use(errorHandler);

// Start server
const port = config.port;
app.listen(port, () => {
  logger.info(`API Gateway running on port ${port}`);
});

module.exports = app;

