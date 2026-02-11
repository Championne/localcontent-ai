# Late API setup (socials linking)

Late (getlate.dev) is used to connect and post to social platforms (Facebook, Instagram, LinkedIn, X/Twitter, TikTok, etc.) from GeoSpark. One Late "profile" per business.

---

## Step 3.1 Get your Late API key

1. Sign up at **https://getlate.dev** (or https://getlate.dev/signup).
2. In the Late dashboard, open **API** or **Settings** and copy your **API key**.
3. Add it to your environment:
   - **Local:** In `.env.local`:
     ```env
     LATE_API_KEY=your-late-api-key
     ```
   - **Production (Vercel):** Project → Settings → Environment Variables → add `LATE_API_KEY` for Production.

---

## Step 3.2 Flow in GeoSpark

- **Connect:** User clicks "Connect social" on Dashboard → Analytics, chooses a platform (e.g. Facebook). They are sent to Late’s OAuth; after connecting, Late redirects back to GeoSpark.
- **Storage:** We store one row in `user_integrations` per business with `platform = 'late_aggregator'` and `account_id` = Late profile ID. That profile can have multiple social accounts attached (Facebook, Instagram, etc.).
- **Posting:** Later, posting from GeoSpark to socials will use the Late API with this profile and the chosen account IDs.

---

## Step 3.3 Late docs

- **Quickstart:** https://docs.getlate.dev/quickstart  
- **Connect (OAuth):** https://docs.getlate.dev/core/connect  
- **Platforms:** https://docs.getlate.dev/platforms  

---

## Step 3.4 Pricing (Late)

- Free tier: 2 profiles, 20 posts/month.
- Build: $13/mo (10 Social Sets). Each GeoSpark business that connects socials = 1 profile/Social Set.
