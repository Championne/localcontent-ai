# GeoSpark Sales System Documentation

## Overview

The GeoSpark Sales System is a comprehensive, scalable CRM designed for multi-language, multi-market cold email outreach with integrated phone calling capabilities.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        GEOSPARK SALES SYSTEM                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   MARKETS    │  │    AGENTS    │  │   ACCOUNTS   │              │
│  │              │  │              │  │              │              │
│  │ 🇺🇸 USA      │  │ Gert Jan     │  │ 9 accounts   │              │
│  │ 🇳🇱 Netherlands│  │ Agent 2     │  │ 3 domains    │              │
│  │ 🇪🇸 Spain    │  │ Agent 3     │  │ 360/day cap  │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
│         │                 │                 │                       │
│         └─────────────────┼─────────────────┘                       │
│                           │                                          │
│                    ┌──────▼───────┐                                 │
│                    │    LEADS     │                                 │
│                    │              │                                 │
│                    │ By Market    │                                 │
│                    │ By Industry  │                                 │
│                    │ With Scores  │                                 │
│                    └──────┬───────┘                                 │
│                           │                                          │
│         ┌─────────────────┼─────────────────┐                       │
│         │                 │                 │                       │
│  ┌──────▼───────┐  ┌──────▼───────┐  ┌──────▼───────┐              │
│  │   OUTREACH   │  │    CALLS     │  │    DEALS     │              │
│  │              │  │              │  │              │              │
│  │ Email seqs   │  │ Phone dialer │  │ Pipeline     │              │
│  │ Templates    │  │ Call scripts │  │ Proposals    │              │
│  │ Tracking     │  │ Recording    │  │ Contracts    │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                      │
│                    ┌──────────────┐                                 │
│                    │  INSTANTLY   │  ← External API                 │
│                    │   (Email)    │                                 │
│                    └──────────────┘                                 │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Core Concepts

### 1. Markets

A **Market** represents a geographic + language combination for targeting leads.

| Field | Description | Example |
|-------|-------------|---------|
| name | Display name | "USA (English)" |
| code | Unique identifier | "us-en" |
| language | ISO language code | "en" |
| countries | Array of ISO country codes | ["US"] |
| timezone | Primary timezone | "America/New_York" |
| currency | Local currency | "USD" |

**Why Markets?**
- Leads are organized by market
- Templates are written per market (language)
- Agents are assigned to markets they speak
- Email accounts are assigned to markets
- Sending happens in the market's timezone

### 2. Agents (Sales Team)

An **Agent** is a sales person (employee, partner, or freelancer) who works leads.

| Field | Description | Example |
|-------|-------------|---------|
| name | Agent name | "Gert Jan" |
| email | Login email | "gert@geospark.app" |
| role | Permission level | "admin" / "agent" / "partner" |
| languages | Languages they speak | ["en", "nl"] |
| markets | Markets they're assigned to | ["us-en", "nl-nl"] |
| email_accounts | Their sending accounts | [account_ids] |

**Agent Roles:**
- **Admin**: Full access, can manage other agents
- **Agent**: Employee with assigned markets
- **Partner**: External partner with limited access to their markets only

### 3. Email Accounts

An **Email Account** is a sending address connected to Instantly.ai.

| Field | Description | Example |
|-------|-------------|---------|
| email | Email address | "gert@localgrowthpro.co" |
| domain | Parent domain | "localgrowthpro.co" |
| agent_id | Owner agent | uuid |
| market_id | Assigned market | uuid |
| status | Account status | "warmup" / "limited" / "active" |
| created_at | When added | timestamp |
| warmup_started_at | Warmup start date | timestamp |
| daily_limit | Current safe limit | 40 |
| sent_today | Emails sent today | 18 |

**Account Maturity Phases:**

```
Day 1-14:   🔴 WARMUP     - 0 cold emails allowed (warmup only)
Day 15-21:  🟡 LIMITED    - 15 emails/day max
Day 22-35:  🟠 RAMPING    - 30 emails/day max  
Day 36+:    🟢 ACTIVE     - 50 emails/day max
```

### 4. Leads

A **Lead** is a potential customer being worked through the sales process.

| Field | Description | Example |
|-------|-------------|---------|
| business_name | Company name | "ABC Plumbing" |
| contact_name | Person's name | "John Smith" |
| email | Contact email | "john@abcplumbing.com" |
| phone | Phone number | "+1-555-123-4567" |
| market_id | Which market | uuid (USA English) |
| industry_id | Which industry | uuid (Plumbing) |
| score | Priority score | 75 |
| status | Pipeline stage | "contacted" |

### 5. Lead Scoring

Leads are automatically scored based on engagement and business signals.

**Engagement Signals (what they DO):**
| Action | Points |
|--------|--------|
| Email opened | +5 |
| Email opened 2+ times | +10 bonus |
| Link clicked | +15 |
| Email replied | +50 |
| Call answered | +40 |
| Demo booked | +100 |

