# Template Preview Database Integration Plan

This document outlines the conceptual design for integrating a template preview feature with a database, specifically focusing on how `localcontent_ai/web/app/template-preview/page.tsx` would fetch templates and dynamically render input fields for variables.

## 1. How Templates are Stored in DB (Supabase Schema Idea)

We will use a PostgreSQL database, consistent with Supabase. A `templates` table could store the core template information, and potentially a separate `template_variables` table for more complex variable management, or simply embed variables as JSONB within the `templates` table for simplicity. Given the need for dynamic rendering, storing variable metadata (name, type, default value, description) is crucial.

### `templates` Table Schema

```sql
CREATE TABLE IF NOT EXISTS public.templates (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,
  description TEXT,
  template_content TEXT NOT NULL, -- The actual template text (e.g., Markdown, HTML with placeholders)
  variables   JSONB,              -- Stores metadata for dynamic variables (e.g., [{"name": "product_name", "type": "string", "default": "Awesome Product", "label": "Product Name"}, {"name": "price", "type": "number", "default": 100, "label": "Price"}])
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**`variables` JSONB Structure Example:**

```json
[
  {
    "name": "company_name",
    "type": "string",
    "label": "Company Name",
    "placeholder": "Enter your company's name",
    "default": "Acme Inc."
  },
  {
    "name": "customer_name",
    "type": "string",
    "label": "Customer Name",
    "placeholder": "e.g., John Doe",
    "default": "Valued Customer"
  },
  {
    "name": "offer_percentage",
    "type": "number",
    "label": "Discount Percentage",
    "min": 0,
    "max": 100,
    "default": 10
  },
  {
    "name": "is_new_customer",
    "type": "boolean",
    "label": "New Customer?",
    "default": false
  },
  {
    "name": "products_list",
    "type": "array_string",
    "label": "List of Products (comma-separated)",
    "default": "Product A, Product B"
  }
]
```

## 2. API Endpoint (Mock Next.js API) to Fetch Template List

We will create Next.js API routes under `app/api/templates/` to interact with the database.

### `GET /api/templates` (List all templates)

This endpoint will fetch a list of all available templates. For efficiency, it should **not** return `template_content` or `variables` for the list view, only metadata like `id`, `name`, `description`.

**Filename:** `app/api/templates/route.ts`

```typescript
// pages/api/templates.ts or app/api/templates/route.ts (for Next.js App Router)
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createServerComponentClient({ cookies });
  const { data, error } = await supabase
    .from('templates')
    .select('id, name, description'); // Select only metadata for the list

  if (error) {
    console.error('Error fetching templates:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
```

### `GET /api/templates/[id]` (Fetch a single template with content and variables)

This endpoint will fetch a specific template by ID, including its `template_content` and `variables` for the preview and dynamic input rendering.

**Filename:** `app/api/templates/[id]/route.ts`

```typescript
// pages/api/templates/[id].ts or app/api/templates/[id]/route.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const supabase = createServerComponentClient({ cookies });

  const { data, error } = await supabase
    .from('templates')
    .select('*') // Get all fields including template_content and variables
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching template ${id}:`, error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ message: 'Template not found' }, { status: 404 });
  }

  return NextResponse.json(data);
}
```

## 3. How to Pass Selected Template ID/Data to the Python `template_preview_generator.py`

The Python script `template_preview_generator.py` will run on the backend. The Next.js application will send the selected template's content and the user-provided variable values to a backend API which then invokes the Python script.

1.  **Frontend Action:** When the user selects a template and fills in the variable inputs, the `localcontent_ai/web/app/template-preview/page.tsx` component will collect the template's `template_content` and a dictionary of the user-entered variable key-value pairs.
2.  **Backend API Endpoint (Next.js):** A new API endpoint, e.g., `POST /api/generate-preview`, will receive this data.
3.  **Invoke Python Script:** This Next.js API endpoint will then call the `template_preview_generator.py` script. This could be done by:
    *   **Direct Execution (Local/Containerized):** If the Python script is part of the same backend service, the Node.js API can directly execute it using `child_process.spawn` (or equivalent), passing template content and variables as command-line arguments or via `stdin`.
    *   **HTTP Request to Python Service:** If `template_preview_generator.py` is exposed as its own microservice (e.g., using Flask, FastAPI, or a serverless function like AWS Lambda/Google Cloud Functions), the Next.js API will make an HTTP POST request to this service, sending the `template_content` and `variables` in the request body. This is generally preferred for separation of concerns and scaling.

### `POST /api/generate-preview` (Mock Next.js API)

**Filename:** `app/api/generate-preview/route.ts`

```typescript
import { NextResponse } from 'next/server';
// Assuming the Python script is accessible via an HTTP endpoint
// In a real scenario, this would be an actual fetch request to your Python backend
// For this design, we'll mock the invocation.

export async function POST(request: Request) {
  const { templateContent, variables } = await request.json();

  if (!templateContent || !variables) {
    return NextResponse.json({ error: 'Missing templateContent or variables' }, { status: 400 });
  }

  try {
    // ---- Mocking Python script invocation ----
    console.log('Invoking template_preview_generator.py with:');
    console.log('Template Content:', templateContent.substring(0, 100) + '...'); // Log a snippet
    console.log('Variables:', variables);

    // In a real scenario:
    // const pythonResponse = await fetch('YOUR_PYTHON_PREVIEW_SERVICE_URL/generate', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ template: templateContent, data: variables }),
    // });
    // const previewResult = await pythonResponse.json();
    // if (!pythonResponse.ok) {
    //   throw new Error(previewResult.error || 'Python service error');
    // }

    // For design purposes, simulate the Python script's output
    const processedContent = templateContent.replace(/\{\{(\w+)\}\}/g, (match: string, p1: string) => {
      const varValue = variables[p1];
      return varValue !== undefined ? String(varValue) : match; // Replace or keep placeholder
    });

    const previewResult = {
      htmlPreview: `<div style="padding: 20px; border: 1px solid #eee;"><h1>Preview</h1><p>${processedContent}</p></div>`,
      plainTextPreview: processedContent,
    };
    // ---- End Mocking ----

    return NextResponse.json(previewResult);
  } catch (error: any) {
    console.error('Error generating preview:', error.message);
    return NextResponse.json({ error: 'Failed to generate preview: ' + error.message }, { status: 500 });
  }
}
```

The `template_preview_generator.py` script would expect `template` and `data` (key-value pairs of variables) as input.

## 4. Dynamic Rendering of Input Fields for Variables

The `localcontent_ai/web/app/template-preview/page.tsx` component is responsible for:
1.  Fetching the list of templates using `GET /api/templates`.
2.  Allowing the user to select a template.
3.  Fetching the details of the selected template using `GET /api/templates/[id]`.
4.  Parsing the `variables` JSONB array from the selected template.
5.  Dynamically rendering appropriate HTML input fields (text, number, checkbox for boolean, textarea/multi-select for arrays) based on the `type` specified in the `variables` metadata.
6.  Collecting user input from these fields.
7.  Sending the collected `template_content` and user-provided `variables` to `POST /api/generate-preview` to get the rendered preview.

### Frontend Component (`localcontent_ai/web/app/template-preview/page.tsx` conceptual flow)

```tsx
// localcontent_ai/web/app/template-preview/page.tsx

'use client'; // This would be a client component for interactivity

import React, { useState, useEffect } from 'react';

interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array_string';
  label: string;
  placeholder?: string;
  default?: any;
  min?: number;
  max?: number;
}

interface Template {
  id: string;
  name: string;
  description: string;
  template_content: string;
  variables: TemplateVariable[];
}

export default function TemplatePreviewPage() {
  const [templates, setTemplates] = useState<{ id: string; name: string; description: string }[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [variableValues, setVariableValues] = useState<Record<string, any>>({});
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch list of templates on component mount
  useEffect(() => {
    async function fetchTemplates() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/templates');
        if (!response.ok) {
          throw new Error('Failed to fetch templates');
        }
        const data = await response.json();
        setTemplates(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchTemplates();
  }, []);

  // 2. Fetch selected template details when ID changes
  useEffect(() => {
    async function fetchSelectedTemplate() {
      if (!selectedTemplateId) {
        setSelectedTemplate(null);
        setVariableValues({});
        setPreviewHtml('');
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/templates/${selectedTemplateId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch template ${selectedTemplateId}`);
        }
        const data: Template = await response.json();
        setSelectedTemplate(data);

        // Initialize variable values with defaults or empty based on type
        const initialValues: Record<string, any> = {};
        data.variables.forEach((variable) => {
          initialValues[variable.name] = variable.default !== undefined ? variable.default : '';
          if (variable.type === 'boolean' && variable.default === undefined) {
            initialValues[variable.name] = false; // Default boolean to false if not specified
          }
        });
        setVariableValues(initialValues);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchSelectedTemplate();
  }, [selectedTemplateId]);

  const handleVariableChange = (name: string, value: any, type: string) => {
    setVariableValues((prev) => {
      let processedValue = value;
      if (type === 'number') {
        processedValue = Number(value);
        if (isNaN(processedValue)) processedValue = ''; // Handle invalid number input
      } else if (type === 'boolean') {
        processedValue = (value === 'true' || value === true); // Handle checkbox boolean values
      } else if (type === 'array_string') {
        processedValue = String(value).split(',').map(item => item.trim());
      }
      return { ...prev, [name]: processedValue };
    });
  };

  const generatePreview = async () => {
    if (!selectedTemplate) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/generate-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateContent: selectedTemplate.template_content,
          variables: variableValues,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate preview');
      }

      const data = await response.json();
      setPreviewHtml(data.htmlPreview); // Assuming the API returns HTML content
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Template Preview</h1>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      <div className="mb-4">
        <label htmlFor="template-select" className="block text-sm font-medium text-gray-700">
          Select Template:
        </label>
        <select
          id="template-select"
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          value={selectedTemplateId || ''}
          onChange={(e) => setSelectedTemplateId(e.target.value)}
          disabled={loading}
        >
          <option value="">-- Choose a template --</option>
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
      </div>

      {selectedTemplate && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
          {/* Left panel: Variable Inputs */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Template Variables for "{selectedTemplate.name}"</h2>
            <div className="space-y-4">
              {selectedTemplate.variables.length > 0 ? (
                selectedTemplate.variables.map((variable) => (
                  <div key={variable.name}>
                    <label htmlFor={variable.name} className="block text-sm font-medium text-gray-700">
                      {variable.label || variable.name}
                    </label>
                    {variable.type === 'string' && (
                      <input
                        type="text"
                        id={variable.name}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder={variable.placeholder}
                        value={variableValues[variable.name] || ''}
                        onChange={(e) => handleVariableChange(variable.name, e.target.value, variable.type)}
                      />
                    )}
                    {variable.type === 'number' && (
                      <input
                        type="number"
                        id={variable.name}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder={variable.placeholder}
                        value={variableValues[variable.name] !== undefined ? variableValues[variable.name] : ''}
                        onChange={(e) => handleVariableChange(variable.name, e.target.value, variable.type)}
                        min={variable.min}
                        max={variable.max}
                      />
                    )}
                    {variable.type === 'boolean' && (
                      <input
                        type="checkbox"
                        id={variable.name}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        checked={!!variableValues[variable.name]} // Ensure boolean checked state
                        onChange={(e) => handleVariableChange(variable.name, e.target.checked, variable.type)}
                      />
                    )}
                    {variable.type === 'array_string' && (
                      <textarea
                        id={variable.name}
                        rows={3}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder={variable.placeholder || "Enter comma-separated values"}
                        value={Array.isArray(variableValues[variable.name]) ? variableValues[variable.name].join(', ') : ''}
                        onChange={(e) => handleVariableChange(variable.name, e.target.value, variable.type)}
                      ></textarea>
                    )}
                  </div>
                ))
              ) : (
                <p>No variables defined for this template.</p>
              )}
            </div>
            {selectedTemplate.variables.length > 0 && (
                <button
                onClick={generatePreview}
                className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={loading}
                >
                {loading ? 'Generating...' : 'Generate Preview'}
                </button>
            )}
          </div>

          {/* Right panel: Live Preview */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Live Preview</h2>
            <div
              className="p-4 border border-gray-200 rounded-md bg-white shadow-sm min-h-[200px] overflow-auto"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
```

This design provides a clear separation of concerns, uses Next.js API routes for backend interaction, and defines a robust schema for template and variable management, enabling dynamic UI generation on the frontend.
