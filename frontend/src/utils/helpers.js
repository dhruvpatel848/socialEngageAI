/**
 * Format a number for display (e.g., 1000 -> 1K)
 * @param {number} num - The number to format
 * @param {number} digits - Number of decimal places
 * @returns {string} Formatted number
 */
export const formatNumber = (num, digits = 1) => {
  if (num === null || num === undefined) return '0';
  
  const lookup = [
    { value: 1, symbol: '' },
    { value: 1e3, symbol: 'K' },
    { value: 1e6, symbol: 'M' },
    { value: 1e9, symbol: 'B' },
  ];
  
  const rx = /\.0+$|(\.\d*[1-9])0+$/;
  const item = lookup
    .slice()
    .reverse()
    .find((item) => num >= item.value);
    
  return item
    ? (num / item.value).toFixed(digits).replace(rx, '$1') + item.symbol
    : '0';
};

/**
 * Format a date for display
 * @param {string} dateString - ISO date string
 * @param {boolean} includeTime - Whether to include time
 * @returns {string} Formatted date
 */
export const formatDate = (dateString, includeTime = false) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(includeTime && { hour: '2-digit', minute: '2-digit' }),
  };
  
  return date.toLocaleDateString('en-US', options);
};

/**
 * Calculate the percentage difference between two numbers
 * @param {number} current - Current value
 * @param {number} previous - Previous value
 * @returns {object} Percentage difference and direction
 */
export const calculatePercentageChange = (current, previous) => {
  if (!previous) return { value: 0, direction: 'neutral' };
  
  const difference = current - previous;
  const percentage = (difference / previous) * 100;
  
  return {
    value: Math.abs(percentage).toFixed(1),
    direction: difference > 0 ? 'up' : difference < 0 ? 'down' : 'neutral',
  };
};

/**
 * Truncate text to a specified length
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, length = 100) => {
  if (!text) return '';
  return text.length > length ? `${text.substring(0, length)}...` : text;
};

/**
 * Extract hashtags from text
 * @param {string} text - Text containing hashtags
 * @returns {string[]} Array of hashtags
 */
export const extractHashtags = (text) => {
  if (!text) return [];
  const matches = text.match(/#[\w\u0590-\u05ff]+/g);
  return matches || [];
};

/**
 * Debounce function to limit how often a function is called
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Get engagement level based on numeric value
 * @param {number} value - Engagement value
 * @returns {string} Engagement level (low, medium, high, viral)
 */
export const getEngagementLevel = (value) => {
  if (value < 100) return 'low';
  if (value < 500) return 'medium';
  if (value < 1000) return 'high';
  return 'viral';
};

/**
 * Get color class for engagement level
 * @param {string} level - Engagement level
 * @returns {string} CSS class for the level
 */
export const getEngagementLevelColor = (level) => {
  const colors = {
    'low': 'bg-yellow-100 text-yellow-800',
    'medium': 'bg-blue-100 text-blue-800',
    'high': 'bg-green-100 text-green-800',
    'viral': 'bg-purple-100 text-purple-800',
  };
  return colors[level?.toLowerCase()] || 'bg-gray-100 text-gray-800';
};