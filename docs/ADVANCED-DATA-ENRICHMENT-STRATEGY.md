# Advanced Data Enrichment & Email Finding Strategy
## No Guessing - Only Verified Data & Multi-Platform Intelligence

**Date**: February 20, 2026  
**Focus**: Solid email finding + Rich multi-platform data collection  
**Philosophy**: Quality over quantity, verified over guessed

---

## 🎯 **PART 1: SOLID EMAIL FINDING STRATEGIES (NO GUESSING)**

### **The Problem with Email "Guessing"**:

```
firstname@domain.com attempts:
├─ john@salon.com ❌ Bounces (no John)
├─ sarah@salon.com ✅ Works! (but lucky guess)
├─ mike@salon.com ❌ Bounces
└─ 33% success rate = wasteful + damages sender reputation
```

**Better approach**: Verify BEFORE adding to database

---

### **METHOD 1: Website Deep Extraction (FREE - 60-70% success)**

**Strategy**: Extract ALL possible emails from their entire website

```python
def extract_all_emails_from_website(website_url):
    """
    Deep crawl entire website for email addresses
    """
    
    found_emails = []
    
    # Pages to check (in priority order)
    pages_to_crawl = [
        '/',                    # Homepage
        '/contact',            # Contact page
        '/contact-us',
        '/about',              # About page
        '/about-us',
        '/team',               # Team page
        '/staff',
        '/book',               # Booking page
        '/appointments',
        '/footer-links',       # Footer often has emails
        '/privacy',            # Privacy policy (contact email)
        '/terms',
    ]
    
    # Also check: Sitemap.xml for all pages
    sitemap_pages = get_sitemap_pages(website_url)
    pages_to_crawl.extend(sitemap_pages)
    
    for page in pages_to_crawl:
        try:
            html = requests.get(f"{website_url}{page}").text
            
            # Extract emails using multiple methods
            emails = extract_emails_from_html(html)
            found_emails.extend(emails)
            
        except:
            continue
    
    # Deduplicate
    found_emails = list(set(found_emails))
    
    # Filter out generic emails (info@, contact@, etc)
    personal_emails = [e for e in found_emails if is_personal_email(e)]
    
    return {
        "all_emails": found_emails,
        "personal_emails": personal_emails,
        "generic_emails": [e for e in found_emails if not is_personal_email(e)]
    }

def extract_emails_from_html(html):
    """
    Multiple extraction methods
    """
    emails = []
    
    # Method 1: mailto: links
    mailto_pattern = r'mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})'
    emails.extend(re.findall(mailto_pattern, html))
    
    # Method 2: Plain text emails
    email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    emails.extend(re.findall(email_pattern, html))
    
    # Method 3: Obfuscated emails (name [at] domain [dot] com)
    obfuscated = re.findall(r'(\w+)\s*\[at\]\s*(\w+)\s*\[dot\]\s*(\w+)', html)
    emails.extend([f"{name}@{domain}.{tld}" for name, domain, tld in obfuscated])
    
    # Method 4: JavaScript-encoded emails
    # Some sites encode emails in JavaScript to avoid scrapers
    js_emails = extract_from_javascript(html)
    emails.extend(js_emails)
    
    return emails
```

**Success Rate**: 60-70% of businesses with websites have email on site

---

### **METHOD 2: Social Media Bio Extraction (FREE - 40-50% success)**

**Strategy**: Many businesses put email in social media bios

```python
def extract_email_from_social_profiles(business):
    """
    Check all social profiles for email
    """
    
    sources = []
    
    # Instagram bio
    if business.instagram:
        ig_bio = get_instagram_bio(business.instagram)
        ig_email = extract_email_from_text(ig_bio)
        if ig_email:
            sources.append({
                "email": ig_email,
                "source": "instagram_bio",
                "confidence": "high"
            })
    
    # Facebook about section
    if business.facebook:
        fb_about = get_facebook_about(business.facebook)
        fb_email = extract_email_from_text(fb_about)
        if fb_email:
            sources.append({
                "email": fb_email,
                "source": "facebook_about",
                "confidence": "high"
            })
    
    # LinkedIn company page
    if business.linkedin:
        li_contact = get_linkedin_contact(business.linkedin)
        li_email = extract_email_from_text(li_contact)
        if li_email:
            sources.append({
                "email": li_email,
                "source": "linkedin_contact",
                "confidence": "high"
            })
    
    # TikTok bio
    if business.tiktok:
        tt_bio = get_tiktok_bio(business.tiktok)
        tt_email = extract_email_from_text(tt_bio)
        if tt_email:
            sources.append({
                "email": tt_email,
                "source": "tiktok_bio",
                "confidence": "high"
            })
    
    # Return highest confidence source
    return sources[0] if sources else None
```

