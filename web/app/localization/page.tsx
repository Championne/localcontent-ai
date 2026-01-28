''' 'use client';

import { useState } from 'react';

interface TranslationItem {
  id: number;
  originalContent: string;
  sourceLang: string;
  translations: { [key: string]: string };
}

export default function LocalizationPage() {
  const [activeSection, setActiveSection] = useState<'translate' | 'add' | 'update'>('translate');

  // State for the existing 'Translate Content' section
  const [content, setContent] = useState('');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLangs, setTargetLangs] = useState<string[]>(['es', 'fr']);
  const [translatedContent, setTranslatedContent] = useState<{[key: string]: string} | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for 'Add New Translation' section
  const [newOriginalContent, setNewOriginalContent] = useState('');
  const [newSourceLang, setNewSourceLang] = useState('en');
  const [newTargetLangs, setNewTargetLangs] = useState<string[]>(['es', 'fr']);
  
  // State for 'Update Existing Translations' section
  const [existingTranslations, setExistingTranslations] = useState<TranslationItem[]>([
    {
      id: 1,
      originalContent: 'Hello, world!',
      sourceLang: 'en',
      translations: { es: '¡Hola, mundo!', fr: 'Bonjour le monde!' }
    },
    {
      id: 2,
      originalContent: 'How are you?',
      sourceLang: 'en',
      translations: { es: '¿Cómo estás?', fr: 'Comment allez-vous?' }
    },
  ]);
  const [selectedTranslation, setSelectedTranslation] = useState<TranslationItem | null>(null);
  const [editedTranslations, setEditedTranslations] = useState<{[key: string]: string}>({});

  const handleTranslate = async (textToTranslate: string, srcLang: string, trgtLangs: string[], setState: (data: { [key: string]: string }) => void, setLoadingState: (loading: boolean) => void, setErrorState: (error: string | null) => void) => {
    setLoadingState(true);
    setErrorState(null);
    setState({}); // Clear previous translations

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: textToTranslate, source_lang: srcLang, target_langs: trgtLangs }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong during translation.');
      }

      setState(data.translatedContent);
    } catch (err: any) {
      setErrorState(err.message);
    } finally {
      setLoadingState(false);
    }
  };

  const handleTargetLangChange = (lang: string, isChecked: boolean, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((prev) => 
      isChecked ? [...prev, lang] : prev.filter((l) => l !== lang)
    );
  };

  const handleAddNewTranslation = async () => {
    if (!newOriginalContent || !newSourceLang || newTargetLangs.length === 0) {
      alert('Please fill in all fields and select at least one target language.');
      return;
    }

    setLoading(true); // Re-using existing loading state for the sake of simplicity
    setError(null);
    
    try {
      // Simulate API call for adding a new translation and getting its initial translations
      const newId = existingTranslations.length > 0 ? Math.max(...existingTranslations.map(t => t.id)) + 1 : 1;
      
      // Call the translation API for the new content
      await handleTranslate(
        newOriginalContent, 
        newSourceLang, 
        newTargetLangs, 
        (translatedData) => {
          const newItem: TranslationItem = {
            id: newId,
            originalContent: newOriginalContent,
            sourceLang: newSourceLang,
            translations: translatedData,
          };
          setExistingTranslations((prev) => [...prev, newItem]);
          setNewOriginalContent('');
          setNewSourceLang('en');
          setNewTargetLangs(['es', 'fr']);
          alert('New translation added successfully!');
        },
        setLoading,
        setError
      );

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectForUpdate = (item: TranslationItem) => {
    setSelectedTranslation(item);
    setEditedTranslations(item.translations);
  };

  const handleUpdateTranslationText = (lang: string, text: string) => {
    setEditedTranslations((prev) => ({ ...prev, [lang]: text }));
  };

  const handleSaveChanges = () => {
    if (selectedTranslation) {
      setExistingTranslations((prev) => 
        prev.map((item) => 
          item.id === selectedTranslation.id 
            ? { ...item, translations: editedTranslations } 
            : item
        )
      );
      setSelectedTranslation(null);
      setEditedTranslations({});
      alert('Translation updated successfully!');
    }
  };

  const allAvailableLangs = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh']; // Example languages

  const renderLanguageCheckboxes = (currentLangs: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => (
    <div className="flex flex-wrap gap-4">
      {allAvailableLangs.map(lang => (
        <label key={lang} className="inline-flex items-center">
          <input
            type="checkbox"
            className="form-checkbox h-5 w-5 text-blue-600"
            value={lang}
            checked={currentLangs.includes(lang)}
            onChange={(e) => handleTargetLangChange(lang, e.target.checked, setter)}
          />
          <span className="ml-2 text-gray-700">{lang.toUpperCase()}</span>
        </label>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Multi-Language Content Management</h1>

      <div className="mb-8 flex space-x-4">
        <button
          onClick={() => setActiveSection('translate')}
          className={`py-2 px-4 rounded-lg font-semibold ${activeSection === 'translate' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
        >
          Translate Content
        </button>
        <button
          onClick={() => setActiveSection('add')}
          className={`py-2 px-4 rounded-lg font-semibold ${activeSection === 'add' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
        >
          Add New Translation
        </button>
        <button
          onClick={() => setActiveSection('update')}
          className={`py-2 px-4 rounded-lg font-semibold ${activeSection === 'update' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
        >
          Update Existing Translations
        </button>
      </div>

      {activeSection === 'translate' && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Translate Content</h2>

          <div className="mb-4">
            <label htmlFor="content" className="block text-gray-700 text-sm font-bold mb-2">Original Content:</label>
            <textarea
              id="content"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter content to translate..."
            />
          </div>

          <div className="mb-4">
            <label htmlFor="sourceLang" className="block text-gray-700 text-sm font-bold mb-2">Source Language:</label>
            <input
              id="sourceLang"
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              placeholder="e.g., en, fr, es"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">Target Languages:</label>
            {renderLanguageCheckboxes(targetLangs, setTargetLangs)}
          </div>

          <button
            onClick={() => handleTranslate(content, sourceLang, targetLangs, setTranslatedContent, setLoading, setError)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            disabled={loading || targetLangs.length === 0}
          >
            {loading ? 'Translating...' : 'Translate'}
          </button>

          {error && <p className="text-red-500 mt-4">Error: {error}</p>}.
        </div>
      )}

      {activeSection === 'add' && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Add New Translation</h2>

          <div className="mb-4">
            <label htmlFor="newOriginalContent" className="block text-gray-700 text-sm font-bold mb-2">Original Content:</label>
            <textarea
              id="newOriginalContent"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows={4}
              value={newOriginalContent}
              onChange={(e) => setNewOriginalContent(e.target.value)}
              placeholder="Enter original content..."
            />
          </div>

          <div className="mb-4">
            <label htmlFor="newSourceLang" className="block text-gray-700 text-sm font-bold mb-2">Source Language:</label>
            <input
              id="newSourceLang"
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={newSourceLang}
              onChange={(e) => setNewSourceLang(e.target.value)}
              placeholder="e.g., en"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">Target Languages:</label>
            {renderLanguageCheckboxes(newTargetLangs, setNewTargetLangs)}
          </div>

          <button
            onClick={handleAddNewTranslation}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            disabled={loading || newTargetLangs.length === 0} // Re-using loading state
          >
            {loading ? 'Adding & Translating...' : 'Add New Translation'}
          </button>

          {error && <p className="text-red-500 mt-4">Error: {error}</p>}
        </div>
      )}

      {activeSection === 'update' && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Update Existing Translations</h2>

          {!selectedTranslation ? (
            <div>
              {existingTranslations.length === 0 ? (
                <p className="text-gray-600">No existing translations to update.</p>
              ) : (
                <ul className="space-y-4">
                  {existingTranslations.map((item) => (
                    <li key={item.id} className="p-4 border border-gray-200 rounded-md bg-gray-50 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-800">Original ({item.sourceLang.toUpperCase()}): {item.originalContent}</p>
                        <p className="text-sm text-gray-600">Translated into: {Object.keys(item.translations).map(lang => lang.toUpperCase()).join(', ')}</p>
                      </div>
                      <button
                        onClick={() => handleSelectForUpdate(item)}
                        className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-1 px-3 rounded text-sm"
                      >
                        Select to Update
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <div>
              <h3 className="text-xl font-semibold mb-3 text-gray-700">Editing Translation (ID: {selectedTranslation.id})</h3>
              <div className="mb-4 p-4 border border-gray-200 rounded-md bg-gray-50">
                <p className="font-medium text-gray-800">Original Content ({selectedTranslation.sourceLang.toUpperCase()}):</p>
                <p className="text-gray-600 mt-1 whitespace-pre-wrap">{selectedTranslation.originalContent}</p>
              </div>

              <div className="space-y-4 mb-6">
                {Object.entries(editedTranslations).map(([lang, text]) => (
                  <div key={lang}>
                    <label htmlFor={`edit-${lang}`} className="block text-gray-700 text-sm font-bold mb-2">
                      {lang.toUpperCase()} Translation:
                    </label>
                    <textarea
                      id={`edit-${lang}`}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      rows={2}
                      value={text}
                      onChange={(e) => handleUpdateTranslationText(lang, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={handleSaveChanges}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
              >
                Save Changes
              </button>
              <button
                onClick={() => { setSelectedTranslation(null); setEditedTranslations({}); }}
                className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {activeSection === 'translate' && translatedContent && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Translated Content:</h2>
          {Object.entries(translatedContent).map(([lang, text]) => (
            <div key={lang} className="mb-4 p-4 border border-gray-200 rounded-md bg-gray-50">
              <h3 className="text-xl font-medium text-gray-800">Language: {lang.toUpperCase()}</h3>
              <p className="text-gray-600 mt-2 whitespace-pre-wrap">{text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
''