const News = require("../models/News");
const newsFetcher = require("./newsFetcher");
const redis = require("../config/redis");
const { KafkaProducer } = require("../../../common/utils/kafka");
const { VERIFIED_FINANCIAL_NEWS } = require("../../../common/events");
const { v4: uuidv4 } = require("uuid");
const config = require("../config");
const axios = require("axios");
const { createLogger } = require("../../../common/utils/logger");

const logger = createLogger("news-service");

class NewsService {
  constructor() {
    this.producer = new KafkaProducer();
  }

  async classifyWithMLService(title, content, credibility) {
    if (!config.mlService.enabled) {
      logger.info("ML service disabled, using fallback classification");
      return null;
    }

    try {
      const response = await axios.post(
        `${config.mlService.url}/classify-news`,
        { title, content, credibility },
        {
          timeout: config.mlService.timeout,
          headers: { "Content-Type": "application/json" },
        },
      );

      if (response.data?.success && response.data?.data) {
        logger.info("ML service classification successful", {
          category: response.data.data.category,
          sentiment: response.data.data.sentiment,
        });
        return response.data.data;
      }
      return null;
    } catch (error) {
      logger.warn("ML service classification failed, using fallback", {
        error: error.message,
      });
      return null;
    }
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
            // Try ML service classification first (with FinBERT)
            const mlResult = await this.classifyWithMLService(
              item.title,
              item.content,
              item.credibility,
            );

            let category,
              impactLevel,
              keywords,
              sentiment,
              sentimentConfidence,
              sentimentScores;

            if (mlResult) {
              // Use ML service results (FinBERT)
              category = mlResult.category;
              impactLevel = mlResult.impactLevel;
              keywords = mlResult.keywords || item.keywords || [];
              sentiment = mlResult.sentiment || "neutral";
              sentimentConfidence = mlResult.confidence || 0.5;
              sentimentScores = mlResult.sentimentScores || {
                positive: 0.33,
                negative: 0.33,
                neutral: 0.34,
              };
            } else {
              // Fallback to keyword-based classification
              category = newsFetcher.classifyNews(item.title, item.content);
              impactLevel = newsFetcher.determineImpactLevel(
                category,
                item.credibility,
                item.keywords || [],
              );
              keywords = item.keywords || [];
              sentiment = "neutral";
              sentimentConfidence = 0.5;
              sentimentScores = {
                positive: 0.33,
                negative: 0.33,
                neutral: 0.34,
              };
            }

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
              keywords,
              sentiment,
              sentimentConfidence,
              sentimentScores,
            });

            await news.save();

            // Mark as deduplicated
            await redis.setex(`news:dedup:${newsHash}`, config.redis.ttl, "1");

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
                verifiedAt: news.verifiedAt,
                sentiment: news.sentiment,
                sentimentConfidence: news.sentimentConfidence,
                keywords: news.keywords,
              },
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

    if (filters.sentiment) {
      query.sentiment = filters.sentiment;
    }

    if (filters.startDate || filters.endDate) {
      query.publishedAt = {};
      if (filters.startDate)
        query.publishedAt.$gte = new Date(filters.startDate);
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
    const crypto = require("crypto");
    return crypto.createHash("md5").update(`${title}:${source}`).digest("hex");
  }
}

module.exports = new NewsService();
