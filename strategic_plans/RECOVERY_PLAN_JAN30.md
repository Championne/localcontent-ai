# LocalContent.ai Recovery Plan
## January 30, 2026 - CRITICAL PRIORITY

---

## Problem Statement

Development went off-rails. Phase 2-4 features were built WITHOUT completing Phase 1 foundation. The result:
- Code is scattered across 4+ folders
- No runnable application (missing package.json in main folder)
- No authentication system
- No user-facing pages (login, signup, dashboard)
- P0 Impact Analytics not built
- P1 features not built

---

## Recovery Phases

| Phase | Focus | Duration |
|-------|-------|----------|
| **A** | Codebase Consolidation | Day 1 |
| **B** | Foundation (Phase 1) | Days 2-4 |
| **C** | Core Features (Phase 2) | Days 5-10 |
| **D** | Priority Features (P0 + P1) | Days 11-20 |

---

## Recovery Phase A: Codebase Consolidation

**Goal:** Single unified project structure

### Step A1: Create Clean Project Structure

```
/root/clawd-work/localcontent_ai/
├── app/                      # Next.js App Router pages
│   ├── (auth)/              # Auth pages (login, signup, etc.)
│   ├── (dashboard)/         # Protected dashboard pages
│   ├── (marketing)/         # Public marketing pages
│   └── api/                 # API routes
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   ├── dashboard/           # Dashboard-specific components
│   ├── auth/                # Auth-specific components
│   └── marketing/           # Marketing page components
├── lib/                     # Utilities and configs
│   ├── supabase/           # Supabase client/server
│   ├── ai/                 # AI/LLM utilities
│   ├── stripe/             # Stripe utilities
│   └── utils.ts            # General utilities
├── hooks/                   # Custom React hooks
├── types/                   # TypeScript types
├── public/                  # Static assets
├── supabase/               # Database migrations
│   └── migrations/
├── scripts/                # Utility scripts
├── docs/                   # Documentation
├── package.json            # Dependencies
├── next.config.js          # Next.js config
├── tailwind.config.ts      # Tailwind config
├── tsconfig.json           # TypeScript config
├── middleware.ts           # Auth middleware
└── .env.local              # Environment variables
```

### Step A2: Merge Existing Code

| Source Folder | Action | Destination |
|---------------|--------|-------------|
| `/localcontent_infra/package.json` | Copy | `/package.json` |
| `/localcontent_infra/lib/supabase/*` | Copy | `/lib/supabase/` |
| `/localcontent_infra/middleware.ts` | Copy | `/middleware.ts` |
| `/localcontent_infra/tailwind.config.ts` | Copy | `/tailwind.config.ts` |
| `/web/app/*` | Review and Merge | `/app/` |
| `/web/components/*` | Review and Merge | `/components/` |
| `/recovered_frontend/components/ui/*` | Copy | `/components/ui/` |
| `/lcai_backend/lib/*` | Copy | `/lib/` |
| `/localcontent_backend/lib/*` | Merge | `/lib/` |

### Step A3: Archive Redundant Folders

After consolidation:
```bash
mkdir -p /root/clawd-work/localcontent_ai/_archive
mv web _archive/
mv localcontent_infra _archive/
mv localcontent_backend _archive/
mv lcai_backend _archive/
mv recovered_frontend _archive/
```

### Step A4: Verification Checkpoint

- [ ] Single `package.json` at root
- [ ] Single `middleware.ts` at root
- [ ] `lib/supabase/` contains client.ts, server.ts
- [ ] No duplicate folders
- [ ] Run `npm install` successfully

---

## Recovery Phase B: Foundation

**Goal:** Runnable application with auth and basic pages

### Step B1: Project Setup

```bash
cd /root/clawd-work/localcontent_ai
npm install
npm run dev  # Must work!
```

Verification:
- [ ] `npm run dev` starts without errors
- [ ] http://localhost:3000 shows something

### Step B2: Create app/layout.tsx

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LocalContent.ai - AI Content for Local Businesses',
  description: 'Generate SEO-optimized content for your local business in minutes',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
