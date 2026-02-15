import React from 'react';
import { ABTest, Variant } from '../page'; // Import the new interfaces

interface TestDetailsProps {
  test: ABTest;
}

const TestDetails: React.FC<TestDetailsProps> = ({ test }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-[calc(100vh-180px)] overflow-auto">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-4">Test Details: {test.name}</h2>

      {/* Test Summary Card */}
      <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4">
        <h3 className="text-xl font-semibold text-blue-800 mb-2">Summary</h3>
        <p className="text-gray-700"><strong>Status:</strong> {test.status}</p>
        {/* Removing old mock summary fields like dates and hypothesis as they are not in new API */}
      </div>

      {/* Variant Comparison Section */}
      <h3 className="text-2xl font-bold text-gray-800 mb-3">Variant Comparison</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Variant
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Impressions
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Conversions
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CTR
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statistical Significance
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {test.variants.map((variant: Variant) => (
              <tr key={variant.name}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {variant.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{variant.impressions.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{variant.conversions.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{variant.ctr}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{variant.statisticalSignificance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TestDetails;
