import numpy as np
import pandas as pd
import joblib
import os
import logging
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.multioutput import MultiOutputRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import xgboost as xgb
import lightgbm as lgb
import optuna
from datetime import datetime
import shap

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class EngagementModel:
    """Model for predicting social media engagement metrics."""
    
    def __init__(self, model_type='xgboost', model_dir='../models'):
        """Initialize the engagement model.
        
        Args:
            model_type (str): Type of model to use ('random_forest', 'gradient_boosting', 'xgboost', 'lightgbm')
            model_dir (str): Directory to save/load models
        """
        self.model_type = model_type
        self.model_dir = model_dir
        self.model = None
        self.feature_names = None
        self.target_names = ['likes', 'shares', 'comments']
        self.metrics = {}
        self.feature_importance = {}
        self.shap_values = None
        
        # Create model directory if it doesn't exist
        os.makedirs(model_dir, exist_ok=True)
    
    def _create_model(self):
        """Create a new model based on the specified model type."""
        if self.model_type == 'random_forest':
            base_model = RandomForestRegressor(
                n_estimators=100,
                max_depth=10,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=42,
                n_jobs=-1
            )
        elif self.model_type == 'gradient_boosting':
            base_model = GradientBoostingRegressor(
                n_estimators=100,
                max_depth=5,
                learning_rate=0.1,
                random_state=42
            )
        elif self.model_type == 'xgboost':
            base_model = xgb.XGBRegressor(
                n_estimators=100,
                max_depth=5,
                learning_rate=0.1,
                random_state=42,
                n_jobs=-1
            )
        elif self.model_type == 'lightgbm':
            base_model = lgb.LGBMRegressor(
                n_estimators=100,
                max_depth=5,
                learning_rate=0.1,
                random_state=42,
                n_jobs=-1
            )
        else:
            raise ValueError(f"Unsupported model type: {self.model_type}")
        
        # Use MultiOutputRegressor for models that don't natively support multi-output regression
        if self.model_type in ['gradient_boosting', 'random_forest']:
            return MultiOutputRegressor(base_model)
        else:
            return base_model
    
    def train(self, X_train, y_train, X_val=None, y_val=None, optimize=False):
        """Train the engagement prediction model.
        
        Args:
            X_train (DataFrame): Training features
            y_train (DataFrame): Training targets
            X_val (DataFrame, optional): Validation features
            y_val (DataFrame, optional): Validation targets
            optimize (bool): Whether to use hyperparameter optimization
        """
        logger.info(f"Training {self.model_type} model")
        
        # Store feature names
        self.feature_names = X_train.columns.tolist()
        
        # Create and train model
        if optimize and X_val is not None and y_val is not None:
            logger.info("Using hyperparameter optimization")
            self.model = self._optimize_hyperparameters(X_train, y_train, X_val, y_val)
        else:
            self.model = self._create_model()
            self.model.fit(X_train, y_train)
        
        # Calculate training metrics
        y_train_pred = self.model.predict(X_train)
        self._calculate_metrics(y_train, y_train_pred, 'train')
        
        # Calculate validation metrics if validation data is provided
        if X_val is not None and y_val is not None:
            y_val_pred = self.model.predict(X_val)
            self._calculate_metrics(y_val, y_val_pred, 'val')
        
        # Calculate feature importance
        self._calculate_feature_importance(X_train)
        
        logger.info("Model training complete")
        return self
    
    def _optimize_hyperparameters(self, X_train, y_train, X_val, y_val):
        """Optimize hyperparameters using Optuna."""
        def objective(trial):
            # Define hyperparameters to optimize
            if self.model_type == 'random_forest':
                params = {
                    'n_estimators': trial.suggest_int('n_estimators', 50, 300),
                    'max_depth': trial.suggest_int('max_depth', 3, 15),
                    'min_samples_split': trial.suggest_int('min_samples_split', 2, 10),
                    'min_samples_leaf': trial.suggest_int('min_samples_leaf', 1, 5),
                    'random_state': 42,
                    'n_jobs': -1
                }
                model = MultiOutputRegressor(RandomForestRegressor(**params))
            elif self.model_type == 'gradient_boosting':
                params = {
                    'n_estimators': trial.suggest_int('n_estimators', 50, 300),
                    'max_depth': trial.suggest_int('max_depth', 3, 10),
                    'learning_rate': trial.suggest_float('learning_rate', 0.01, 0.3),
                    'random_state': 42
                }
                model = MultiOutputRegressor(GradientBoostingRegressor(**params))
            elif self.model_type == 'xgboost':
                params = {
                    'n_estimators': trial.suggest_int('n_estimators', 50, 300),
                    'max_depth': trial.suggest_int('max_depth', 3, 10),
                    'learning_rate': trial.suggest_float('learning_rate', 0.01, 0.3),
                    'subsample': trial.suggest_float('subsample', 0.6, 1.0),
                    'colsample_bytree': trial.suggest_float('colsample_bytree', 0.6, 1.0),
                    'random_state': 42,
                    'n_jobs': -1
                }
                model = xgb.XGBRegressor(**params)
            elif self.model_type == 'lightgbm':
                params = {
                    'n_estimators': trial.suggest_int('n_estimators', 50, 300),
                    'max_depth': trial.suggest_int('max_depth', 3, 10),
                    'learning_rate': trial.suggest_float('learning_rate', 0.01, 0.3),
                    'num_leaves': trial.suggest_int('num_leaves', 20, 100),
                    'subsample': trial.suggest_float('subsample', 0.6, 1.0),
                    'colsample_bytree': trial.suggest_float('colsample_bytree', 0.6, 1.0),
                    'random_state': 42,
                    'n_jobs': -1
                }
                model = lgb.LGBMRegressor(**params)
            
            # Train model
            model.fit(X_train, y_train)
            
            # Predict on validation set
            y_val_pred = model.predict(X_val)
            
            # Calculate RMSE for each target
            rmse_values = []
            for i, target in enumerate(self.target_names):
                if isinstance(y_val, pd.DataFrame):
                    y_true = y_val[target].values
                else:
                    y_true = y_val[:, i]
                
                if isinstance(y_val_pred, list):
                    y_pred = y_val_pred[i]
                else:
                    y_pred = y_val_pred[:, i]
                
                rmse = np.sqrt(mean_squared_error(y_true, y_pred))
                rmse_values.append(rmse)
            
            # Return mean RMSE across all targets
            return np.mean(rmse_values)
        
        # Create Optuna study
        study = optuna.create_study(direction='minimize')
        study.optimize(objective, n_trials=20)
        
        # Get best parameters
        best_params = study.best_params
        logger.info(f"Best hyperparameters: {best_params}")
        
        # Create model with best parameters
        if self.model_type == 'random_forest':
            best_params.update({'random_state': 42, 'n_jobs': -1})
            model = MultiOutputRegressor(RandomForestRegressor(**best_params))
        elif self.model_type == 'gradient_boosting':
            best_params.update({'random_state': 42})
            model = MultiOutputRegressor(GradientBoostingRegressor(**best_params))
        elif self.model_type == 'xgboost':
            best_params.update({
                'random_state': 42, 
                'n_jobs': -1,
                'enable_categorical': True  # Enable categorical feature support
            })
            model = xgb.XGBRegressor(**best_params)
        elif self.model_type == 'lightgbm':
            best_params.update({'random_state': 42, 'n_jobs': -1})
            model = lgb.LGBMRegressor(**best_params)
        
        # Train model with best parameters
        model.fit(X_train, y_train)
        
        return model
    
    def _calculate_metrics(self, y_true, y_pred, dataset_type):
        """Calculate regression metrics for model evaluation."""
        metrics = {}
        
        # Calculate metrics for each target
        for i, target in enumerate(self.target_names):
            if isinstance(y_true, pd.DataFrame):
                y_true_target = y_true[target].values
            else:
                y_true_target = y_true[:, i]
            
            if isinstance(y_pred, list):
                y_pred_target = y_pred[i]
            else:
                y_pred_target = y_pred[:, i]
            
            # Calculate metrics
            mse = mean_squared_error(y_true_target, y_pred_target)
            rmse = np.sqrt(mse)
            mae = mean_absolute_error(y_true_target, y_pred_target)
            r2 = r2_score(y_true_target, y_pred_target)
            
            metrics[target] = {
                'mse': mse,
                'rmse': rmse,
                'mae': mae,
                'r2': r2
            }
        
        # Calculate average metrics across all targets
        avg_mse = np.mean([metrics[target]['mse'] for target in self.target_names])
        avg_rmse = np.mean([metrics[target]['rmse'] for target in self.target_names])
        avg_mae = np.mean([metrics[target]['mae'] for target in self.target_names])
        avg_r2 = np.mean([metrics[target]['r2'] for target in self.target_names])
        
        metrics['average'] = {
            'mse': avg_mse,
            'rmse': avg_rmse,
            'mae': avg_mae,
            'r2': avg_r2
        }
        
        # Store metrics
        self.metrics[dataset_type] = metrics
        
        # Log metrics
        logger.info(f"{dataset_type.capitalize()} metrics:")
        logger.info(f"  Average RMSE: {avg_rmse:.4f}")
        logger.info(f"  Average MAE: {avg_mae:.4f}")
        logger.info(f"  Average R²: {avg_r2:.4f}")
        
        return metrics
    
    def _calculate_feature_importance(self, X):
        """Calculate feature importance using model-specific methods and SHAP values."""
        # Get feature importance from model
        if self.model_type == 'random_forest':
            # For MultiOutputRegressor, get feature importance from first estimator
            importances = self.model.estimators_[0].feature_importances_
        elif self.model_type == 'gradient_boosting':
            importances = self.model.estimators_[0].feature_importances_
        elif self.model_type == 'xgboost':
            importances = self.model.feature_importances_
        elif self.model_type == 'lightgbm':
            importances = self.model.feature_importances_
        
        # Create feature importance dictionary
        feature_importance = {}
        for i, feature in enumerate(self.feature_names):
            feature_importance[feature] = importances[i]
        
        # Sort by importance
        self.feature_importance = dict(sorted(feature_importance.items(), key=lambda x: x[1], reverse=True))
        
        # Calculate SHAP values (for a sample of data to save computation)
        try:
            sample_size = min(100, X.shape[0])
            X_sample = X.sample(sample_size, random_state=42) if isinstance(X, pd.DataFrame) else X[:sample_size]
            
            if self.model_type == 'xgboost':
                explainer = shap.TreeExplainer(self.model)
                self.shap_values = explainer.shap_values(X_sample)
            elif self.model_type == 'lightgbm':
                explainer = shap.TreeExplainer(self.model)
                self.shap_values = explainer.shap_values(X_sample)
            else:
                # For other models, use KernelExplainer with a sample
                explainer = shap.KernelExplainer(self.model.predict, X_sample)
                self.shap_values = explainer.shap_values(X_sample.iloc[:10] if isinstance(X_sample, pd.DataFrame) else X_sample[:10])
        except Exception as e:
            logger.warning(f"Error calculating SHAP values: {e}")
            self.shap_values = None
    
    def predict(self, X):
        """Make predictions using the trained model."""
        if self.model is None:
            raise ValueError("Model not trained. Call train() first.")
        
        # Handle categorical features for XGBoost
        if self.model_type == 'xgboost':
            # Convert object columns to category type
            for col in X.select_dtypes(include=['object']).columns:
                X[col] = X[col].astype('category')
        
        # Make predictions
        predictions = self.model.predict(X)
        
        # Convert to DataFrame
        if isinstance(predictions, list):
            # For MultiOutputRegressor
            predictions_df = pd.DataFrame()
            for i, target in enumerate(self.target_names):
                predictions_df[target] = predictions[i]
        else:
            # For native multi-output models
            predictions_df = pd.DataFrame(predictions, columns=self.target_names)
        
        # Add engagement level
        total_engagement = predictions_df.sum(axis=1)
        engagement_level = pd.cut(
            total_engagement,
            bins=[0, 50, 200, float('inf')],
            labels=['low', 'medium', 'high']
        )
        predictions_df['engagement_level'] = engagement_level
        
        return predictions_df
    
    def recommend_post_time(self, X, feature_cols=None):
        """Recommend the best time to post based on predicted engagement."""
        # Use self.feature_names if feature_cols is not provided
        if feature_cols is None:
            if self.feature_names is None:
                logger.warning("Cannot recommend post time: feature_names not available")
                return None
            feature_cols = self.feature_names
            
        # Always convert feature_cols to a list to avoid unhashable type error
        try:
            if not isinstance(feature_cols, list):
                feature_cols = list(feature_cols)
        except Exception as e:
            logger.warning(f"Cannot convert feature_cols to list: {e}")
            return None
            
        # Check if required features are present
        if 'hour_of_day' not in feature_cols or 'day_of_week' not in feature_cols:
            logger.warning("Cannot recommend post time: hour_of_day or day_of_week not in features")
            return None
        
        # Get indices of hour and day features
        try:
            hour_idx = feature_cols.index('hour_of_day')
            day_idx = feature_cols.index('day_of_week')
        except (ValueError, AttributeError) as e:
            logger.warning(f"Error finding feature indices: {e}")
            return None
        
        # Create a copy of the features
        try:
            X_copy = X.copy()
        except Exception as e:
            logger.warning(f"Error copying features: {e}")
            return None
        
        # Try different hours and days
        best_engagement = -1
        best_hour = None
        best_day = None
        
        try:
            for day in range(7):  # 0-6 for days of week
                for hour in range(24):  # 0-23 for hours
                    # Update hour and day
                    X_copy[:, hour_idx] = hour
                    X_copy[:, day_idx] = day
                    
                    # Predict engagement
                    predictions = self.model.predict(X_copy)
                    
                    # Calculate total engagement
                    if isinstance(predictions, list):
                        total_engagement = sum(pred[0] for pred in predictions)
                    else:
                        total_engagement = np.sum(predictions[0])
                    
                    # Update best time if better
                    if total_engagement > best_engagement:
                        best_engagement = total_engagement
                        best_hour = hour
                        best_day = day
        except Exception as e:
            logger.warning(f"Error during post time recommendation: {e}")
            return None
        
        # Create datetime for recommended time (using next occurrence of day)
        now = datetime.now()
        days_ahead = (best_day - now.weekday()) % 7
        if days_ahead == 0 and now.hour >= best_hour:
            days_ahead = 7
        
        recommended_date = now.replace(hour=best_hour, minute=0, second=0, microsecond=0) + pd.Timedelta(days=days_ahead)
        
        return recommended_date
    
    def save(self, filename=None):
        """Save the trained model and metadata to disk."""
        if self.model is None:
            raise ValueError("Model not trained. Call train() first.")
        
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{self.model_type}_model_{timestamp}"
        
        # Create full path
        model_path = os.path.join(self.model_dir, f"{filename}.joblib")
        metadata_path = os.path.join(self.model_dir, f"{filename}_metadata.joblib")
        
        # Save model
        joblib.dump(self.model, model_path)
        
        # Save metadata
        metadata = {
            'model_type': self.model_type,
            'feature_names': self.feature_names,
            'target_names': self.target_names,
            'metrics': self.metrics,
            'feature_importance': self.feature_importance,
            'timestamp': datetime.now().isoformat()
        }
        joblib.dump(metadata, metadata_path)
        
        logger.info(f"Model saved to {model_path}")
        logger.info(f"Metadata saved to {metadata_path}")
        
        return model_path, metadata_path
    
    def load(self, filename):
        """Load a trained model and metadata from disk."""
        # Create full paths
        model_path = os.path.join(self.model_dir, f"{filename}.joblib")
        metadata_path = os.path.join(self.model_dir, f"{filename}_metadata.joblib")
        
        # Check if files exist
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found: {model_path}")
        if not os.path.exists(metadata_path):
            raise FileNotFoundError(f"Metadata file not found: {metadata_path}")
        
        # Load model
        self.model = joblib.load(model_path)
        
        # Enable categorical feature support for XGBoost models
        if self.model_type == 'xgboost' and hasattr(self.model, 'get_params') and 'enable_categorical' in self.model.get_params():
            self.model.set_params(enable_categorical=True)
            logger.info("Enabled categorical feature support for XGBoost model")
        
        # Load metadata
        metadata = joblib.load(metadata_path)
        self.model_type = metadata['model_type']
        self.feature_names = metadata['feature_names']
        self.target_names = metadata['target_names']
        self.metrics = metadata['metrics']
        self.feature_importance = metadata['feature_importance']
        
        logger.info(f"Model loaded from {model_path}")
        logger.info(f"Metadata loaded from {metadata_path}")
        
        return self
    
    def get_metrics(self):
        """Get model evaluation metrics."""
        return self.metrics
    
    def get_feature_importance(self, top_n=None):
        """Get feature importance scores."""
        if top_n is not None:
            return dict(list(self.feature_importance.items())[:top_n])
        return self.feature_importance