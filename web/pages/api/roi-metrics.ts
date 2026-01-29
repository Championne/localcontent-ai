import { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import path from 'path';

// Define the structure for individual content's ROI metrics
export interface ContentROIMetrics {
  contentId: string;
  name: string; // Add a name for the content for better readability
  totalRevenue: number;
  totalCost: number;
  roiPercentage: number;
  dataPoints: Array<{
    date: string;
    revenue: number;
    cost: number;
  }>;
}

// The API will now return an array of these content-specific metrics
export type ROIMetricsResponse = ContentROIMetrics[];

// Helper function to generate more realistic mock data
const generateMockContentROIMetrics = (numContents: number = 3): ContentROIMetrics[] => {
  const allContentMetrics: ContentROIMetrics[] = [];
  const startDate = new Date('2023-01-01');

  for (let i = 1; i <= numContents; i++) {
    const contentId = `content_${String(i).padStart(3, '0')}`;
    const contentName = `Marketing Campaign ${i}`;
    let totalRevenue = 0;
    let totalCost = 0;
    const dataPoints: Array<{ date: string; revenue: number; cost: number }> = [];

    // Simulate 8-12 months of historical data
    const numMonths = 8 + Math.floor(Math.random() * 5); // 8 to 12 months

    for (let month = 0; month < numMonths; month++) {
      const currentDate = new Date(startDate);
      currentDate.setMonth(startDate.getMonth() + month);
      const dateString = currentDate.toISOString().split('T')[0];

      // Simulate trending data for different content IDs
      let revenue: number;
      let cost: number;

      if (i === 1) { // Steadily increasing ROI
        revenue = 10000 + month * 2000 + Math.random() * 1000;
        cost = 3000 + month * 500 + Math.random() * 200;
      } else if (i === 2) { // Fluctuating but generally stable ROI
        revenue = 15000 + Math.sin(month / 2) * 4000 + Math.random() * 1500;
        cost = 4000 + Math.cos(month / 2) * 800 + Math.random() * 300;
      } else if (i === 3) { // Initial high, then decreasing ROI post-peak
        revenue = 25000 - month * 1500 + Math.random() * 2000;
        cost = 6000 + month * 300 + Math.random() * 400;
      } else { // Generic increasing trend for any additional content
        revenue = 8000 + month * 1800 + Math.random() * 900;
        cost = 2500 + month * 450 + Math.random() * 150;
      }

      revenue = Math.round(Math.max(0, revenue)); // Ensure non-negative
      cost = Math.round(Math.max(0, cost)); // Ensure non-negative

      dataPoints.push({
        date: dateString,
        revenue,
        cost,
      });
      totalRevenue += revenue;
      totalCost += cost;
    }

    const roiPercentage = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0;

    allContentMetrics.push({
      contentId,
      name: contentName,
      totalRevenue: Math.round(totalRevenue),
      totalCost: Math.round(totalCost),
      roiPercentage: parseFloat(roiPercentage.toFixed(2)), // Round to 2 decimal places
      dataPoints,
    });
  }
  return allContentMetrics;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ROIMetricsResponse | { error: string }>
) {
  if (req.method === 'GET') {
    try {
      // For now, we will always return mock data.
      // In a real scenario, you would conditionally execute the Python script
      // or fetch from a database.

      // Generate mock data for multiple content items
      const mockROIMetrics: ROIMetricsResponse = generateMockContentROIMetrics(5); // Generate data for 5 content items

      res.status(200).json(mockROIMetrics);

    } catch (error) {
      console.error('API route error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
