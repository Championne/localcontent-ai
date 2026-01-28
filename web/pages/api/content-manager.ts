
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid'; // Import uuid

const DATA_FILE_PATH = path.resolve(process.cwd(), 'localcontent_ai/data/generated_content.json');

// Ensure the data directory exists
const dataDir = path.dirname(DATA_FILE_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

interface ContentItem {
  id: string; // Add a unique ID
  title: string;
  content: string;
  model: string;
  timestamp: string;
  templateType?: string; // conceptual for search/filter
  status?: string; // conceptual for updating
}

// Helper function to read content
const readContentFromFile = (): ContentItem[] => {
  if (fs.existsSync(DATA_FILE_PATH)) {
    const fileContent = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
    return JSON.parse(fileContent);
  }
  return [];
};

// Helper function to write content
const writeContentToFile = (content: ContentItem[]) => {
  fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(content, null, 2), 'utf-8');
};


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'POST':
      try {
        const { title, content, model, timestamp, templateType, status } = req.body;

        if (!title || !content || !model || !timestamp) {
          return res.status(400).json({ message: 'Missing required fields: title, content, model, and timestamp are required.' });
        }

        const existingContent = readContentFromFile();
        const newItem: ContentItem = {
          id: uuidv4(), // Generate unique ID
          title,
          content,
          model,
          timestamp,
          templateType: templateType || 'unknown',
          status: status || 'draft',
        };
        existingContent.push(newItem);
        writeContentToFile(existingContent);

        return res.status(201).json({ message: 'Content successfully created.', data: newItem });
      } catch (error: any) {
        console.error('Error creating content:', error);
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
      }

    case 'GET':
      try {
        const contentItems = readContentFromFile();
        const { templateType, search, page = '1', limit = '10' } = req.query;

        let filteredContent = contentItems;

        if (templateType && typeof templateType === 'string') {
          filteredContent = filteredContent.filter(item => item.templateType === templateType);
        }
        if (search && typeof search === 'string') {
          const lowerCaseSearch = search.toLowerCase();
          filteredContent = filteredContent.filter(item =>
            item.title.toLowerCase().includes(lowerCaseSearch) ||
            item.content.toLowerCase().includes(lowerCaseSearch)
          );
        }

        // Basic Pagination
        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const startIndex = (pageNum - 1) * limitNum;
        const endIndex = pageNum * limitNum;

        const paginatedContent = filteredContent.slice(startIndex, endIndex);

        return res.status(200).json({
          data: paginatedContent,
          total: filteredContent.length,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(filteredContent.length / limitNum),
        });
      } catch (error: any) {
        console.error('Error retrieving content:', error);
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
      }

    case 'PUT':
      try {
        const { id } = req.query;
        const updatedFields = req.body;

        if (!id) {
          return res.status(400).json({ message: 'Content ID is required for updating.' });
        }

        let existingContent = readContentFromFile();
        const index = existingContent.findIndex(item => item.id === id);

        if (index === -1) {
          return res.status(404).json({ message: 'Content item not found.' });
        }

        // Update only specified fields
        existingContent[index] = { ...existingContent[index], ...updatedFields };
        writeContentToFile(existingContent);

        return res.status(200).json({ message: `Content item with ID ${id} updated successfully.`, data: existingContent[index] });
      } catch (error: any) {
        console.error('Error updating content:', error);
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
      }

    case 'DELETE':
      try {
        const { id } = req.query;

        if (!id) {
          return res.status(400).json({ message: 'Content ID is required for deletion.' });
        }

        let existingContent = readContentFromFile();
        const initialLength = existingContent.length;
        existingContent = existingContent.filter(item => item.id !== id);

        if (existingContent.length === initialLength) {
          return res.status(404).json({ message: 'Content item not found.' });
        }

        writeContentToFile(existingContent);

        return res.status(200).json({ message: `Content item with ID ${id} deleted successfully.` });
      } catch (error: any) {
        console.error('Error deleting content:', error);
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
      }

    default:
      res.setHeader('Allow', ['POST', 'GET', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
