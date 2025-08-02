import React from 'react';
import { FaChevronLeft, FaChevronRight, FaEllipsisH } from 'react-icons/fa';

/**
 * Pagination Component
 * 
 * A reusable pagination component for navigating through multiple pages of content.
 * 
 * @param {Object} props - Component props
 * @param {number} props.currentPage - Current active page (1-based)
 * @param {number} props.totalPages - Total number of pages
 * @param {function} props.onPageChange - Callback when page changes
 * @param {number} props.siblingCount - Number of sibling pages to show on each side of current page
 * @param {boolean} props.showFirstLast - Whether to show first/last page buttons
 * @param {string} props.size - Size of pagination ('sm', 'md', 'lg')
 * @param {string} props.className - Additional CSS classes
 */
const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  siblingCount = 1,
  showFirstLast = true,
  size = 'md',
  className = '',
}) => {
  // Ensure current page is within valid range
  const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages));

  // Handle page change
  const handlePageChange = (page) => {
    if (page !== validCurrentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    
    // Always show first page
    pageNumbers.push(1);
    
    // Calculate range of pages to show around current page
    const leftSibling = Math.max(2, validCurrentPage - siblingCount);
    const rightSibling = Math.min(totalPages - 1, validCurrentPage + siblingCount);
    
    // Add ellipsis if needed before current page range
    if (leftSibling > 2) {
      pageNumbers.push('ellipsis-left');
    }
    
    // Add pages in the middle
    for (let i = leftSibling; i <= rightSibling; i++) {
      if (i !== 1 && i !== totalPages) {
        pageNumbers.push(i);
      }
    }
    
    // Add ellipsis if needed after current page range
    if (rightSibling < totalPages - 1) {
      pageNumbers.push('ellipsis-right');
    }
    
    // Always show last page if there is more than one page
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  // Determine size styles
  let sizeStyles = '';
  switch (size) {
    case 'sm':
      sizeStyles = 'h-8 w-8 text-sm';
      break;
    case 'lg':
      sizeStyles = 'h-12 w-12 text-base';
      break;
    case 'md':
    default:
      sizeStyles = 'h-10 w-10 text-sm';
      break;
  }

  // If only one page, don't render pagination
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className={`flex items-center justify-center ${className}`} aria-label="Pagination">
      <ul className="flex items-center -space-x-px">
        {/* Previous Page Button */}
        <li>
          <button
            onClick={() => handlePageChange(validCurrentPage - 1)}
            disabled={validCurrentPage === 1}
            className={`${sizeStyles} flex items-center justify-center rounded-l-md border border-gray-300 ${validCurrentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            aria-label="Previous page"
          >
            <span className="sr-only">Previous</span>
            <FaChevronLeft className="h-3 w-3" />
          </button>
        </li>

        {/* Page Numbers */}
        {getPageNumbers().map((pageNumber, index) => {
          // Render ellipsis
          if (typeof pageNumber === 'string' && pageNumber.includes('ellipsis')) {
            return (
              <li key={pageNumber}>
                <span className={`${sizeStyles} flex items-center justify-center border border-gray-300 bg-white text-gray-500`}>
                  <FaEllipsisH className="h-3 w-3" />
                </span>
              </li>
            );
          }

          // Render page number
          return (
            <li key={pageNumber}>
              <button
                onClick={() => handlePageChange(pageNumber)}
                className={`${sizeStyles} flex items-center justify-center border border-gray-300 ${pageNumber === validCurrentPage ? 'z-10 bg-primary-50 border-primary-500 text-primary-600' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                aria-current={pageNumber === validCurrentPage ? 'page' : undefined}
                aria-label={`Page ${pageNumber}`}
              >
                {pageNumber}
              </button>
            </li>
          );
        })}

        {/* Next Page Button */}
        <li>
          <button
            onClick={() => handlePageChange(validCurrentPage + 1)}
            disabled={validCurrentPage === totalPages}
            className={`${sizeStyles} flex items-center justify-center rounded-r-md border border-gray-300 ${validCurrentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            aria-label="Next page"
          >
            <span className="sr-only">Next</span>
            <FaChevronRight className="h-3 w-3" />
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;