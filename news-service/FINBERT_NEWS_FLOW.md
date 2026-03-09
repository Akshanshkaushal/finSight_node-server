# FinBERT Integration: Complete News Flow

## How News Articles Get Classified with FinBERT

```
┌──────────────────────────────────────────────────────────────┐
│                    News Classification Flow                   │
└──────────────────────────────────────────────────────────────┘

1. News Fetcher (news-service)
   ↓
   Fetches articles from sources (RBI, Economic Times, etc.)

2. Deduplication Check (Redis)
   ↓
   Checks if article already processed

3. ML Service Classification (ML Service → FinBERT)
   ↓
   ┌─────────────────────────────────────────┐
   │ ML Service calls FinBERT Service:      │
   │                                         │
   │ POST /classify-news                    │
   │ {                                      │
   │   title: "RBI increases repo rate",   │
   │   content: "...",                      │
   │   credibility: 90                      │
   │ }                                      │
   └─────────────────────────────────────────┘
   ↓
   ┌─────────────────────────────────────────┐
   │ FinBERT Response:                       │
   │ {                                       │
   │   category: "RBI_POLICY",              │
   │   impactLevel: "HIGH",                 │
   │   sentiment: "negative",               │
   │   confidence: 0.92,                    │
   │   sentimentScores: {                   │
   │     positive: 0.05,                    │
   │     negative: 0.92,                    │
   │     neutral: 0.03                      │
   │   },                                   │
   │   keywords: ["rbi", "repo", "rate"]    │
   │ }                                       │
   └─────────────────────────────────────────┘
   ↓
4. Save to MongoDB with Sentiment Data
   ↓
   Stores: category, impactLevel, sentiment, confidence, scores

5. Publish to Kafka (VERIFIED_FINANCIAL_NEWS)
   ↓
   Other services consume enriched news with sentiment analysis

6. Advisory Service / Notification Service
   ↓
   Use sentiment + category to generate personalized alerts
```

## Updated News Model

Your news articles now include:

```javascript
{
  newsId: "uuid",
  title: "RBI increases repo rate",
  source: "RBI",
  category: "RBI_POLICY",           // AI-classified
  impactLevel: "HIGH",              // AI-determined
  credibility: 95,
  content: "...",
  publishedAt: "2026-03-07",
  keywords: ["rbi", "repo", "rate"],

  // NEW: FinBERT sentiment analysis
  sentiment: "negative",            // positive/negative/neutral
  sentimentConfidence: 0.92,        // 0-1 confidence score
  sentimentScores: {
    positive: 0.05,
    negative: 0.92,
    neutral: 0.03
  }
}
```

## How It Works Now

### 1. **News Fetching & Classification**

When news is fetched (every 6 hours by default):

```javascript
// newsService.js - fetchAndVerifyNews()

for (const item of newsItems) {
  // Try ML service with FinBERT first
  const mlResult = await this.classifyWithMLService(
    item.title,
    item.content,
    item.credibility
  );

  if (mlResult) {
    // Use AI classification (FinBERT)
    category = mlResult.category;
    sentiment = mlResult.sentiment;
    confidence = mlResult.confidence;
  } else {
    // Fallback to keyword-based
    category = newsFetcher.classifyNews(...);
    sentiment = 'neutral';
  }
}
```

### 2. **Fallback Strategy**

The system has **3 levels of classification**:

1. **Primary**: FinBERT (AI-powered, 90%+ accuracy)
2. **Secondary**: External model (if ML_MODEL_URL configured)
3. **Tertiary**: Keyword-based (built-in fallback)

If FinBERT service is down, classification continues with keywords.

### 3. **Environment Configuration**

Add to your [news-service/.env]():

```env
# Enable FinBERT classification
ML_SERVICE_URL=http://localhost:3009
USE_ML_SERVICE=true
ML_SERVICE_TIMEOUT=10000
```

For Docker (already configured):

```env
ML_SERVICE_URL=http://ml-service:3009
```

## Testing the Flow

### 1. Start Services

**Docker:**

```bash
cd docker
docker-compose up -d
```

**Manual:**

