/**
 * Feature Flags Utility
 * 
 * This utility manages feature flags for the application, allowing features
 * to be enabled or disabled without code changes.
 * 
 * Feature flags can be controlled via environment variables or API configuration.
 */

// Default feature flags configuration
const defaultFeatureFlags = {
  // Analytics features
  enableAdvancedAnalytics: false,
  enableRealTimeAnalytics: false,
  enableExportAnalytics: false,
  
  // Prediction features
  enableBatchPredictions: false,
  enableCustomModels: false,
  enableAdvancedMetrics: true,
  
  // Content features
  enableContentSuggestions: true,
  enableHashtagRecommendations: true,
  enableSentimentAnalysis: true,
  
  // Platform features
  enableTwitterIntegration: true,
  enableInstagramIntegration: true,
  enableFacebookIntegration: true,
  enableLinkedInIntegration: false,
  enableTikTokIntegration: false,
  
  // UI features
  enableDarkMode: true,
  enableBetaFeatures: false,
};

// Initialize feature flags from environment variables
const initializeFeatureFlagsFromEnv = () => {
  const flags = { ...defaultFeatureFlags };
  
  // Override defaults with environment variables if they exist
  Object.keys(flags).forEach(key => {
    const envKey = `NEXT_PUBLIC_${key.toUpperCase()}`;
    if (typeof process.env[envKey] !== 'undefined') {
      flags[key] = process.env[envKey] === 'true';
    }
  });
  
  return flags;
};

// Feature flags state
let featureFlags = initializeFeatureFlagsFromEnv();

/**
 * Get the current state of all feature flags
 * @returns {Object} The current feature flags
 */
export const getFeatureFlags = () => {
  return { ...featureFlags };
};

/**
 * Check if a specific feature is enabled
 * @param {string} featureName - The name of the feature to check
 * @returns {boolean} True if the feature is enabled, false otherwise
 */
export const isFeatureEnabled = (featureName) => {
  if (!(featureName in featureFlags)) {
    console.warn(`Feature flag "${featureName}" does not exist`);
    return false;
  }
  return featureFlags[featureName];
};

/**
 * Update feature flags from remote configuration
 * This can be called after fetching configuration from an API
 * @param {Object} remoteFlags - The remote feature flags configuration
 */
export const updateFeatureFlags = (remoteFlags) => {
  featureFlags = {
    ...featureFlags,
    ...remoteFlags,
  };
};

/**
 * Reset feature flags to their default values
 */
export const resetFeatureFlags = () => {
  featureFlags = initializeFeatureFlagsFromEnv();
};

/**
 * Get feature flags for a specific category
 * @param {string} category - The category to filter by (e.g., 'analytics', 'prediction')
 * @returns {Object} Feature flags filtered by category
 */
export const getFeatureFlagsByCategory = (category) => {
  const prefix = `enable${category.charAt(0).toUpperCase() + category.slice(1)}`;
  return Object.entries(featureFlags)
    .filter(([key]) => key.startsWith(prefix))
    .reduce((obj, [key, value]) => {
      obj[key] = value;
      return obj;
    }, {});
};

export default {
  getFeatureFlags,
  isFeatureEnabled,
  updateFeatureFlags,
  resetFeatureFlags,
  getFeatureFlagsByCategory,
};