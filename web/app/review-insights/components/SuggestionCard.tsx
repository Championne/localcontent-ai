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
