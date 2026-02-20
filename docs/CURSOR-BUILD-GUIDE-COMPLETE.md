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

---

## **DAY 1: Foundation & Database**

### **Morning: Project Setup**

**In Cursor, create new project**:

```bash
# Create project directory
mkdir geospark-sales-machine
cd geospark-sales-machine

# Initialize git
git init

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # or: venv\Scripts\activate on Windows
```

**Create `requirements.txt`**:

Tell Cursor: "Create requirements.txt with these packages"

```
# Database
supabase==2.3.0
psycopg2-binary==2.9.9

# Web Scraping
outscraper==3.0.8
instaloader==4.10.3
requests==2.31.0
beautifulsoup4==4.12.2
playwright==1.40.0

# AI
anthropic==0.18.1

# Data Processing
pandas==2.1.4
numpy==1.26.2

# Email
instantly-python-sdk==1.0.0  # Check if exists, else use requests

# Utilities
python-dotenv==1.0.0
pydantic==2.5.2
pydantic-settings==2.1.0

# Testing
pytest==7.4.3
```

**Create `.env` file**:

Tell Cursor: "Create .env file for API keys"

```bash
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key

# APIs
OUTSCRAPER_API_KEY=your_outscraper_key
ANTHROPIC_API_KEY=your_claude_key
INSTANTLY_API_KEY=your_instantly_key

# Target Market
TARGET_CITY=Denver, CO
TARGET_STATE=Colorado
TARGET_CATEGORY=Hair Salon

# Settings
DEBUG=True
LOG_LEVEL=INFO
```

**Create `.gitignore`**:

```
venv/
.env
__pycache__/
*.pyc
*.log
.pytest_cache/
```

---

### **Afternoon: Supabase Database**

**Tell Cursor**: "Create database/schema.sql with all 10 tables"

**Prompt for Cursor**:
```
Create a Supabase/PostgreSQL schema with these 10 tables:

1. businesses - Core entity with:
   - id, business_name, category, address, city, state, zip
   - owner_name, owner_email, owner_phone
   - website, instagram, facebook, yelp
   - geospark_score, score_tier, score_breakdown (JSONB)
   - contact_status, first_contacted, last_contacted
   - created_at, updated_at, last_enriched

2. social_profiles - Platform data:
   - id, business_id (FK), platform, username
   - followers, following, posts_count
   - engagement_rate, posts_last_30_days
   - last_post_date, posting_frequency
   - content_breakdown (JSONB)
   - tools_detected (JSONB)

3. posts - Individual posts:
   - id, social_profile_id (FK), post_url
   - post_date, caption, likes, comments, shares
   - engagement_rate, post_type
   - content_classification (JSONB)

4. reviews - Reviews data:
   - id, business_id (FK), platform, author
   - rating, review_text, review_date
   - sentiment, keywords (JSONB)

5. google_business - GBP data:
   - id, business_id (FK), place_id
   - reviews_count, rating, photos_count
   - posts_count, qa_count
   - recent_changes (JSONB)

6. competitors - Competitor intel:
   - id, business_id (FK), competitor_name
   - competitor_instagram, competitor_data (JSONB)
   - follower_gap, posting_gap, engagement_gap

7. marketing_insights - AI insights:
   - id, business_id (FK), insight_type
   - insight_title, insight_description
   - priority_score, supporting_data (JSONB)
   - created_at

8. email_personalization - Generated emails:
   - id, business_id (FK), email_number
   - subject_line, email_body
   - personalization_pct, data_points_used
   - sent, sent_at, opened, opened_at
   - replied, replied_at

9. learnings - ML data:
   - id, learning_type, data (JSONB)
   - confidence, status
   - created_at

10. campaign_performance - Results:
    - id, business_id (FK), campaign_date
    - emails_sent, opened, replied
    - demos_booked, trial_started, became_customer
    - mrr_value

Include:
- All foreign keys with ON DELETE CASCADE
- Indexes on: business_id, email, geospark_score, contact_status
- created_at, updated_at timestamps with defaults
```

**Apply Schema**:

