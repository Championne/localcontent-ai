import React from 'react';
import { ABTest } from '../page'; // Import the new ABTest interface

interface TestSelectorProps {
  tests: Pick<ABTest, 'id' | 'name' | 'status'>[];
  onSelectTest: (testId: string) => void;
  selectedTestId: string | null;
}

const TestSelector: React.FC<TestSelectorProps> = ({ tests, onSelectTest, selectedTestId }) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md h-[calc(100vh-180px)] overflow-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Select an A/B Test</h2>
      <div className="space-y-3">
        {tests.map((test) => (
          <button
            key={test.id}
            className={`w-full text-left p-4 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
              ${selectedTestId === test.id
                ? 'border-blue-500 bg-blue-50 shadow-lg scale-102'
                : 'border-gray-200 bg-white hover:bg-gray-50 hover:shadow-md'
              }`}
            onClick={() => onSelectTest(test.id)}
          >
            <h3 className="font-semibold text-lg text-gray-900">{test.name}</h3>
            <p className={`text-sm mt-1
              ${test.status === 'Running' ? 'text-green-600'
                : test.status === 'Completed' ? 'text-purple-600'
                : 'text-yellow-600'
              }`}>
              Status: {test.status}
            </p>
          </button>
        ))}
      </div>
      {/* Removed the internal filter as it's handled by the parent page */}
    </div>
  );
};

export default TestSelector;
