# GeoSpark Autonomous Sales Pipeline

Python pipeline that runs on a VPS to autonomously scrape, enrich, score, and email local business prospects.

## Architecture

```
VPS (Python pipeline)          Vercel (Next.js dashboard)
┌──────────────────┐          ┌──────────────────────┐
│ Outscraper       │          │ Sales Dashboard      │
│ Instagram        │──write──▶│ Prospect Pipeline    │
│ Email Finder     │          │ Email Review         │
│ AI Insights      │ Supabase │ Campaign Stats       │
│ Scoring Engine   │◀──read───│ Learning Reports     │
│ Email Generator  │          └──────────────────────┘
│ Instantly Upload │
│ Learning Engine  │
└──────────────────┘
```

Both connect to the same Supabase database.

## Setup (VPS)

```bash
cd pipeline
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env with your API keys
```

## Run

```bash
# Full daily pipeline
python daily_workflow.py

# Scrape only
python daily_workflow.py --scrape-only

# Override target
python daily_workflow.py --target 50 --city "Austin, TX" --category "Hair Salon"
```

## Cron (daily at 8am)

```bash
crontab -e
# Add:
0 8 * * * cd /path/to/pipeline && /path/to/venv/bin/python daily_workflow.py >> /path/to/pipeline/logs/cron.log 2>&1
```

## Pipeline Steps

1. **Scrape** — Outscraper pulls businesses from Google Maps
2. **Enrich** — Instagram, Yelp, website analysis, email finding
3. **Score** — 100-point GeoSpark algorithm (Tier 1-5)
4. **Insights** — Claude generates 7-10 data-driven insights per prospect
5. **Emails** — Claude generates personalized 4-email sequences
6. **Upload** — Sequences pushed to Instantly.ai for sending
7. **Learn** — Track performance, optimize parameters over time

## Required API Keys

- `SUPABASE_URL` + `SUPABASE_SERVICE_KEY`
- `OUTSCRAPER_API_KEY`
- `ANTHROPIC_API_KEY`
- `INSTANTLY_API_KEY`
