# Automated Content Generation Engine - Implementation Plan

## 1. How Template Variables Are Passed

Template variables will be defined within YAML templates using a specific placeholder syntax (e.g., `{{variable_name}}`). The system will follow these steps:

*   **Variable Extraction:** A parsing module will scan the loaded YAML template to identify all defined variables.
*   **Data Source Mapping:** For each extracted variable, the system will attempt to map it to an internal data source or external input. This could involve:
    *   **Direct User Input:** Variables populated directly by the user through a UI or API call.
    *   **Database Lookup:** Fetching values from a database based on pre-defined queries or identifiers (e.g., `product_name` from a product database).
    *   **Contextual Information:** Automatically populating variables based on the context of the content generation request (e.g., current date, target audience).
    *   **Default Values:** Utilizing default values defined within the template itself or a configuration file if no other source is available.
*   **Variable Replacement:** Before feeding the template to the LLM or final rendering, an templating engine (e.g., Jinja2 for Python, or a custom string replacement, or directly by the LLM if instructed) will replace the placeholders with their corresponding populated values.

## 2. How Keywords from the Suggester Are Fed into the LLM Prompt

The keyword suggester will provide a list of relevant keywords or key phrases. These keywords will be integrated into the LLM prompt in a structured manner to guide content generation:

*   **Keyword Selection:** The system will select a subset or all of the suggested keywords based on relevance, priority, or a defined strategy (e.g., top N keywords).
*   **Prompt Augmentation:** The selected keywords will be inserted into the LLM prompt. Common strategies include:
    *   **Direct Inclusion:** Listing keywords explicitly within the prompt, e.g., "Write an article about [topic] including these keywords: [keyword1], [keyword2], [keyword3]."
    *   **Contextual Integration:** Weaving keywords naturally into parts of the prompt, often within sections describing the desired content structure or tone.
    *   **Constraint-Based Inclusion:** Specifying keywords as mandatory elements that the LLM must incorporate into the generated text.
*   **Weighted Keywords:** For more advanced control, keywords could be assigned weights, influencing their prominence in the generated content. This information could be conveyed to the LLM in a specific instruction.

## 3. How the LLM is Invoked (API Calls, Which LLMs)

The LLM will be invoked via API calls. The choice of LLM will be configurable, allowing flexibility and potential A/B testing:

*   **API Endpoints:**
    *   **Anthropic Claude:** Use Anthropic's official API (e.g., `api.anthropic.com/v1/messages`).
    *   **OpenAI GPT:** Use OpenAI's official API (e.g., `api.openai.com/v1/chat/completions`).
    *   **Local/Custom LLMs:** If self-hosted or custom LLMs are used, a standardized internal API wrapper will be developed to ensure consistent invocation.
*   **API Authentication:** API keys will be securely managed (e.g., environment variables, secret management services) and passed with each API request.
*   **Prompt Construction:** The core prompt will be dynamically constructed, combining:
    *   The processed YAML template content (with variables replaced).
    *   Instructions for the LLM (e.g., tone, style, length, format).
    *   The integrated keywords from the suggester.
*   **Model Selection:** The API call will specify the desired LLM model (e.g., `claude-3-opus-20240229`, `gpt-4o`, `gpt-3.5-turbo`).
*   **Parameters:** Other relevant parameters such as `temperature` (creativity), `max_tokens` (length), and `stop_sequences` (controlling output generation) will be passed to the LLM API.

## 4. Strategies for Handling LLM Output (Parsing, Validation, Storage)

Handling LLM output requires a robust pipeline for parsing, validation, and temporary storage:

*   **Parsing:**
    *   **Structured Output (JSON/XML):** If the prompt instructs the LLM to output in a structured format (e.g., JSON), a JSON parser will be used to extract specific fields.
    *   **Delimited Text:** For simpler cases, specific delimiters or patterns can be used to extract sections of the text (e.g., "Title: [title]
Content: [content]").
    *   **Free-form Text:** For unstructured output, natural language processing (NLP) techniques or regular expressions might be applied to identify key elements, or the content will be treated as a single block.
*   **Validation:**
    *   **Completeness Checks:** Verify that all required sections or data points are present as per the template or instructions.
    *   **Content Quality:** Basic checks for length, readability scores, and absence of explicitly forbidden terms (e.g., profanity filters).
    *   **Keyword Presence:** Validate that the LLM has incorporated the specified keywords as instructed.
    *   **Factual Accuracy (Limited):** While full factual accuracy requires human review, basic checks against known data points or rules can be implemented (e.g., ensuring a product name is correct).
    *   **Schema Validation:** If structured output is expected (JSON), validate it against a predefined schema.
*   **Temporary Storage:** The parsed and validated LLM output will be temporarily stored in a cache or a staging database before finalization. This allows for review, refinement, or further processing by other modules.

## 5. How the Generated Output Is Stored/Presented to the User

The final generated content will be stored persistently and presented to the user through various channels:

*   **Storage:**
    *   **Database:** Store content in a relational (e.g., PostgreSQL, MySQL) or NoSQL database (e.g., MongoDB, DynamoDB). This allows for easy querying, indexing, and management.
        *   **Schema:** The database schema will include fields for `content_id`, `template_id`, `generated_text`, `creation_timestamp`, `status` (e.g., draft, published, reviewed), `keywords_used`, and any other relevant metadata.
    *   **File System/Cloud Storage:** For larger content pieces or static files (e.g., HTML, Markdown), content can be stored in a file system or cloud storage solutions (e.g., AWS S3, Google Cloud Storage), with metadata stored in the database.
    *   **Version Control:** Optionally, for critical content, integration with a version control system (e.g., Git) can track changes.
*   **Presentation to User:**
    *   **Web UI/Dashboard:** A dedicated web interface where users can:
        *   View generated content drafts.
        *   Review, edit, and approve content.
        *   Initiate new content generation tasks.
        *   Track the status of generation jobs.
    *   **API Endpoints:** Expose API endpoints to allow other applications or services to retrieve the generated content for their own use cases (e.g., publishing to a CMS, sending to an email marketing platform).
    *   **Notifications:** Send notifications (email, platform messages) to users when content generation is complete or requires review.
    *   **Direct Publishing ( після перегляду):** For fully automated pipelines, once reviewed and approved, content can be automatically published to target platforms (e.g., CMS, social media, e-commerce platform) via their respective APIs.
