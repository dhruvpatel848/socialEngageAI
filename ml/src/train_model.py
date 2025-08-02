import os
import sys
import pandas as pd
import numpy as np
import joblib
import logging
import argparse
from datetime import datetime
from sklearn.model_selection import train_test_split

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import local modules
from preprocessing.data_processor import DataProcessor
from features.feature_engineering import FeatureEngineering
from models.engagement_model import EngagementModel

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def train_model(data_path, model_type='xgboost', optimize=False, n_trials=50, test_size=0.2, random_state=42):
    """
    Train an engagement prediction model using the specified data and model type.
    
    Args:
        data_path (str): Path to the CSV data file
        model_type (str): Type of model to train ('random_forest', 'gradient_boosting', 'xgboost', 'lightgbm')
        optimize (bool): Whether to perform hyperparameter optimization
        n_trials (int): Number of optimization trials if optimize=True
        test_size (float): Proportion of data to use for testing
        random_state (int): Random seed for reproducibility
    
    Returns:
        tuple: Trained model and evaluation metrics
    """
    logger.info(f"Starting model training with {model_type} model")
    
    # Initialize data processor
    data_processor = DataProcessor()
    
    # Load and preprocess data
    logger.info(f"Loading data from {data_path}")
    try:
        data = data_processor.load_data(data_path)
    except Exception as e:
        logger.error(f"Error loading data: {e}")
        raise
    
    # Process data
    logger.info("Preprocessing data")
    processed_data = data_processor.preprocess(data)
    
    # Split data into features and targets
    target_columns = ['likes', 'shares', 'comments']
    feature_columns = [col for col in processed_data.columns if col not in target_columns]
    
    X = processed_data[feature_columns]
    y = processed_data[target_columns]
    
    # Split data into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, random_state=random_state)
    
    logger.info(f"Training data shape: {X_train.shape}, Testing data shape: {X_test.shape}")
    
    # Initialize feature engineering
    feature_engineering = FeatureEngineering()
    
    # Fit and transform features
    logger.info("Engineering features")
    X_train_transformed = feature_engineering.fit_transform(X_train)
    X_test_transformed = feature_engineering.transform(X_test)
    
    # Initialize model
    model_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'models')
    os.makedirs(model_dir, exist_ok=True)
    
    engagement_model = EngagementModel(
        model_type=model_type,
        model_dir=model_dir,
        target_names=target_columns,
        feature_names=feature_engineering.get_feature_names()
    )
    
    # Train model
    logger.info(f"Training {model_type} model{' with hyperparameter optimization' if optimize else ''}")
    if optimize:
        engagement_model.train_with_optimization(X_train_transformed, y_train, n_trials=n_trials)
    else:
        engagement_model.train(X_train_transformed, y_train)
    
    # Evaluate model
    logger.info("Evaluating model")
    metrics = engagement_model.evaluate(X_test_transformed, y_test)
    
    # Calculate feature importance
    logger.info("Calculating feature importance")
    feature_importance = engagement_model.get_feature_importance()
    
    # Try to calculate SHAP values
    try:
        logger.info("Calculating SHAP values")
        engagement_model.calculate_shap_values(X_test_transformed)
    except Exception as e:
        logger.warning(f"Could not calculate SHAP values: {e}")
    
    # Save model and feature engineering
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    model_name = f"{model_type}_{timestamp}"
    
    logger.info(f"Saving model as {model_name}")
    engagement_model.save(model_name)
    
    # Save feature engineering
    feature_engineering_path = os.path.join(model_dir, f"{model_name}_feature_engineering.joblib")
    joblib.dump(feature_engineering, feature_engineering_path)
    logger.info(f"Saved feature engineering to {feature_engineering_path}")
    
    return engagement_model, metrics

def main():
    parser = argparse.ArgumentParser(description='Train an engagement prediction model')
    parser.add_argument('--data', type=str, required=True, help='Path to the CSV data file')
    parser.add_argument('--model', type=str, default='xgboost', 
                        choices=['random_forest', 'gradient_boosting', 'xgboost', 'lightgbm'],
                        help='Type of model to train')
    parser.add_argument('--optimize', action='store_true', help='Perform hyperparameter optimization')
    parser.add_argument('--trials', type=int, default=50, help='Number of optimization trials')
    parser.add_argument('--test-size', type=float, default=0.2, help='Proportion of data to use for testing')
    parser.add_argument('--random-state', type=int, default=42, help='Random seed for reproducibility')
    
    args = parser.parse_args()
    
    try:
        model, metrics = train_model(
            data_path=args.data,
            model_type=args.model,
            optimize=args.optimize,
            n_trials=args.trials,
            test_size=args.test_size,
            random_state=args.random_state
        )
        
        # Print metrics
        print("\nModel Training Complete!")
        print("==========================")
        print("Evaluation Metrics:")
        for target, target_metrics in metrics.items():
            print(f"\n{target.upper()}:")
            for metric_name, metric_value in target_metrics.items():
                print(f"  {metric_name}: {metric_value:.4f}")
        
        # Print feature importance
        print("\nTop 10 Feature Importance:")
        feature_importance = model.get_feature_importance(top_n=10)
        for feature, importance in feature_importance.items():
            print(f"  {feature}: {importance:.4f}")
        
    except Exception as e:
        logger.error(f"Error in model training: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()