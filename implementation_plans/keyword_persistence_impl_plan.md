# Keyword Persistence Implementation Plan

## Overview
This plan details the enhancement of `localcontent_ai/web/components/KeywordSelector.tsx` to persist selected keywords using browser's `localStorage`. This will allow users to retain their chosen keywords across sessions.

## Implementation Details

### Local Storage Key
The keywords will be stored under the `localStorage` key: `localcontent_ai_selected_keywords`.

### Loading Keywords (`useEffect` - Mount Phase)
An `useEffect` hook will be implemented to load previously selected keywords from `localStorage` when the `KeywordSelector` component mounts.

1.  **Dependency Array**: `[]` (runs once on mount).
2.  **Logic**:
    *   Retrieve the item `localcontent_ai_selected_keywords` from `localStorage`.
    *   If the item exists:
        *   Attempt to parse the retrieved JSON string using `JSON.parse`.
        *   In case of a `JSON.parse` error (e.g., malformed data), log the error and initialize with an empty array.
        *   Assuming successful parsing, the result (an array of strings) will be used to initialize or update the component's state (`selectedKeywords`).
    *   If the item does not exist, the `selectedKeywords` state will remain its initial default (likely an empty array).

```typescript
useEffect(() => {
  try {
    const storedKeywords = localStorage.getItem('localcontent_ai_selected_keywords');
    if (storedKeywords) {
      const parsedKeywords: string[] = JSON.parse(storedKeywords);
      // Assuming `setSelectedKeywords` is the state setter for the component's selected keywords
      setSelectedKeywords(parsedKeywords);
    }
  } catch (error) {
    console.error("Failed to parse stored keywords from localStorage:", error);
    // Optionally, clear invalid data or reset to default empty array
    // setSelectedKeywords([]);
  }
}, []); // Empty dependency array means this runs once on mount
```

### Saving Keywords (`useEffect` - Update Phase)
Another `useEffect` hook will be implemented to save the current `selectedKeywords` state to `localStorage` whenever it changes.

1.  **Dependency Array**: `[selectedKeywords]` (runs on initial render and whenever `selectedKeywords` changes).
2.  **Logic**:
    *   Convert the current `selectedKeywords` array to a JSON string using `JSON.stringify`.
    *   Save this JSON string to `localStorage` under the key `localcontent_ai_selected_keywords`.

```typescript
useEffect(() => {
  try {
    localStorage.setItem('localcontent_ai_selected_keywords', JSON.stringify(selectedKeywords));
  } catch (error) {
    console.error("Failed to save keywords to localStorage:", error);
  }
}, [selectedKeywords]); // Runs whenever selectedKeywords state changes
```

## Data Structure in localStorage
The data stored in `localStorage` will be a JSON string representation of an array of strings (e.g., `["keyword1", "keyword2", "keyword3"]`).

## Error Handling
Basic `try-catch` blocks will be used around `localStorage.getItem`, `JSON.parse`, and `localStorage.setItem` to gracefully handle potential errors (e.g., storage full, malformed JSON). Console errors will be logged to aid debugging.

## Delegation to Coding Tool
This plan is ready to be delegated to a coding tool for implementation within `localcontent_ai/web/components/KeywordSelector.tsx`.