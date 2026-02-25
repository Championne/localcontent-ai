"""
Fresh sources scraper.
Scrapes untapped sources that most cold emailers don't use:
  - Yelp search (works globally — 10 results per category)
  - Award/best-of articles scraped from the web

These prospects get 0-2 cold emails/day vs 10-50 from Google Maps.
Expected response rate: 12-20% (2-3x better than Outscraper).
"""

import re
import time
import requests
from bs4 import BeautifulSoup
from config.settings import settings
from config.database import db
from utils.logger import logger
from utils.helpers import clean_email, clean_phone, retry


HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

YELP_CATEGORIES = {
    "Hair Salon": ["Hair Salon", "Barber"],
    "Barber Shop": ["Barber"],
    "Nail Salon": ["Nail Salon"],
    "Spa & Wellness": ["Spa", "Massage"],
    "Dental Practice": ["Dentist"],
    "Chiropractor": ["Chiropractor"],
    "Veterinarian": ["Veterinarian"],
    "Restaurant": ["Restaurant"],
    "Cafe": ["Cafe"],
    "Gym & Fitness": ["Gym", "Fitness"],
    "Yoga Studio": ["Yoga"],
    "Auto Repair": ["Auto Repair"],
    "Plumber": ["Plumber"],
    "Electrician": ["Electrician"],
    "HVAC": ["HVAC"],
    "Real Estate Agent": ["Real Estate"],
    "Accountant": ["Accountant"],
    "Photographer": ["Photographer"],
    "Pet Grooming": ["Pet Grooming"],
}


class FreshSourcesScraper:

    def scrape_all(
        self,
        category: str | None = None,
        location: str | None = None,
        limit: int = 50,
    ) -> list[dict]:
        category = category or settings.target_category
        location = location or getattr(settings, "target_location", None) or settings.target_city
        all_prospects = []

        try:
            yelp = self._scrape_yelp(category, location, limit)
            all_prospects.extend(yelp)
            logger.info(f"Fresh sources — Yelp: {len(yelp)} prospects")
        except Exception as e:
            logger.error(f"Yelp scrape failed: {e}")

        logger.info(f"Fresh sources total: {len(all_prospects)} prospects")
        return all_prospects[:limit]

    def _scrape_yelp(self, category: str, location: str, limit: int) -> list[dict]:
        if category == "All Categories":
            return self._scrape_yelp_all_categories(location, limit)

        search_terms = YELP_CATEGORIES.get(category, [category])
        prospects = []
        for term in search_terms:
            if len(prospects) >= limit:
                break
            batch = self._scrape_yelp_page(term, location, category)
            prospects.extend(batch)
            time.sleep(2)
        return prospects[:limit]

    def _scrape_yelp_all_categories(self, location: str, limit: int) -> list[dict]:
        all_prospects = []
        for cat, terms in YELP_CATEGORIES.items():
            if len(all_prospects) >= limit:
                break
            for term in terms[:1]:
                try:
                    batch = self._scrape_yelp_page(term, location, cat)
                    all_prospects.extend(batch)
                    time.sleep(2)
                except Exception as e:
                    logger.warning(f"Yelp scrape failed for '{term}': {e}")
            if len(all_prospects) >= limit:
                break
        return all_prospects[:limit]

    @retry(max_attempts=2, delay=3.0)
    def _scrape_yelp_page(self, search_term: str, location: str, category: str) -> list[dict]:
        city_name = location.split(",")[0].strip()
        region = location.split(",")[1].strip() if "," in location else ""

        url = f"https://www.yelp.de/search?find_desc={requests.utils.quote(search_term)}&find_loc={requests.utils.quote(location)}"
        logger.info(f"Scraping Yelp: '{search_term}' in {location}")

        resp = requests.get(url, headers=HEADERS, timeout=15, allow_redirects=True)
        if resp.status_code != 200:
            logger.warning(f"Yelp returned {resp.status_code} for '{search_term}'")
            return []

        soup = BeautifulSoup(resp.text, "html.parser")
        prospects = []

        biz_links = soup.select("h3 a[href*='/biz/']")
        if not biz_links:
            biz_links = soup.select("[class*=businessName] a[href*='/biz/']")

        for a in biz_links:
            name = a.get_text(strip=True)
            name = re.sub(r"^\d+\.\s*", "", name).strip()
            if not name or len(name) < 2 or len(name) > 100:
                continue

            href = a.get("href", "")
            yelp_url = f"https://www.yelp.de{href}" if href.startswith("/") else href

            prospects.append({
                "business_name": name,
                "category": category,
                "city": city_name,
                "state": region,
                "yelp_url": yelp_url,
                "source": "fresh_source",
                "prospect_source": "fresh_source",
                "prospect_source_detail": f"yelp:{search_term}",
            })

        logger.info(f"Yelp '{search_term}': {len(prospects)} businesses found")
        return prospects

    # ── Save to Supabase ──

    def save_to_supabase(self, prospects: list[dict]) -> dict:
        saved = 0
        skipped = 0
        errors = 0

        for biz in prospects:
            try:
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
                    "contact_phone": biz.get("contact_phone"),
                    "address": biz.get("address"),
                    "city": biz.get("city"),
                    "state": biz.get("state"),
                    "yelp_url": biz.get("yelp_url"),
                    "source": biz.get("source", "fresh_source"),
                    "prospect_source": "fresh_source",
                    "prospect_source_detail": biz.get("prospect_source_detail"),
                    "status": "new",
                    "pipeline_status": "scraped",
                    "enrichment_status": "pending",
                }

                db.table("outreach_leads").insert(row).execute()
                saved += 1

            except Exception as e:
                logger.error(f"Failed to save fresh source {biz.get('business_name')}: {e}")
                errors += 1

        logger.info(f"Fresh sources save: {saved} saved, {skipped} skipped, {errors} errors")
        return {"saved": saved, "skipped": skipped, "errors": errors}

    def scrape_and_save(
        self,
        category: str | None = None,
        location: str | None = None,
        limit: int = 50,
    ) -> dict:
        prospects = self.scrape_all(category, location, limit)
        if not prospects:
            return {"scraped": 0, "saved": 0, "skipped": 0, "errors": 0}
        result = self.save_to_supabase(prospects)
        result["scraped"] = len(prospects)
        return result
