import React, { Component } from 'react';
import {
  trackEvent,
  trackPageView,
  trackConversion,
  setUserProperties
} from '../utils/analytics';

/**
 * Higher-order component for adding analytics capabilities to class components
 * 
 * @param {React.Component} WrappedComponent - The component to wrap
 * @returns {React.Component} - The wrapped component with analytics props
 * 
 * @example
 * class MyComponent extends React.Component {
 *   componentDidMount() {
 *     this.props.trackEvent('component_mounted');
 *   }
 * }
 * 
 * export default withAnalytics(MyComponent);
 */
const withAnalytics = (WrappedComponent) => {
  class WithAnalytics extends Component {
    trackEvent = (eventName, eventParams) => {
      trackEvent(eventName, eventParams);
    };

    trackPageView = (url, title) => {
      trackPageView(url, title);
    };

    trackConversion = (conversionId, conversionParams) => {
      trackConversion(conversionId, conversionParams);
    };

    setUserProperties = (properties) => {
      setUserProperties(properties);
    };

    render() {
      const analyticsProps = {
        trackEvent: this.trackEvent,
        trackPageView: this.trackPageView,
        trackConversion: this.trackConversion,
        setUserProperties: this.setUserProperties
      };

      return <WrappedComponent {...this.props} {...analyticsProps} />;
    }
  }

  // Set display name for debugging
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  WithAnalytics.displayName = `withAnalytics(${displayName})`;

  return WithAnalytics;
};

export default withAnalytics;