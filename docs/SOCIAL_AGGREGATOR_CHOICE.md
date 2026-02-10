# Keuze: Social Media API-aggregator voor GeoSpark

## Beslissing (actueel)

**We gaan voor Late + GMB:**
- **GMB:** directe integratie (eigen OAuth, insights, baseline). Al in bouw.
- **Social (FB, IG, LinkedIn, X, etc.):** **Late API** (getlate.dev) als aggregator. Eén integratie; per business één Late "Social Set".

Zie onder voor onderbouwing, pricing en data-strategie.

---

## Doel

Eén externe service gebruiken om te posten naar **sociale kanalen** (Facebook, Instagram, LinkedIn, X, etc.) vanuit GeoSpark, zodat we geen aparte OAuth- en post-API’s per platform hoeven te bouwen. **GMB** blijft een eigen, directe integratie (zoals al geïmplementeerd).

---

## Meerdere businesses = meerdere API-connecties

Bij GeoSpark kunnen gebruikers **meerdere businesses** hebben (afhankelijk van tier):

| Tier    | Businesses per account |
|---------|-------------------------|
| Starter | 1                       |
| Pro     | 3                       |
| Premium | 10                      |

**Elke business heeft een eigen set connecties.** Een business heeft bijvoorbeeld:
- één eigen GMB-locatie (of account),
- één eigen Facebook-pagina, Instagram-account, LinkedIn-pagina, enz.

Dus:
- **Ja, meerdere businesses betekent meerdere API-connecties.**
- Integraties zijn **per business** opgeslagen (`user_integrations.business_id`).
- Bij de aggregator (Late of Ayrshare) telt elk **verbonden business** als één “profile” / “Social Set”.

**Gevolgen voor aggregator-pricing:**
- Late: 1 “Social Set” = 1 business die social heeft gekoppeld. Een Pro-gebruiker met 3 businesses die allemaal social koppelen = **3 Social Sets**.
- Ayrshare: 1 “social profile” = 1 business → zelfde logica.

**Rekenvoorbeelden (Late):**
- 20 Pro-gebruikers, elk koppelt 2 van de 3 businesses → 40 Social Sets → plan **Accelerate** ($33/maand, 50 sets).
- 50 Pro-gebruikers, 60% koppelt alle 3 businesses → 90 Social Sets → plan **Unlimited** ($667/maand) of contact voor volume.
- Starter-gebruikers: max 1 business → max 1 Social Set per gebruiker.

**Aanbeveling:** Houd bij het kiezen van een Late-plan rekening met **totaal aantal businesses dat daadwerkelijk social koppelt**, niet alleen aantal GeoSpark-accounts. Planlimits per tier (1 / 3 / 10 businesses) bepalen de bovengrens per gebruiker.

---

## Vergeleken diensten

| Criterium | **Late API** (getlate.dev) | **Ayrshare** |
|-----------|----------------------------|---------------|
| **Pricing (multi-tenant)** | Per **Social Set** (= 1 verbonden business). Free: 2 sets. Build: **$13/maand** (10 sets). Accelerate: **$33/maand** (50 sets). Unlimited: **$667/maand** (onbeperkt). | Per **profile** (= 1 verbonden business). Launch: **$299/maand** (10). Business: **$599/maand** (30, daarna per profiel). |
| **Kosten bij 10 verbonden businesses** | ~$13/maand (Build) | ~$299/maand |
| **Kosten bij 50 verbonden businesses** | ~$33/maand (Accelerate) | ~$599+ /maand |
| **Platformen** | 13 (o.a. X, Instagram, TikTok, LinkedIn, Facebook, YouTube, **Google Business**, Threads, Reddit, Pinterest, Bluesky, Telegram, Snapchat) | 13+ (incl. Google Business) |
| **Developer API** | REST API, Bearer token (API key). Eén key, accounts koppelen via hun OAuth of white-label. | REST API, uitgebreide docs, meerdere talen. Business Plan: JWT SSO, “profile per end-user”. |
| **White-label** | Ja, “end users never see the Late brand”. | Ja, custom branding in Business Plan. |
| **Scheduling** | In de API + queue/calendar. | In de API. |
| **Analytics** | Add-on (o.a. unified engagement metrics via API). | Inbegrepen (Basic/Advanced per plan). |
| **Webhooks** | Ja (post published/failed, analytics). | Ja. |
| **Free tier** | Ja, 2 profielen, 20 posts, geen creditcard. | 14 dagen trial op Launch. |
| **Documentatie** | Docs, cURL/Node/Python, uptime SLA 99.7%. | Uitgebreid, meerdere talen. |

