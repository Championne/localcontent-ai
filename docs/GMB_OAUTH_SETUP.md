# Step 2: Google Business Profile (GMB) OAuth setup

Follow these steps once. After this, "Connect Google Business Profile" on the Analytics page will work.

---

## 2.1 Create or use a Google Cloud project

1. Go to **Google Cloud Console**: https://console.cloud.google.com/
2. In the top bar, click the project dropdown → **New Project** (or choose an existing project).
3. Name it e.g. **GeoSpark** → Create.
4. Make sure the new project is selected (check the project name in the top bar).

---

## 2.2 Enable the required APIs

1. In the left menu: **APIs & Services** → **Library** (or go to https://console.cloud.google.com/apis/library).
2. Search and enable these APIs (click the API → **Enable**):
   - **Google My Business Account Management API**
   - **Google My Business Business Information API**
   - **Business Profile Performance API** (for insights later)

---

## 2.3 Configure the OAuth consent screen

This is the screen users see when they click “Connect Google Business Profile” and are sent to Google to approve access.

1. In Google Cloud Console, open the left menu → **APIs & Services** → **OAuth consent screen**  
   (direct: https://console.cloud.google.com/apis/credentials/consent )

2. **User type** (only when you create the consent screen for the first time)
   - Select **External** (so any Google account can connect; e.g. your clients).
   - If you only use Google Workspace and want only your org: choose **Internal**.
   - Click **Create**.
   - **If you already have an OAuth setup (e.g. GeoSpark/LocalContentAI):** You won’t see “External” — that was chosen when the app was first created. Open **APIs & Services → OAuth consent screen**. On the dashboard you’ll see “User type: External” or “Internal” at the top. Skip to step 4 (Scopes) and 5 (Test users) and make sure `business.manage` is added and your test users are listed.

3. **App information (step 1 of consent screen)**
   - **App name:** `GeoSpark` (or your product name).
   - **User support email:** your email (dropdown: pick the one that can receive user support).
   - **App logo:** leave empty for now (optional).
   - **Application home page** (optional): e.g. `https://geospark.ai` or your landing URL.
   - **Application privacy policy link** (optional for Testing; required if you later publish): link to your privacy policy.
   - **Application terms of service link** (optional): leave empty unless you have one.
   - **Authorized domains** (optional for Testing): if you add a home page URL, add the domain there (e.g. `geospark.ai`) without `https://`.
   - Click **Save and Continue**.

4. **Scopes (step 2)**
   - Click **Add or remove scopes**.
   - In the filter/search box, type: `business.manage`.
   - Enable: **“…/auth/business.manage”** (Google My Business API: manage your Business Profile).
   - Click **Update** at the bottom of the scope list, then **Save and Continue**.

5. **Test users (step 3)** — only if the app is in **Testing** mode
   - You’ll see “Test users” (or “Add users”).
   - Click **Add users**.
   - Enter the **email address** of every Google account that will use “Connect Google Business Profile” (e.g. your own Gmail or business Gmail). One email per line or add one by one.
   - Click **Add** → **Save and Continue**.
   - Without this, only project owners can sign in; other accounts will get “access_denied” or “blocked”.

6. **Summary (step 4)**
   - Check that App name, Scopes, and Test users (if any) look correct.
   - Click **Back to Dashboard**.

**If you see “Publishing status: Testing”:** only Test users can complete the OAuth flow. To allow any Google user (e.g. customers), you’d need to submit the app for verification later; for now, Test users are enough.

---

## 2.4 Create OAuth 2.0 credentials

1. **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth client ID**.
2. **Application type:** Web application.
3. **Name:** e.g. "GeoSpark Web".
4. **Authorized redirect URIs** — add **both**:
   - Local:  
     `http://localhost:3000/api/integrations/gmb/callback`
   - Production (replace with your real domain):  
     `https://YOUR-DOMAIN.com/api/integrations/gmb/callback`  
     Example: `https://geospark.ai/api/integrations/gmb/callback`
5. Click **Create**.
6. Copy the **Client ID** and **Client secret** (you’ll need them in the next step).

---

## 2.5 Add credentials to `.env.local`

Open `.env.local` in the project root and add (replace with your real values):

```env
# Google Business Profile (GMB) OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

- Do **not** commit `.env.local` to git (it should already be in `.gitignore`).
- For production (Vercel): add the same variables in **Project → Settings → Environment Variables**.

---

## 2.6 Redirect URI for production

When you deploy (e.g. Vercel):

1. Replace `YOUR-DOMAIN.com` in step 2.4 with your real domain (e.g. `geospark.ai`).
2. Add that exact redirect URI in Google Cloud Console (**Credentials** → your OAuth client → **Authorized redirect URIs**).
3. Ensure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in the production environment.

---

## 2.7 Test the flow

1. Start the app: `npm run dev`
2. Log in to GeoSpark, go to **Dashboard → Analytics**.
3. Select a business (if you have more than one).
4. Click **Connect Google Business Profile**.
5. You should be redirected to Google → choose the Google account that has (or will have) the Business Profile.
6. Approve the requested scope (`business.manage`).
7. You should be redirected back to `/dashboard/analytics?connected=gmb` and see "Google Business" under Connected accounts.

If you get an error:

- **redirect_uri_mismatch** → The redirect URI in the request must match exactly one of the URIs in step 2.4 (including http vs https and trailing slashes).
- **access_denied** or consent screen → Add your test user in OAuth consent screen (Test users) or publish the app.
- **Server misconfiguration** → Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in `.env.local` and restart `npm run dev`.

---

## Next step

After GMB connect works: **Step 3 – Late API** (optional, for social posting) or **Step 4 – GMB insights sync** (fill metrics from GMB so the Impact Dashboard shows real data). See `docs/SOCIAL_AGGREGATOR_CHOICE.md` and the implementation plan.
