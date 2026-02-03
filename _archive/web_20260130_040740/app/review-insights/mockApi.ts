
export interface ActionableSuggestion {
  id: string; // Unique identifier for the suggestion
  type: 'content_gap' | 'feature_request' | 'common_complaint' | 'positive_feedback'; // Category of the suggestion
  title: string; // Short, descriptive title of the suggestion (e.g., "Missing tutorial for feature X")
  description: string; // Detailed explanation or context for the suggestion
  impact_score: number; // A score indicating the potential impact if addressed (e.g., 1-10 scale)
  sentiment_score: number; // Average sentiment related to this suggestion (-1 to 1)
  related_keywords: string[]; // Keywords frequently associated with this suggestion
  example_reviews_count: number; // Number of reviews contributing to this suggestion
  // Optional:
  suggested_action?: string; // What action could be taken (e.g., "Create a help article", "Develop feature")
  priority?: 'high' | 'medium' | 'low'; // Priority level
}

export interface ReviewInsightsData {
  overall_sentiment: number; // Overall average sentiment across all analyzed reviews
  total_reviews_analyzed: number;
  suggestions: ActionableSuggestion[];
}

// localcontent_ai/web/app/review-insights/mockApi.ts
export const fetchMockReviewInsights = async (): Promise<ReviewInsightsData> => {
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve({
        overall_sentiment: 0.75,
        total_reviews_analyzed: 1250,
        suggestions: [
          {
            id: 'sug-001',
            type: 'content_gap',
            title: 'Lack of clear documentation for advanced settings',
            description: 'Many users are confused about how to configure advanced settings, leading to frustration and support requests. A dedicated guide or video tutorial is needed.',
            impact_score: 9,
            sentiment_score: -0.6,
            related_keywords: ['advanced settings', 'configuration', 'documentation', 'confusing'],
            example_reviews_count: 85,
            suggested_action: 'Create a comprehensive guide and FAQ section for advanced settings.',
            priority: 'high',
          },
          {
            id: 'sug-002',
            type: 'feature_request',
            title: 'Request for dark mode option',
            description: 'A significant number of users explicitly request a dark mode theme for better eye comfort during prolonged usage.',
            impact_score: 7,
            sentiment_score: 0.3,
            related_keywords: ['dark mode', 'theme', 'eye comfort'],
            example_reviews_count: 120,
            suggested_action: 'Add dark mode as a UI preference.',
            priority: 'medium',
          },
          {
            id: 'sug-003',
            type: 'common_complaint',
            title: 'Performance issues on older devices',
            description: 'Several reviews mention slow performance or crashes when using the application on older mobile phone models.',
            impact_score: 8,
            sentiment_score: -0.8,
            related_keywords: ['slow', 'lag', 'old device', 'performance'],
            example_reviews_count: 50,
            suggested_action: 'Optimize performance for older hardware; investigate memory leaks or CPU intensive operations.',
            priority: 'high',
          },
          {
            id: 'sug-004',
            type: 'positive_feedback',
            title: 'Appreciation for intuitive user interface',
            description: 'Users consistently praise the application for its clean design and ease of use, especially for new users.',
            impact_score: 6,
            sentiment_score: 0.9,
            related_keywords: ['intuitive', 'easy to use', 'clean design', 'user-friendly'],
            example_reviews_count: 200,
            suggested_action: 'Highlight this strength in marketing; ensure future updates maintain UI/UX quality.',
            priority: 'low',
          },
        ],
      });
    }, 500)
  );
};
