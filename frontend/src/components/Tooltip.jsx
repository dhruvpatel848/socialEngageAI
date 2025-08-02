import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Tooltip Component
 * 
 * A reusable tooltip component that can be attached to any element.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The element to attach the tooltip to
 * @param {string|React.ReactNode} props.content - The tooltip content
 * @param {string} props.position - Position of the tooltip ('top', 'right', 'bottom', 'left')
 * @param {string} props.className - Additional CSS classes for the tooltip
 * @param {number} props.delay - Delay before showing the tooltip in milliseconds
 * @param {boolean} props.disabled - Whether the tooltip is disabled
 */
const Tooltip = ({
  children,
  content,
  position = 'top',
  className = '',
  delay = 300,
  disabled = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const targetRef = useRef(null);
  const tooltipRef = useRef(null);
  const timeoutRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);

  // Handle client-side rendering for portals
  useEffect(() => {
    setIsMounted(true);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const calculatePosition = () => {
    if (!targetRef.current || !tooltipRef.current) return;

    const targetRect = targetRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = targetRect.top + scrollTop - tooltipRect.height - 8;
        left = targetRect.left + scrollLeft + (targetRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'right':
        top = targetRect.top + scrollTop + (targetRect.height / 2) - (tooltipRect.height / 2);
        left = targetRect.right + scrollLeft + 8;
        break;
      case 'bottom':
        top = targetRect.bottom + scrollTop + 8;
        left = targetRect.left + scrollLeft + (targetRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'left':
        top = targetRect.top + scrollTop + (targetRect.height / 2) - (tooltipRect.height / 2);
        left = targetRect.left + scrollLeft - tooltipRect.width - 8;
        break;
      default:
        break;
    }

    // Ensure tooltip stays within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Adjust horizontal position if needed
    if (left < 0) {
      left = 0;
    } else if (left + tooltipRect.width > viewportWidth) {
      left = viewportWidth - tooltipRect.width;
    }

    // Adjust vertical position if needed
    if (top < 0) {
      top = targetRect.bottom + scrollTop + 8; // Flip to bottom if top would be off-screen
    } else if (top + tooltipRect.height > viewportHeight + scrollTop) {
      top = targetRect.top + scrollTop - tooltipRect.height - 8; // Flip to top if bottom would be off-screen
    }

    setTooltipPosition({ top, left });
  };

  const handleMouseEnter = () => {
    if (disabled) return;
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      // Use a small delay to ensure the tooltip is rendered before calculating position
      setTimeout(calculatePosition, 0);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  // Update position when window is resized
  useEffect(() => {
    if (isVisible) {
      window.addEventListener('resize', calculatePosition);
      window.addEventListener('scroll', calculatePosition);
    }

    return () => {
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', calculatePosition);
    };
  }, [isVisible]);

  // Get tooltip arrow position class
  const getArrowClass = () => {
    switch (position) {
      case 'top': return 'after:top-full after:border-t-gray-800';
      case 'right': return 'after:right-full after:border-r-gray-800';
      case 'bottom': return 'after:bottom-full after:border-b-gray-800';
      case 'left': return 'after:left-full after:border-l-gray-800';
      default: return 'after:top-full after:border-t-gray-800';
    }
  };

  return (
    <>
      {React.cloneElement(children, {
        ref: targetRef,
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        onFocus: handleMouseEnter,
        onBlur: handleMouseLeave,
      })}

      {isMounted && isVisible && createPortal(
        <div
          ref={tooltipRef}
          className={`fixed z-50 px-2 py-1 text-xs font-medium text-white bg-gray-800 rounded shadow-sm max-w-xs ${className} ${getArrowClass()}`}
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
          }}
          onMouseEnter={handleMouseLeave} // Hide tooltip when mouse enters it
          role="tooltip"
        >
          {content}
        </div>,
        document.body
      )}
    </>
  );
};

export default Tooltip;