1. Go to Supabase dashboard
2. SQL Editor → New Query
3. Copy the generated schema.sql
4. Run it
5. Verify all tables created

---

## **DAY 2: Scraping Layer**

### **Morning: Outscraper Integration**

**Tell Cursor**: "Create scrapers/outscraper_scraper.py"

**Prompt for Cursor**:
```
Create a comprehensive Outscraper scraper that:

1. Searches Google Maps by category and city
2. Extracts:
   - Business name, category, address, phone
   - Owner name, owner email (from Outscraper)
   - Website, Google Business data
   - Reviews count, rating
   - Instagram/Facebook links if present

3. Functions needed:
   - scrape_google_maps(category, city, limit)
   - extract_social_links(business_data)
   - save_to_supabase(businesses)

4. Features:
   - Rate limiting (respect API limits)
   - Error handling with retries
   - Progress tracking
   - Deduplication (check if business exists)

5. Return structured dict with all fields matching Supabase schema

Use outscraper Python SDK. Include type hints and docstrings.
```

**Test It**:
```python
# In scripts/test_scraper.py
from scrapers.outscraper_scraper import scrape_google_maps

# Test with small batch
results = scrape_google_maps(
    category="Hair Salon",
    city="Denver, CO",
    limit=10
)

print(f"Scraped {len(results)} businesses")
print(f"First business: {results[0]}")
```

---

### **Afternoon: Instagram Scraper**

**Tell Cursor**: "Create scrapers/instagram_scraper.py"

**Prompt for Cursor**:
```
Create Instagram scraper using Instaloader that:

1. Takes Instagram username
2. Extracts:
   - Profile: followers, following, bio, is_business
   - Recent 50 posts with: date, likes, comments, caption
   - Posting patterns: frequency, gaps, consistency
   - Content types: photo vs video vs carousel

3. Functions:
   - scrape_instagram_profile(username)
   - calculate_engagement_rate(posts, followers)
   - analyze_posting_patterns(posts)
   - detect_tools_used(bio, posts) # Detect Canva, Linktree

4. Features:
   - Rate limiting (don't get blocked)
   - Handle private accounts gracefully
   - Cache profile pics
   - Return None if account doesn't exist

5. Return dict matching social_profiles + posts tables

Use instaloader library. Include error handling.
```

---

## **DAY 3: Multi-Platform Enrichment**

### **Morning: Facebook & Yelp Scrapers**

**Tell Cursor**: "Create enrichment/multi_platform.py"

**Prompt for Cursor**:
```
Create multi-platform enrichment module with:

1. scrape_yelp(business_name, city)
   - Rating, reviews count, price range
   - Recent reviews with sentiment
   - Categories, attributes

2. scrape_facebook_page(page_url)
   - Likes, followers, check-ins
   - Recent posts with engagement
   - About section (may have email)

3. scrape_tiktok(username) # Optional
   - Followers, video count
   - Recent videos with views

4. enrich_business(business_id)
   - Orchestrates all platform scrapers
   - Saves to appropriate tables
   - Updates last_enriched timestamp

Use:
- BeautifulSoup for Yelp
- Playwright for Facebook (headless browser)
- Handle missing/private pages gracefully

Return structured data matching schema.
```

---

### **Afternoon: Email Finding Waterfall**

**Tell Cursor**: "Create scrapers/email_finder.py"

**Prompt for Cursor**:
```
Create email finding waterfall that tries multiple methods:

1. check_outscraper_email(business)
   - Use email from Outscraper if present
   - Confidence: "high"

2. scrape_website_email(website_url)
   - Extract from contact page, footer, about
   - Try /contact, /about, /team pages
   - Use regex to find emails
   - Confidence: "high"

3. check_social_bios(instagram_bio, facebook_about)
   - Extract email from social profiles
   - Confidence: "medium"

4. check_whois(domain)
   - WHOIS lookup for domain owner email
   - Filter out privacy emails
   - Confidence: "low"

5. verify_email_smtp(email)
   - SMTP check without sending
   - Verify email actually exists

Main function:
- find_email_comprehensive(business_data)
  - Tries all methods in order
  - Returns first verified email found
  - Returns {"email": "...", "source": "...", "confidence": "..."}
  - Returns None if not found

Include logging for each attempt.
```

