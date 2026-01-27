# Template Preview Functionality Design for LocalContent.ai

## 1. Introduction

This document outlines the conceptual layout and requirements for a 'Template Preview Functionality' for LocalContent.ai. This feature aims to empower users to visualize generated content based on selected YAML templates and user-provided variables in real-time, ensuring content accuracy and responsiveness across devices. This directly addresses the strategic analysis recommendation for 'Add template preview functionality', enhancing user experience and confidence in content generation.

## 2. UI Components

The Template Preview functionality will consist of the following key UI components:

### 2.1. Template Selection Area
*   **Component**: A dropdown menu or a list/card view displaying available YAML templates.
*   **Interaction**: Users can select a template from the list.
*   **Information**: Each template option should ideally show its name and a brief description.

### 2.2. Variable Input Form
*   **Component**: A dynamically generated form area.
*   **Interaction**: Once a template is selected, input fields will automatically appear, corresponding to the variables defined within the chosen YAML template (e.g., `company_name`, `city`, `service_offered`).
*   **Input Types**:
    *   Text inputs (single line, multi-line)
    *   Dropdowns/Selects (if variables have predefined options)
    *   Checkboxes/Toggles (for boolean variables)
    *   Date pickers (for date variables)
*   **Real-time Update**: As users type into these fields, the preview area should update in near real-time (with debouncing for performance optimization).
*   **Validation**: Basic client-side validation (e.g., required fields).

### 2.3. Content Preview Area
*   **Component**: A dedicated display area, likely an `<iframe>` or a styled `<div>`, to render the generated content.
*   **Real-time Update**: This area will continuously refresh to show the output of the selected template with the current input variables.
*   **Styling**: The preview should reflect the intended final styling of the generated content as much as possible (e.g., if it's an email, it should look like an email; if it's a blog post, it should look like a blog post).

### 2.4. Responsiveness Toggle
*   **Component**: Buttons or a toggle switch (e.g., "Desktop View", "Mobile View") or device icons.
*   **Interaction**: Users can switch between different viewport sizes to see how the generated content adapts to desktop and mobile screens.
*   **Implementation**: This could be achieved by resizing the `<iframe>` or applying specific CSS classes to simulate different device views within the preview area.

### 2.5. Action Buttons (Optional but Recommended)
*   **Component**: Buttons such as "Generate Content" (to finalize and generate the actual content), "Save Changes" (to save template/variable combinations), "Clear Inputs".

## 3. User Flow

1.  **Access Feature**: User navigates to the "Template Preview" section within LocalContent.ai.
2.  **Select Template**: User browses and selects a YAML template from the "Template Selection Area."
3.  **Dynamic Form Load**: The "Variable Input Form" populates with relevant input fields based on the selected template's variables.
4.  **Input Variables**: User starts filling in the required and optional variable fields.
5.  **Real-time Preview**: As typing occurs (with a short delay/debounce), the "Content Preview Area" automatically updates, showing the generated content.
6.  **Check Responsiveness**: User uses the "Responsiveness Toggle" to view the content in desktop and mobile layouts.
7.  **(Optional) Refine & Iterate**: User modifies input variables and observes changes in the preview until satisfied.
8.  **(Optional) Finalize**: User clicks "Generate Content" or similar to proceed with creating the actual content based on the previewed output.

## 4. Key Technical Considerations

### 4.1. Backend
*   **Template Storage**: YAML templates will be stored securely (e.g., database, file system).
*   **Templating Engine**: A robust server-side templating engine (e.g., Jinja2 for Python, Handlebars/Nunjucks for Node.js, Go's `text/template`) will be used to process YAML templates with provided variables.
*   **API Endpoint**: An API endpoint (e.g., `/api/render-template`) will accept a `template_id` and a JSON object of `variables`, returning the rendered HTML/text content.
*   **Validation & Sanitization**: Server-side validation of input variables and sanitization of rendered output to prevent XSS or template injection attacks.

### 4.2. Frontend
*   **Framework**: A modern JavaScript framework (e.g., React, Vue, Angular) will manage the dynamic UI.
*   **State Management**: Efficient state management for selected template, input variables, and preview content.
*   **Debouncing**: Implement debouncing on input fields to prevent excessive API calls and UI updates, ensuring a smooth user experience.
*   **API Integration**: Asynchronous calls to the backend API for template variable schema and content rendering.
*   **Responsive Preview**:
    *   Using an `<iframe>` is recommended for isolating the previewed content's CSS from the main application's CSS, and for easily simulating different viewport sizes.
    *   Alternatively, CSS media queries and flexbox/grid layouts within a controlled `div` can be used, but CSS isolation might be trickier.
*   **Error Display**: Display clear error messages for API failures, invalid template rendering, or missing variables.

### 4.3. Data Flow
1.  **Template Selection**: Frontend sends `template_id` to backend.
2.  **Variable Schema Fetch**: Backend returns a JSON schema or definition of variables expected by the template (e.g., `[ { name: 'company_name', type: 'string', required: true }, ... ]`).
3.  **Form Generation**: Frontend uses variable schema to dynamically build the input form.
4.  **Variable Input**: User inputs data into form fields. Frontend stores this data in its state.
5.  **Preview Trigger**: On input change (debounced), frontend sends `template_id` and current `variables` JSON to the backend's rendering API.
6.  **Content Rendering**: Backend processes template with variables and returns rendered content (HTML/text).
7.  **Preview Display**: Frontend receives rendered content and injects it into the "Content Preview Area" (`<iframe>` or `<div>`).

### 4.4. Security
*   **Input Sanitization**: All user inputs must be properly sanitized on both client and server sides.
*   **Template Injection Prevention**: The templating engine configuration should be secure to prevent users from injecting malicious code into the templates themselves.
*   **Access Control**: Ensure only authorized users can create, edit, and preview templates.

## 5. Strategic Recommendation Acknowledgment

This 'Template Preview Functionality' directly addresses the strategic analysis recommendation for 'Add template preview functionality'. By providing a real-time, interactive, and responsive preview, LocalContent.ai will significantly improve the usability and effectiveness of its content generation capabilities, allowing users to confidently craft their desired content outcomes.