**Why This Works**:
- Businesses WANT to be contacted
- They put email where customers can find it
- No guessing involved

---

### **METHOD 3: WHOIS Domain Lookup (FREE - 20-30% success)**

**Strategy**: Domain registration records often contain contact email

```python
import whois

def get_email_from_domain_whois(domain):
    """
    Extract email from WHOIS records
    """
    try:
        w = whois.whois(domain)
        
        # WHOIS can return multiple emails
        emails = []
        
        if w.emails:
            if isinstance(w.emails, list):
                emails = w.emails
            else:
                emails = [w.emails]
        
        # Filter out privacy protection emails
        valid_emails = [
            e for e in emails 
            if not any(privacy in e.lower() for privacy in [
                'privacy', 'whoisguard', 'proxy', 'protection'
            ])
        ]
        
        return {
            "emails": valid_emails,
            "confidence": "medium"  # WHOIS can be outdated
        }
    
    except:
        return None
```

**Limitations**: 
- Many domains use privacy protection
- But worth checking (FREE)

---

### **METHOD 4: Hunter.io API Alternative - Snov.io + RocketReach (Mixed FREE/Paid)**

**Strategy**: Use multiple free tiers to maximize coverage

```python
def find_email_multi_service(business_name, domain):
    """
    Try multiple services, use free tiers
    """
    
    services = {
        "snov.io": {
            "free_tier": 50,  # 50 searches/month
            "api": SnovAPI(),
        },
        "rocketreach": {
            "free_tier": 5,   # 5 lookups/month
            "api": RocketReachAPI(),
        },
        "apollo.io": {
            "free_tier": 50,  # 50 searches/month
            "api": ApolloAPI(),
        },
        "clearbit": {
            "free_tier": 50,  # 50 lookups/month (reveals API)
            "api": ClearbitAPI(),
        }
    }
    
    # Try each service until we find email
    for service_name, config in services.items():
        
        # Check if we've hit free tier limit this month
        if not check_free_tier_available(service_name, config['free_tier']):
            continue
        
        try:
            result = config['api'].find_email(business_name, domain)
            
            if result and result['email']:
                log_free_tier_usage(service_name)
                
                return {
                    "email": result['email'],
                    "source": service_name,
                    "confidence": result.get('confidence', 'medium'),
                    "cost": 0  # Free tier
                }
        except:
            continue
    
    return None

# Combined free tier capacity:
# Snov: 50 + RocketReach: 5 + Apollo: 50 + Clearbit: 50 = 155 free emails/month
```

---

### **METHOD 5: LinkedIn Sales Navigator Scraping (Paid but Worth It)**

**Strategy**: LinkedIn has the most accurate B2B emails

```python
def linkedin_company_employee_emails(company_name):
    """
    Find employees of company on LinkedIn, get their emails
    """
    
    # PhantomBuster can automate this (has free tier)
    # Or: Manual LinkedIn scraping with playwright
    
    employees = search_linkedin_employees(
        company=company_name,
        titles=["Owner", "Manager", "Director", "Founder"]
    )
    
    # LinkedIn shows emails for some profiles
    # Or: Use email patterns from found employees
    
    emails = []
    for employee in employees:
        if employee.email:
            emails.append({
                "email": employee.email,
                "name": employee.name,
                "title": employee.title,
                "confidence": "high",
                "source": "linkedin"
            })
    
    return emails
```

**Cost**: PhantomBuster free tier (14-day trial) or $30/month

---

### **METHOD 6: Google Search Email Discovery (FREE - 30-40% success)**

**Strategy**: Google often indexes emails that appear on other sites

```python
def google_search_for_email(business_name, city):
    """
    Google search for business email mentions
    """
    
    queries = [
        f'"{business_name}" {city} email',
        f'"{business_name}" contact',
        f'"{business_name}" @',
        f'site:facebook.com "{business_name}" {city}',
        f'site:instagram.com "{business_name}"',
    ]
    
    found_emails = []
    
    for query in queries:
        # Use SerpAPI (has free tier: 100 searches/month)
        results = serpapi_search(query)
        
        for result in results:
            # Extract emails from snippets
            snippet_emails = extract_emails_from_text(result['snippet'])
            found_emails.extend(snippet_emails)
    
    # Deduplicate and verify
    found_emails = list(set(found_emails))
    
    return found_emails
```