---

## **DAY 4: AI Intelligence Layer**

### **Morning: Competitor Intelligence**

**Tell Cursor**: "Create enrichment/competitor_finder.py"

**Prompt for Cursor**:
```
Create competitor finder that:

1. find_competitors(business)
   - Search Google Maps for same category, same city
   - Exclude the business itself
   - Find 5 similar businesses
   - Return competitor names + Instagram handles

2. analyze_competitor(competitor_instagram)
   - Scrape their Instagram
   - Get: followers, posts/month, engagement rate
   - Return competitor metrics

3. calculate_gaps(business, competitors)
   - Follower gap (competitor avg - business)
   - Posting gap (competitor avg posts - business)
   - Engagement gap
   - Return gap analysis

4. save_competitors(business_id, competitors)
   - Save to competitors table
   - Link to business

Use Outscraper + Instaloader.
Return structured competitor data.
```

---

### **Afternoon: Claude API Insights**

**Tell Cursor**: "Create insights/insight_generator.py"

**Prompt for Cursor**:
```
Create AI insight generator using Claude API that:

1. generate_all_insights(business_data)
   - Takes enriched business data
   - Generates 7-10 insights
   - Returns list of insights

2. Insight types to generate:
   a) posting_pattern_insight
      - "2 posts in 60 days vs competitor's 24"
   
   b) engagement_analysis_insight
      - "Before/after posts get 3.6x more engagement"
   
   c) competitor_gap_insight
      - "Bloom Salon posts 12x/month, you post 3x"
   
   d) review_social_gap_insight
      - "68 reviews but 0 posts in February"
   
   e) content_quality_insight
      - "65% promotional vs 20% industry standard"

3. Each insight includes:
   - insight_type
   - insight_title (catchy, short)
   - insight_description (2-3 sentences with data)
   - priority_score (1-10)
   - supporting_data (dict with specific numbers)

4. Claude API prompt template:
   "Analyze this business's social media presence and generate
   specific, data-driven insights. Use exact numbers from the data."

Use Anthropic SDK. Include prompt engineering for good insights.
Return structured insights matching schema.
```

---

## **DAY 5: Scoring & Email Generation**

### **Morning: Scoring Engine**

**Tell Cursor**: "Create scoring/scoring_engine.py"

**Prompt for Cursor**:
```
Create 100-point scoring algorithm with:

1. calculate_geospark_score(business_data)
   - Returns 0-100 score
   - Returns tier (TIER 1-5)
   - Returns score breakdown (dict)

2. Scoring criteria (50 points problems + 50 points readiness):

PROBLEM SIGNALS (50 points):
- inconsistent_posting (0-15): Based on posts_last_30_days, max gap
- low_engagement (0-10): Based on engagement_rate vs 3.5% benchmark
- review_social_gap (0-10): High reviews, low posts
- partial_platform (0-7): Active on 1 platform only
- generic_content (0-8): >70% promotional content

READINESS SIGNALS (50 points):
- using_competitors (0-12): Canva, Linktree detected
- review_quality (0-10): High rating + count
- follower_range (0-10): 500-5000 sweet spot
- content_quality_gap (0-10): Best vs worst variance
- email_confidence (0-8): High confidence email found

3. Tier assignment:
   - 80-100: TIER 1 (A+ Perfect Fit)
   - 70-79: TIER 2 (A Excellent)
   - 60-69: TIER 3 (B Good)
   - 50-59: TIER 4 (C Fair)
   - <50: TIER 5 (Skip)

4. save_score(business_id, score, tier, breakdown)

Include detailed comments explaining each criterion.
Return structured scoring data.
```

---

### **Afternoon: Email Generator**

**Tell Cursor**: "Create emails/email_generator.py"

