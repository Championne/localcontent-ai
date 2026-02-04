/**
 * Example Content Generator Script
 * 
 * This script uses GeoSpark's AI content engine to generate real,
 * authentic examples for the landing page and examples page.
 * 
 * Run with: npx ts-node scripts/generate-examples.ts
 * Or via API: GET /api/examples/generate (with admin auth)
 */

// Types matching the content engine
export interface SocialPackResult {
  twitter: { content: string; charCount: number }
  facebook: { content: string; charCount: number }
  instagram: { content: string; hashtags: string; charCount: number }
  linkedin: { content: string; charCount: number }
  tiktok: { content: string; charCount: number }
  nextdoor: { content: string; charCount: number }
}

export interface GeneratedExample {
  id: string
  type: 'social-pack' | 'blog-post' | 'gmb-post' | 'email'
  businessName: string
  industry: string
  topic: string
  content: string | SocialPackResult
  imageUrl?: string
  generatedAt: string
}

export interface ExamplesData {
  frontPageSocialPack: GeneratedExample
  examples: {
    blogPost: GeneratedExample
    socialPack: GeneratedExample
    googleBusinessPost: GeneratedExample
    emailNewsletter: GeneratedExample
  }
  generatedAt: string
}

// Sample businesses for authentic examples
export const SAMPLE_BUSINESSES = [
  {
    businessName: "Martinez Plumbing & Heating",
    industry: "Plumbing",
    topic: "5 Signs Your Water Heater Needs Replacement",
    type: "blog-post" as const
  },
  {
    businessName: "Bella's Italian Kitchen",
    industry: "Restaurant",
    topic: "Fresh Homemade Pasta Every Thursday",
    type: "social-pack" as const
  },
  {
    businessName: "Green Thumb Landscaping",
    industry: "Landscaping",
    topic: "Spring Garden Preparation Tips",
    type: "gmb-post" as const
  },
  {
    businessName: "Sunrise Dental Care",
    industry: "Dentistry",
    topic: "Complete Guide to Teeth Whitening Options",
    type: "email" as const
  },
  {
    businessName: "FitLife Personal Training",
    industry: "Fitness",
    topic: "New Year Transformation Challenge",
    type: "social-pack" as const  // For front page
  }
]

// This will be used by the API route
export function getExamplePrompts() {
  return SAMPLE_BUSINESSES
}
