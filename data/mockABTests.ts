
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
      {
        name: "Variant B (Red CTA)",
        sessions: 9800,
        clicks: 480,
        conversions: 95,
        conversionRate: "0.97%",
        clickThroughRate: "4.9%",
        isWinning: false,
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
        name: "Variant A (New Layout)",
        sessions: 5100,
        clicks: 320,
        conversions: 55,
        conversionRate: "1.08%",
        clickThroughRate: "6.27%",
      },
    ],
  },
  {
    id: "checkout_flow_optimization",
    name: "Checkout Flow Optimization",
    status: "Paused",
    startDate: "2024-02-10",
    endDate: "2024-02-20",
    hypothesis: "Reducing the number of steps in the checkout process will decrease cart abandonment.",
    variants: [
      {
        name: "Control (3 Steps)",
        sessions: 7000,
        clicks: 400,
        conversions: 200,
        conversionRate: "2.86%",
        clickThroughRate: "5.71%",
      },
      {
        name: "Variant X (2 Steps)",
        sessions: 7200,
        clicks: 450,
        conversions: 240,
        conversionRate: "3.33%",
        clickThroughRate: "6.25%",
        uplift: "+16%",
        statisticalSignificance: "90%",
        isWinning: true,
      },
    ],
  },
];