**Prompt for Cursor**:
```
Create email generator using Claude API that:

1. generate_email_sequence(business_data, insights)
   - Generates 4 emails (sequence)
   - Uses top 3 insights
   - Returns list of emails

2. Email structure:
   Email 1 (Day 0): Hook with strongest insight
   - Reference specific data point
   - Under 125 words
   - No generic greeting
   - Example: "Your before/after posts get 47 likes vs 13 for promotions"
   
   Email 2 (Day 3): Different angle
   - Use different insight
   - Under 100 words
   
   Email 3 (Day 7): Social proof
   - Similar business case study
   - Project their potential results
   
   Email 4 (Day 12): Breakup
   - Last touch, under 75 words
   - P.S. with compliment

3. Each email includes:
   - email_number (1-4)
   - subject_line
   - email_body
   - personalization_pct (calculate % of unique content)
   - data_points_used (count specific numbers mentioned)

4. Requirements:
   - 50%+ personalization (unique to this prospect)
   - 7+ data points (specific numbers)
   - Conversational tone, not salesy
   - Reference their engagement if from engagement source

5. Claude API prompt engineering:
   - Provide all business data
   - Provide insights
   - Provide example email structure
   - Request JSON output

Use Anthropic SDK. Calculate personalization metrics.
Return structured email data matching schema.
```

---

## **DAY 6: Integrations & Learning**

### **Morning: Instantly AI Integration**

**Tell Cursor**: "Create integrations/instantly_api.py"

**Prompt for Cursor**:
```
Create Instantly AI integration that:

1. upload_campaign(prospects, emails)
   - Takes list of prospects with generated emails
   - Uploads to Instantly AI via API
   - Creates/updates campaign
   - Schedules email sequences

2. Functions needed:
   - create_campaign(campaign_name)
   - add_prospect_to_campaign(campaign_id, prospect_data)
   - set_email_sequence(campaign_id, email_sequence)
   - schedule_send(campaign_id, start_date)

3. Format for Instantly:
   {
     "email": "prospect@business.com",
     "firstName": "Sarah",
     "businessName": "Sarah's Salon",
     "customField1": "specific_insight",
     "emailSequence": [
       {"subject": "...", "body": "...", "delay": 0},
       {"subject": "...", "body": "...", "delay": 3},
       {"subject": "...", "body": "...", "delay": 7},
       {"subject": "...", "body": "...", "delay": 12}
     ]
   }

4. Features:
   - Batch upload (multiple prospects at once)
   - Error handling
   - Rate limiting
   - Progress tracking

Check Instantly API docs. Use requests library.
Return upload results with success/failure counts.
```

---

### **Afternoon: Learning Engine Foundation**

**Tell Cursor**: "Create learning/learning_engine.py"

**Prompt for Cursor**:
```
Create learning engine that:

1. LearningEngine class with modes:
   - PASSIVE: Just collecting data
   - ACTIVE: Generating recommendations
   - AUTONOMOUS: Auto-implementing changes

2. Functions:
   - track_email_sent(business_id, email_id)
   - track_email_opened(email_id, opened_at)
   - track_email_replied(email_id, replied_at)
   - track_conversion(business_id, conversion_type)

3. analyze_performance()
   - Calculate metrics:
     * Overall response rate
     * Response rate by source (Outscraper, fresh, engagement)
     * Response rate by tier
     * Conversion rate by tier
   - Identify patterns:
     * Which scores actually convert
     * Which insights drive responses
     * Which email patterns work best
   - Generate learnings dict

4. generate_recommendations()
   - Based on analyzed patterns
   - Create recommendations like:
     * "Fresh sources convert 3x better → allocate more"
     * "Tier 1 threshold should be 85 not 80"
     * "Subject line pattern X gets +12% opens"
   - Include confidence score
   - Flag auto-implementable vs needs review

5. save_learning(learning_data)
   - Save to learnings table

Include thresholds for activation (50 emails, 10 responses, etc.)
Return structured learning data.
```

---

## **DAY 7: Orchestration & Testing**

### **Morning: Main Orchestrator**

**Tell Cursor**: "Create orchestrator/main_orchestrator.py"

