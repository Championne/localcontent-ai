import React, { useState, useEffect } from 'react';
import CompetitorAnalysisCard from './RecommendationCard'; // Renamed from RecommendationCard

// Import the CompetitorAnalysis type from the API route
import { CompetitorAnalysis } from '../../pages/api/competitor-strategies';

const CompetitorStrategyPage: React.FC = () => {
  const [competitorAnalyses, setCompetitorAnalyses] = useState<CompetitorAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompetitorStrategies = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/competitor-strategies');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: CompetitorAnalysis[] = await response.json();
        setCompetitorAnalyses(data);
      } catch (err: any) {
        setError(err.message || "An unknown error occurred while fetching competitor strategies.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompetitorStrategies();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold text-gray-700">Loading competitor strategies...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  if (competitorAnalyses.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold text-gray-700">No competitor strategy analyses found at this time.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Competitor Strategy Analyses</h1>
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {competitorAnalyses.map((analysis, index) => (
          <CompetitorAnalysisCard
            key={analysis.competitorName || index}
            analysis={analysis}
          />
        ))}
      </div>
    </div>
  );
};

export default CompetitorStrategyPage;
