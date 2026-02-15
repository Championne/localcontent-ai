import { NextApiRequest, NextApiResponse } from 'next';

export interface Variant {
  name: string;
  impressions: number;
  conversions: number;
  ctr: string; // Click-Through Rate
  statisticalSignificance: string; // e.g., '95%', 'Not Significant'
}

export interface ABTest {
  id: string;
  name: string;
  status: 'Running' | 'Completed' | 'Draft';
  variants: Variant[];
}

// Mock function to calculate CTR
const calculateCTR = (impressions: number, conversions: number): string => {
  if (impressions === 0) return '0.00%';
  return ((conversions / impressions) * 100).toFixed(2) + '%';
};

// Mock function to determine statistical significance (simplified for demonstration)
const calculateStatisticalSignificance = (variants: Omit<Variant, 'ctr' | 'statisticalSignificance'>[]): string => {
  // In a real scenario, this would involve proper statistical tests (e.g., chi-squared, t-test).
  // For this mock, we'll use a simple heuristic: if one variant has significantly more conversions
  // given a reasonable number of impressions, we'll call it significant.

  if (variants.length < 2) return 'N/A';

  const totalImpressions = variants.reduce((sum, v) => sum + v.impressions, 0);
  const totalConversions = variants.reduce((sum, v) => sum + v.conversions, 0);

  if (totalImpressions < 1000 || totalConversions < 50) { // Arbitrary thresholds for "enough data"
    return 'Not enough data';
  }

  // Simple check: if the best variant has a CTR > 1.5x the worst variant's CTR (and has enough impressions/conversions)
  const calculatedVariants = variants.map(v => ({
    ...v,
    ctrValue: v.impressions === 0 ? 0 : v.conversions / v.impressions,
  }));

  calculatedVariants.sort((a, b) => b.ctrValue - a.ctrValue); // Sort by CTR descending

  const bestVariant = calculatedVariants[0];
  const worstVariant = calculatedVariants[calculatedVariants.length - 1];

  if (bestVariant.ctrValue > 0 && worstVariant.ctrValue > 0 && bestVariant.ctrValue / worstVariant.ctrValue > 1.5) {
    if (bestVariant.impressions > 500 && bestVariant.conversions > 20) { // More thresholds
        return '95% Significant';
    }
  }

  return 'Not Significant';
};

const mockABTests: ABTest[] = [
  {
    id: 'abtest-1',
    name: 'Homepage Button Color',
    status: 'Running',
    variants: [
      { name: 'Control (Blue)', impressions: 12500, conversions: 350 },
      { name: 'Variant A (Green)', impressions: 12300, conversions: 410 },
      { name: 'Variant B (Red)', impressions: 12400, conversions: 340 },
    ],
  },
  {
    id: 'abtest-2',
    name: 'Pricing Page Headline',
    status: 'Completed',
    variants: [
      { name: 'Control (Original)', impressions: 20000, conversions: 1200 },
      { name: 'Variant A (New Headline)', impressions: 20100, conversions: 1450 },
    ],
  },
  {
    id: 'abtest-3',
    name: 'Email Subject Line',
    status: 'Running',
    variants: [
      { name: 'Control (Default)', impressions: 8000, conversions: 180 },
      { name: 'Variant A (Emoji)', impressions: 7900, conversions: 210 },
      { name: 'Variant B (Question)', impressions: 8100, conversions: 195 },
    ],
  },
  {
    id: 'abtest-4',
    name: 'Mobile App Onboarding Flow',
    status: 'Draft',
    variants: [
      { name: 'Control (Current)', impressions: 0, conversions: 0 },
      { name: 'Variant A (Simplified)', impressions: 0, conversions: 0 },
    ],
  },
  {
    id: 'abtest-5',
    name: 'Checkout Process Steps',
    status: 'Completed',
    variants: [
      { name: 'Control (3 Steps)', impressions: 15000, conversions: 900 },
      { name: 'Variant A (2 Steps)', impressions: 14900, conversions: 1100 },
    ],
  },
];

export default function handler(req: NextApiRequest, res: NextApiResponse<ABTest[]>) {
  if (req.method === 'GET') {
    const formattedABTests = mockABTests.map(test => {
      // Calculate CTR for each variant
      const variantsWithCTR: Omit<Variant, 'statisticalSignificance'>[] = test.variants.map(variant => ({
        ...variant,
        ctr: calculateCTR(variant.impressions, variant.conversions),
      }));

      // Calculate statistical significance for the whole test based on all variants
      const significance = calculateStatisticalSignificance(variantsWithCTR);

      // Assign significance to each variant (or to the control variant, depending on how you want to display it)
      // For simplicity, we'll add it to each variant, but it reflects the overall test's significance.
      const finalVariants: Variant[] = variantsWithCTR.map(variant => ({
        ...variant,
        statisticalSignificance: significance,
      }));

      return {
        ...test,
        variants: finalVariants,
      };
    });

    res.status(200).json(formattedABTests);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
