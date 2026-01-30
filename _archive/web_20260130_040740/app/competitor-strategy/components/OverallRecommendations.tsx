import React from 'react';

interface Recommendation {
  recommendation: string;
  justification: string;
  priority: 'High' | 'Medium' | 'Low';
}

interface OverallRecommendationsProps {
  recommendations: Recommendation[];
}

const getPriorityClass = (priority: 'High' | 'Medium' | 'Low') => {
  switch (priority) {
    case 'High':
      return 'bg-red-100 text-red-800';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'Low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const OverallRecommendations: React.FC<OverallRecommendationsProps> = ({ recommendations }) => {
  return (
    <section className="mb-10">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b border-gray-200 pb-3">
        Our Top Recommendations
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((rec, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-md border border-gray-100 transform transition duration-300 ease-in-out hover:scale-105 hover:shadow-xl">
            <div className="flex justify-between items-center mb-3">
              <p className="text-lg font-semibold text-gray-900">{rec.recommendation}</p>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityClass(rec.priority)}`}>
                {rec.priority}
              </span>
            </div>
            <p className="text-gray-600 leading-relaxed text-sm">{rec.justification}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default OverallRecommendations;
