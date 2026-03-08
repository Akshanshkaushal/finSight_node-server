# FinBERT Python Service

AI-powered financial news classification using FinBERT (Financial BERT).

## Quick Start

### Windows

```cmd
cd ml-service
start-finbert.bat
```

### Linux/Mac

```bash
cd ml-service
chmod +x start-finbert.sh
./start-finbert.sh
```

### Manual Setup

```bash
cd src/python

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run tests
python test_classifier.py

# Start service
python app.py
```

## Testing

Once the service is running, test it:

```bash
# Health check
curl http://localhost:5000/health

# Classify news
curl -X POST http://localhost:5000/classify \
  -H "Content-Type: application/json" \
  -d "{\"title\": \"RBI increases repo rate\", \"content\": \"The Reserve Bank of India raised rates to control inflation\", \"credibility\": 85}"
```

## Files

- `app.py` - Flask API server
- `finbert_classifier.py` - FinBERT classification logic
- `requirements.txt` - Python dependencies
- `test_classifier.py` - Test suite
- `Dockerfile` - Docker configuration

## Environment Variables

- `FINBERT_PORT` - Service port (default: 5000)
- `FINBERT_HOST` - Bind address (default: 0.0.0.0)

## Model Information

- **Model**: ProsusAI/finbert
- **Size**: ~440MB
- **Framework**: PyTorch + Transformers
- **Purpose**: Financial sentiment analysis

The model is automatically downloaded on first run and cached locally.

## API Endpoints

### POST /classify

Classify a news article

**Request:**

```json
{
  "title": "string",
  "content": "string",
  "credibility": 80
}
```

**Response:**

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
    "keywords": ["rbi", "repo", "rate"]
  }
}
```

### POST /sentiment

Get sentiment analysis only

### POST /batch-classify

Process multiple articles at once

See [FINBERT_INTEGRATION.md](../FINBERT_INTEGRATION.md) for complete documentation.
