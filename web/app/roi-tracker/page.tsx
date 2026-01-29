// localcontent_ai/web/app/roi-tracker/page.tsx

'use client';

import { useEffect, useState, useMemo } from 'react';

// Assuming ROIMetrics interface is defined in a shared type file or directly in the API route for now
interface ROIMetrics {
  contentId: string; // Added contentId
  calculatedROI: number; // For sorting purposes
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
  const [allRoiMetrics, setAllRoiMetrics] = useState<ROIMetrics[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for filters and sorting
  const [filterContentId, setFilterContentId] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('contentId'); // Default sort
  const [sortOrder, setSortOrder] = useState<string>('asc'); // Default order

  useEffect(() => {
    const fetchROIMetrics = async () => {
      try {
        // Assuming the API now returns an array of ROI metrics for different content_ids
        // Example mock data if API is not yet implemented or returns a single object:
        const mockData: ROIMetrics[] = [
          {
            contentId: 'content-1',
            calculatedROI: 12000,
            totalRevenue: 50000,
            totalCost: 20000,
            roiPercentage: 150,
            dataPoints: [
              { date: '2023-01-01', revenue: 5000, cost: 2000 },
              { date: '2023-01-02', revenue: 7000, cost: 3000 },
              { date: '2023-01-03', revenue: 10000, cost: 4000 },
            ],
          },
          {
            contentId: 'content-2',
            calculatedROI: 8000,
            totalRevenue: 30000,
            totalCost: 15000,
            roiPercentage: 100,
            dataPoints: [
              { date: '2023-01-01', revenue: 3000, cost: 1500 },
              { date: '2023-01-02', revenue: 5000, cost: 2500 },
              { date: '2023-01-03', revenue: 4000, cost: 2000 },
            ],
          },
          {
            contentId: 'another-content-3',
            calculatedROI: 25000,
            totalRevenue: 80000,
            totalCost: 30000,
            roiPercentage: 166,
            dataPoints: [
              { date: '2023-01-01', revenue: 10000, cost: 5000 },
              { date: '2023-01-02', revenue: 15000, cost: 7000 },
              { date: '2023-01-03', revenue: 20000, cost: 8000 },
              { date: '2023-01-04', revenue: 25000, cost: 10000 },
            ],
          },
          {
            contentId: 'negative-roi-4',
            calculatedROI: -5000,
            totalRevenue: 10000,
            totalCost: 15000,
            roiPercentage: -33,
            dataPoints: [
              { date: '2023-01-01', revenue: 2000, cost: 3000 },
              { date: '2023-01-02', revenue: 3000, cost: 4000 },
              { date: '2023-01-03', revenue: 5000, cost: 8000 },
            ],
          },
        ];


        const response = await fetch('/api/roi-metrics');
        if (response.ok) {
          const data = await response.json();
          // Assuming data might be an array or a single object. If single, convert to array for consistency.
          setAllRoiMetrics(Array.isArray(data) ? data : [data]);
        } else {
             // Fallback to mock data if API call fails for demonstration
            console.warn(`API call to /api/roi-metrics failed with status ${response.status}. Using mock data.`);
            setAllRoiMetrics(mockData);
        }

      } catch (e: any) {
        setError(e.message);
        // Fallback to mock data if there's an error during fetch
        console.error("Error fetching ROI metrics, falling back to mock data:", e);
        setAllRoiMetrics(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchROIMetrics();
  }, []);

  // Filter and sort logic
  const filteredAndSortedMetrics = useMemo(() => {
    let filtered = allRoiMetrics.filter(metric =>
      filterContentId ? metric.contentId.toLowerCase().includes(filterContentId.toLowerCase()) : true
    );

    filtered.sort((a, b) => {
      let valA: any;
      let valB: any;

      if (sortBy === 'calculatedROI') {
        valA = a.calculatedROI;
        valB = b.calculatedROI;
      } else if (sortBy === 'totalRevenue') {
        valA = a.totalRevenue;
        valB = b.totalRevenue;
      } else { // Default to contentId
        valA = a.contentId;
        valB = b.contentId;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [allRoiMetrics, filterContentId, sortBy, sortOrder]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-6">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6 animate-pulse"></div> {/* Skeleton for title */}

          {/* Skeleton for Filter and Sort Controls */}
          <div className="mb-6 p-4 border rounded-md bg-gray-50 flex flex-wrap items-center gap-4">
            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-28 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>

          {/* Skeleton for multiple metric cards */}
          {[...Array(2)].map((_, i) => ( // Show a couple of skeleton cards
            <div key={i} className="mb-8 p-6 border rounded-lg shadow-sm bg-white">
              <div className="h-7 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div> {/* Skeleton for Content ID title */}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="bg-gray-50 p-4 rounded-md shadow">
                    <div className="h-5 bg-gray-200 rounded w-1/2 mb-2 animate-pulse"></div>
                    <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  </div>
                ))}
              </div>

              <div className="h-6 bg-gray-200 rounded w-1/3 mb-3 animate-pulse"></div> {/* Skeleton for Historical Data title */}
              <div className="overflow-x-auto mb-4">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr>
                      {[...Array(4)].map((_, k) => (
                        <th key={k} className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-sm font-semibold text-gray-600">
                          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(3)].map((_, l) => (
                      <tr key={l} className="hover:bg-gray-50">
                        {[...Array(4)].map((_, m) => (
                          <td key={m} className="py-2 px-4 border-b border-gray-200 text-sm text-gray-800">
                            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Skeleton for ROI Trend Chart */}
              <div className="mt-4 p-2 bg-gray-50 rounded-md">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-2 animate-pulse"></div>
                {[...Array(3)].map((_, n) => (
                  <div key={n} className="flex items-center text-sm mb-1">
                    <div className="w-20 mr-2 h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="flex-grow h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  // Visualization helper (simple HTML bar chart)
  const renderROIBarChart = (dataPoints: Array<{ date: string; revenue: number; cost: number }>) => {
    if (!dataPoints || dataPoints.length === 0) return <p className="text-gray-500">No data points for visualization.</p>;

    const profits = dataPoints.map(dp => dp.revenue - dp.cost);
    const maxProfit = Math.max(...profits);
    const minProfit = Math.min(...profits);
    const range = maxProfit - minProfit;

    return (
      <div className="mt-4 p-2 bg-gray-50 rounded-md">
        <h4 className="text-md font-semibold text-gray-800 mb-2">ROI Trend Over Time</h4>
        {dataPoints.map((dp, index) => {
          const profit = dp.revenue - dp.cost;
          let barWidth = 0;
          if (range > 0) {
              barWidth = ((profit - minProfit) / range) * 90 + 10; // Scale to 10-100%
          } else if (range === 0) {
              barWidth = profit >= 0 ? 50 : 20; // Fixed width for uniform data, differentiate positive/negative/zero
          }


          const barColor = profit >= 0 ? 'bg-green-400' : 'bg-red-400';

          return (
            <div key={index} className="flex items-center text-sm mb-1">
              <span className="w-20 mr-2 text-gray-600 flex-shrink-0">{dp.date}:</span>
              <div className="flex-grow bg-gray-200 rounded h-4 overflow-hidden relative">
                <div
                  className={`${barColor} h-full`}
                  style={{ width: `${barWidth}%` }}
                  title={`Profit: $${profit.toLocaleString()}`}
                ></div>
                <span className="absolute left-1/2 top-0 -translate-x-1/2 text-xs font-medium text-white mix-blend-difference">
                    {profit >= 0 ? `+$${profit.toLocaleString()}` : `-$${Math.abs(profit).toLocaleString()}`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-6"> {/* Increased max-w */}
        <h1 className="text-3xl font-bold text-gray-800 mb-6">ROI Tracker Dashboard</h1>

        {/* Filter and Sort Controls */}
        <div className="mb-6 p-4 border rounded-md bg-gray-50 flex flex-wrap items-center gap-4">
          <div>
            <label htmlFor="contentIdFilter" className="block text-sm font-medium text-gray-700">Filter by Content ID:</label>
            <input
              type="text"
              id="contentIdFilter"
              className="mt-1 block w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              value={filterContentId}
              onChange={(e) => setFilterContentId(e.target.value)}
              placeholder="e.g., content-123"
            />
          </div>

          <div>
            <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700">Sort By:</label>
            <select
              id="sortBy"
              className="mt-1 block w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="contentId">Content ID</option>
              <option value="calculatedROI">Calculated ROI</option>
              <option value="totalRevenue">Total Revenue</option>
            </select>
          </div>

          <div>
            <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700">Sort Order:</label>
            <select
              id="sortOrder"
              className="mt-1 block w-32 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>

        {filteredAndSortedMetrics.length === 0 && !loading && (
          <div className="p-4 text-center text-gray-500">No matching ROI Metrics found.</div>
        )}

        {filteredAndSortedMetrics.map((metric) => (
          <div key={metric.contentId} className="mb-8 p-6 border rounded-lg shadow-sm bg-white">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Content ID: {metric.contentId}</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 p-4 rounded-md shadow">
                <p className="text-lg font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-semibold text-blue-700">
                  ${metric.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-md shadow">
                <p className="text-lg font-medium text-gray-600">Total Cost</p>
                <p className="text-2xl font-semibold text-red-700">
                  ${metric.totalCost.toLocaleString()}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-md shadow">
                <p className="text-lg font-medium text-gray-600">Calculated ROI</p>
                <p className="text-2xl font-semibold text-green-700">
                  {metric.roiPercentage}% ($ {metric.calculatedROI.toLocaleString()})
                </p>
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-3">Historical Data for {metric.contentId}</h3>
            <div className="overflow-x-auto mb-4">
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
                  {metric.dataPoints.map((dataPoint, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-800">
                        {dataPoint.date}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-800">
                        ${dataPoint.revenue.toLocaleString()}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-800">
                        ${dataPoint.cost.toLocaleString()}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-800">
                        ${(dataPoint.revenue - dataPoint.cost).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ROI Trend Visualization */}
            {renderROIBarChart(metric.dataPoints)}
          </div>
        ))}
      </div>
    </div>
  );
}