**Cost**: SerpAPI free tier (100 searches/month)

---

### **METHOD 7: Yellow Pages / Business Directories (FREE)**

**Strategy**: Old school but effective - directories often list emails

```python
def scrape_business_directories(business_name, city):
    """
    Check multiple business directories
    """
    
    directories = [
        "yellowpages.com",
        "yelp.com",
        "citysearch.com",
        "manta.com",
        "bbb.org",  # Better Business Bureau
        "chamberofcommerce.com",
    ]
    
    emails = []
    
    for directory in directories:
        try:
            # Search directory for business
            listing = search_directory(directory, business_name, city)
            
            if listing:
                # Extract email from listing
                listing_email = extract_email_from_listing(listing)
                
                if listing_email:
                    emails.append({
                        "email": listing_email,
                        "source": directory,
                        "confidence": "medium"
                    })
        except:
            continue
    
    return emails
```

---

### **COMPREHENSIVE EMAIL FINDING WATERFALL**

**Strategy**: Try methods in order until email found

```python
def find_email_comprehensive(business):
    """
    Waterfall approach - try each method until success
    """
    
    methods = [
        # FREE methods first (ordered by success rate)
        ("website_deep_crawl", extract_all_emails_from_website),       # 60-70%
        ("social_media_bios", extract_email_from_social_profiles),     # 40-50%
        ("google_search", google_search_for_email),                    # 30-40%
        ("whois_lookup", get_email_from_domain_whois),                 # 20-30%
        ("business_directories", scrape_business_directories),         # 20-30%
        
        # FREE TIER APIs (limited but free)
        ("free_tier_apis", find_email_multi_service),                  # 155/month free
        
        # PAID methods (only if free methods fail)
        ("hunter_io_paid", hunter_io_search),                          # $0.10 per email
        ("rocketreach_paid", rocketreach_search),                      # $0.15 per email
    ]
    
    for method_name, method_func in methods:
        try:
            result = method_func(business)
            
            if result and result.get('email'):
                
                # CRITICAL: Verify email before saving
                if verify_email_smtp(result['email']):
                    return {
                        "email": result['email'],
                        "source": method_name,
                        "confidence": result.get('confidence', 'medium'),
                        "verified": True
                    }
        except:
            continue
    
    # No email found with any method
    return None
```

**Expected Results**:
```
100 businesses:
├─ 65 found via FREE methods
├─ 10 found via FREE tier APIs
├─ 20 found via PAID methods ($2-3 cost)
└─ 5 no email found

Total cost: $2-3 for 100 businesses (vs $49/month for Hunter.io)
Success rate: 95% (vs guessing: 33%)
```

---

## 🌐 **PART 2: MULTI-PLATFORM DATA COLLECTION (BEYOND INSTAGRAM)**

### **The Problem with Instagram-Only**:

```
Businesses use different platforms:
├─ Salon: Instagram (90%), Facebook (70%), TikTok (20%)
├─ Restaurant: Instagram (85%), Facebook (80%), Yelp (95%)
├─ Plumber: Facebook (60%), Google Business (90%), Yelp (70%)
├─ Gym: Instagram (95%), TikTok (50%), Facebook (60%)
└─ If we only check Instagram, we miss 10-40% of businesses
```

---

### **COMPREHENSIVE PLATFORM MATRIX**

```python
PLATFORM_PRIORITY = {
    "Hair Salon": {
        "must_have": ["instagram", "google_business", "facebook"],
        "should_have": ["tiktok", "yelp"],
        "nice_to_have": ["pinterest", "youtube"]
    },
    "Restaurant": {
        "must_have": ["google_business", "yelp", "instagram"],
        "should_have": ["facebook", "doordash", "ubereats"],
        "nice_to_have": ["tiktok", "youtube"]
    },
    "Plumber": {
        "must_have": ["google_business", "yelp", "facebook"],
        "should_have": ["nextdoor", "angi", "thumbtack"],
        "nice_to_have": ["instagram", "youtube"]
    },
    "Gym": {
        "must_have": ["instagram", "google_business", "facebook"],
        "should_have": ["tiktok", "youtube"],
        "nice_to_have": ["linkedin"]
    }
}
```

