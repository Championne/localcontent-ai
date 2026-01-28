// localcontent_ai/web/app/roi-tracker/page.tsx

'use client';

import { useEffect, useState } from 'react';
// Assuming ROIMetrics interface is defined in a shared type file or directly in the API route for now
// For a real project, you might extract this to a separate types.ts file
interface ROIMetrics {
  totalRevenue: number;
  totalCost: number;
  roiPercentage: number;
  dataPoints: Array<{
    date: string;
    revenue: number;
    cost: number;
  }>;
}

export default function ROITrackerPage() {
  const [roiMetrics, setRoiMetrics] = useState<ROIMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchROIMetrics = async () => {
      try {
        const response = await fetch('/api/roi-metrics');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: ROIMetrics = await response.json();
        setRoiMetrics(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchROIMetrics();
  }, []);

  if (loading) {
    return <div className="p-4">Loading ROI Metrics...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  if (!roiMetrics) {
    return <div className="p-4">No ROI Metrics available.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">ROI Tracker Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 p-4 rounded-md shadow">
            <p className="text-lg font-medium text-gray-600">Total Revenue</p>
            <p className="text-2xl font-semibold text-blue-700">${roiMetrics.totalRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-md shadow">
            <p className="text-lg font-medium text-gray-600">Total Cost</p>
            <p className="text-2xl font-semibold text-red-700">${roiMetrics.totalCost.toLocaleString()}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-md shadow">
            <p className="text-lg font-medium text-gray-600">ROI Percentage</p>
            <p className="text-2xl font-semibold text-green-700">{roiMetrics.roiPercentage}%</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-4">Historical Data</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-sm font-semibold text-gray-600">Date</th>
                <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-sm font-semibold text-gray-600">Revenue</th>
                <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-sm font-semibold text-gray-600">Cost</th>
                <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-sm font-semibold text-gray-600">Profit</th>
              </tr>
            </thead>
            <tbody>
              {roiMetrics.dataPoints.map((dataPoint, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-800">{dataPoint.date}</td>
                  <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-800">${dataPoint.revenue.toLocaleString()}</td>
                  <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-800">${dataPoint.cost.toLocaleString()}</td>
                  <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-800">${(dataPoint.revenue - dataPoint.cost).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
