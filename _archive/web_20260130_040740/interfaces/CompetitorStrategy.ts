// interfaces/CompetitorStrategy.ts
export interface Recommendation {
  id: string;
  competitorName: string;
  recommendedAction: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  keywords: string[];
  targetUrl?: string; // Optional URL for "Improve Existing Content" or "Expand Topic"
  opportunityScore: number; // New field for mock opportunity score
}

export interface CompetitorStrategyResponse {
  recommendations: Recommendation[];
}