---

### **PLATFORM 1: GOOGLE BUSINESS PROFILE (Must Have - 95% have this)**

**Why Critical**: 
- Every local business should have one
- Shows up in Google Maps
- Contains reviews, hours, photos, posts

**Data to Collect**:
```python
google_business_data = {
    # Basic Info
    "place_id": str,              # Unique identifier
    "business_name": str,
    "category": str,              # Primary category
    "categories_all": list,       # All categories
    "address": str,
    "city": str,
    "state": str,
    "zip": str,
    "phone": str,
    "website": str,
    "email": str,                 # Sometimes available
    
    # Reputation Metrics
    "reviews_count": int,
    "rating": float,
    "rating_distribution": {     # How many 1-star, 2-star, etc
        "5": int, "4": int, "3": int, "2": int, "1": int
    },
    
    # Activity Signals
    "posts_count_total": int,
    "posts_last_30_days": int,
    "posts_last_90_days": int,
    "last_post_date": date,
    
    # Photos
    "photos_count_total": int,
    "photos_by_owner": int,
    "photos_by_customers": int,
    "photos_last_30_days": int,   # Recent activity
    
    # Q&A
    "questions_count": int,
    "questions_answered": int,
    "answer_rate": float,         # % of questions answered
    
    # Recent Reviews (scrape text)
    "recent_reviews": [
        {
            "author": str,
            "rating": int,
            "text": str,
            "date": date,
            "owner_response": str,    # Did they respond?
            "response_time_days": int
        }
    ],
    
    # Business Updates (signals)
    "ownership_changed": bool,     # Recent ownership change
    "description_updated": date,
    "hours_updated": date,
    
    # Hours
    "hours": dict,                # Open hours
    "currently_open": bool,
    
    # Attributes
    "wheelchair_accessible": bool,
    "outdoor_seating": bool,
    # ... all other attributes
    
    # Insights (if available - requires ownership)
    "monthly_searches": int,      # How many people search for them
    "monthly_calls": int,
    "monthly_direction_requests": int,
}
```

**Scraping Method**: Apify free tier or custom Playwright scraper

---

### **PLATFORM 2: FACEBOOK BUSINESS PAGES (Should Have - 70-80%)**

**Why Important**:
- Older demographics
- Different content strategy than Instagram
- Often more engagement for local businesses

**Data to Collect**:
```python
facebook_data = {
    # Page Info
    "page_id": str,
    "page_name": str,
    "page_url": str,
    "username": str,
    "category": str,
    "about": str,                 # May contain email/phone
    
    # Metrics
    "likes": int,
    "followers": int,
    "checkins": int,              # People who checked in here
    "rating": float,
    "reviews_count": int,
    
    # Activity
    "posts_last_30_days": int,
    "posts_last_90_days": int,
    "last_post_date": date,
    
    # Recent Posts
    "recent_posts": [
        {
            "post_text": str,
            "post_date": date,
            "likes": int,
            "comments": int,
            "shares": int,
            "reactions_breakdown": dict,  # Like, Love, Haha, Wow, Sad, Angry
            "post_type": str              # Photo, Video, Link, Status
        }
    ],
    
    # Engagement
    "avg_likes": float,
    "avg_comments": float,
    "engagement_rate": float,
    
    # Content Analysis
    "video_posts_pct": float,
    "photo_posts_pct": float,
    "link_posts_pct": float,
    
    # Contact Info (from About section)
    "email_from_page": str,
    "phone_from_page": str,
    "website_from_page": str,
    
    # Special Features
    "has_shop": bool,             # Facebook Shop enabled
    "has_booking": bool,          # Booking feature
    "has_menu": bool,             # Restaurant menu
    
    # Reviews
    "recent_reviews": [
        {
            "author": str,
            "rating": int,
            "text": str,
            "date": date,
            "recommendation": bool    # "Recommends" or not
        }
    ]
}
```

**Scraping Method**: Playwright (requires login for some data)

---

### **PLATFORM 3: YELP (Must Have for Restaurants/Services - 80%)**

**Why Critical**:
- Primary review site
- Shows pricing tier ($ to $$$$)
- Has response rate metric

