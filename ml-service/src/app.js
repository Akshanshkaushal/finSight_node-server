const express = require('express');
const bodyParser = require('body-parser');
const { classifyAdvanced } = require('./utils/classifier');
const { createLogger } = require('../../common/utils/logger');
const config = require('./config');

const app = express();
const logger = createLogger('ml-service');

app.use(bodyParser.json({ limit: '1mb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ml-service' });
});

app.post('/classify-news', (req, res) => {
  (async () => {
    try {
      const { title = '', content = '', credibility = 80 } = req.body || {};
      const result = await classifyAdvanced({ title, content, credibility });
      res.json({
        success: true,
        data: result,
        correlationId: req.headers['x-correlation-id']
      });
    } catch (err) {
      logger.error('Classification error', { err });
      res.status(500).json({ success: false, error: { message: 'Classification failed' } });
    }
  })();
});

const port = config.port;
app.listen(port, () => {
  logger.info(`ML Service running on port ${port}`);
});

module.exports = app;

