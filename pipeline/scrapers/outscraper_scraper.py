"""
Outscraper Google Maps scraper.
Searches by category + city, extracts business data, saves to Supabase.
"""

from outscraper import ApiClient
from config.settings import settings
from config.database import db
from utils.logger import logger
from utils.helpers import clean_email, clean_phone, extract_instagram_username, retry


class OutscraperScraper:
    def __init__(self):
        self.client = ApiClient(api_key=settings.outscraper_api_key)

    ALL_CATEGORIES = [
        'Hair Salon', 'Barber Shop', 'Nail Salon', 'Spa & Wellness',
        'Dental Practice', 'Chiropractor', 'Veterinarian',
        'Restaurant', 'Cafe', 'Gym & Fitness', 'Yoga Studio',
        'Auto Repair', 'Plumber', 'Electrician', 'HVAC',
        'Real Estate Agent', 'Accountant', 'Photographer', 'Pet Grooming',
    ]

    def scrape_google_maps(
        self,
        category: str | None = None,
        location: str | None = None,
        limit: int = 100,
    ) -> list[dict]:
        category = category or settings.target_category
        location = location or getattr(settings, 'target_location', None) or settings.target_city

        if category == 'All Categories':
            return self._scrape_all_categories(location, limit)

        return self._scrape_single_category(category, location, limit)

    @retry(max_attempts=3, delay=5.0)
    def _scrape_single_category(self, category: str, location: str, limit: int) -> list[dict]:
        query = f"{category} in {location}"
        logger.info(f"Scraping Google Maps: '{query}' (limit={limit})")

        results = self.client.google_maps_search(
            query,
            limit=limit,
            language="en",
        )

        if not results or not results[0]:
            logger.warning(f"No results for '{query}'")
            return []

        businesses = []
        for item in results[0]:
            business = self._parse_business(item, category, location)
            if business:
                businesses.append(business)

        logger.info(f"Parsed {len(businesses)} businesses from {len(results[0])} results")
        return businesses

    def _scrape_all_categories(self, location: str, limit: int) -> list[dict]:
        per_category = max(3, limit // len(self.ALL_CATEGORIES))
        all_businesses = []

        for cat in self.ALL_CATEGORIES:
            if len(all_businesses) >= limit:
                break
            try:
                batch = self._scrape_single_category(cat, location, per_category)
                all_businesses.extend(batch)
            except Exception as e:
                logger.warning(f"Failed to scrape '{cat}': {e}")

        logger.info(f"All Categories: {len(all_businesses)} total from {len(self.ALL_CATEGORIES)} categories")
        return all_businesses[:limit]

    def _parse_business(self, item: dict, category: str, location: str) -> dict | None:
        name = item.get("name")
        if not name:
            return None

        social_links = self._extract_social_links(item)

        loc_parts = [p.strip() for p in location.split(",")]
        city_name = loc_parts[0] if loc_parts else location
        region = loc_parts[1] if len(loc_parts) > 1 else ""

        return {
            "business_name": name,
            "category": category,
            "website": item.get("site"),
            "contact_name": item.get("owner_name") or item.get("contact_name"),
            "contact_email": clean_email(
                item.get("email_1") or item.get("email")
            ),
            "contact_phone": clean_phone(
                item.get("phone") or item.get("phone_number")
            ),
            "owner_name": item.get("owner_name"),
            "owner_email": clean_email(item.get("email_1") or item.get("email")),
            "owner_phone": clean_phone(item.get("phone")),
            "address": item.get("full_address"),
            "city": item.get("city") or city_name,
            "state": item.get("state") or region,
            "zip": item.get("postal_code"),
            "google_rating": item.get("rating"),
            "google_reviews_count": item.get("reviews"),
            "google_maps_url": item.get("google_maps_url") or item.get("link"),
            "google_place_id": item.get("place_id"),
            "instagram_url": social_links.get("instagram"),
            "facebook_url": social_links.get("facebook"),
            "yelp_url": social_links.get("yelp"),
            "has_website": bool(item.get("site")),
            "has_social_media": bool(social_links),
            "source": "outscraper",
            "prospect_source": "outscraper",
            "source_details": {
                "query": f"{category} in {location}",
                "place_id": item.get("place_id"),
                "photos_count": item.get("photos_count"),
                "type": item.get("type"),
            },
        }

    def _extract_social_links(self, item: dict) -> dict:
        links = {}
        site = item.get("site", "") or ""
        socials = item.get("social_media", []) or []

        all_urls = [site] + (socials if isinstance(socials, list) else [])

        for url in all_urls:
            if not isinstance(url, str):
                continue
            url_lower = url.lower()
            if "instagram.com" in url_lower and "instagram" not in links:
                links["instagram"] = url
            elif "facebook.com" in url_lower and "facebook" not in links:
                links["facebook"] = url
            elif "yelp.com" in url_lower and "yelp" not in links:
                links["yelp"] = url
            elif "tiktok.com" in url_lower and "tiktok" not in links:
                links["tiktok"] = url

        return links

    def save_to_supabase(self, businesses: list[dict]) -> dict:
        saved = 0
        skipped = 0
        errors = 0

        for biz in businesses:
            try:
                # Dedup by business name + city
                existing = (
                    db.table("outreach_leads")
                    .select("id")
                    .eq("business_name", biz["business_name"])
                    .eq("city", biz.get("city", ""))
                    .execute()
                )

                if existing.data:
                    skipped += 1
                    continue

                row = {
                    "business_name": biz["business_name"],
                    "industry": biz.get("category"),
                    "category": biz.get("category"),
                    "website": biz.get("website"),
                    "contact_name": biz.get("contact_name"),
                    "contact_email": biz.get("contact_email"),
                    "contact_phone": biz.get("contact_phone"),
                    "owner_name": biz.get("owner_name"),
                    "owner_email": biz.get("owner_email"),
                    "owner_phone": biz.get("owner_phone"),
                    "address": biz.get("address"),
                    "city": biz.get("city"),
                    "state": biz.get("state"),
                    "zip": biz.get("zip"),
                    "google_rating": biz.get("google_rating"),
                    "google_reviews_count": biz.get("google_reviews_count"),
                    "google_maps_url": biz.get("google_maps_url"),
                    "instagram_url": biz.get("instagram_url"),
                    "facebook_url": biz.get("facebook_url"),
                    "yelp_url": biz.get("yelp_url"),
                    "source": biz.get("source"),
                    "prospect_source": biz.get("prospect_source"),
                    "source_details": biz.get("source_details"),
                    "status": "new",
                    "pipeline_status": "scraped",
                    "enrichment_status": "pending",
                }

                db.table("outreach_leads").insert(row).execute()
                saved += 1

            except Exception as e:
                logger.error(f"Failed to save {biz.get('business_name')}: {e}")
                errors += 1

        logger.info(f"Outscraper save: {saved} saved, {skipped} skipped, {errors} errors")
        return {"saved": saved, "skipped": skipped, "errors": errors}

    def scrape_and_save(
        self,
        category: str | None = None,
        city: str | None = None,
        limit: int = 100,
    ) -> dict:
        businesses = self.scrape_google_maps(category, city, limit)
        if not businesses:
            return {"scraped": 0, "saved": 0, "skipped": 0, "errors": 0}

        result = self.save_to_supabase(businesses)
        result["scraped"] = len(businesses)
        return result
