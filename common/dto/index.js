// Data Transfer Objects for API requests/responses

class UserProfileDTO {
  constructor(data) {
    this.userId = data.userId;
    this.income = data.income;
    this.expenses = data.expenses;
    this.loans = data.loans || [];
    this.riskAppetite = data.riskAppetite; // CONSERVATIVE, MODERATE, AGGRESSIVE
  }
}

class FinancialNewsDTO {
  constructor(data) {
    this.newsId = data.newsId;
    this.title = data.title;
    this.source = data.source;
    this.category = data.category;
    this.impactLevel = data.impactLevel;
    this.credibility = data.credibility;
    this.content = data.content;
    this.publishedAt = data.publishedAt;
    this.verifiedAt = data.verifiedAt;
  }
}

class AdvisoryDTO {
  constructor(data) {
    this.advisoryId = data.advisoryId;
    this.userId = data.userId;
    this.riskScore = data.riskScore;
    this.riskLevel = data.riskLevel;
    this.advice = data.advice;
    this.newsIds = data.newsIds || [];
    this.generatedAt = data.generatedAt;
  }
}

class SubscriptionDTO {
  constructor(data) {
    this.subscriptionId = data.subscriptionId;
    this.userId = data.userId;
    this.plan = data.plan; // FREE, PREMIUM
    this.status = data.status; // ACTIVE, EXPIRED, CANCELLED
    this.startedAt = data.startedAt;
    this.expiresAt = data.expiresAt;
  }
}

module.exports = {
  UserProfileDTO,
  FinancialNewsDTO,
  AdvisoryDTO,
  SubscriptionDTO
};

