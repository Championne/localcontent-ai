
'use client';

import { useState, useEffect } from 'react';
import type { Template } from '@/types/template.d.ts';
import { TemplateCard } from '../../components/template-card';
import { FilterSidebar } from '../../components/filter-sidebar';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// Dummy filter options (will be populated dynamically or from a static source later)
const dummyFilterOptions = {
  industry: ['Marketing', 'Content Marketing', 'E-commerce', 'Education', 'Public Relations'],
  contentType: ['Ad Copy', 'Blog Post', 'Email', 'Video Script', 'Press Release', 'Product Description'],
  platform: ['Facebook', 'Website', 'Email', 'YouTube', 'News Outlet', 'Online Store'],
  purpose: ['Lead Generation', 'Information', 'Product Promotion', 'Instructional', 'Public Awareness', 'Sales'],
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({
    industry: [],
    contentType: [],
    platform: [],
    purpose: [],
  });

  useEffect(() => {
    // Fetch templates from API route
    const fetchTemplates = async () => {
      const res = await fetch('/api/templates');
      const data: Template[] = await res.json();
      setTemplates(data);
      setFilteredTemplates(data);
    };
    fetchTemplates();
  }, []);

  useEffect(() => {
    let newFilteredTemplates = templates.filter(template =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    Object.entries(activeFilters).forEach(([filterCategory, selectedOptions]) => {
      if (selectedOptions.length > 0) {
        newFilteredTemplates = newFilteredTemplates.filter(template =>
          selectedOptions.includes(template.category[filterCategory as keyof Template['category']])
        );
      }
    });

    setFilteredTemplates(newFilteredTemplates);
  }, [searchTerm, activeFilters, templates]);

  const handleFilterChange = (category: string, value: string) => {
    setActiveFilters(prevFilters => {
      const currentCategoryFilters = prevFilters[category] || [];
      if (currentCategoryFilters.includes(value)) {
        return {
          ...prevFilters,
          [category]: currentCategoryFilters.filter(item => item !== value),
        };
      } else {
        return {
          ...prevFilters,
          [category]: [...currentCategoryFilters, value],
        };
      }
    });
  };

  const clearFilter = (category: string, value: string) => {
    setActiveFilters(prevFilters => ({
      ...prevFilters,
      [category]: prevFilters[category].filter(item => item !== value),
    }));
  };

  const clearAllFilters = () => {
    setActiveFilters({
      industry: [],
      contentType: [],
      platform: [],
      purpose: [],
    });
  };

  return (
    <div className="flex min-h-screen">
      <FilterSidebar
        filterOptions={dummyFilterOptions}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
      />
      <main className="flex-1 p-8 bg-gray-50 dark:bg-gray-900">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Prompt Templates</h1>
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Search templates..."
            className="w-full max-w-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="mb-4 flex flex-wrap gap-2 items-center">
          {Object.entries(activeFilters).map(([category, selectedOptions]) =>
            selectedOptions.map(option => (
              <Badge
                key={`${category}-${option}`}
                variant="secondary"
                className="flex items-center gap-1 pr-1"
              >
                {option}
                <button
                  onClick={() => clearFilter(category, option)}
                  className="ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <span className="sr-only">Remove {option} filter</span>
                  ├ù
                </button>
              </Badge>
            ))
          )}
          {(Object.values(activeFilters).flat().length > 0 || searchTerm.length > 0) && (
            <button onClick={clearAllFilters} className="text-sm text-blue-600 hover:underline dark:text-blue-400">
              Clear All Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map(template => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      </main>
    </div>
  );
}
