import React, { useState } from 'react';

/**
 * Tabs Component
 * 
 * A reusable tabs component for organizing content into multiple sections.
 * 
 * @param {Object} props - Component props
 * @param {Array} props.tabs - Array of tab objects with { id, label, content }
 * @param {string} props.defaultTab - ID of the default active tab
 * @param {function} props.onChange - Callback when tab changes
 * @param {string} props.variant - Tab style variant ('default', 'pills', 'underline')
 * @param {string} props.size - Tab size ('sm', 'md', 'lg')
 * @param {string} props.className - Additional CSS classes for the tabs container
 * @param {string} props.tabClassName - Additional CSS classes for individual tabs
 * @param {string} props.contentClassName - Additional CSS classes for the tab content
 */
const Tabs = ({
  tabs = [],
  defaultTab,
  onChange,
  variant = 'default',
  size = 'md',
  className = '',
  tabClassName = '',
  contentClassName = '',
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || (tabs.length > 0 ? tabs[0].id : null));

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (onChange) {
      onChange(tabId);
    }
  };

  // Determine tab styles based on variant
  let tabStyles = '';
  let activeTabStyles = '';
  let tabsContainerStyles = '';

  switch (variant) {
    case 'pills':
      tabStyles = 'px-3 py-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100';
      activeTabStyles = 'bg-primary-100 text-primary-700 hover:bg-primary-100 hover:text-primary-700';
      tabsContainerStyles = 'flex space-x-1';
      break;
    case 'underline':
      tabStyles = 'px-1 py-4 text-gray-500 hover:text-gray-700 border-b-2 border-transparent';
      activeTabStyles = 'text-primary-600 border-primary-500 hover:text-primary-600';
      tabsContainerStyles = 'flex space-x-8 border-b border-gray-200';
      break;
    case 'default':
    default:
      tabStyles = 'px-4 py-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300';
      activeTabStyles = 'border-primary-500 text-primary-600 hover:text-primary-600 hover:border-primary-500';
      tabsContainerStyles = 'flex space-x-4 border-b border-gray-200';
      break;
  }

  // Determine size styles
  let sizeStyles = '';
  switch (size) {
    case 'sm':
      sizeStyles = 'text-sm';
      break;
    case 'lg':
      sizeStyles = 'text-lg';
      break;
    case 'md':
    default:
      sizeStyles = 'text-base';
      break;
  }

  return (
    <div className={className}>
      {/* Tab Navigation */}
      <div className={`${tabsContainerStyles} ${sizeStyles}`} role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tab-panel-${tab.id}`}
            id={`tab-${tab.id}`}
            className={`${tabStyles} ${activeTab === tab.id ? activeTabStyles : ''} font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${tabClassName}`}
            onClick={() => handleTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className={`mt-4 ${contentClassName}`}>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            role="tabpanel"
            aria-labelledby={`tab-${tab.id}`}
            id={`tab-panel-${tab.id}`}
            className={activeTab === tab.id ? 'block' : 'hidden'}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tabs;