const Redis = require('ioredis');
const config = require('./index');

const redis = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

module.exports = redis;

