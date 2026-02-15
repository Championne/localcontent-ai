# Implementation Plan: Live LLM Integration into `generate-preview.ts`

## 1. Objective

Integrate a live Large Language Model (LLM) into the `generate-preview.ts` API route to dynamically generate content previews based on user input and context. This plan details the LLM API interaction, parameter passing, and error handling.

## 2. API Route Overview: `generate-preview.ts`

The `generate-preview.ts` route is assumed to be a Next.js or similar API route that accepts a POST request with content data and returns a generated preview.

**Endpoint:** `/api/generate-preview`
**Method:** `POST`
**Request Body (Example):**
```json
{
  "content": "Description of the content to be previewed, e.g., an article, product description, or user query.",
  "contentType": "article", // e.g., 'article', 'product', 'email', 'social_post'
  "styleGuide": "concise and professional",
  "temperature": 0.7, // Optional: LLM generation temperature
  "maxTokens": 150    // Optional: LLM max output tokens
}
```

**Expected Response (Success):**
```json
{
  "status": "success",
  "preview": "Generated text preview from the LLM."
}
```

**Expected Response (Error):**
```json
{
  "status": "error",
  "message": "Detailed error message."
}
```

## 3. LLM API Interaction

This plan assumes a common LLM API interface (e.g., OpenAI, Gemini, Claude).

### 3.1. LLM Client Initialization

The LLM client should be initialized once, ideally outside the request handler, using an API key stored securely.

```typescript
// Example: Using OpenAI's Node.js library
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Stored securely in environment variables
});

// Or for Google Gemini
// import { GoogleGenerativeAI } from "@google/generative-ai";
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({ model: "gemini-pro" });
```

### 3.2. API Call to LLM

The core logic will involve constructing a prompt/message array and calling the LLM API.

**LLM Endpoint:** Varies by provider (e.g., `/v1/chat/completions` for OpenAI, `/v1beta/models/gemini-pro:generateContent` for Gemini).

**Request Format (Example for Chat-based LLM):**

The LLM will receive a structured prompt combining the user's `content`, `contentType`, and `styleGuide`.

```typescript
const systemMessage = `You are an AI assistant tasked with generating clear and concise previews for various content types.
- Content Type: ${contentType}
- Style Guide: ${styleGuide}
Generate a preview that is relevant and engaging.`;

const userMessage = `Generate a preview for the following content:
"${content}"`;

const messages = [
  { role: "system", content: systemMessage },
  { role: "user", content: userMessage },
];

const llmParameters = {
  model: "gpt-4-turbo", // Or "gemini-pro", "claude-3-opus-20240229", etc.
  temperature: req.body.temperature || 0.7,
  max_tokens: req.body.maxTokens || 150,
  // Add other LLM-specific parameters like top_p, frequency_penalty, presence_penalty
};

// Example API Call (OpenAI)
const completion = await openai.chat.completions.create({
  messages: messages,
  ...llmParameters,
});

const generatedPreview = completion.choices[0].message.content;

// Example API Call (Gemini)
// const result = await model.generateContent({
//   contents: messages.map(msg => ({
//     role: msg.role === 'system' ? 'user' : msg.role, // Gemini doesn't have a 'system' role directly for chat, often system instructions are prepended to user prompt or embedded in a 'user' role with a preceding 'model' role. This might need adjustment.
//     parts: [{ text: msg.content }]
//   })),
//   ...llmParameters,
// });
// const response = await result.response;
// const generatedPreview = response.text();
```

## 4. Parameter Passing

### 4.1. Input Parameters from `generate-preview.ts` Request

-   `content` (string, required): The main text feedstock for the LLM.
-   `contentType` (string, required): Helps the LLM understand context (e.g., "article", "product_description", "social_media_post").
-   `styleGuide` (string, optional): Directs the LLM's tone and style (e.g., "professional", "casual", "witty", "SEO-optimized").
-   `temperature` (number, optional, default: 0.7): Controls randomness of LLM output.
-   `maxTokens` (number, optional, default: 150): Maximum length of the generated preview.

