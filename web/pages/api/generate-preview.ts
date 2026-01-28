// pages/api/generate-preview.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

// Initialize OpenAI client
// Ensure OPENAI_API_KEY is set in your environment variables (e.g., .env.local file)
// Example: OPENAI_API_KEY=sk-your-openai-api-key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: "error", message: "Method Not Allowed" });
  }

  const { content, contentType, styleGuide, temperature, maxTokens } = req.body;

  // --- 1. Input Validation ---
  if (!content || typeof content !== 'string' || content.trim() === '') {
    return res.status(400).json({ status: "error", message: "Invalid or missing 'content'." });
  }
  if (!contentType || typeof contentType !== 'string' || contentType.trim() === '') {
    return res.status(400).json({ status: "error", message: "Invalid or missing 'contentType'." });
  }

  // Validate optional parameters
  if (temperature !== undefined && (typeof temperature !== 'number' || temperature < 0 || temperature > 2)) {
    return res.status(400).json({ status: "error", message: "Invalid 'temperature'. Must be a number between 0 and 2." });
  }
  if (maxTokens !== undefined && (typeof maxTokens !== 'number' || maxTokens < 1 || maxTokens > 4000)) { // Assuming a reasonable max token limit
    return res.status(400).json({ status: "error", message: "Invalid 'maxTokens'. Must be a number greater than 0." });
  }

  try {
    // Check if API key is provided
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY environment variable is not set.");
      return res.status(500).json({ status: "error", message: "Server configuration error: OpenAI API key is missing." });
    }

    // --- 2. Construct LLM Prompt/Messages ---
    const systemMessage = `You are an AI assistant tasked with generating clear and concise previews for various content types.
- Content Type: ${contentType}
- Style Guide: ${styleGuide || 'standard and informative'}
Generate a preview that is relevant and engaging, suitable for display.`;

    const userMessage = `Generate a preview for the following content:
"${content}"`;

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: systemMessage },
      { role: "user", content: userMessage },
    ];

    const llmParameters: OpenAI.Chat.Completions.ChatCompletionCreateParams = {
      model: "gpt-4-turbo-preview", // Use a suitable model, gpt-4-turbo-preview is a good default for quality
      temperature: typeof temperature === 'number' ? temperature : 0.7,
      max_tokens: typeof maxTokens === 'number' ? maxTokens : 150,
      // Add other LLM specific parameters as needed, e.g., top_p, frequency_penalty, presence_penalty
    };

    // --- 3. Call LLM API ---
    const completion = await openai.chat.completions.create({
      messages: messages,
      ...llmParameters,
    });

    // --- 4. Process LLM Response ---
    const generatedPreview = completion.choices[0]?.message?.content;

    if (!generatedPreview) {
      console.error("LLM returned an empty or malformed response for content:", content);
      return res.status(500).json({ status: "error", message: "LLM failed to generate a valid preview. Response was empty." });
    }

    return res.status(200).json({ status: "success", preview: generatedPreview.trim() });

  } catch (error: any) {
    // --- 5. Handle LLM API Errors ---
    console.error("Error integrating with LLM:", error);

    let statusCode = 500;
    let errorMessage = "An unexpected error occurred interacting with the LLM. Please try again.";

    if (error instanceof OpenAI.APIError) {
      statusCode = error.status || 500;
      errorMessage = error.message;
      if (error.status === 401) {
        errorMessage = "Authentication error with LLM API. Please ensure OPENAI_API_KEY is correctly set.";
      } else if (error.status === 429) {
        errorMessage = "LLM API rate limit exceeded. Please try again shortly.";
      } else if (error.status === 400) {
        errorMessage = `Bad request to LLM API: ${error.message}. Please check input parameters.`;
      }
    } else {
        errorMessage = (error as Error).message || errorMessage;
    }

    return res.status(statusCode).json({ status: "error", message: errorMessage });
  }
}