```bash
# Terminal 1: Start FinBERT
cd ml-service
start-finbert.bat  # or ./start-finbert.sh

# Terminal 2: Start ML Service
cd ml-service
npm start

# Terminal 3: Start News Service
cd news-service
npm start
```

### 2. Trigger News Fetch

```bash
# The scheduler runs automatically, or trigger manually:
curl -X POST http://localhost:3003/fetch-news
```

### 3. View Classified News

```bash
# Get all news
curl http://localhost:3003/news

# Filter by sentiment
curl http://localhost:3003/news?sentiment=negative

# Filter by category and impact
curl http://localhost:3003/news?category=RBI_POLICY&impactLevel=HIGH
```

### 4. Check Logs

```bash
# Docker
docker logs finsight-news-service -f
docker logs finsight-finbert-service -f

# Manual
# Check terminal output for classification results
```

## Example: News Processing

**Input Article:**

```
Title: "RBI hikes repo rate by 50 basis points"
Source: RBI (credibility: 95)
Content: "Reserve Bank raises key policy rate to combat inflation..."
```

**FinBERT Processing:**

1. Analyzes financial sentiment → **negative** (0.89 confidence)
2. Categorizes as → **RBI_POLICY**
3. Assesses impact → **HIGH** (category + sentiment + credibility)
4. Extracts keywords → ["rbi", "repo", "rate", "policy"]

**Stored in MongoDB:**

```json
{
  "newsId": "abc-123",
  "title": "RBI hikes repo rate by 50 basis points",
  "category": "RBI_POLICY",
  "impactLevel": "HIGH",
  "sentiment": "negative",
  "sentimentConfidence": 0.89,
  "sentimentScores": {
    "positive": 0.06,
    "negative": 0.89,
    "neutral": 0.05
  },
  "keywords": ["rbi", "repo", "rate", "policy"]
}
```

**Published to Kafka:**
Other services (advisory, notification) receive enriched news with sentiment data.

## Benefits for Your System

### 1. **Better Advisories**

```javascript
// advisory-service can now use sentiment
if (news.category === "RBI_POLICY" && news.sentiment === "negative") {
  // High impact negative policy change
  generateAlert("Consider reviewing fixed-income investments");
}
```

### 2. **Smarter Notifications**

```javascript
// notification-service prioritizes by sentiment + impact
const priority = calculatePriority(
  news.impactLevel,
  news.sentimentConfidence,
  news.sentiment,
);
```

### 3. **Enhanced Analytics**

```javascript
// Track sentiment trends over time
db.news.aggregate([
  {
    $group: {
      _id: { category: "$category", sentiment: "$sentiment" },
      count: { $sum: 1 },
      avgConfidence: { $avg: "$sentimentConfidence" },
    },
  },
]);
```

## Monitoring

### Check Classification Status

```bash
# News service logs show which classifier was used
grep "ML service classification" /var/log/news-service.log
grep "using fallback" /var/log/news-service.log
```

### Metrics to Track

1. **ML Service Success Rate**: How often FinBERT succeeds
2. **Average Confidence**: Quality of predictions
3. **Sentiment Distribution**: Balance of positive/negative/neutral
4. **Processing Time**: Latency of classification

## Troubleshooting

### "ML service classification failed"

- Check if ML service is running: `curl http://localhost:3009/health`
- Check if FinBERT service is running: `curl http://localhost:5000/health`
- Verify network connectivity in Docker
- Check ML_SERVICE_URL environment variable

### Articles have neutral sentiment

- Fallback classification doesn't include sentiment
- Ensure FinBERT service is running
- Check ML service logs for errors

### Slow processing

- FinBERT takes 1-3s per article (normal)
- Consider batch processing
- Enable model caching
- Use GPU for faster inference

## Next Steps

1. **Test the integration** - Fetch some news and verify sentiment analysis
2. **Monitor accuracy** - Track FinBERT classification quality
3. **Update advisory logic** - Use sentiment in recommendations
4. **Build analytics** - Create sentiment trend dashboards
5. **Optimize performance** - Add caching, batch processing

Your news articles are now powered by AI! 🚀
