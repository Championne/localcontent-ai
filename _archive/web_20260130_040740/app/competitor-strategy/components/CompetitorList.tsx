import React from 'react';
import CompetitorCard from './CompetitorCard';

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

interface CompetitorListProps {
  competitors: Competitor[];
}

const CompetitorList: React.FC<CompetitorListProps> = ({ competitors }) => {
  return (
    <section>
      <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b border-gray-200 pb-3">
        Analyzed Competitors
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {competitors.map((competitor) => (
          <CompetitorCard key={competitor.id} competitor={competitor} />
        ))}
      </div>
    </section>
  );
};

export default CompetitorList;
