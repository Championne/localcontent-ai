"use client";

import { useState } from 'react';

interface ReviewInsight {
  id: string;
  title: string;
  description: string;
  reviewCount: number;
  overallSentiment: 'Positive' | 'Negative' | 'Neutral';
  sentimentScore: number;
  impactScore: 'High' | 'Medium' | 'Low';
  actionItems: string[];
  exampleSnippets: Array<{
    text: string;
    sentiment: 'Positive' | 'Negative' | 'Neutral';
  }>;
}

interface ReviewInsightCardProps {
  insight: ReviewInsight;
}

const ReviewInsightCard: React.FC<ReviewInsightCardProps> = ({ insight }) => {
  const [showSnippets, setShowSnippets] = useState(false);

  const sentimentColorClass = {
    Positive: 'text-green-600',
    Negative: 'text-red-600',
    Neutral: 'text-gray-600',
  };

  const sentimentEmoji = {
    Positive: '✅',
    Negative: '❌',
    Neutral: ' neutrality',
  };

  const impactColorClass = {
    High: 'bg-red-200 text-red-800',
    Medium: 'bg-yellow-200 text-yellow-800',
    Low: 'bg-green-200 text-green-800',
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200 ease-in-out">
      <h3 className="text-xl font-semibold mb-2 text-gray-800">{insight.title}</h3>
      <p className="text-gray-600 mb-4 text-sm">{insight.description}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-4">
        <div className="flex items-center">
          <span className="font-medium text-gray-700">Reviews Mentioning:</span>
          <span className="ml-2 bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full text-xs font-semibold">
            {insight.reviewCount}
          </span>
        </div>
        <div className="flex items-center">
          <span className="font-medium text-gray-700">Overall Sentiment:</span>
          <span className={`ml-2 text-xs font-semibold ${sentimentColorClass[insight.overallSentiment]}`}>
            {sentimentEmoji[insight.overallSentiment]} {insight.overallSentiment} ({Math.abs(insight.sentimentScore * 100).toFixed(0)}%)
          </span>
        </div>
        <div className="flex items-center">
          <span className="font-medium text-gray-700">Impact Score:</span>
          <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-semibold ${impactColorClass[insight.impactScore]}`}>
            {insight.impactScore}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-lg font-medium text-gray-700 mb-2">Suggested Actions</h4>
        <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
          {insight.actionItems.map((action, index) => (
            <li key={index}>{action}</li>
          ))}
        </ul>
      </div>

      <div>
        <button
          onClick={() => setShowSnippets(!showSnippets)}
          className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium focus:outline-none"
        >
          Supporting Review Snippets
          <svg
            className={`w-4 h-4 ml-1 transform transition-transform duration-200 ${
              showSnippets ? 'rotate-90' : ''
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            ></path>
          </svg>
        </button>
        {showSnippets && (
          <div className="mt-3 bg-gray-50 p-3 rounded-md border border-gray-100">
            {insight.exampleSnippets.map((snippet, index) => (
              <p key={index} className="text-gray-700 text-xs mb-2 last:mb-0 italic">
                "{snippet.text}"{' '}
                <span className={`${sentimentColorClass[snippet.sentiment]}`}>
                  ({snippet.sentiment})
                </span>
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewInsightCard;
