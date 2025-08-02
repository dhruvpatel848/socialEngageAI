import React from 'react';
import { Switch } from '@headlessui/react';

/**
 * Toggle Component
 * 
 * A reusable toggle switch component for boolean inputs.
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.enabled - Whether the toggle is enabled
 * @param {function} props.onChange - Function to call when toggle is changed
 * @param {string} props.label - Label for the toggle
 * @param {string} props.description - Description for the toggle
 * @param {string} props.size - Size of the toggle ('sm', 'md', 'lg')
 * @param {string} props.color - Color of the toggle when enabled
 * @param {boolean} props.disabled - Whether the toggle is disabled
 * @param {string} props.className - Additional CSS classes for the toggle
 */
const Toggle = ({
  enabled,
  onChange,
  label,
  description,
  size = 'md',
  color = 'primary',
  disabled = false,
  className = '',
}) => {
  // Determine toggle size
  let toggleSize = '';
  let circleSize = '';
  let translateX = '';
  
  switch (size) {
    case 'sm':
      toggleSize = 'h-4 w-8';
      circleSize = 'h-3 w-3';
      translateX = 'translate-x-4';
      break;
    case 'lg':
      toggleSize = 'h-7 w-14';
      circleSize = 'h-6 w-6';
      translateX = 'translate-x-7';
      break;
    case 'md':
    default:
      toggleSize = 'h-6 w-11';
      circleSize = 'h-5 w-5';
      translateX = 'translate-x-5';
      break;
  }

  // Determine toggle color
  let toggleColor = '';
  switch (color) {
    case 'primary':
      toggleColor = 'bg-primary-600';
      break;
    case 'secondary':
      toggleColor = 'bg-secondary-600';
      break;
    case 'success':
      toggleColor = 'bg-green-600';
      break;
    case 'danger':
      toggleColor = 'bg-red-600';
      break;
    case 'warning':
      toggleColor = 'bg-yellow-500';
      break;
    case 'info':
      toggleColor = 'bg-blue-500';
      break;
    default:
      toggleColor = 'bg-primary-600';
      break;
  }

  return (
    <div className={`flex items-center ${className}`}>
      <Switch
        checked={enabled}
        onChange={onChange}
        disabled={disabled}
        className={`${enabled ? toggleColor : 'bg-gray-200'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          relative inline-flex flex-shrink-0 ${toggleSize} border-2 border-transparent rounded-full
          transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${color === 'primary' ? 'primary' : color}-500`}
      >
        <span className="sr-only">{label}</span>
        <span
          aria-hidden="true"
          className={`${enabled ? translateX : 'translate-x-0'}
            pointer-events-none inline-block ${circleSize} rounded-full bg-white shadow
            transform ring-0 transition ease-in-out duration-200`}
        />
      </Switch>
      {(label || description) && (
        <div className="ml-3">
          {label && (
            <span className={`text-sm font-medium text-gray-900 ${disabled ? 'opacity-50' : ''}`}>
              {label}
            </span>
          )}
          {description && (
            <p className={`text-sm text-gray-500 ${disabled ? 'opacity-50' : ''}`}>
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Toggle;