/**
 * Analytics utility for tracking user behavior
 * This is only active if NEXT_PUBLIC_ANALYTICS_ENABLED is set to 'true'
 * and NEXT_PUBLIC_ANALYTICS_ID has a valid value
 */

const isAnalyticsEnabled = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true';
const analyticsId = process.env.NEXT_PUBLIC_ANALYTICS_ID;

/**
 * Initialize analytics tracking
 * This should be called once when the application loads
 */
export const initAnalytics = () => {
  if (!isAnalyticsEnabled || !analyticsId) {
    console.log('Analytics is disabled or missing ID');
    return;
  }

  try {
    // Load analytics script dynamically
    // This is a placeholder for your actual analytics provider
    // Replace with Google Analytics, Mixpanel, or your preferred analytics service
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${analyticsId}`;
    script.async = true;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    gtag('js', new Date());
    gtag('config', analyticsId);

    window.gtag = gtag;
    
    console.log('Analytics initialized successfully');
  } catch (error) {
    console.error('Failed to initialize analytics:', error);
  }
};

/**
 * Track a page view
 * @param {string} url - The URL of the page being viewed
 * @param {string} title - The title of the page
 */
export const trackPageView = (url, title) => {
  if (!isAnalyticsEnabled || !analyticsId || !window.gtag) return;

  try {
    window.gtag('event', 'page_view', {
      page_location: url,
      page_title: title,
    });
  } catch (error) {
    console.error('Failed to track page view:', error);
  }
};

/**
 * Track a user event
 * @param {string} eventName - Name of the event
 * @param {Object} eventParams - Additional parameters for the event
 */
export const trackEvent = (eventName, eventParams = {}) => {
  if (!isAnalyticsEnabled || !analyticsId || !window.gtag) return;

  try {
    window.gtag('event', eventName, eventParams);
  } catch (error) {
    console.error(`Failed to track event ${eventName}:`, error);
  }
};

/**
 * Track a user conversion
 * @param {string} conversionId - ID of the conversion
 * @param {Object} conversionParams - Additional parameters for the conversion
 */
export const trackConversion = (conversionId, conversionParams = {}) => {
  if (!isAnalyticsEnabled || !analyticsId || !window.gtag) return;

  try {
    window.gtag('event', 'conversion', {
      send_to: `${analyticsId}/${conversionId}`,
      ...conversionParams,
    });
  } catch (error) {
    console.error(`Failed to track conversion ${conversionId}:`, error);
  }
};

/**
 * Set user properties
 * @param {Object} properties - User properties to set
 */
export const setUserProperties = (properties = {}) => {
  if (!isAnalyticsEnabled || !analyticsId || !window.gtag) return;

  try {
    window.gtag('set', 'user_properties', properties);
  } catch (error) {
    console.error('Failed to set user properties:', error);
  }
};

/**
 * Track a prediction creation
 * @param {string} contentType - Type of content being predicted
 */
export const trackPredictionCreated = (contentType) => {
  trackEvent('prediction_created', { content_type: contentType });
};

/**
 * Track when actual metrics are updated
 * @param {string} predictionId - ID of the prediction
 */
export const trackActualsUpdated = (predictionId) => {
  trackEvent('actuals_updated', { prediction_id: predictionId });
};

/**
 * Track when a user views the dashboard
 * @param {string} timeRange - Selected time range
 */
export const trackDashboardView = (timeRange) => {
  trackEvent('dashboard_view', { time_range: timeRange });
};

/**
 * Track when a user connects a social media account
 * @param {string} platform - Social media platform
 */
export const trackAccountConnected = (platform) => {
  trackEvent('account_connected', { platform });
};

/**
 * Track when a user disconnects a social media account
 * @param {string} platform - Social media platform
 */
export const trackAccountDisconnected = (platform) => {
  trackEvent('account_disconnected', { platform });
};

export default {
  initAnalytics,
  trackPageView,
  trackEvent,
  trackConversion,
  setUserProperties,
  trackPredictionCreated,
  trackActualsUpdated,
  trackDashboardView,
  trackAccountConnected,
  trackAccountDisconnected,
};