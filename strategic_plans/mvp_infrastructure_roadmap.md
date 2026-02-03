# LocalContent.ai - MVP Infrastructure Roadmap
## CRITICAL PRIORITY - January 2026

---

## Executive Summary

**Current Status:** ~40% complete but NOT RUNNABLE
**Problem:** No package.json, no auth, no database - just components without infrastructure
**Solution:** Stop feature development, build foundation first

---

## Phase 1: Project Foundation (Week 1) - CRITICAL

### Agent 1: Next.js Project Setup

Location: `/root/clawd-work/localcontent_ai/web/`

**Create package.json:**
```json
{
  "name": "localcontent-ai",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@supabase/supabase-js": "^2.39.0",
    "@supabase/ssr": "^0.1.0",
    "ai": "^3.0.0",
    "@ai-sdk/openai": "^0.0.14",
    "recharts": "^2.12.0",
    "date-fns": "^3.3.0",
    "lucide-react": "^0.330.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "zod": "^3.22.0",
    "stripe": "^14.14.0",
    "@stripe/stripe-js": "^2.4.0",
    "react-hook-form": "^7.50.0",
    "@hookform/resolvers": "^3.3.4"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.33",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.3",
    "eslint": "^8.56.0",
    "eslint-config-next": "^14.1.0"
  }
}
```

**Tasks:**
- Create package.json with dependencies above
- Create next.config.js with proper configuration
- Create tsconfig.json for TypeScript
- Create tailwind.config.ts with theme
- Create postcss.config.js
- Create app/layout.tsx with HTML structure, fonts, metadata
- Create app/page.tsx (landing page placeholder)
- Create lib/utils.ts with cn() helper function
- Run: `npm install`
- Verify: `npm run dev` starts without errors

---

### Agent 2: Tailwind + shadcn/ui Setup

Location: `/root/clawd-work/localcontent_ai/web/`

**Create app/globals.css:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... dark mode variables */
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

**Create shadcn/ui components manually:**
- components/ui/button.tsx
- components/ui/input.tsx
- components/ui/label.tsx
- components/ui/card.tsx
- components/ui/select.tsx
- components/ui/dialog.tsx
- components/ui/dropdown-menu.tsx
- components/ui/avatar.tsx
- components/ui/skeleton.tsx
- components/ui/toast.tsx
- components/ui/toaster.tsx
- hooks/use-toast.ts
- components/ui/form.tsx

Reference: https://ui.shadcn.com/docs/components (copy code directly)

---

### Agent 3: Supabase Configuration

Location: `/root/clawd-work/localcontent_ai/web/`

**Create lib/supabase/client.ts:**
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Create lib/supabase/server.ts:**
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}
```

**Create .env.local.example:**
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
OPENAI_API_KEY=your_openai_key
STRIPE_SECRET_KEY=your_stripe_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_publishable_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Create middleware.ts (root level):**
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect logged-in users away from auth pages
  if ((request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup') && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup'],
}
```

**Create Supabase migrations in /supabase/migrations/:**

001_create_profiles_table.sql:
```sql
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  onboarding_completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

002_create_businesses_table.sql:
```sql
create table public.businesses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  industry text,
  location text,
  address text,
  phone text,
  website text,
  description text,
  logo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.businesses enable row level security;

create policy "Users can manage own businesses" on public.businesses
  for all using (auth.uid() = user_id);
```

003_create_subscriptions_table.sql:
```sql
create table public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text default 'free',
  status text default 'active',
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.subscriptions enable row level security;

create policy "Users can view own subscription" on public.subscriptions
  for select using (auth.uid() = user_id);
```

004_create_content_table.sql:
```sql
create table public.content (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  business_id uuid references public.businesses(id) on delete cascade,
  title text not null,
  body text not null,
  content_type text default 'post',
  template_id uuid,
  status text default 'draft',
  platform text,
  published_at timestamp with time zone,
  metadata jsonb default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.content enable row level security;

create policy "Users can manage own content" on public.content
  for all using (auth.uid() = user_id);

create index idx_content_user_id on public.content(user_id);
create index idx_content_status on public.content(status);
```

005_create_templates_table.sql:
```sql
create table public.templates (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  industry text,
  content_type text default 'post',
  template_body text not null,
  variables jsonb default '[]',
  is_public boolean default true,
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.templates enable row level security;

create policy "Anyone can view public templates" on public.templates
  for select using (is_public = true or auth.uid() = created_by);
```

006_create_integrations_table.sql:
```sql
create table public.integrations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  platform text not null,
  account_id text,
  account_name text,
  access_token text,
  refresh_token text,
  token_expires_at timestamp with time zone,
  metadata jsonb default '{}',
  connected_at timestamp with time zone default timezone('utc'::text, now()),
  last_sync_at timestamp with time zone,
  unique(user_id, platform)
);

alter table public.integrations enable row level security;

create policy "Users can manage own integrations" on public.integrations
  for all using (auth.uid() = user_id);
```

---

### Agent 4: Authentication System

Location: `/root/clawd-work/localcontent_ai/web/`

**Create app/(auth)/layout.tsx:**
```typescript
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        {children}
      </div>
    </div>
  )
}
```

**Create app/(auth)/login/page.tsx:**
- Login form with email/password
- Google OAuth button
- Link to signup
- Link to forgot password
- Use Supabase signInWithPassword and signInWithOAuth

**Create app/(auth)/signup/page.tsx:**
- Signup form with name, email, password
- Google OAuth button
- Link to login
- Use Supabase signUp

**Create app/(auth)/forgot-password/page.tsx:**
- Email input form
- Use Supabase resetPasswordForEmail

**Create app/auth/callback/route.ts:**
- Handle OAuth callback
- Exchange code for session
- Redirect to dashboard or onboarding

**Create components/auth/login-form.tsx**
**Create components/auth/signup-form.tsx**
**Create components/auth/social-auth-buttons.tsx**

---

### Agent 5: Dashboard Layout & Navigation

Location: `/root/clawd-work/localcontent_ai/web/`

**Create app/(dashboard)/layout.tsx:**
```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

