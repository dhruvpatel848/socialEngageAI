import React, { useState } from 'react';
import { useAnalyticsContext } from '../../contexts/AnalyticsContext';
import Analytics from '../Analytics';
import PredictionResults from '../PredictionResults';

/**
 * Example component demonstrating different ways to use analytics
 */
const AnalyticsExample = () => {
  const [count, setCount] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [predictionData, setPredictionData] = useState({
    likes: 0,
    shares: 0,
    comments: 0,
    engagementLevel: 'Low',
    confidenceScore: 0.75 // Default value for demonstration
  });
  
  // Get analytics methods from context
  const { trackEvent, trackConversion } = useAnalyticsContext();
  
  // Handle button click
  const handleButtonClick = () => {
    setCount(count + 1);
    // Track the button click event
    trackEvent('example_button_click', { count: count + 1 });
  };
  
  // Handle form toggle
  const handleToggleForm = () => {
    setShowForm(!showForm);
    // Track the form toggle event
    trackEvent('example_form_toggle', { action: !showForm ? 'show' : 'hide' });
  };
  
  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Track the form submission as a conversion
    trackConversion('example_form_submit', { 
      name_provided: !!formData.name,
      email_provided: !!formData.email 
    });
    
    // Reset form
    setFormData({ name: '', email: '' });
    setShowForm(false);
    alert('Form submitted!');
  };
  
  // Handle prediction simulation
  const handleSimulatePrediction = () => {
    // Generate random prediction data
    const newPrediction = {
      likes: Math.floor(Math.random() * 100) + 1, // Ensure at least 1 like
      shares: Math.floor(Math.random() * 50) + 1, // Ensure at least 1 share
      comments: Math.floor(Math.random() * 30) + 1, // Ensure at least 1 comment
      engagementLevel: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
      // Always provide a valid confidence score for better user experience
      confidenceScore: parseFloat((Math.random() * 0.5 + 0.5).toFixed(2)) // Between 0.5 and 1.0
    };
    
    setPredictionData(newPrediction);
    
    // Track the prediction creation event
    trackEvent('prediction_simulated', {
      has_confidence_score: true,
      engagement_level: newPrediction.engagementLevel
    });
  };
  
  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
      {/* Page view tracking using Analytics component */}
      <Analytics event="view_example_page" />
      
      <h2 className="text-xl font-bold mb-4">Analytics Example</h2>
      
      <div className="mb-6">
        <p className="mb-2">Button clicked: {count} times</p>
        <button
          onClick={handleButtonClick}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Click Me
        </button>
      </div>
      
      <div className="mb-6">
        <button
          onClick={handleToggleForm}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          {showForm ? 'Hide Form' : 'Show Form'}
        </button>
      </div>
      
      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Track form view when form is shown */}
          <Analytics event="example_form_view" />
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <button
            type="submit"
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Submit
          </button>
        </form>
      )}
      
      {/* Prediction Section */}
      <div className="mt-6 mb-6">
        <h3 className="text-lg font-semibold mb-2">Prediction Simulation</h3>
        <button
          onClick={handleSimulatePrediction}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 mb-4"
        >
          Simulate Prediction
        </button>
        
        {/* Display prediction results */}
        <PredictionResults 
          likes={predictionData.likes}
          shares={predictionData.shares}
          comments={predictionData.comments}
          engagementLevel={predictionData.engagementLevel}
          confidenceScore={predictionData.confidenceScore}
        />
      </div>
      
      <div className="mt-6 text-sm text-gray-500">
        <p>This component demonstrates different ways to use analytics:</p>
        <ul className="list-disc pl-5 mt-2">
          <li>Page view tracking with the Analytics component</li>
          <li>Event tracking with useAnalyticsContext hook</li>
          <li>Conversion tracking for form submissions</li>
          <li>Prediction result display with error handling</li>
        </ul>
      </div>
    </div>
  );
};

export default AnalyticsExample;