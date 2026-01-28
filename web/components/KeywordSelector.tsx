import React, { useState, useEffect, useRef } from 'react';

interface KeywordSelectorProps {
  onKeywordsChange: (keywords: string[]) => void;
}

const LOCAL_STORAGE_KEY = 'localcontent_ai_selected_keywords';

const KeywordSelector: React.FC<KeywordSelectorProps> = ({ onKeywordsChange }) => {
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const isInitialMount = useRef(true); // To prevent saving on initial mount before keywords are loaded

  const availableKeywords = ['AI', 'Content Marketing', 'SEO', 'Lead Generation', 'Marketing Strategy'];

  // Effect for loading keywords from localStorage on mount
  useEffect(() => {
    try {
      const storedKeywords = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedKeywords) {
        const parsedKeywords: string[] = JSON.parse(storedKeywords);
        setSelectedKeywords(parsedKeywords);
        onKeywordsChange(parsedKeywords); // Notify parent of loaded keywords
      }
    } catch (error) {
      console.error("Failed to parse stored keywords from localStorage:", error);
      setSelectedKeywords([]);
      onKeywordsChange([]);
      setSaveStatus('error'); // Indicate error during load
    }
  }, []); // Empty dependency array means this runs once on mount

  // Effect for saving keywords to localStorage whenever selectedKeywords changes
  // and manage save status feedback
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return; // Do not save on initial mount, wait for keywords to be loaded or user interaction
    }

    setSaveStatus('saving'); // Indicate saving in progress
    const saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(selectedKeywords));
        setSaveStatus('saved');
        const displayTimer = setTimeout(() => setSaveStatus('idle'), 2000); // Show 'Saved!' for 2 seconds
        return () => clearTimeout(displayTimer);
      } catch (error) {
        console.error("Failed to save keywords to localStorage:", error);
        setSaveStatus('error'); // Indicate save error
      }
    }, 500); // Debounce saving to avoid rapid writes and UI flashes

    return () => clearTimeout(saveTimer); // Cleanup debounce timer
  }, [selectedKeywords]); // Runs whenever selectedKeywords state changes

  const handleKeywordToggle = (keyword: string) => {
    const newKeywords = selectedKeywords.includes(keyword)
      ? selectedKeywords.filter(k => k !== keyword)
      : [...selectedKeywords, keyword];
    setSelectedKeywords(newKeywords);
    onKeywordsChange(newKeywords); // Notify parent of the change
  };

  return (
    <div className="mb-6">
      <label className="block text-gray-700 text-sm font-bold mb-2">Select Keywords</label>
      <div className="flex flex-wrap gap-2">
        {availableKeywords.map(keyword => (
          <button
            key={keyword}
            type="button围绕
            onClick={() => handleKeywordToggle(keyword)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 \
              ${selectedKeywords.includes(keyword)
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}\
            `}
          >
            {keyword}
          </button>
        ))}
      </div>
      {saveStatus === 'saving' && (
        <p className="text-xs text-yellow-600 mt-2">Saving keywords...</p>
      )}
      {saveStatus === 'saved' && (
        <p className="text-xs text-green-500 mt-2">Keywords Saved!</p>
      )}
      {saveStatus === 'error' && (
        <p className="text-xs text-red-500 mt-2">Error saving/loading keywords.</p>
      )}
    </div>
  );
};

export default KeywordSelector;