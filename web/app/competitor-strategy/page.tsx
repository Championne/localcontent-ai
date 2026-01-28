import React, { useState, useEffect } from 'react';
import { Recommendation, CompetitorStrategyResponse } from '@/web/interfaces/CompetitorStrategy';
import RecommendationCard from './RecommendationCard';

const CompetitorStrategyPage: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/competitor-strategies');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: CompetitorStrategyResponse = await response.json();
        setRecommendations(data.recommendations);
      } catch (err: any) {
        console.error("Failed to fetch competitor strategy data:", err);
        setError(err.message || "An unknown error occurred while fetching data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">Content Strategy Recommendations</h1>

      {isLoading && (
        <div className="flex justify-center items-center h-48">
          <p className="text-gray-600 text-lg">Loading recommendations...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {!isLoading && !error && recommendations.length === 0 && (
        <div className="flex justify-center items-center h-48">
          <p className="text-gray-600 text-lg">No competitor strategy recommendations found at this time.</p>
        </div>
      )}

      {!isLoading && !error && recommendations.length > 0 && (
        <div className="max-w-4xl mx-auto grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
          {recommendations.map((rec) => (
            <RecommendationCard key={rec.id} recommendation={rec} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CompetitorStrategyPage;
