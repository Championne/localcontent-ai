# Impact Analytics Dashboard - Implementation Plan
## LocalContent.ai

---

## Overview

The Impact Analytics Dashboard is a **P0 priority** feature that addresses the #1 churn reason: "I don't know if it's working." This dashboard transforms LocalContent.ai from a content tool into "the scoreboard for my business growth."

---

## 1. Core Concept

### The Problem
- Clients pay $69-199/month but can't see ROI
- They question "is this actually working?"
- Partners/accountants ask for proof of value
- Without visible results, churn risk increases

### The Solution
A dashboard that:
- Captures baseline metrics at signup
- Shows clear before/after comparisons
- Visualizes growth trends over time
- Provides shareable reports for bragging
- Benchmarks against competitors

---

## 2. Baseline Snapshot System

### At Onboarding: Capture Starting Point

When a client signs up, automatically capture and store:

| Metric | Source | API |
|--------|--------|-----|
| Google Business Profile views | GMB | Google Business Profile API |
| Google search impressions | Search Console | Search Console API |
| Average Google ranking (key terms) | Search Console | Search Console API |
| Total Google reviews | GMB | Google Business Profile API |
| Average review rating | GMB | Google Business Profile API |
| Social media followers | Platforms | Facebook/Instagram Graph API |
| Social media engagement rate | Platforms | Facebook/Instagram Graph API |
| Website traffic | GA4 | Google Analytics Data API |
| Website traffic from local searches | GA4 | Google Analytics Data API |

### Database Schema

```sql
CREATE TABLE baseline_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  metric_type VARCHAR(100) NOT NULL,
  metric_value NUMERIC,
  metric_source VARCHAR(50),
  captured_at TIMESTAMP DEFAULT NOW(),
  is_baseline BOOLEAN DEFAULT true,
  UNIQUE(user_id, metric_type, is_baseline)
);

CREATE TABLE metric_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  metric_type VARCHAR(100) NOT NULL,
  metric_value NUMERIC,
  metric_source VARCHAR(50),
  recorded_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_user_metric_date (user_id, metric_type, recorded_date)
);

CREATE TABLE user_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  platform VARCHAR(50) NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP,
  account_id VARCHAR(255),
  connected_at TIMESTAMP DEFAULT NOW(),
  last_sync_at TIMESTAMP,
  UNIQUE(user_id, platform)
);
```

---

## 3. Dashboard UI Components

### 3.1 Hero Section - Big Numbers

Display three primary metrics with dramatic visual impact:

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  VISIBILITY  │  │  ENGAGEMENT  │  │  REPUTATION  │
│    +847%     │  │    +234%     │  │    +0.4 ⭐   │
│  GMB Views   │  │  Social Eng  │  │  4.2 → 4.6   │
│ 1.2K → 11.4K │  │  89 → 297    │  │  +12 reviews │
└──────────────┘  └──────────────┘  └──────────────┘
```

Component: `HeroMetrics.tsx`
- Large percentage change (green for positive)
- Metric name
- Before → After values

### 3.2 Before & After Comparison Table

```
┌─────────────────┬─────────────────┬─────────────────┐
│     BEFORE      │      NOW        │     CHANGE      │
├─────────────────┼─────────────────┼─────────────────┤
│ GMB Views: 1,247│ GMB Views:11,423│    ▲ +816%      │
│ Search Imp: 892 │ Search Imp:4,521│    ▲ +407%      │
│ Reviews: 23     │ Reviews: 35     │    ▲ +52%       │
│ Avg Rating: 4.2 │ Avg Rating: 4.6 │    ▲ +0.4       │
│ Website: 340/mo │ Website: 1,247  │    ▲ +267%      │
│ Social Foll: 412│ Social Foll: 891│    ▲ +116%      │
└─────────────────┴─────────────────┴─────────────────┘
```

Component: `BeforeAfterTable.tsx`

### 3.3 Trend Chart

Line chart showing growth over time:

```
Monthly Visibility Trend
─────────────────────────────────────────
     │                              ╭──●
12K  │                         ╭────╯
     │                    ╭────╯
 8K  │               ╭────╯
     │          ╭────╯
 4K  │     ╭────╯
     │╭────╯
 1K  │●
     └─────────────────────────────────────
      Jan   Feb   Mar   Apr   May   Jun
      ↑
   Started with LocalContent.ai
