# Cold Email System Setup Guide

Complete step-by-step guide to set up your cold email infrastructure.

---

## Overview

| Component | Purpose | Cost |
|-----------|---------|------|
| **Porkbun** | Domain DNS management | Already paid |
| **Google Workspace** | Email hosting (Business Starter) | $7/user/month |
| **Instantly.ai** | Email sending + warmup | $37/month |
| **GeoSpark** | CRM + lead management | Your app |

---

## Your Domains

You purchased these domains:
1. `localgrowthpro.co`
2. `smallbizboost.co`
3. `bizgrowthtips.org`

---

# PART 1: GOOGLE WORKSPACE SETUP

## Step 1.1: Create Google Workspace Account

1. Go to **https://workspace.google.com/business/signup**
2. Enter business name: `GeoSpark` (or `Local Growth Pro`)
3. Number of employees: `Just you`
4. Enter your current email (for account recovery): your personal email
5. Enter your first domain: **`localgrowthpro.co`**
6. Create your first admin user: `gert@localgrowthpro.co`
7. Choose plan: **Business Starter** ($7/user/month)
8. Enter payment info and complete sign-up
9. **Save your admin password!**

## Step 1.2: Verify Domain Ownership

Google will show a verification TXT record:
1. Copy the `google-site-verification=XXXX...` value
2. Go to Porkbun to add it (see Part 2, Step 2.1)
3. Come back to Google and click **"Verify"**

## Step 1.3: Add Secondary Domains

Once `localgrowthpro.co` is verified:

1. Go to **Google Admin Console**: https://admin.google.com
2. Navigate to **Account** -> **Domains** -> **Manage domains**
3. Click **"Add a domain"**
4. Add **`smallbizboost.co`** as a **"Secondary domain"**
5. Verify it (same TXT record process via Porkbun)
6. Repeat for **`bizgrowthtips.org`**

## Step 1.4: Create All 9 Email Accounts

In Google Admin Console -> **Directory** -> **Users** -> **Add new user**:

**Domain 1 -- localgrowthpro.co:**
- `gert@localgrowthpro.co` (already created as admin)
- `hello@localgrowthpro.co`
- `support@localgrowthpro.co`

**Domain 2 -- smallbizboost.co:**
- `gert@smallbizboost.co`
- `hello@smallbizboost.co`
- `support@smallbizboost.co`

**Domain 3 -- bizgrowthtips.org:**
- `gert@bizgrowthtips.org`
- `hello@bizgrowthtips.org`
- `support@bizgrowthtips.org`

Set strong passwords for each. **Save all 9 passwords!**

## Step 1.5: Enable 2-Step Verification & Generate App Passwords

For each of the 9 accounts:

1. Log in to the account at https://myaccount.google.com
2. Go to **Security** -> **2-Step Verification** -> Enable it
3. Once enabled, go to **Security** -> **App passwords**
4. Select **"Mail"** and **"Other"** -> name it `Instantly`
5. Click **"Generate"**
6. **Copy the 16-character app password** (e.g. `abcd efgh ijkl mnop`)
7. **Save it!** -- you'll need it to connect to Instantly

Repeat for all 9 accounts.

---

# PART 2: PORKBUN DNS SETUP

Do this for **each** of the 3 domains.

## Step 2.1: Login to Porkbun

1. Go to **https://porkbun.com**
2. Click **"SIGN IN"**
3. Log in

## Step 2.2: Go to DNS

1. Click **"Domain Management"**
2. Find `localgrowthpro.co`
3. Click **"DNS"**

## Step 2.3: Add Google Verification Record

```
Type: TXT
Host: (leave empty)
Answer: google-site-verification=XXXXX (from Step 1.2)
TTL: 600
```
Click **Add**

## Step 2.4: Go Back to Google and Verify

1. Return to Google Admin Console
2. Click **"Verify"**
3. Wait 1-5 minutes if it fails (DNS propagation)

## Step 2.5: Replace MX Records

**Delete ALL existing MX records first!**

Add these 5 Google MX records:

| Type | Host | Answer | Priority | TTL |
|------|------|--------|----------|-----|
| MX | (empty) | ASPMX.L.GOOGLE.COM | 1 | 600 |
| MX | (empty) | ALT1.ASPMX.L.GOOGLE.COM | 5 | 600 |
| MX | (empty) | ALT2.ASPMX.L.GOOGLE.COM | 5 | 600 |
| MX | (empty) | ALT3.ASPMX.L.GOOGLE.COM | 10 | 600 |
| MX | (empty) | ALT4.ASPMX.L.GOOGLE.COM | 10 | 600 |

## Step 2.6: Add SPF Record

```
Type: TXT
Host: (leave empty)
Answer: v=spf1 include:_spf.google.com ~all
TTL: 600
```

## Step 2.7: Add DKIM Record

1. In Google Admin Console -> **Apps** -> **Google Workspace** -> **Gmail** -> **Authenticate email**
2. Select the domain
3. Click **"Generate new record"** (prefix: `google`)
4. Copy the TXT record value
5. In Porkbun, add:

