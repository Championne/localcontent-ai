
export interface Variant {
  name: string;
  sessions: number;
  clicks: number;
  conversions: number;
  conversionRate: string;
  clickThroughRate: string;
  uplift?: string;
  statisticalSignificance?: string;
  isWinning?: boolean;
}

export interface AbTest {
  id: string;
  name: string;
  status: "Running" | "Completed" | "Paused";
  startDate: string;
  endDate: string;
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
    hypothesis:
      "Changing the CTA button color from blue to green will increase click-through rate by 10%.",
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
    hypothesis:
      "A new product page layout with larger images will improve conversion rate.",
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
  {
    id: "checkout_flow_optimization",
    name: "Checkout Flow Optimization",
    status: "Paused",
    startDate: "2024-01-10",
    endDate: "2024-01-20",
    hypothesis:
      "Simplifying the checkout form will reduce abandonment rate by 5%.",
    variants: [
      {
        name: "Control (Current Form)",
        sessions: 7000,
        clicks: 200,
        conversions: 70,
        conversionRate: "1.0%",
        clickThroughRate: "2.86%",
      },
      {
        name: "Variant C (Simplified Form)",
        sessions: 6800,
        clicks: 210,
        conversions: 75,
        conversionRate: "1.1%",
        clickThroughRate: "3.09%",
      },
    ],
  },
];
