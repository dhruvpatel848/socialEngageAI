import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa';

/**
 * Alert Component
 * 
 * A reusable alert component for displaying notifications, warnings, errors, and success messages.
 * 
 * @param {Object} props - Component props
 * @param {string} props.type - Type of alert ('success', 'error', 'warning', 'info')
 * @param {string} props.title - Title of the alert
 * @param {string|React.ReactNode} props.message - Message content of the alert
 * @param {boolean} props.dismissible - Whether the alert can be dismissed
 * @param {number} props.autoClose - Auto close timeout in milliseconds (0 to disable)
 * @param {function} props.onClose - Callback function when alert is closed
 * @param {string} props.className - Additional CSS classes
 */
const Alert = ({
  type = 'info',
  title,
  message,
  dismissible = true,
  autoClose = 0,
  onClose,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(true);

  // Auto close effect
  useEffect(() => {
    if (autoClose > 0 && isVisible) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoClose);

      return () => clearTimeout(timer);
    }
  }, [autoClose, isVisible]);

  // Handle close
  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  if (!isVisible) return null;

  // Alert styles based on type
  let alertStyles = '';
  let Icon = null;

  switch (type) {
    case 'success':
      alertStyles = 'bg-green-50 border-green-400 text-green-800';
      Icon = FaCheckCircle;
      break;
    case 'error':
      alertStyles = 'bg-red-50 border-red-400 text-red-800';
      Icon = FaExclamationCircle;
      break;
    case 'warning':
      alertStyles = 'bg-yellow-50 border-yellow-400 text-yellow-800';
      Icon = FaExclamationTriangle;
      break;
    case 'info':
    default:
      alertStyles = 'bg-blue-50 border-blue-400 text-blue-800';
      Icon = FaInfoCircle;
      break;
  }

  return (
    <div className={`border-l-4 p-4 rounded-md ${alertStyles} ${className}`} role="alert">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon className="h-5 w-5" />
        </div>
        <div className="ml-3 flex-1">
          {title && <h3 className="text-sm font-medium">{title}</h3>}
          <div className={`text-sm ${title ? 'mt-2' : ''}`}>
            {typeof message === 'string' ? <p>{message}</p> : message}
          </div>
        </div>
        {dismissible && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={handleClose}
                className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${type === 'success' ? 'text-green-500 hover:bg-green-100 focus:ring-green-600' : type === 'error' ? 'text-red-500 hover:bg-red-100 focus:ring-red-600' : type === 'warning' ? 'text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-600' : 'text-blue-500 hover:bg-blue-100 focus:ring-blue-600'}`}
              >
                <span className="sr-only">Dismiss</span>
                <FaTimes className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;