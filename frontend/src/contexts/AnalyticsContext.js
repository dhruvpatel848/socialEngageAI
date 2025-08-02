import React, { createContext, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
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

// Create context
const AnalyticsContext = createContext(null);

/**
 * Provider component for analytics context
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactElement} Provider component
 * 
 * @example
 * <AnalyticsProvider>
 *   <App />
 * </AnalyticsProvider>
 */
export const AnalyticsProvider = ({ children }) => {
  // Create a memoized value for the context
  const analyticsValue = useMemo(() => ({
    trackEvent,
    trackPageView,
    trackConversion,
    setUserProperties,
    trackPredictionCreated,
    trackActualsUpdated,
    trackDashboardView,
    trackAccountConnected,
    trackAccountDisconnected
  }), []);

  return (
    <AnalyticsContext.Provider value={analyticsValue}>
      {children}
    </AnalyticsContext.Provider>
  );
};

AnalyticsProvider.propTypes = {
  children: PropTypes.node.isRequired
};

/**
 * Hook for using analytics context
 * 
 * @returns {Object} Analytics methods
 * 
 * @example
 * const { trackEvent } = useAnalyticsContext();
 * trackEvent('button_click', { button_id: 'submit' });
 */
export const useAnalyticsContext = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider');
  }
  return context;
};

export default AnalyticsContext;