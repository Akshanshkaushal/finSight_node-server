"""
Flask API Server for FinBERT Classification
Provides REST endpoints for financial news classification
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from finbert_classifier import FinBERTClassifier
import logging
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize FinBERT classifier (lazy loading)
classifier = None

def get_classifier():
    """Get or initialize the classifier instance"""
    global classifier
    if classifier is None:
        logger.info("Initializing FinBERT classifier...")
        classifier = FinBERTClassifier()
    return classifier

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'service': 'finbert-ml-service',
        'model': 'ProsusAI/finbert'
    }), 200

@app.route('/classify', methods=['POST'])
def classify():
    """
    Classify news article
    
    Request body:
        {
            "title": "string",
            "content": "string" (optional),
            "credibility": number (optional, default: 80)
        }
    
    Response:
        {
            "success": true,
            "data": {
                "category": "string",
                "sentiment": "string",
                "confidence": float,
                "impactLevel": "string",
                "sentimentScores": {...},
                "keywords": [...]
            }
        }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No JSON data provided'
            }), 400
        
        title = data.get('title', '')
        content = data.get('content', '')
        credibility = data.get('credibility', 80)
        
        if not title:
            return jsonify({
                'success': False,
                'error': 'Title is required'
            }), 400
        
        # Validate credibility
        if not isinstance(credibility, (int, float)) or not 0 <= credibility <= 100:
            credibility = 80
        
        # Get classifier and classify
        clf = get_classifier()
        result = clf.classify_news(title, content, credibility)
        
        return jsonify({
            'success': True,
            'data': result
        }), 200
        
    except Exception as e:
        logger.error(f"Classification error: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': f'Classification failed: {str(e)}'
        }), 500

@app.route('/sentiment', methods=['POST'])
def sentiment_only():
    """
    Get sentiment analysis only
    
    Request body:
        {
            "text": "string"
        }
    
    Response:
        {
            "success": true,
            "data": {
                "sentiment": "string",
                "confidence": float,
                "scores": {...}
            }
        }
    """
    try:
        data = request.get_json()
        
        if not data or not data.get('text'):
            return jsonify({
                'success': False,
                'error': 'Text is required'
            }), 400
        
        text = data.get('text')
        
        # Get classifier and analyze sentiment
        clf = get_classifier()
        result = clf.classify_sentiment(text)
        
        return jsonify({
            'success': True,
            'data': result
        }), 200
        
    except Exception as e:
        logger.error(f"Sentiment analysis error: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': f'Sentiment analysis failed: {str(e)}'
        }), 500

@app.route('/batch-classify', methods=['POST'])
def batch_classify():
    """
    Classify multiple news articles in batch
    
    Request body:
        {
            "articles": [
                {
                    "title": "string",
                    "content": "string" (optional),
                    "credibility": number (optional)
                },
                ...
            ]
        }
    
    Response:
        {
            "success": true,
            "data": [...]
        }
    """
    try:
        data = request.get_json()
        
        if not data or not data.get('articles'):
            return jsonify({
                'success': False,
                'error': 'Articles array is required'
            }), 400
        
        articles = data.get('articles', [])
        
        if not isinstance(articles, list):
            return jsonify({
                'success': False,
                'error': 'Articles must be an array'
            }), 400
        
        # Get classifier
        clf = get_classifier()
        
        # Classify each article
        results = []
        for article in articles:
            if not isinstance(article, dict) or not article.get('title'):
                results.append({
                    'success': False,
                    'error': 'Invalid article format'
                })
                continue
            
            try:
                result = clf.classify_news(
                    article.get('title', ''),
                    article.get('content', ''),
                    article.get('credibility', 80)
                )
                results.append({
                    'success': True,
                    'data': result
                })
            except Exception as e:
                logger.error(f"Error classifying article: {str(e)}")
                results.append({
                    'success': False,
                    'error': str(e)
                })
        
        return jsonify({
            'success': True,
            'data': results
        }), 200
        
    except Exception as e:
        logger.error(f"Batch classification error: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': f'Batch classification failed: {str(e)}'
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('FINBERT_PORT', 5000))
    host = os.environ.get('FINBERT_HOST', '0.0.0.0')
    
    logger.info(f"Starting FinBERT ML Service on {host}:{port}")
    app.run(host=host, port=port, debug=False)
