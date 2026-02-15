"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";

// Define an interface for the content items fetched from the API
interface ContentItem {
  id: string;
  title: string;
  content: string;
  model: string; // Corresponds to the 'model' in API
  timestamp: string; // ISO date string, matches API
  templateType: string; // Used for filtering, from API
  status: "completed" | "pending" | "failed" | "draft" | "published"; // Additional statuses
}

interface ApiResponse {
  data: ContentItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const ITEMS_PER_PAGE = 5; // Reduced for easier testing of pagination

const GeneratedContentPage: React.FC = () => {
  const [contentList, setContentList] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterTemplate, setFilterTemplate] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>(""); // New state for search
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  // States for View Modal
  const [showViewModal, setShowViewModal] = useState<boolean>(false);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  // States for Edit Modal
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editItem, setEditItem] = useState<ContentItem | null>(null);
  const [editTitle, setEditTitle] = useState<string>("");
  const [editStatus, setEditStatus] = useState<string>("");

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
      });

      if (filterTemplate) {
        queryParams.append("templateType", filterTemplate);
      }
      if (searchTerm) {
        queryParams.append("search", searchTerm);
      }

      const response = await fetch(`/api/content-manager?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const apiResponse: ApiResponse = await response.json();

      setContentList(apiResponse.data);
      setTotalPages(apiResponse.totalPages);

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
  }, [currentPage, filterTemplate, searchTerm]); // Dependencies for useCallback

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const handleView = (item: ContentItem) => {
    setSelectedContent(item);
    setShowViewModal(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      try {
        const response = await fetch(`/api/content-manager?id=${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Re-fetch content to update the UI
        fetchContent();
        alert(`Content item "${title}" deleted successfully.`);
      } catch (err) {
        if (err instanceof Error) {
          setError(`Failed to delete content: ${err.message}`);
        } else {
          setError("Failed to delete content.");
        }
        console.error("Delete failed:", err);
      }
    }
  };

  const handleEdit = (item: ContentItem) => {
    setEditItem(item);
    setEditTitle(item.title);
    setEditStatus(item.status);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editItem) return;

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/content-manager?id=${editItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: editTitle, status: editStatus }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setShowEditModal(false);
      fetchContent(); // Re-fetch to show updated data
      alert(`Content item "${editTitle}" updated successfully.`);
    } catch (err) {
      if (err instanceof Error) {
        setError(`Failed to update content: ${err.message}`);
      } else {
        setError("Failed to update content.");
      }
      console.error("Update failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Trigger content fetch when filterTemplate or searchTerm changes, resetting page to 1
  useEffect(() => {
    const handler = setTimeout(() => {
      if (currentPage !== 1) { // If not on page 1, reset to 1
        setCurrentPage(1);
      } else { // Otherwise, just fetch
        fetchContent();
      }
    }, 300); // Debounce to prevent too many API calls

    return () => clearTimeout(handler);
  }, [filterTemplate, searchTerm, currentPage, fetchContent]);


  if (loading && contentList.length === 0) { // Only show full loading if no content already
    return <div className="p-4 text-center text-lg">Loading generated content...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500 text-center text-lg">{error}</div>;
  }

  return (
    <div className="container mx-auto p-6 md:p-8 lg:p-10">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-900">Generated Content Overview</h1>

      {/* Filter and Search Section */}
      <div className="mb-6 bg-white shadow-sm rounded-lg p-4 flex flex-col md:flex-row gap-4">
        <label htmlFor="template-filter" className="block text-sm font-medium text-gray-700 sr-only">
          Filter by Template Type:
        </label>
        <input
          type="text"
          id="template-filter"
          className="mt-1 block w-full md:w-1/3 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Filter by Template Type (e.g., Article)"
          value={filterTemplate}
          onChange={(e) => setFilterTemplate(e.target.value)}
        />
        <label htmlFor="search-term" className="block text-sm font-medium text-gray-700 sr-only">
          Search Content:
        </label>
        <input
          type="text"
          id="search-term"
          className="mt-1 block w-full md:w-2/3 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Search by title or content"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {contentList.length === 0 && !loading && (
        <p className="text-center text-gray-600 text-lg">No content found matching your criteria.</p>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {(loading && contentList.length > 0 ? Array(ITEMS_PER_PAGE).fill(0) : contentList).map((item, index) => (
          <div
            key={item?.id || `skeleton-${index}`} // Use a valid key for skeleton loaders
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
          >
            {item ? (
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 truncate">
                  {item.title}
                </h2>
                <p className="text-sm text-gray-600 mb-1">
                  Template: <span className="font-medium text-gray-800">{item.templateType}</span>
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  Created:{" "}
                  <span className="font-medium text-gray-800">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </span>
                </p>
                <div className="flex items-center mb-4">
                  <span className="text-sm text-gray-600 mr-2">Status:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      item.status === "published" || item.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : item.status === "pending" || item.status === "draft"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                </div>
                <div className="flex space-x-3 mt-4">
                  <button
                    onClick={() => handleView(item)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleEdit(item)}
                    className="px-4 py-2 bg-yellow-500 text-white text-sm font-medium rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 transition-colors duration-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.title)}
                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              // Skeleton Loader
              <div className="p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </div>
            )}
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

      {/* Content View Modal */}
      {showViewModal && selectedContent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all sm:align-middle sm:max-w-xl md:max-w-2xl lg:max-w-3xl">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-900">{selectedContent.title}</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 text-gray-800 text-base leading-relaxed">
              <p className="mb-4"><span className="font-semibold">Template Used:</span> {selectedContent.templateType}</p>
              <p className="mb-4"><span className="font-semibold">Model:</span> {selectedContent.model}</p>
              <p className="mb-4"><span className="font-semibold">Status:</span> {selectedContent.status}</p>
              <p className="mb-4"><span className="font-semibold">Date Created:</span> {new Date(selectedContent.timestamp).toLocaleDateString()}</p>
              <hr className="my-4" />
              <h4 className="font-bold text-lg mb-2">Content:</h4>
              <p className="whitespace-pre-wrap">{selectedContent.content}</p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 text-right">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-5 py-2 bg-blue-600 text-white text-base font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Edit Modal */}
      {showEditModal && editItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all sm:align-middle sm:max-w-xl md:max-w-2xl lg:max-w-3xl">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-900">Edit Content: {editItem.title}</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 text-gray-800 text-base leading-relaxed">
              <div className="mb-4">
                <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  id="edit-title"
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  id="edit-status"
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                >
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="published">Published</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              {/* For full edit functionality, would add full content editor here */}
              <p className="text-sm text-gray-500 italic">
                Full content editing would require a richer text editor integration. For this task, we're focusing on title and status update.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 text-right space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-5 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2 bg-green-600 text-white text-base font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneratedContentPage;
