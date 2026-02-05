# GeoSpark Sales System – How It’s Built & What’s Left to Set Up

This doc describes how the **cold email campaign** and **lead scoring (HOT lead)** system is built, and what still needs to be configured or fixed.

---

## 1. High-Level Architecture

The system has two main sides that connect:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  COLD EMAIL OUTREACH (outreach_leads)                                    │
│  • Import leads (CSV / manual)                                            │
│  • Push leads to Instantly.ai → send cold email sequences                │
│  • Instantly sends webhooks (opened, clicked, replied, bounced)          │
│  • Each event updates outreach_leads and adds to lead score               │
│  • Priority queue = leads sorted by score (HOT / warm / cold)            │
└───────────────────────────────┬─────────────────────────────────────────┘
                                 │ convert
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  SALES CRM (leads + dialer)                                              │
│  • “Convert” hot outreach_leads → creates/links to leads (CRM)           │
│  • Dialer queue: add CRM leads for callbacks, ordered by priority        │
│  • Calls, inbox, deals live in this side                                 │
└─────────────────────────────────────────────────────────────────────────┘
```

- **Outreach** = cold email only: `outreach_leads`, Instantly, scoring, priority queue.  
- **Sales** = once a lead is “converted”: `leads`, `dialer_queue`, calls, pipeline.

---

## 2. Cold Email Flow (How It’s Built)

### 2.1 Data model

- **Markets** (`markets`) – e.g. USA (English), Netherlands – language, timezone, send windows.
- **Email accounts** (`email_accounts`) – sending addresses (e.g. Zoho), linked to Instantly, with **warmup phase** and **daily limits** (0 → 15 → 30 → 50 by days since warmup).
- **Industries** (`industries`) – e.g. HVAC, Plumber – used to filter leads and templates.
- **Outreach leads** (`outreach_leads`) – one row per potential customer: business name, contact email/phone, market, industry, **score**, status, and all engagement/Instantly fields (see below).
- **Email templates** (`email_templates`) – per market (and optional industry): subject, body, type (`cold_email` / `follow_up` / `breakup`), used by Instantly campaigns.
- **Outreach activities** (`outreach_activities`) – log of events (email_sent, email_opened, email_replied, etc.) per lead.

### 2.2 Where emails are sent

- **Instantly.ai** sends the emails (you don’t send from the app).
- **Flow:**
  1. You create campaigns in Instantly (or map to existing ones).
  2. You **import** or add leads in GeoSpark → `outreach_leads`.
  3. You **push** a set of `outreach_leads` to an Instantly campaign via `POST /api/outreach/instantly/push-leads` (campaign_id + filters or lead_ids).
  4. Instantly sends the sequence; when things happen (sent, opened, clicked, replied, bounced, unsubscribed), Instantly calls your **webhook**.
  5. The webhook updates `outreach_leads` and updates the **lead score** (see below).

So: **cold email sending** is fully driven by Instantly; GeoSpark holds the list of leads, assigns them to campaigns, and then updates state from webhooks.

### 2.3 Lead scoring (how “HOT” is determined)

Scoring is implemented in the database and used by the priority queue.

**Where it lives**

- **Columns on `outreach_leads`:**  
  `score`, `score_updated_at`, plus all engagement/business/decay fields used to compute it.
- **Function:** `calculate_lead_score(lead_row outreach_leads)` in `lib/database/lead-scoring-schema.sql`.
- **Trigger:** On `INSERT` or `UPDATE` of `outreach_leads`, the trigger runs `calculate_lead_score(NEW)` and sets `score` and `score_updated_at`.
- **RPC for webhooks:** `increment_score(lead_id UUID, points INTEGER)` – adds/subtracts points from current `score` (e.g. +5 open, +50 reply, -50 bounce).

**Score formula (conceptually)**

- **Engagement (what they do)**  
  - Email opened: +5 each; bonus +10 if opened 2+ times.  
  - Link clicked: +15 each.  
  - Email replied: +50 each.  
  - Call connected: +40 each.
- **Business signals (who they are)**  
  - Google rating &lt; 3.5: +25; &lt; 4.5: +10; else +5.  
  - Few reviews (&lt;10: +20; &lt;50: +10).  
  - No website: +15.  
  - No social: +20.  
  - Is hiring: +15.  
  - New business (&lt;2 years): +10.
- **Decay**  
  - No contact 30+ days: -20; 7+ days: -5.  
  - 3+ emails no reply: -10; 5+: -25.  
- **Negative**  
  - Bounced: -50.  
  - Unsubscribed: -100 (capped at -100).  
- **Status**  
  - Replied: +30; Interested: +50; Demo scheduled: +100; Not interested: -100.

**Temperature bands (HOT / warm / cold)**

Used in the priority queue and UI:

| Score    | Temperature | Typical action        |
|----------|-------------|------------------------|
| 75+      | HOT         | Call immediately       |
| 50–74    | Warm        | Call today / soon     |
| 25–49    | Warming     | Continue email        |
| 0–24     | Cold        | Email sequence        |
| &lt; 0   | Frozen      | Low priority          |

So “HOT” = high score (75+) from engagement and business signals; the system pushes those to the top of the priority queue and suggests “call now” / “call today”.

---

## 3. Priority Queue (How HOT Leads Surface)

- **API:** `GET /api/outreach/priority-queue`  
  - Reads from `outreach_leads` (not converted, not bounced/unsubscribed).  
  - Sorts by `score` DESC.  
  - Optional filters: `industry_id`, `temperature` (hot/warm/warming/cold), `action` (e.g. call_now, call_today), `limit`.  
  - For each lead it adds: `temperature`, `temperature_emoji`, `recommended_action` (call_now, call_today, call_soon, send_email, start_sequence, continue_sequence).  
  - Returns `summary` (counts per temperature) and `actionCounts` (counts per recommended action).

- **DB view (optional):** `outreach_priority_queue` in `lead-scoring-schema.sql` – same logic in SQL for use in reports or other tools.

- **UI:** The **outreach dashboard** (`app/dashboard/outreach/page.tsx`) fetches this priority queue and shows hot/warm/cold leads and action counts.

So the “HOT lead” experience is: **score computed from engagement + business signals** → **priority queue sorted by score** → **temperature + recommended action** → **dashboard and (when you add it) dialer**.

---

## 4. Instantly Webhook (How Scores Get Updated From Email Events)

- **Endpoint:** `POST /api/outreach/webhooks/instantly`  
- **Role:** Receives Instantly events (e.g. `email_sent`, `email_opened`, `email_clicked`, `email_replied`, `email_bounced`, `lead_unsubscribed`) and:
  1. Finds the lead in GeoSpark (by email).
  2. Updates counters and timestamps on `outreach_leads` (e.g. `emails_opened`, `last_email_opened_at`, `status` on reply).
  3. Updates score (intended: via `increment_score` for opens/clicks/replies/bounces/unsub).
  4. Logs to `outreach_activities`.

**Important implementation detail (bug):**

- The table stores the contact email in **`contact_email`**, but the webhook looks up the lead with **`.eq('email', payload.lead?.email)`**. So **no lead is found** unless you have an `email` column or a view that maps it. Result: webhook may acknowledge events but **not update the right row** (or any row).
- **Fix:** Use **`contact_email`** in the webhook when looking up the lead, e.g. `.eq('contact_email', payload.lead?.email)`.

**Score update bug:**

- The handler builds an `updateData` object and in some branches sets `updateData.score = supabase.rpc('increment_score', ...)`. In JavaScript, `supabase.rpc(...)` returns a **Promise**, not the new score. So `updateData.score` is not a number; the subsequent `.update(updateData)` can overwrite `score` with something invalid or leave it unchanged in the way you expect.
- **Fix:** Call `increment_score` (or update score) **separately** and do not put the RPC return value into `updateData.score`. For example: first call the RPC and then do a normal `.update({ emails_opened: ..., last_email_opened_at: ..., updated_at: ... })` without `score`, or compute the new score in the API and send it in `updateData` after the RPC has run.

So: the **design** is “webhook updates engagement and score”; the **current code** has a lookup bug (email vs contact_email) and a score-update bug. Fixing these is part of “setting up” the system.

---

## 5. What’s Implemented vs What’s Not Fully Set Up

### Implemented (in code and/or DB)

- **Markets, email accounts, warmup, daily limits** – schema and triggers.
- **Outreach leads** – schema, import (CSV), API (list, create, filters).
- **Lead scoring** – `calculate_lead_score` trigger, `increment_score` RPC, engagement + business + decay in the formula.
- **Priority queue** – API and optional DB view; temperature and recommended actions.
- **Email templates** – table and API (market/industry, subject, body, type).
- **Instantly integration** – push-leads API, webhook endpoint (with the bugs above).
- **Outreach dashboard** – uses priority queue, shows hot/warm/cold and campaigns.
- **Conversion** – outreach lead → sales lead (CRM) via convert endpoint.
- **Sales side** – CRM leads, dialer queue (for **converted** leads only; dialer is not fed directly from outreach priority queue yet).

### Not fully set up / to do

1. **Instantly webhook**
   - **Configure in Instantly:** Set your GeoSpark webhook URL to `https://<your-domain>/api/outreach/webhooks/instantly` so Instantly actually sends events.
   - **Fix webhook code:** Use `contact_email` for lead lookup; fix score update so it doesn’t assign the RPC Promise to `score` and break updates.

