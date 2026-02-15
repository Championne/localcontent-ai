import React, { useEffect, useState } from 'react';
import { ReviewInsightsData } from '../pages/api/review-insights'; // Import from the new API route

// Placeholder for SentimentSummaryCard and SuggestionCard if they don't exist yet
const SentimentSummaryCard = ({ title, score, description, isNumeric }: any) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-2xl font-bold text-blue-600">{isNumeric ? score : (score ? score.charAt(0).toUpperCase() + score.slice(1) : '')}</p>
    <p className="text-gray-600 mt-2">{description}</p>
  </div>
);

// Placeholder for SuggestionCard
const SuggestionCard = ({ suggestion }: any) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h3 className="text-xl font-semibold mb-2">{suggestion.category}</h3>
    <p>Sentiment: {suggestion.sentiment}</p>
    <p>Count: {suggestion.count}</p>
    <p>Keywords: {suggestion.keywords.join(', ')}</p>
  </div>
);


export default function ReviewInsightsPage() {
  const [insights, setInsights] = useState<ReviewInsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getInsights = async () => {
      try {
        const response = await fetch('/api/review-insights'); // Fetch from the new API route
        if (!response.ok) {
          throw new Error('Network response was not ok');
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

      {/* Optional: Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <SentimentSummaryCard
          title="Overall Sentiment"
          score={insights.overallSentiment} // Use camelCase
          description="Average sentiment across all analyzed reviews."
        />
        <SentimentSummaryCard
          title="Total Reviews Analyzed"
          score={insights.totalReviewsAnalyzed} // Use camelCase
          description="Number of reviews processed by the analyzer."
          isNumeric={true}
        />
      </div>

      <h2 className="text-3xl font-semibold mb-6">Category-wise Insights</h2> {/* Changed heading */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {insights.categoryInsights.map((insight, index) => ( // Iterate over categoryInsights
          <SuggestionCard key={index} suggestion={insight} /> // Use insight for SuggestionCard
        ))}
      </div>
    </div>
  );
}