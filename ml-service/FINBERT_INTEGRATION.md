# FinBERT Integration Guide

## Overview

This guide explains how to integrate and use FinBERT (Financial BERT) for AI-powered news classification in FinSight. FinBERT is a pre-trained NLP model specifically designed for financial sentiment analysis and text classification.

## Architecture

```
┌─────────────┐      ┌──────────────┐      ┌──────────────────┐
│ News Service│─────>│  ML Service  │─────>│ FinBERT Service  │
│  (Node.js)  │      │  (Node.js)   │      │    (Python)      │
└─────────────┘      └──────────────┘      └──────────────────┘
                            │
                            ├─> FinBERT Model (AI Classification)
                            └─> Keyword Fallback (if unavailable)
```

## What FinBERT Does

1. **Sentiment Analysis**: Classifies financial text as positive, negative, or neutral
2. **Category Classification**: Categorizes news into:
   - RBI_POLICY
   - INFLATION
   - INTEREST_RATE
   - CURRENCY
   - MARKET_EVENT
   - OTHER

3. **Impact Assessment**: Determines impact level (HIGH/MEDIUM/LOW) based on:
   - Category importance
   - Sentiment strength and confidence
   - Source credibility

## Setup Instructions

### Option 1: Using Docker (Recommended)

1. **Build and start all services**:

   ```bash
   cd docker
   docker-compose up -d
   ```

2. **Verify FinBERT service is running**:

   ```bash
   curl http://localhost:5000/health
   ```

   Expected response:

   ```json
   {
     "status": "ok",
     "service": "finbert-ml-service",
     "model": "ProsusAI/finbert"
   }
   ```

3. **Test classification**:
   ```bash
   curl -X POST http://localhost:5000/classify \
     -H "Content-Type: application/json" \
     -d '{
       "title": "RBI increases repo rate by 25 basis points",
       "content": "The Reserve Bank of India has decided to increase the repo rate to control inflation",
       "credibility": 85
     }'
   ```

### Option 2: Manual Setup (Development)

1. **Install Python dependencies**:

   ```bash
   cd ml-service/src/python
   pip install -r requirements.txt
   ```

2. **Download FinBERT model** (first run only):
   The model will be automatically downloaded on first use (~440MB)

3. **Start FinBERT service**:

   ```bash
   python app.py
   ```

4. **Start ML service** (in another terminal):
   ```bash
   cd ml-service
   npm install
   npm start
   ```

## Environment Variables

Add these to your `.env` file:

```env
# FinBERT Configuration
FINBERT_URL=http://localhost:5000
USE_FINBERT=true

# Optional: External model fallback
ML_MODEL_URL=
ML_MODEL_API_KEY=
```

For Docker:

- `FINBERT_URL` should be `http://finbert-service:5000` (using service name)

## API Endpoints

### FinBERT Service (Port 5000)

#### 1. Health Check

```
GET /health
```

#### 2. Classify News Article

```
POST /classify
Content-Type: application/json

{
  "title": "string",
  "content": "string" (optional),
  "credibility": number (0-100, default: 80)
}
```

Response:

```json
{
  "success": true,
  "data": {
    "category": "RBI_POLICY",
    "sentiment": "negative",
    "confidence": 0.92,
    "impactLevel": "HIGH",
    "sentimentScores": {
      "positive": 0.05,
      "negative": 0.92,
      "neutral": 0.03
    },
    "keywords": ["rbi", "repo", "rate", "monetary", "policy"]
  }
}
```

#### 3. Sentiment Analysis Only

```
POST /sentiment
Content-Type: application/json

{
  "text": "string"
}
```

#### 4. Batch Classification

```
POST /batch-classify
Content-Type: application/json

{
  "articles": [
    {
      "title": "string",
      "content": "string",
      "credibility": number
    },
    ...
  ]
}
```

### ML Service (Port 3009)

#### Classify News (now uses FinBERT)

```
POST /classify-news
Content-Type: application/json

{
  "title": "string",
  "content": "string",
  "credibility": number
}
```

## Fallback Mechanism

The system implements a robust fallback strategy:

1. **Primary**: FinBERT AI classification (if available)
2. **Secondary**: External model URL (if configured)
3. **Tertiary**: Keyword-based heuristic classification

This ensures news classification continues working even if FinBERT service is down.

## Performance Considerations

### Model Loading

- **First request**: ~5-10 seconds (model loading)
- **Subsequent requests**: ~500ms-2s per article
- Model is cached in memory after first load

