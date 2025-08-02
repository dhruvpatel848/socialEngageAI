/**
 * Date and Time Utility Functions
 * 
 * This utility provides functions for formatting and manipulating dates
 * consistently throughout the application.
 */

import { format, formatDistance, parseISO, isValid, differenceInDays } from 'date-fns';

/**
 * Format a date string to a human-readable format
 * @param {string|Date} date - The date to format (ISO string or Date object)
 * @param {string} formatStr - The format string (default: 'MMM d, yyyy')
 * @returns {string} The formatted date string
 */
export const formatDate = (date, formatStr = 'MMM d, yyyy') => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return 'Invalid date';
    return format(dateObj, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Format a date string to include time
 * @param {string|Date} date - The date to format (ISO string or Date object)
 * @param {string} formatStr - The format string (default: 'MMM d, yyyy h:mm a')
 * @returns {string} The formatted date and time string
 */
export const formatDateTime = (date, formatStr = 'MMM d, yyyy h:mm a') => {
  return formatDate(date, formatStr);
};

/**
 * Get relative time (e.g., "2 days ago", "in 3 hours")
 * @param {string|Date} date - The date to format (ISO string or Date object)
 * @param {Date} baseDate - The base date to compare with (default: now)
 * @returns {string} The relative time string
 */
export const getRelativeTime = (date, baseDate = new Date()) => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return 'Invalid date';
    return formatDistance(dateObj, baseDate, { addSuffix: true });
  } catch (error) {
    console.error('Error getting relative time:', error);
    return 'Invalid date';
  }
};

/**
 * Format a time string (without date)
 * @param {string|Date} date - The date to extract time from (ISO string or Date object)
 * @param {string} formatStr - The format string (default: 'h:mm a')
 * @returns {string} The formatted time string
 */
export const formatTime = (date, formatStr = 'h:mm a') => {
  return formatDate(date, formatStr);
};

/**
 * Get day of week name
 * @param {string|Date} date - The date (ISO string or Date object)
 * @param {boolean} short - Whether to return short day name (default: false)
 * @returns {string} The day of week name
 */
export const getDayOfWeek = (date, short = false) => {
  return formatDate(date, short ? 'EEE' : 'EEEE');
};

/**
 * Get month name
 * @param {string|Date} date - The date (ISO string or Date object)
 * @param {boolean} short - Whether to return short month name (default: false)
 * @returns {string} The month name
 */
export const getMonthName = (date, short = false) => {
  return formatDate(date, short ? 'MMM' : 'MMMM');
};

/**
 * Check if a date is today
 * @param {string|Date} date - The date to check (ISO string or Date object)
 * @returns {boolean} True if the date is today, false otherwise
 */
export const isToday = (date) => {
  if (!date) return false;
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return false;
    return differenceInDays(new Date(), dateObj) === 0;
  } catch (error) {
    console.error('Error checking if date is today:', error);
    return false;
  }
};

/**
 * Format a date range
 * @param {string|Date} startDate - The start date (ISO string or Date object)
 * @param {string|Date} endDate - The end date (ISO string or Date object)
 * @param {string} formatStr - The format string (default: 'MMM d, yyyy')
 * @returns {string} The formatted date range
 */
export const formatDateRange = (startDate, endDate, formatStr = 'MMM d, yyyy') => {
  if (!startDate || !endDate) return 'N/A';
  
  try {
    const formattedStartDate = formatDate(startDate, formatStr);
    const formattedEndDate = formatDate(endDate, formatStr);
    return `${formattedStartDate} - ${formattedEndDate}`;
  } catch (error) {
    console.error('Error formatting date range:', error);
    return 'Invalid date range';
  }
};

/**
 * Get a date for a specific time period from now
 * @param {string} period - The time period ('week', 'month', 'year')
 * @returns {Date} The date for the specified period
 */
export const getDateForPeriod = (period) => {
  const now = new Date();
  
  switch (period.toLowerCase()) {
    case 'week':
      now.setDate(now.getDate() - 7);
      break;
    case 'month':
      now.setMonth(now.getMonth() - 1);
      break;
    case 'quarter':
      now.setMonth(now.getMonth() - 3);
      break;
    case 'year':
      now.setFullYear(now.getFullYear() - 1);
      break;
    default:
      // Return today by default
      break;
  }
  
  return now;
};

/**
 * Convert a date to ISO string format (YYYY-MM-DD)
 * @param {Date} date - The date to convert
 * @returns {string} The ISO formatted date string
 */
export const toISODateString = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    return format(dateObj, 'yyyy-MM-dd');
  } catch (error) {
    console.error('Error converting to ISO date string:', error);
    return '';
  }
};

export default {
  formatDate,
  formatDateTime,
  getRelativeTime,
  formatTime,
  getDayOfWeek,
  getMonthName,
  isToday,
  formatDateRange,
  getDateForPeriod,
  toISODateString,
};