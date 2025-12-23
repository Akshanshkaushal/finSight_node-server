const { SERVICE_PORTS, REDIS_CONFIG, KAFKA_CONFIG } = require('../../../common/constants');

module.exports = {
  port: process.env.PORT || SERVICE_PORTS.NEWS_SERVICE,
  mongo: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/finsight_news'
  },
  redis: {
    host: process.env.REDIS_HOST || REDIS_CONFIG.HOST,
    port: process.env.REDIS_PORT || REDIS_CONFIG.PORT,
    ttl: REDIS_CONFIG.TTL.NEWS_DEDUP
  },
  kafka: {
    brokers: process.env.KAFKA_BROKERS?.split(',') || KAFKA_CONFIG.BROKERS
  },
  newsSources: [
    {
      name: 'RBI',
      url: 'https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx',
      credibility: 95
    },
    {
      name: 'Economic Times',
      url: 'https://economictimes.indiatimes.com/news/economy',
      credibility: 80
    }
  ],
  fetchInterval: process.env.NEWS_FETCH_INTERVAL || '0 */6 * * *' // Every 6 hours
};

