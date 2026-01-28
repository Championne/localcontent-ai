import { NextApiRequest, NextApiResponse } from 'next';
import { spawn } from 'child_process';

// These interfaces are copied from @/web/interfaces/CompetitorStrategy for direct use
export interface Recommendation {
  id: string;
  competitorName: string;
  recommendedAction: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  keywords: string[];
  targetUrl?: string; // Optional URL for "Improve Existing Content" or "Expand Topic"
  opportunityScore: number; // New field for mock opportunity score
}

export interface CompetitorStrategyResponse {
  recommendations: Recommendation[];
}

// In-memory cache
interface CacheEntry {
  data: CompetitorStrategyResponse;
  timestamp: number; // Unix timestamp
}

const cache = new Map<string, CacheEntry>();
const CACHE_LIFETIME = 60 * 60 * 1000; // 1 hour in milliseconds
const SCRIPT_TIMEOUT = 30 * 1000; // 30 seconds in milliseconds

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CompetitorStrategyResponse | { message: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const cacheKey = 'competitorStrategies'; // Simple cache key for this endpoint

  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_LIFETIME)) {
    console.log('Serving from cache');
    return res.status(200).json(cached.data);
  }

  console.log('Executing Python script...');
  try {
    const pythonProcess = spawn('python3', ['./localcontent_ai/scripts/competitor_analyzer.py']);

    let scriptOutput = '';
    let scriptError = '';
    let hasTimedOut = false;

    const timeoutId = setTimeout(() => {
      hasTimedOut = true;
      pythonProcess.kill('SIGTERM'); // Terminate the process
      console.error('Python script timed out.');
      return res.status(500).json({ message: 'Competitor analysis script timed out after 30 seconds.' });
    }, SCRIPT_TIMEOUT);

    pythonProcess.stdout.on('data', (data) => {
      scriptOutput += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      scriptError += data.toString();
    });

    pythonProcess.on('close', (code) => {
      clearTimeout(timeoutId); // Clear the timeout if the script finishes in time

      if (hasTimedOut) {
        // Response already sent by timeout handler
        return;
      }

      if (code !== 0) {
        console.error(`Python script exited with code ${code}`);
        console.error(`Script stderr: ${scriptError}`);
        return res.status(500).json({ message: `Python script error: ${scriptError || 'Unknown error'}` });
      }

      try {
        const parsedOutput: CompetitorStrategyResponse = JSON.parse(scriptOutput);
        cache.set(cacheKey, { data: parsedOutput, timestamp: Date.now() });
        return res.status(200).json(parsedOutput);
      } catch (jsonError) {
        console.error('Failed to parse Python script output as JSON:', jsonError);
        console.error(`Script output: ${scriptOutput}`);
        return res.status(500).json({ message: 'Failed to parse competitor analysis data.' });
      }
    });

    pythonProcess.on('error', (err) => {
        clearTimeout(timeoutId);
        if (hasTimedOut) return;
        console.error('Failed to start python process:', err);
        return res.status(500).json({ message: `Failed to execute python script: ${err.message}` });
    });

  } catch (error: any) {
    console.error('Server error during script execution:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}
