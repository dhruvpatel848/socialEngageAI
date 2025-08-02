import React from 'react';

/**
 * Badge Component
 * 
 * A reusable badge/tag component for displaying status, categories, or labels.
 * 
 * @param {Object} props - Component props
 * @param {string|React.ReactNode} props.children - The badge content
 * @param {string} props.variant - Badge variant ('primary', 'success', 'warning', 'error', 'info', 'default')
 * @param {string} props.size - Badge size ('sm', 'md', 'lg')
 * @param {boolean} props.rounded - Whether the badge has fully rounded corners
 * @param {boolean} props.outline - Whether the badge has an outline style
 * @param {function} props.onClick - Click handler for the badge
 * @param {string} props.className - Additional CSS classes
 */
const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  rounded = false,
  outline = false,
  onClick,
  className = '',
}) => {
  // Determine badge styles based on variant
  let variantStyles = '';
  
  if (outline) {
    // Outline styles
    switch (variant) {
      case 'primary':
        variantStyles = 'bg-white text-primary-700 border border-primary-300';
        break;
      case 'success':
        variantStyles = 'bg-white text-green-700 border border-green-300';
        break;
      case 'warning':
        variantStyles = 'bg-white text-yellow-700 border border-yellow-300';
        break;
      case 'error':
        variantStyles = 'bg-white text-red-700 border border-red-300';
        break;
      case 'info':
        variantStyles = 'bg-white text-blue-700 border border-blue-300';
        break;
      default:
        variantStyles = 'bg-white text-gray-700 border border-gray-300';
        break;
    }
  } else {
    // Filled styles
    switch (variant) {
      case 'primary':
        variantStyles = 'bg-primary-100 text-primary-800';
        break;
      case 'success':
        variantStyles = 'bg-green-100 text-green-800';
        break;
      case 'warning':
        variantStyles = 'bg-yellow-100 text-yellow-800';
        break;
      case 'error':
        variantStyles = 'bg-red-100 text-red-800';
        break;
      case 'info':
        variantStyles = 'bg-blue-100 text-blue-800';
        break;
      default:
        variantStyles = 'bg-gray-100 text-gray-800';
        break;
    }
  }

  // Determine size styles
  let sizeStyles = '';
  switch (size) {
    case 'sm':
      sizeStyles = 'text-xs px-2 py-0.5';
      break;
    case 'lg':
      sizeStyles = 'text-sm px-3 py-1';
      break;
    case 'md':
    default:
      sizeStyles = 'text-xs px-2.5 py-0.5';
      break;
  }

  // Determine border radius
  const borderRadius = rounded ? 'rounded-full' : 'rounded';

  // Determine if badge is clickable
  const isClickable = typeof onClick === 'function';
  const clickableStyles = isClickable ? 'cursor-pointer hover:opacity-80' : '';

  return (
    <span
      className={`inline-flex items-center ${sizeStyles} ${variantStyles} ${borderRadius} ${clickableStyles} ${className}`}
      onClick={isClickable ? onClick : undefined}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      {children}
    </span>
  );
};

export default Badge;