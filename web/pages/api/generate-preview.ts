// pages/api/generate-preview.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

// Initialize the OpenAI client outside the handler to avoid re-initialization on each request
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Stored securely in environment variables
});

// IMPORTANT: Ensure your .env.local (or production environment) has OPENAI_API_KEY set.
// Example:
// OPENAI_API_KEY="sk-YOUR_OPENAI_API_KEY"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ status: "error", message: "Method Not Allowed" });
  }

  // Destructure required and optional parameters from the request body
  const { content, contentType, styleGuide, temperature, maxTokens } = req.body;

  // --- 1. Input Validation ---
  // Validate 'content'
  if (!content || typeof content !== 'string' || content.trim() === '') {
    return res.status(400).json({ status: "error", message: "Invalid or missing 'content'. It must be a non-empty string." });
  }
  // Validate 'contentType'
  if (!contentType || typeof contentType !== 'string' || contentType.trim() === '') {
    return res.status(400).json({ status: "error", message: "Invalid or missing 'contentType'. It must be a non-empty string." });
  }
  // Validate 'styleGuide' if provided, otherwise default
  const validatedStyleGuide = typeof styleGuide === 'string' && styleGuide.trim() !== '' ? styleGuide : 'standard and informative';

  // Validate 'temperature'
  const validatedTemperature = typeof temperature === 'number' && temperature >= 0 && temperature <= 2 ? temperature : 0.7;

  // Validate 'maxTokens'
  const validatedMaxTokens = typeof maxTokens === 'number' && maxTokens > 0 && maxTokens <= 2048 ? maxTokens : 150; // Max tokens up to context window limit, reasonable preview size

  try {
    // --- 2. Construct LLM Prompt/Messages ---
    const systemMessage = `You are an AI assistant tasked with generating clear, concise, and engaging content previews.
- Content Type: ${contentType}
- Style Guide: ${validatedStyleGuide}
Generate a preview that is relevant and engaging, suitable for display to a user. Focus on extracting the core message and tone.`;

    const userMessage = `Generate a preview for the following content:
"${content}"`;

    const messages = [
      { role: "system", content: systemMessage },
      { role: "user", content: userMessage },
    ];

    // Define LLM parameters, using validated inputs
    const llmParameters = {
      model: process.env.OPENAI_MODEL || "gpt-4o-mini", // Allow configurable model, default to a sensible choice
      temperature: validatedTemperature,
      max_tokens: validatedMaxTokens,
      // You can add other LLM specific parameters here, e.g., top_p, frequency_penalty
    };

    // Log the prompt and parameters for debugging (optional, remove in production for privacy/cost)
    console.log("Sending to LLM:", { messages, llmParameters });

    // --- 3. Call LLM API ---
    const completion = await openai.chat.completions.create({
      messages: messages as any, // Type assertion for compatibility
      ...llmParameters,
    });

    // --- 4. Process LLM Response ---
    const generatedPreview = completion.choices[0]?.message?.content;

    // Check if the LLM returned a valid preview
    if (!generatedPreview) {
      console.error("LLM returned an empty or malformed response for content:", content);
      return res.status(500).json({ status: "error", message: "LLM failed to generate a valid preview. The response was empty." });
    }

    // Return the generated preview
    return res.status(200).json({ status: "success", preview: generatedPreview });

  } catch (error: any) {
    // --- 5. Handle LLM API Errors ---
    console.error("Error integrating with LLM:", error);

    let statusCode = 500;
    let errorMessage = "An unexpected error occurred interacting with the LLM. Please try again.";

    // Specific error handling for OpenAI library
    if (error instanceof OpenAI.APIError) {
      statusCode = error.status || 500;
      errorMessage = error.message;

      if (error.status === 401) {
        errorMessage = "Authentication error with LLM API. Please check your OPENAI_API_KEY environment variable.";
      } else if (error.status === 429) {
        errorMessage = "LLM API rate limit exceeded. Please try again shortly or consider increasing your OpenAI quota.";
      } else if (error.status === 400 && error.code === 'invalid_request_error') {
        errorMessage = `LLM API request error: ${error.message}. This might be due to invalid parameters or excessive tokens.`;
      }
    } else if (error instanceof Error) {
      // General JavaScript error
      errorMessage = error.message;
    } else {
      // Catch-all for unknown error types
      errorMessage = String(error);
    }

    return res.status(statusCode).json({ status: "error", message: errorMessage });
  }
}
