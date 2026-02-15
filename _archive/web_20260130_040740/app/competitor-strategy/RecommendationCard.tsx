import React from 'react';
import { CompetitorAnalysis } from '../../pages/api/competitor-strategies';

interface CompetitorAnalysisCardProps {
  analysis: CompetitorAnalysis;
}

const CompetitorAnalysisCard: React.FC<CompetitorAnalysisCardProps> = ({ analysis }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-4">
      <h3 className="text-xl font-bold text-gray-800 mb-2">Competitor: {analysis.competitorName}</h3>
      <p className="text-gray-700 mt-2"><strong>Strategy Summary:</strong> {analysis.strategySummary}</p>

      <div className="mt-4">
        <h4 className="text-lg font-semibold text-gray-800">Strengths:</h4>
        <ul className="list-disc list-inside ml-4">
          {analysis.strengths.map((strength, index) => (
            <li key={index} className="text-gray-700">{strength}</li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <h4 className="text-lg font-semibold text-gray-800">Weaknesses:</h4>
        <ul className="list-disc list-inside ml-4">
          {analysis.weaknesses.map((weakness, index) => (
            <li key={index} className="text-gray-700">{weakness}</li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <h4 className="text-lg font-semibold text-gray-800">Recommendations:</h4>
        <ul className="list-disc list-inside ml-4">
          {analysis.recommendations.map((recommendation, index) => (
            <li key={index} className="text-gray-700">{recommendation}</li>
          ))}
        </ul>
      </div>

      <p className="text-sm text-gray-500 mt-4">Last Updated: {new Date(analysis.lastUpdated).toLocaleString()}</p>
    </div>
  );
};

export default CompetitorAnalysisCard;