2. **Database migrations**
   - Ensure all schemas are applied in order: `outreach-schema.sql` → `lead-scoring-schema.sql` → `markets-and-accounts-schema.sql` (and any other migrations you use). So `outreach_leads` has `score`, engagement columns, and business-signal columns.

3. **Business signals (enrichment)**
   - The score formula expects columns like `google_rating`, `google_reviews_count`, `has_website`, `has_social_media`, `is_hiring`, `years_in_business`. These are in the schema but **not auto-filled** by the app. You need either:
     - Manual entry when importing/editing leads, or  
     - An enrichment step (e.g. script or job that calls Google Places / Clearbit / etc. and updates these fields). Without this, only engagement (and status) will drive score.

4. **Email accounts and Instantly**
   - Connect each sending inbox to Instantly; in GeoSpark, create `email_accounts` rows and set `instantly_connected` / `instantly_account_id` if you use them for capacity checks. Warmup and limits are calculated in DB; the push-leads API can check capacity before sending.

5. **Linking priority queue to dialer**
   - Today the **dialer queue** is for **sales leads** (CRM). To “call hot leads first,” you either:
     - Convert hot outreach leads to CRM leads and add those to the dialer queue (by hand or with a “Add to dialer” from the priority queue), or  
     - Add a separate “outreach dialer” that reads from the priority queue (outreach_leads with score ≥ 75) and shows them for calling. So either wire “convert + add to dialer” from the hot list, or a dedicated outreach dialer view.