```
Type: TXT
Host: google._domainkey
Answer: (paste the long DKIM value from Google)
TTL: 600
```

6. Go back to Google Admin and click **"Start authentication"**

## Step 2.8: Add DMARC Record

```
Type: TXT
Host: _dmarc
Answer: v=DMARC1; p=none; rua=mailto:gert@localgrowthpro.co
TTL: 600
```

(For domains 2 and 3, change the `rua` email to match that domain.)

## Step 2.9: Add Instantly Tracking Domain

```
Type: CNAME
Host: track
Answer: track.instantly.ai
TTL: 600
```

## Step 2.10: Verify DNS Records

Your DNS for each domain should show:

| Type | Host | Answer |
|------|------|--------|
| TXT | (empty) | google-site-verification=... |
| TXT | (empty) | v=spf1 include:_spf.google.com ~all |
| TXT | google._domainkey | v=DKIM1;... |
| TXT | _dmarc | v=DMARC1; p=none;... |
| MX | (empty) | ASPMX.L.GOOGLE.COM (1) |
| MX | (empty) | ALT1.ASPMX.L.GOOGLE.COM (5) |
| MX | (empty) | ALT2.ASPMX.L.GOOGLE.COM (5) |
| MX | (empty) | ALT3.ASPMX.L.GOOGLE.COM (10) |
| MX | (empty) | ALT4.ASPMX.L.GOOGLE.COM (10) |
| CNAME | track | track.instantly.ai |

## Step 2.11: Repeat for Other Domains

Do the same for `smallbizboost.co` and `bizgrowthtips.org`

---

# PART 3: INSTANTLY.AI SETUP

## Step 3.1: Log In / Create Account

1. Go to **https://instantly.ai**
2. Log in (or sign up) with `gert@geospark.app`
3. Ensure you're on the **Growth** plan ($37/month)

## Step 3.2: Connect Email Accounts

For each of the 9 accounts, in Instantly -> **"Email Accounts"** -> **"+ Add New"** -> **"Any Provider (SMTP)"**:

```
Email: gert@localgrowthpro.co
First Name: Gert Jan

SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP Username: gert@localgrowthpro.co
SMTP Password: [16-char app password from Step 1.5]
Use TLS: Yes

IMAP Host: imap.gmail.com
IMAP Port: 993
IMAP Username: gert@localgrowthpro.co
IMAP Password: [same 16-char app password]
Use SSL: Yes
```

Click **"Connect Account"**. Repeat for all 9 accounts.

**Google SMTP/IMAP settings (same for all accounts):**
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
Security: TLS

IMAP Host: imap.gmail.com
IMAP Port: 993
Security: SSL
```

## Step 3.3: Enable Warmup

For each connected account:
1. Toggle **"Warmup"** ON
2. Settings:
   ```
   Daily warmup limit: 5 (start)
   Ramp up: 2 per day
   Reply rate: 30%
   ```

## Step 3.4: Repeat for All 9 Accounts

Connect and enable warmup for ALL accounts.

## Step 3.5: Set Up Tracking Domain

1. Instantly -> **"Settings"** -> **"Tracking Domain"**
2. Click **"Add Custom Domain"**
3. Enter: `track.localgrowthpro.co`
4. Click **"Verify"**

## Step 3.6: Get API Key

1. Instantly -> **"Settings"** -> **"API"**
2. Click **"Generate API Key"**
3. Copy key (looks like: `ak_xxxxxxxx...`)
4. **SAVE THIS!**

## Step 3.7: Set Up Webhook

1. Instantly -> **"Settings"** -> **"Webhooks"**
2. Click **"Add Webhook"**
3. URL: `https://geospark.app/api/outreach/webhooks/instantly`
4. Select events:
   - Email Sent
   - Email Opened
   - Email Clicked
   - Email Replied
   - Email Bounced
   - Lead Unsubscribed
5. Click **"Save"**

---

# PART 4: CONNECT TO GEOSPARK

## Step 4.1: Add API Key

1. Open `.env.local` in your project
2. Add:
   ```
   INSTANTLY_API_KEY=ak_your_api_key_here
   ```
3. Save

## Step 4.2: Run Database Migrations

In Supabase SQL Editor, run these files **in this order**:

1. `lib/database/unified-sales-schema.sql` -- industries, leads (CRM)
2. `lib/database/outreach-schema.sql` -- outreach_leads, campaigns
3. `lib/database/lead-scoring-schema.sql` -- score, webhook support
4. `lib/database/markets-and-accounts-schema.sql` -- markets, email_accounts
5. `lib/database/outreach-sales-integration.sql` -- link outreach -> sales

**Full step-by-step:** See [COLD_EMAIL_GEOSPARK_SETUP.md](./COLD_EMAIL_GEOSPARK_SETUP.md) for webhook URL and first campaign flow.

## Step 4.3: Add Email Accounts to GeoSpark

After connecting to Instantly, add accounts to GeoSpark:

