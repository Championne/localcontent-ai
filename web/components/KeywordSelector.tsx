import React from 'react';

interface KeywordSelectorProps {
  onKeywordsChange: (keywords: string[]) => void;
  selectedKeywords: string[];
}

const KeywordSelector: React.FC<KeywordSelectorProps> = ({ onKeywordsChange, selectedKeywords }) => {
  const availableKeywords = ['AI', 'Content Marketing', 'SEO', 'Lead Generation', 'Marketing Strategy'];

  const handleKeywordToggle = (keyword: string) => {
    if (selectedKeywords.includes(keyword)) {
      onKeywordsChange(selectedKeywords.filter(k => k !== keyword));
    } else {
      onKeywordsChange([...selectedKeywords, keyword]);
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-gray-700 text-sm font-bold mb-2">Select Keywords</label>
      <div className="flex flex-wrap gap-2">
        {availableKeywords.map(keyword => (
          <button
            key={keyword}
            type="button"
            onClick={() => handleKeywordToggle(keyword)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 \
              ${selectedKeywords.includes(keyword)
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}\n            `}
          >
            {keyword}
          </button>
        ))}
      </div>
    </div>
  );
};

export default KeywordSelector;
