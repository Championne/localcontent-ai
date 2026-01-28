
import React, { useState } from 'react';

interface KeywordSelectorProps {
  onKeywordsChange: (keywords: string[]) => void;
  initialKeywords?: string[];
}

const mockKeywords = [
  'Schadeverhaal',
  'Letselschade',
  'Ongeval',
  'Verkeersongeval',
  'Aansprakelijkheid',
  'Smartengeld',
  'Letsel',
  'Juridisch advies',
  'Verzekering',
];

export const KeywordSelector: React.FC<KeywordSelectorProps> = ({ onKeywordsChange, initialKeywords = [] }) => {
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>(initialKeywords);

  const handleKeywordToggle = (keyword: string) => {
    const newSelectedKeywords = selectedKeywords.includes(keyword)
      ? selectedKeywords.filter((k) => k !== keyword)
      : [...selectedKeywords, keyword];
    setSelectedKeywords(newSelectedKeywords);
    onKeywordsChange(newSelectedKeywords);
  };

  return (
    <div className="border p-4 rounded-md">
      <h3 className="text-lg font-semibold mb-2">Select Keywords</h3>
      <div className="flex flex-wrap gap-2">
        {mockKeywords.map((keyword) => (
          <button
            key={keyword}
            type="button"
            onClick={() => handleKeywordToggle(keyword)}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedKeywords.includes(keyword)
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {keyword}
          </button>
        ))}
      </div>
    </div>
  );
};
