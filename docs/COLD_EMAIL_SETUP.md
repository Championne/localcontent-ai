# Cold Email System Setup Guide

Complete step-by-step guide to set up your cold email infrastructure.

---

## Overview

| Component | Purpose | Cost |
|-----------|---------|------|
| **Porkbun** | Domain DNS management | Already paid |
| **Zoho Mail** | Email hosting (free) | Free |
| **Instantly.ai** | Email sending + warmup | $37/month |
| **GeoSpark** | CRM + lead management | Your app |

---

## Your Domains

You purchased these domains:
1. `localgrowthpro.co`
2. `smallbizboost.co`
3. `bizgrowthtips.org`

---

# PART 1: ZOHO MAIL SETUP

## Step 1.1: Create Zoho Account

1. Go to **https://www.zoho.com/mail/zohomail-pricing.html**
2. Scroll to **"Forever Free Plan"**
3. Click **"SIGN UP NOW"**
4. Click **"Add your existing domain"**

## Step 1.2: Add Your First Domain

1. Enter domain: `localgrowthpro.co`
2. Click **"Add"**
3. Fill in:
   - Organization name: `Local Growth Pro`
   - Your name: `Gert Jan`
   - Email: `gert` (creates gert@localgrowthpro.co)
   - Password: Create strong password (SAVE IT!)
4. Click **"Sign Up"**

## Step 1.3: Verify Domain

1. Zoho shows a TXT record like:
   ```
   zoho-verification=zb12345678.zmverify.zoho.com
   ```
2. **COPY THIS** - you'll add it to Porkbun
3. **DON'T CLICK VERIFY YET**

## Step 1.4: Get DKIM Record (After Verification)

1. Go to **https://mailadmin.zoho.com**
2. Click **"Email Configuration"** → **"DKIM"**
3. Click **"Add Selector"**
4. Enter `zoho` as selector name
5. Click **"Add"**
6. **COPY THE DKIM TXT VALUE**

## Step 1.5: Create Additional Email Addresses

1. In Zoho Admin → **"Users"**
2. Click **"Add User"**
3. Create:
   - `hello@localgrowthpro.co`
   - `support@localgrowthpro.co`

## Step 1.6: Repeat for Other Domains

Repeat for `smallbizboost.co` and `bizgrowthtips.org`

**Total: 9 email accounts (3 per domain)**

---

# PART 2: PORKBUN DNS SETUP

## Step 2.1: Login to Porkbun

1. Go to **https://porkbun.com**
2. Click **"SIGN IN"**
3. Log in

## Step 2.2: Go to DNS

1. Click **"Domain Management"**
2. Find `localgrowthpro.co`
3. Click **"DNS"**

## Step 2.3: Add Zoho Verification Record

```
Type: TXT
Host: (leave empty)
Answer: [paste zoho-verification=... from Step 1.3]
TTL: 600
```
Click **Add**

## Step 2.4: Verify in Zoho

1. Go back to Zoho
2. Click **"Verify TXT Record"**
3. Wait 1-5 minutes if it fails

## Step 2.5: Add MX Records

**Delete existing MX records first!**

Add these 3:

**MX Record 1:**
```
Type: MX
Host: (leave empty)
Answer: mx.zoho.com
Priority: 10
TTL: 600
```

**MX Record 2:**
```
Type: MX
Host: (leave empty)
Answer: mx2.zoho.com
Priority: 20
TTL: 600
```

**MX Record 3:**
```
Type: MX
Host: (leave empty)
Answer: mx3.zoho.com
Priority: 50
TTL: 600
```

## Step 2.6: Add SPF Record

```
Type: TXT
Host: (leave empty)
Answer: v=spf1 include:zoho.com ~all
TTL: 600
```

## Step 2.7: Add DKIM Record

```
Type: TXT
Host: zoho._domainkey
Answer: [paste DKIM value from Step 1.4 - it's very long]
TTL: 600
```

## Step 2.8: Add DMARC Record

```
Type: TXT
Host: _dmarc
Answer: v=DMARC1; p=none; rua=mailto:gert@localgrowthpro.co
TTL: 600
```

## Step 2.9: Add Instantly Tracking Domain

```
Type: CNAME
Host: track
Answer: track.instantly.ai
TTL: 600
```

## Step 2.10: Verify DNS Records

Your DNS should show:

| Type | Host | Answer |
|------|------|--------|
| TXT | (empty) | zoho-verification=... |
| TXT | (empty) | v=spf1 include:zoho.com ~all |
| TXT | zoho._domainkey | v=DKIM1;... |
| TXT | _dmarc | v=DMARC1; p=none;... |
| MX | (empty) | mx.zoho.com (10) |
| MX | (empty) | mx2.zoho.com (20) |
| MX | (empty) | mx3.zoho.com (50) |
| CNAME | track | track.instantly.ai |

## Step 2.11: Repeat for Other Domains

Do the same for `smallbizboost.co` and `bizgrowthtips.org`

---

# PART 3: INSTANTLY.AI SETUP

## Step 3.1: Create Account

1. Go to **https://instantly.ai**
2. Sign up with `gert@geospark.app`
3. Choose **"Growth"** plan ($37/month)

## Step 3.2: Get SMTP Settings from Zoho

Zoho SMTP settings:
```
SMTP Server: smtp.zoho.com
SMTP Port: 587
Security: TLS

IMAP Server: imap.zoho.com
IMAP Port: 993
Security: SSL
```

## Step 3.3: Connect Email Account

