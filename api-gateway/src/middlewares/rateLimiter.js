const rateLimit = require('express-rate-limit');
const { RateLimitError } = require('../../../common/errors');
const config = require('../config');

const createRateLimiter = (plan) => {
  const limits = config.rateLimits[plan] || config.rateLimits.FREE;
  
  return rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: limits.REQUESTS_PER_MINUTE,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Rate limit exceeded. Please try again later.'
        },
        correlationId: req.correlationId
      });
    }
  });
};

const dynamicRateLimiter = async (req, res, next) => {
  const plan = req.subscription?.plan || 'FREE';
  const limiter = createRateLimiter(plan);
  limiter(req, res, next);
};

module.exports = { dynamicRateLimiter, createRateLimiter };

