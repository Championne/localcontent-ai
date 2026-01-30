
import { NextApiRequest, NextApiResponse } from 'next';
import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { templateContent, userVariables } = req.body;

  if (!templateContent) {
    return res.status(400).json({ message: 'Missing templateContent in request body' });
  }

  if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ message: 'Neither OPENAI_API_KEY nor ANTHROPIC_API_KEY is configured. Please configure at least one.' });
  }

  const llmProvider = process.env.LLM_PROVIDER || 'anthropic'; // Default to Anthropic

  let model;
  if (llmProvider === 'openai') {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ message: 'LLM_PROVIDER is set to openai, but OPENAI_API_KEY is not configured.' });
    }
    model = openai('gpt-4o-mini'); // Using a general OpenAI model
  } else {
    // Default to Anthropic
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ message: 'ANTHROPIC_API_KEY is not configured.' });
    }
    model = anthropic('claude-3-opus-20240229'); // Using a powerful Anthropic model
  }

  try {
    const prompt = `Generate a preview based on the following template content and user-provided variables.
    Template Content: ${templateContent}
    User Variables: ${JSON.stringify(userVariables || {})}

    Please generate a concise and relevant preview of the content, incorporating the variables where appropriate.`;

    const { text: generatedPreview } = await generateText({
      model: model, 
      prompt: prompt,
    });

    res.status(200).json({ preview: generatedPreview });
  } catch (error) {
    console.error('Error generating preview with LLM:', error);
    res.status(500).json({ message: 'Failed to generate preview', error: (error as Error).message });
  }
}
