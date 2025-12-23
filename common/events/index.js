// Event schemas for Kafka topics

const VERIFIED_FINANCIAL_NEWS = 'verified-financial-news';
const USER_ADVISORY_GENERATED = 'user-advisory-generated';
const NOTIFICATION_REQUESTED = 'notification-requested';
const SUBSCRIPTION_UPGRADED = 'subscription-upgraded';

module.exports = {
  VERIFIED_FINANCIAL_NEWS,
  USER_ADVISORY_GENERATED,
  NOTIFICATION_REQUESTED,
  SUBSCRIPTION_UPGRADED,
  
  // Event payload schemas
  VerifiedFinancialNewsEvent: {
    newsId: String,
    title: String,
    source: String,
    category: String, // RBI_POLICY, INFLATION, MARKET_EVENT, etc.
    impactLevel: String, // LOW, MEDIUM, HIGH
    credibility: Number, // 0-100
    content: String,
    publishedAt: Date,
    verifiedAt: Date
  },
  
  UserAdvisoryGeneratedEvent: {
    userId: String,
    advisoryId: String,
    riskScore: Number,
    riskLevel: String, // LOW, MEDIUM, HIGH
    advice: String,
    newsIds: [String],
    generatedAt: Date
  },
  
  NotificationRequestedEvent: {
    userId: String,
    advisoryId: String,
    notificationType: String, // EMAIL, SMS, PUSH
    priority: String, // LOW, MEDIUM, HIGH
    subject: String,
    message: String,
    requestedAt: Date
  },
  
  SubscriptionUpgradedEvent: {
    userId: String,
    subscriptionId: String,
    plan: String, // FREE, PREMIUM
    upgradedAt: Date,
    paymentId: String
  }
};