---

## Aanbeveling: **Late API (getlate.dev)**

**Waarom Late voor GeoSpark:**

1. **Kosten**  
   Bij 10–50 klanten die social gebruiken: $13–33/maand vs. $299–599 bij Ayrshare. Beter passend voor een early-stage product en makkelijker te verantwoorden in de unit-economie.

2. **Zelfde kernfunctionaliteit**  
   Eén API voor posten + scheduling, 13 platformen (incl. **Google Business** als je GMB ook via de aggregator wilt aanbieden naast jullie eigen GMB-integratie), white-label, webhooks. Voldoende voor “post naar alle socials vanuit GeoSpark”.

3. **Echte free tier**  
   2 profielen en 20 posts/maand zonder creditcard; ideaal om integratie te bouwen en te testen voordat je betaalt.

4. **Eenvoudige auth**  
   Eén API key; gebruikers verbinden hun accounts via Late (of hun white-label flow). Geen eigen OAuth voor elk platform nodig.

5. **Expliciet voor SaaS/white-label**  
   Ontworpen voor “SaaS products, agencies, white-label social media tools” en “unlimited social accounts” met reference-by-ID in API-calls.

**Wanneer toch Ayrshare overwegen:**

- Als je later expliciet **JWT SSO** en “één Ayrshare-profile per GeoSpark-user” in hun model wilt met dedicated support.
- Als je Enterprise-features nodig hebt (zeer grote aantallen profielen, dedicated account manager) en budget hebt voor $599+/maand.

---

## Aanbevolen aanpak voor GeoSpark

1. **GMB:**  
   Huidige **directe integratie** behouden (OAuth, `user_integrations`, insights/baseline in eigen Impact Analytics). GMB is het belangrijkste kanaal voor lokale klanten.

2. **Overige social (FB, IG, LinkedIn, X, etc.):**  
   **Late API** als aggregator:
   - Eén Late-account voor GeoSpark. Plan kiezen op basis van **totaal aantal businesses** dat social koppelt (niet aantal gebruikers): zie tabel hierboven.
   - **Per business:** één Late “Social Set” aanmaken, social accounts voor die business koppelen, Late profile/set-ID opslaan in `user_integrations` (platform = `late_aggregator`, `business_id` = die business).
   - Posten en scheduling vanuit GeoSpark via Late REST API (Bearer token in env, bv. `LATE_API_KEY`); bij elke call de juiste Late profile-ID meesturen voor de gekozen business.
   - Optioneel: webhooks van Late voor post status/analytics.

3. **Schema en UX**
   - Integraties zijn **per business** (`user_integrations.business_id`). Connect-flow moet een `businessId` meekrijgen (bijv. query of gekozen business in de UI).
   - Analytics (baseline, metric_history) eveneens per business, zodat Impact Dashboard per business “before/after” kan tonen.
   - In de UI: bij “Connect GMB” of “Connect social” eerst business kiezen (of context van huidige business gebruiken).

4. **Volgende stap**  
   Late-account aanmaken (free tier), API key in `.env` zetten. Minimale flow: per business “Connect social” → Late Social Set aanmaken/koppelen → ID in `user_integrations` opslaan; daarna “Post to connected socials” via Late API met die ID.

5. **Bestaande database**  
   Als `user_integrations` (of baseline/metric tables) al bestaan **zonder** `business_id`, moet je een migratie draaien: kolom `business_id` toevoegen, vullen met de eerste business per user (`UPDATE ... SET business_id = (SELECT id FROM businesses WHERE user_id = user_integrations.user_id LIMIT 1)`), daarna NOT NULL en UNIQUE aanpassen. Nieuw schema staat in `lib/database/integrations-and-analytics-schema.sql`.

---

## Start nu vs. later bij groei

### Aanbeveling: **nu starten met aggregator, GMB direct**

| Nu (start) | Bij groei |
|------------|-----------|
| **GMB:** direct (al gebouwd). Essentieel voor lokaal; data (views, reviews) is de kern van Impact Analytics. | GMB direct **blijft**. Geen aggregator voor GMB-insights vervangen. |
| **Social (FB, IG, LinkedIn, X, etc.):** **Late API** als aggregator. Eén integratie, lage kosten, snel live. | **Eerst:** blijf Late zolang kosten en data voldoende zijn. **Later optioneel:** per kanaal direct bouwen als het de moeite waard is (zie hieronder). |

