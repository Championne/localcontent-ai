# Review Miner UI Implementation Plan

**Objective:** Design and implement `localcontent_ai/web/app/review-insights/page.tsx` to display actionable content suggestions derived from `review_analyzer.py`. This document details the UI structure, mock data fetching, and data presentation, preparing for delegation to a coding tool.

## 1. UI Structure

The `review-insights` page will provide a clear overview of review sentiments and actionable content suggestions.

### 1.1 Page Layout
The page will adopt a clean, two-column layout or a main content area with a potential sidebar for filters (if added later). For the initial implementation, a single main content area is sufficient.

*   **Header**: Page title "Review Insights".
*   **Main Content Area**:
    *   **Summary Cards/Section**: High-level metrics like overall sentiment, total reviews analyzed, etc. (Optional, but good for context).
    *   **Actionable Suggestions List**: The primary section displaying the suggestions. Each suggestion should be easily scannable.
    *   **Filters/Search (Future Consideration)**: Allow users to filter suggestions by product, topic, sentiment, or keywords. This will be an enhancement, not part of the initial plan unless explicitly requested.

### 1.2 Components
*   `ReviewInsightsPage`: The main page component.
*   `SuggestionCard`: Component to display an individual actionable suggestion.
*   `SentimentSummaryCard` (Optional): A reusable card to show overall sentiment score or other key metrics.

## 2. Mock Data Fetching

To enable frontend development independently of the backend `review_analyzer.py` service, we will define a mock data structure and simulate data fetching.

### 2.1 Expected Data Structure from `review_analyzer.py`
The `review_analyzer.py` is expected to return a list of actionable suggestions. Each suggestion object should contain:

```typescript
interface ActionableSuggestion {
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

interface ReviewInsightsData {
  overall_sentiment: number; // Overall average sentiment across all analyzed reviews
  total_reviews_analyzed: number;
  suggestions: ActionableSuggestion[];
}
```

### 2.2 Mock Data Implementation
A `mockApi.ts` or a similar utility file will provide this mock data.

```typescript
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
```
The `page.tsx` will call `fetchMockReviewInsights` within a `useEffect` hook or similar Next.js data fetching mechanism (e.g., `getServerSideProps` or `use` hook with `suspense`, depending on the Next.js version and project setup).

## 3. Data Presentation

### 3.1 Overall Layout (`page.tsx`)
```typescript
// localcontent_ai/web/app/review-insights/page.tsx
'use client'; // Assuming client-side fetching for now

import React, { useEffect, useState } from 'react';
import { fetchMockReviewInsights, ReviewInsightsData } from './mockApi';
import { SuggestionCard } from './components/SuggestionCard'; // To be created
import { SentimentSummaryCard } from './components/SentimentSummaryCard'; // Optional, to be created

export default function ReviewInsightsPage() {
  const [insights, setInsights] = useState<ReviewInsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getInsights = async () => {
      try {
        const data = await fetchMockReviewInsights();
        setInsights(data);
      } catch (err) {
        setError('Failed to load review insights.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    getInsights();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading insights...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500 text-center">{error}</div>;
  }

  if (!insights) {
    return <div className="p-8 text-center">No insights available.</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Review Insights</h1>

      {/* Optional: Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <SentimentSummaryCard
          title="Overall Sentiment"
          score={insights.overall_sentiment}
          description="Average sentiment across all analyzed reviews."
        />
        <SentimentSummaryCard
          title="Total Reviews Analyzed"
          score={insights.total_reviews_analyzed}
          description="Number of reviews processed by the analyzer."
          isNumeric={true}
        />
      </div>

      <h2 className="text-3xl font-semibold mb-6">Actionable Content Suggestions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {insights.suggestions.map((suggestion) => (
          <SuggestionCard key={suggestion.id} suggestion={suggestion} />
        ))}
      </div>
    </div>
  );
}
```

### 3.2 `SuggestionCard` Component
This component will display each actionable suggestion concisely.

```typescript
// localcontent_ai/web/app/review-insights/components/SuggestionCard.tsx
import React from 'react';
import { ActionableSuggestion } from '../mockApi'; // Or a shared types file

interface SuggestionCardProps {
  suggestion: ActionableSuggestion;
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({ suggestion }) => {
  const getBadgeColor = (type: ActionableSuggestion['type']) => {
    switch (type) {
      case 'content_gap': return 'bg-blue-100 text-blue-800';
      case 'feature_request': return 'bg-purple-100 text-purple-800';
      case 'common_complaint': return 'bg-red-100 text-red-800';
      case 'positive_feedback': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: ActionableSuggestion['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-600 font-bold';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col justify-between border border-gray-200">
      <div>
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${getBadgeColor(suggestion.type)}`}>
          {suggestion.type.replace(/_/g, ' ')}
        </span>
        <h3 className="text-xl font-bold mt-3 mb-2 text-gray-900">{suggestion.title}</h3>
        <p className="text-gray-700 text-sm mb-4 line-clamp-3">{suggestion.description}</p>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm text-gray-600">
        {suggestion.suggested_action && (
          <p><strong>Action:</strong> {suggestion.suggested_action}</p>
        )}
        <p><strong>Impact Score:</strong> <span className="font-semibold">{suggestion.impact_score}</span>/10</p>
        <p><strong>Sentiment:</strong> <span className="font-semibold" style={{ color: suggestion.sentiment_score < 0 ? 'red' : suggestion.sentiment_score > 0 ? 'green' : 'gray' }}>
            {suggestion.sentiment_score.toFixed(2)}
        </span></p>
        {suggestion.priority && (
          <p><strong>Priority:</strong> <span className={getPriorityColor(suggestion.priority)}>{suggestion.priority}</span></p>
        )}
        <p><strong>Related Keywords:</strong> {suggestion.related_keywords.join(', ')}</p>
        <p><strong>Reviews:</strong> {suggestion.example_reviews_count}</p>
      </div>
    </div>
  );
};
```

### 3.3 `SentimentSummaryCard` Component (Optional but good for completeness)
```typescript
// localcontent_ai/web/app/review-insights/components/SentimentSummaryCard.tsx
import React from 'react';

interface SentimentSummaryCardProps {
  title: string;
  score: number;
  description: string;
  isNumeric?: boolean; // If true, displays raw number, otherwise formats as sentiment
}

export const SentimentSummaryCard: React.FC<SentimentSummaryCardProps> = ({ title, score, description, isNumeric = false }) => {
  const formatScore = (value: number) => {
    if (isNumeric) return value.toLocaleString();
    
    let color = 'text-gray-700';
    if (value > 0.5) color = 'text-green-600';
    else if (value < -0.5) color = 'text-red-600';
    else if (value >= -0.5 && value <= 0.5 && value !== 0) color = 'text-yellow-600';
    
    return <span className={`font-bold ${color}`}>{value.toFixed(2)}</span>;
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
      <h3 className="text-lg font-semibold mb-2 text-gray-800">{title}</h3>
      <div className="text-4xl mb-3">
        {formatScore(score)}
      </div>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
};
```

### 3.4 Styling Considerations
*   Use Tailwind CSS for utility-first styling, consistent with modern Next.js applications.
*   Ensure responsiveness for various screen sizes.

## 4. Initial File Structure

```
localcontent_ai/
└── web/
    └── app/
        └── review-insights/
            ├── page.tsx                             // Main page component
            ├── mockApi.ts                           // Mock data fetching utility
            └── components/
                ├── SuggestionCard.tsx               // Component for individual suggestions
                └── SentimentSummaryCard.tsx         // Optional summary card component
```

## 5. Implementation Steps (for coding tool)
1.  Create the directory structure: `localcontent_ai/web/app/review-insights/components`.
2.  Create `localcontent_ai/web/app/review-insights/mockApi.ts` with the mock data definition and `fetchMockReviewInsights` function.
3.  Create `localcontent_ai/web/app/review-insights/components/SuggestionCard.tsx` with the provided PropTypes and JSX structure.
4.  (Optional) Create `localcontent_ai/web/app/review-insights/components/SentimentSummaryCard.tsx`.
5.  Create `localcontent_ai/web/app/review-insights/page.tsx` with the data fetching logic using `useEffect` and state, and render the `SuggestionCard` components.
6.  Ensure necessary Tailwind CSS classes are applied for basic styling.
