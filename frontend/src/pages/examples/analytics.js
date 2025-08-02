import React from 'react';
import Layout from '../../components/Layout';
import AnalyticsExample from '../../components/examples/AnalyticsExample';
import { useAnalyticsContext } from '../../contexts/AnalyticsContext';

/**
 * Example page demonstrating analytics usage
 */
export default function AnalyticsExamplePage() {
  const { trackEvent } = useAnalyticsContext();

  // Track when user clicks the documentation link
  const handleDocLinkClick = () => {
    trackEvent('analytics_doc_link_click');
  };

  return (
    <Layout title="Analytics Example">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Analytics Example</h1>
        
        <div className="mb-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-lg">
            This page demonstrates how to use the analytics system in the application.
            Check the browser console to see the analytics events being tracked.
          </p>
          <p className="mt-2">
            <a 
              href="/docs/analytics.md" 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={handleDocLinkClick}
              className="text-blue-600 hover:underline"
            >
              View Analytics Documentation
            </a>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Interactive Example</h2>
            <AnalyticsExample />
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Analytics Implementation</h2>
            <div className="prose bg-gray-50 p-4 rounded-lg">
              <p>The analytics system is implemented using:</p>
              <ul>
                <li><strong>Core Utility</strong>: <code>src/utils/analytics.js</code></li>
                <li><strong>React Component</strong>: <code>src/components/Analytics.jsx</code></li>
                <li><strong>React Hook</strong>: <code>src/hooks/useAnalytics.js</code></li>
                <li><strong>HOC</strong>: <code>src/hocs/withAnalytics.js</code></li>
                <li><strong>Context</strong>: <code>src/contexts/AnalyticsContext.js</code></li>
              </ul>
              
              <p>Configuration is done via environment variables:</p>
              <pre><code>
              NEXT_PUBLIC_ENABLE_ANALYTICS=true
              NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
              </code></pre>
              
              <p>Events are tracked in the following ways:</p>
              <ul>
                <li>Page views automatically in <code>_app.js</code></li>
                <li>User interactions with <code>trackEvent()</code></li>
                <li>Conversions with <code>trackConversion()</code></li>
                <li>User properties with <code>setUserProperties()</code></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}