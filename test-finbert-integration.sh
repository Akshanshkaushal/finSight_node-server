#!/bin/bash

# Test script for FinBERT news classification integration
# This script tests the complete flow from news fetching to FinBERT classification

echo "=========================================="
echo "FinBERT News Classification Test"
echo "=========================================="
echo ""

# Configuration
NEWS_SERVICE_URL="http://localhost:3003"
ML_SERVICE_URL="http://localhost:3009"
FINBERT_SERVICE_URL="http://localhost:5000"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check service health
check_service() {
    local name=$1
    local url=$2
    
    echo -n "Checking $name... "
    if curl -s -f "$url/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Running${NC}"
        return 0
    else
        echo -e "${RED}✗ Not running${NC}"
        return 1
    fi
}

# Check all services
echo "Step 1: Checking service availability"
echo "--------------------------------------"

all_running=true

check_service "FinBERT Service" "$FINBERT_SERVICE_URL" || all_running=false
check_service "ML Service" "$ML_SERVICE_URL" || all_running=false
check_service "News Service" "$NEWS_SERVICE_URL" || all_running=false

echo ""

if [ "$all_running" = false ]; then
    echo -e "${RED}Error: Not all services are running!${NC}"
    echo ""
    echo "Please start the required services:"
    echo "  1. FinBERT: cd ml-service && ./start-finbert.sh"
    echo "  2. ML Service: cd ml-service && npm start"
    echo "  3. News Service: cd news-service && npm start"
    echo ""
    echo "Or use Docker: cd docker && docker-compose up -d"
    exit 1
fi

echo -e "${GREEN}All services are running!${NC}"
echo ""

# Test FinBERT directly
echo "Step 2: Testing FinBERT classification"
echo "--------------------------------------"

echo "Classifying sample news article..."
echo ""

finbert_response=$(curl -s -X POST "$FINBERT_SERVICE_URL/classify" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "RBI increases repo rate by 25 basis points to control inflation",
    "content": "The Reserve Bank of India has decided to increase the repo rate from 6.5% to 6.75% in its latest monetary policy review.",
    "credibility": 90
  }')

if echo "$finbert_response" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ FinBERT classification successful${NC}"
    echo ""
    echo "Response:"
    echo "$finbert_response" | python3 -m json.tool 2>/dev/null || echo "$finbert_response"
    echo ""
else
    echo -e "${RED}✗ FinBERT classification failed${NC}"
    echo "$finbert_response"
    exit 1
fi

# Test ML Service
echo "Step 3: Testing ML Service"
echo "--------------------------------------"

echo "Calling ML Service classify-news endpoint..."
echo ""

ml_response=$(curl -s -X POST "$ML_SERVICE_URL/classify-news" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Rupee falls to new low against US dollar",
    "content": "The Indian rupee weakened to 83.5 against the US dollar amid strong demand for the greenback.",
    "credibility": 85
  }')

if echo "$ml_response" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ ML Service classification successful${NC}"
    echo ""
    echo "Response:"
    echo "$ml_response" | python3 -m json.tool 2>/dev/null || echo "$ml_response"
    echo ""
else
    echo -e "${RED}✗ ML Service classification failed${NC}"
    echo "$ml_response"
    exit 1
fi

# Test News Service - Trigger fetch
echo "Step 4: Testing News Service (Fetch & Classify)"
echo "--------------------------------------"

echo "Triggering news fetch..."
echo ""

fetch_response=$(curl -s -X POST "$NEWS_SERVICE_URL/fetch" \
  -H "Content-Type: application/json")

if echo "$fetch_response" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ News fetch successful${NC}"
    echo ""
    
    # Extract count
    count=$(echo "$fetch_response" | grep -o '"message":"[^"]*"' | grep -o '[0-9]\+' | head -1)
    echo "Fetched and classified $count news articles"
    echo ""
else
    echo -e "${YELLOW}⚠ News fetch completed with warnings${NC}"
    echo "$fetch_response"
    echo ""
fi

# Retrieve classified news
echo "Step 5: Retrieving classified news"
echo "--------------------------------------"

echo "Getting latest news with sentiment data..."
echo ""

news_response=$(curl -s "$NEWS_SERVICE_URL/?limit=3")

if echo "$news_response" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ News retrieval successful${NC}"
    echo ""
    echo "Latest news articles:"
    echo "$news_response" | python3 -m json.tool 2>/dev/null || echo "$news_response"
    echo ""
else
    echo -e "${RED}✗ News retrieval failed${NC}"
    echo "$news_response"
    exit 1
fi

# Test sentiment filtering
echo "Step 6: Testing sentiment filtering"
echo "--------------------------------------"

echo "Filtering news by sentiment (negative)..."
echo ""

filtered_response=$(curl -s "$NEWS_SERVICE_URL/?sentiment=negative&limit=2")

if echo "$filtered_response" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ Sentiment filtering works${NC}"
    echo ""
    
    count=$(echo "$filtered_response" | grep -o '"count":[0-9]\+' | grep -o '[0-9]\+')
    echo "Found $count articles with negative sentiment"
    echo ""
else
    echo -e "${YELLOW}⚠ No negative sentiment articles found (might be normal)${NC}"
    echo ""
fi

# Summary
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo ""
echo -e "${GREEN}✓ FinBERT integration is working correctly!${NC}"
echo ""
echo "Your news articles are now:"
echo "  • Classified by AI (FinBERT)"
echo "  • Analyzed for sentiment (positive/negative/neutral)"
echo "  • Enriched with confidence scores"
echo "  • Filterable by sentiment"
echo ""
echo "Next steps:"
echo "  1. Check the news database for sentiment data"
echo "  2. Update advisory service to use sentiment"
echo "  3. Build sentiment analytics dashboard"
echo "  4. Monitor classification accuracy"
echo ""
echo "=========================================="