**Prompt for Cursor**:
```
Create main orchestrator that runs the entire pipeline:

1. MainOrchestrator class that:
   - Coordinates all modules
   - Runs complete workflow
   - Handles errors gracefully
   - Logs everything

2. Main workflow: run_daily_workflow()

   STEP 1: SCRAPING (Morning)
   - Scrape Outscraper (target count)
   - Scrape fresh sources (20% of target)
   - Scrape engagement sources (20% of target)
   - Log: "Scraped X prospects from Y sources"

   STEP 2: ENRICHMENT (Afternoon)
   - For each new prospect:
     * Enrich Instagram
     * Enrich other platforms
     * Find competitors
     * Find email (waterfall)
     * Log progress
   - Update last_enriched timestamp

   STEP 3: INSIGHTS (Late Afternoon)
   - For each enriched prospect:
     * Generate insights (Claude API)
     * Save to insights table
   - Log: "Generated X insights for Y prospects"

   STEP 4: SCORING (Evening)
   - Calculate GeoSpark score
   - Assign tier
   - Save to database
   - Log: "Scored X prospects, Y are Tier 1-2"

   STEP 5: EMAIL GENERATION (Evening)
   - For Tier 1-2 prospects with status=pending:
     * Generate 4-email sequence
     * Save to email_personalization table
   - Log: "Generated X email sequences"

   STEP 6: UPLOAD TO INSTANTLY (Night)
   - Get prospects ready to send
   - Upload to Instantly AI
   - Mark as uploaded
   - Log: "Uploaded X prospects to Instantly"

   STEP 7: LEARNING (Daily)
   - Analyze performance
   - Generate recommendations
   - Log insights

3. Error handling:
   - Try/except at each step
   - Continue on errors (don't crash)
   - Log all errors
   - Send summary report

4. run_continuously()
   - Infinite loop
   - Run workflow once per day
   - Sleep between runs
   - Monitor health

Include progress tracking, time estimates, detailed logging.
```

---

### **Afternoon: Testing & Validation**

**Tell Cursor**: "Create scripts/test_pipeline.py"

**Prompt for Cursor**:
```
Create comprehensive test script that:

1. Tests each module individually:
   - test_outscraper() - scrape 5 businesses
   - test_instagram() - scrape 3 profiles
   - test_email_finder() - find 5 emails
   - test_insights() - generate for 1 business
   - test_scoring() - score 1 business
   - test_email_generation() - generate 1 sequence
   - test_instantly_upload() - upload 1 prospect

2. Test end-to-end:
   - test_full_pipeline()
     * Scrape 10 Denver salons
     * Enrich all 10
     * Generate insights
     * Score all
     * Generate emails for Tier 1
     * Upload to Instantly (test mode)

3. Validate data quality:
   - Check all required fields present
   - Verify email format valid
   - Verify scores in 0-100 range
   - Verify insights have data
   - Verify emails have personalization >40%

4. Print summary:
   - Success/failure counts
   - Time taken per step
   - Data quality metrics
   - Sample output

Include assertions, colored output, progress bars.
```

---

## **DAY 8-9: Refinement & Launch Prep**

### **Configuration Management**

**Tell Cursor**: "Create config/settings.py"

**Prompt for Cursor**:
```
Create settings management using pydantic-settings:

1. Settings class with all configuration:
   - API keys (from .env)
   - Database connection
   - Target market (city, state, category)
   - Scraping limits
   - Scoring thresholds
   - Learning engine thresholds

2. Separate configs for:
   - Development (verbose logging, small batches)
   - Production (optimized, full batches)

3. Validation:
   - Ensure all required API keys present
   - Validate limits are reasonable
   - Check database connection on load

4. Easy access:
   from config.settings import settings
   api_key = settings.OUTSCRAPER_API_KEY
```

---

### **Logging System**

**Tell Cursor**: "Create utils/logger.py"

