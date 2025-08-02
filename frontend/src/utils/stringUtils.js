/**
 * String Utility Functions
 * 
 * This utility provides functions for common string operations
 * used throughout the application.
 */

/**
 * Truncate a string to a specified length and add ellipsis if needed
 * @param {string} str - The string to truncate
 * @param {number} maxLength - The maximum length (default: 100)
 * @param {string} ellipsis - The ellipsis string (default: '...')
 * @returns {string} The truncated string
 */
export const truncate = (str, maxLength = 100, ellipsis = '...') => {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - ellipsis.length) + ellipsis;
};

/**
 * Capitalize the first letter of a string
 * @param {string} str - The string to capitalize
 * @returns {string} The capitalized string
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Convert a string to title case (capitalize each word)
 * @param {string} str - The string to convert
 * @returns {string} The title case string
 */
export const toTitleCase = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Convert a camelCase string to a human-readable format
 * @param {string} str - The camelCase string
 * @param {boolean} capitalize - Whether to capitalize the result (default: true)
 * @returns {string} The human-readable string
 */
export const camelCaseToHuman = (str, capitalizeResult = true) => {
  if (!str) return '';
  const result = str
    .replace(/([A-Z])/g, ' $1')
    .trim();
  return capitalizeResult ? capitalize(result) : result.toLowerCase();
};

/**
 * Convert a kebab-case or snake_case string to camelCase
 * @param {string} str - The kebab-case or snake_case string
 * @returns {string} The camelCase string
 */
export const toCamelCase = (str) => {
  if (!str) return '';
  return str
    .replace(/[-_](\w)/g, (_, c) => c.toUpperCase())
    .replace(/^\w/, c => c.toLowerCase());
};

/**
 * Extract hashtags from a string
 * @param {string} str - The string to extract hashtags from
 * @returns {string[]} An array of hashtags (without the # symbol)
 */
export const extractHashtags = (str) => {
  if (!str) return [];
  const matches = str.match(/\B#([\w]+)\b/g) || [];
  return matches.map(tag => tag.substring(1));
};

/**
 * Count words in a string
 * @param {string} str - The string to count words in
 * @returns {number} The word count
 */
export const countWords = (str) => {
  if (!str) return 0;
  return str.trim().split(/\s+/).length;
};

/**
 * Generate a random string of specified length
 * @param {number} length - The length of the random string (default: 8)
 * @returns {string} The random string
 */
export const generateRandomString = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Check if a string contains a substring (case insensitive)
 * @param {string} str - The string to check
 * @param {string} substring - The substring to look for
 * @returns {boolean} True if the string contains the substring, false otherwise
 */
export const containsIgnoreCase = (str, substring) => {
  if (!str || !substring) return false;
  return str.toLowerCase().includes(substring.toLowerCase());
};

/**
 * Format a number as a string with commas
 * @param {number} num - The number to format
 * @returns {string} The formatted number string
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Format a number as a compact string (e.g., 1.2k, 5.3M)
 * @param {number} num - The number to format
 * @returns {string} The formatted compact number string
 */
export const formatCompactNumber = (num) => {
  if (num === null || num === undefined) return '0';
  
  const formatter = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short'
  });
  
  return formatter.format(num);
};

/**
 * Slugify a string (convert to lowercase, replace spaces with hyphens, remove special chars)
 * @param {string} str - The string to slugify
 * @returns {string} The slugified string
 */
export const slugify = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

export default {
  truncate,
  capitalize,
  toTitleCase,
  camelCaseToHuman,
  toCamelCase,
  extractHashtags,
  countWords,
  generateRandomString,
  containsIgnoreCase,
  formatNumber,
  formatCompactNumber,
  slugify,
};