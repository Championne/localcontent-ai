# Cursor New Agent Start — GeoSpark & VPS Restart Guide

**Purpose:** Use this doc when starting a new Cursor chat so any agent (or you) can quickly understand the GeoSpark project and the Openclaw/Clawdbot VPS. No need to re-explain from scratch.

**Last updated:** February 2026

---

## 1. Project: GeoSpark (LocalContent.ai)

### What it is
- **Product name:** GeoSpark — "Click. Spark. Post." AI-powered content for local businesses (one idea → under 2 minutes → 6 platforms).
- **Repo/codebase name:** LocalContent.ai (`package.json`: `"name": "localcontent-ai"`).
- **Workspace path:** `c:\Users\Gert Jan\OneDrive\Documents\GeoSpark.AI`

### Tech stack
| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS, shadcn/ui |
| Database & Auth | Supabase (PostgreSQL, Auth) |
| Payments | Stripe |
| AI | OpenAI API |
| Other | Twilio (calls), Resend/SendGrid, Vercel Blob, Sharp (images) |

### Key directories
- **`app/`** — Pages: marketing (landing, demo, blog, about, contact), auth, dashboard (content, generations, templates, text-library, analytics, settings), sales (overview, team, leads, AI coach, dialer, outreach).
- **`app/api/`** — API routes: content, images (branding, composite, upload), business, usage, Stripe, webhooks, outreach (Instantly), sales (calls, email, leads, etc.).
- **`components/`** — UI and marketing components (e.g. `LiveContentDemo`, `WelcomeModal`).
- **`lib/`** — Supabase clients (`lib/supabase/`), utils, OpenAI.
- **`docs/`** — Setup guides (cold email, branding, testing, sales system).
- **`strategic_plans/`** — Business/strategy docs; some synced from VPS (see below).
- **`content/blog/`** — Blog markdown.

### Run locally
- `npm install` → `npm run dev` (see `README.md`).
- Env: `.env.local` (Supabase, Stripe, OpenAI, etc.). Do not commit secrets.

### Deploy
- Pushed to `main` triggers Vercel deploy. Rule: commit and push when work is done unless user says otherwise.

---

## 2. VPS: Openclaw / Clawdbot (Hetzner)

### What it is
- **VPS** where "Clawdbot" runs and where strategic plans / localcontent_ai paths are synced. In this doc we call it **Openclaw** (your name) or **Clawdbot** (name in repo docs).

### Connection (from this machine)
- **SSH config:** `C:\Users\Gert Jan\.ssh\config`
- **Host alias:** `clawdbot`
- **Command:** `ssh clawdbot`
- **Details:** HostName `89.167.9.171`, User `root`, IdentityFile `~/.ssh/clawdbot-hetzner`, IdentitiesOnly yes.

(Do not put SSH keys or passwords in the repo.)

### Important paths on the VPS
| Path | Purpose |
|------|--------|
| `/root/clawd-work/` | Root work directory |
| `/root/clawd-work/localcontent_ai/` | LocalContent.ai / GeoSpark app (aligned with this repo) |
| `/root/clawd-work/localcontent_ai/strategic_plans/` | Strategic plans (synced; see `strategic_plans/README.md`) |
| `/root/clawd-work/localcontent_ai/implementation_plans/` | Implementation plans |
| `/root/clawd-work/localcontent_ai/research/` | Research docs |
| `/root/clawd-work/project_apex/` | Other project |
| `/root/clawd-work/trash/YYYY-MM-DD/` | Soft-delete target (move here instead of `rm`) |
| `/root/backups/` | Backups (e.g. `clawd-work-YYYYMMDD.tar.gz`) |

### Rules (from `strategic_plans/clawdbot_security_rules.md`)
- **No hard delete:** Before `rm`, move file to `/root/clawd-work/trash/$(date +%Y-%m-%d)/`.
- **Protected dirs:** Do not delete contents of `strategic_plans/`, `implementation_plans/`, `research/`, `project_apex/`, or files like `*_plan.md`, `*_strategy.md`, `*_analysis.md` without explicit approval.
- **Git:** No `git reset --hard` on main, no `git clean -fd` without approval; use `git stash` before destructive ops; review `git diff` before commit.
- **Sub-agents:** No direct deletes (soft-delete only), no `git reset`/`clean`/`revert`, no push without main agent review.

### Key docs in repo that describe the VPS
- **`strategic_plans/README.md`** — File locations (local vs VPS vs GitHub), sync note.
- **`strategic_plans/clawdbot_security_rules.md`** — Delete protection, backup, incident response.
- **`strategic_plans/CLAWDBOT_TASKS_JAN30.md`** — Example task list for Clawdbot on VPS (paths under `/root/clawd-work/localcontent_ai/`).
- **`strategic_plans/mvp_infrastructure_roadmap.md`** — Refers to VPS paths for app setup.

---

## 3. Quick reference for a new Cursor agent

1. **Project:** GeoSpark = product name; repo = LocalContent.ai; Next.js + Supabase + Stripe + OpenAI; workspace = `GeoSpark.AI` folder.
2. **VPS:** Connect with `ssh clawdbot`; work lives under `/root/clawd-work/`; never hard-delete — use trash; follow `clawdbot_security_rules.md` for file/git rules.
3. **Sync:** Strategic plans exist locally and on VPS at `.../localcontent_ai/strategic_plans/`; last sync note in `strategic_plans/README.md`.
4. **No connection secrets in repo:** SSH and app secrets stay in `.ssh/` and `.env.local`; this doc only describes where they are and how to connect (e.g. `ssh clawdbot`).
