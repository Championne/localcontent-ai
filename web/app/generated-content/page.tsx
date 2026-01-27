// localcontent_ai/web/app/generated-content/page.tsx

import React from 'react';

interface GeneratedContent {
  id: string;
  title: string;
  content: string;
  templateUsed: string;
  keywords: string[];
  generationDate: string;
  lastUpdated: string;
  llmUsed: string;
  userId: string;
  status: 'draft' | 'published' | 'archived';
  version: number;
}

// Mock data to simulate fetching from local JSON files
const mockContentData: GeneratedContent[] = [
  {
    id: 'content-001',
    title: 'How AI is Revolutionizing Content Creation',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
    templateUsed: 'blog-post-template-v1',
    keywords: ['AI', 'Content Creation', 'Technology'],
    generationDate: '2023-10-26T14:30:00Z',
    lastUpdated: '2023-10-26T15:00:00Z',
    llmUsed: 'gpt-3.5-turbo',
    userId: 'user-001',
    status: 'published',
    version: 1,
  },
  {
    id: 'content-002',
    title: 'The Future of Digital Marketing with LLMs',
    content: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...',
    templateUsed: 'article-template-v2',
    keywords: ['Digital Marketing', 'LLM', 'Future'],
    generationDate: '2023-10-27T09:00:00Z',
    lastUpdated: '2023-10-27T09:15:00Z',
    llmUsed: 'gpt-4',
    userId: 'user-001',
    status: 'draft',
    version: 1,
  },
  {
    id: 'content-003',
    title: 'Archived Content Example',
    content: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris...',
    templateUsed: 'social-media-post-v1',
    keywords: ['Archive', 'Example'],
    generationDate: '2023-10-25T11:00:00Z',
    lastUpdated: '2023-10-25T11:05:00Z',
    llmUsed: 'claude-2',
    userId: 'user-002',
    status: 'archived',
    version: 1,
  },
];

const GeneratedContentPage: React.FC = () => {
  // In a real application, this would fetch data from the backend
  const [contentList, setContentList] = React.useState<GeneratedContent[]>(mockContentData);

  const viewContent = (id: string) => {
    // Simulate navigating to a detail page or opening a modal
    alert(`Viewing content: ${id}`);
    console.log(contentList.find(c => c.id === id));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Generated Content</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contentList.map((content) => (
          <div key={content.id} className="border p-4 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold">{content.title}</h2>
            <p className="text-sm text-gray-600 mb-2">Status: {content.status}</p>
            <p className="text-sm text-gray-600">LLM Used: {content.llmUsed}</p>
            <p className="text-sm text-gray-600">Generated: {new Date(content.generationDate).toLocaleDateString()}</p>
            <button
              onClick={() => viewContent(content.id)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GeneratedContentPage;