```

Component: `GrowthTrendChart.tsx`
- Use Recharts library
- Highlight the start date
- Show multiple metrics as toggleable lines

### 3.4 Date Range Selector

```
[Before LocalContent.ai] vs [After LocalContent.ai]
[Last 30 Days] vs [Previous 30 Days]  
[This Month] vs [Same Month Last Year]
[Last 90 Days] vs [First 90 Days]
[Custom Range]
```

Component: `DateRangeSelector.tsx`

### 3.5 Competitive Benchmark Section

```
┌─────────────────────────────────────────────────────────────┐
│   📊 HOW YOU COMPARE TO LOCAL COMPETITORS                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Posting Frequency    ████████████████░░░░  You: 24/mo     │
│   (Local Avg: 8/mo)                          ▲ 3x more      │
│                                                             │
│   Review Count         ████████████░░░░░░░░  You: 35        │
│   (Local Avg: 42)                            ▲ 12 to go     │
│                                                             │
│   Response Rate        ████████████████████  You: 100%      │
│   (Local Avg: 34%)                           🏆 Top 5%      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

Component: `CompetitiveBenchmark.tsx`

### 3.6 "What If You Stop" Calculator

Churn prevention feature:

```
┌─────────────────────────────────────────────────────────────┐
│   ⚠️ IF YOU PAUSED LOCALCONTENT.AI...                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Based on your current trajectory, stopping would mean:    │
│                                                             │
│   📉 -73% visibility within 60 days (back to baseline)      │
│   📉 -$4,200 estimated lost revenue (based on your CAC)     │
│   📉 Competitors would reclaim search positions             │
│   📉 Review response rate would drop to 0%                  │
│                                                             │
│   You've built 6 months of momentum. Keep going! 💪        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

Component: `ChurnCalculator.tsx`
- Only show to users considering cancellation OR after 3+ months

---

## 4. Shareable Report Generator

### Monthly Growth Report (PDF/Image)

```
┌─────────────────────────────────────────────────────────────┐
│           🏆 YOUR MONTHLY GROWTH REPORT                     │
│               Johnson's Plumbing                            │
│               January 2026                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   "Since using LocalContent.ai, Johnson's Plumbing has      │
│    seen remarkable growth in online visibility."            │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐  │
│   │   📍 +847% more people found you on Google          │  │
│   │   📞 +156% more phone calls from online             │  │
│   │   ⭐ Rating improved from 4.2 to 4.6 stars          │  │
│   │   📝 Generated 47 pieces of content this month      │  │
│   └─────────────────────────────────────────────────────┘  │
│                                                             │
│   "You're outperforming 78% of plumbers in Austin, TX"     │
│                                                             │
│   [Share on Facebook] [Share on LinkedIn] [Download PDF]    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

Features:
- Auto-generated monthly
- Email notification with report attached
- Social sharing with auto-generated image
- PDF download option

---

## 5. API Routes

### `/api/analytics/baseline`

**POST** - Capture baseline snapshot
```typescript
// Request
{
  userId: string,
  metrics: {
    gmb_views: number,
    search_impressions: number,
    reviews_count: number,
    avg_rating: number,
    // ... other metrics
  }
}

// Response
{
  success: boolean,
  baselineId: string,
  capturedAt: string
}
```

**GET** - Retrieve baseline
```typescript
// Response
{
  userId: string,
  capturedAt: string,
  metrics: { ... }
}
```

### `/api/analytics/current`

**GET** - Get current metrics
```typescript
// Response
{
  userId: string,
  asOf: string,
  metrics: { ... }
}
```

### `/api/analytics/comparison`

**GET** - Get before/after comparison
```typescript
// Query params: ?period=30d | 90d | all | custom&start=&end=

// Response
{
  baseline: { ... },
  current: { ... },
  changes: {
    gmb_views: { before: 1247, after: 11423, change: 816, changePercent: 816 },
    // ... other metrics
  },
  period: { start: string, end: string }
}
```

### `/api/analytics/history`

**GET** - Get historical trend data
```typescript
// Query params: ?metric=gmb_views&period=6m

// Response
{
  metric: string,
  dataPoints: [
    { date: "2026-01-01", value: 1247 },
    { date: "2026-02-01", value: 3521 },
    // ...
  ]
}
```

### `/api/analytics/benchmark`

**GET** - Get competitive benchmarks
```typescript
// Response
{
  industry: string,
  location: string,
  benchmarks: {
    posting_frequency: { user: 24, avg: 8, percentile: 95 },
    review_count: { user: 35, avg: 42, percentile: 45 },
    response_rate: { user: 100, avg: 34, percentile: 99 },
  }
}
```

