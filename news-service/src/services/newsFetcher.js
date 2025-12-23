const axios = require('axios');
const { NEWS_CATEGORIES, IMPACT_LEVELS } = require('../../../common/enums');

class NewsFetcher {
  constructor() {
    this.financialKeywords = {
      [NEWS_CATEGORIES.RBI_POLICY]: ['RBI', 'reserve bank', 'monetary policy', 'repo rate', 'CRR', 'SLR'],
      [NEWS_CATEGORIES.INFLATION]: ['inflation', 'CPI', 'WPI', 'price rise', 'cost of living'],
      [NEWS_CATEGORIES.INTEREST_RATE]: ['interest rate', 'lending rate', 'borrowing rate', 'base rate'],
      [NEWS_CATEGORIES.CURRENCY]: ['rupee', 'dollar', 'exchange rate', 'forex', 'currency'],
      [NEWS_CATEGORIES.MARKET_EVENT]: ['stock market', 'sensex', 'nifty', 'market crash', 'bull market']
    };
  }

  async fetchNews(source) {
    // Mock news fetching - in production, this would fetch from actual APIs
    // For demo purposes, we'll generate sample news
    const sampleNews = this.generateSampleNews(source);
    return sampleNews;
  }

  generateSampleNews(source) {
    const newsItems = [];
    const categories = Object.values(NEWS_CATEGORIES);
    
    // Generate 2-3 news items per fetch
    const count = Math.floor(Math.random() * 2) + 2;
    
    for (let i = 0; i < count; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const impactLevels = Object.values(IMPACT_LEVELS);
      const impactLevel = impactLevels[Math.floor(Math.random() * impactLevels.length)];
      
      const titles = {
        [NEWS_CATEGORIES.RBI_POLICY]: [
          'RBI Announces Repo Rate Hike by 25 Basis Points',
          'RBI Monetary Policy Committee Keeps Rates Unchanged',
          'RBI Introduces New Liquidity Measures'
        ],
        [NEWS_CATEGORIES.INFLATION]: [
          'CPI Inflation Rises to 6.5% in Latest Reading',
          'Food Inflation Concerns Mount',
          'Core Inflation Remains Stable'
        ],
        [NEWS_CATEGORIES.INTEREST_RATE]: [
          'Banks Increase Home Loan Interest Rates',
          'Fixed Deposit Rates See Upward Revision',
          'Personal Loan Rates Remain High'
        ],
        [NEWS_CATEGORIES.CURRENCY]: [
          'Rupee Weakens Against Dollar',
          'Forex Reserves Cross $600 Billion',
          'Currency Volatility Expected'
        ],
        [NEWS_CATEGORIES.MARKET_EVENT]: [
          'Stock Markets Rally on Positive Sentiment',
          'Market Correction Expected',
          'Sectoral Rotation Continues'
        ]
      };

      const title = titles[category][Math.floor(Math.random() * titles[category].length)];
      
      newsItems.push({
        title,
        source: source.name,
        category,
        impactLevel,
        credibility: source.credibility,
        content: `${title}. This is a sample financial news article related to ${category}. The impact level is ${impactLevel}.`,
        publishedAt: new Date(),
        keywords: this.extractKeywords(title, category)
      });
    }

    return newsItems;
  }

  extractKeywords(text, category) {
    const keywords = [];
    const lowerText = text.toLowerCase();
    
    if (this.financialKeywords[category]) {
      this.financialKeywords[category].forEach(keyword => {
        if (lowerText.includes(keyword.toLowerCase())) {
          keywords.push(keyword);
        }
      });
    }
    
    return keywords;
  }

  classifyNews(title, content) {
    const lowerTitle = title.toLowerCase();
    const lowerContent = content.toLowerCase();
    const combined = `${lowerTitle} ${lowerContent}`;

    for (const [category, keywords] of Object.entries(this.financialKeywords)) {
      if (keywords.some(keyword => combined.includes(keyword.toLowerCase()))) {
        return category;
      }
    }

    return NEWS_CATEGORIES.OTHER;
  }

  determineImpactLevel(category, credibility, keywords) {
    let impactScore = 0;

    // Category impact
    if (category === NEWS_CATEGORIES.RBI_POLICY) impactScore += 40;
    else if (category === NEWS_CATEGORIES.INFLATION) impactScore += 30;
    else if (category === NEWS_CATEGORIES.INTEREST_RATE) impactScore += 35;
    else impactScore += 20;

    // Credibility impact
    impactScore += (credibility / 100) * 20;

    // Keyword density
    impactScore += Math.min(keywords.length * 5, 20);

    if (impactScore >= 60) return IMPACT_LEVELS.HIGH;
    if (impactScore >= 30) return IMPACT_LEVELS.MEDIUM;
    return IMPACT_LEVELS.LOW;
  }
}

module.exports = new NewsFetcher();

