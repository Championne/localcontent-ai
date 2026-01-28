import { NextApiRequest, NextApiResponse } from 'next';
import { spawn } from 'child_process';

// Define the structure of an ActionableSuggestion expected from the Python script
interface PythonActionableSuggestion {
  id: string;
  category: string;
  suggestion: string;
  priority: 'high' | 'medium' | 'low';
  related_reviews_ids: string[]; // Assuming the Python script might use snake_case
}

// Define the structure for ActionableSuggestion for the frontend (camelCase)
export interface ActionableSuggestion {
  id: string;
  category: string;
  suggestion: string;
  priority: 'high' | 'medium' | 'low';
  relatedReviewsIds: string[];
}

// Define the overall data structure for the frontend
export interface ReviewInsightsData {
  overall_sentiment: number;
  total_reviews_analyzed: number;
  suggestions: ActionableSuggestion[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ReviewInsightsData | { error: string; details?: string }>) {
  if (req.method === 'GET') {
    try {
      const pythonProcess = spawn('python3', ['localcontent_ai/scripts/review_analyzer.py'], { timeout: 30000 }); // 30-second timeout

      let pythonOutput = '';
      let pythonError = '';
      let timeoutReached = false;

      const timeoutId = setTimeout(() => {
        timeoutReached = true;
        pythonProcess.kill(); // Kill the process if it times out
        console.error('Python script execution timed out.');
        res.status(504).json({ error: 'Python script execution timed out (max 30 seconds).' });
      }, 30000);

      pythonProcess.stdout.on('data', (data) => {
        pythonOutput += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        pythonError += data.toString();
      });

      pythonProcess.on('close', (code) => {
        clearTimeout(timeoutId);
        if (timeoutReached) return; // Already handled by timeout

        if (code !== 0) {
          console.error(`Python script exited with code ${code}: ${pythonError}`);
          return res.status(500).json({ error: 'Failed to generate insights', details: pythonError });
        }

        try {
          const rawSuggestions: PythonActionableSuggestion[] = JSON.parse(pythonOutput);

          const transformedSuggestions: ActionableSuggestion[] = rawSuggestions.map(s => ({
            id: s.id,
            category: s.category,
            suggestion: s.suggestion,
            priority: s.priority,
            relatedReviewsIds: s.related_reviews_ids,
          }));

          // For now, these are placeholder values from the API route
          const insightsData: ReviewInsightsData = {
            overall_sentiment: rawSuggestions.length > 0 ? Math.random() * (5 - 3) + 3 : 0, // Placeholder: random sentiment >= 3 if suggestions exist
            total_reviews_analyzed: rawSuggestions.length, // Placeholder: number of suggestions as number of reviews analyzed
            suggestions: transformedSuggestions,
          };

          res.status(200).json(insightsData);

        } catch (parseError) {
          console.error('Failed to parse Python script output:', parseError);
          console.error('Raw Python output:', pythonOutput);
          res.status(500).json({ error: 'Failed to parse insights from script', details: parseError instanceof Error ? parseError.message : String(parseError) });
        }
      });

      pythonProcess.on('error', (err) => {
        clearTimeout(timeoutId);
        console.error('Failed to start Python script process:', err);
        res.status(500).json({ error: 'Failed to start analysis process', details: err.message });
      });

    } catch (error) {
      console.error('API Error:', error);
      res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
