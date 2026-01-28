"use client";

import React, { useEffect, useState, useMemo } from "react";

// Define an interface for the content items fetched from the API
interface ContentItem {
  id: string;
  title: string;
  templateUsed: string; // Renamed from contentType to align with request
  dateCreated: string; // ISO date string, renamed from generationDate
  status: "completed" | "pending" | "failed";
  content: string; // Full content for display (optional, depending on API)
}

const ITEMS_PER_PAGE = 10; // For pagination

const GeneratedContentPage: React.FC = () => {
  const [contentList, setContentList] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterTemplate, setFilterTemplate] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        // Replace with actual fetch to /api/content-manager
        const response = await fetch("/api/content-manager");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: ContentItem[] = await response.json();
        
        // Mock data for demonstration if API returns empty or for more items
        const mockData: ContentItem[] = Array.from({ length: 25 }).map((_, i) => ({
          id: String(i + 1),
          title: `Generated Content Item ${i + 1}`,
          templateUsed: i % 3 === 0 ? "Article" : i % 3 === 1 ? "Email" : "Social Post",
          dateCreated: new Date(Date.now() - i * 86400000).toISOString(), // Days ago
          status: i % 4 === 0 ? "pending" : i % 4 === 1 ? "failed" : "completed",
          content: `This is the detailed content for item ${i + 1}, generated using the ${i % 3 === 0 ? "Article" : i % 3 === 1 ? "Email" : "Social Post"} template.`,
        }));
        
        // Assuming the API returns a list, combine with mock data for testing pagination/filter
        // In a real scenario, you'd likely just use the data from the API
        setContentList([...data, ...mockData]); 

      } catch (err) {
        if (err instanceof Error) {
          setError(`Failed to fetch generated content: ${err.message}`);
        } else {
          setError("Failed to fetch generated content.");
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const filteredContent = useMemo(() => {
    return contentList.filter((item) =>
      item.templateUsed.toLowerCase().includes(filterTemplate.toLowerCase())
    );
  }, [contentList, filterTemplate]);

  const totalPages = Math.ceil(filteredContent.length / ITEMS_PER_PAGE);
  const paginatedContent = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredContent.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredContent, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return <div className="p-4 text-center text-lg">Loading generated content...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500 text-center text-lg">{error}</div>;
  }

  return (
    <div className="container mx-auto p-6 md:p-8 lg:p-10">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-900">Generated Content Overview</h1>

      {/* Filter Section */}
      <div className="mb-6 bg-white shadow-sm rounded-lg p-4">
        <label htmlFor="template-filter" className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Template Type:
        </label>
        <input
          type="text"
          id="template-filter"
          className="mt-1 block w-full md:w-1/2 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="e.g., Article, Email"
          value={filterTemplate}
          onChange={(e) => {
            setFilterTemplate(e.target.value);
            setCurrentPage(1); // Reset to first page on filter change
          }}
        />
      </div>

      {filteredContent.length === 0 && (
        <p className="text-center text-gray-600 text-lg">No content found matching your criteria.</p>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {paginatedContent.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 truncate">
                {item.title}
              </h2>
              <p className="text-sm text-gray-600 mb-1">
                Template: <span className="font-medium text-gray-800">{item.templateUsed}</span>
              </p>
              <p className="text-sm text-gray-600 mb-3">
                Created:{" "}
                <span className="font-medium text-gray-800">
                  {new Date(item.dateCreated).toLocaleDateString()}
                </span>
              </p>
              <div className="flex items-center mb-4">
                <span className="text-sm text-gray-600 mr-2">Status:</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    item.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : item.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </span>
              </div>
              <div className="flex space-x-3 mt-4">
                <button
                  onClick={() => alert(`Viewing content: ${item.title}`)}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  View
                </button>
                <button
                  onClick={() => alert(`Editing content: ${item.title}`)}
                  className="px-4 py-2 bg-yellow-500 text-white text-sm font-medium rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 transition-colors duration-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => alert(`Deleting content: ${item.title}`)}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="flex justify-center items-center space-x-2 mt-8" aria-label="Pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm font-medium text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
};

export default GeneratedContentPage;
