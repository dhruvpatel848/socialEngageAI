import React from 'react';

/**
 * Card Component
 * 
 * A reusable card component for displaying content in a consistent container.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The card content
 * @param {string} props.title - Card title
 * @param {React.ReactNode} props.titleAction - Action element to display in the title area
 * @param {React.ReactNode} props.footer - Footer content
 * @param {boolean} props.noPadding - Whether to remove padding from the card body
 * @param {string} props.className - Additional CSS classes for the card
 * @param {string} props.bodyClassName - Additional CSS classes for the card body
 * @param {string} props.titleClassName - Additional CSS classes for the card title
 * @param {string} props.footerClassName - Additional CSS classes for the card footer
 * @param {function} props.onClick - Click handler for the card
 */
const Card = ({
  children,
  title,
  titleAction,
  footer,
  noPadding = false,
  className = '',
  bodyClassName = '',
  titleClassName = '',
  footerClassName = '',
  onClick,
  ...rest
}) => {
  // Determine if card is clickable
  const isClickable = typeof onClick === 'function';
  const clickableStyles = isClickable ? 'cursor-pointer transition-shadow hover:shadow-md' : '';

  return (
    <div
      className={`bg-white rounded-lg shadow overflow-hidden ${clickableStyles} ${className}`}
      onClick={isClickable ? onClick : undefined}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      {...rest}
    >
      {/* Card Title */}
      {(title || titleAction) && (
        <div className={`px-4 py-5 sm:px-6 border-b border-gray-200 ${titleClassName}`}>
          <div className="flex items-center justify-between">
            {title && (
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {title}
              </h3>
            )}
            {titleAction && (
              <div className="ml-4">
                {titleAction}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Card Body */}
      <div className={`${noPadding ? '' : 'px-4 py-5 sm:p-6'} ${bodyClassName}`}>
        {children}
      </div>

      {/* Card Footer */}
      {footer && (
        <div className={`px-4 py-4 sm:px-6 bg-gray-50 border-t border-gray-200 ${footerClassName}`}>
          {footer}
        </div>
      )}
    </div>
  );
};

/**
 * Card.Grid Component
 * 
 * A grid layout for displaying multiple cards with consistent spacing.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The cards to display in the grid
 * @param {number} props.columns - Number of columns (1-6)
 * @param {string} props.className - Additional CSS classes
 */
Card.Grid = ({ children, columns = 3, className = '' }) => {
  // Determine grid columns based on the columns prop
  let gridCols = '';
  switch (columns) {
    case 1:
      gridCols = 'grid-cols-1';
      break;
    case 2:
      gridCols = 'grid-cols-1 sm:grid-cols-2';
      break;
    case 3:
      gridCols = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      break;
    case 4:
      gridCols = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
      break;
    case 5:
      gridCols = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5';
      break;
    case 6:
      gridCols = 'grid-cols-1 sm:grid-cols-3 lg:grid-cols-6';
      break;
    default:
      gridCols = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      break;
  }

  return (
    <div className={`grid ${gridCols} gap-4 sm:gap-6 ${className}`}>
      {children}
    </div>
  );
};

export default Card;