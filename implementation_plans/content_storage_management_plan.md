# Content Storage and Management Plan for LocalContent.ai

This document outlines the design for storing and managing LLM-generated content within the LocalContent.ai platform.

## 1. Storage Mechanism

For the initial mock-up and local development, a **local JSON file (`content_data.json`)** will be used to store generated content. This approach offers simplicity and ease of development without requiring a full database setup. 

**Justification for Local JSON:**
*   **Rapid Prototyping:** Quick to implement and iterate on the data structure.
*   **Ease of Setup:** No external database dependencies for local development.
*   **Version Control Friendly:** The data can be easily tracked in version control during development.

**Future Considerations (Scalability):**
As the project evolves, this can be easily migrated to a more robust solution like:
*   **Supabase:** A Postgres-based solution with full-text search, authentication, and real-time capabilities.
*   **MongoDB/NoSQL Database:** Flexible schema for evolving content types.
*   **File System (for large content):** Storing large article bodies as individual files (e.g., Markdown or HTML) and metadata in a database.

## 2. Schema for Stored Content

The content will be stored as an array of JSON objects, each representing a generated content item. The schema will include both the generated content and essential metadata.

```json
[
  {
    "id": "uuid-v4-string",
    "title": "Generated Content Title",
    "content": "The actual generated text, markdown, or HTML content.",
    "templateId": "uuid-of-template-used",
    "templateName": "Name of the template used (e.g., Blog Post, Product Description)",
    "keywords": ["keyword1", "keyword2"],
    "generationDate": "YYYY-MM-DDTHH:MM:SSZ",
    "lastModifiedDate": "YYYY-MM-DDTHH:MM:SSZ",
    "llmUsed": "model-name-e.g.-gpt-4, gemini-pro",
    "userId": "uuid-of-generating-user",
    "status": "draft" (or "published", "archived"),
    "version": 1,
    "metadata": { 
      "wordCount": 500,
      "readabilityScore": 75,
      "sentiment": "positive"
    }
  }
]
```

**Schema Field Explanations:**
*   `id`: Unique identifier for the content item.
*   `title`: A user-friendly title for the generated content.
*   `content`: The main body of the generated text. This could be plain text, Markdown, or HTML.
*   `templateId`: Reference to the ID of the template used for generation.
*   `templateName`: Human-readable name of the template.
*   `keywords`: An array of keywords or tags associated with the content.
*   `generationDate`: Timestamp of when the content was initially generated (ISO 8601 format).
*   `lastModifiedDate`: Timestamp of the last modification (e.g., user edit, status change).
*   `llmUsed`: Identifier of the Large Language Model used for generation.
*   `userId`: Identifier of the user who initiated the content generation.
*   `status`: Current lifecycle stage of the content.
*   `version`: Version number of the content (for tracking edits).
*   `metadata`: An object for additional, potentially dynamic, metadata (e.g., word count, readability score, sentiment).

## 3. Basic Mock UI: `localcontent_ai/web/app/generated-content/page.tsx`

A basic Next.js page will be designed to list and view generated content. It will initially mock data fetching from the `content_data.json` file.

```typescript
// localcontent_ai/web/app/generated-content/page.tsx

import Link from 'next/link';

interface ContentItem {
  id: string;
  title: string;
  status: string;
  generationDate: string;
  llmUsed: string;
}

// Mock data fetching function
async function getGeneratedContent(): Promise<ContentItem[]> {
  // In a real application, this would fetch from an API endpoint
  // For mock-up, we'll simulate data or directly read a JSON file (server component)
  const mockData: ContentItem[] = [
    {
      id: '1',
      title: 'Blog Post Draft: The Future of AI in Content Creation',
      status: 'draft',
      generationDate: '2023-10-26T10:00:00Z',
      llmUsed: 'gemini-pro',
    },
    {
      id: '2',
      title: 'Product Description: Clawdbot AI Assistant Pro',
      status: 'published',
      generationDate: '2023-10-25T14:30:00Z',
      llmUsed: 'gpt-4',
    },
    {
      id: '3',
      title: 'Archived Email Campaign: Holiday Sale 2022',
      status: 'archived',
      generationDate: '2022-12-01T09:00:00Z',
      llmUsed: 'gpt-3.5',
    },
  ];
  return new Promise((resolve) => setTimeout(() => resolve(mockData), 500)); // Simulate API call latency
}

export default async function GeneratedContentPage() {
  const contentItems = await getGeneratedContent();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Generated Content</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contentItems.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
            <p className="text-gray-600">Status: <span className={`font-medium ${
                item.status === 'draft' ? 'text-blue-600' :
                item.status === 'published' ? 'text-green-600' :
                'text-red-600'
              }`}>{item.status}</span></p>
            <p className="text-gray-600">Generated: {new Date(item.generationDate).toLocaleDateString()}</p>
            <p className="text-gray-600">LLM: {item.llmUsed}</p>
            <Link href={`/generated-content/${item.id}`} className="mt-4 inline-block text-blue-500 hover:underline">
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Detail View (Mock):**
A separate page (`localcontent_ai/web/app/generated-content/[id]/page.tsx`) would handle displaying the full content and metadata for a selected item.

## 4. Content Lifecycle

Generated content will follow a simple lifecycle with distinct statuses to manage its progression from generation to long-term storage.

*   **`draft`**: The initial state of newly generated content. It's editable, not publicly visible, and may require review.
*   **`published`**: Content that has been reviewed, approved, and is ready for use (e.g., displayed on a website, used in a campaign). It is considered finalized for public consumption.
*   **`archived`**: Content that is no longer actively used or published but is retained for historical records, future reference, or compliance. Archived content is typically read-only and not publicly accessible.
*   **`deleted` (Optional/Internal)**: Content permanently removed from the system. This status might not be explicitly stored but rather an action that removes the entry from storage.