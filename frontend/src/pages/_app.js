import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { AuthProvider } from '../utils/AuthContext';
import { AnalyticsProvider } from '../contexts/AnalyticsContext';
import { initAnalytics, trackPageView } from '../utils/analytics';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  // Remove the server-side injected CSS (for Material-UI) and initialize analytics
  useEffect(() => {
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
    
    // Initialize analytics
    initAnalytics();
  }, []);

  // Track page views when route changes
  useEffect(() => {
    const handleRouteChange = (url) => {
      trackPageView(url, document.title);
    };

    // Track initial page load
    if (typeof window !== 'undefined') {
      trackPageView(router.asPath, document.title);
    }

    // Track route changes
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  return (
    <AuthProvider>
      <AnalyticsProvider>
        <Component {...pageProps} />
      </AnalyticsProvider>
    </AuthProvider>
  );
}

export default MyApp;