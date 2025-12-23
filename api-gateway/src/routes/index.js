const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { authenticate } = require('../middlewares/auth');
const { checkSubscription } = require('../middlewares/subscription');
const { dynamicRateLimiter } = require('../middlewares/rateLimiter');
const config = require('../config');

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api-gateway' });
});

// Auth routes (no auth required)
// Parse JSON here and forward explicitly to avoid body loss/stream issues in proxies.
router.use(
  '/auth',
  express.json(),
  createProxyMiddleware({
    target: config.serviceUrls.AUTH_SERVICE,
    changeOrigin: true,
    pathRewrite: { '^/auth': '' },
    onProxyReq: (proxyReq, req) => {
      if (req.correlationId) {
        proxyReq.setHeader('x-correlation-id', req.correlationId);
      }
      if (req.body && Object.keys(req.body).length > 0) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
        proxyReq.end();
      }
    }
  })
);

// Protected routes
router.use(authenticate);
router.use(checkSubscription);
router.use(dynamicRateLimiter);

// User routes
router.use('/users', createProxyMiddleware({
  target: config.serviceUrls.USER_SERVICE,
  changeOrigin: true,
  pathRewrite: { '^/users': '' },
  onProxyReq: (proxyReq, req) => {
    proxyReq.setHeader('x-user-id', req.user.userId);
    if (req.correlationId) {
      proxyReq.setHeader('x-correlation-id', req.correlationId);
    }
  }
}));

// News routes
router.use('/news', createProxyMiddleware({
  target: config.serviceUrls.NEWS_SERVICE,
  changeOrigin: true,
  pathRewrite: { '^/news': '' },
  onProxyReq: (proxyReq, req) => {
    proxyReq.setHeader('x-user-id', req.user.userId);
    if (req.correlationId) {
      proxyReq.setHeader('x-correlation-id', req.correlationId);
    }
  }
}));

// Advisory generation -> finance-engine (on-demand advisory)
// Keep the full path; finance-engine expects /advisories/generate
router.use('/advisories/generate', createProxyMiddleware({
  target: config.serviceUrls.FINANCE_ENGINE,
  changeOrigin: true,
  // no pathRewrite here to preserve /advisories/generate
  onProxyReq: (proxyReq, req) => {
    proxyReq.setHeader('x-user-id', req.user.userId);
    if (req.correlationId) {
      proxyReq.setHeader('x-correlation-id', req.correlationId);
    }
  }
}));

// Advisory history -> advisory-service
router.use('/advisories', createProxyMiddleware({
  target: config.serviceUrls.ADVISORY_SERVICE,
  changeOrigin: true,
  pathRewrite: { '^/advisories': '' },
  onProxyReq: (proxyReq, req) => {
    proxyReq.setHeader('x-user-id', req.user.userId);
    if (req.correlationId) {
      proxyReq.setHeader('x-correlation-id', req.correlationId);
    }
  }
}));

// Subscription routes (preserve /subscriptions prefix expected by subscription-service)
router.use('/subscriptions', createProxyMiddleware({
  target: config.serviceUrls.SUBSCRIPTION_SERVICE,
  changeOrigin: true,
  // keep the prefix; the service mounts at /subscriptions
  onProxyReq: (proxyReq, req) => {
    proxyReq.setHeader('x-user-id', req.user.userId);
    if (req.correlationId) {
      proxyReq.setHeader('x-correlation-id', req.correlationId);
    }
  }
}));

// Notification routes
router.use('/notifications', createProxyMiddleware({
  target: config.serviceUrls.NOTIFICATION_SERVICE,
  changeOrigin: true,
  pathRewrite: { '^/notifications': '' },
  onProxyReq: (proxyReq, req) => {
    proxyReq.setHeader('x-user-id', req.user.userId);
    if (req.correlationId) {
      proxyReq.setHeader('x-correlation-id', req.correlationId);
    }
  }
}));

// Payment routes
router.use('/payments', createProxyMiddleware({
  target: config.serviceUrls.PAYMENT_SERVICE,
  changeOrigin: true,
  pathRewrite: { '^/payments': '' },
  onProxyReq: (proxyReq, req) => {
    proxyReq.setHeader('x-user-id', req.user.userId);
    if (req.correlationId) {
      proxyReq.setHeader('x-correlation-id', req.correlationId);
    }
  }
}));

module.exports = router;

