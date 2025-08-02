/**
 * Mock data for dashboard when API is not available
 * This helps prevent the dashboard from failing to load
 */

export const mockStats = {
  totalPosts: 120,
  postsByMediaType: [
    { mediaType: 'image', count: 65 },
    { mediaType: 'video', count: 35 },
    { mediaType: 'text', count: 20 }
  ],
  avgEngagementByMediaType: [
    { mediaType: 'image', avgLikes: 45.2, avgShares: 12.3, avgComments: 8.7, count: 65 },
    { mediaType: 'video', avgLikes: 78.5, avgShares: 25.1, avgComments: 15.3, count: 35 },
    { mediaType: 'text', avgLikes: 12.1, avgShares: 3.2, avgComments: 5.8, count: 20 }
  ],
  postsByDay: [
    { day: 'Monday', count: 15 },
    { day: 'Tuesday', count: 18 },
    { day: 'Wednesday', count: 22 },
    { day: 'Thursday', count: 20 },
    { day: 'Friday', count: 25 },
    { day: 'Saturday', count: 12 },
    { day: 'Sunday', count: 8 }
  ],
  postsByHour: [
    { hour: 9, count: 10 },
    { hour: 10, count: 12 },
    { hour: 11, count: 15 },
    { hour: 12, count: 18 },
    { hour: 13, count: 20 },
    { hour: 14, count: 15 },
    { hour: 15, count: 12 },
    { hour: 16, count: 10 },
    { hour: 17, count: 8 }
  ],
  topHashtags: [
    { hashtag: 'marketing', count: 45 },
    { hashtag: 'socialmedia', count: 40 },
    { hashtag: 'digital', count: 35 },
    { hashtag: 'content', count: 30 },
    { hashtag: 'strategy', count: 25 },
    { hashtag: 'business', count: 20 },
    { hashtag: 'branding', count: 18 },
    { hashtag: 'seo', count: 15 },
    { hashtag: 'analytics', count: 12 },
    { hashtag: 'growth', count: 10 }
  ]
};

export const mockModelMetrics = {
  performance: {
    accuracy: 0.85,
    precision: 0.82,
    recall: 0.79,
    f1Score: 0.80,
    metrics: [
      { metric: 'Accuracy', value: 0.85 },
      { metric: 'Precision', value: 0.82 },
      { metric: 'Recall', value: 0.79 },
      { metric: 'F1 Score', value: 0.80 },
      { metric: 'AUC', value: 0.88 }
    ],
    confusionMatrix: {
      truePositive: 120,
      falsePositive: 25,
      trueNegative: 110,
      falseNegative: 30
    }
  },
  featureImportance: {
    features: [
      { feature: 'Post Length', importance: 0.25 },
      { feature: 'Image Count', importance: 0.20 },
      { feature: 'Hashtag Count', importance: 0.18 },
      { feature: 'Post Time', importance: 0.15 },
      { feature: 'Post Day', importance: 0.12 },
      { feature: 'Media Type', importance: 0.10 }
    ]
  },
  contentAnalysis: {
    engagement_by_content_length: [
      { length: 'Short', avgEngagement: 25.3 },
      { length: 'Medium', avgEngagement: 42.7 },
      { length: 'Long', avgEngagement: 18.9 }
    ],
    sentiment_analysis: {
      positive: {
        avg_engagement: 45.7,
        avg_likes: 38.2,
        avg_shares: 12.5,
        avg_comments: 8.3
      },
      neutral: {
        avg_engagement: 32.1,
        avg_likes: 25.6,
        avg_shares: 8.7,
        avg_comments: 6.2
      },
      negative: {
        avg_engagement: 28.4,
        avg_likes: 22.1,
        avg_shares: 7.3,
        avg_comments: 9.8
      }
    },
    text_features: {
      hashtags: {
        optimal_count: 4,
        avg_engagement_with_hashtags: 38.2,
        avg_engagement_without_hashtags: 24.5
      },
      post_length: {
        short_posts_engagement: 28.7,
        medium_posts_engagement: 42.3,
        long_posts_engagement: 31.5
      },
      call_to_action: {
        with_cta_engagement: 45.2,
        without_cta_engagement: 32.7
      }
    },
    temporal_patterns: {
      best_days: [
        { day: 'Friday', avg_engagement: 45.2 },
        { day: 'Wednesday', avg_engagement: 38.7 },
        { day: 'Thursday', avg_engagement: 36.5 }
      ],
      best_hours: [
        { hour: 12, avg_engagement: 42.3 },
        { hour: 17, avg_engagement: 38.9 },
        { hour: 9, avg_engagement: 35.6 }
      ]
    },
    content_recommendations: [
      'Include 2-3 images for optimal engagement',
      'Posts between 100-150 words perform best',
      'Friday at noon is the optimal posting time',
      'Include 3-5 relevant hashtags',
      'Video content receives 30% more engagement'
    ]
  }
};