**Create components/dashboard/sidebar.tsx:**
Navigation items:
- Dashboard (home icon) - /dashboard
- Create Content (plus icon) - /dashboard/content/create
- Content Library (folder icon) - /dashboard/content
- Templates (layout icon) - /dashboard/templates
- Analytics (chart icon) - /dashboard/analytics
- Settings (gear icon) - /dashboard/settings

**Create components/dashboard/header.tsx:**
- Logo
- Search (optional)
- User dropdown (profile, settings, logout)

**Create app/(dashboard)/dashboard/page.tsx:**
- Welcome message with user name
- Quick stats cards (content created, views this month)
- Quick actions (Create Content, Connect GMB)
- Recent content list

---

### Agent 6: Landing Page

Location: `/root/clawd-work/localcontent_ai/web/`

**Create app/(marketing)/layout.tsx:**
- Marketing header with nav
- Footer
- No auth required

**Create app/(marketing)/page.tsx (or move from app/page.tsx):**

Sections:
1. Hero
   - Headline: "AI-Powered Content for Local Businesses"
   - Subheadline: "Generate SEO-optimized content in minutes, not hours"
   - CTA: "Start Free Trial" button
   - Hero image/illustration

2. Problem/Solution
   - Pain points: No time, don't know what to post, can't afford agency
   - Solution: LocalContent.ai handles it all

3. Features (3-4 key features)
   - AI Content Generation
   - Local SEO Optimization
   - Google Business Profile Integration
   - Analytics & ROI Tracking

4. How It Works
   - Step 1: Connect your business
   - Step 2: Choose templates
   - Step 3: Generate & publish

5. Pricing
   - Starter: $69/mo
   - Growth: $129/mo (most popular)
   - Pro: $199/mo

6. FAQ
   - Common questions

7. Final CTA
   - "Ready to grow your local business?"
   - Start Free Trial button

**Create components/marketing/header.tsx**
**Create components/marketing/footer.tsx**
**Create app/(marketing)/pricing/page.tsx**

---

## Phase 2: Core Features (Week 2)

### Agent 1: User Onboarding Flow
- Multi-step onboarding wizard
- Business info collection
- GMB connection (OAuth)
- Template selection
- First content generation demo

### Agent 2: Content Generation (Core Feature)
- Content creation page with template selection
- Variable input form
- AI generation with OpenAI
- Preview and edit
- Save to database

### Agent 3: Content Library
- List all user's content
- Filter and search
- View, edit, delete actions
- Status management (draft, published)

### Agent 4: Template Management
- Browse templates by industry
- Template preview
- Use template to create content

### Agent 5: Settings & Account
- Profile settings
- Business settings
- Integration management
- Billing/subscription page

### Agent 6: Stripe Integration
- Checkout session creation
- Webhook handling
- Subscription management
- Customer portal

---

## Phase 3: Integration & Polish (Week 3-4)

### Agent 1: Google Business Profile OAuth
### Agent 2: GMB Content Publishing
### Agent 3: Basic Analytics Dashboard
### Agent 4: Error Handling & Loading States
### Agent 5: Mobile Responsiveness
### Agent 6: Deployment Preparation

---

## Deliverable Checklist

### After Phase 1:
- [ ] `npm run dev` works without errors
- [ ] Landing page renders at localhost:3000
- [ ] Login page renders at /login
- [ ] Signup page renders at /signup
- [ ] Dashboard renders at /dashboard (protected)
- [ ] Supabase connection works
- [ ] Tailwind styling works

### After Phase 2:
- [ ] Can create account and login
- [ ] Onboarding flow completes
- [ ] Can generate content with AI
- [ ] Content saves to database
- [ ] Templates load and work
- [ ] Settings pages functional
- [ ] Stripe checkout works

### After Phase 3:
- [ ] GMB OAuth flow works
- [ ] Can publish to GMB
- [ ] Analytics dashboard shows data
- [ ] Mobile responsive
- [ ] `npm run build` succeeds
- [ ] Ready for Vercel deployment

---

## Important Notes

1. **STOP adding new features until Phase 1 complete**
2. Each agent must TEST their work before marking done
3. Commit after each major component
4. Document any blockers immediately
5. Use existing code where possible - integrate, don't rebuild
6. Follow Next.js 14 App Router conventions
7. All pages server components by default, add 'use client' only when needed

---

*Document Created: January 29, 2026*
*Priority: CRITICAL - Blocking MVP deployment*
*Est. Timeline: 3-4 weeks to MVP*
