import React from 'react';

/**
 * ProgressBar Component
 * 
 * A reusable progress bar component for displaying progress.
 * 
 * @param {Object} props - Component props
 * @param {number} props.value - Current progress value (0-100)
 * @param {number} props.max - Maximum progress value
 * @param {string} props.label - Label for the progress bar
 * @param {string} props.size - Size of the progress bar ('xs', 'sm', 'md', 'lg')
 * @param {string} props.color - Color of the progress bar
 * @param {boolean} props.showValue - Whether to show the progress value
 * @param {string} props.valuePosition - Position of the progress value ('inside', 'outside')
 * @param {boolean} props.striped - Whether to show stripes on the progress bar
 * @param {boolean} props.animated - Whether to animate the stripes
 * @param {string} props.className - Additional CSS classes for the progress bar
 */
const ProgressBar = ({
  value = 0,
  max = 100,
  label,
  size = 'md',
  color = 'primary',
  showValue = false,
  valuePosition = 'outside',
  striped = false,
  animated = false,
  className = '',
}) => {
  // Calculate percentage
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100);
  
  // Determine height based on size
  let heightClass = '';
  switch (size) {
    case 'xs':
      heightClass = 'h-1';
      break;
    case 'sm':
      heightClass = 'h-2';
      break;
    case 'lg':
      heightClass = 'h-6';
      break;
    case 'md':
    default:
      heightClass = 'h-4';
      break;
  }

  // Determine color
  let colorClass = '';
  switch (color) {
    case 'primary':
      colorClass = 'bg-primary-600';
      break;
    case 'secondary':
      colorClass = 'bg-secondary-600';
      break;
    case 'success':
      colorClass = 'bg-green-600';
      break;
    case 'danger':
      colorClass = 'bg-red-600';
      break;
    case 'warning':
      colorClass = 'bg-yellow-500';
      break;
    case 'info':
      colorClass = 'bg-blue-500';
      break;
    default:
      colorClass = 'bg-primary-600';
      break;
  }

  // Striped and animated classes
  const stripedClass = striped ? 'bg-stripes bg-stripes-white' : '';
  const animatedClass = animated && striped ? 'animate-progress-stripes' : '';

  return (
    <div className={`${className}`}>
      {/* Label and value (if outside) */}
      {(label || (showValue && valuePosition === 'outside')) && (
        <div className="flex justify-between mb-1">
          {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
          {showValue && valuePosition === 'outside' && (
            <span className="text-sm font-medium text-gray-700">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      
      {/* Progress bar */}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${heightClass}`}>
        <div
          className={`${colorClass} ${stripedClass} ${animatedClass} rounded-full transition-all duration-300 ease-in-out`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin="0"
          aria-valuemax={max}
        >
          {/* Value (if inside) */}
          {showValue && valuePosition === 'inside' && size !== 'xs' && size !== 'sm' && (
            <span className="text-xs font-medium text-white px-2 py-0.5">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Add custom styles for striped and animated progress bars
const styles = `
  @keyframes progress-stripes {
    from { background-position: 1rem 0; }
    to { background-position: 0 0; }
  }
  
  .bg-stripes {
    background-image: linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.15) 25%,
      transparent 25%,
      transparent 50%,
      rgba(255, 255, 255, 0.15) 50%,
      rgba(255, 255, 255, 0.15) 75%,
      transparent 75%,
      transparent
    );
    background-size: 1rem 1rem;
  }
  
  .animate-progress-stripes {
    animation: progress-stripes 1s linear infinite;
  }
`;

// Add styles to document head
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

export default ProgressBar;