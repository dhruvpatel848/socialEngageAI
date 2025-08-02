# Analytics System Documentation

## Overview

This document provides guidance on how to use the analytics system in the Social Media Analytics Platform. The analytics system is designed to track user interactions, page views, and other events to help understand user behavior and improve the application.

## Configuration

Analytics is configured through environment variables in the `.env` file:

```
# Analytics
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

- `NEXT_PUBLIC_ENABLE_ANALYTICS`: Set to `true` to enable analytics tracking, `false` to disable it.
- `NEXT_PUBLIC_ANALYTICS_ID`: Your Google Analytics ID or other analytics service ID.

## Core Analytics Utility

The core analytics functionality is in `src/utils/analytics.js`. This file provides the following functions:

- `initAnalytics()`: Initialize the analytics service.
- `trackPageView(url, title)`: Track a page view.
- `trackEvent(eventName, eventParams)`: Track a custom event.
- `trackConversion(conversionId, conversionParams)`: Track a conversion.
- `setUserProperties(properties)`: Set user properties for segmentation.

And domain-specific tracking functions:

- `trackPredictionCreated(contentType)`: Track when a prediction is created.
- `trackActualsUpdated(predictionId)`: Track when actual metrics are updated.
- `trackDashboardView(timeRange)`: Track dashboard views.
- `trackAccountConnected(platform)`: Track when a social account is connected.
- `trackAccountDisconnected(platform)`: Track when a social account is disconnected.

## Ways to Use Analytics

There are several ways to use analytics in the application:

### 1. Direct Import

Import the functions directly from the analytics utility:

```jsx
import { trackEvent } from '../utils/analytics';

function handleClick() {
  trackEvent('button_click', { button_id: 'submit' });
}
```

### 2. Analytics Component

Use the `Analytics` component for declarative tracking:

```jsx
import Analytics from '../components/Analytics';

function ProfilePage({ userId }) {
  return (
    <div>
      <Analytics event="view_profile" data={{ user_id: userId }} />
      {/* Page content */}
    </div>
  );
}
```

### 3. useAnalytics Hook

Use the `useAnalytics` hook in functional components:

```jsx
import { useAnalytics } from '../hooks/useAnalytics';

function SubmitButton() {
  const { trackEvent } = useAnalytics();
  
  const handleClick = () => {
    // Business logic
    trackEvent('form_submit', { form_type: 'contact' });
  };
  
  return <button onClick={handleClick}>Submit</button>;
}
```

### 4. withAnalytics HOC

Use the `withAnalytics` HOC for class components:

```jsx
import withAnalytics from '../hocs/withAnalytics';

class Dashboard extends React.Component {
  componentDidMount() {
    this.props.trackPageView('/dashboard', 'Dashboard');
  }
  
  handleButtonClick = () => {
    this.props.trackEvent('dashboard_action', { action: 'refresh' });
  };
  
  render() {
    return <button onClick={this.handleButtonClick}>Refresh</button>;
  }
}

export default withAnalytics(Dashboard);
```

### 5. Analytics Context

Use the analytics context in deeply nested components:

```jsx
import { useAnalyticsContext } from '../contexts/AnalyticsContext';

function DeepNestedComponent() {
  const { trackEvent } = useAnalyticsContext();
  
  return <button onClick={() => trackEvent('deep_action')}>Action</button>;
}
```

## Best Practices

1. **Be Consistent**: Use the same event names and parameters across the application.
2. **Be Descriptive**: Use descriptive event names and parameters to make analysis easier.
3. **Don't Over-Track**: Only track events that are meaningful for analysis.
4. **Respect Privacy**: Don't track personally identifiable information (PII) unless necessary and permitted.
5. **Handle Errors**: Analytics should never break the application. Always use try/catch blocks.
6. **Test Tracking**: Verify that events are being tracked correctly in your analytics dashboard.

## Common Events to Track

- Page views
- Button clicks
- Form submissions
- Feature usage
- Error occurrences
- User sign-ups and logins
- Conversion events (subscriptions, purchases, etc.)

## Debugging

To debug analytics tracking, you can:

1. Open the browser console to see tracking logs.
2. Use the Google Analytics Debugger extension or similar tools.
3. Check the Network tab in browser dev tools to see requests to analytics services.

## Adding New Events

When adding new events to track:

1. Define a clear purpose for tracking the event.
2. Choose a descriptive name following the naming convention (e.g., `object_action`).
3. Determine what parameters are relevant to include.
4. Add the tracking code using one of the methods described above.
5. Document the new event in your analytics tracking plan.

## Privacy Considerations

Ensure that your analytics implementation complies with privacy regulations such as GDPR and CCPA:

- Include analytics in your privacy policy.
- Get user consent when required.
- Provide opt-out mechanisms.
- Don't track sensitive personal information.
- Respect Do Not Track (DNT) settings.