### 4.2. Mapping to LLM API Parameters

-   `messages` array (for chat models) or `prompt` string (for completion models) will be constructed using `content`, `contentType`, and `styleGuide`.
-   `temperature` maps directly to the LLM's `temperature` parameter.
-   `maxTokens` maps directly to the LLM's `max_tokens` (or equivalent) parameter.
-   `model`: This should be configurable, possibly via an environment variable or a default, but for this plan, it's hardcoded for demonstration.
-   Other LLM-specific parameters (`top_p`, `frequency_penalty`, `presence_penalty`, `stop_sequences`) can be added as optional parameters to the `generate-preview.ts` request if needed for fine-grained control, or set as defaults.

## 5. Error Handling

Robust error handling is crucial for a production API.

### 5.1. Input Validation

-   **Required Fields:** Ensure `content` and `contentType` are present.
-   **Type Validation:** `temperature` and `maxTokens` should be numbers.
-   **Sanitization:** Basic sanitization of input strings to prevent prompt injection or unexpected behavior (though the LLM itself offers some protection).

```typescript
if (!content || !contentType) {
  return new Response(JSON.stringify({ status: "error", message: "Missing required fields: content or contentType" }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
}
if (temperature !== undefined && typeof temperature !== 'number') {
  return new Response(JSON.stringify({ status: "error", message: "Invalid type for temperature" }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
}
// etc.
```

### 5.2. LLM API Call Errors

Wrap the LLM API call in a `try-catch` block.

**Common LLM Errors:**
-   **Network Issues:** Connection timeouts, DNS resolution failures.
-   **Authentication Errors (401):** Invalid or missing API key.
-   **Rate Limit Exceeded (429):** Too many requests in a short period. Implement retries with exponential backoff if necessary.
-   **Invalid Request (400, 422):** Malformed prompt, unsupported parameters.
-   **Server-Side Errors (5xx):** Issues on the LLM provider's end.

```typescript
try {
  const completion = await openai.chat.completions.create(...);
  // ... process response
} catch (error: any) {
  console.error("LLM API Error:", error.message || error);

  let statusCode = 500;
  let errorMessage = "An unexpected error occurred with the LLM API.";

  if (error.response) {
    // Axios or similar http client error structure
    statusCode = error.response.status;
    errorMessage = error.response.data?.message || errorMessage;
  } else if (error.code) {
    // OpenAI API client error codes
    if (error.code === 'insufficient_quota' || error.code === 'rate_limit_exceeded') {
      statusCode = 429;
      errorMessage = "LLM rate limit or quota exceeded. Please try again later.";
    } else if (error.code === 'invalid_api_key' || error.code === 'authentication_error') {
      statusCode = 401;
      errorMessage = "LLM authentication failed. Please check the API key.";
    } else {
      errorMessage = `LLM Error: ${error.message}`;
    }
  }

  // Optionally, implement retries for 429 and some 5xx errors here

  return new Response(JSON.stringify({ status: "error", message: errorMessage }), {
    status: statusCode,
    headers: { "Content-Type": "application/json" },
  });
}
```

### 5.3. Response Parsing Errors

Handle cases where the LLM's response is not in the expected format or is empty.

```typescript
if (!completion.choices?.[0]?.message?.content) {
  console.error("LLM returned an empty or malformed response.");
  return new Response(JSON.stringify({ status: "error", message: "LLM failed to generate a valid preview." }), {
    status: 500,
    headers: { "Content-Type": "application/json" },
  });
}
```

## 6. Security Considerations

### 6.1. LLM API Key Management

