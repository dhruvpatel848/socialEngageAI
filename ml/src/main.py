import os
import sys
import pandas as pd
import numpy as np
import joblib
import logging
import traceback
from fastapi import FastAPI, HTTPException, Depends, Body, Query, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any, Union
from datetime import datetime
import uvicorn

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import local modules
from src.preprocessing.data_processor import DataProcessor
from src.features.feature_engineering import FeatureEngineering
from src.models.engagement_model import EngagementModel

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="EngageAI API",
    description="API for predicting social media engagement metrics",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define models for request/response
class PostData(BaseModel):
    post_text: str
    media_type: str
    hashtags: str
    timestamp: Optional[str] = None
    user_id: Optional[str] = None
    followers_count: Optional[int] = 0
    following_count: Optional[int] = 0
    account_age: Optional[int] = 0

class PredictionResponse(BaseModel):
    likes: float
    shares: float
    comments: float
    engagement_level: str
    feature_importance: Dict[str, float]
    confidence_score: float
    recommended_post_time: Optional[str] = None

class ModelPerformanceResponse(BaseModel):
    metrics: Dict[str, Any]
    model_info: Dict[str, Any]

class FeatureImportanceResponse(BaseModel):
    feature_importance: Dict[str, float]
    shap_values: Optional[Dict[str, List[float]]] = None

class ContentAnalysisResponse(BaseModel):
    sentiment_analysis: Dict[str, Any]
    text_features: Dict[str, Any]
    temporal_patterns: Dict[str, Any]

# Global variables for model and processors
data_processor = None
feature_engineering = None
engagement_model = None

# Dependency to get model
async def get_model():
    global data_processor, feature_engineering, engagement_model
    
    if engagement_model is None:
        logger.info("Initializing model and processors")
        
        # Initialize processors
        data_processor = DataProcessor()
        feature_engineering = FeatureEngineering()
        
        # Initialize model
        # Check both possible model directories
        ml_model_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'models')
        parent_model_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'models')
        
        # Use parent directory for models as that's where they're stored
        model_dir = parent_model_dir if os.path.exists(parent_model_dir) else ml_model_dir
        logger.info(f"Using model directory: {model_dir}")
        engagement_model = EngagementModel(model_type='xgboost', model_dir=model_dir)
        
        # Try to load pre-trained model and feature engineering pipeline
        try:
            # Find the latest model file
            model_files = [f for f in os.listdir(model_dir) if f.endswith('.joblib') and not f.endswith('_metadata.joblib')]
            if model_files:
                # Sort by timestamp in filename to get the latest
                model_files.sort(reverse=True)
                latest_model = model_files[0].split('.')[0]
                engagement_model.load(latest_model)
                logger.info(f"Loaded pre-trained model: {latest_model}")
                
                # Find and load the corresponding feature engineering pipeline
                fe_files = [f for f in os.listdir(model_dir) if f.startswith('feature_engineering_')]
                if fe_files:
                    # Sort by timestamp to get the latest
                    fe_files.sort(reverse=True)
                    latest_fe = os.path.join(model_dir, fe_files[0])
                    feature_engineering.load(latest_fe)
                    logger.info(f"Loaded feature engineering pipeline: {latest_fe}")
                else:
                    logger.warning("No feature engineering pipeline found.")
            else:
                logger.warning("No pre-trained model found. Using default model.")
                # In production, you would train a model here or raise an error
        except Exception as e:
            logger.error(f"Error loading model or feature engineering pipeline: {e}")
            # In production, you would handle this error appropriately
    
    return engagement_model, data_processor, feature_engineering

@app.get("/")
async def root():
    return {"message": "Welcome to EngageAI API", "status": "active"}

