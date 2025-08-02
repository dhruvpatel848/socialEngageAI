import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { FaChartLine, FaEye, FaTrash, FaEdit, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';

const PredictionHistory = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actualMetrics, setActualMetrics] = useState({
    likes: '',
    shares: '',
    comments: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchPredictions = async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        toast.error('Authentication required');
        setLoading(false);
        return;
      }
      
      const response = await axios.get(
        `${baseUrl}/api/predict/history?page=${page}&limit=10`,
        { headers: { 
          Authorization: `Bearer ${token}`,
          'x-auth-token': token 
        }}
      );

      setPredictions(response.data.predictions);
      setTotalPages(response.data.pagination?.pages || 1);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error fetching prediction history:', err);
      setError('Failed to load prediction history. Please try again.');
      toast.error('Failed to load prediction history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions(1);
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchPredictions(newPage);
    }
  };

  const handleViewDetails = (prediction) => {
    setSelectedPrediction(prediction);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPrediction(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setActualMetrics(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateActuals = async () => {
    if (!selectedPrediction) return;

    // Validate inputs
    const likes = parseInt(actualMetrics.likes);
    const shares = parseInt(actualMetrics.shares);
    const comments = parseInt(actualMetrics.comments);

    if (isNaN(likes) || isNaN(shares) || isNaN(comments) || 
        likes < 0 || shares < 0 || comments < 0) {
      toast.error('Please enter valid positive numbers for all metrics');
      return;
    }

    setIsUpdating(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication required');
        return;
      }
      
      await axios.put(
        `${baseUrl}/api/predict/${selectedPrediction._id}/actual`,
        {
          likes: likes,
          shares: shares,
          comments: comments
        },
        { headers: { 
          Authorization: `Bearer ${token}`,
          'x-auth-token': token 
        }}
      );

      // Update the prediction in the local state
      setPredictions(prevPredictions => 
        prevPredictions.map(pred => 
          pred._id === selectedPrediction._id 
            ? {
                ...pred,
                actual_likes: likes,
                actual_shares: shares,
                actual_comments: comments,
                has_actual_data: true
              }
            : pred
        )
      );

      // Update the selected prediction
      setSelectedPrediction(prev => ({
        ...prev,
        actual_likes: likes,
        actual_shares: shares,
        actual_comments: comments,
        has_actual_data: true
      }));

      toast.success('Actual metrics updated successfully');
      setActualMetrics({ likes: '', shares: '', comments: '' });
    } catch (err) {
      console.error('Error updating actual metrics:', err);
      toast.error('Failed to update actual metrics');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeletePrediction = async (id) => {
    if (!window.confirm('Are you sure you want to delete this prediction?')) return;

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication required');
        return;
      }
      
      await axios.delete(
        `${baseUrl}/api/predict/${id}`,
        { headers: { 
          Authorization: `Bearer ${token}`,
          'x-auth-token': token 
        }}
      );

      // Remove the prediction from the local state
      setPredictions(prevPredictions => 
        prevPredictions.filter(pred => pred._id !== id)
      );

      // Close modal if the deleted prediction is currently selected
      if (selectedPrediction && selectedPrediction._id === id) {
        handleCloseModal();
      }

      toast.success('Prediction deleted successfully');
    } catch (err) {
      console.error('Error deleting prediction:', err);
      toast.error('Failed to delete prediction');
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return 'Invalid date';
    }
  };

  const getAccuracyColor = (predicted, actual) => {
    if (!actual) return 'text-gray-500';
    
    const diff = Math.abs(predicted - actual);
    const percentage = actual > 0 ? diff / actual : 1;
    
    if (percentage <= 0.1) return 'text-green-600'; // Within 10%
    if (percentage <= 0.3) return 'text-yellow-600'; // Within 30%
    return 'text-red-600'; // More than 30% off
  };

  const calculateAccuracy = (predicted, actual) => {
    // Handle edge cases: null, undefined, zero, or NaN values
    if (actual === null || actual === undefined || actual === 0 || 
        predicted === null || predicted === undefined || 
        isNaN(predicted) || isNaN(actual)) {
      return null;
    }
    
    // Convert to numbers to ensure proper calculation
    const predictedNum = Number(predicted);
    const actualNum = Number(actual);
    
    // Additional validation after conversion
    if (isNaN(predictedNum) || isNaN(actualNum) || actualNum === 0) {
      return null;
    }
    
    const diff = Math.abs(predictedNum - actualNum);
    const percentage = (1 - diff / actualNum) * 100;
    
    // Ensure the result is a valid number and not less than 0
    return isNaN(percentage) ? null : Math.max(0, percentage.toFixed(1));
  };

  if (loading && predictions.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error && predictions.length === 0) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
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
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Prediction History</h2>
      
      {predictions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No predictions found. Make a prediction to see your history.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Post Details
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Predicted Engagement
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actual Engagement
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {predictions.map((prediction) => (
                  <tr key={prediction._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {prediction.post_text?.substring(0, 30)}...
                          </div>
                          <div className="text-sm text-gray-500">
                            {prediction.media_type} | {Array.isArray(prediction.hashtags) ? prediction.hashtags.length : (typeof prediction.hashtags === 'string' ? prediction.hashtags.split(',').length : 0)} hashtags
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>Likes: {prediction.predicted_likes?.toFixed(0)}</div>
                        <div>Shares: {prediction.predicted_shares?.toFixed(0)}</div>
                        <div>Comments: {prediction.predicted_comments?.toFixed(0)}</div>
                      </div>
                      <div className="text-sm text-gray-500">
                        Level: <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {prediction.engagement_level}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {prediction.has_actual_data ? (
                        <div className="text-sm">
                          <div className={getAccuracyColor(prediction.predicted_likes, prediction.actual_likes)}>
                            Likes: {prediction.actual_likes} 
                            {calculateAccuracy(prediction.predicted_likes, prediction.actual_likes) !== null && (
                              <span className="ml-1 text-xs">({calculateAccuracy(prediction.predicted_likes, prediction.actual_likes)}% accurate)</span>
                            )}
                          </div>
                          <div className={getAccuracyColor(prediction.predicted_shares, prediction.actual_shares)}>
                            Shares: {prediction.actual_shares}
                            {calculateAccuracy(prediction.predicted_shares, prediction.actual_shares) !== null && (
                              <span className="ml-1 text-xs">({calculateAccuracy(prediction.predicted_shares, prediction.actual_shares)}% accurate)</span>
                            )}
                          </div>
                          <div className={getAccuracyColor(prediction.predicted_comments, prediction.actual_comments)}>
                            Comments: {prediction.actual_comments}
                            {calculateAccuracy(prediction.predicted_comments, prediction.actual_comments) !== null && (
                              <span className="ml-1 text-xs">({calculateAccuracy(prediction.predicted_comments, prediction.actual_comments)}% accurate)</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Not yet recorded</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(prediction.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(prediction)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        <FaEye className="inline mr-1" /> View
                      </button>
                      <button
                        onClick={() => handleDeletePrediction(prediction._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash className="inline mr-1" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6 mt-4">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={i}
                        onClick={() => handlePageChange(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${currentPage === pageNum ? 'bg-indigo-600 text-white' : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Prediction Details Modal */}
      {isModalOpen && selectedPrediction && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 md:mx-auto">
            <div className="flex justify-between items-center p-5 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Prediction Details</h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Post Details */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900">Post Details</h4>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 mb-4">{selectedPrediction.post_text}</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Media Type</p>
                        <p className="font-medium">{selectedPrediction.media_type}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Hashtags</p>
                        <p className="font-medium">
                          {selectedPrediction.hashtags ? (Array.isArray(selectedPrediction.hashtags) ? selectedPrediction.hashtags.join(', ') : selectedPrediction.hashtags) : 'None'}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Followers</p>
                        <p className="font-medium">{selectedPrediction.followers_count || 'N/A'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Following</p>
                        <p className="font-medium">{selectedPrediction.following_count || 'N/A'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Account Age (days)</p>
                        <p className="font-medium">{selectedPrediction.account_age || 'N/A'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Created At</p>
                        <p className="font-medium">{formatDate(selectedPrediction.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Feature Importance */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Feature Importance</h4>
                    <div className="space-y-2">
                      {selectedPrediction.feature_importance && Object.entries(selectedPrediction.feature_importance)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([feature, importance], index) => (
                          <div key={index} className="flex items-center">
                            <div className="w-32 text-xs text-gray-500 truncate">{feature.replace(/_/g, ' ')}</div>
                            <div className="flex-1 ml-2">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-indigo-600 h-2 rounded-full" 
                                  style={{ width: `${importance * 100}%` }}
                                ></div>
                              </div>
                            </div>
                            <div className="ml-2 text-xs text-gray-500">
                              {(importance * 100).toFixed(1)}%
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                </div>
                
                {/* Prediction Results */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900">Prediction Results</h4>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Engagement Level</p>
                        <p className="font-medium">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {selectedPrediction.engagement_level}
                          </span>
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Confidence Score</p>
                        <p className="font-medium">{(selectedPrediction.confidence_score * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <h5 className="text-sm font-medium text-gray-900 mb-3">Predicted vs. Actual Metrics</h5>
                      
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <div className="w-24 text-sm text-gray-500">Likes:</div>
                          <div className="flex-1">
                            <div className="flex items-center">
                              <div className="text-sm font-medium">Predicted: {selectedPrediction.predicted_likes?.toFixed(0) || 0}</div>
                              {selectedPrediction.has_actual_data && (
                                <>
                                  <div className="mx-2 text-gray-400">|</div>
                                  <div className={`text-sm font-medium ${getAccuracyColor(selectedPrediction.predicted_likes, selectedPrediction.actual_likes)}`}>
                                    Actual: {selectedPrediction.actual_likes}
                                    {calculateAccuracy(selectedPrediction.predicted_likes, selectedPrediction.actual_likes) !== null && (
                                      <span className="ml-1 text-xs">({calculateAccuracy(selectedPrediction.predicted_likes, selectedPrediction.actual_likes)}% accurate)</span>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="w-24 text-sm text-gray-500">Shares:</div>
                          <div className="flex-1">
                            <div className="flex items-center">
                              <div className="text-sm font-medium">Predicted: {selectedPrediction.predicted_shares?.toFixed(0) || 0}</div>
                              {selectedPrediction.has_actual_data && (
                                <>
                                  <div className="mx-2 text-gray-400">|</div>
                                  <div className={`text-sm font-medium ${getAccuracyColor(selectedPrediction.predicted_shares, selectedPrediction.actual_shares)}`}>
                                    Actual: {selectedPrediction.actual_shares}
                                    {calculateAccuracy(selectedPrediction.predicted_shares, selectedPrediction.actual_shares) !== null && (
                                      <span className="ml-1 text-xs">({calculateAccuracy(selectedPrediction.predicted_shares, selectedPrediction.actual_shares)}% accurate)</span>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="w-24 text-sm text-gray-500">Comments:</div>
                          <div className="flex-1">
                            <div className="flex items-center">
                              <div className="text-sm font-medium">Predicted: {selectedPrediction.predicted_comments?.toFixed(0) || 0}</div>
                              {selectedPrediction.has_actual_data && (
                                <>
                                  <div className="mx-2 text-gray-400">|</div>
                                  <div className={`text-sm font-medium ${getAccuracyColor(selectedPrediction.predicted_comments, selectedPrediction.actual_comments)}`}>
                                    Actual: {selectedPrediction.actual_comments}
                                    {calculateAccuracy(selectedPrediction.predicted_comments, selectedPrediction.actual_comments) !== null && (
                                      <span className="ml-1 text-xs">({calculateAccuracy(selectedPrediction.predicted_comments, selectedPrediction.actual_comments)}% accurate)</span>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Update Actual Metrics Form */}
                  <div className="border rounded-lg p-4">
                    <h5 className="text-md font-medium text-gray-900 mb-3">Update Actual Metrics</h5>
                    
                    <div className="space-y-3">
                      <div>
                        <label htmlFor="likes" className="block text-sm font-medium text-gray-700 mb-1">
                          Actual Likes
                        </label>
                        <input
                          type="number"
                          id="likes"
                          name="likes"
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          value={actualMetrics.likes}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="shares" className="block text-sm font-medium text-gray-700 mb-1">
                          Actual Shares
                        </label>
                        <input
                          type="number"
                          id="shares"
                          name="shares"
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          value={actualMetrics.shares}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-1">
                          Actual Comments
                        </label>
                        <input
                          type="number"
                          id="comments"
                          name="comments"
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          value={actualMetrics.comments}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <button
                        type="button"
                        onClick={handleUpdateActuals}
                        disabled={isUpdating}
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                      >
                        {isUpdating ? (
                          <>
                            <FaSpinner className="animate-spin -ml-1 mr-2 h-4 w-4" />
                            Updating...
                          </>
                        ) : (
                          <>Update Actual Metrics</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictionHistory;