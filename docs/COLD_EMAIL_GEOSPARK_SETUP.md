# GeoSpark + Instantly Setup – Ready for Your First Campaign

This guide gets the **GeoSpark app** and **Instantly** connected so you can run cold email campaigns. Do this after you have **Zoho** and **Instantly** accounts set up (see [COLD_EMAIL_SETUP.md](./COLD_EMAIL_SETUP.md)).

---

## Where campaigns live

**Campaigns are built in GeoSpark.** You create the campaign (name, sequence steps, subject lines, body copy) in the GeoSpark environment. GeoSpark stores them in `outreach_campaigns` and `outreach_emails`.

**Instantly is the sending engine.** Emails are sent by Instantly using the email accounts you connected there (e.g. Zoho). So the same campaign must exist in Instantly for sending. The intended flow is:

1. **Create campaign in GeoSpark** (name + sequence steps).
2. **Sync to Instantly** – GeoSpark will create (or update) the campaign in Instantly via API and store the link (`instantly_campaign_id`). *This sync is being implemented; until then see "Temporary: campaign in Instantly" below.*
3. **Import leads in GeoSpark** and **push** them to the campaign; Instantly sends the sequence and sends webhooks back to GeoSpark for scoring.

---

## Continue tomorrow – where we left off

**Done so far:**
- [x] Step 0: Base sales tables (`00-base-sales-tables.sql`)
- [x] Steps 1–5: All DB migrations (unified-sales, outreach, lead-scoring, markets-and-accounts, outreach-sales-integration)

**Next when you continue:**
1. **Step 7 – Instantly webhook** – In Instantly (Integrations or Settings → Webhooks), add URL: `https://geospark.app/api/outreach/webhooks/instantly`, events: email_sent, email_opened, email_clicked, email_replied, email_bounced, lead_unsubscribed.
2. **Step 8 – Instantly API key** – Add `INSTANTLY_API_KEY` in GeoSpark (Instantly Settings → API) and in Vercel env vars (needed for campaign sync and push-leads).
3. **Implement GeoSpark → Instantly campaign sync** – When you create (or update) a campaign in GeoSpark, call Instantly API v2 to create/update the campaign there and save `instantly_campaign_id`. Then you only build campaigns in GeoSpark.
4. **First campaign in GeoSpark** – Create campaign + sequence in GeoSpark → sync creates it in Instantly → import leads → push leads to campaign.

---

## Step 1: Run database migrations (Supabase)

Run these in the **Supabase SQL Editor** in this order:

| Order | File | Purpose |
|-------|------|---------|
| 0 | `lib/database/00-base-sales-tables.sql` | Creates `leads`, `sales_team`, `deals` if missing (skip if you already have them) |
| 1 | `lib/database/unified-sales-schema.sql` | Industries, lead columns, touchpoints |
| 2 | `lib/database/outreach-schema.sql` | outreach_leads, campaigns, activities |
| 3 | `lib/database/lead-scoring-schema.sql` | Score columns, trigger, increment_score, priority view |
| 4 | `lib/database/markets-and-accounts-schema.sql` | Markets, email_accounts, outreach_leads market_id |
| 5 | `lib/database/outreach-sales-integration.sql` | Links outreach_leads to sales leads |

**How to run:** Supabase Dashboard → SQL Editor → New query → paste contents of each file → Run. Do them one by one; fix any errors (e.g. “already exists”) before continuing.

---

## Step 2: Configure Instantly webhook (so GeoSpark gets opens/clicks/replies)

1. Log in to **Instantly**.
2. Go to **Settings** (or **Integrations**) → **Webhooks** (or **API / Webhooks**).
3. Add a new webhook:
   - **URL:** `https://geospark.app/api/outreach/webhooks/instantly`
   - **Events:** enable at least: `email_sent`, `email_opened`, `email_clicked`, `email_replied`, `email_bounced`, `lead_unsubscribed`.
4. Save. Instantly may send a test GET request; the endpoint returns `{ "status": "ok" }`.

---

## Step 3: Environment variables (GeoSpark)

Ensure your app (and Vercel) have:

- **Supabase:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (and service role if used).
- **Instantly (required for campaign sync and push-leads):** `INSTANTLY_API_KEY` – create in Instantly (Settings → API). Add to `.env.local` and Vercel env vars.

---

## Step 4: (Optional) Add email accounts in GeoSpark

If you want capacity and account tracking inside GeoSpark:

- Use **Dashboard** (when the UI exists) or call `POST /api/outreach/accounts` with:
  - `email`, `display_name`, `domain`
  - `market_id` (UUID of your market from `markets` table)
  - `instantly_connected: true`
  - `warmup_started_at` (date when warmup started in Instantly)

You can skip this and still run campaigns; Instantly will send from the accounts you connected there.

---

## Step 5: Create your first campaign (flow)

**Intended flow (once sync is implemented):** Create the campaign in **GeoSpark** → sync creates it in Instantly → assign email accounts in Instantly to that campaign → import leads in GeoSpark → push leads to the campaign.

### Create campaign in GeoSpark

1. **GeoSpark** – Create campaign via API or Dashboard:
   - **API:** `POST /api/outreach/campaigns` with:
     - `name`, `description`, `type` (e.g. `cold_email`), `target_industry`, `target_location`
     - `emails`: array of steps, e.g. `[{ "subject": "...", "body": "...", "delay_days": 0 }, { "subject": "...", "body": "...", "delay_days": 2 }]`
   - This creates `outreach_campaigns` and `outreach_emails` in GeoSpark.

2. **Sync to Instantly (to implement):** When saving the campaign, call Instantly API v2 (e.g. `createcampaign`) to create the campaign and sequence in Instantly, then store `instantly_campaign_id` on the GeoSpark campaign. After that, you only build in GeoSpark.

### Temporary: if sync isn’t built yet

- Create the **same** campaign in Instantly (name, sequence steps, schedule, assign email accounts).
- In GeoSpark, create or update the campaign and set `instantly_campaign_id` to the Instantly campaign ID (via API or DB) so “push leads” uses the right campaign.

### Import leads and push

1. **Markets / Industries** – Ensure at least one market and industry exist (seeded by migrations).
2. **Import leads** – Dashboard → Outreach → Import (or `POST /api/outreach/leads/import`): CSV with `business_name`, `contact_email`, and optionally `contact_name`, `phone`, `city`, `state`, `country`; assign market and industry.
3. **Push to campaign** – Dashboard or `POST /api/outreach/instantly/push-leads` with `campaign_id` (Instantly campaign ID, or from GeoSpark campaign’s `instantly_campaign_id`) and `lead_ids` or `filters`.
4. **After sending** – Instantly sends webhooks; GeoSpark updates lead scores and the priority queue (hot/warm/cold).

---

## Checklist – “System ready for a campaign”

- [ ] All migrations (0–5) run in Supabase (no errors).
- [ ] Instantly webhook URL: `https://geospark.app/api/outreach/webhooks/instantly`, events enabled.
- [ ] `INSTANTLY_API_KEY` set in GeoSpark (and Vercel).
- [ ] App deployed so the webhook is reachable.
- [ ] At least one market and industry exist.
- [ ] **Campaign created in GeoSpark** (and synced to Instantly when sync is implemented; until then, create in Instantly and link `instantly_campaign_id`).
- [ ] Leads imported in GeoSpark with `contact_email`, market, industry.
- [ ] Test: push leads to campaign; confirm webhook updates lead and score in GeoSpark.

After this you **create all new campaigns in GeoSpark**; once sync is in place, they will automatically exist in Instantly for sending.
