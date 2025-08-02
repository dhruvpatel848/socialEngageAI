import {
  initAnalytics,
  trackPageView,
  trackEvent,
  trackConversion,
  setUserProperties,
  trackPredictionCreated,
  trackActualsUpdated,
  trackDashboardView,
  trackAccountConnected,
  trackAccountDisconnected
} from '../analytics';

// Mock environment variables
const originalEnv = process.env;

// Mock window and document objects
const mockAppendChild = jest.fn();
const mockCreateElement = jest.fn(() => ({
  async: null,
  src: null
}));

global.document = {
  createElement: mockCreateElement,
  head: {
    appendChild: mockAppendChild
  }
};

global.window = {
  dataLayer: [],
  gtag: jest.fn()
};

// Mock console methods
global.console = {
  log: jest.fn(),
  error: jest.fn()
};

describe('Analytics Utility', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Reset window.gtag
    window.gtag = jest.fn();
    window.dataLayer = [];
    
    // Reset environment variables
    process.env = { ...originalEnv };
  });
  
  afterAll(() => {
    process.env = originalEnv;
  });
  
  describe('initAnalytics', () => {
    it('should initialize analytics when enabled and ID is provided', () => {
      // Set environment variables
      process.env.NEXT_PUBLIC_ENABLE_ANALYTICS = 'true';
      process.env.NEXT_PUBLIC_ANALYTICS_ID = 'UA-12345-6';
      
      // Call the function
      initAnalytics();
      
      // Check if script was created and appended
      expect(mockCreateElement).toHaveBeenCalledWith('script');
      expect(mockAppendChild).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('Analytics initialized successfully');
    });
    
    it('should not initialize analytics when disabled', () => {
      // Set environment variables
      process.env.NEXT_PUBLIC_ENABLE_ANALYTICS = 'false';
      process.env.NEXT_PUBLIC_ANALYTICS_ID = 'UA-12345-6';
      
      // Call the function
      initAnalytics();
      
      // Check if script was not created
      expect(mockCreateElement).not.toHaveBeenCalled();
      expect(mockAppendChild).not.toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('Analytics is disabled or missing ID');
    });
    
    it('should not initialize analytics when ID is missing', () => {
      // Set environment variables
      process.env.NEXT_PUBLIC_ENABLE_ANALYTICS = 'true';
      process.env.NEXT_PUBLIC_ANALYTICS_ID = '';
      
      // Call the function
      initAnalytics();
      
      // Check if script was not created
      expect(mockCreateElement).not.toHaveBeenCalled();
      expect(mockAppendChild).not.toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('Analytics is disabled or missing ID');
    });
    
    it('should handle errors during initialization', () => {
      // Set environment variables
      process.env.NEXT_PUBLIC_ENABLE_ANALYTICS = 'true';
      process.env.NEXT_PUBLIC_ANALYTICS_ID = 'UA-12345-6';
      
      // Make appendChild throw an error
      mockAppendChild.mockImplementationOnce(() => {
        throw new Error('Test error');
      });
      
      // Call the function
      initAnalytics();
      
      // Check if error was logged
      expect(console.error).toHaveBeenCalledWith('Failed to initialize analytics:', expect.any(Error));
    });
  });
  
  describe('trackPageView', () => {
    beforeEach(() => {
      // Set up environment for tracking
      process.env.NEXT_PUBLIC_ENABLE_ANALYTICS = 'true';
      process.env.NEXT_PUBLIC_ANALYTICS_ID = 'UA-12345-6';
      window.gtag = jest.fn();
    });
    
    it('should track page view when enabled', () => {
      // Call the function
      trackPageView('/test-page', 'Test Page');
      
      // Check if gtag was called correctly
      expect(window.gtag).toHaveBeenCalledWith('event', 'page_view', {
        page_location: '/test-page',
        page_title: 'Test Page'
      });
    });
    
    it('should not track page view when disabled', () => {
      // Disable analytics
      process.env.NEXT_PUBLIC_ENABLE_ANALYTICS = 'false';
      
      // Call the function
      trackPageView('/test-page', 'Test Page');
      
      // Check if gtag was not called
      expect(window.gtag).not.toHaveBeenCalled();
    });
    
    it('should handle errors during tracking', () => {
      // Make gtag throw an error
      window.gtag.mockImplementationOnce(() => {
        throw new Error('Test error');
      });
      
      // Call the function
      trackPageView('/test-page', 'Test Page');
      
      // Check if error was logged
      expect(console.error).toHaveBeenCalledWith('Failed to track page view:', expect.any(Error));
    });
  });
  
  describe('trackEvent', () => {
    beforeEach(() => {
      // Set up environment for tracking
      process.env.NEXT_PUBLIC_ENABLE_ANALYTICS = 'true';
      process.env.NEXT_PUBLIC_ANALYTICS_ID = 'UA-12345-6';
      window.gtag = jest.fn();
    });
    
    it('should track event when enabled', () => {
      // Call the function
      trackEvent('button_click', { button_id: 'submit' });
      
      // Check if gtag was called correctly
      expect(window.gtag).toHaveBeenCalledWith('event', 'button_click', { button_id: 'submit' });
    });
    
    it('should not track event when disabled', () => {
      // Disable analytics
      process.env.NEXT_PUBLIC_ENABLE_ANALYTICS = 'false';
      
      // Call the function
      trackEvent('button_click', { button_id: 'submit' });
      
      // Check if gtag was not called
      expect(window.gtag).not.toHaveBeenCalled();
    });
  });
  
  describe('Domain-specific tracking functions', () => {
    beforeEach(() => {
      // Set up environment for tracking
      process.env.NEXT_PUBLIC_ENABLE_ANALYTICS = 'true';
      process.env.NEXT_PUBLIC_ANALYTICS_ID = 'UA-12345-6';
      window.gtag = jest.fn();
    });
    
    it('should track prediction creation', () => {
      trackPredictionCreated('image');
      expect(window.gtag).toHaveBeenCalledWith('event', 'prediction_created', { content_type: 'image' });
    });
    
    it('should track actuals updated', () => {
      trackActualsUpdated('pred-123');
      expect(window.gtag).toHaveBeenCalledWith('event', 'actuals_updated', { prediction_id: 'pred-123' });
    });
    
    it('should track dashboard view', () => {
      trackDashboardView('30d');
      expect(window.gtag).toHaveBeenCalledWith('event', 'dashboard_view', { time_range: '30d' });
    });
    
    it('should track account connected', () => {
      trackAccountConnected('twitter');
      expect(window.gtag).toHaveBeenCalledWith('event', 'account_connected', { platform: 'twitter' });
    });
    
    it('should track account disconnected', () => {
      trackAccountDisconnected('instagram');
      expect(window.gtag).toHaveBeenCalledWith('event', 'account_disconnected', { platform: 'instagram' });
    });
  });
});