6. **Recalculate all scores**
   - After fixing enrichment or data, you can recalculate every lead’s score with the DB function `recalculate_all_scores()` (in `lead-scoring-schema.sql`). Run it in Supabase SQL when needed.

---

## 6. Quick Reference – Main Pieces

| Piece | Purpose |
|-------|--------|
| **outreach_leads** | All cold-email leads; has `score`, engagement counters, business signals. |
| **calculate_lead_score** | DB function + trigger: recomputes score on insert/update. |
| **increment_score(lead_id, points)** | DB RPC: add/subtract points (used by webhook once fixed). |
| **GET /api/outreach/priority-queue** | Sorted list of leads by score + temperature + recommended action. |
| **POST /api/outreach/webhooks/instantly** | Receives Instantly events; must use `contact_email` and fix score update. |
| **POST /api/outreach/instantly/push-leads** | Sends selected outreach_leads to an Instantly campaign. |
| **Outreach dashboard** | UI that shows priority queue (hot/warm/cold) and campaigns. |
| **Convert** | Moves an outreach_lead into the sales CRM (`leads`) and links it. |

---

## 7. Suggested Setup Order

1. Run/apply all DB migrations so `outreach_leads` has scoring and engagement columns.  
2. Fix webhook: `contact_email` lookup and score update (no Promise in `updateData.score`).  
3. In Instantly, set the webhook URL and (if needed) verify with GET.  
4. Import a test batch of leads, push them to a test Instantly campaign, and trigger one open/reply; confirm the correct lead’s score and engagement fields update.  
5. Optionally add enrichment for business signals so HOT leads aren’t only from engagement.  
6. Wire “hot” outreach leads into your call flow (convert + dialer, or outreach dialer view).

Once these are done, the cold email campaign and HOT lead scoring system are fully set up end-to-end.