```
POST /api/outreach/accounts
{
  "email": "gert@localgrowthpro.co",
  "display_name": "Gert Jan",
  "domain": "localgrowthpro.co",
  "provider": "google",
  "market_id": "[usa-market-uuid]",
  "instantly_connected": true,
  "warmup_started_at": "2026-02-10T00:00:00Z"
}
```

Or use the dashboard UI when available.

## Step 4.4: Deploy

1. Commit changes
2. Push to GitHub
3. Vercel auto-deploys

---

# TIMELINE

## Week 1-2: Setup & Warmup
- [ ] Day 1: Set up Google Workspace (accounts + app passwords)
- [ ] Day 1: Configure Porkbun DNS (all 3 domains)
- [ ] Day 1: Connect accounts to Instantly
- [ ] Day 1: Enable warmup on ALL accounts
- [ ] Day 1-14: **WAIT - Let warmup run!**

## Week 3: Soft Launch
- [ ] Start with small test batches (10-20 leads)
- [ ] Monitor bounce rates and replies
- [ ] Adjust email copy if needed

## Week 4+: Scale
- [ ] Increase volume gradually
- [ ] Add more domains if needed (buy on Porkbun, add as secondary domain in Google Workspace)
- [ ] Expand to more markets

---

# CAPACITY REFERENCE

## Account Maturity Phases

| Phase | Days | Daily Limit |
|-------|------|-------------|
| Warmup | 1-14 | 0 |
| Limited | 15-21 | 15 |
| Ramping | 22-35 | 30 |
| Active | 36+ | 50 |

## Your Capacity Projection

| Timeline | Accounts Ready | Daily Capacity |
|----------|----------------|----------------|
| Day 14 | 0 | 0 (still warming) |
| Day 21 | 9 | 135 (limited) |
| Day 35 | 9 | 270 (ramping) |
| Day 36+ | 9 | 450 (full) |

## Scaling (Future)

To scale beyond 450/day, buy more domains on Porkbun and add them as secondary domains in Google Workspace. Keep 3-5 accounts per domain max.

| Setup | Accounts | Daily Capacity | Monthly Cost |
|-------|----------|----------------|-------------|
| 3 domains x 3 accounts | 9 | 450/day | $63/month |
| 4 domains x 3 accounts | 12 | 600/day | $84/month |
| 5 domains x 3 accounts | 15 | 750/day | $105/month |
| 7 domains x 3 accounts | 21 | 1,050/day | $147/month |

---

# TROUBLESHOOTING

## "Domain verification failed" in Google
- Wait 5-10 minutes (DNS propagation)
- Check TXT record is correct in Porkbun
- Make sure Host field is empty (not "@")

## "SMTP connection failed" in Instantly
- Verify you're using the 16-char **app password**, NOT your Google password
- Use `smtp.gmail.com` port 587 with TLS
- Make sure 2-Step Verification is enabled on the Google account
- If app passwords option is missing, enable 2FA first

## "App passwords not available" in Google
- You must enable **2-Step Verification** first
- Go to Security -> 2-Step Verification -> Turn on
- Then App passwords will appear under Security

## "Warmup not working"
- Check DKIM and SPF records in Porkbun
- Wait 24-48 hours for DNS propagation
- Contact Instantly support

## Emails going to spam
- Check DMARC record
- Reduce sending volume
- Improve email copy (less salesy)
- Ensure SPF and DKIM pass (use https://mxtoolbox.com to verify)

---

# MONTHLY COST SUMMARY

| Service | Cost |
|---------|------|
| Google Workspace (9 users x $7) | $63/month |
| Instantly.ai (Growth plan) | $37/month |
| Domains (3, annual) | ~$30-45/year |
| **Total** | **~$100/month** |

---

# CHECKLIST

## Google Workspace
- [ ] Account created (Business Starter plan)
- [ ] Domain 1 (`localgrowthpro.co`) verified
- [ ] Domain 2 (`smallbizboost.co`) added and verified
- [ ] Domain 3 (`bizgrowthtips.org`) added and verified
- [ ] 9 email accounts created
- [ ] 2-Step Verification enabled on all 9
- [ ] App passwords generated for all 9

## DNS (Per Domain)
- [ ] Google verification TXT
- [ ] MX records (5 Google servers)
- [ ] SPF record (`include:_spf.google.com`)
- [ ] DKIM record (`google._domainkey`)
- [ ] DMARC record
- [ ] Instantly tracking CNAME

## Instantly
- [ ] Account created / logged in
- [ ] All 9 accounts connected (SMTP + IMAP)
- [ ] Warmup enabled on all 9
- [ ] Tracking domain verified
- [ ] API key generated
- [ ] Webhook configured -> URL: `https://geospark.app/api/outreach/webhooks/instantly`

## GeoSpark
- [ ] API key in `.env.local`
- [ ] Database migrations run
- [ ] Email accounts added (provider: `google`)
- [ ] Deployed to Vercel

## Ready to Send
- [ ] 14+ days of warmup completed
- [ ] Test email sent successfully
- [ ] First campaign created
- [ ] Leads imported