### Resource Usage

- **RAM**: ~2-4GB for FinBERT model
- **CPU**: Significant during inference (GPU recommended for production)
- **Disk**: ~440MB for model files

### Optimization Tips

1. **Use GPU** for faster inference:

   ```dockerfile
   # In Dockerfile, use CUDA-enabled base image
   FROM nvidia/cuda:11.8.0-base-ubuntu22.04
   ```

2. **Implement caching**:
   - Cache results for identical articles
   - Use Redis for distributed caching

3. **Batch processing**:
   - Use `/batch-classify` endpoint for multiple articles
   - Process news in scheduled batches rather than real-time

4. **Model persistence**:
   - Mount volume for HuggingFace cache
   - Reduces download time on container restarts

## Testing

### Unit Test Example

```javascript
// test/ml-service.test.js
const axios = require("axios");

describe("FinBERT Classification", () => {
  it("should classify RBI policy news correctly", async () => {
    const response = await axios.post("http://localhost:5000/classify", {
      title: "RBI keeps repo rate unchanged",
      content: "Reserve Bank maintains status quo on policy rates",
      credibility: 90,
    });

    expect(response.data.success).toBe(true);
    expect(response.data.data.category).toBe("RBI_POLICY");
    expect(response.data.data.impactLevel).toBe("HIGH");
  });
});
```

### Manual Testing

```bash
# Test different categories
curl -X POST http://localhost:5000/classify \
  -H "Content-Type: application/json" \
  -d '{"title": "Rupee falls to new low against dollar", "credibility": 80}'

curl -X POST http://localhost:5000/classify \
  -H "Content-Type: application/json" \
  -d '{"title": "Sensex rallies 500 points on positive sentiment", "credibility": 85}'
```

## Monitoring

### Check FinBERT Service Status

```bash
# Health check
curl http://localhost:5000/health

# Docker logs
docker logs finsight-finbert-service -f

# Resource usage
docker stats finsight-finbert-service
```

### Common Issues

1. **Model download fails**:
   - Ensure internet connectivity
   - Check HuggingFace is accessible
   - Verify disk space (need ~500MB free)

2. **Service timeout**:
   - Increase timeout in classifier.js (default: 10s)
   - Check if model is loaded (first request is slow)

3. **Out of memory**:
   - Increase Docker memory limit
   - Use smaller batch sizes
   - Consider model quantization

## Production Deployment

### Recommendations

1. **Use GPU instances** for better performance:
   - AWS: p3.2xlarge, g4dn.xlarge
   - GCP: n1-standard-4 + Tesla T4
   - Azure: NC6s v3

2. **Scale horizontally**:
   - Run multiple FinBERT service instances
   - Use load balancer
   - Implement request queuing

3. **Model optimization**:
   - Use ONNX Runtime for faster inference
   - Implement model quantization (INT8)
   - Consider DistilBERT variant for lower memory

4. **Monitoring & Alerts**:
   - Track inference latency
   - Monitor model accuracy
   - Alert on service failures

## Advanced Configuration

### Using Different Models

You can replace FinBERT with other models:

```python
# In finbert_classifier.py
classifier = FinBERTClassifier(model_name='yiyanghkust/finbert-tone')
# or
classifier = FinBERTClassifier(model_name='ProsusAI/finbert')
```

Available financial BERT models:

- `ProsusAI/finbert` - General financial sentiment
- `yiyanghkust/finbert-tone` - Sentiment with tone analysis
- `abhilash1910/financial_roberta` - RoBERTa variant

### Custom Fine-tuning

For domain-specific classification:

1. Collect labeled training data
2. Fine-tune FinBERT on your data
3. Save custom model
4. Update `model_name` in classifier

## Migration from Keyword-based

To migrate existing system:

1. **Test parallel**: Run both systems side-by-side
2. **Compare results**: Validate FinBERT accuracy
3. **Gradual rollout**: Start with low-traffic periods
4. **Monitor metrics**: Track classification accuracy
5. **Full switch**: Disable keyword fallback once confident

## Support & Resources

- **FinBERT Paper**: [arXiv:1908.10063](https://arxiv.org/abs/1908.10063)
- **HuggingFace**: [ProsusAI/finbert](https://huggingface.co/ProsusAI/finbert)
- **Issue Tracking**: Create issues in project repository

## License

FinBERT model is licensed under Apache 2.0. Ensure compliance with model license terms.