**Prompt for Cursor**:
```
Create comprehensive logging system:

1. Configure Python logging:
   - Console output (INFO level)
   - File output (DEBUG level)
   - Rotating logs (max 10MB, keep 5 files)

2. Log categories:
   - scraping (all scraping operations)
   - enrichment (enrichment progress)
   - insights (AI generation)
   - emails (email generation + sending)
   - learning (learning engine operations)
   - errors (all errors with stack traces)

3. Structured logging:
   - Include timestamps
   - Include module name
   - Include business_id where relevant
   - Include performance metrics (time taken)

4. Easy import:
   from utils.logger import logger
   logger.info("Scraped 10 businesses")
   logger.error("API failed", exc_info=True)
```

---

### **Daily Entry Point**

**Tell Cursor**: "Create daily_workflow.py at root"

**Prompt for Cursor**:
```
Create main entry point script:

#!/usr/bin/env python3
"""
GeoSpark Autonomous Sales Machine - Daily Workflow
Run this script daily to execute the complete pipeline.
"""

import sys
from orchestrator.main_orchestrator import MainOrchestrator
from utils.logger import logger
from config.settings import settings

def main():
    """Run complete daily workflow"""
    
    logger.info("=" * 60)
    logger.info("GEOSPARK AUTONOMOUS SALES MACHINE - STARTING")
    logger.info("=" * 60)
    
    try:
        orchestrator = MainOrchestrator(
            target_city=settings.TARGET_CITY,
            target_category=settings.TARGET_CATEGORY,
            daily_target=500  # Prospects to process
        )
        
        # Run complete workflow
        results = orchestrator.run_daily_workflow()
        
        # Print summary
        logger.info("=" * 60)
        logger.info("DAILY WORKFLOW COMPLETE")
        logger.info(f"Scraped: {results['scraped']}")
        logger.info(f"Enriched: {results['enriched']}")
        logger.info(f"Emails Generated: {results['emails_generated']}")
        logger.info(f"Uploaded to Instantly: {results['uploaded']}")
        logger.info("=" * 60)
        
        return 0
        
    except Exception as e:
        logger.error(f"FATAL ERROR: {e}", exc_info=True)
        return 1

if __name__ == "__main__":
    sys.exit(main())
```

Make executable: chmod +x daily_workflow.py
```

---

## **DAY 10: Launch & Monitor**

### **Pre-Launch Checklist**

```
✅ DATABASE:
├─ All 10 tables created in Supabase
├─ Indexes applied
└─ Test data inserted and verified

✅ API KEYS:
├─ All keys in .env file
├─ All keys tested and working
└─ Rate limits understood

✅ DOMAINS:
├─ Warmup started (at least 7 days ago)
├─ SPF/DKIM/DMARC configured
└─ Currently at 20-30 emails/day warmup

✅ CODE:
├─ All modules tested individually
├─ End-to-end test passed
├─ Logs working correctly
└─ Error handling tested

✅ INSTANTLY AI:
├─ Campaigns created
├─ Warmup sequences active
└─ Test upload completed successfully
```

---

### **Soft Launch (Week 1)**

**Day 1-2: 50 Prospects**
```bash
python daily_workflow.py --target 50 --tier 1 --test-mode
```
- Scrape 50 Denver salons
- Full enrichment
- Generate emails for Tier 1 only
- Manual QA: Review 5 random emails
- Don't send yet - just verify quality

**Day 3-4: Send 30 Emails**
```bash
python daily_workflow.py --target 30 --send
```
- Send to 10 Tier 1 prospects (3 emails/day)
- Monitor deliverability closely
- Check inbox placement (Gmail tabs, spam folder)
- Watch for bounces

**Day 5-7: Ramp to 50/day**
```bash
python daily_workflow.py --target 50 --send
```
- Increase to 50 prospects processed
- Send 10-15 emails/day
- Continue monitoring
- Track first responses

---

### **Week 2: Full Launch**

**Scale to 500 prospects/week**
```bash
# Set up cron job to run daily at 8am
crontab -e

