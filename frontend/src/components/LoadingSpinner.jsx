import React from 'react';

/**
 * LoadingSpinner Component
 * 
 * A reusable loading spinner component with customizable size and color.
 * 
 * @param {Object} props - Component props
 * @param {string} props.size - Size of the spinner ('small', 'medium', 'large', or custom CSS size)
 * @param {string} props.color - Color of the spinner (CSS color value)
 * @param {string} props.text - Optional text to display below the spinner
 * @param {boolean} props.fullScreen - Whether to display the spinner in full screen mode
 * @param {string} props.className - Additional CSS classes
 */
const LoadingSpinner = ({ 
  size = 'medium', 
  color = '#4f46e5', // primary-600 color
  text = 'Loading...', 
  fullScreen = false,
  className = ''
}) => {
  // Determine spinner size
  let spinnerSize;
  switch (size) {
    case 'small':
      spinnerSize = 'w-4 h-4';
      break;
    case 'medium':
      spinnerSize = 'w-8 h-8';
      break;
    case 'large':
      spinnerSize = 'w-12 h-12';
      break;
    default:
      // If a custom size is provided (e.g., 'w-16 h-16')
      spinnerSize = size;
  }

  // Full screen container
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
        <div className="text-center">
          <svg
            className={`animate-spin ${spinnerSize} ${className}`}
            style={{ color }}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            data-testid="loading-spinner"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {text && <p className="mt-2 text-gray-600">{text}</p>}
        </div>
      </div>
    );
  }

  // Regular inline spinner
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg
        className={`animate-spin ${spinnerSize}`}
        style={{ color }}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        data-testid="loading-spinner"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      {text && <span className="ml-2 text-gray-600">{text}</span>}
    </div>
  );
};

export default LoadingSpinner;