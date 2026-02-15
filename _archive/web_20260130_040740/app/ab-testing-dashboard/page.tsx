"use client";

import React, { useState, useEffect } from 'react';
import { AbTest, mockABTests, Variant } from '@/localcontent_ai/data/mockABTests';

// Determine variant comparison metrics
const getStatusColor = (status: AbTest['status']) => {
  switch (status) {
    case 'Running':
      return 'text-blue-600';
    case 'Completed':
      return 'text-green-600';
    case 'Paused':
      return 'text-yellow-600';
    default:
      return 'text-gray-600';
  }
};

interface TestSelectorProps {
  tests: AbTest[];
  onSelectTest: (id: string) => void;
  selectedTestId: string | null;
}

const TestSelector: React.FC<TestSelectorProps> = ({ tests, onSelectTest, selectedTestId }) => {
  const [filter, setFilter] = useState<'All' | AbTest['status']>('All');

  const filteredTests = tests.filter(test =>
    filter === 'All' ? true : test.status === filter
  );

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4">Select an A/B Test</h2>
      <div className="mb-4">
        <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700">Filter by Status:</label>
        <select
          id="status-filter"
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          value={filter}
          onChange={(e) => setFilter(e.target.value as 'All' | AbTest['status'])}
        >
          <option value="All">All</option>
          <option value="Running">Running</option>
          <option value="Completed">Completed</option>
          <option value="Paused">Paused</option>
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTests.map((test) => (
          <div
            key={test.id}
            className={`p-4 border rounded-lg cursor-pointer transition-all duration-200
              ${selectedTestId === test.id
                ? 'border-blue-500 ring-2 ring-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            onClick={() => onSelectTest(test.id)}
          >
            <h3 className="font-medium text-lg text-gray-900">{test.name}</h3>
            <p className={`text-sm ${getStatusColor(test.status)}`}>Status: {test.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

interface TestDetailsProps {
  test: AbTest;
}

const TestDetails: React.FC<TestDetailsProps> = ({ test }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{test.name}</h2>

      {/* Test Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-sm font-medium text-gray-500">Status</p>
          <p className={`text-lg font-semibold ${getStatusColor(test.status)}`}>{test.status}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-sm font-medium text-gray-500">Dates</p>
          <p className="text-lg font-semibold text-gray-900">{test.startDate} to {test.endDate}</p>
        </div>
      </div>
      <div className="bg-gray-50 p-4 rounded-md mb-6">
        <p className="text-sm font-medium text-gray-500">Hypothesis</p>
        <p className="text-base text-gray-800 italic">"{test.hypothesis}"</p>
      </div>

      {/* Variant Comparison */}
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Variant Comparison</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Variant
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sessions
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Clicks
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Conversions
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Conv. Rate
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CTR
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Uplift
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Significance
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {test.variants.map((variant, index) => (
              <tr key={index} className={variant.isWinning ? 'bg-green-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {variant.name} {variant.isWinning && <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Winning!</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{variant.sessions.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{variant.clicks.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{variant.conversions.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{variant.conversionRate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{variant.clickThroughRate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{variant.uplift || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{variant.statisticalSignificance || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AbTestingDashboardPage: React.FC = () => {
  const [abTests, setAbTests] = useState<AbTest[]>([]);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);

  useEffect(() => {
    // Load mock data
    setAbTests(mockABTests);
    if (mockABTests.length > 0) {
      setSelectedTestId(mockABTests[0].id); // Select the first test by default
    }
  }, []);

  const selectedTest = selectedTestId
    ? abTests.find((test) => test.id === selectedTestId)
    : null;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8">A/B Testing Dashboard</h1>

      <TestSelector
        tests={abTests}
        onSelectTest={setSelectedTestId}
        selectedTestId={selectedTestId}
      />

      {selectedTest ? (
        <TestDetails test={selectedTest} />
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md text-gray-600 text-center">
          Please select an A/B test from the list above to view details.
        </div>
      )}
    </div>
  );
};

export default AbTestingDashboardPage;
