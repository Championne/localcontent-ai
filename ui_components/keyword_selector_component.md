# Keyword Selection UI Component Design for LocalContent.ai

This document outlines the conceptual design for the Keyword Selection UI component within a React/Next.js application, similar to the project context of Gratisschadeverhalen.nl.

## 1. Component Hierarchy

The UI will primarily consist of a parent `KeywordSelector` component, which orchestrates the fetching, selection, and display of keywords. It will contain several child components for better modularity and separation of concerns.

```jsx
// components/KeywordSelector/KeywordSelector.tsx
<KeywordSelector>
  <KeywordSearchInput />
  <SuggestedKeywordsContainer>
    <KeywordGroup category="Suggested">
      {/* Renders multiple <KeywordChip /> components */}
    </KeywordGroup>
  </SuggestedKeywordsContainer>
  <CustomKeywordInput />
  <SelectedKeywordsDisplay>
    {/* Renders multiple <KeywordChip /> components for selected/custom keywords */}
  </SelectedKeywordsDisplay>
  <SaveKeywordsButton />
</KeywordSelector>

// Basic individual keyword chip component
<KeywordChip keyword="example" isSelected={true/false} onToggle={...} onDelete={...} />
```

**Component Breakdown:**

*   **`KeywordSelector` (Parent Component):**
    *   Manages the overall state for suggested and selected keywords.
    *   Orchestrates data fetching for suggested keywords.
    *   Passes state and handler functions down to child components.
*   **`KeywordSearchInput`:**
    *   An input field for users to search for keywords (optional, if a keyword search feature is implemented).
*   **`SuggestedKeywordsContainer`:**
    *   A container for displaying groups of suggested keywords.
*   **`KeywordGroup`:**
    *   Displays a set of keywords under a specific category (e.g., "Trending," "Related," "Industry-Specific").
    *   Each keyword within the group is rendered as a `KeywordChip`.
*   **`KeywordChip`:**
    *   A small, interactive component representing a single keyword.
    *   Can display the keyword text, a checkbox/toggle for selection, and potentially a delete button for custom keywords.
*   **`CustomKeywordInput`:**
    *   An input field where users can type and add their own custom keywords.
*   **`SelectedKeywordsDisplay`:**
    *   Displays the keywords currently selected by the user, including both suggested and custom keywords.
*   **`SaveKeywordsButton`:**
    *   A button to finalize and save the selected/custom keywords.

## 2. State Management for Selected Keywords and Custom Inputs

State will be managed primarily within the `KeywordSelector` parent component using React's `useState` hook. For more complex scenarios or global state shared across many components, a state management library (like Redux, Zustand, or React Context API) could be considered, but `useState` (and `useReducer` for more complex state transitions) should suffice for this initial design.

```typescript
// Inside KeywordSelector.tsx (simplified pseudocode)

interface Keyword {
  id: string;
  text: string;
  isCustom: boolean;
}

const [suggestedKeywords, setSuggestedKeywords] = useState<Keyword[]>([]);
const [selectedKeywords, setSelectedKeywords] = useState<Keyword[]>([]);
const [customKeywordInput, setCustomKeywordInput] = useState<string>('');

// Functions to manipulate state:
const handleKeywordToggle = (keywordId: string) => {
  // Toggle selection status for a keyword
};

const handleAddCustomKeyword = () => {
  // Add customKeywordInput to selectedKeywords
  // Clear customKeywordInput
};

const handleRemoveSelectedKeyword = (keywordId: string) => {
  // Remove keyword from selectedKeywords
};

// Effects for fetching data (see section 3)
// useEffect(() => { fetchSuggestedKeywords(); }, []);

```

**State Variables:**

*   `suggestedKeywords`: An array of `Keyword` objects fetched from an API. Each object might contain `id`, `text`, and potentially `category`.
*   `selectedKeywords`: An array of `Keyword` objects representing the keywords the user has selected or added. This should include a flag `isCustom` to differentiate user-added keywords.
*   `customKeywordInput`: A string to hold the value of the custom keyword input field.

## 3. Integration Points for Fetching Suggested Keywords

Suggested keywords will be fetched from a backend API. This operation will typically occur when the `KeywordSelector` component mounts or when specific user actions (e.g., typing in a search input, refreshing) trigger a re-fetch.

*   **API Endpoint:** `GET /api/keywords/suggested` (or similar).
*   **Data Fetching:**

    *   **Using `useEffect` (Client-Side Fetching):** Ideal for interactive components where data might change frequently or be dependent on user input.
        ```typescript
        // In KeywordSelector.tsx
        useEffect(() => {
          const fetchKeywords = async () => {
            try {
              const response = await fetch('/api/keywords/suggested');
              const data = await response.json();
              setSuggestedKeywords(data.keywords);
            } catch (error) {
              console.error('Failed to fetch suggested keywords:', error);
            }
          };
          fetchKeywords();
        }, []); // Empty dependency array means it runs once on mount
        ```

    *   **Using Next.js Data Fetching (`getServerSideProps` / `getStaticProps` / Route Handlers):** For initial data loading, especially if SEO is a concern or if the data doesn't change often. For a client-side interactive component, `useEffect` is often more suitable for subsequent fetches.

*   **Loading and Error States:** Implement `isLoading` and `error` state variables to provide feedback to the user during data fetching.

## 4. Basic UI Elements

The UI will consist of standard HTML form elements and custom-styled components to provide a clear and intuitive user experience.

*   **Keyword Display:**
    *   `KeywordChip` components (buttons or divs with styling).
    *   Each chip will typically include the keyword text and an interactive element (e.g., a checkbox, an "x" icon for removal).

*   **Checkboxes/Toggles:**
    *   For selecting/deselecting suggested keywords.
    *   Can be native HTML checkboxes visually hidden and styled, or custom toggle components.

*   **Input Field (`CustomKeywordInput`):**
    *   A standard `<input type="text" />` element for users to enter custom keywords.
    *   Should include an "Add" button or utilize the "Enter" key for submission.

*   **Display Area (`SelectedKeywordsDisplay`):**
    *   A visual container (e.g., `<div>`) to show all currently selected keywords, potentially with a distinct style for custom keywords.

*   **Buttons:**
    *   "Add" button for custom keywords.
    *   "Remove" button/icon on selected keyword chips.
    *   "Save" button to submit the final selection.

**Styling:**

*   Leverage Tailwind CSS and/or `shadcn/ui` components (as seen in Gratisschadeverhalen.nl) for consistent styling.
*   Ensure responsive design for various screen sizes.

This outline provides a solid foundation for developing the Keyword Selection UI, focusing on modularity, clear state management, and efficient data handling within a Next.js environment.