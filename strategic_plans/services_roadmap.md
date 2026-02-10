# LocalContent.ai - Services Roadmap
## Updated January 2026

---

## Service Categories

### Core Services (Currently Planned)
- AI Content Generation
- Template Management
- A/B Testing
- Keyword Integration
- ReviewMiner
- Competitor Intelligence
- ROI Tracking
- Multi-language SEO

### New Services (From Gap Analysis)
See prioritization below.

---

## Priority Matrix

### P0 - Critical (Must Have for Launch/Retention)

| Service | Description | Business Impact | Dev Effort |
|---------|-------------|-----------------|------------|
| **Impact Analytics Dashboard** | Before/after metrics with growth visualization | -30% churn | 8 weeks |

### P1 - High Priority (Launch Within Q1)

| Service | Description | Business Impact | Dev Effort |
|---------|-------------|-----------------|------------|
| **Google Business Post Automation** | Auto-post to GMB weekly | +15% ARPU, key differentiator | 2 weeks |
| **Auto Review Responder** | AI-generated review responses | +20% ARPU, daily touchpoint | 3 weeks |
| **Photo-to-Post** | Upload photo → AI writes caption | +10% conversion, zero friction | 2 weeks |

### P2 - Medium Priority (Q2)

| Service | Description | Business Impact | Dev Effort |
|---------|-------------|-----------------|------------|
| **Competitor Alert System** | Notifications when competitors post | -5% churn, sticky feature | 3 weeks |
| **Local Event Calendar Sync** | Auto-content around local events | Differentiation | 4 weeks |
| **Voice-to-Content** | 60-sec voice note → week of content | Zero friction input | 3 weeks |
| **Content Recycler** | Evergreen posts auto-reshared | Consistent presence | 2 weeks |

### P3 - Lower Priority (Q3-Q4)

| Service | Description | Business Impact | Dev Effort |
|---------|-------------|-----------------|------------|
| **Crisis Content Kit** | Pre-written crisis responses | Peace of mind | 1 week |
| **Employee Advocacy Content** | Staff sharing templates | 8x engagement | 2 weeks |
| **Local Partnership Matchmaker** | Cross-promotion suggestions | Network effects | 4 weeks |
| **Testimonial Request Automation** | Systematic review collection | More reviews | 2 weeks |
| **Local Influencer Identifier** | Find micro-influencers nearby | Partnership opps | 3 weeks |
| **"Slow Day" Emergency Content** | Push notifications for quiet days | Reactive marketing | 2 weeks |

---

## Detailed Service Specifications

### 1. Impact Analytics Dashboard (P0)

**See separate implementation plan:** `impact_analytics_impl_plan.md`

**Key Features:**
- Baseline metric capture at signup
- Before/after comparison view
- Growth trend charts
- Shareable monthly reports
- Competitive benchmarking
- "What if you stop" calculator

---

### 2. Google Business Post Automation (P1)

**Integration strategy (locked in):** GMB = **direct** (own OAuth + API). Social (FB, IG, LinkedIn, X, etc.) = **Late API** (getlate.dev) as aggregator. See `docs/SOCIAL_AGGREGATOR_CHOICE.md`.

**Problem Solved:** GMB is the most neglected channel. 67% of local businesses never post to GMB.

**Features:**
- Auto-schedule GMB posts from generated content (direct GMB API)
- Weekly posting cadence (configurable)
- Post types: Updates, Offers, Events, Products
- Image attachment from content library
- Performance tracking (views, clicks) via GMB insights
- Social posting via Late API (one integration for all social channels)

**Technical Requirements:**
- Google Business Profile API (direct) — connect/post/insights per business
- Late API for social: create Social Set per business, post/schedule via Late REST API
- Post scheduling system; image upload handling

