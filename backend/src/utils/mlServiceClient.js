const axios = require('axios');
const logger = require('./logger');
const { ApiError } = require('./errorHandler');

// ML service URL from environment variables
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// Create axios instance for ML service
const mlServiceClient = axios.create({
  baseURL: ML_SERVICE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor for logging
mlServiceClient.interceptors.request.use(
  config => {
    logger.debug(`ML Service Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  error => {
    logger.error(`ML Service Request Error: ${error.message}`);
    return Promise.reject(error);
  }
);

// Response interceptor for logging and error handling
mlServiceClient.interceptors.response.use(
  response => {
    logger.debug(`ML Service Response: ${response.status} ${response.statusText}`);
    return response;
  },
  error => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      logger.error(`ML Service Error: ${error.response.status} ${error.response.statusText}`);
      logger.error(`ML Service Error Data: ${JSON.stringify(error.response.data)}`);
      
      return Promise.reject(
        new ApiError(
          error.response.status,
          error.response.data.message || 'ML Service error',
          true
        )
      );
    } else if (error.request) {
      // The request was made but no response was received
      logger.error(`ML Service No Response: ${error.message}`);
      
      return Promise.reject(
        new ApiError(
          503,
          'ML Service is unavailable',
          true
        )
      );
    } else {
      // Something happened in setting up the request that triggered an Error
      logger.error(`ML Service Setup Error: ${error.message}`);
      
      return Promise.reject(
        new ApiError(
          500,
          'Error setting up ML Service request',
          true
        )
      );
    }
  }
);

/**
 * Make a prediction request to the ML service
 * @param {Object} data - Prediction data
 * @returns {Promise<Object>} - Prediction results
 */
const makePrediction = async (data) => {
  try {
    const response = await mlServiceClient.post('/predict', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get model performance metrics from ML service
 * @returns {Promise<Object>} - Model performance metrics
 */
const getModelPerformance = async () => {
  try {
    const response = await mlServiceClient.get('/metrics/performance');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get feature importance from ML service
 * @returns {Promise<Object>} - Feature importance data
 */
const getFeatureImportance = async () => {
  try {
    const response = await mlServiceClient.get('/metrics/feature-importance');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get content analysis from ML service
 * @returns {Promise<Object>} - Content analysis data
 */
const getContentAnalysis = async () => {
  try {
    const response = await mlServiceClient.get('/metrics/content-analysis');
    return response.data;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  mlServiceClient,
  makePrediction,
  getModelPerformance,
  getFeatureImportance,
  getContentAnalysis
};