```

### Step B3: Create shadcn/ui Components

Required components (copy from shadcn.com):
- [ ] components/ui/button.tsx
- [ ] components/ui/input.tsx
- [ ] components/ui/label.tsx
- [ ] components/ui/card.tsx
- [ ] components/ui/avatar.tsx
- [ ] components/ui/dropdown-menu.tsx
- [ ] components/ui/toast.tsx + toaster.tsx + use-toast.ts

### Step B4: Auth Pages

Create these files:

```
app/(auth)/
├── layout.tsx           # Centered auth layout
├── login/
│   └── page.tsx        # Login form
├── signup/
│   └── page.tsx        # Signup form
└── forgot-password/
    └── page.tsx        # Password reset
```

Verification:
- [ ] /login renders a form
- [ ] /signup renders a form
- [ ] Can create account in Supabase
- [ ] Can login with created account

### Step B5: Dashboard Layout

```
app/(dashboard)/
├── layout.tsx           # Sidebar + header layout
└── dashboard/
    └── page.tsx        # Dashboard home
```

Verification:
- [ ] /dashboard redirects to /login if not authenticated
- [ ] /dashboard shows sidebar when authenticated

### Step B6: Landing Page

```
app/(marketing)/
├── layout.tsx           # Marketing header + footer
└── page.tsx            # Landing page with hero, features, pricing
```

Verification:
- [ ] / shows landing page
- [ ] "Start Free Trial" links to /signup

### Step B7: Database Migrations

Run in Supabase SQL Editor:
1. 001_create_profiles_table.sql
2. 002_create_businesses_table.sql
3. 003_create_subscriptions_table.sql
4. 004_create_content_table.sql
5. 005_create_templates_table.sql
6. 006_create_integrations_table.sql

Verification:
- [ ] Tables exist in Supabase
- [ ] RLS policies active
- [ ] Profile auto-creates on signup

### Phase B Completion Checklist

- [ ] `npm run dev` works
- [ ] `npm run build` succeeds
- [ ] Landing page renders at /
- [ ] Login page renders at /login
- [ ] Signup page renders at /signup
- [ ] Dashboard renders at /dashboard (protected)
- [ ] Can create account
- [ ] Can login
- [ ] Dashboard redirects unauthenticated users
- [ ] All database tables exist

---

## Recovery Phase C: Core Features

**Goal:** Functional content generation and management

### Step C1: User Onboarding Flow

```
app/(dashboard)/onboarding/
├── page.tsx              # Multi-step wizard
├── step1/page.tsx        # Business info
├── step2/page.tsx        # Industry selection
├── step3/page.tsx        # First content demo
└── complete/page.tsx     # Success + redirect
```

### Step C2: Content Generation (CORE FEATURE)

```
app/(dashboard)/dashboard/content/
├── page.tsx              # Content library (list)
├── create/page.tsx       # Create new content
└── [id]/page.tsx         # View/edit content

app/api/content/
├── route.ts              # List/create content
├── [id]/route.ts         # Get/update/delete content
└── generate/route.ts     # AI generation endpoint
```

AI Generation Flow:
1. User selects template
2. User fills variables
3. Call OpenAI API
4. Stream response to preview
5. User edits and saves
6. Content stored in database

### Step C3: Template Management

```
app/(dashboard)/dashboard/templates/
├── page.tsx              # Browse templates
└── [id]/page.tsx         # Template detail

app/api/templates/
├── route.ts              # List templates
└── [id]/route.ts         # Get template
```

### Step C4: Settings Pages

```
app/(dashboard)/dashboard/settings/
├── page.tsx              # General settings
├── profile/page.tsx      # Profile settings
├── business/page.tsx     # Business settings
├── billing/page.tsx      # Subscription/billing
└── integrations/page.tsx # Connected accounts
```

### Step C5: Stripe Integration

```
app/api/stripe/
├── checkout/route.ts     # Create checkout session
├── portal/route.ts       # Customer portal
└── webhook/route.ts      # Handle Stripe events
```

### Phase C Completion Checklist

- [ ] Onboarding flow works end-to-end
- [ ] Can generate content with AI
- [ ] Content saves to database
- [ ] Content library shows user's content
- [ ] Can edit/delete content
- [ ] Templates display correctly
- [ ] Settings pages functional
- [ ] Stripe checkout works
- [ ] Subscription status tracked

---

## Recovery Phase D: Priority Features (P0 + P1)

**Goal:** Features that reduce churn and increase value

### Step D1: Impact Analytics Dashboard (P0 - CRITICAL)

This is the #1 priority after core features. Reduces churn by 30%.

```
app/(dashboard)/dashboard/analytics/
├── page.tsx              # Main analytics dashboard
├── components/
│   ├── BaselineCapture.tsx
│   ├── BeforeAfterChart.tsx
│   ├── GrowthTrend.tsx
│   ├── MetricCard.tsx
│   └── ShareableReport.tsx

