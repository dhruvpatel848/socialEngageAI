import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { FaChartLine, FaChartBar, FaChartPie, FaHashtag, FaCalendarAlt, FaClock, FaImage, FaVideo, FaFileAlt } from 'react-icons/fa';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalPosts: 0,
    postsByMediaType: [],
    avgEngagementByMediaType: [],
    postsByDay: [],
    postsByHour: [],
    topHashtags: []
  });
  
  const [modelMetrics, setModelMetrics] = useState({
    performance: null,
    featureImportance: null,
    contentAnalysis: null
  });
  
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('30days');
  
  useEffect(() => {
    fetchData();
    fetchModelMetrics();
  }, [timeRange]);
  
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.warn('No authentication token available for fetching data');
        setError('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }
      
      const headers = { 
        Authorization: `Bearer ${token}`,
        'x-auth-token': token 
      };
      
      // Add timestamp to force cache refresh
      const timestamp = new Date().getTime();
      
      // Fetch data statistics
      const statsResponse = await axios.get(
        `${baseUrl}/api/data/stats?timeRange=${timeRange}&_t=${timestamp}`,
        { headers }
      );
      
      setStats(statsResponse.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
      toast.error('Failed to load dashboard data');
      
      // Only use mock data in development environment
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using mock data in development environment');
        const { mockStats } = await import('../utils/mockData');
        setStats(mockStats);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const fetchModelMetrics = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.warn('No authentication token available for fetching metrics');
        return;
      }
      
      const headers = { 
        Authorization: `Bearer ${token}`,
        'x-auth-token': token 
      };
      
      // Add timestamp to force cache refresh
      const timestamp = new Date().getTime();
      
      // Fetch model performance metrics
      const performanceResponse = await axios.get(
        `${baseUrl}/api/metrics/performance?_t=${timestamp}`,
        { headers }
      );
      
      // Fetch feature importance
      const featureResponse = await axios.get(
        `${baseUrl}/api/metrics/feature-importance?_t=${timestamp}`,
        { headers }
      );
      
      // Fetch content analysis
      const contentResponse = await axios.get(
        `${baseUrl}/api/metrics/content-analysis?_t=${timestamp}`,
        { headers }
      );
      
      setModelMetrics({
        performance: performanceResponse.data,
        featureImportance: featureResponse.data,
        contentAnalysis: contentResponse.data
      });
    } catch (err) {
      console.error('Error fetching model metrics:', err);
      // We don't set the main error state here to avoid blocking the entire dashboard
      toast.error('Failed to load model metrics');
      
      // Only use mock data in development environment
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using mock data in development environment for metrics');
        const { mockModelMetrics } = await import('../utils/mockData');
        setModelMetrics(mockModelMetrics);
      }
    }
  };
  
  // Chart configurations
  const getPostsByMediaTypeChart = () => {
    if (!stats.postsByMediaType || stats.postsByMediaType.length === 0) return null;
    
    const data = {
      labels: stats.postsByMediaType.map(item => item.mediaType),
      datasets: [
        {
          data: stats.postsByMediaType.map(item => item.count),
          backgroundColor: ['#4F46E5', '#10B981', '#F59E0B'],
          borderColor: ['#4338CA', '#059669', '#D97706'],
          borderWidth: 1
        }
      ]
    };
    
    return (
      <div className="bg-white rounded-lg shadow p-5 hover:shadow-md transition-shadow duration-300">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <FaChartPie className="mr-2 text-indigo-500" />
          Posts by Media Type
        </h3>
        <div className="h-64">
          <Doughnut 
            data={data} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom'
                }
              }
            }} 
          />
        </div>
      </div>
    );
  };
  
  const getAvgEngagementByMediaTypeChart = () => {
    if (!stats.avgEngagementByMediaType || stats.avgEngagementByMediaType.length === 0) return null;
    
    const data = {
      labels: stats.avgEngagementByMediaType.map(item => item.mediaType),
      datasets: [
        {
          label: 'Avg. Likes',
          data: stats.avgEngagementByMediaType.map(item => item.avgLikes),
          backgroundColor: '#4F46E5',
        },
        {
          label: 'Avg. Shares',
          data: stats.avgEngagementByMediaType.map(item => item.avgShares),
          backgroundColor: '#10B981',
        },
        {
          label: 'Avg. Comments',
          data: stats.avgEngagementByMediaType.map(item => item.avgComments),
          backgroundColor: '#F59E0B',
        }
      ]
    };
    
    return (
      <div className="bg-white rounded-lg shadow p-5 hover:shadow-md transition-shadow duration-300">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <FaChartBar className="mr-2 text-indigo-500" />
          Average Engagement by Media Type
        </h3>
        <div className="h-64">
          <Bar 
            data={data} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top'
                }
              },
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }} 
          />
        </div>
      </div>
    );
  };
  
  const getPostsByDayChart = () => {
    if (!stats.postsByDay || stats.postsByDay.length === 0) return null;
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const sortedData = days.map(day => {
      const found = stats.postsByDay.find(item => item.day === day);
      return found ? found.count : 0;
    });
    
    const data = {
      labels: days,
      datasets: [
        {
          label: 'Posts',
          data: sortedData,
          backgroundColor: 'rgba(79, 70, 229, 0.2)',
          borderColor: 'rgba(79, 70, 229, 1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }
      ]
    };
    
    return (
      <div className="bg-white rounded-lg shadow p-5 hover:shadow-md transition-shadow duration-300">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <FaCalendarAlt className="mr-2 text-indigo-500" />
          Posts by Day of Week
        </h3>
        <div className="h-64">
          <Line 
            data={data} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    precision: 0
                  }
                }
              }
            }} 
          />
        </div>
      </div>
    );
  };
  
  const getPostsByHourChart = () => {
    if (!stats.postsByHour || stats.postsByHour.length === 0) return null;
    
    // Create an array of all 24 hours
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const sortedData = hours.map(hour => {
      const found = stats.postsByHour.find(item => item.hour === hour);
      return found ? found.count : 0;
    });
    
    const data = {
      labels: hours.map(hour => `${hour}:00`),
      datasets: [
        {
          label: 'Posts',
          data: sortedData,
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }
      ]
    };
    
    return (
      <div className="bg-white rounded-lg shadow p-5 hover:shadow-md transition-shadow duration-300">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <FaClock className="mr-2 text-indigo-500" />
          Posts by Hour of Day
        </h3>
        <div className="h-64">
          <Line 
            data={data} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    precision: 0
                  }
                }
              }
            }} 
          />
        </div>
      </div>
    );
  };
  
  const getTopHashtagsChart = () => {
    if (!stats.topHashtags || stats.topHashtags.length === 0) return null;
    
    const data = {
      labels: stats.topHashtags.map(item => item.hashtag),
      datasets: [
        {
          label: 'Usage Count',
          data: stats.topHashtags.map(item => item.count),
          backgroundColor: [
            '#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
            '#EC4899', '#14B8A6', '#F97316', '#06B6D4', '#6366F1'
          ],
          borderWidth: 1
        }
      ]
    };
    
    return (
      <div className="bg-white rounded-lg shadow p-5 hover:shadow-md transition-shadow duration-300">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <FaHashtag className="mr-2 text-indigo-500" />
          Top Hashtags
        </h3>
        <div className="h-64">
          <Pie 
            data={data} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'right',
                  labels: {
                    boxWidth: 15
                  }
                }
              }
            }} 
          />
        </div>
      </div>
    );
  };
  
  const getFeatureImportanceChart = () => {
    if (!modelMetrics.featureImportance || !modelMetrics.featureImportance.feature_importance) return null;
    
    const featureImportance = modelMetrics.featureImportance.feature_importance;
    const features = Object.keys(featureImportance).slice(0, 10); // Top 10 features
    const importanceValues = features.map(feature => featureImportance[feature]);
    
    const data = {
      labels: features.map(f => f.replace(/_/g, ' ')),
      datasets: [
        {
          label: 'Importance',
          data: importanceValues,
          backgroundColor: 'rgba(79, 70, 229, 0.7)',
          borderColor: 'rgba(79, 70, 229, 1)',
          borderWidth: 1
        }
      ]
    };
    
    return (
      <div className="bg-white rounded-lg shadow p-5 hover:shadow-md transition-shadow duration-300">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <FaChartBar className="mr-2 text-indigo-500" />
          Feature Importance
        </h3>
        <div className="h-64">
          <Bar 
            data={data} 
            options={{
              indexAxis: 'y',
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      return `Importance: ${context.raw}`;
                    }
                  }
                }
              },
              scales: {
                x: {
                  beginAtZero: true
                }
              }
            }} 
          />
        </div>
      </div>
    );
  };
  
  const getModelPerformanceMetrics = () => {
    if (!modelMetrics.performance || !modelMetrics.performance.metrics) return null;
    
    const { metrics } = modelMetrics.performance;
    
    return (
      <div className="bg-white rounded-lg shadow p-5 hover:shadow-md transition-shadow duration-300">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <FaChartLine className="mr-2 text-indigo-500" />
          Model Performance Metrics
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.keys(metrics).map(target => (
            <div key={target} className="border rounded-lg p-4 hover:border-indigo-300 transition-colors duration-300">
              <h4 className="text-md font-medium text-gray-800 mb-2 capitalize">{target}</h4>
              <div className="space-y-2">
                {Object.entries(metrics[target]).map(([metric, value]) => (
                  <div key={metric} className="flex justify-between">
                    <span className="text-sm text-gray-600 capitalize">{metric.replace('_', ' ')}:</span>
                    <span className="text-sm font-medium">
                      {typeof value === 'number' 
                        ? value
                        : typeof value === 'object' 
                          ? (value && !isNaN(Number(value)) 
                              ? Number(value)
                              : typeof value === 'object' && Object.keys(value).length > 0
                                ? Object.entries(value).map(([k, v]) => `${k}: ${v}`).join(', ')
                                : JSON.stringify(value)) 
                          : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  const getContentAnalysisInsights = () => {
    if (!modelMetrics.contentAnalysis) return null;
    
    // Safely destructure with default empty objects to prevent null/undefined errors
    const { 
      sentiment_analysis = {}, 
      text_features = {}, 
      temporal_patterns = {} 
    } = modelMetrics.contentAnalysis || {};
    
    return (
      <div className="bg-white rounded-lg shadow p-5 hover:shadow-md transition-shadow duration-300">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <FaChartLine className="mr-2 text-indigo-500" />
          Content Analysis Insights
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sentiment Analysis */}
          <div className="border rounded-lg p-4 hover:border-indigo-300 transition-colors duration-300">
            <h4 className="text-md font-medium text-gray-800 mb-3">Sentiment Impact</h4>
            <div className="space-y-3">
              {Object.entries(sentiment_analysis).map(([sentiment, data]) => (
                <div key={sentiment} className="border-b pb-2">
                  <p className="text-sm font-medium capitalize mb-1">{sentiment.replace(/_/g, ' ')}:</p>
                  <div className="pl-2">
                    {Object.entries(data).map(([metric, value]) => (
                      <div key={metric} className="flex justify-between text-xs">
                        <span className="text-gray-600 capitalize">{metric.replace('avg_', '')}:</span>
                        <span className="font-medium">
                          {typeof value === 'number' 
                            ? value
                            : typeof value === 'object' 
                              ? (value && !isNaN(Number(value)) 
                                  ? Number(value)
                                  : JSON.stringify(value)) 
                              : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Text Features */}
          <div className="border rounded-lg p-4 hover:border-indigo-300 transition-colors duration-300">
            <h4 className="text-md font-medium text-gray-800 mb-3">Text Features</h4>
            <div className="space-y-3">
              {Object.entries(text_features).map(([feature, data]) => (
                <div key={feature} className="border-b pb-2">
                  <p className="text-sm font-medium capitalize mb-1">{feature.replace(/_/g, ' ')}:</p>
                  <div className="pl-2">
                    {Object.entries(data).map(([metric, value]) => (
                      <div key={metric} className="flex justify-between text-xs">
                        <span className="text-gray-600 capitalize">{metric.replace(/_/g, ' ')}:</span>
                        <span className="font-medium">
                          {typeof value === 'number' 
                            ? value
                            : typeof value === 'object' 
                              ? (value && !isNaN(Number(value)) 
                                  ? Number(value)
                                  : JSON.stringify(value)) 
                              : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Temporal Patterns */}
          <div className="border rounded-lg p-4 hover:border-indigo-300 transition-colors duration-300">
            <h4 className="text-md font-medium text-gray-800 mb-3">Temporal Patterns</h4>
            
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Best Days to Post:</p>
              <div className="space-y-1">
                {(temporal_patterns.best_days || []).map((day, index) => (
                  <div key={index} className="flex justify-between text-xs">
                    <span className="text-gray-600">{day.day}:</span>
                    <span className="font-medium">
                      {typeof day.avg_engagement === 'number' 
                        ? `${day.avg_engagement} avg. engagement` 
                        : typeof day.avg_engagement === 'object' 
                          ? (day.avg_engagement && !isNaN(Number(day.avg_engagement)) 
                              ? `${Number(day.avg_engagement)} avg. engagement` 
                              : JSON.stringify(day.avg_engagement)) 
                          : String(day.avg_engagement)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium mb-2">Best Hours to Post:</p>
              <div className="space-y-1">
                {(temporal_patterns.best_hours || []).map((hour, index) => (
                  <div key={index} className="flex justify-between text-xs">
                    <span className="text-gray-600">{hour.hour}:00:</span>
                    <span className="font-medium">
                      {typeof hour.avg_engagement === 'number' 
                        ? `${hour.avg_engagement} avg. engagement` 
                        : typeof hour.avg_engagement === 'object' 
                          ? (hour.avg_engagement && !isNaN(Number(hour.avg_engagement)) 
                              ? `${Number(hour.avg_engagement)} avg. engagement` 
                              : JSON.stringify(hour.avg_engagement)) 
                          : String(hour.avg_engagement)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderOverviewTab = () => {
    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4 flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
              <FaChartLine className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Posts</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalPosts}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <FaImage className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Image Posts</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.postsByMediaType?.find(item => item.mediaType === 'image')?.count || 0}
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
              <FaVideo className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Video Posts</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.postsByMediaType?.find(item => item.mediaType === 'video')?.count || 0}
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
              <FaFileAlt className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Text Posts</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.postsByMediaType?.find(item => item.mediaType === 'text')?.count || 0}
              </p>
            </div>
          </div>
        </div>
        
        {/* Charts - First Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {getPostsByMediaTypeChart()}
          {getAvgEngagementByMediaTypeChart()}
        </div>
        
        {/* Charts - Second Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {getPostsByDayChart()}
          {getPostsByHourChart()}
        </div>
        
        {/* Top Hashtags */}
        <div className="grid grid-cols-1 gap-6">
          {getTopHashtagsChart()}
        </div>
      </div>
    );
  };
  
  const renderModelInsightsTab = () => {
    return (
      <div className="space-y-6">
        {getModelPerformanceMetrics()}
        {getFeatureImportanceChart()}
        {getContentAnalysisInsights()}
      </div>
    );
  };
  
  if (loading && !stats.totalPosts) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (error && !stats.totalPosts) {
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
    <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h2>
        
        <div className="flex space-x-4">
          <select
            className="bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>
          
          <button
            onClick={fetchData}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Refresh
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            className={`${activeTab === 'overview' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`${activeTab === 'model-insights' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => setActiveTab('model-insights')}
          >
            Model Insights
          </button>
        </nav>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'overview' ? renderOverviewTab() : renderModelInsightsTab()}
    </div>
  );
};

export default Dashboard;