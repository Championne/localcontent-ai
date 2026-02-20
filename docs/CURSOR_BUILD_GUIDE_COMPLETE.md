# GeoSpark Autonomous Sales Machine - Complete Build Guide for Cursor
## Step-by-Step Implementation with Claude Opus 4.6

**Date**: February 20, 2026  
**Build Tool**: Cursor with Claude Opus 4.6  
**Timeline**: 7-10 days to full system  
**Your Stack**: Outscraper + Google Workspace + Instantly AI + Claude API + Supabase

---

## 🎯 **BUILD OVERVIEW**

### **What You're Building**:

```
┌─────────────────────────────────────────────────────────────┐
│           GEOSPARK AUTONOMOUS SALES MACHINE                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. SUPABASE DATABASE (10 tables)                          │
│     └─ All prospect data, enrichment, scoring, learning    │
│                                                             │
│  2. SCRAPING ENGINE (3 sources)                            │
│     ├─ Outscraper: Google Maps + owner emails              │
│     ├─ Instaloader: Instagram data                         │
│     └─ Fresh sources: State licenses, awards               │
│                                                             │
│  3. ENRICHMENT PIPELINE (Multi-platform)                   │
│     ├─ Instagram, Facebook, Yelp, TikTok analysis          │
│     ├─ Competitor intelligence                             │
│     └─ Email finding waterfall                             │
│                                                             │
│  4. AI INSIGHT GENERATOR (Claude API)                      │
│     └─ 7-10 insights per prospect                          │
│                                                             │
│  5. SCORING ENGINE (100-point algorithm)                   │
│     └─ 10 criteria, tier assignment                        │
│                                                             │
│  6. EMAIL GENERATOR (Claude API)                           │
│     └─ 4-email sequences, 50%+ personalized                │
│                                                             │
│  7. INSTANTLY AI INTEGRATION                               │
│     └─ Upload & schedule campaigns                         │
│                                                             │
│  8. LEARNING ENGINE (Self-optimizing)                      │
│     └─ Passive → Active → Autonomous                       │
│                                                             │
│  9. ORCHESTRATOR (Main controller)                         │
│     └─ Runs entire pipeline 24/7                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 **PRE-BUILD CHECKLIST**

### **Before Opening Cursor**:

```
✅ ACCOUNTS CREATED:
├─ Outscraper.com ($99/month Business plan)
├─ Supabase.com (free tier)
├─ Claude API (already have)
├─ Google Workspace (already have)
└─ Instantly AI (already have free tier)

✅ API KEYS READY:
├─ Outscraper API key
├─ Claude API key (Anthropic)
├─ Supabase connection URL + API key
└─ Instantly API key (from dashboard)

✅ DOMAINS READY:
├─ 3 domains purchased
├─ 9 mailboxes created (3 per domain)
└─ SPF/DKIM/DMARC configured

✅ DEVELOPMENT ENVIRONMENT:
├─ Linux Thinkpad or server
├─ Python 3.10+ installed
└─ Git installed
```

---

## 🗂️ **PROJECT STRUCTURE**

### **Create This Folder Structure**:

```
geospark-sales-machine/
├── README.md
├── requirements.txt
├── .env
├── .gitignore
│
├── config/
│   ├── __init__.py
│   ├── settings.py          # All configuration
│   └── database.py          # Supabase connection
│
├── database/
│   ├── schema.sql           # Supabase table creation
│   ├── migrations/          # Schema changes
│   └── seeds/               # Test data
│
├── scrapers/
│   ├── __init__.py
│   ├── outscraper_scraper.py    # Google Maps via Outscraper
│   ├── instagram_scraper.py     # Instagram via Instaloader
│   ├── fresh_sources_scraper.py # State licenses, awards
│   └── email_finder.py          # Email waterfall
│
├── enrichment/
│   ├── __init__.py
│   ├── instagram_analyzer.py    # Deep Instagram analysis
│   ├── multi_platform.py        # Facebook, Yelp, etc.
│   ├── competitor_finder.py     # Find & analyze competitors
│   └── content_classifier.py    # AI content classification
│
├── scoring/
│   ├── __init__.py
│   └── scoring_engine.py        # 100-point algorithm
│
├── insights/
│   ├── __init__.py
│   └── insight_generator.py     # Claude API insights
│
├── emails/
│   ├── __init__.py
│   └── email_generator.py       # Claude API email sequences
│
├── integrations/
│   ├── __init__.py
│   └── instantly_api.py         # Instantly AI integration
│
├── learning/
│   ├── __init__.py
│   ├── learning_engine.py       # Main learning coordinator
│   ├── conversion_learner.py   # Learn from conversions
│   ├── email_learner.py         # Learn from email performance
│   └── scoring_learner.py       # Optimize scoring
│
├── orchestrator/
│   ├── __init__.py
│   └── main_orchestrator.py     # Master controller
│
├── utils/
│   ├── __init__.py
│   ├── logger.py                # Logging setup
│   └── helpers.py               # Common utilities
│
├── tests/
│   └── test_*.py                # Unit tests
│
├── scripts/
│   ├── setup_database.py        # One-time setup
│   ├── run_scraper.py          # Manual scraping
│   └── test_pipeline.py        # Test end-to-end
│
└── daily_workflow.py            # Main entry point
```

---

## 📅 **7-DAY BUILD PLAN**

### **DAY 1: Foundation & Database**

**Morning: Project Setup**

Create project:
```bash
mkdir geospark-sales-machine
cd geospark-sales-machine
python3 -m venv venv
source venv/bin/activate
git init
```

Create `requirements.txt`:
```
supabase==2.3.0
psycopg2-binary==2.9.9
outscraper==3.0.8
instaloader==4.10.3
requests==2.31.0
beautifulsoup4==4.12.2
playwright==1.40.0
anthropic==0.18.1
pandas==2.1.4
numpy==1.26.2
python-dotenv==1.0.0
pydantic==2.5.2
pytest==7.4.3
```

Create `.env`:
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
OUTSCRAPER_API_KEY=your_outscraper_key
ANTHROPIC_API_KEY=your_claude_key
INSTANTLY_API_KEY=your_instantly_key
TARGET_CITY=Denver, CO
TARGET_STATE=Colorado
TARGET_CATEGORY=Hair Salon
```

