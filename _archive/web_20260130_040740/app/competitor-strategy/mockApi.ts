export interface Recommendation {
  id: string;
  competitorName: string;
  recommendedAction: 'Target Keyword' | 'Create Blog Post' | 'Improve Existing Content' | 'Expand Topic';
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  keywords: string[];
  targetUrl?: string; // Optional URL for "Improve Existing Content" or "Expand Topic"
}

export interface CompetitorStrategyResponse {
  recommendations: Recommendation[];
}

export const mockCompetitorStrategyData: CompetitorStrategyResponse = {
  recommendations: [
    {
      id: "rec-001",
      competitorName: "CompetitorX",
      recommendedAction: "Target Keyword",
      description: "CompetitorX ranks highly for 'AI content generation tools'. Focus on long-tail variations like 'best free AI content tools'.",
      priority: "High",
      keywords: ["AI content generation tools", "free AI writing tools", "AI content marketing"],
    },
    {
      id: "rec-002",
      competitorName: "CompetitorY",
      recommendedAction: "Create Blog Post",
      description: "CompetitorY has a popular blog post on 'SEO best practices for 2024'. Create an updated, comprehensive guide.",
      priority: "Medium",
      keywords: ["SEO best practices 2024", "on-page SEO", "technical SEO guide"],
      targetUrl: "https://competitory.com/blog/seo-best-practices-2024"
    },
    {
      id: "rec-003",
      competitorName: "CompetitorX",
      recommendedAction: "Improve Existing Content",
      description: "Our existing article on 'content repurposing strategies' is outdated. Update with new examples and statistics.",
      priority: "High",
      keywords: ["content repurposing", "content marketing strategies", "evergreen content"],
      targetUrl: "/blog/content-repurposing-strategies"
    },
    {
      id: "rec-004",
      competitorName: "CompetitorZ",
      recommendedAction: "Expand Topic",
      description: "CompetitorZ has in-depth guides on 'local SEO optimization'. Consider expanding our local SEO resources.",
      priority: "Medium",
      keywords: ["local SEO", "Google My Business", "local search ranking"],
    },
    {
      id: "rec-005",
      competitorName: "CompetitorY",
      recommendedAction: "Target Keyword",
      description: "CompetitorY is gaining traction for 'video marketing trends'. Incorporate relevant sections into future content.",
      priority: "Low",
      keywords: ["video marketing trends", "short-form video", "YouTube SEO"],
    },
  ],
};

export const fetchCompetitorStrategyData = async (): Promise<CompetitorStrategyResponse> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() > 0.1) { // 90% chance of success
        resolve(mockCompetitorStrategyData);
      } else { // 10% chance of failure
        reject(new Error("Failed to fetch competitor strategy data."));
      }
    }, 800); // Simulate network latency
  });
};
