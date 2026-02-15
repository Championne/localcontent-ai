import React, { useState } from 'react';

interface KeyStrategy {
  strategy: string;
  count: number;
  performance: string;
}

interface Competitor {
  id: string;
  name: string;
  website: string;
  overview: string;
  keyStrategies: KeyStrategy[];
  contentGapsIdentified: string[];
  keywordsTargeted: string[];
}

interface CompetitorCardProps {
  competitor: Competitor;
}

const CompetitorCard: React.FC<CompetitorCardProps> = ({ competitor }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 border-t-4 border-indigo-500 hover:shadow-2xl transition-shadow duration-300">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{competitor.name}</h2>
      <p className="text-indigo-600 mb-4">
        <a href={competitor.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
          {competitor.website}
        </a>
      </p>
      <p className="text-gray-700 mb-4 text-sm">{competitor.overview}</p>

      <div className="border-t border-gray-200 pt-4 mt-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-indigo-600 hover:text-indigo-800 focus:outline-none flex items-center mb-3 text-sm font-medium"
        >
          Key Strategies ({competitor.keyStrategies.length} found)
          <svg
            className={`ml-2 h-4 w-4 transform ${isExpanded ? 'rotate-180' : 'rotate-0'} transition-transform duration-300`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>

        {isExpanded && (
          <div className="mb-4">
            {competitor.keyStrategies.length > 0 ? (
              <ul className="list-disc list-inside text-gray-600 space-y-2 text-sm">
                {competitor.keyStrategies.map((strategy, idx) => (
                  <li key={idx}>
                    <span className="font-semibold">{strategy.strategy}</span>: {strategy.count} items, Performance: {strategy.performance}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">No specific key strategies identified.</p>
            )}
          </div>
        )}

        <h3 className="text-md font-semibold text-gray-800 mb-2">Content Gaps Identified:</h3>
        {competitor.contentGapsIdentified.length > 0 ? (
          <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1 text-sm">
            {competitor.contentGapsIdentified.map((gap, idx) => (
              <li key={idx}>{gap}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 mb-4 text-sm">No content gaps identified.</p>
        )}

        <h3 className="text-md font-semibold text-gray-800 mb-2">Keywords Targeted:</h3>
        {competitor.keywordsTargeted.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-2">
            {competitor.keywordsTargeted.map((keyword, idx) => (
              <span
                key={idx}
                className="bg-gray-200 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full"
              >
                {keyword}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No keywords targeted.</p>
        )}
      </div>
    </div>
  );
};

export default CompetitorCard;
