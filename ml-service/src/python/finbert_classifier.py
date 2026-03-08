"""
FinBERT-based Financial News Classifier
Uses ProsusAI/finbert for sentiment analysis and classification
"""

import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import numpy as np
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FinBERTClassifier:
    def __init__(self, model_name='ProsusAI/finbert'):
        """
        Initialize FinBERT model for financial text classification
        
        Args:
            model_name: HuggingFace model identifier (default: ProsusAI/finbert)
        """
        logger.info(f"Loading FinBERT model: {model_name}")
        try:
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            self.model = AutoModelForSequenceClassification.from_pretrained(model_name)
            self.model.eval()  # Set to evaluation mode
            
            # Sentiment labels for FinBERT
            self.sentiment_labels = ['positive', 'negative', 'neutral']
            
            # Impact mapping based on sentiment and confidence
            self.impact_mapping = {
                'HIGH': ['rbi_policy', 'interest_rate', 'inflation'],
                'MEDIUM': ['currency', 'market_event'],
                'LOW': ['other']
            }
            
            logger.info("FinBERT model loaded successfully")
        except Exception as e:
            logger.error(f"Error loading FinBERT model: {e}")
            raise
    
    def classify_sentiment(self, text):
        """
        Classify sentiment of financial text
        
        Args:
            text: Input text (title + content)
            
        Returns:
            dict: {
                'sentiment': str (positive/negative/neutral),
                'confidence': float (0-1),
                'scores': dict with all sentiment scores
            }
        """
        try:
            # Tokenize input
            inputs = self.tokenizer(
                text,
                return_tensors="pt",
                truncation=True,
                max_length=512,
                padding=True
            )
            
            # Get predictions
            with torch.no_grad():
                outputs = self.model(**inputs)
                predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
            
            # Get sentiment scores
            scores = predictions[0].cpu().numpy()
            sentiment_scores = {
                self.sentiment_labels[i]: float(scores[i])
                for i in range(len(self.sentiment_labels))
            }
            
            # Get dominant sentiment
            max_idx = np.argmax(scores)
            sentiment = self.sentiment_labels[max_idx]
            confidence = float(scores[max_idx])
            
            return {
                'sentiment': sentiment,
                'confidence': confidence,
                'scores': sentiment_scores
            }
        except Exception as e:
            logger.error(f"Sentiment classification error: {e}")
            return {
                'sentiment': 'neutral',
                'confidence': 0.5,
                'scores': {'positive': 0.33, 'negative': 0.33, 'neutral': 0.34}
            }
    
    def classify_category(self, text):
        """
        Classify news article into financial categories using keyword enhancement
        
        Args:
            text: Input text
            
        Returns:
            str: Category name
        """
        text_lower = text.lower()
        
        # Enhanced keyword mapping for better accuracy
        category_keywords = {
            'RBI_POLICY': ['rbi', 'reserve bank', 'monetary policy', 'repo rate', 
                          'reverse repo', 'crr', 'slr', 'policy rate', 'mpc'],
            'INFLATION': ['inflation', 'cpi', 'wpi', 'wholesale price', 
                         'consumer price', 'price rise', 'deflation'],
            'INTEREST_RATE': ['interest rate', 'lending rate', 'borrowing rate', 
                             'fd rate', 'loan rate', 'deposit rate', 'emr'],
            'CURRENCY': ['rupee', 'dollar', 'exchange rate', 'forex', 'currency', 
                        'usd/inr', 'euro', 'pound'],
            'MARKET_EVENT': ['stock market', 'sensex', 'nifty', 'bse', 'nse',
                           'market crash', 'rally', 'bull market', 'bear market',
                           'shares', 'equity']
        }
        
        # Score each category
        category_scores = {}
        for category, keywords in category_keywords.items():
            score = sum(1 for keyword in keywords if keyword in text_lower)
            if score > 0:
                category_scores[category] = score
        
        # Return category with highest score or OTHER
        if category_scores:
            return max(category_scores, key=category_scores.get)
        return 'OTHER'
    
    def determine_impact(self, category, sentiment_data, credibility=80):
        """
        Determine impact level based on category, sentiment, and credibility
        
        Args:
            category: News category
            sentiment_data: Sentiment classification result
            credibility: Source credibility (0-100)
            
        Returns:
            str: Impact level (HIGH/MEDIUM/LOW)
        """
        base_score = 0
        
        # Category-based scoring
        if category in ['RBI_POLICY', 'INTEREST_RATE']:
            base_score = 40
        elif category == 'INFLATION':
            base_score = 35
        elif category in ['CURRENCY', 'MARKET_EVENT']:
            base_score = 25
        else:
            base_score = 15
        
        # Sentiment-based adjustment
        sentiment = sentiment_data.get('sentiment', 'neutral')
        confidence = sentiment_data.get('confidence', 0.5)
        
        if sentiment in ['positive', 'negative']:
            # Strong sentiment indicates higher impact
            base_score += confidence * 20
        
        # Credibility adjustment
        credibility_factor = (credibility / 100) * 15
        base_score += credibility_factor
        
        # Determine final impact level
        if base_score >= 55:
            return 'HIGH'
        elif base_score >= 30:
            return 'MEDIUM'
        else:
            return 'LOW'
    
    def classify_news(self, title, content='', credibility=80):
        """
        Complete news classification pipeline
        
        Args:
            title: News title
            content: News content
            credibility: Source credibility (0-100)
            
        Returns:
            dict: {
                'category': str,
                'sentiment': str,
                'confidence': float,
                'impactLevel': str,
                'sentimentScores': dict,
                'keywords': list
            }
        """
        # Combine title and content
        full_text = f"{title}. {content}".strip()
        
        # Get sentiment
        sentiment_data = self.classify_sentiment(full_text)
        
        # Get category
        category = self.classify_category(full_text)
        
        # Determine impact
        impact_level = self.determine_impact(category, sentiment_data, credibility)
        
        # Extract keywords (top words from text)
        keywords = self._extract_keywords(full_text)
        
        return {
            'category': category,
            'sentiment': sentiment_data['sentiment'],
            'confidence': sentiment_data['confidence'],
            'impactLevel': impact_level,
            'sentimentScores': sentiment_data['scores'],
            'keywords': keywords
        }
    
    def _extract_keywords(self, text, max_keywords=10):
        """
        Simple keyword extraction
        
        Args:
            text: Input text
            max_keywords: Maximum keywords to extract
            
        Returns:
            list: Extracted keywords
        """
        # Simple extraction - can be enhanced with TF-IDF or other methods
        stopwords = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
                    'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had',
                    'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can'}
        
        words = text.lower().split()
        keywords = [w.strip('.,!?;:') for w in words 
                   if len(w) > 3 and w.lower() not in stopwords]
        
        # Return unique keywords
        seen = set()
        unique_keywords = []
        for kw in keywords:
            if kw not in seen and len(unique_keywords) < max_keywords:
                seen.add(kw)
                unique_keywords.append(kw)
        
        return unique_keywords
