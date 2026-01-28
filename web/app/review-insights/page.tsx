// localcontent_ai/web/app/review-insights/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { ReviewInsightsData, ActionableSuggestion } from '../../pages/api/review-insights';
import { SuggestionCard } from './components/SuggestionCard';
import { SentimentSummaryCard } from './components/SentimentSummaryCard';

export default function ReviewInsightsPage() {
  const [insights, setInsights] = useState<ReviewInsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getInsights = async () => {
      try {
        const response = await fetch('/api/review-insights');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: ReviewInsightsData = await response.json();
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
        {insights.suggestions.map((suggestion: ActionableSuggestion) => (
          <SuggestionCard key={suggestion.id} suggestion={suggestion} />
        ))}
      </div>
    </div>
  );
}
