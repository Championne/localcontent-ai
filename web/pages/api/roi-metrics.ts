import { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import path from 'path';

// Define the ROIMetrics interface for type safety
export interface ROIMetrics {
  totalRevenue: number;
  totalCost: number;
  roiPercentage: number;
  dataPoints: Array<{
    date: string;
    revenue: number;
    cost: number;
  }>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ROIMetrics | { error: string }>
) {
  if (req.method === 'GET') {
    try {
      // Simulate Python script execution for now
      // In a real scenario, you would execute the Python script like this:
      // const pythonScriptPath = path.join(process.cwd(), 'localcontent_ai', 'scripts', 'roi_data_collector.py');
      // exec(`python3 ${pythonScriptPath}`, (error, stdout, stderr) => {
      //   if (error) {
      //     console.error(`exec error: ${error}`);
      //     return res.status(500).json({ error: 'Failed to execute Python script' });
      //   }
      //   if (stderr) {
      //     console.error(`stderr: ${stderr}`);
      //     // Depending on your script, stderr might not always be an error.
      //     // For now, treat it as a warning or part of the output if expected.
      //   }
      //   try {
      //     const pythonOutput: {
      //       revenue: number;
      //       cost: number;
      //       roi: number;
      //       historical_data: Array<{ date: string; revenue: number; cost: number }>;
      //     } = JSON.parse(stdout);

      //     const roiMetrics: ROIMetrics = {
      //       totalRevenue: pythonOutput.revenue,
      //       totalCost: pythonOutput.cost,
      //       roiPercentage: pythonOutput.roi,
      //       dataPoints: pythonOutput.historical_data.map(data => ({
      //         date: data.date,
      //         revenue: data.revenue,
      //         cost: data.cost,
      //       })),
      //     };
      //     res.status(200).json(roiMetrics);
      //   } catch (parseError) {
      //     console.error('Failed to parse Python script output:', parseError);
      //     res.status(500).json({ error: 'Failed to parse ROI data' });
      //   }
      // });

      // Mock data for demonstration
      const mockPythonOutput = {
        revenue: 150000,
        cost: 50000,
        roi: 200, // (150000 - 50000) / 50000 * 100
        historical_data: [
          { date: '2023-01-01', revenue: 10000, cost: 3000 },
          { date: '2023-02-01', revenue: 12000, cost: 3500 },
          { date: '2023-03-01', revenue: 15000, cost: 4000 },
          { date: '2023-04-01', revenue: 18000, cost: 4500 },
          { date: '2023-05-01', revenue: 20000, cost: 5000 },
          { date: '2023-06-01', revenue: 25000, cost: 6000 },
          { date: '2023-07-01', revenue: 30000, cost: 7000 },
          { date: '2023-08-01', revenue: 35000, cost: 8000 },
        ],
      };

      const roiMetrics: ROIMetrics = {
        totalRevenue: mockPythonOutput.revenue,
        totalCost: mockPythonOutput.cost,
        roiPercentage: mockPythonOutput.roi,
        dataPoints: mockPythonOutput.historical_data.map(data => ({
          date: data.date,
          revenue: data.revenue,
          cost: data.cost,
        })),
      };
      
      res.status(200).json(roiMetrics);

    } catch (error) {
      console.error('API route error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
