#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
EngageAI Model Training Pipeline

This script runs the complete model training pipeline:
1. Load and preprocess data
2. Engineer features
3. Train and evaluate models
4. Save the best model

Usage:
    python run_training_pipeline.py --data_path=../data/sample_data.csv --model_type=xgboost
"""

import os
import sys
import argparse
import logging
import pandas as pd
import numpy as np
from datetime import datetime

# Add the parent directory to the path so we can import the modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.preprocessing.data_processor import DataProcessor
from src.features.feature_engineering import FeatureEngineering
from src.models.engagement_model import EngagementModel

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
                                         'logs', f'training_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'))
    ]
)

logger = logging.getLogger(__name__)

# Ensure logs directory exists
os.makedirs(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'logs'), exist_ok=True)

def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description='Run the EngageAI model training pipeline')
    
    parser.add_argument('--data_path', type=str, required=True,
                        help='Path to the input data CSV file')
    parser.add_argument('--model_type', type=str, default='xgboost',
                        choices=['xgboost', 'lightgbm', 'random_forest', 'gradient_boosting'],
                        help='Type of model to train')
    parser.add_argument('--target', type=str, default='engagement',
                        choices=['likes', 'shares', 'comments', 'engagement'],
                        help='Target variable to predict')
    parser.add_argument('--test_size', type=float, default=0.2,
                        help='Proportion of data to use for testing')
    parser.add_argument('--optimize', action='store_true',
                        help='Whether to perform hyperparameter optimization')
    parser.add_argument('--n_trials', type=int, default=100,
                        help='Number of trials for hyperparameter optimization')
    parser.add_argument('--output_dir', type=str, 
                        default=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'models'),
                        help='Directory to save the trained model')
    
    return parser.parse_args()

def run_pipeline(args):
    """Run the complete model training pipeline."""
    logger.info("Starting the EngageAI model training pipeline")
    logger.info(f"Arguments: {args}")
    
    # Step 1: Load and preprocess data
    logger.info("Step 1: Loading and preprocessing data")
    data_processor = DataProcessor()
    df = data_processor.load_data(args.data_path)
    
    logger.info(f"Loaded data with {df.shape[0]} rows and {df.shape[1]} columns")
    
    # Preprocess data (this will handle missing values and extract all features)
    df = data_processor.preprocess(df)
    
    logger.info(f"After feature extraction: {df.shape[0]} rows and {df.shape[1]} columns")
    
    # If target is 'engagement', create a composite score
    if args.target == 'engagement':
        logger.info("Creating composite engagement score")
        # Normalize and combine likes, shares, and comments
        df['likes_norm'] = df['likes'] / df['likes'].max()
        df['shares_norm'] = df['shares'] / df['shares'].max()
        df['comments_norm'] = df['comments'] / df['comments'].max()
        
        # Weighted sum (can adjust weights based on business priorities)
        df['engagement'] = (0.4 * df['likes_norm'] + 
                           0.4 * df['shares_norm'] + 
                           0.2 * df['comments_norm'])
        
        # Scale to a more intuitive range (0-100)
        df['engagement'] = df['engagement'] * 100
        
        target = 'engagement'
    else:
        target = args.target
    
    # Split data
    X_train, X_test, y_train, y_test = data_processor.split_data(
        df, test_size=args.test_size
    )
    
    logger.info(f"Training set: {X_train.shape[0]} samples, Test set: {X_test.shape[0]} samples")
    
    # Step 2: Feature engineering
    logger.info("Step 2: Engineering features")
    feature_engineering = FeatureEngineering()
    
    # Identify feature types
    numerical_features = X_train.select_dtypes(include=['int64', 'float64']).columns.tolist()
    categorical_features = X_train.select_dtypes(include=['object', 'category']).columns.tolist()
    text_features = ['post_text'] if 'post_text' in X_train.columns else []
    
    # Remove non-feature columns
    for col in ['post_id', 'user_id', 'timestamp']:
        if col in numerical_features:
            numerical_features.remove(col)
        if col in categorical_features:
            categorical_features.remove(col)
    
    # Fit feature engineering pipeline
    feature_engineering.fit(X_train)
    
    # Transform data
    X_train_transformed = feature_engineering.transform(X_train)
    X_test_transformed = feature_engineering.transform(X_test)
    
    feature_names = feature_engineering.get_feature_names()
    logger.info(f"Transformed features: {len(feature_names)} features")
    
    # Step 3: Train and evaluate model
    logger.info(f"Step 3: Training {args.model_type} model")
    model = EngagementModel(model_type=args.model_type)
    
    if args.optimize:
        logger.info(f"Performing hyperparameter optimization with {args.n_trials} trials")
        model.train_with_optimization(
            X_train_transformed, y_train,
            n_trials=args.n_trials
        )
    else:
        model.train(X_train_transformed, y_train)
    
    # Make predictions on test set
    y_pred = model.predict(X_test_transformed)
    
    # Get model metrics
    metrics = model.get_metrics()
    logger.info(f"Model evaluation metrics: {metrics}")
    
    # Get feature importance
    importance = model.get_feature_importance(top_n=10)
    logger.info("Top 10 important features:")
    for feature, score in sorted(importance.items(), key=lambda x: x[1], reverse=True)[:10]:
        logger.info(f"{feature}: {score:.4f}")
    
    # Step 4: Save model and metadata
    logger.info("Step 4: Saving model and metadata")
    os.makedirs(args.output_dir, exist_ok=True)
    
    # Create a timestamp for the model version
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    model_filename = f"{args.model_type}_{args.target}_{timestamp}"
    
    # Save the model
    model_path, metadata_path = model.save(model_filename)
    logger.info(f"Model saved to {model_path}")
    
    # Save feature engineering pipeline
    fe_filename = f"feature_engineering_{timestamp}.pkl"
    fe_path = os.path.join(args.output_dir, fe_filename)
    feature_engineering.save(fe_path)
    logger.info(f"Feature engineering pipeline saved to {fe_path}")
    
    # Save model metadata
    # Convert numpy types to Python native types for JSON serialization
    def convert_to_serializable(obj):
        if isinstance(obj, (np.integer, np.int64, np.int32)):
            return int(obj)
        elif isinstance(obj, (np.floating, np.float64, np.float32)):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        elif isinstance(obj, dict):
            return {k: convert_to_serializable(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [convert_to_serializable(i) for i in obj]
        else:
            return obj
    
    # Convert metrics and feature importance to serializable format
    serializable_metrics = convert_to_serializable(metrics)
    serializable_importance = convert_to_serializable(importance)
    
    metadata = {
        'model_type': args.model_type,
        'target': args.target,
        'timestamp': timestamp,
        'metrics': serializable_metrics,
        'feature_importance': serializable_importance,
        'model_path': model_path,
        'feature_engineering_path': fe_path,
        'feature_names': feature_names
    }
    
    metadata_filename = f"additional_metadata_{timestamp}.json"
    metadata_path = os.path.join(args.output_dir, metadata_filename)
    
    import json
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    
    logger.info(f"Model metadata saved to {metadata_path}")
    logger.info("Training pipeline completed successfully")
    
    return {
        'model': model,
        'feature_engineering': feature_engineering,
        'metrics': metrics,
        'importance': importance,
        'model_path': model_path,
        'feature_engineering_path': fe_path,
        'metadata_path': metadata_path
    }

def main():
    """Main function to run the pipeline."""
    args = parse_args()
    try:
        results = run_pipeline(args)
        logger.info(f"Model trained successfully with {args.model_type}")
        if 'train' in results['metrics']:
            avg_metrics = results['metrics']['train']['average']
            logger.info(f"Training Metrics: RMSE={avg_metrics['rmse']:.4f}, R²={avg_metrics['r2']:.4f}")
        if 'val' in results['metrics']:
            avg_metrics = results['metrics']['val']['average']
            logger.info(f"Validation Metrics: RMSE={avg_metrics['rmse']:.4f}, R²={avg_metrics['r2']:.4f}")
        return 0
    except Exception as e:
        logger.error(f"Error in training pipeline: {e}", exc_info=True)
        return 1

if __name__ == "__main__":
    sys.exit(main())