**Files (GeoSpark repo):**
```
app/api/integrations/gmb/     # connect, callback (done); post, insights (to build)
app/dashboard/gmb-automation/ # optional: schedule UI
app/api/integrations/         # list integrations; later: Late connect + post
lib/google-business.ts       # GMB API wrapper (done)
```

---

### 3. Auto Review Responder (P1)

**Problem Solved:** 66% of reviews go unanswered. Responding increases return visits by 12%.

**Features:**
- Pull reviews from Google/Yelp automatically
- Generate on-brand response suggestions
- One-click approval and posting
- Tone customization (professional, friendly, apologetic)
- Negative review escalation alerts
- Response templates library

**Technical Requirements:**
- Google Business Profile API (reviews endpoint)
- Yelp Fusion API
- LLM integration for response generation
- Notification system

**Files to Create:**
```
web/app/review-responder/
├── page.tsx           # Review inbox
├── components/
│   ├── ReviewCard.tsx
│   ├── ResponseGenerator.tsx
│   ├── ToneSelector.tsx
│   └── ResponseTemplates.tsx
pages/api/reviews/
├── fetch.ts           # Pull reviews
├── generate-response.ts
├── post-response.ts
└── templates.ts
scripts/
└── review_response_generator.py
```

---

### 4. Photo-to-Post (P1)

**Problem Solved:** Contractors, restaurants, retailers have PHOTOS but no time to write captions.

**Features:**
- Upload photo from phone/desktop
- AI analyzes image content
- Generates caption, hashtags, and post text
- Suggests best platforms for the image
- Optional before/after comparison mode
- Batch upload support

**Technical Requirements:**
- Image upload handling (Vercel Blob or similar)
- Vision AI for image analysis (OpenAI Vision or Google Vision)
- LLM for caption generation
- Mobile-optimized upload interface

**Files to Create:**
```
web/app/photo-to-post/
├── page.tsx           # Upload interface
├── components/
│   ├── PhotoUploader.tsx
│   ├── ImagePreview.tsx
│   ├── CaptionEditor.tsx
│   └── PlatformSelector.tsx
pages/api/photo/
├── upload.ts          # Handle upload
├── analyze.ts         # Vision AI analysis
├── generate-caption.ts
└── post.ts            # Distribute to platforms
lib/ai/
└── image-analyzer.ts
```

---

### 5. Competitor Alert System (P2)

**Problem Solved:** Business owners don't know what competitors are doing.

**Features:**
- Monitor competitor GMB profiles
- Track competitor social media posting
- Alert when competitor posts
- Suggest counter-content
- Weekly competitor activity summary
- Competitor content gap identification

**Technical Requirements:**
- Web scraping for public GMB data
- Social media API integrations
- Notification system (email, push, in-app)
- Scheduled monitoring jobs

**Files to Create:**
```
web/app/competitor-alerts/
├── page.tsx           # Competitor dashboard
├── settings/
│   └── page.tsx       # Alert preferences
├── components/
│   ├── CompetitorList.tsx
│   ├── AlertFeed.tsx
│   ├── CounterContentSuggestion.tsx
│   └── WeeklySummary.tsx
pages/api/competitors/
├── monitor.ts         # Track competitor
├── fetch-activity.ts
├── alerts.ts
└── suggest-counter.ts
scripts/
├── competitor_monitor.py
└── competitor_scraper.py
```

---

### 6. Local Event Calendar Sync (P2)

**Problem Solved:** Businesses miss local events that could drive traffic.

**Features:**
- Integrate with local event sources (city calendars, Eventbrite, Facebook Events)
- Auto-suggest content around upcoming events
- Pre-generate event-related posts
- Weather-triggered content suggestions
- Holiday and seasonal content automation

**Technical Requirements:**
- Event data aggregation (multiple sources)
- Weather API integration
- Content scheduling tied to events
- Location-based event filtering

