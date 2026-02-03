# A/B Testing Dashboard UI Implementation Plan: `localcontent_ai/web/app/ab-testing-dashboard/page.tsx`

This document details the UI components and data flow for displaying mock A/B test results. It is prepared for delegation to a coding tool.

---

## 1. Objective

Implement a simple dashboard page (`page.tsx`) that displays mock A/B test results. The page should list available tests, show details for a selected test, and compare its variants using key metrics.

## 2. Technologies

*   **Framework:** Next.js (React)
*   **Language:** TypeScript
*   **Styling:** (To be determined by coding tool, e.g., Tailwind CSS, CSS Modules, etc. - assume basic styling for now)

## 3. UI Components Breakdown

The dashboard will consist of the following main components:

### 3.1. `AbTestingDashboardPage` (Main Page Component - `page.tsx`)

*   **Purpose:** Orchestrates the layout, fetches mock data, manages selected test state, and renders child components.
*   **Structure:**
    *   Page Title: "A/B Testing Dashboard"
    *   Test Selector Component
    *   Conditional rendering for `TestDetails` component based on `selectedTestId`.
*   **State:**
    *   `abTests`: Array of all A/B test data objects.
    *   `selectedTestId`: ID of the currently selected A/B test (string | null).

### 3.2. `TestSelector` Component

*   **Purpose:** Allows users to choose an A/B test from a list.
*   **Props:**
    *   `tests`: Array of simplified A/B test objects (e.g., `{ id, name, status }`).
    *   `onSelectTest`: Callback function to update the `selectedTestId` in `AbTestingDashboardPage`.
    *   `selectedTestId`: Current selected test ID.
*   **UI Elements:**
    *   A dropdown or a list of cards/buttons, each representing an A/B test.
    *   Each item should display the test name and status.
    *   Highlight the currently selected test.

### 3.3. `TestDetails` Component

*   **Purpose:** Displays comprehensive information for a single A/B test, including variants comparison.
*   **Props:**
    *   `test`: The full A/B test data object for the selected test.
*   **UI Elements:**
    *   **Test Summary Card:**
        *   Test Name
        *   Status (e.g., "Completed", "Running")
        *   Dates (Start Date, End Date)
        *   Hypothesis
    *   **Variant Comparison Section:**
        *   A table or list comparing each variant (Control, Variant A, etc.).
        *   For each variant, display: Name, Sessions, Clicks, Conversions, Conversion Rate, Click-Through Rate.
        *   For winning variants, display: Uplift, Statistical Significance.
        *   (Optional) Simple visual representation, e.g., a bar chart for conversion rates.

## 4. Data Flow

### 4.1. Mock Data Source

Since this is for displaying mock results, the data will be hardcoded within the `page.tsx` or imported from a local JSON file (e.g., `data/mockABTests.json`).

### 4.2. Mock Data Structure Example

```typescript
// localcontent_ai/data/mockABTests.ts
export interface Variant {
  name: string;
  sessions: number;
  clicks: number;
  conversions: number;
  conversionRate: string; // e.g., "1.0%"
  clickThroughRate: string; // e.g., "5.0%"
  uplift?: string; // e.g., "+18%"
  statisticalSignificance?: string; // e.g., "95%"
  isWinning?: boolean;
}

export interface AbTest {
  id: string;
  name: string;
  status: "Running" | "Completed" | "Paused";
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  hypothesis: string;
  variants: Variant[];
}

export const mockABTests: AbTest[] = [
  {
    id: "homepage_cta_color",
    name: "Homepage CTA Color",
    status: "Completed",
    startDate: "2023-10-01",
    endDate: "2023-10-15",
    hypothesis: "Changing the CTA button color from blue to green will increase click-through rate by 10%.",
    variants: [
      {
        name: "Control (Blue CTA)",
        sessions: 10000,
        clicks: 500,
        conversions: 100,
        conversionRate: "1.0%",
        clickThroughRate: "5.0%",
      },
      {
        name: "Variant A (Green CTA)",
        sessions: 10200,
        clicks: 580,
        conversions: 120,
        conversionRate: "1.18%",
        clickThroughRate: "5.68%",
        uplift: "+18%",
        statisticalSignificance: "95%",
        isWinning: true,
      },
    ],
  },
  {
    id: "product_page_layout",
    name: "Product Page Layout",
    status: "Running",
    startDate: "2024-03-01",
    endDate: "2024-03-31",
    hypothesis: "A new product page layout with larger images will improve conversion rate.",
    variants: [
      {
        name: "Control (Old Layout)",
        sessions: 5000,
        clicks: 300,
        conversions: 50,
        conversionRate: "1.0%",
        clickThroughRate: "6.0%",
      },
      {
        name: "Variant B (New Layout)",
        sessions: 5100,
        clicks: 320,
        conversions: 55,
        conversionRate: "1.08%",
        clickThroughRate: "6.27%",
      },
    ],
  },
  // Add more mock tests as needed
];
```

### 4.3. Data Flow Steps

1.  **`AbTestingDashboardPage`**:
    *   Loads `mockABTests` data on component mount (or directly during render if static).
    *   Initializes `abTests` state with the mock data.
    *   Sets `selectedTestId` to the `id` of the first test in `abTests` by default, or `null` if no tests.
2.  **`TestSelector`**:
    *   Receives `abTests` (or a simplified version) as `tests` prop.
    *   Renders a clickable UI element for each test.
    *   When an element is clicked, it calls `onSelectTest` with the `id` of the clicked test.
3.  **`AbTestingDashboardPage` (revisited)**:
    *   The `onSelectTest` callback updates the `selectedTestId` state.
    *   Filters the `abTests` array to find the full data object for the `selectedTestId`.
    *   Passes the full selected test object to the `TestDetails` component as a prop.
4.  **`TestDetails`**:
    *   Receives the full `test` object as a prop.
    *   Renders the test summary and variants comparison based on this data.

## 5. File Structure (Proposed)

```
localcontent_ai/
└── web/
    └── app/
        └── ab-testing-dashboard/
            ├── page.tsx                           // AbTestingDashboardPage component
            └── components/
                ├── TestSelector.tsx               // Component for selecting A/B tests
                └── TestDetails.tsx                // Component for displaying selected test details
└── data/
    └── mockABTests.ts                         // Mock A/B test data and interfaces
```

## 6. Next Steps for Coding Tool

*   Create the described file structure.
*   Implement the `AbTestingDashboardPage` in `page.tsx`.
*   Implement the `TestSelector` component.
*   Implement the `TestDetails` component.
*   Populate `mockABTests.ts` with the provided data structure.
*   Ensure basic styling for readability.
*   Make sure the mock data is clearly indicated as such in the UI.

---
**End of Plan**