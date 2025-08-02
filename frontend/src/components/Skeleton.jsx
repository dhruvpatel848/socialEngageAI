import React from 'react';

/**
 * Skeleton Component
 * 
 * A reusable skeleton loading component for displaying loading states.
 * 
 * @param {Object} props - Component props
 * @param {string} props.type - Type of skeleton ('text', 'circle', 'rect', 'avatar', 'button', 'card')
 * @param {number} props.width - Width of the skeleton
 * @param {number} props.height - Height of the skeleton
 * @param {string} props.className - Additional CSS classes for the skeleton
 * @param {boolean} props.animated - Whether to animate the skeleton
 * @param {number} props.count - Number of skeleton items to display
 * @param {number} props.gap - Gap between multiple skeleton items
 */
const Skeleton = ({
  type = 'text',
  width,
  height,
  className = '',
  animated = true,
  count = 1,
  gap = 2,
}) => {
  // Base skeleton styles
  const baseClass = 'bg-gray-200 rounded';
  const animationClass = animated ? 'animate-pulse' : '';
  
  // Determine skeleton dimensions and styles based on type
  let skeletonClass = '';
  let skeletonStyle = {};
  
  if (width) skeletonStyle.width = typeof width === 'number' ? `${width}px` : width;
  if (height) skeletonStyle.height = typeof height === 'number' ? `${height}px` : height;
  
  switch (type) {
    case 'circle':
      skeletonClass = 'rounded-full';
      if (!width && !height) {
        skeletonStyle.width = '40px';
        skeletonStyle.height = '40px';
      }
      break;
    case 'avatar':
      skeletonClass = 'rounded-full';
      if (!width && !height) {
        skeletonStyle.width = '48px';
        skeletonStyle.height = '48px';
      }
      break;
    case 'button':
      skeletonClass = 'rounded-md';
      if (!width) skeletonStyle.width = '100px';
      if (!height) skeletonStyle.height = '38px';
      break;
    case 'rect':
      if (!width) skeletonStyle.width = '100%';
      if (!height) skeletonStyle.height = '80px';
      break;
    case 'card':
      skeletonClass = 'rounded-lg';
      if (!width) skeletonStyle.width = '100%';
      if (!height) skeletonStyle.height = '200px';
      break;
    case 'text':
    default:
      if (!width) skeletonStyle.width = '100%';
      if (!height) skeletonStyle.height = '16px';
      break;
  }

  // Create multiple skeleton items if count > 1
  const skeletons = [];
  for (let i = 0; i < count; i++) {
    skeletons.push(
      <div
        key={i}
        className={`${baseClass} ${skeletonClass} ${animationClass} ${className}`}
        style={skeletonStyle}
        aria-hidden="true"
      />
    );
  }

  // Return a single skeleton if count is 1
  if (count === 1) {
    return skeletons[0];
  }

  // Return multiple skeletons with gap
  return (
    <div className={`flex flex-col gap-${gap}`}>
      {skeletons}
    </div>
  );
};

/**
 * Skeleton.Text Component
 * 
 * A specialized skeleton for text with multiple lines.
 * 
 * @param {Object} props - Component props
 * @param {number} props.lines - Number of text lines
 * @param {string} props.lastLineWidth - Width of the last line ('full', '3/4', '1/2', '1/4')
 * @param {boolean} props.animated - Whether to animate the skeleton
 * @param {string} props.className - Additional CSS classes for the skeleton
 */
Skeleton.Text = ({
  lines = 3,
  lastLineWidth = '3/4',
  animated = true,
  className = '',
}) => {
  const animationClass = animated ? 'animate-pulse' : '';
  const textLines = [];
  
  // Map lastLineWidth to percentage
  let lastLineWidthValue;
  switch (lastLineWidth) {
    case 'full':
      lastLineWidthValue = '100%';
      break;
    case '3/4':
      lastLineWidthValue = '75%';
      break;
    case '1/2':
      lastLineWidthValue = '50%';
      break;
    case '1/4':
      lastLineWidthValue = '25%';
      break;
    default:
      lastLineWidthValue = lastLineWidth;
      break;
  }

  // Create text lines
  for (let i = 0; i < lines; i++) {
    const isLastLine = i === lines - 1;
    textLines.push(
      <div
        key={i}
        className={`bg-gray-200 rounded h-4 ${animationClass} ${className}`}
        style={{ width: isLastLine ? lastLineWidthValue : '100%' }}
        aria-hidden="true"
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {textLines}
    </div>
  );
};

/**
 * Skeleton.Card Component
 * 
 * A specialized skeleton for a card with image, title, and text.
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.hasImage - Whether to include an image
 * @param {number} props.imageHeight - Height of the image
 * @param {number} props.lines - Number of text lines
 * @param {boolean} props.hasFooter - Whether to include a footer
 * @param {boolean} props.animated - Whether to animate the skeleton
 * @param {string} props.className - Additional CSS classes for the skeleton
 */
Skeleton.Card = ({
  hasImage = true,
  imageHeight = 200,
  lines = 3,
  hasFooter = false,
  animated = true,
  className = '',
}) => {
  const animationClass = animated ? 'animate-pulse' : '';

  return (
    <div className={`rounded-lg overflow-hidden border border-gray-200 ${className}`}>
      {/* Card Image */}
      {hasImage && (
        <div 
          className={`bg-gray-200 ${animationClass}`} 
          style={{ height: `${imageHeight}px` }}
          aria-hidden="true"
        />
      )}
      
      {/* Card Body */}
      <div className="p-4">
        {/* Title */}
        <div 
          className={`bg-gray-200 rounded h-6 mb-4 ${animationClass}`} 
          style={{ width: '70%' }}
          aria-hidden="true"
        />
        
        {/* Text Lines */}
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <div 
              key={i}
              className={`bg-gray-200 rounded h-4 ${animationClass}`} 
              style={{ width: i === lines - 1 ? '80%' : '100%' }}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
      
      {/* Card Footer */}
      {hasFooter && (
        <div className="border-t border-gray-200 p-4">
          <div className="flex justify-between">
            <div 
              className={`bg-gray-200 rounded h-8 w-20 ${animationClass}`}
              aria-hidden="true"
            />
            <div 
              className={`bg-gray-200 rounded h-8 w-20 ${animationClass}`}
              aria-hidden="true"
            />
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Skeleton.Table Component
 * 
 * A specialized skeleton for a table with rows and columns.
 * 
 * @param {Object} props - Component props
 * @param {number} props.rows - Number of table rows
 * @param {number} props.columns - Number of table columns
 * @param {boolean} props.hasHeader - Whether to include a header
 * @param {boolean} props.animated - Whether to animate the skeleton
 * @param {string} props.className - Additional CSS classes for the skeleton
 */
Skeleton.Table = ({
  rows = 5,
  columns = 4,
  hasHeader = true,
  animated = true,
  className = '',
}) => {
  const animationClass = animated ? 'animate-pulse' : '';

  return (
    <div className={`overflow-hidden ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        {hasHeader && (
          <thead className="bg-gray-50">
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} scope="col" className="px-6 py-3">
                  <div 
                    className={`bg-gray-200 rounded h-4 ${animationClass}`} 
                    style={{ width: `${Math.floor(Math.random() * 50) + 50}%` }}
                    aria-hidden="true"
                  />
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="bg-white divide-y divide-gray-200">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                  <div 
                    className={`bg-gray-200 rounded h-4 ${animationClass}`} 
                    style={{ width: `${Math.floor(Math.random() * 50) + 50}%` }}
                    aria-hidden="true"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Skeleton;