-   **Environment Variables:** Store the LLM API key (`OPENAI_API_KEY`, `GEMINI_API_KEY`, etc.) as an environment variable (`process.env.YOUR_LLM_API_KEY`) and never hardcode it or commit it to version control.
-   **Secrets Manager:** For more robust production environments, use a dedicated secrets manager (e.g., AWS Secrets Manager, Google Secret Manager, Azure Key Vault).

### 6.2. Input Sanitization/Validation

-   While the LLM APIs typically handle basic input, it's good practice to validate and potentially sanitize user inputs `content`, `contentType`, `styleGuide` to prevent unexpected behavior or reduce token usage from very long/malformed inputs.

### 6.3. Output Validation

-   The generated AI content should be treated as untrusted. If it's to be displayed directly on a webpage, ensure it's properly escaped to prevent XSS vulnerabilities.

## 7. High-Level Code Structure (TypeScript)

```typescript
// pages/api/generate-preview.ts (or similar API route file)

import type { NextApiRequest, NextApiResponse } from 'next'; // Or other framework types
import OpenAI from 'openai'; // Or your chosen LLM client

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
  // Add more granular validation for styleGuide, temperature, maxTokens

  try {
    // --- 2. Construct LLM Prompt/Messages ---
    const systemMessage = `You are an AI assistant tasked with generating clear and concise previews for various content types.
- Content Type: ${contentType}
- Style Guide: ${styleGuide || 'standard and informative'}
Generate a preview that is relevant and engaging, suitable for display.`;

    const userMessage = `Generate a preview for the following content:
"${content}"`;

    const messages = [
      { role: "system", content: systemMessage },
      { role: "user", content: userMessage },
    ];

    const llmParameters = {
      model: "gpt-4-turbo", // Make this configurable if needed
      temperature: typeof temperature === 'number' ? temperature : 0.7,
      max_tokens: typeof maxTokens === 'number' ? maxTokens : 150,
      // ... potentially other LLM specific parameters
    };

    // --- 3. Call LLM API ---
    const completion = await openai.chat.completions.create({
      messages: messages as any, // Type assertion might be needed depending on lib and TS version
      ...llmParameters,
    });

    // --- 4. Process LLM Response ---
    const generatedPreview = completion.choices[0]?.message?.content;

    if (!generatedPreview) {
      console.error("LLM returned an empty or malformed response for content:", content);
      return res.status(500).json({ status: "error", message: "LLM failed to generate a valid preview." });
    }

    return res.status(200).json({ status: "success", preview: generatedPreview });

  } catch (error: any) {
    // --- 5. Handle LLM API Errors ---
    console.error("Error integrating with LLM:", error);

    let statusCode = 500;
    let errorMessage = "An unexpected error occurred interacting with the LLM. Please try again.";

    if (error.response) {
      // For libraries that expose HTTP response details directly
      statusCode = error.response.status;
      errorMessage = error.response.data?.message || errorMessage;
    } else if (error instanceof OpenAI.APIError) { // Specific error handling for OpenAI library
      statusCode = error.status || 500;
      errorMessage = error.message;
      if (error.status === 401) {
        errorMessage = "Authentication error with LLM API. Please check server configuration.";
      } else if (error.status === 429) {
        errorMessage = "LLM API rate limit exceeded. Please try again shortly.";
      }
    } else {
        errorMessage = (error as Error).message;
    }


    return res.status(statusCode).json({ status: "error", message: errorMessage });
  }
}
```

## 8. Next Steps / Delegation

This plan provides the necessary details for a coding tool to implement the integration. The coding tool should:
1.  Create the `localcontent_ai/implementation_plans` directory if it doesn't exist. This step has been completed.
2.  Implement the `generate-preview.ts` API route following the detailed structure provided above.
3.  Ensure environment variables for the LLM API key are properly configured.
4.  Add comprehensive unit and integration tests for the new API route.
5.  Consider adding retry logic for transient LLM API errors (e.g., 429, 5xx) with exponential backoff.
6.  Document any LLM-specific parameters or considerations not covered in this general plan.