**Waarom nu niet zelf alle social-API’s bouwen:**  
Elk platform = eigen OAuth, token refresh, rate limits, onderhoud bij API-wijzigingen. Dat vertraagt “post naar alle kanalen” met maanden. De meerwaarde van GeoSpark zit in **content + lokaal**, niet in het nabouwen van 5 social-API’s.

**Wanneer bij groei wél zelf bouwen overwegen:**

- **Kosten:** Late (of andere aggregator) wordt structureel duur (bijv. 500+ verbonden businesses, Unlimited + add-ons) *en* je hebt engineering-capacity → overweeg directe integratie voor de **2–3 belangrijkste** kanalen (typisch Meta, LinkedIn), rest via aggregator of later.
- **Data:** Je hebt behoefte aan **diepere analytics** (demographics, story vs feed, best time to post) die de aggregator niet (goed) levert → directe API voor dat kanaal, eventueel naast Late voor posten.
- **Betrouwbaarheid/features:** Aggregator mist een feature of heeft veel downtime → dan dat kanaal direct ondersteunen.

**Praktische richtlijn:** Blijf de aggregator als default. Bouw alleen direct waar het duidelijk meer waarde oplevert (kosten, data of betrouwbaarheid) en herzie dat jaarlijks of bij grote schaalsprongen.

---

## Data uit de APIs: wat we terugkrijgen en wat het voor het product doet

Welke data we binnenkrijgen bepaalt hoe goed we Impact Analytics, content-performance en toekomstige features kunnen maken. Hier het onderscheid tussen **GMB direct**, **aggregator (Late)** en **directe social-API’s**.

### Via GMB (directe integratie) – wat we hebben / gaan gebruiken

| Data | Gebruik in product |
|------|--------------------|
| **Views, searches, actions** (phone, website, directions) | Kern van Impact Dashboard: baseline, “before/after”, trend. Antwoord op “werkt het?”. |
| **Reviews + gemiddelde rating** | Baseline/reputatie; basis voor toekomstige Review Responder en sentiment. |
| **Post performance** (views/clicks per GMB-post) | Koppelen van gegenereerde content aan resultaat: “deze post had X weergaven”. |

Deze data is **essentieel** voor lokale klanten en voor churn-reductie. Daarom GMB altijd direct houden.

### Via aggregator (bijv. Late)

| Data | Gebruik in product |
|------|--------------------|
| **Post status** (published / failed) | UX: “geplaatst” of “mislukt” in library/dashboard; webhooks voor sync. |
| **Unified analytics** (likes, comments, impressions, reach, clicks) | Impact Dashboard: “social engagement” naast GMB; trend over tijd. |
| **Per-post metrics** | In content-library: “deze post had X bereik / Y likes” → welk type content werkt. |

Dit is voldoende om **nu** een sterke Impact-ervaring te bieden (GMB + social in één beeld) en om content-performance zichtbaar te maken. Granulariteit (bijv. story vs feed, demographics) is beperkter dan bij directe platform-API’s.

### Via directe social-API’s (als we die later bouwen)

| Extra t.o.v. aggregator | Gebruik in product |
|------------------------|--------------------|
| **Diepere insights** (Meta: demographics, story vs feed; LinkedIn: volgersgroei, organisch vs paid) | Rijkere Impact Dashboard; betere “wat werkt”-adviezen. |
| **Real-time / fijnmaziger data** | Snellere updates, specifiekere rapporten. |
| **Comments/DM’s (waar toegestaan)** | Toekomstige “social inbox” of sentiment. |

Dit is **nice-to-have** voor een latere fase; niet nodig om nu te starten.

### Aanbeveling op data

- **Nu:** GMB-data zelf ophalen en in `baseline_snapshots` / `metric_history` opslaan. Social-data via Late (analytics-add-on) **periodiek in onze eigen tabellen syncen** (zelfde metric_types, per business), zodat het Impact Dashboard één geheel blijft (GMB + social) zonder afhankelijk te zijn van realtime-aanroepen naar Late.
- **Later:** Als we voor een kanaal (bijv. Meta) direct gaan, die extra velden (demographics, story/feed) toevoegen aan onze metrics en in dezelfde dashboard-logica gebruiken. Aggregator-data en directe data naast elkaar ondersteunen is goed mogelijk (zelfde `metric_type`-concept, andere `metric_source`).