app/api/analytics/
├── baseline/route.ts     # Capture baseline
├── metrics/route.ts      # Get current metrics
├── history/route.ts      # Historical data
└── report/route.ts       # Generate report
```

Key Features:
- Baseline capture at signup (GMB views, search impressions, reviews)
- Before/after comparison visualization
- Growth trend charts (30/60/90 days)
- Shareable monthly reports
- "What if you stop" calculator

### Step D2: Google Business Profile Integration (P1)

```
app/api/integrations/gmb/
├── connect/route.ts      # OAuth flow
├── posts/route.ts        # Create/list posts
├── reviews/route.ts      # Get reviews
└── analytics/route.ts    # GMB insights

lib/google-business.ts    # GMB API wrapper
```

### Step D3: Auto Review Responder (P1)

```
app/(dashboard)/dashboard/reviews/
├── page.tsx              # Review inbox
├── [id]/page.tsx         # Single review + response
└── settings/page.tsx     # Response settings

app/api/reviews/
├── route.ts              # List reviews
├── [id]/respond/route.ts # Post response
└── generate/route.ts     # AI-generate response
```

### Step D4: Photo-to-Post (P1)

```
app/(dashboard)/dashboard/photo-to-post/
├── page.tsx              # Upload interface
└── components/
    ├── PhotoUploader.tsx
    ├── CaptionPreview.tsx
    └── PlatformSelector.tsx

app/api/photo/
├── upload/route.ts       # Handle upload
├── analyze/route.ts      # Vision AI analysis
└── generate/route.ts     # Generate caption
```

### Phase D Completion Checklist

- [ ] Analytics dashboard shows real metrics
- [ ] Baseline captured for new users
- [ ] Before/after comparison works
- [ ] Can connect GMB account
- [ ] Reviews pull from GMB
- [ ] AI generates review responses
- [ ] Photo upload works
- [ ] AI generates captions from photos

---

## Priority Order Summary

| Priority | Task | Est. Days |
|----------|------|-----------|
| 1 | Phase A: Consolidation | 1 day |
| 2 | Phase B: Foundation | 3 days |
| 3 | Phase C: Core Features | 5 days |
| 4 | Phase D1: Impact Analytics | 5 days |
| 5 | Phase D2-D4: P1 Features | 5 days |

**Total: ~19 working days to functional MVP**

---

## What To Do With Existing Code

### KEEP (High Value)
- Strategic documents (sales_strategy.md, gap_analysis.md, etc.)
- Implementation plans (detailed specs)
- Database schema designs
- API route logic (copy to new structure)
- UI components (integrate into new structure)

### ARCHIVE (May Reuse Later)
- A/B testing dashboard components
- ROI tracker components
- Review insights components
- Competitor strategy components

### DISCARD
- Duplicate configurations
- Empty placeholder files
- Collaboration feature (not in strategy)
- Network effects API (not in strategy)

---

## Critical Rules

1. **NO new features until Phase B complete**
2. **Test after every step** - don't accumulate broken code
3. **Commit frequently** - small, working commits
4. **Follow the priority order** - resist temptation to skip ahead
5. **Use existing code** - integrate, don't rebuild from scratch
6. **Stay in correct directory** - always verify working directory before commits

---

## Success Criteria

### Week 1 Success (Phases A + B)
- Unified codebase
- Runnable application
- Auth working
- Basic pages render

### Week 2 Success (Phase C)
- Can generate content
- Content library works
- Stripe payments work

### Week 3 Success (Phase D)
- Analytics dashboard functional
- GMB connected
- Review responder works
- Photo-to-post works

### Week 4
- Bug fixes
- Polish
- Deploy to Vercel

---

*Document Created: January 30, 2026*
*Status: ACTIVE RECOVERY PLAN*