@app.post("/predict", response_model=PredictionResponse)
async def predict_engagement(
    post_data: PostData,
    model_deps: tuple = Depends(get_model)
):
    engagement_model, data_processor, feature_engineering = model_deps
    
    try:
        # Convert post data to dictionary
        post_dict = post_data.dict()
        
        # Add time-related features
        from datetime import datetime
        current_time = datetime.now()
        post_dict['hour_of_day'] = current_time.hour
        post_dict['day_of_week'] = current_time.weekday()
        post_dict['month'] = current_time.month
        
        # Set default timestamp if not provided
        if not post_dict['timestamp']:
            post_dict['timestamp'] = datetime.now().isoformat()
        
        # Process hashtags - store as string to avoid unhashable type error
        # Keep hashtags as a string, don't convert to list
        post_dict['hashtags'] = post_dict['hashtags'] if post_dict['hashtags'] else ''
        
        # Preprocess data
        processed_data = data_processor.prepare_features_for_prediction(post_dict)
        
        # Ensure all required features are present
        required_features = [
            'followers_count', 'following_count', 'account_age', 'text_length', 'word_count',
            'avg_word_length', 'sentiment_compound', 'sentiment_positive', 'sentiment_negative',
            'sentiment_neutral', 'mention_count', 'url_count', 'exclamation_count',
            'question_count', 'hashtag_count', 'avg_hashtag_length', 'follower_following_ratio',
            'hour_of_day', 'day_of_week', 'month'
        ]
        
        # Add media type features
        media_types = ['image', 'text', 'video']
        for media_type in media_types:
            processed_data[f'media_type_{media_type}'] = 0
        if 'media_type' in processed_data.columns:
            media_type = processed_data['media_type'].iloc[0]
            if media_type in media_types:
                processed_data[f'media_type_{media_type}'] = 1
        
        # Add time category features
        time_categories = ['morning', 'afternoon', 'evening', 'night']
        for category in time_categories:
            processed_data[f'time_category_{category}'] = 0
        hour = processed_data['hour_of_day'].iloc[0] if 'hour_of_day' in processed_data.columns else 0
        if 0 <= hour < 6:
            processed_data['time_category_night'] = 1
        elif 6 <= hour < 12:
            processed_data['time_category_morning'] = 1
        elif 12 <= hour < 18:
            processed_data['time_category_afternoon'] = 1
        else:
            processed_data['time_category_evening'] = 1
        
        # Add weekend feature
        processed_data['is_weekend_0'] = 1 if 'day_of_week' in processed_data.columns and processed_data['day_of_week'].iloc[0] < 5 else 0
        processed_data['is_weekend_1'] = 1 if 'day_of_week' in processed_data.columns and processed_data['day_of_week'].iloc[0] >= 5 else 0
        
        # Fill missing values
        for feature in required_features:
            if feature not in processed_data.columns:
                processed_data[feature] = 0
        
        # Transform features
        if feature_engineering.preprocessor is None:
            # If feature engineering is not fitted, use a simple approach
            logger.warning("Feature engineering pipeline not fitted. Using raw features.")
            features = processed_data.fillna(0)
        else:
            try:
                features = feature_engineering.transform(processed_data)
            except Exception as e:
                logger.error(f"Error transforming features: {e}")
                # Fallback to using raw features
                features = processed_data.fillna(0)
        
        # Make prediction
        # Convert all object/string columns to numeric type to avoid XGBoost categorical error
        for col in features.select_dtypes(include=['object']).columns:
            features[col] = pd.factorize(features[col])[0]
            
        # Convert datetime columns to numeric
        for col in features.select_dtypes(include=['datetime64']).columns:
            features[col] = features[col].astype(np.int64) // 10**9  # Convert to Unix timestamp
            
        # Convert category columns to numeric
        for col in features.select_dtypes(include=['category']).columns:
            features[col] = features[col].cat.codes
            
        # Ensure we only use features that the model was trained with
        if engagement_model.feature_names:
            logger.info(f"Model feature names: {engagement_model.feature_names}")
            # Keep only the features that the model was trained with
            missing_features = [f for f in engagement_model.feature_names if f not in features.columns]
            extra_features = [f for f in features.columns if f not in engagement_model.feature_names]
            
            if missing_features:
                logger.warning(f"Missing features: {missing_features}")
                # Add missing features with default values
                for feature in missing_features:
                    features[feature] = 0
            
            if extra_features:
                logger.warning(f"Extra features that will be dropped: {extra_features}")
            
            # Select only the features that the model was trained with, in the correct order
            features = features[engagement_model.feature_names]
        
        # Log the feature types for debugging
        logger.info(f"Feature types before prediction: {features.dtypes}")
            
        # Make prediction
        predictions = engagement_model.predict(features)
        
        # Get first row of predictions (since we only have one post)
        prediction = predictions.iloc[0]
        
        # Get feature importance
        try:
            feature_importance = engagement_model.get_feature_importance(top_n=10)
            logger.info(f"Feature importance type: {type(feature_importance)}")
        except Exception as e:
            logger.error(f"Error getting feature importance: {e}")
            feature_importance = {}
        
        # Calculate confidence score based on multiple factors
        try:
            # Log input data for debugging
            logger.info(f"Calculating confidence score for post: {post_dict['post_text'][:50]}...")
            logger.info(f"Media type: {post_dict['media_type']}, Hashtags: {post_dict['hashtags']}")
            logger.info(f"Followers: {post_dict['followers_count']}, Following: {post_dict['following_count']}, Account age: {post_dict['account_age']}")
            
            # 1. Base confidence from model metrics (if available)
            if 'val' in engagement_model.metrics and 'average' in engagement_model.metrics['val']:
                base_confidence = max(0.5, min(0.9, engagement_model.metrics['val']['average']['r2']))
            else:
                base_confidence = 0.7  # Default base confidence
            
            logger.info(f"Base confidence from model metrics: {base_confidence}")
            
            # 2. Adjust confidence based on input data quality
            data_quality_score = 1.0
            data_quality_factors = []
            
            # Check text length - very short or very long posts might be less predictable
            text_length = len(post_dict['post_text'])
            logger.info(f"Text length: {text_length} characters")
            if text_length < 10:
                data_quality_score *= 0.9  # Very short text
                data_quality_factors.append(f"Short text ({text_length} chars): 0.9")
            elif text_length > 500:
                data_quality_score *= 0.95  # Very long text
                data_quality_factors.append(f"Long text ({text_length} chars): 0.95")
                
            # Check follower/following ratio - extreme ratios might be less predictable
            if post_dict['followers_count'] > 0 and post_dict['following_count'] > 0:
                ratio = post_dict['followers_count'] / post_dict['following_count']
                logger.info(f"Follower/following ratio: {ratio:.2f}")
                if ratio > 100:
                    data_quality_score *= 0.9  # Unusual high ratio
                    data_quality_factors.append(f"High follower ratio ({ratio:.2f}): 0.9")
                elif ratio < 0.01:
                    data_quality_score *= 0.9  # Unusual low ratio
                    data_quality_factors.append(f"Low follower ratio ({ratio:.2f}): 0.9")
            
            # Check account age - very new accounts might be less predictable
            logger.info(f"Account age: {post_dict['account_age']} days")
            if post_dict['account_age'] < 30:
                data_quality_score *= 0.9  # New account
                data_quality_factors.append(f"New account ({post_dict['account_age']} days): 0.9")
            
            # Check hashtag count - too many hashtags might be less predictable
            hashtag_count = len(post_dict['hashtags'].split(',')) if post_dict['hashtags'] else 0
            logger.info(f"Hashtag count: {hashtag_count}")
            if hashtag_count > 10:
                data_quality_score *= 0.95  # Too many hashtags
                data_quality_factors.append(f"Many hashtags ({hashtag_count}): 0.95")
            
            logger.info(f"Data quality factors: {data_quality_factors}")
            logger.info(f"Data quality adjustment factor: {data_quality_score}")
            
            # 3. Adjust confidence based on prediction values
            prediction_confidence = 1.0
            prediction_factors = []
            
            # Calculate coefficient of variation for predictions
            prediction_values = [prediction['likes'], prediction['shares'], prediction['comments']]
            prediction_mean = np.mean(prediction_values)
            prediction_std = np.std(prediction_values)
            
            logger.info(f"Prediction values - Likes: {prediction['likes']:.2f}, Shares: {prediction['shares']:.2f}, Comments: {prediction['comments']:.2f}")
            logger.info(f"Prediction mean: {prediction_mean:.2f}, std: {prediction_std:.2f}")
            
            if prediction_mean > 0:
                cv = prediction_std / prediction_mean
                logger.info(f"Coefficient of variation: {cv:.2f}")
                # High variance in predictions might indicate lower confidence
                if cv > 1.0:
                    prediction_confidence *= 0.9
                    prediction_factors.append(f"High prediction variance (CV={cv:.2f}): 0.9")
            
            # Very high or very low predictions might be less reliable
            if prediction_mean > 1000:
                prediction_confidence *= 0.9
                prediction_factors.append(f"Very high predictions (mean={prediction_mean:.2f}): 0.9")
            elif prediction_mean < 5:
                prediction_confidence *= 0.9
                prediction_factors.append(f"Very low predictions (mean={prediction_mean:.2f}): 0.9")
            
            logger.info(f"Prediction confidence factors: {prediction_factors}")
            logger.info(f"Prediction confidence adjustment factor: {prediction_confidence}")
            
            # 4. Combine all factors to get final confidence score
            confidence_score = base_confidence * data_quality_score * prediction_confidence
            
            # Ensure confidence is in [0.5, 0.95] range - we're never 100% certain
            confidence_score = max(0.5, min(0.95, confidence_score))
            
            logger.info(f"Final calculated confidence score: {confidence_score}")
            
        except Exception as e:
            logger.error(f"Error calculating confidence score: {e}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            confidence_score = 0.7  # Fallback confidence score
        
        # Try to recommend best post time
        try:
            # Convert features to numpy array for post time recommendation
            features_array = features.values
            logger.info(f"Features array type: {type(features_array)}, shape: {features_array.shape}")
            logger.info(f"Feature names: {engagement_model.feature_names}")
            
            # Try to recommend the best post time
            recommended_time = engagement_model.recommend_post_time(features_array, engagement_model.feature_names)
            if recommended_time:
                recommended_time = recommended_time.isoformat()
            else:
                recommended_time = None
        except Exception as e:
            logger.warning(f"Error recommending post time: {e}")
            recommended_time = None
        
        # Create response
        response = {
            "likes": float(prediction['likes']),
            "shares": float(prediction['shares']),
            "comments": float(prediction['comments']),
            "engagement_level": prediction['engagement_level'],
            "feature_importance": feature_importance,
            "confidence_score": confidence_score,
            "recommended_post_time": recommended_time
        }
        
        return response
    
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.get("/metrics/performance", response_model=ModelPerformanceResponse)
async def get_model_performance(
    model_deps: tuple = Depends(get_model)
):
    engagement_model, _, _ = model_deps
    
    try:
        # Get model metrics
        metrics = engagement_model.get_metrics()
        
        # Round all decimal values to 2 decimal places
        for dataset_type in metrics:
            for target in metrics[dataset_type]:
                for metric_name, metric_value in metrics[dataset_type][target].items():
                    if isinstance(metric_value, (float, int)):
                        metrics[dataset_type][target][metric_name] = round(metric_value, 2)
        
        # Get model info
        model_info = {
            "model_type": engagement_model.model_type,
            "target_names": engagement_model.target_names,
            "feature_count": len(engagement_model.feature_names) if engagement_model.feature_names else 0
        }
        
        return {"metrics": metrics, "model_info": model_info}
    
    except Exception as e:
        logger.error(f"Error getting model performance: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting model performance: {str(e)}")

@app.get("/metrics/feature-importance", response_model=FeatureImportanceResponse)
async def get_feature_importance(
    top_n: int = Query(10, description="Number of top features to return"),
    model_deps: tuple = Depends(get_model)
):
    engagement_model, _, _ = model_deps
    
    try:
        # Get feature importance
        feature_importance = engagement_model.get_feature_importance(top_n=top_n)
        
        # Round feature importance values to 2 decimal places
        feature_importance = {feature: round(float(importance), 2) for feature, importance in feature_importance.items()}
        
        # Get SHAP values if available
        shap_values = None
        if hasattr(engagement_model, 'shap_values') and engagement_model.shap_values is not None:
            # Convert SHAP values to a simpler format for API response
            # This is a simplified version; in production, you might want to return more detailed SHAP information
            shap_values = {}
            for i, feature in enumerate(engagement_model.feature_names[:10]):  # Limit to top 10 features
                if isinstance(engagement_model.shap_values, list):
                    # For multi-output models
                    values = engagement_model.shap_values[0][:, i].tolist()
                    shap_values[feature] = [round(float(val), 2) for val in values]
                else:
                    # For single-output models
                    values = engagement_model.shap_values[:, i].tolist()
                    shap_values[feature] = [round(float(val), 2) for val in values]
        
        return {"feature_importance": feature_importance, "shap_values": shap_values}
    
    except Exception as e:
        logger.error(f"Error getting feature importance: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting feature importance: {str(e)}")

@app.get("/metrics/content-analysis", response_model=ContentAnalysisResponse)
async def get_content_analysis(model_deps: tuple = Depends(get_model)):
    engagement_model, data_processor, _ = model_deps
    
    try:
        # We don't need sample data for this example since we're using hardcoded values
        # Perform content analysis
        # This is a simplified example; in a real application, you would perform more sophisticated analysis
        
        # 1. Sentiment Analysis
        sentiment_analysis = {
            "positive_posts": 35,  # Percentage of positive posts
            "negative_posts": 15,  # Percentage of negative posts
            "neutral_posts": 50,   # Percentage of neutral posts
            "positive_posts_engagement": {
                "avg_likes": float(round(120.5, 2)),
                "avg_shares": float(round(45.2, 2)),
                "avg_comments": float(round(30.8, 2))
            },
            "negative_posts_engagement": {
                "avg_likes": float(round(80.3, 2)),
                "avg_shares": float(round(25.1, 2)),
                "avg_comments": float(round(40.6, 2))
            },
            "neutral_posts_engagement": {
                "avg_likes": float(round(95.7, 2)),
                "avg_shares": float(round(35.4, 2)),
                "avg_comments": float(round(25.2, 2))
            }
        }
        
        # 2. Text Features Analysis
        text_features = {
            "avg_post_length": float(round(150.5, 2)),  # Average number of characters
            "avg_hashtags": float(round(2.3, 2)),       # Average number of hashtags per post
            "popular_hashtags": ["#marketing", "#socialmedia", "#digital", "#business", "#branding"],
            "optimal_post_length": {
                "range": "100-200 characters",
                "avg_engagement": float(round(110.5, 2))
            }
        }
        
        # 3. Temporal Patterns
        temporal_patterns = {
            "best_days": [
                {"day": "Wednesday", "avg_engagement": float(round(125.7, 2))},
                {"day": "Thursday", "avg_engagement": float(round(118.3, 2))},
                {"day": "Tuesday", "avg_engagement": float(round(105.9, 2))}
            ],
            "best_hours": [
                {"hour": "12-2 PM", "avg_engagement": float(round(130.2, 2))},
                {"hour": "5-7 PM", "avg_engagement": float(round(125.8, 2))},
                {"hour": "8-10 AM", "avg_engagement": float(round(115.4, 2))}
            ],
            "worst_days": ["Saturday", "Sunday"],
            "worst_hours": ["11 PM - 6 AM"]
        }
        
        # 4. Content Type Analysis
        content_type_analysis = {
            "image_posts": {
                "percentage": 45,
                "avg_engagement": float(round(115.3, 2))
            },
            "video_posts": {
                "percentage": 30,
                "avg_engagement": float(round(145.7, 2))
            },
            "text_only_posts": {
                "percentage": 25,
                "avg_engagement": float(round(85.2, 2))
            },
            "url_containing_posts": {
                "percentage": 40,
                "engagement_decrease": "10%"
            }
        }
        
        return {
            "sentiment_analysis": sentiment_analysis,
            "text_features": text_features,
            "temporal_patterns": temporal_patterns,
            "content_type_analysis": content_type_analysis
        }
    
    except Exception as e:
        logger.error(f"Error performing content analysis: {e}")
        raise HTTPException(status_code=500, detail=f"Error performing content analysis: {str(e)}")

# Run the application
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)