**Data to Collect**:
```python
yelp_data = {
    # Basic Info
    "business_id": str,
    "business_name": str,
    "url": str,
    
    # Pricing
    "price_range": str,           # $, $$, $$$, $$$$
    "price_tier": int,            # 1-4
    
    # Reputation
    "rating": float,
    "reviews_count": int,
    "rating_distribution": dict,
    
    # Activity
    "claimed": bool,              # Owner claimed listing
    "response_rate": str,         # "Responds in X hours"
    "responds_to_reviews": bool,
    
    # Photos
    "photos_count": int,
    "photos_by_owner": int,
    
    # Reviews
    "recent_reviews": [
        {
            "author": str,
            "rating": int,
            "text": str,
            "date": date,
            "useful": int,            # Votes
            "funny": int,
            "cool": int,
            "elite_reviewer": bool    # Elite Yelp reviewer
        }
    ],
    
    # Sentiment Analysis on Reviews
    "positive_keywords": list,    # Common positive mentions
    "negative_keywords": list,    # Common complaints
    "mentions_marketing": int,    # Reviews mentioning visibility/marketing
    
    # Business Features
    "amenities": list,
    "attributes": list,
    "categories": list,
    
    # Special Badges
    "yelp_guaranteed": bool,
    "women_owned": bool,
    "black_owned": bool,
}
```

**Scraping Method**: BeautifulSoup web scraping

---

### **PLATFORM 4: TIKTOK (Growing - 20-50% depending on category)**

**Why Important**:
- Fastest growing platform
- Video content strategy
- Younger demographic reach

**Data to Collect**:
```python
tiktok_data = {
    # Profile
    "username": str,
    "display_name": str,
    "bio": str,
    "profile_url": str,
    
    # Metrics
    "followers": int,
    "following": int,
    "likes_total": int,           # Total likes across all videos
    "videos_count": int,
    
    # Activity
    "videos_last_30_days": int,
    "videos_last_90_days": int,
    "last_video_date": date,
    
    # Recent Videos
    "recent_videos": [
        {
            "video_id": str,
            "description": str,
            "date": date,
            "views": int,
            "likes": int,
            "comments": int,
            "shares": int,
            "duration_seconds": int,
            "hashtags": list,
            "sounds_used": str
        }
    ],
    
    # Engagement
    "avg_views": float,
    "avg_likes": float,
    "engagement_rate": float,     # (Likes + Comments) / Views
    
    # Content Strategy
    "uses_trending_sounds": bool,
    "uses_trending_hashtags": bool,
    "video_length_avg": int,
    
    # Virality Indicators
    "viral_videos": int,          # Videos with >10K views
    "viral_rate": float,          # % of videos that go viral
}
```

**Scraping Method**: TikTok-Scraper library or Apify

---

### **PLATFORM 5: YOUTUBE (Nice to Have - 10-30%)**

**Why Useful**:
- Video content library
- SEO for business name searches
- Shows investment in content

**Data to Collect**:
```python
youtube_data = {
    # Channel
    "channel_id": str,
    "channel_name": str,
    "channel_url": str,
    "description": str,
    
    # Metrics
    "subscribers": int,
    "videos_count": int,
    "views_total": int,
    
    # Activity
    "videos_last_30_days": int,
    "videos_last_90_days": int,
    "last_video_date": date,
    
    # Recent Videos
    "recent_videos": [
        {
            "title": str,
            "date": date,
            "views": int,
            "likes": int,
            "comments": int,
            "duration_seconds": int,
            "description": str
        }
    ],
    
    # Content Type
    "tutorial_videos": int,
    "behind_scenes_videos": int,
    "promotional_videos": int,
    
    # Engagement
    "avg_views": float,
    "subscriber_engagement": float,  # Views / Subscribers
}
```

**Scraping Method**: YouTube Data API (has generous free tier)

---

### **PLATFORM 6: LINKEDIN COMPANY PAGES (Should Have for B2B - 30-50%)**

**Why Important**:
- Shows company size
- Shows if they're hiring (growth signal)
- Employee count trends

**Data to Collect**:
```python
linkedin_data = {
    # Company
    "company_id": str,
    "company_name": str,
    "company_url": str,
    "description": str,
    
    # Size
    "employee_count": str,        # "11-50 employees"
    "employee_count_min": int,
    "employee_count_max": int,
    
    # Growth Signals
    "job_postings_count": int,    # Currently hiring
    "recent_job_posts": list,
    "employee_growth_6mo": float, # % growth
    
    # Activity
    "posts_last_30_days": int,
    "followers": int,
    
    # Employees
    "key_employees": [
        {
            "name": str,
            "title": str,
            "linkedin_url": str
        }
    ]
}
```

