import { useCallback } from 'react';
import {
  trackEvent,
  trackPageView,
  trackConversion,
  setUserProperties,
  trackPredictionCreated,
  trackActualsUpdated,
  trackDashboardView,
  trackAccountConnected,
  trackAccountDisconnected
} from '../utils/analytics';

/**
 * Hook for using analytics in functional components
 * 
 * @returns {Object} Analytics methods
 * 
 * @example
 * const { trackEvent, trackPageView } = useAnalytics();
 * 
 * // Track an event
 * trackEvent('button_click', { button_id: 'submit' });
 * 
 * // Track a page view
 * trackPageView('/dashboard', 'Dashboard');
 */
const useAnalytics = () => {
  // Wrap all methods in useCallback to prevent unnecessary re-renders
  const track = useCallback((eventName, eventParams) => {
    trackEvent(eventName, eventParams);
  }, []);

  const trackPage = useCallback((url, title) => {
    trackPageView(url, title);
  }, []);

  const trackConvert = useCallback((conversionId, conversionParams) => {
    trackConversion(conversionId, conversionParams);
  }, []);

  const setUserProps = useCallback((properties) => {
    setUserProperties(properties);
  }, []);

  const trackPrediction = useCallback((contentType) => {
    trackPredictionCreated(contentType);
  }, []);

  const trackActuals = useCallback((predictionId) => {
    trackActualsUpdated(predictionId);
  }, []);

  const trackDashboard = useCallback((timeRange) => {
    trackDashboardView(timeRange);
  }, []);

  const trackAccountConnect = useCallback((platform) => {
    trackAccountConnected(platform);
  }, []);

  const trackAccountDisconnect = useCallback((platform) => {
    trackAccountDisconnected(platform);
  }, []);

  return {
    trackEvent: track,
    trackPageView: trackPage,
    trackConversion: trackConvert,
    setUserProperties: setUserProps,
    trackPredictionCreated: trackPrediction,
    trackActualsUpdated: trackActuals,
    trackDashboardView: trackDashboard,
    trackAccountConnected: trackAccountConnect,
    trackAccountDisconnected: trackAccountDisconnect
  };
};

export default useAnalytics;