import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class FeatureEngineering:
    """Class for feature engineering and transformation."""
    
    def __init__(self):
        self.preprocessor = None
        self.tfidf_vectorizer = None
        self.numerical_features = [
            'followers_count', 'following_count', 'account_age',
            'text_length', 'word_count', 'avg_word_length',
            'sentiment_compound', 'sentiment_positive', 'sentiment_negative', 'sentiment_neutral',
            'mention_count', 'url_count', 'exclamation_count', 'question_count',
            'hashtag_count', 'avg_hashtag_length', 'follower_following_ratio',
            'hour_of_day', 'day_of_week', 'month'
        ]
        self.categorical_features = ['media_type', 'time_category', 'is_weekend']
        self.text_feature = 'post_text'
    
    def fit(self, df):
        """Fit the feature engineering pipeline to the data."""
        logger.info("Fitting feature engineering pipeline")
        
        # Check which features are available in the dataframe
        available_numerical = [f for f in self.numerical_features if f in df.columns]
        available_categorical = [f for f in self.categorical_features if f in df.columns]
        
        logger.info(f"Available numerical features: {available_numerical}")
        logger.info(f"Available categorical features: {available_categorical}")
        
        # Create preprocessing steps for numerical and categorical features
        numerical_transformer = Pipeline(steps=[
            ('scaler', StandardScaler())
        ])
        
        categorical_transformer = Pipeline(steps=[
            ('onehot', OneHotEncoder(handle_unknown='ignore'))
        ])
        
        # Create column transformer
        preprocessor_steps = []
        
        if available_numerical:
            preprocessor_steps.append(('num', numerical_transformer, available_numerical))
        
        if available_categorical:
            preprocessor_steps.append(('cat', categorical_transformer, available_categorical))
        
        self.preprocessor = ColumnTransformer(
            transformers=preprocessor_steps,
            remainder='drop'
        )
        
        # Fit the preprocessor
        self.preprocessor.fit(df)
        
        # Fit TF-IDF vectorizer if text feature is available
        if self.text_feature in df.columns:
            logger.info(f"Fitting TF-IDF vectorizer on {self.text_feature}")
            self.tfidf_vectorizer = TfidfVectorizer(
                max_features=100,
                min_df=2,
                max_df=0.8,
                stop_words='english'
            )
            self.tfidf_vectorizer.fit(df[self.text_feature].fillna(''))
        
        logger.info("Feature engineering pipeline fitted successfully")
        return self
    
    def transform(self, df):
        """Transform the data using the fitted feature engineering pipeline."""
        logger.info("Transforming data with feature engineering pipeline")
        
        # Transform numerical and categorical features
        if self.preprocessor is not None:
            transformed_features = self.preprocessor.transform(df)
            feature_names = self._get_feature_names()
        else:
            logger.warning("Preprocessor not fitted. Returning empty feature set.")
            return pd.DataFrame()
        
        # Convert to DataFrame
        transformed_df = pd.DataFrame(
            transformed_features,
            columns=feature_names
        )
        
        # Transform text feature if available
        if self.tfidf_vectorizer is not None and self.text_feature in df.columns:
            logger.info(f"Transforming {self.text_feature} with TF-IDF vectorizer")
            text_features = self.tfidf_vectorizer.transform(df[self.text_feature].fillna(''))
            text_feature_names = [f'tfidf_{f}' for f in self.tfidf_vectorizer.get_feature_names_out()]
            
            # Convert sparse matrix to DataFrame
            text_df = pd.DataFrame(
                text_features.toarray(),
                columns=text_feature_names
            )
            
            # Concatenate with other features
            transformed_df = pd.concat([transformed_df, text_df], axis=1)
        
        logger.info(f"Data transformation complete. Transformed shape: {transformed_df.shape}")
        return transformed_df
    
    def fit_transform(self, df):
        """Fit and transform the data in one step."""
        self.fit(df)
        return self.transform(df)
    
    def _get_feature_names(self):
        """Get feature names from the column transformer."""
        if self.preprocessor is None:
            return []
        
        # Get feature names for each transformer
        feature_names = []
        
        for name, trans, cols in self.preprocessor.transformers_:
            if name == 'num':
                # For numerical features, keep original names
                feature_names.extend(cols)
            elif name == 'cat':
                # For categorical features, get one-hot encoded names
                ohe = trans.named_steps['onehot']
                for i, col in enumerate(cols):
                    feature_names.extend([f"{col}_{cat}" for cat in ohe.categories_[i]])
        
        return feature_names
    
    def get_feature_names(self):
        """Get all feature names including TF-IDF features."""
        # Get preprocessor feature names
        feature_names = self._get_feature_names()
        
        # Add TF-IDF feature names if available
        if self.tfidf_vectorizer is not None:
            tfidf_names = [f'tfidf_{f}' for f in self.tfidf_vectorizer.get_feature_names_out()]
            feature_names.extend(tfidf_names)
        
        return feature_names
        
    def save(self, filepath):
        """Save the feature engineering pipeline to disk."""
        import joblib
        joblib.dump({
            'preprocessor': self.preprocessor,
            'tfidf_vectorizer': self.tfidf_vectorizer,
            'numerical_features': self.numerical_features,
            'categorical_features': self.categorical_features,
            'text_feature': self.text_feature
        }, filepath)
        logger.info(f"Feature engineering pipeline saved to {filepath}")
        
    def load(self, filepath):
        """Load the feature engineering pipeline from disk."""
        import joblib
        try:
            data = joblib.load(filepath)
            if isinstance(data, dict):
                self.preprocessor = data['preprocessor']
                self.tfidf_vectorizer = data['tfidf_vectorizer']
                self.numerical_features = data['numerical_features']
                self.categorical_features = data['categorical_features']
                self.text_feature = data['text_feature']
            else:
                # Handle the case where the saved object is the entire class instance
                self.preprocessor = data.preprocessor
                self.tfidf_vectorizer = data.tfidf_vectorizer
                self.numerical_features = data.numerical_features
                self.categorical_features = data.categorical_features
                self.text_feature = data.text_feature
            logger.info(f"Feature engineering pipeline loaded from {filepath}")
            return True
        except Exception as e:
            logger.error(f"Error loading feature engineering pipeline: {e}")
            return False
        return filepath