**Scraping Method**: PhantomBuster or manual scraping

---

### **PLATFORM 7: NEXTDOOR (Hyper-Local - 10-20%)**

**Why Unique**:
- Neighborhood-specific
- Few businesses use it well
- Few competitors scrape it = unique data

**Data to Collect**:
```python
nextdoor_data = {
    # Business
    "business_name": str,
    "neighborhoods_served": list,
    
    # Reputation
    "recommendations": int,
    "recent_recommendations": [
        {
            "author": str,
            "text": str,
            "date": date
        }
    ],
    
    # Activity
    "posts_last_30_days": int,
    "last_post_date": date,
    
    # Engagement
    "avg_replies": float,
}
```

**Scraping Method**: Playwright (requires account)

---

### **PLATFORM 8: REVIEW/DIRECTORY SITES**

**Additional Sources**:

```python
additional_sources = {
    "Better Business Bureau (bbb.org)": {
        "rating": str,              # A+ to F
        "accredited": bool,
        "complaints_count": int,
        "years_in_business": int
    },
    
    "Angi (angi.com) [formerly Angie's List]": {
        "rating": float,
        "reviews_count": int,
        "badges": list              # "Top Rated", "Elite Service"
    },
    
    "Thumbtack": {
        "rating": float,
        "hires": int,               # Number of customers hired them
        "response_rate": str,
        "response_time": str
    },
    
    "HomeAdvisor": {
        "rating": float,
        "reviews_count": int,
        "screened": bool,
        "badges": list
    },
    
    "OpenTable (restaurants)": {
        "rating": float,
        "reviews_count": int,
        "bookings_count": int,
        "avg_wait_time": int
    },
    
    "TripAdvisor (restaurants/hotels)": {
        "rating": float,
        "reviews_count": int,
        "ranking_in_city": int,     # "#5 of 200 restaurants in Denver"
        "certificate_of_excellence": bool
    }
}
```

---

## 🎯 **PART 3: COMPLETE ENRICHMENT STRATEGY**

### **Tiered Enrichment Approach**:

```python
def enrich_prospect_comprehensive(business):
    """
    Complete multi-platform enrichment
    """
    
    enriched_data = {
        "business_id": business.id,
        "enrichment_timestamp": datetime.now(),
        "enrichment_version": "v2_multiplatform"
    }
    
    # === TIER 1: Core Data (Always Collect) ===
    
    # Google Business (95% have this)
    enriched_data['google_business'] = scrape_google_business(business)
    
    # Instagram (if exists - check from GBP or website)
    if business.instagram or find_instagram_from_google(business):
        enriched_data['instagram'] = scrape_instagram_comprehensive(business)
    
    # Email (waterfall approach - no guessing)
    enriched_data['email'] = find_email_comprehensive(business)
    
    # === TIER 2: Category-Specific Platforms ===
    
    category_platforms = PLATFORM_PRIORITY.get(business.category, {})
    
    # Must-have platforms for this category
    for platform in category_platforms.get('must_have', []):
        if platform not in enriched_data:
            enriched_data[platform] = scrape_platform(platform, business)
    
    # Should-have platforms
    for platform in category_platforms.get('should_have', []):
        try:
            enriched_data[platform] = scrape_platform(platform, business)
        except:
            pass  # Not critical if fails
    
    # === TIER 3: Cross-Platform Analysis ===
    
    enriched_data['cross_platform_analysis'] = analyze_cross_platform(enriched_data)
    
    # === TIER 4: Competitive Intelligence ===
    
    enriched_data['competitors'] = find_and_analyze_competitors(business, enriched_data)
    
    return enriched_data


def analyze_cross_platform(data):
    """
    Analyze patterns across all platforms
    """
    
    analysis = {
        # Activity Consistency
        "platform_activity": {
            "instagram_active": data.get('instagram', {}).get('posts_last_30_days', 0) > 4,
            "facebook_active": data.get('facebook', {}).get('posts_last_30_days', 0) > 4,
            "tiktok_active": data.get('tiktok', {}).get('videos_last_30_days', 0) > 4,
            "youtube_active": data.get('youtube', {}).get('videos_last_30_days', 0) > 1,
        },
        
        # Platform Preference
        "most_active_platform": get_most_active_platform(data),
        "least_active_platform": get_least_active_platform(data),
        "abandoned_platforms": get_abandoned_platforms(data),
        
        # Content Strategy
        "content_types": {
            "photo_heavy": is_photo_focused(data),
            "video_heavy": is_video_focused(data),
            "text_heavy": is_text_focused(data)
        },
        
        # Audience Size
        "total_followers": sum_all_followers(data),
        "follower_distribution": get_follower_distribution(data),
        
        # Reputation Aggregated
        "avg_rating_all_platforms": calculate_avg_rating(data),
        "total_reviews_all_platforms": sum_all_reviews(data),
        
        # Gaps & Opportunities
        "missing_platforms": identify_missing_platforms(data),
        "underutilized_platforms": identify_underutilized(data),
    }
    
    return analysis
```

