import React from 'react';
import Link from 'next/link';
import { FaPlus, FaSearch, FaExclamationTriangle } from 'react-icons/fa';

/**
 * EmptyState Component
 * 
 * A reusable component for displaying empty states when there's no data to show.
 * 
 * @param {Object} props - Component props
 * @param {string} props.type - Type of empty state ('no-data', 'no-results', 'error', or 'custom')
 * @param {string} props.title - Title text for the empty state
 * @param {string} props.message - Message text for the empty state
 * @param {string} props.actionText - Text for the action button
 * @param {string} props.actionLink - Link for the action button
 * @param {function} props.actionHandler - Click handler for the action button
 * @param {React.ReactNode} props.icon - Custom icon component
 * @param {string} props.className - Additional CSS classes
 */
const EmptyState = ({
  type = 'no-data',
  title,
  message,
  actionText,
  actionLink,
  actionHandler,
  icon: CustomIcon,
  className = '',
}) => {
  // Default content based on type
  let defaultTitle = '';
  let defaultMessage = '';
  let defaultActionText = '';
  let defaultActionLink = '';
  let Icon = null;

  switch (type) {
    case 'no-data':
      defaultTitle = 'No data available';
      defaultMessage = 'There is no data to display at this time.';
      defaultActionText = 'Create New';
      defaultActionLink = '#';
      Icon = FaPlus;
      break;
    case 'no-results':
      defaultTitle = 'No results found';
      defaultMessage = 'Try adjusting your search or filters to find what you\'re looking for.';
      defaultActionText = 'Clear Filters';
      defaultActionLink = '#';
      Icon = FaSearch;
      break;
    case 'error':
      defaultTitle = 'Something went wrong';
      defaultMessage = 'An error occurred while loading the data. Please try again later.';
      defaultActionText = 'Try Again';
      defaultActionLink = '#';
      Icon = FaExclamationTriangle;
      break;
    case 'custom':
    default:
      // For custom type, use the provided props
      break;
  }

  // Use provided props or defaults
  const displayTitle = title || defaultTitle;
  const displayMessage = message || defaultMessage;
  const displayActionText = actionText || defaultActionText;
  const displayActionLink = actionLink || defaultActionLink;
  const DisplayIcon = CustomIcon || Icon;

  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      {DisplayIcon && (
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 text-primary-600 mb-4">
          <DisplayIcon className="h-6 w-6" />
        </div>
      )}
      <h3 className="mt-2 text-lg font-medium text-gray-900">{displayTitle}</h3>
      <p className="mt-1 text-sm text-gray-500">{displayMessage}</p>
      {(displayActionText && (displayActionLink || actionHandler)) && (
        <div className="mt-6">
          {actionHandler ? (
            <button
              type="button"
              onClick={actionHandler}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {displayActionText}
            </button>
          ) : (
            <Link href={displayActionLink}>
              <a className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                {displayActionText}
              </a>
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;