# Customer Research Skill

## Purpose
Automated customer research for LocalContent.ai to understand local business content needs.

---

## Daily Research Tasks

### Reddit Monitoring
Search these subreddits for content-related posts:

```
Subreddits: r/smallbusiness, r/Entrepreneur, r/marketing, r/SEO, r/restaurateur, r/contractors

Search queries:
- "content" + "local business"
- "social media" + "small business" + "time"
- "SEO" + "local" + "content"
- "marketing" + "overwhelmed"
- "AI writing" OR "content tool"
- "how to post" + business
```

### What to Capture
For each relevant post/comment, extract:
1. **Pain point** - What problem are they describing?
2. **Current solution** - What are they doing now?
3. **Desired outcome** - What do they want?
4. **Exact quote** - Their words (for marketing copy)
5. **Industry** - What type of business?
6. **Engagement** - Upvotes/comments (validates importance)

### Output Format
Save findings to: `/localcontent_ai/research/findings/YYYY-MM-DD-reddit.md`

```markdown
## Reddit Research - [DATE]

### High-Value Finds

#### Finding 1
- **Source:** r/smallbusiness - [link]
- **Industry:** Restaurant
- **Pain:** "I spend 3 hours every week trying to come up with Instagram posts"
- **Current Solution:** Does it manually, hates it
- **Desired Outcome:** Automated content that sounds authentic
- **Engagement:** 45 upvotes, 23 comments
- **Insight:** Time is the primary pain, authenticity is the fear

[More findings...]

### Patterns Observed
- [Pattern 1]
- [Pattern 2]

### Quotes for Marketing
- "I don't have time to be a content creator AND run my business"
- [More quotes...]
```

---

## Weekly Competitor Review Analysis

### Process
1. Go to G2.com, search for: Jasper, Copy.ai, BrightLocal, Yext
2. Filter reviews: 1-3 stars (find pain points)
3. Also check 5-star reviews (find what works)
4. Extract patterns

### Output Format
Save to: `/localcontent_ai/research/competitor-reviews/YYYY-MM-DD-analysis.md`

```markdown
## Competitor Review Analysis - [DATE]

### Jasper.ai (50 reviews analyzed)

#### Top Complaints (Opportunities for Us)
1. **Generic output** (mentioned 15x)
   - "Content doesn't sound like my brand"
   - "Too corporate for a local business"
   → Opportunity: Local business voice/tone templates

2. **Pricing** (mentioned 12x)
   - "Too expensive for my small business"
   → Opportunity: Affordable tier for SMBs

#### What They Love (Table Stakes)
- Easy to use interface
- Fast output
- Good templates

### [Next Competitor...]
```

---

## Search Trend Monitoring

### Keywords to Track Monthly
Use Google Trends, Ahrefs, or free alternatives:

```
"ai content for small business"
"local seo content"
"social media automation small business"
"how to write business posts"
"content marketing local business"
```

### Output
Save to: `/localcontent_ai/research/search-trends/YYYY-MM.md`

---

## Synthesis Reports

### Weekly Summary
Every Friday, compile:

1. **Top 3 Pain Points This Week**
2. **New Competitor Insights**
3. **Best Quotes for Marketing**
4. **ICP Validation Updates**
5. **Recommended Actions**

Save to: `/localcontent_ai/research/weekly-summaries/YYYY-WW.md`

---

## Tools to Use

| Task | Tool | Notes |
|------|------|-------|
| Reddit Search | Old Reddit search or Redditsearch.io | More reliable |
| G2 Reviews | g2.com | Filter by star rating |
| Keyword Trends | Google Trends | Free, good for direction |
| Social Listening | Manual or Brand24 trial | If budget allows |

---

## Escalate to Human When

- Major competitor launches new feature
- Significant negative sentiment about AI content tools
- New subreddit/community discovered with high activity
- Pricing insights that affect strategy
