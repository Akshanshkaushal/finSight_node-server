const axios = require('axios');
const redis = require('../config/redis');
const { KafkaProducer } = require('../../../common/utils/kafka');
const { USER_ADVISORY_GENERATED, NOTIFICATION_REQUESTED } = require('../../../common/events');
const riskCalculator = require('./riskCalculator');
const adviceGenerator = require('./adviceGenerator');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const { RISK_LEVELS } = require('../../../common/enums');

class FinanceEngineService {
  constructor() {
    this.producer = new KafkaProducer();
  }

  async classifyWithML(newsEvent) {
    try {
      const resp = await axios.post(
        `${config.mlServiceUrl}/classify-news`,
        {
          title: newsEvent.title,
          content: newsEvent.content,
          credibility: newsEvent.credibility || 80
        },
        { timeout: 3000 }
      );
      const data = resp.data?.data || {};
      return {
        category: data.category || newsEvent.category,
        impactLevel: data.impactLevel || newsEvent.impactLevel,
        keywords: data.keywords || newsEvent.keywords
      };
    } catch (err) {
      console.error('ML classify fallback to heuristic:', err.message);
      return {
        category: newsEvent.category,
        impactLevel: newsEvent.impactLevel,
        keywords: newsEvent.keywords
      };
    }
  }

  async processNewsEvent(newsEvent) {
    try {
      const ml = await this.classifyWithML(newsEvent);
      const enrichedNews = { ...newsEvent, ...ml };

      // In production, this would:
      // 1. Fetch active user IDs from subscription service (PREMIUM users)
      // 2. Or maintain a list of users who should receive advisories
      // 3. Process in batches to avoid overwhelming the system
      
      // For now, we'll process advisories on-demand via the API endpoint
      // The Kafka consumer can be extended to process for all users if needed
      const userIds = await this.getActiveUserIds();

      if (userIds.length === 0) {
        // No active users to process - advisories will be generated on-demand
        return;
      }

      for (const userId of userIds) {
        await this.generateAdvisoryForUser(userId, enrichedNews);
      }
    } catch (error) {
      console.error('Error processing news event:', error);
      throw error;
    }
  }

  async generateAdvisoryForUser(userId, newsEvent) {
    try {
      // Check cache first
      const cacheKey = `risk:${userId}:${newsEvent.newsId}`;
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Fetch user profile
      const userProfile = await this.fetchUserProfile(userId);
      if (!userProfile) {
        return; // Skip if user profile not found
      }

      // Calculate risk score
      const riskScore = riskCalculator.calculateRiskScore(newsEvent, userProfile);
      const riskLevel = riskCalculator.getRiskLevel(riskScore);

      // Generate advice
      const advice = adviceGenerator.generateAdvice(newsEvent, userProfile, riskScore, riskLevel);

      // Create advisory
      const advisoryId = uuidv4();
      const advisory = {
        advisoryId,
        userId,
        riskScore,
        riskLevel,
        advice,
        newsIds: [newsEvent.newsId],
        generatedAt: new Date()
      };

      // Cache result
      await redis.setex(cacheKey, config.redis.ttl, JSON.stringify(advisory));

      // Publish advisory event
      await this.producer.send(USER_ADVISORY_GENERATED, {
        key: userId,
        value: advisory
      });

      // Trigger notification if risk is HIGH
      if (riskLevel === RISK_LEVELS.HIGH) {
        await this.producer.send(NOTIFICATION_REQUESTED, {
          key: userId,
          value: {
            userId,
            advisoryId,
            notificationType: 'EMAIL',
            priority: 'HIGH',
            subject: `High Financial Risk Alert - ${newsEvent.title}`,
            message: `Your financial risk level is HIGH. ${advice}`,
            requestedAt: new Date()
          }
        });
      }

      return advisory;
    } catch (error) {
      console.error(`Error generating advisory for user ${userId}:`, error);
      throw error;
    }
  }

  async fetchUserProfile(userId) {
    try {
      const response = await axios.get(`${config.userServiceUrl}/${userId}`, {
        timeout: 5000
      });
      return response.data.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async getActiveUserIds() {
    try {
      const response = await axios.get(`${config.subscriptionServiceUrl}/subscriptions/active`, {
        timeout: 5000
      });
      const users = response.data?.data || [];
      // Expecting an array of userIds
      return Array.isArray(users) ? users : [];
    } catch (error) {
      console.error('Failed to fetch active users from subscription service:', error.message);
      return [];
    }
  }
}

module.exports = new FinanceEngineService();