**Files to Create:**
```
web/app/local-events/
├── page.tsx           # Event calendar view
├── components/
│   ├── EventCalendar.tsx
│   ├── EventCard.tsx
│   ├── ContentSuggestion.tsx
│   └── WeatherWidget.tsx
pages/api/events/
├── fetch-local.ts
├── weather.ts
├── suggest-content.ts
└── schedule.ts
lib/
└── event-aggregator.ts
scripts/
└── event_scraper.py
```

---

### 7. Voice-to-Content (P2)

**Problem Solved:** Business owners are busy and can't type, but can talk.

**Features:**
- Record 60-second voice memo
- AI transcribes and extracts key points
- Generates week of content from single recording
- Edit and approve generated content
- Mobile-first design

**Technical Requirements:**
- Audio recording (browser API)
- Speech-to-text (Whisper API or Google Speech)
- LLM for content expansion
- Mobile-optimized UI

**Files to Create:**
```
web/app/voice-to-content/
├── page.tsx           # Recording interface
├── components/
│   ├── VoiceRecorder.tsx
│   ├── TranscriptEditor.tsx
│   ├── ContentExpander.tsx
│   └── WeeklyContentPreview.tsx
pages/api/voice/
├── transcribe.ts
├── extract-topics.ts
└── generate-content.ts
lib/ai/
└── voice-processor.ts
```

---

### 8. Content Recycler (P2)

**Problem Solved:** Good content gets posted once and forgotten.

**Features:**
- Identify evergreen content in library
- Auto-schedule reposts at optimal intervals
- Slight variations to avoid duplicate content
- Seasonal recycling (bring back winter content in winter)
- Performance-based selection (recycle top performers)

**Technical Requirements:**
- Content tagging (evergreen vs. timely)
- Scheduling algorithm
- Content variation generator
- Performance tracking integration

**Files to Create:**
```
web/app/content-recycler/
├── page.tsx           # Recycling settings
├── components/
│   ├── EvergreenTagger.tsx
│   ├── RecycleSchedule.tsx
│   └── VariationPreview.tsx
pages/api/recycle/
├── identify-evergreen.ts
├── schedule.ts
└── generate-variation.ts
```

---

## Development Timeline

### Q1 2026 (Now - March)

| Month | Focus | Deliverables |
|-------|-------|--------------|
| **Feb** | P0 + P1 Start | Impact Analytics MVP, GMB Automation |
| **Mar** | P1 Complete | Review Responder, Photo-to-Post |

### Q2 2026 (April - June)

| Month | Focus | Deliverables |
|-------|-------|--------------|
| **Apr** | P2 Start | Competitor Alerts, Local Events |
| **May** | P2 Continue | Voice-to-Content, Content Recycler |
| **Jun** | Polish | Refinement, bug fixes, optimization |

### Q3-Q4 2026

- P3 features based on customer feedback
- Enterprise features
- Additional integrations
- International expansion features

---

## Resource Requirements

| Phase | Frontend Dev | Backend Dev | AI/ML | Design |
|-------|--------------|-------------|-------|--------|
| P0 (Analytics) | 2 weeks | 4 weeks | 1 week | 1 week |
| P1 (GMB, Reviews, Photo) | 3 weeks | 4 weeks | 2 weeks | 1 week |
| P2 (Alerts, Events, Voice) | 4 weeks | 5 weeks | 2 weeks | 2 weeks |

---

## Success Metrics by Service

| Service | Primary Metric | Target |
|---------|---------------|--------|
| Impact Analytics | Churn reduction | -30% |
| GMB Automation | ARPU increase | +15% |
| Review Responder | Response rate | >80% |
| Photo-to-Post | Content volume | +50% |
| Competitor Alerts | Feature stickiness | 60% weekly active |
| Local Events | Event-tied posts | 4/month avg |
| Voice-to-Content | Mobile usage | +40% |
| Content Recycler | Evergreen reuse | 30% of content |

---

*Document Created: January 28, 2026*
*Last Updated: January 28, 2026*
*Owner: Product*
