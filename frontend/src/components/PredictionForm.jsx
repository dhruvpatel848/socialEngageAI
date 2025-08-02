import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaSpinner, FaChartLine, FaRegClock, FaHashtag } from 'react-icons/fa';

const PredictionForm = () => {
  const [formData, setFormData] = useState({
    post_text: '',
    media_type: 'text',
    hashtags: '',
    followers_count: 0,
    following_count: 0,
    account_age: 0
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [featureImportance, setFeatureImportance] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name.includes('count') || name === 'account_age' ? parseInt(value) || 0 : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      // Process hashtags into a comma-separated string
      const hashtags = formData.hashtags
        ? formData.hashtags.trim()
        : "";
      
      // Add timestamp if not present
      const dataToSend = {
        ...formData,
        hashtags: hashtags,
        timestamp: new Date().toISOString()
      };

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please log in.');
        toast.error('Authentication required');
        setLoading(false);
        return;
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/predict`,
        dataToSend,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'x-auth-token': token
          }
        }
      );

      console.log('Prediction response:', response.data);
      setPrediction(response.data.prediction);
      
      // Format feature importance for display
      const importanceData = Object.entries(response.data.prediction.feature_importance || {})
        .map(([feature, value]) => ({
          feature: feature.replace(/_/g, ' '),
          importance: value
        }))
        .sort((a, b) => b.importance - a.importance);
      
      setFeatureImportance(importanceData);
      toast.success('Prediction generated successfully!');
    } catch (err) {
      console.error('Prediction error:', err);
      setError(err.response?.data?.message || 'Failed to generate prediction. Please try again.');
      toast.error('Failed to generate prediction');
    } finally {
      setLoading(false);
    }
  };

  const getEngagementLevelColor = (level) => {
    const colors = {
      'low': 'bg-yellow-100 text-yellow-800',
      'medium': 'bg-blue-100 text-blue-800',
      'high': 'bg-green-100 text-green-800',
      'viral': 'bg-purple-100 text-purple-800'
    };
    return colors[level?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const formatNumber = (num) => {
    return num ? parseFloat(num).toFixed(1) : '0';
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return 'Not available';
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Predict Post Engagement</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="post_text" className="block text-sm font-medium text-gray-700 mb-1">
            Post Content
          </label>
          <textarea
            id="post_text"
            name="post_text"
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter your post content here..."
            value={formData.post_text}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="media_type" className="block text-sm font-medium text-gray-700 mb-1">
              Media Type
            </label>
            <select
              id="media_type"
              name="media_type"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.media_type}
              onChange={handleChange}
              required
            >
              <option value="text">Text Only</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </div>

          <div>
            <label htmlFor="hashtags" className="block text-sm font-medium text-gray-700 mb-1">
              Hashtags (comma separated)
            </label>
            <input
              type="text"
              id="hashtags"
              name="hashtags"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="travel,nature,photography"
              value={formData.hashtags}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="followers_count" className="block text-sm font-medium text-gray-700 mb-1">
              Followers Count
            </label>
            <input
              type="number"
              id="followers_count"
              name="followers_count"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.followers_count}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="following_count" className="block text-sm font-medium text-gray-700 mb-1">
              Following Count
            </label>
            <input
              type="number"
              id="following_count"
              name="following_count"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.following_count}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="account_age" className="block text-sm font-medium text-gray-700 mb-1">
              Account Age (days)
            </label>
            <input
              type="number"
              id="account_age"
              name="account_age"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.account_age}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin -ml-1 mr-2 h-5 w-5" />
                Predicting...
              </>
            ) : (
              <>Predict Engagement</>
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-6 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {prediction && (
        <div className="mt-8 border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Prediction Results</h3>
          </div>
          
          <div className="px-6 py-4 divide-y divide-gray-200">
            {/* Engagement Metrics */}
            <div className="py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center">
                  <div className="p-2 rounded-md bg-blue-50 text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-500">Predicted Likes</h4>
                    <p className="text-2xl font-semibold text-gray-900">{formatNumber(prediction.likes)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center">
                  <div className="p-2 rounded-md bg-green-50 text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-500">Predicted Shares</h4>
                    <p className="text-2xl font-semibold text-gray-900">{formatNumber(prediction.shares)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center">
                  <div className="p-2 rounded-md bg-purple-50 text-purple-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-500">Predicted Comments</h4>
                    <p className="text-2xl font-semibold text-gray-900">{formatNumber(prediction.comments)}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Engagement Level and Confidence */}
            <div className="py-4">
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Engagement Level:</span>
                  <span className={`ml-2 inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${getEngagementLevelColor(prediction.engagement_level)}`}>
                    {prediction.engagement_level}
                  </span>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500">Confidence Score:</span>
                  <span className="ml-2 text-sm font-medium text-gray-900">
                    {(prediction.confidence_score * 100).toFixed(1)}%
                  </span>
                </div>
                
                {prediction.recommended_post_time && (
                  <div className="flex items-center">
                    <FaRegClock className="text-gray-400 mr-1" />
                    <span className="text-sm font-medium text-gray-500">Recommended Post Time:</span>
                    <span className="ml-2 text-sm font-medium text-gray-900">
                      {formatDateTime(prediction.recommended_post_time)}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Feature Importance */}
            {featureImportance.length > 0 && (
              <div className="py-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <FaChartLine className="mr-2 text-indigo-500" />
                  Feature Importance
                </h4>
                <div className="space-y-2">
                  {featureImportance.slice(0, 5).map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-32 text-xs text-gray-500 truncate">{feature.feature}</div>
                      <div className="flex-1 ml-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full" 
                            style={{ width: `${feature.importance * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="ml-2 text-xs text-gray-500">
                        {(feature.importance * 100).toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictionForm;