import fs from 'fs';
import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';

const DATA_FILE = path.resolve(process.cwd(), 'localcontent_ai/mock_data/content_data.json');

// Ensure the data file exists, if not, create it with an empty array
const ensureDataFileExists = () => {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '[]');
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  ensureDataFileExists();

  if (req.method === 'POST') {
    const { title, content, model, timestamp } = req.body;

    // Input Validation
    if (!title || !content || !model || !timestamp) {
      return res.status(400).json({ message: 'Missing required fields: title, content, model, and timestamp are required.' });
    }

    try {
      const currentData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
      const newData = { title, content, model, timestamp };
      currentData.push(newData);
      fs.writeFileSync(DATA_FILE, JSON.stringify(currentData, null, 2));
      return res.status(200).json({ message: 'Content successfully saved.', data: newData });
    } catch (error) {
      console.error('Error saving content:', error);
      return res.status(500).json({ message: 'Failed to save content.', error: error.message });
    }
  } else if (req.method === 'GET') {
    try {
      const currentData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
      return res.status(200).json(currentData);
    } catch (error) {
      console.error('Error retrieving content:', error);
      // If file doesn't exist or is malformed, return an empty array or an error
      if (error.code === 'ENOENT') {
        return res.status(200).json([]); // Return empty array if file doesn't exist
      }
      return res.status(500).json({ message: 'Failed to retrieve content.', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