**Business Signals (who they ARE):**
| Signal | Points | Why |
|--------|--------|-----|
| Google rating < 3.5 | +25 | They need help! |
| Google rating < 4.5 | +10 | Room for improvement |
| < 10 Google reviews | +20 | Need visibility |
| No website | +15 | Big opportunity |
| No social media | +20 | Content opportunity |
| Currently hiring | +15 | Growing business |

**Decay Signals (going cold):**
| Signal | Points |
|--------|--------|
| No contact in 7+ days | -5 |
| No contact in 30+ days | -20 |
| 3+ emails no reply | -10 |
| 5+ emails no reply | -25 |
| Email bounced | -50 |
| Unsubscribed | -100 |

**Temperature Ratings:**
| Score | Temperature | Action |
|-------|-------------|--------|
| 75+ | 🔥 Hot | Call immediately |
| 50-74 | 🟠 Warm | Call today |
| 25-49 | 🟡 Warming | Continue emails |
| 0-24 | 🔵 Cold | Email sequence |
| <0 | ❄️ Frozen | Low priority |

### 6. Email Templates

Templates are stored per market (language) and can include variables.

| Field | Description |
|-------|-------------|
| name | Template name |
| market_id | Which market/language |
| subject | Email subject line |
| body | Email body (with variables) |
| type | "cold_email" / "follow_up" / "breakup" |

**Available Variables:**
```
{{first_name}} - Contact's first name
{{company_name}} - Business name
{{city}} - City
{{state}} - State/Province
{{google_rating}} - Their Google rating
{{review_count}} - Number of reviews
{{industry}} - Their industry
{{sender_name}} - Your agent's name
```

### 7. Sequences

A **Sequence** is an automated series of emails + calls.

```
Example: "HVAC - USA - Review Focus"

Day 0:  📧 Email 1 - Value offer (free guide)
Day 2:  📧 Email 2 - Follow-up
Day 5:  📧 Email 3 - Different angle
Day 7:  📞 Call 1 - If score > 30
Day 9:  📧 Email 4 - Social proof
Day 12: 📞 Call 2 - If score > 40
Day 14: 📧 Email 5 - Breakup email
```

---

## Capacity Management

### Daily Sending Limits

The system automatically calculates daily capacity based on account maturity:

```
┌─────────────────────────────────────────────────────────────┐
│ DAILY CAPACITY CALCULATOR                                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Account: gert@localgrowthpro.co                             │
│ Age: 25 days                                                │
│ Phase: 🟠 RAMPING                                           │
│ Daily Limit: 30                                             │
│ Sent Today: 22                                              │
│ Remaining: 8                                                │
│                                                              │
│ Account: hello@localgrowthpro.co                            │
│ Age: 25 days                                                │
│ Phase: 🟠 RAMPING                                           │
│ Daily Limit: 30                                             │
│ Sent Today: 28                                              │
│ Remaining: 2                                                │
│                                                              │
│ ─────────────────────────────────────────────────────────── │
│ TOTAL CAPACITY: 60 | USED: 50 | REMAINING: 10              │
└─────────────────────────────────────────────────────────────┘
```

### Scaling Formula

```
Capacity = Number of Accounts × Daily Limit per Account

Examples:
- 9 accounts × 40/day = 360 emails/day
- 30 accounts × 40/day = 1,200 emails/day
- 100 accounts × 40/day = 4,000 emails/day
```

### Adding Capacity

To increase sending capacity:

1. **Buy new domain** (~$10/year)
2. **Create email accounts** (3 per domain recommended)
3. **Connect to Instantly**
4. **Enable warmup** (automatic)
5. **Wait 14 days**
6. **Assign to market/agent**

---

## Multi-Market Operations

### Market Setup Example

```
Market: USA (English)
├─ Language: en
├─ Countries: US
├─ Timezone: America/New_York
├─ Agents: Gert Jan, Sarah
├─ Accounts: 9 (360/day capacity)
├─ Templates: 12 (3 sequences × 4 emails)
└─ Leads: 1,247

Market: Netherlands (Dutch)
├─ Language: nl
├─ Countries: NL, BE
├─ Timezone: Europe/Amsterdam
├─ Agents: Gert Jan
├─ Accounts: 3 (120/day capacity)
├─ Templates: 12 (translated)
└─ Leads: 89

Market: Spain (Spanish)
├─ Language: es
├─ Countries: ES
├─ Timezone: Europe/Madrid
├─ Agents: Maria
├─ Accounts: 6 (240/day capacity)
├─ Templates: 12 (translated)
└─ Leads: 0 (not started)
```

### Sending in Correct Timezone

Emails are scheduled based on the lead's market timezone:
- USA leads: Sent 8am-5pm EST
- Dutch leads: Sent 8am-5pm CET
- Spanish leads: Sent 8am-5pm CET

---

## Data Flow

### Lead Journey

