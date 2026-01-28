import React from 'react';
import { Recommendation } from '@/web/interfaces/CompetitorStrategy';

interface RecommendationCardProps {
  recommendation: Recommendation;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation }) => {
  const getPriorityClasses = (priority: Recommendation['priority']) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-orange-100 text-orange-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-4">
      <div className="flex justify-between items-start mb-2">
        <span className="text-sm font-semibold text-gray-600">{recommendation.competitorName}</span>
        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getPriorityClasses(recommendation.priority)}`}>
          {recommendation.priority}
        </span>
      </div>
      <h3 className="text-xl font-bold text-gray-800 my-2">{recommendation.recommendedAction}</h3>
      <p className="text-gray-700 mt-2">{recommendation.description}</p>
      {recommendation.keywords && recommendation.keywords.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {recommendation.keywords.map((keyword, index) => (
            <span key={index} className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">
              {keyword}
            </span>
          ))}
        </div>
      )}
      {recommendation.targetUrl && (
        <a
          href={recommendation.targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline mt-4 block"
        >
          {recommendation.recommendedAction === 'Improve Existing Content' || recommendation.recommendedAction === 'Expand Topic'
            ? 'View / Improve Content' : 'Learn More'}
        </a>
      )}
    </div>
  );
};

export default RecommendationCard;