# Add:
0 8 * * * cd /path/to/geospark-sales-machine && /path/to/venv/bin/python daily_workflow.py
```

**Monitor Daily**:
- Check logs: `tail -f logs/geospark.log`
- Check Supabase dashboard (prospect counts)
- Check Instantly AI (delivery stats)
- Review any errors

**Learning Engine Activation**:
- After 100 emails sent: Review first learnings
- After 10 responses: Patterns emerging
- Week 3: Active mode (review recommendations)
- Month 2: Consider autonomous mode

---

## 🎯 **CURSOR-SPECIFIC TIPS**

### **How to Use Cursor Effectively**:

**1. Be Specific in Prompts**:
```
❌ Bad: "Create a scraper"
✅ Good: "Create scrapers/outscraper_scraper.py that uses the 
outscraper Python SDK to scrape Google Maps businesses. Include 
functions for scraping, extracting social links, and saving to 
Supabase. Use type hints and handle errors with retries."
```

**2. Reference Files**:
```
"Update emails/email_generator.py to also calculate 
personalization_pct by comparing generated email to a template. 
Use difflib to calculate similarity."
```

**3. Ask for Tests**:
```
"Create tests/test_scoring.py that tests the scoring_engine.py 
with sample data. Test all 10 criteria and verify tier assignment."
```

**4. Iterate**:
```
"The email generator is too generic. Update it to include more 
specific data points from the insights. Aim for 50%+ personalization."
```

**5. Use Multi-File Context**:
```
"Looking at scoring_engine.py and insight_generator.py, update 
email_generator.py to prioritize insights that correlate with 
high scores."
```

---

## 📊 **SUCCESS METRICS**

### **Week 1 Goals**:
```
✅ System built and tested
✅ 50 prospects scraped and enriched
✅ 30 emails sent without deliverability issues
✅ 0 errors in production logs
```

### **Month 1 Goals**:
```
✅ 1,500 prospects in database
✅ 450 emails sent
✅ 40-50 responses (9-11% response rate)
✅ 10-12 demos booked
✅ 2-5 customers
✅ Learning engine in active mode
```

### **Month 3 Goals**:
```
✅ 5,000 prospects in database
✅ 1,500 emails sent/month
✅ 150+ responses/month
✅ 40+ demos/month
✅ 12+ customers total
✅ Learning engine optimizing automatically
```

---

## ⚠️ **COMMON ISSUES & SOLUTIONS**

### **Issue: Rate Limited by Instagram**
```
Solution:
- Add delays between requests (60 seconds)
- Use session management
- Don't scrape >100 profiles/day
- Rotate IP if needed
```

### **Issue: Emails Going to Spam**
```
Solution:
- Continue warmup longer
- Reduce sending volume temporarily
- Check SPF/DKIM/DMARC
- Improve personalization (>50%)
- Use engagement targeting (better quality)
```

### **Issue: Outscraper API Errors**
```
Solution:
- Check API key valid
- Verify not over quota
- Add retry logic with exponential backoff
- Cache results to avoid re-scraping
```

### **Issue: Claude API Expensive**
```
Solution:
- Only generate insights for Tier 1-2 prospects
- Cache insights (don't regenerate)
- Use Groq for content classification (free)
- Batch API calls where possible
```

---

## 🎉 **YOU'RE READY TO BUILD!**

### **Start Now**:

1. **Open Cursor**
2. **Create new project: `geospark-sales-machine`**
3. **Follow Day 1 instructions**
4. **Use the prompts provided for each module**
5. **Test as you build**
6. **Launch soft test in 7 days**

### **Questions While Building?**

Come back and ask specific questions like:
- "My Instagram scraper is getting rate limited - help?"
- "How should I structure the email personalization calculation?"
- "The scoring algorithm isn't working as expected - debug?"

---

## 📋 **FINAL CHECKLIST BEFORE LAUNCH**

```
✅ All API keys configured and tested
✅ Database schema created and verified
✅ All modules built and unit tested
✅ End-to-end test passed with 10 prospects
✅ Emails generated and manually reviewed (quality check)
✅ Domain warmup at day 14+ (minimum)
✅ Instantly AI campaigns configured
✅ Logging working and files rotating
✅ Error handling tested
✅ First 50 prospects scraped successfully
✅ Ready to send first batch

🚀 LAUNCH!
```

---

**This is your complete build guide. Start with Day 1 and work through systematically. Cursor + Claude Opus 4.6 will help you build each module. You've got this!** 💪

