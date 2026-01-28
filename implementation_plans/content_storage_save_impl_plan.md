# Implementation Plan: Next.js API Route for Content Storage and Python Integration

This plan details the creation of a Next.js API route to store generated LLM content and the necessary updates to the `generate_llm_content.py` script to interact with this API.

## 1. Next.js API Route: `localcontent_ai/web/pages/api/content-manager.ts`

**Objective:** Create an API endpoint to receive and store generated content.

**Endpoint:** `/api/content-manager`
**Method:** `POST`

**Request Body Structure (JSON):**
```json
{
  "title": "string",         // Title of the generated content
  "content": "string",       // The actual generated content
  "model": "string",         // The LLM model used (e.g., "gemini-pro")
  "timestamp": "string"      // ISO 8601 formatted timestamp (e.g., "2023-10-27T10:00:00Z")
}
```

**Logic Flow:**

1.  **Receive POST Request:** The server receives a POST request to `/api/content-manager`.
2.  **Input Validation:**
    *   Check if `title`, `content`, `model`, and `timestamp` are present in the request body.
    *   Optionally, validate `timestamp` format.
3.  **Data Storage:**
    *   For initial implementation, store the content in a local JSON file. A suitable location would be `localcontent_ai/data/generated_content.json`.
    *   The storage mechanism should append new content entries to an array in this JSON file.
    *   If the file doesn't exist, create it with an empty array.
    *   Each entry in the JSON file would match the request body structure.
4.  **Response:**
    *   On successful storage, return a `200 OK` status with a success message.
    *   On validation failure or storage error, return appropriate error statuses (e.g., `400 Bad Request`, `500 Internal Server Error`) with an error message.

**Example `generated_content.json` structure:**
```json
[
  {
    "title": "First AI Generated Article",
    "content": "This is the content of the first article...",
    "model": "gemini-pro",
    "timestamp": "2023-10-27T10:00:00Z"
  },
  {
    "title": "Second AI Generated Story",
    "content": "Once upon a time...",
    "model": "claude-3-opus",
    "timestamp": "2023-10-27T10:35:00Z"
  }
]
```

## 2. Python Script Update: `generate_llm_content.py`

**Objective:** Modify the script to send generated content to the Next.js API route.

**Integration Steps:**

1.  **After Content Generation:** Once the LLM successfully generates content, prepare the data to be sent.
2.  **Construct Payload:** Create a Python dictionary matching the Next.js API route's expected JSON structure:
    ```python
    import datetime
    import json
    import requests

    # ... (existing content generation logic) ...

    generated_title = "Your Generated Title Here"
    generated_content = "Your LLM generated content goes here."
    llm_model_used = "gemini-pro" # Or dynamically obtained from config/response

    payload = {
        "title": generated_title,
        "content": generated_content,
        "model": llm_model_used,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }
    ```
3.  **Send POST Request:**
    *   Use the `requests` library to send a `POST` request to the Next.js API.
    *   The API URL will likely be `http://localhost:3000/api/content-manager` during local development. This should be configurable (e.g., via environment variable).
    ```python
    api_url = "http://localhost:3000/api/content-manager" # This should be configurable
    headers = {"Content-Type": "application/json"}

    try:
        response = requests.post(api_url, data=json.dumps(payload), headers=headers)
        response.raise_for_status() # Raise HTTPError for bad responses (4xx or 5xx)
        print("Content successfully saved via API.")
        print("API Response:", response.json())
    except requests.exceptions.RequestException as e:
        print(f"Error saving content via API: {e}")
        if hasattr(e, 'response') and e.response is not None:
             print(f"API Error Response: {e.response.text}")
    ```
4.  **Error Handling:** Implement robust error handling for network issues or API-side errors.

## 3. Preparation for Delegation

This plan provides sufficient detail for a coding tool to implement the Next.js API route and update the Python script. The coding tool should:

*   Create the Next.js API file `localcontent_ai/web/pages/api/content-manager.ts` with the specified logic for handling POST requests and saving to `localcontent_ai/data/generated_content.json`.
*   Modify `generate_llm_content.py` to make the HTTP POST request to the Next.js API after content generation.
*   Ensure necessary imports (`datetime`, `json`, `requests` in Python, and relevant Next.js/Node.js modules) are in place.
*   Consider adding basic logging to both components for debugging.
*   Add a `.gitignore` entry to `localcontent_ai/data/generated_content.json` if it's not meant to be tracked by version control.