---

## 📊 **PART 4: ENRICHED DATA STRUCTURE**

### **Complete Prospect Record After Full Enrichment**:

```python
complete_prospect = {
    # === CORE DATA ===
    "business_id": "uuid",
    "business_name": "Sarah's Salon & Spa",
    "category": "Hair Salon",
    "location": {
        "address": "123 Main St",
        "city": "Denver",
        "state": "CO",
        "zip": "80202"
    },
    
    # === CONTACT DATA (Verified, No Guessing) ===
    "contact": {
        "email": "sarah@sarahssalon.com",
        "email_source": "website_contact_page",
        "email_confidence": "high",
        "email_verified": True,
        "phone": "303-555-0123",
        "website": "sarahssalon.com"
    },
    
    # === PLATFORM DATA ===
    "platforms": {
        "google_business": { /* 50+ fields */ },
        "instagram": { /* 40+ fields */ },
        "facebook": { /* 35+ fields */ },
        "yelp": { /* 25+ fields */ },
        "tiktok": { /* 20+ fields */ },
        "youtube": { /* 15+ fields */ },
        "linkedin": { /* 10+ fields */ },
        "nextdoor": { /* 8+ fields */ }
    },
    
    # === CROSS-PLATFORM ANALYSIS ===
    "analysis": {
        "most_active_platform": "instagram",
        "abandoned_platforms": ["tiktok", "youtube"],
        "total_followers": 1847,
        "avg_rating": 4.65,
        "total_reviews": 143,
        "missing_platforms": ["linkedin", "nextdoor"]
    },
    
    # === COMPETITIVE INTELLIGENCE ===
    "competitors": [
        {
            "name": "Bloom Salon",
            "platforms": { /* competitor data */ },
            "gaps": { /* what they do better */ }
        }
        // 4 more competitors
    ],
    
    # === AI-GENERATED INSIGHTS ===
    "insights": [
        { /* 7-10 insights */ }
    ],
    
    # === SCORING ===
    "geospark_score": 87,
    "tier": "TIER 1",
    "score_breakdown": { /* 10 components */ },
    
    # === METADATA ===
    "scraped_date": "2026-02-20",
    "last_enriched": "2026-02-20",
    "enrichment_version": "v2_multiplatform",
    "data_completeness": 92  # % of fields populated
}
```

**Total Data Points**: 200-250 per prospect (vs 15 with Instagram-only)

---

## 💡 **RECOMMENDATIONS**

### **Email Finding** (NO GUESSING):
1. ✅ Website deep crawl (60-70% success, FREE)
2. ✅ Social media bio extraction (40-50% success, FREE)
3. ✅ Multi-service free tiers (155 emails/month FREE)
4. ✅ WHOIS + directories (20-30% success, FREE)
5. ✅ Google search (30-40% success, FREE with SerpAPI tier)
6. ✅ SMTP verification before saving (always verify)
7. ✅ Paid services ONLY for high-value prospects ($0.10-0.15 per email)

**Expected**: 90-95% email find rate with mostly FREE methods

---

### **Multi-Platform Data Collection**:
1. ✅ Always collect: Google Business, Instagram, Facebook, Yelp
2. ✅ Category-specific: Add TikTok for salons/gyms, Angi for services
3. ✅ Cross-platform analysis: Identify patterns and gaps
4. ✅ Competitive intelligence: Find 5 competitors across all platforms

**Expected**: 200-250 data points per prospect (vs 15 with Instagram-only)

---

## 🚀 **NEXT STEPS**

**Should I create**:
1. Complete scraping code for all 8+ platforms
2. Email finding waterfall implementation
3. Cross-platform analysis algorithms
4. Supabase schema updated for multi-platform data

**Or do you want to discuss/refine the strategy more?**