**Afternoon: Supabase Database**

Tell Cursor: "Create database/schema.sql with all 10 tables"

Tables needed:
1. businesses - Core entity
2. social_profiles - Platform data
3. posts - Individual posts
4. reviews - Reviews data
5. google_business - GBP data
6. competitors - Competitor intel
7. marketing_insights - AI insights
8. email_personalization - Generated emails
9. learnings - ML data
10. campaign_performance - Results

---

### **DAY 2: Scraping Layer**

**Morning: Outscraper Integration**

Tell Cursor: "Create scrapers/outscraper_scraper.py with functions to scrape Google Maps and extract owner emails"

**Afternoon: Instagram Scraper**

Tell Cursor: "Create scrapers/instagram_scraper.py using Instaloader to extract profile and posts data"

---

### **DAY 3: Multi-Platform Enrichment**

**Morning: Facebook & Yelp**

Tell Cursor: "Create enrichment/multi_platform.py with scrapers for Yelp and Facebook"

**Afternoon: Email Finding**

Tell Cursor: "Create scrapers/email_finder.py with waterfall approach trying multiple methods"

---

### **DAY 4: AI Intelligence**

**Morning: Competitor Intelligence**

Tell Cursor: "Create enrichment/competitor_finder.py to find and analyze competitors"

**Afternoon: Claude API Insights**

Tell Cursor: "Create insights/insight_generator.py using Claude API to generate 7 insight types"

---

### **DAY 5: Scoring & Emails**

**Morning: Scoring Engine**

Tell Cursor: "Create scoring/scoring_engine.py with 100-point algorithm and 10 criteria"

**Afternoon: Email Generator**

Tell Cursor: "Create emails/email_generator.py using Claude API to generate 4-email sequences"

---

### **DAY 6: Integration & Learning**

**Morning: Instantly AI**

Tell Cursor: "Create integrations/instantly_api.py to upload campaigns to Instantly AI"

**Afternoon: Learning Engine**

Tell Cursor: "Create learning/learning_engine.py with passive, active, and autonomous modes"

---

### **DAY 7: Orchestration & Testing**

**Morning: Main Orchestrator**

Tell Cursor: "Create orchestrator/main_orchestrator.py to run the entire workflow"

**Afternoon: Testing**

Tell Cursor: "Create scripts/test_pipeline.py to test end-to-end with 10 prospects"

---

## 🚀 **LAUNCH STRATEGY**

### **Week 1: Soft Launch**

Days 1-2: Scrape 50 prospects, don't send
Days 3-4: Send 30 emails (10 per day)
Days 5-7: Ramp to 50 emails/day

### **Week 2: Full Launch**

Set up cron job:
```bash
crontab -e
# Add:
0 8 * * * cd /path/to/geospark-sales-machine && venv/bin/python daily_workflow.py
```

---

## 📊 **SUCCESS METRICS**

**Month 1 Goals**:
- ✅ 1,500 prospects in database
- ✅ 450 emails sent
- ✅ 40-50 responses (9-11% response rate)
- ✅ 2-5 customers

**Month 3 Goals**:
- ✅ 5,000 prospects
- ✅ 1,500 emails/month
- ✅ 12+ customers total
- ✅ Learning engine optimizing automatically

---

## 🎯 **CURSOR PROMPTS**

Use these specific prompts in Cursor:

**For Outscraper**:
"Create scrapers/outscraper_scraper.py that uses the outscraper Python SDK to scrape Google Maps businesses. Include functions for scraping, extracting social links, and saving to Supabase. Use type hints and handle errors with retries."

**For Instagram**:
"Create scrapers/instagram_scraper.py using Instaloader that extracts profile data, recent 50 posts, calculates engagement rate, analyzes posting patterns, and detects tools used (Canva, Linktree). Return dict matching social_profiles schema."

**For Insights**:
"Create insights/insight_generator.py using Claude API that generates 7 insight types: posting patterns, engagement analysis, competitor gaps, review-social gap, content quality. Each insight includes title, description, priority score, and supporting data."

**For Emails**:
"Create emails/email_generator.py using Claude API that generates 4-email sequences with 50%+ personalization, 7+ data points, conversational tone. Email 1: strongest insight hook, Email 2: different angle, Email 3: social proof, Email 4: breakup."

---

## ⚠️ **COMMON ISSUES & SOLUTIONS**

**Instagram Rate Limited**: Add 60-second delays, don't scrape >100/day

**Emails to Spam**: Continue warmup, improve personalization >50%, use engagement targeting

**Outscraper Errors**: Check API key, verify quota, add retry logic

**Claude API Expensive**: Only generate for Tier 1-2, cache results, batch calls

---

## ✅ **FINAL CHECKLIST**

```
✅ All API keys configured
✅ Database schema created
✅ All modules built and tested
✅ End-to-end test passed
✅ Domain warmup at day 14+
✅ First 50 prospects scraped
✅ Ready to launch
```

**Start building now! Follow Day 1 and work through systematically.** 🚀