1. In Instantly → **"Email Accounts"** → **"+ Add New"**
2. Click **"Any Provider (SMTP)"**
3. Enter:
   ```
   Email: gert@localgrowthpro.co
   First Name: Gert Jan
   
   SMTP Host: smtp.zoho.com
   SMTP Port: 587
   SMTP Username: gert@localgrowthpro.co
   SMTP Password: [your Zoho password]
   Use TLS: Yes ✓
   
   IMAP Host: imap.zoho.com
   IMAP Port: 993
   IMAP Username: gert@localgrowthpro.co
   IMAP Password: [same password]
   Use SSL: Yes ✓
   ```
4. Click **"Connect Account"**

## Step 3.4: Enable Warmup

1. Find account in Email Accounts list
2. Toggle **"Warmup"** ON
3. Settings:
   ```
   Daily warmup limit: 5 (start)
   Ramp up: 2 per day
   Reply rate: 30%
   ```

## Step 3.5: Repeat for All 9 Accounts

Connect and enable warmup for ALL accounts.

## Step 3.6: Set Up Tracking Domain

1. Instantly → **"Settings"** → **"Tracking Domain"**
2. Click **"Add Custom Domain"**
3. Enter: `track.localgrowthpro.co`
4. Click **"Verify"**

## Step 3.7: Get API Key

1. Instantly → **"Settings"** → **"API"**
2. Click **"Generate API Key"**
3. Copy key (looks like: `ak_xxxxxxxx...`)
4. **SAVE THIS!**

## Step 3.8: Set Up Webhook

1. Instantly → **"Settings"** → **"Webhooks"**
2. Click **"Add Webhook"**
3. URL: `https://geospark.app/api/outreach/webhooks/instantly`
4. Select events:
   - ✅ Email Sent
   - ✅ Email Opened
   - ✅ Email Clicked
   - ✅ Email Replied
   - ✅ Email Bounced
   - ✅ Lead Unsubscribed
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

1. `lib/database/unified-sales-schema.sql` – industries, leads (CRM)
2. `lib/database/outreach-schema.sql` – outreach_leads, campaigns
3. `lib/database/lead-scoring-schema.sql` – score, webhook support
4. `lib/database/markets-and-accounts-schema.sql` – markets, email_accounts
5. `lib/database/outreach-sales-integration.sql` – link outreach → sales

**Full step-by-step:** See [COLD_EMAIL_GEOSPARK_SETUP.md](./COLD_EMAIL_GEOSPARK_SETUP.md) for webhook URL and first campaign flow.

## Step 4.3: Add Email Accounts to GeoSpark

After connecting to Instantly, add accounts to GeoSpark:

```
POST /api/outreach/accounts
{
  "email": "gert@localgrowthpro.co",
  "display_name": "Gert Jan",
  "domain": "localgrowthpro.co",
  "market_id": "[usa-market-uuid]",
  "instantly_connected": true,
  "warmup_started_at": "2025-02-04T00:00:00Z"
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
- [ ] Day 1: Set up Zoho accounts
- [ ] Day 1: Configure Porkbun DNS
- [ ] Day 1: Connect accounts to Instantly
- [ ] Day 1: Enable warmup on ALL accounts
- [ ] Day 1-14: **WAIT - Let warmup run!**

## Week 3: Soft Launch
- [ ] Start with small test batches (10-20 leads)
- [ ] Monitor bounce rates and replies
- [ ] Adjust email copy if needed

## Week 4+: Scale
- [ ] Increase volume gradually
- [ ] Add more domains if needed
- [ ] Expand to more markets

---

# CAPACITY REFERENCE

## Account Maturity Phases

| Phase | Days | Daily Limit |
|-------|------|-------------|
| 🔴 Warmup | 1-14 | 0 |
| 🟡 Limited | 15-21 | 15 |
| 🟠 Ramping | 22-35 | 30 |
| 🟢 Active | 36+ | 50 |

## Your Capacity Projection

| Timeline | Accounts Ready | Daily Capacity |
|----------|----------------|----------------|
| Day 14 | 0 | 0 (still warming) |
| Day 21 | 9 | 135 (limited) |
| Day 35 | 9 | 270 (ramping) |
| Day 36+ | 9 | 450 (full) |

---

# TROUBLESHOOTING

## "Domain verification failed" in Zoho
- Wait 5-10 minutes (DNS propagation)
- Check TXT record is correct
- Make sure Host field is empty (not "@")

## "SMTP connection failed" in Instantly
- Verify password (no typos)
- Use port 587 with TLS
- If Zoho has 2FA, create an App Password

## "Warmup not working"
- Check DKIM and SPF records
- Wait 24 hours for DNS propagation
- Contact Instantly support

## Emails going to spam
- Check DMARC record
- Reduce sending volume
- Improve email copy (less salesy)
- Ensure SPF and DKIM pass

---

# CHECKLIST

## Initial Setup
- [ ] Zoho account created
- [ ] Domain 1 added to Zoho
- [ ] Domain 2 added to Zoho
- [ ] Domain 3 added to Zoho
- [ ] 9 email accounts created

## DNS (Per Domain)
- [ ] Zoho verification TXT
- [ ] MX records (3)
- [ ] SPF record
- [ ] DKIM record
- [ ] DMARC record
- [ ] Instantly tracking CNAME

## Instantly
- [ ] Account created
- [ ] All 9 accounts connected
- [ ] Warmup enabled on all
- [ ] Tracking domain verified
- [ ] API key generated
- [ ] Webhook configured → URL: `https://YOUR-DOMAIN/api/outreach/webhooks/instantly` (see COLD_EMAIL_GEOSPARK_SETUP.md)

## GeoSpark
- [ ] API key in .env.local
- [ ] Database migrations run
- [ ] Email accounts added
- [ ] Deployed to Vercel

## Ready to Send
- [ ] 14+ days of warmup completed
- [ ] Test email sent successfully
- [ ] First campaign created
- [ ] Leads imported