### `/api/analytics/report`

**POST** - Generate shareable report
```typescript
// Request
{
  userId: string,
  period: "monthly" | "quarterly" | "custom",
  format: "pdf" | "image" | "both"
}

// Response
{
  reportUrl: string,
  imageUrl: string,
  pdfUrl: string
}
```

---

## 6. Integration Requirements

### Google Business Profile API
- Scope: `https://www.googleapis.com/auth/business.manage`
- Endpoints needed:
  - `accounts/{accountId}/locations/{locationId}/insights` - Views, searches, actions
  - `accounts/{accountId}/locations/{locationId}/reviews` - Review data

### Google Search Console API
- Scope: `https://www.googleapis.com/auth/webmasters.readonly`
- Endpoints needed:
  - `searchAnalytics/query` - Impressions, clicks, position

### Google Analytics Data API (GA4)
- Scope: `https://www.googleapis.com/auth/analytics.readonly`
- Endpoints needed:
  - `runReport` - Sessions, users, events

### Social Media APIs
- Facebook Graph API - Page insights
- Instagram Graph API - Business account insights

---

## 7. File Structure

```
localcontent_ai/web/app/analytics/
├── page.tsx                    # Main dashboard
├── layout.tsx                  # Analytics layout
├── baseline/
│   └── page.tsx               # Baseline capture flow
├── visibility/
│   └── page.tsx               # Detailed visibility metrics
├── engagement/
│   └── page.tsx               # Detailed engagement metrics
├── reputation/
│   └── page.tsx               # Detailed reputation metrics
├── conversions/
│   └── page.tsx               # Detailed conversion metrics
├── report/
│   └── page.tsx               # Report generator
└── components/
    ├── HeroMetrics.tsx
    ├── BeforeAfterTable.tsx
    ├── GrowthTrendChart.tsx
    ├── DateRangeSelector.tsx
    ├── CompetitiveBenchmark.tsx
    ├── ChurnCalculator.tsx
    ├── MetricCard.tsx
    └── ShareableReport.tsx

localcontent_ai/web/pages/api/analytics/
├── baseline.ts
├── current.ts
├── comparison.ts
├── history.ts
├── benchmark.ts
└── report.ts
```

---

## 8. Phased Implementation

### Phase 1: Core Dashboard (Week 1-2)
- [ ] Database schema for baseline_snapshots and metric_history
- [ ] Baseline capture flow during onboarding
- [ ] Basic dashboard with HeroMetrics component
- [ ] BeforeAfterTable component
- [ ] Manual metric entry (before API integrations)

### Phase 2: Data Integrations (Week 3-4)
- [ ] Google Business Profile API integration
- [ ] Google Search Console API integration
- [ ] Google Analytics (GA4) integration
- [ ] Automated daily metric sync

### Phase 3: Visualizations (Week 5)
- [ ] GrowthTrendChart with Recharts
- [ ] DateRangeSelector functionality
- [ ] Detailed metric drill-down pages

### Phase 4: Advanced Features (Week 6-7)
- [ ] CompetitiveBenchmark component
- [ ] ChurnCalculator component
- [ ] Shareable report generator
- [ ] Social sharing integration

### Phase 5: Polish & Optimization (Week 8)
- [ ] Email notifications for monthly reports
- [ ] Performance optimization
- [ ] Mobile responsiveness
- [ ] Error handling and edge cases

---

## 9. Success Metrics

| Metric | Target |
|--------|--------|
| Dashboard engagement | 60% of users check weekly |
| Report generation | 30% generate at least 1 report |
| Social shares | 10% share at least 1 report |
| Churn reduction | -30% among dashboard users |
| NPS improvement | +15 points for active users |

---

## 10. Technical Notes

### Libraries Required
- `recharts` - Charting library
- `date-fns` - Date manipulation
- `html-to-image` / `html2canvas` - Report image generation
- `jspdf` - PDF generation
- `googleapis` - Google API client

### Performance Considerations
- Cache aggregated metrics (update daily, not real-time)
- Lazy load detailed metrics pages
- Use skeleton loaders during data fetch
- Implement incremental loading for trend charts

### Security
- Store API tokens encrypted
- Refresh tokens automatically
- Rate limit API calls per user
- Audit log for data access

---

*Document Created: January 28, 2026*
*Priority: P0 - Critical for retention*
*Est. Development Time: 8 weeks*
