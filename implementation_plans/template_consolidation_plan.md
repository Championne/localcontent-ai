# Template Consolidation Plan for LocalContent AI

## 1. Objective

The primary objective of this plan is to semi-automate the consolidation and restructuring of various generated YAML templates. This will ensure consistency in naming, folder structure, and metadata across different categories such as `service_descriptions`, `cross_category`, and `social_media`.

## 2. Current State (Assumptions)

Currently, it is assumed that YAML templates for different content categories might reside in disparate locations, follow inconsistent naming conventions, and lack standardized metadata fields. This makes management, discovery, and utilization challenging.

## 3. Proposed Structure

### 3.1. Folder Structure

We propose a standardized, category-based folder structure:

```
templates/
├── service_descriptions/
│   ├── <template_name_1>.yaml
│   ├── <template_name_2>.yaml
│   └── ...
├── cross_category/
│   ├── <template_name_a>.yaml
│   ├── <template_name_b>.yaml
│   └── ...
├── social_media/
│   ├── <template_name_x>.yaml
│   ├── <template_name_y>.yaml
│   └── ...
└── general/ (for templates not fitting specific categories)
    └── ...
```

### 3.2. Naming Conventions

*   **File Names:** `snake_case` for file names. Example: `onboarding_email_template.yaml`, `product_launch_tweet.yaml`.
*   **Internal YAML Keys:** Use `snake_case` for all keys within the YAML templates for consistency.
*   **Template IDs:** Each template should have a unique `id` field, potentially combining category and a descriptive name (e.g., `service_descriptions_onboarding_email`).

## 4. Metadata Standardization

Each YAML template **must** include the following standard metadata fields:

```yaml
metadata:
  id: "unique_template_identifier" # e.g., service_descriptions_welcomeseries
  name: "Human-readable Template Name" # e.g., Welcome Series Email Template
  category: "service_descriptions" # or cross_category, social_media, general
  description: "A brief description of the template's purpose."
  version: "1.0.0" # Semantic versioning
  tags:
    - "email"
    - "welcome"
    - "customer_onboarding"
  created_at: "YYYY-MM-DDTHH:MM:SSZ" # ISO 8601 format
  updated_at: "YYYY-MM-DDTHH:MM:SSZ"
# ... rest of the template content
```

## 5. Semi-Automation Approach

The consolidation process will involve a mix of scripting and manual oversight across several phases:

### Phase 1: Discovery & Inventory

*   **Action:** Manually identify all existing YAML templates across the project.
*   **Tool:** `find . -name "*.yaml"` or `grep -r "template_key_example" .` to locate files.
*   **Output:** A list of all YAML files and their current paths.

### Phase 2: Restructuring & Renaming

*   **Action:** Move existing templates into the new standardized folder structure and rename files according to conventions.
*   **Script Suggestion (Python/Bash):**
    *   A Python script could iterate through discovered YAML files.
    *   Based on internal content (or a manual mapping), determine the correct `category`.
    *   Construct the new file path and name.
    *   Use `shutil.move` (Python) or `mv` (Bash) to relocate and rename files.
*   **Manual Override:** For ambiguous cases or initial setup, manual verification and movement will be necessary.

### Phase 3: Metadata Injection & Validation

*   **Action:** Read each YAML file, inject missing metadata, and validate existing metadata.
*   **Script Suggestion (Python with `PyYAML`):**
    1.  **Read:** Load each YAML file.
    2.  **Check Metadata:** Check for the presence of `metadata` block and all required fields (`id`, `name`, `category`, `description`, `version`, `tags`, `created_at`, `updated_at`).
    3.  **Prompt for Missing:** If fields are missing, the script can prompt the user for input or attempt to infer values (e.g., `category` from folder path, `name` from file name).
    4.  **Inject/Update:** Add or update the `metadata` block in the YAML dictionary.
    5.  **Validate:** Ensure `id` is unique, `category` matches the folder, `version` is valid, and timestamps are correctly formatted.
    6.  **Write Back:** Save the modified YAML content back to the file.
*   **Interactive Mode:** The script should ideally run in an interactive mode, asking for confirmation or input for each modification.

### Phase 4: Manual Review & Refinement

*   **Action:** A final human review of all restructured and updated YAML templates.
*   **Focus:**
    *   Verify correct categorization.
    *   Ensure metadata accuracy and completeness.
    *   Check for any syntax errors introduced during scripting.
    *   Refine descriptions and tags for better searchability.

## 6. Tools/Technologies

*   **Python 3.x:** With the `PyYAML` library for parsing and manipulating YAML files (`pip install PyYAML`).
*   **Bash/Shell Scripting:** For file system operations (moving, renaming).
*   **Version Control (Git):** Essential for tracking changes and allowing rollbacks.

## 7. Future Considerations

*   **CI/CD Integration:** Integrate metadata validation into CI/CD pipelines to prevent inconsistent templates from being committed.
*   **Template Linting:** Implement YAML linting rules to enforce structure and best practices beyond basic metadata.
*   **Web UI for Management:** For a larger scale, consider a simple web interface for managing, editing, and validating templates.
