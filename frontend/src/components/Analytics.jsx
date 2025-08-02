import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { trackEvent, trackConversion, setUserProperties } from '../utils/analytics';

/**
 * Analytics component for tracking events in components
 * This component doesn't render anything visible but tracks events when mounted
 * 
 * Usage examples:
 * <Analytics event="view_profile" data={{ user_id: 123 }} />
 * <Analytics conversion="signup" data={{ method: 'email' }} />
 * <Analytics userProperties={{ user_level: 'premium' }} />
 */
const Analytics = ({ event, conversion, userProperties, data, trackOnce = true }) => {
  useEffect(() => {
    // Track event if provided
    if (event) {
      trackEvent(event, data);
    }

    // Track conversion if provided
    if (conversion) {
      trackConversion(conversion, data);
    }

    // Set user properties if provided
    if (userProperties) {
      setUserProperties(userProperties);
    }
  }, [trackOnce ? null : event, trackOnce ? null : conversion, trackOnce ? null : JSON.stringify(data), trackOnce ? null : JSON.stringify(userProperties)]);

  // This component doesn't render anything
  return null;
};

Analytics.propTypes = {
  /** Event name to track */
  event: PropTypes.string,
  /** Conversion ID to track */
  conversion: PropTypes.string,
  /** User properties to set */
  userProperties: PropTypes.object,
  /** Additional data for the event or conversion */
  data: PropTypes.object,
  /** Whether to track only once when component mounts (true) or on every prop change (false) */
  trackOnce: PropTypes.bool
};

Analytics.defaultProps = {
  event: null,
  conversion: null,
  userProperties: null,
  data: {},
  trackOnce: true
};

export default Analytics;