"use client";

import React, { useState, useEffect } from "react";
import KeywordSelector from "../../../components/KeywordSelector"; // Adjust path as needed

interface TemplateVariable {
  name: string;
  type: "text" | "select";
  placeholder?: string;
  options?: string[];
}

interface Template {
  id: string;
  name: string;
  variables: TemplateVariable[];
}

export default function ContentEditorPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [templateInputs, setTemplateInputs] = useState<Record<string, string>>({});
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const response = await fetch("/api/templates");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Template[] = await response.json();
        setTemplates(data);
        if (data.length > 0) {
          setSelectedTemplate(data[0]); // Select the first template by default
          initializeTemplateInputs(data[0]);
        }
      } catch (error: any) {
        setError(`Failed to fetch templates: ${error.message}`);
        console.error("Failed to fetch templates:", error);
      }
    }
    fetchTemplates();
  }, []);

  const initializeTemplateInputs = (template: Template) => {
    const initialInputs: Record<string, string> = {};
    template.variables.forEach((variable) => {
      initialInputs[variable.name] = "";
    });
    setTemplateInputs(initialInputs);
  };

  const handleTemplateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = event.target.value;
    const template = templates.find((t) => t.id === templateId);
    setSelectedTemplate(template || null);
    if (template) {
      initializeTemplateInputs(template);
    }
    setGeneratedContent(""); // Clear generated content on template change
  };

  const handleInputChange = (variableName: string, value: string) => {
    setTemplateInputs((prev) => ({ ...prev, [variableName]: value }));
  };

  const handleGenerateContent = async () => {
    if (!selectedTemplate) {
      setError("Please select a template.");
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedContent("");

    try {
      const response = await fetch("/api/generate-preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          keywords: selectedKeywords,
          variables: templateInputs,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setGeneratedContent(data.content);
    } catch (error: any) {
      setError(`Failed to generate content: ${error.message}`);
      console.error("Failed to generate content:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Content Editor</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="mb-6">
          <label htmlFor="template-select" className="block text-gray-700 text-sm font-bold mb-2">
            Select Template
          </label>
          <div className="relative">
            <select
              id="template-select"
              value={selectedTemplate?.id || ""}
              onChange={handleTemplateChange}
              className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
            >
              <option value="" disabled>
                -- Select a template --
              </option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>

        {selectedTemplate && (
          <div className="mb-6 border-t pt-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Template Variables for "{selectedTemplate.name}"</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedTemplate.variables.map((variable) => (
                <div key={variable.name} className="mb-4">
                  <label htmlFor={`var-${variable.name}`} className="block text-gray-700 text-sm font-bold mb-2">
                    {variable.name.charAt(0).toUpperCase() + variable.name.slice(1).replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  {variable.type === "text" && (
                    <input
                      type="text"
                      id={`var-${variable.name}`}
                      value={templateInputs[variable.name] || ""}
                      onChange={(e) => handleInputChange(variable.name, e.target.value)}
                      placeholder={variable.placeholder}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  )}
                  {variable.type === "select" && variable.options && (
                    <div className="relative">
                      <select
                        id={`var-${variable.name}`}
                        value={templateInputs[variable.name] || ""}
                        onChange={(e) => handleInputChange(variable.name, e.target.value)}
                        className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                      >
                        <option value="" disabled>
                          {variable.placeholder || `-- Select ${variable.name} --`}
                        </option>
                        {variable.options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg
                          className="fill-current h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <KeywordSelector
          selectedKeywords={selectedKeywords}
          onKeywordsChange={setSelectedKeywords}
        />

        <button
          onClick={handleGenerateContent}
          disabled={loading || !selectedTemplate}
          className={`w-full ${
            loading || !selectedTemplate ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-700"
          } text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200`}
        >
          {loading ? "Generating..." : "Generate Content"}
        </button>

        {generatedContent && (
          <div className="mt-8 border-t pt-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Generated Content Preview</h2>
            <div className="bg-gray-50 p-4 border border-gray-200 rounded-md whitespace-pre-wrap text-gray-800 mb-4 h-96 overflow-y-auto">
              {generatedContent}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleCopyToClipboard}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={handleSaveContent}
                className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200"
              >
                Save Content
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

  const handleCopyToClipboard = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(generatedContent);
      alert("Content copied to clipboard!"); // Simple feedback
    }
  };

  const handleSaveContent = () => {
    // Conceptual call to content-manager.ts API to save the content
    alert("Content saved conceptually! (API call to save not implemented yet)");
    console.log("Saving content:", generatedContent);
    //
    // In a real application, you would make an API call here to save the content
    // Example:
    // fetch("/api/content-manager/save", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     templateId: selectedTemplate?.id,
    //     content: generatedContent,
    //     keywords: selectedKeywords, // Include keywords if relevant for saving
    //     variables: templateInputs, // Include variables if relevant for saving
    //   }),
    // });
  };
