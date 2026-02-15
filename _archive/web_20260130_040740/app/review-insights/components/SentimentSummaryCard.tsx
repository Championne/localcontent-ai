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
