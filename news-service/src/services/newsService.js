const News = require('../models/News');
const newsFetcher = require('./newsFetcher');
const redis = require('../config/redis');
const { KafkaProducer } = require('../../../common/utils/kafka');
const { VERIFIED_FINANCIAL_NEWS } = require('../../../common/events');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');

class NewsService {
  constructor() {
    this.producer = new KafkaProducer();
  }

  async fetchAndVerifyNews() {
    const verifiedNews = [];

    for (const source of config.newsSources) {
      try {
        const newsItems = await newsFetcher.fetchNews(source);

        for (const item of newsItems) {
          // Check for duplicates using Redis
          const newsHash = this.generateNewsHash(item.title, item.source);
          const isDuplicate = await redis.exists(`news:dedup:${newsHash}`);

          if (!isDuplicate) {
            // Classify and determine impact
            const category = newsFetcher.classifyNews(item.title, item.content);
            const impactLevel = newsFetcher.determineImpactLevel(
              category,
              item.credibility,
              item.keywords || []
            );

            // Create news document
            const news = new News({
              newsId: uuidv4(),
              title: item.title,
              source: item.source,
              category,
              impactLevel,
              credibility: item.credibility,
              content: item.content,
              publishedAt: item.publishedAt,
              keywords: item.keywords
            });

            await news.save();

            // Mark as deduplicated
            await redis.setex(`news:dedup:${newsHash}`, config.redis.ttl, '1');

            // Publish to Kafka
            await this.producer.send(VERIFIED_FINANCIAL_NEWS, {
              value: {
                newsId: news.newsId,
                title: news.title,
                source: news.source,
                category: news.category,
                impactLevel: news.impactLevel,
                credibility: news.credibility,
                content: news.content,
                publishedAt: news.publishedAt,
                verifiedAt: news.verifiedAt
              }
            });

            verifiedNews.push(news);
          }
        }
      } catch (error) {
        console.error(`Error fetching news from ${source.name}:`, error);
      }
    }

    return verifiedNews;
  }

  async getNews(filters = {}) {
    const query = {};

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.impactLevel) {
      query.impactLevel = filters.impactLevel;
    }

    if (filters.startDate || filters.endDate) {
      query.publishedAt = {};
      if (filters.startDate) query.publishedAt.$gte = new Date(filters.startDate);
      if (filters.endDate) query.publishedAt.$lte = new Date(filters.endDate);
    }

    const limit = filters.limit || 20;
    const skip = filters.skip || 0;

    const news = await News.find(query)
      .sort({ publishedAt: -1 })
      .limit(limit)
      .skip(skip);

    return news;
  }

  async getNewsById(newsId) {
    const news = await News.findOne({ newsId });
    return news;
  }

  generateNewsHash(title, source) {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(`${title}:${source}`).digest('hex');
  }
}

module.exports = new NewsService();

