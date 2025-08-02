import React from 'react';
import PropTypes from 'prop-types';

/**
 * Component to display prediction results with proper error handling
 */
const PredictionResults = ({ likes, shares, comments, engagementLevel, confidenceScore }) => {
  // Format confidence score with error handling
  const formattedConfidenceScore = isNaN(confidenceScore) ? 'N/A' : `${(confidenceScore * 100).toFixed(2)}%`;
  
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-3">Prediction Results</h3>
      
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="p-2 bg-gray-50 rounded">
          <p className="text-sm text-gray-500">Predicted Likes</p>
          <p className="text-xl font-medium">{likes}</p>
        </div>
        
        <div className="p-2 bg-gray-50 rounded">
          <p className="text-sm text-gray-500">Predicted Shares</p>
          <p className="text-xl font-medium">{shares}</p>
        </div>
        
        <div className="p-2 bg-gray-50 rounded">
          <p className="text-sm text-gray-500">Predicted Comments</p>
          <p className="text-xl font-medium">{comments}</p>
        </div>
        
        <div className="p-2 bg-gray-50 rounded">
          <p className="text-sm text-gray-500">Engagement Level</p>
          <p className="text-xl font-medium">{engagementLevel || 'Low'}</p>
        </div>
      </div>
      
      <div className="mt-2 p-3 bg-blue-50 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-blue-700">Confidence Score:</span>
          <span className="text-sm font-bold text-blue-700">{formattedConfidenceScore}</span>
        </div>
        {isNaN(confidenceScore) && (
          <p className="mt-2 text-xs text-blue-600">
            Unable to calculate confidence score. This may be due to insufficient data or model limitations.
          </p>
        )}
      </div>
    </div>
  );
};

PredictionResults.propTypes = {
  likes: PropTypes.number,
  shares: PropTypes.number,
  comments: PropTypes.number,
  engagementLevel: PropTypes.string,
  confidenceScore: PropTypes.number
};

PredictionResults.defaultProps = {
  likes: 0,
  shares: 0,
  comments: 0,
  engagementLevel: 'Low',
  confidenceScore: NaN
};

export default PredictionResults;