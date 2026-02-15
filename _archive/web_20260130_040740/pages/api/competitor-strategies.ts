
import { NextApiRequest, NextApiResponse } from 'next';

// Define the CompetitorAnalysis type based on the expected frontend format
export type CompetitorAnalysis = {
  competitorName: string;
  strategySummary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  lastUpdated: string;
};

// In-memory cache
let cache: { data: CompetitorAnalysis[]; timestamp: number } | null = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CompetitorAnalysis[] | { error: string }>
) {
  if (req.method === 'GET') {
    // Check cache first
    if (cache && (Date.now() - cache.timestamp < CACHE_DURATION)) {
      console.log('Returning data from cache.');
      return res.status(200).json(cache.data);
    }

    // Simulate execution of competitor_analyzer.py
    // In a real scenario, you would use child_process.spawn to run the Python script.
    // For this task, we're mocking its output.
    try {
      // Mock Python script output
      const mockPythonOutput = {
        competitors: [
          {
            name: "Competitor A",
            summary: "Focuses on premium, high-quality products with strong brand loyalty.",
            advantages: ["Strong brand recognition", "High perceived value", "Excellent customer service"],
            disadvantages: ["High price point", "Limited product range", "Slow to innovate"],
            suggestions: ["Develop a more affordable product line", "Increase R&D investment"],
          },
          {
            name: "Competitor B",
            summary: "Aggressive pricing strategy with a wide distribution network.",
            advantages: ["Cost leadership", "Broad market reach", "Fast product iteration"],
            disadvantages: ["Lower product quality", "Weak brand image", "Poor customer support"],
            suggestions: ["Improve product quality control", "Invest in brand building"],
          },
        ],
      };

      // Parse and transform to CompetitorAnalysis format
      const analysisData: CompetitorAnalysis[] = mockPythonOutput.competitors.map(comp => ({
        competitorName: comp.name,
        strategySummary: comp.summary,
        strengths: comp.advantages,
        weaknesses: comp.disadvantages,
        recommendations: comp.suggestions,
        lastUpdated: new Date().toISOString(),
      }));

      // Update cache
      cache = { data: analysisData, timestamp: Date.now() };
      console.log('Fetched new data and updated cache.');

      res.status(200).json(analysisData);
    } catch (error) {
      console.error('Error fetching competitor strategies:', error);
      res.status(500).json({ error: 'Failed to fetch competitor strategies' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
