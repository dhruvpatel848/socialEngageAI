import pandas as pd
import numpy as np
import re
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Download NLTK resources
try:
    nltk.download('vader_lexicon', quiet=True)
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True)
except Exception as e:
    logger.warning(f"NLTK download error: {e}")

class DataProcessor:
    """Class for preprocessing social media data for ML model training and prediction."""
    
    def __init__(self):
        self.sia = SentimentIntensityAnalyzer()
        
    def load_data(self, file_path):
        """Load data from CSV file."""
        try:
            df = pd.read_csv(file_path)
            logger.info(f"Loaded data from {file_path} with {len(df)} rows")
            return df
        except Exception as e:
            logger.error(f"Error loading data: {e}")
            raise
    
    def preprocess(self, df):
        """Preprocess the data for model training."""
        logger.info("Starting data preprocessing")
        
        # Make a copy to avoid modifying the original dataframe
        processed_df = df.copy()
        
        # Convert timestamp to datetime
        if 'timestamp' in processed_df.columns:
            processed_df['timestamp'] = pd.to_datetime(processed_df['timestamp'])
        
        # Extract temporal features
        processed_df = self._extract_temporal_features(processed_df)
        
        # Extract text features
        processed_df = self._extract_text_features(processed_df)
        
        # Extract hashtag features
        processed_df = self._extract_hashtag_features(processed_df)
        
        # Extract user features
        processed_df = self._extract_user_features(processed_df)
        
        # Handle missing values
        processed_df = self._handle_missing_values(processed_df)
        
        logger.info(f"Preprocessing complete. Processed dataframe shape: {processed_df.shape}")
        return processed_df
    
    def _extract_temporal_features(self, df):
        """Extract temporal features from timestamp."""
        if 'timestamp' not in df.columns:
            logger.warning("No timestamp column found for temporal feature extraction")
            return df
        
        # Extract hour of day
        df['hour_of_day'] = df['timestamp'].dt.hour
        
        # Extract day of week (0=Monday, 6=Sunday)
        df['day_of_week'] = df['timestamp'].dt.dayofweek
        
        # Extract month
        df['month'] = df['timestamp'].dt.month
        
        # Extract is_weekend
        df['is_weekend'] = df['day_of_week'].apply(lambda x: 1 if x >= 5 else 0)
        
        # Extract time of day category
        def get_time_category(hour):
            if 5 <= hour < 12:
                return 'morning'
            elif 12 <= hour < 17:
                return 'afternoon'
            elif 17 <= hour < 21:
                return 'evening'
            else:
                return 'night'
        
        df['time_category'] = df['hour_of_day'].apply(get_time_category)
        
        return df
    
    def _extract_text_features(self, df):
        """Extract features from post text."""
        if 'post_text' not in df.columns:
            logger.warning("No post_text column found for text feature extraction")
            return df
        
        # Calculate text length
        df['text_length'] = df['post_text'].fillna('').apply(len)
        
        # Calculate word count
        df['word_count'] = df['post_text'].fillna('').apply(lambda x: len(x.split()))
        
        # Calculate average word length
        df['avg_word_length'] = df['post_text'].fillna('').apply(
            lambda x: np.mean([len(word) for word in x.split()]) if len(x.split()) > 0 else 0
        )
        
        # Calculate sentiment scores
        df['sentiment_compound'] = df['post_text'].fillna('').apply(
            lambda x: self.sia.polarity_scores(x)['compound']
        )
        df['sentiment_positive'] = df['post_text'].fillna('').apply(
            lambda x: self.sia.polarity_scores(x)['pos']
        )
        df['sentiment_negative'] = df['post_text'].fillna('').apply(
            lambda x: self.sia.polarity_scores(x)['neg']
        )
        df['sentiment_neutral'] = df['post_text'].fillna('').apply(
            lambda x: self.sia.polarity_scores(x)['neu']
        )
        
        # Count mentions
        df['mention_count'] = df['post_text'].fillna('').apply(
            lambda x: len(re.findall(r'@\w+', x))
        )
        
        # Count URLs
        df['url_count'] = df['post_text'].fillna('').apply(
            lambda x: len(re.findall(r'https?://\S+|www\.\S+', x))
        )
        
        # Count exclamation marks
        df['exclamation_count'] = df['post_text'].fillna('').apply(
            lambda x: x.count('!')
        )
        
        # Count question marks
        df['question_count'] = df['post_text'].fillna('').apply(
            lambda x: x.count('?')
        )
        
        return df
    
    def _extract_hashtag_features(self, df):
        """Extract features from hashtags."""
        if 'hashtags' not in df.columns:
            logger.warning("No hashtags column found for hashtag feature extraction")
            return df
        
        # Process hashtags as a string
        # Count hashtags (number of comma-separated values)
        df['hashtag_count'] = df['hashtags'].apply(
            lambda x: len(x.split(',')) if isinstance(x, str) and x else 0
        )
        
        # Calculate average hashtag length
        df['avg_hashtag_length'] = df['hashtags'].apply(
            lambda x: np.mean([len(tag.strip()) for tag in x.split(',')]) if isinstance(x, str) and x else 0
        )
        
        return df
    
    def _extract_user_features(self, df):
        """Extract features from user data."""
        # Calculate followers to following ratio
        if 'followers_count' in df.columns and 'following_count' in df.columns:
            df['follower_following_ratio'] = df.apply(
                lambda row: row['followers_count'] / max(row['following_count'], 1), axis=1
            )
        
        return df
    
    def _handle_missing_values(self, df):
        """Handle missing values in the dataframe."""
        # Fill missing numerical values with 0
        numerical_cols = df.select_dtypes(include=['int64', 'float64']).columns
        df[numerical_cols] = df[numerical_cols].fillna(0)
        
        # Fill missing categorical values with 'unknown'
        categorical_cols = df.select_dtypes(include=['object']).columns
        df[categorical_cols] = df[categorical_cols].fillna('unknown')
        
        return df
    
    def prepare_features_for_prediction(self, post_data):
        """Prepare features for a single post prediction."""
        # Convert post_data to DataFrame
        if isinstance(post_data, dict):
            df = pd.DataFrame([post_data])
        else:
            df = pd.DataFrame(post_data)
        
        # Preprocess the data
        processed_df = self.preprocess(df)
        
        return processed_df
    
    def split_data(self, df, test_size=0.2, random_state=42):
        """Split data into training and testing sets."""
        from sklearn.model_selection import train_test_split
        
        # Define target variables
        target_cols = ['likes', 'shares', 'comments']
        
        # Check if all target columns exist
        missing_targets = [col for col in target_cols if col not in df.columns]
        if missing_targets:
            logger.error(f"Missing target columns: {missing_targets}")
            raise ValueError(f"Missing target columns: {missing_targets}")
        
        # Define feature columns (all columns except targets and non-feature columns)
        non_feature_cols = target_cols + ['post_id', 'timestamp', 'post_text', 'hashtags']
        feature_cols = [col for col in df.columns if col not in non_feature_cols]
        
        # Split the data
        X = df[feature_cols]
        y = df[target_cols]
        
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=random_state
        )
        
        logger.info(f"Data split complete. Training set: {X_train.shape}, Test set: {X_test.shape}")
        
        return X_train, X_test, y_train, y_test