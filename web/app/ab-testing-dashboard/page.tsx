import React, { useState, useEffect, useMemo, useCallback } from 'react';
import TestSelector from './components/TestSelector';
import TestDetails from './components/TestDetails';

// --- New Interfaces (matching API response) ---
export interface Variant {
  name: string;
  impressions: number;
  conversions: number;
  ctr: string; // Click-Through Rate
  statisticalSignificance: string; // e.g., '95%', 'Not Significant'
}

export interface ABTest {
  id: string;
  name: string;
  status: 'Running' | 'Completed' | 'Draft';
  variants: Variant[];
}
// -- End New Interfaces ---

// --- Loading Skeleton Components ---
const TestSelectorSkeleton: React.FC = () => (
  <div className="bg-white p-4 rounded-lg shadow-md animate-pulse  h-[calc(100vh-180px)]">
    <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 bg-gray-100 rounded"></div>
      ))}
    </div>
  </div>
);

const TestDetailsSkeleton: React.FC = () => (
  <div className="bg-white p-6 rounded-lg shadow-md animate-pulse h-[calc(100vh-180px)]">
    <div className="h-10 bg-gray-200 rounded w-2/3 mb-6"></div>
    <div className="space-y-4">
      <div className="h-6 bg-gray-100 rounded w-1/4"></div>
      <div className="h-6 bg-gray-100 rounded w-1/2"></div>
      <div className="h-40 bg-gray-100 rounded"></div>
      <div className="h-6 bg-gray-100 rounded w-full"></div>
      <div className="h-20 bg-gray-100 rounded"></div>
    </div>
  </div>
);
// -- End Loading Skeleton Components ---

const AbTestingDashboardPage: React.FC = () => {
  const [abTests, setAbTests] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Running' | 'Completed' | 'Draft'>('All');

  useEffect(() => {
    const fetchAbTests = async () => {
      try {
        const response = await fetch('/api/ab-test-results');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: ABTest[] = await response.json();
        setAbTests(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAbTests();
  }, []);

  const filteredTests = useMemo(() => {
    if (filterStatus === 'All') {
      return abTests;
    }
    return abTests.filter(test => test.status === filterStatus);
  }, [abTests, filterStatus]);

  useEffect(() => {
    if (filteredTests.length > 0 && !selectedTestId) {
      setSelectedTestId(filteredTests[0].id);
    } else if (filteredTests.length === 0) {
      setSelectedTestId(null);
    }
  }, [filteredTests, selectedTestId]);

  const selectedTest = useMemo<ABTest | undefined>(() => {
    return filteredTests.find((test) => test.id === selectedTestId);
  }, [selectedTestId, filteredTests]);

  const handleSelectTest = useCallback((testId: string) => {
    setSelectedTestId(testId);
  }, []);

  const handleFilterChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const newFilterStatus = event.target.value as 'All' | 'Running' | 'Completed' | 'Draft';
    setFilterStatus(newFilterStatus);
    // Reset selectedTestId if the current one is no longer in filteredTests
    if (selectedTestId) {
      if (!filteredTests.some(test => test.id === selectedTestId && (newFilterStatus === 'All' || test.status === newFilterStatus))) {
        setSelectedTestId(null); 
      }
    }
  }, [filteredTests, selectedTestId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-8">A/B Testing Dashboard</h1>
        <div className="mb-6 flex items-center space-x-4">
          <div className="h-8 bg-gray-200 rounded w-32"></div>
          <div className="h-10 bg-gray-200 rounded w-48"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1"><TestSelectorSkeleton /></div>
          <div className="lg:col-span-2"><TestDetailsSkeleton /></div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="min-h-screen bg-gray-100 p-8 text-center text-xl font-semibold text-red-600">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-8">A/B Testing Dashboard</h1>

      <div className="mb-6 flex items-center space-x-4">
        <label htmlFor="status-filter" className="text-lg font-medium text-gray-700">Filter by Status:</label>
        <select
          id="status-filter"
          className="block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          onChange={handleFilterChange}
          value={filterStatus}
        >
          <option value="All">All</option>
          <option value="Running">Running</option>
          <option value="Completed">Completed</option>
          <option value="Draft">Draft</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <TestSelector
            tests={filteredTests.map(({ id, name, status }) => ({ id, name, status }))}
            onSelectTest={handleSelectTest}
            selectedTestId={selectedTestId}
          />
        </div>
        <div className="lg:col-span-2">
          {selectedTest ? (
            <TestDetails test={selectedTest} />
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-center h-full">
              <p className="text-gray-500 text-lg">
                {filterStatus === 'All'
                  ? 'Please select an A/B test from the left.'
                  : `No '${filterStatus}' tests found.`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AbTestingDashboardPage;