```
1. IMPORT
   └─ CSV upload or manual entry
   └─ Assign to market (auto-detects from country if possible)
   └─ Assign to industry
   └─ Initial score calculated

2. OUTREACH (Cold Email)
   └─ Added to sequence
   └─ Pushed to Instantly.ai
   └─ Emails sent automatically
   └─ Opens/clicks/replies tracked via webhook
   └─ Score updated on each event

3. QUALIFICATION
   └─ Reply received → Score boost
   └─ Agent reviews reply
   └─ Mark as "interested" or "not interested"

4. CONVERSION
   └─ Interested lead → Convert to Sales Lead
   └─ Full history preserved
   └─ Enters call/demo pipeline

5. SALES
   └─ Phone calls scheduled
   └─ Demo conducted
   └─ Proposal sent
   └─ Contract negotiated
   └─ Deal won/lost
```

### Instantly.ai Integration

```
GeoSpark                          Instantly.ai
────────                          ────────────
Select leads  ──── API ────────►  Campaign
                                     │
                                     ▼
                                  Send emails
                                     │
◄──── Webhook ─────────────────  Track events
                                  (opens, clicks,
Update lead score                  replies, bounces)
Update lead status
Log touchpoint
```

---

## API Endpoints

### Markets
- `GET /api/sales/markets` - List all markets
- `POST /api/sales/markets` - Create market
- `PUT /api/sales/markets/[id]` - Update market
- `DELETE /api/sales/markets/[id]` - Delete market

### Email Accounts
- `GET /api/outreach/accounts` - List accounts with capacity
- `POST /api/outreach/accounts` - Add account
- `GET /api/outreach/accounts/capacity` - Get total capacity
- `PUT /api/outreach/accounts/[id]` - Update account

### Leads
- `GET /api/outreach/leads` - List leads (filterable)
- `POST /api/outreach/leads` - Create lead
- `GET /api/outreach/priority-queue` - Get prioritized leads
- `POST /api/outreach/leads/[id]/convert` - Convert to sales lead

### Instantly Integration
- `GET /api/outreach/instantly/sync` - Get connection status
- `POST /api/outreach/instantly/sync` - Sync all data
- `POST /api/outreach/instantly/push-leads` - Push leads to campaign
- `POST /api/outreach/webhooks/instantly` - Receive events

### Templates
- `GET /api/outreach/templates` - List templates
- `POST /api/outreach/templates` - Create template
- `PUT /api/outreach/templates/[id]` - Update template

---

## Database Tables

### Core Tables
- `markets` - Market definitions
- `sales_team` - Agents/partners
- `email_accounts` - Sending accounts
- `email_account_daily_stats` - Daily sending stats
- `outreach_leads` - Cold leads
- `leads` - Sales leads (converted)
- `industries` - Industry categories

### Email Tables
- `email_templates` - Email templates
- `email_sequences` - Sequence definitions
- `sequence_steps` - Steps in sequences
- `lead_sequence_enrollment` - Lead progress in sequences

### Tracking Tables
- `lead_touchpoints` - All interactions
- `outreach_activities` - Activity log

---

## Security & Permissions

### Role-Based Access

| Permission | Admin | Agent | Partner |
|------------|-------|-------|---------|
| View all markets | ✅ | ❌ | ❌ |
| View assigned markets | ✅ | ✅ | ✅ |
| Manage agents | ✅ | ❌ | ❌ |
| Manage templates | ✅ | ✅ | ❌ |
| View all leads | ✅ | ❌ | ❌ |
| View market leads | ✅ | ✅ | ✅ |
| Export leads | ✅ | ✅ | ❌ |
| View analytics | ✅ | ✅ | Limited |

### Data Isolation

Partners only see:
- Their assigned markets
- Leads in those markets
- Their own email accounts
- Their own performance stats

---

## Getting Started

### For Admins

1. **Set up markets** - Create USA (English) first
2. **Add email accounts** - Connect to Instantly
3. **Create templates** - Write email sequences
4. **Import leads** - CSV upload by market
5. **Start sequences** - Push to Instantly

### For Agents/Partners

1. **Log in** - Use provided credentials
2. **View assigned markets** - See your leads
3. **Work priority queue** - Call hot leads first
4. **Log activities** - Record all touchpoints
5. **Convert leads** - Move to sales pipeline

---

## Scaling Roadmap

### Phase 1: Foundation (Current)
- 3 domains, 9 accounts
- 1 market (USA English)
- 360 emails/day capacity
- 1 agent (you)

### Phase 2: Multi-Market
- 6 domains, 18 accounts
- 3 markets (USA, Netherlands, Spain)
- 720 emails/day capacity
- 3 agents

### Phase 3: Scale
- 15 domains, 45 accounts
- 5+ markets
- 1,800 emails/day capacity
- 5+ agents

### Phase 4: Enterprise
- 50+ domains, 150+ accounts
- 10+ markets
- 6,000 emails/day capacity
- 10+ agents/partners

---

## Support

For technical issues or questions:
- Email: support@geospark.app
- Documentation: /docs in this repository
