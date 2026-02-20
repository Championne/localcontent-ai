"""
Fresh sources scraper.
Scrapes untapped sources that most cold emailers don't use:
  - Software directories (Vagaro, Mindbody, Yelp collections)
  - Award/best-of lists via Google search
  - Industry association directories

These prospects get 0-2 cold emails/day vs 10-50 from Google Maps.
Expected response rate: 12-20% (2-3x better than Outscraper).

Runs autonomously as part of the daily pipeline.
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

# Software directories that list local businesses publicly
SOFTWARE_DIRECTORIES = {
    "Hair Salon": [
        {"name": "vagaro", "url_template": "https://www.vagaro.com/{category}/{city_slug}", "category": "hair-salons"},
        {"name": "fresha", "url_template": "https://www.fresha.com/{city_slug}/hair-salon", "category": "hair-salon"},
    ],
    "Restaurant": [
        {"name": "opentable", "url_template": "https://www.opentable.com/{city_slug}-restaurants", "category": "restaurants"},
    ],
    "Fitness": [
        {"name": "classpass", "url_template": "https://classpass.com/studios/{city_slug}", "category": "studios"},
        {"name": "mindbody", "url_template": "https://www.mindbody.io/explore?location={city}", "category": "fitness"},
    ],
}

# Award search queries by category
AWARD_SEARCH_QUERIES = {
    "Hair Salon": [
        "best hair salons {city} {year}",
        "top rated salons {city} {year}",
        "best of {city} hair salon award",
        "{city} salon award winners",
    ],
    "Restaurant": [
        "best restaurants {city} {year}",
        "best new restaurants {city} {year}",
        "{city} restaurant awards {year}",
    ],
    "default": [
        "best {category} {city} {year}",
        "top rated {category} {city}",
        "award winning {category} {city} {year}",
    ],
}


class FreshSourcesScraper:

    def scrape_all(
        self,
        category: str | None = None,
        city: str | None = None,
        limit: int = 50,
    ) -> list[dict]:
        category = category or settings.target_category
        city = city or settings.target_city
        all_prospects = []

        # 1. Software directories
        try:
            software = self.scrape_software_directories(category, city, limit=limit // 2)
            all_prospects.extend(software)
            logger.info(f"Fresh sources — software directories: {len(software)} prospects")
        except Exception as e:
            logger.error(f"Software directory scrape failed: {e}")

        # 2. Award/best-of lists
        try:
            awards = self.scrape_award_lists(category, city, limit=limit // 2)
            all_prospects.extend(awards)
            logger.info(f"Fresh sources — award lists: {len(awards)} prospects")
        except Exception as e:
            logger.error(f"Award list scrape failed: {e}")

        logger.info(f"Fresh sources total: {len(all_prospects)} prospects")
        return all_prospects[:limit]

    # ── Software Directories ──

    def scrape_software_directories(
        self, category: str, city: str, limit: int = 25
    ) -> list[dict]:
        directories = SOFTWARE_DIRECTORIES.get(category, [])
        if not directories:
            directories = SOFTWARE_DIRECTORIES.get("default", [])

        city_slug = city.split(",")[0].strip().lower().replace(" ", "-")
        prospects = []

        for directory in directories:
            try:
                url = directory["url_template"].format(
                    category=directory.get("category", ""),
                    city_slug=city_slug,
                    city=city,
                )
                new_prospects = self._scrape_directory_page(url, directory["name"], category, city)
                prospects.extend(new_prospects)
                time.sleep(3)
            except Exception as e:
                logger.warning(f"Failed to scrape {directory['name']}: {e}")

        return prospects[:limit]

    @retry(max_attempts=2, delay=3.0)
    def _scrape_directory_page(self, url: str, source_name: str, category: str, city: str) -> list[dict]:
        logger.info(f"Scraping directory: {url}")
        resp = requests.get(url, headers=HEADERS, timeout=15, allow_redirects=True)
        if resp.status_code != 200:
            return []

        soup = BeautifulSoup(resp.text, "html.parser")
        prospects = []

        # Generic extraction: look for business-like cards/listings
        # Each directory has different HTML, so we look for common patterns
        business_cards = (
            soup.select('[class*="business"], [class*="venue"], [class*="studio"], [class*="salon"], [class*="listing"], [class*="result"]')
            or soup.select("article, .card, [data-testid]")
        )

        for card in business_cards[:30]:
            name_el = card.select_one("h2, h3, h4, [class*='name'], [class*='title'], a[href]")
            if not name_el:
                continue

            name = name_el.get_text(strip=True)
            if not name or len(name) < 3 or len(name) > 100:
                continue

            link = name_el.get("href", "")
            address_el = card.select_one("[class*='address'], [class*='location'], address")
            address = address_el.get_text(strip=True) if address_el else None

            phone_el = card.select_one("[class*='phone'], a[href^='tel:']")
            phone = None
            if phone_el:
                href = phone_el.get("href", "")
                phone = clean_phone(href.replace("tel:", "") if "tel:" in href else phone_el.get_text(strip=True))

            prospects.append({
                "business_name": name,
                "category": category,
                "city": city.split(",")[0].strip(),
                "state": city.split(",")[1].strip() if "," in city else settings.target_state,
                "address": address,
                "contact_phone": phone,
                "website": link if link.startswith("http") else None,
                "source": "fresh_source",
                "prospect_source": "fresh_source",
                "prospect_source_detail": f"software_directory:{source_name}",
            })

        return prospects

    # ── Award / Best-of Lists ──

    def scrape_award_lists(
        self, category: str, city: str, limit: int = 25
    ) -> list[dict]:
        queries = AWARD_SEARCH_QUERIES.get(category, AWARD_SEARCH_QUERIES["default"])
        year = "2026"
        city_name = city.split(",")[0].strip()
        prospects = []

        for query_template in queries[:2]:
            query = query_template.format(city=city_name, category=category.lower(), year=year)
            try:
                results = self._search_and_extract(query, category, city)
                prospects.extend(results)
                time.sleep(5)  # Be polite to search engines
            except Exception as e:
                logger.warning(f"Award search failed for '{query}': {e}")

        # Deduplicate by name
        seen = set()
        unique = []
        for p in prospects:
            key = p["business_name"].lower().strip()
            if key not in seen:
                seen.add(key)
                unique.append(p)

        return unique[:limit]

    @retry(max_attempts=2, delay=5.0)
    def _search_and_extract(self, query: str, category: str, city: str) -> list[dict]:
        """Search Google and extract business names from 'best of' list articles."""
        # Use a search-friendly approach via DuckDuckGo HTML
        search_url = f"https://html.duckduckgo.com/html/?q={requests.utils.quote(query)}"
        resp = requests.get(search_url, headers=HEADERS, timeout=15)
        if resp.status_code != 200:
            return []

        soup = BeautifulSoup(resp.text, "html.parser")
        result_links = []

        for a in soup.select("a.result__a"):
            href = a.get("href", "")
            # Filter for actual list/article pages
            if any(kw in href.lower() for kw in ["best", "top", "award", "winner"]):
                result_links.append(href)

        prospects = []
        for link in result_links[:3]:
            try:
                article_prospects = self._extract_businesses_from_article(link, category, city)
                prospects.extend(article_prospects)
                time.sleep(3)
            except Exception as e:
                logger.debug(f"Failed to extract from {link}: {e}")

        return prospects

    def _extract_businesses_from_article(self, url: str, category: str, city: str) -> list[dict]:
        """Extract business names from a 'best of' article."""
        try:
            resp = requests.get(url, headers=HEADERS, timeout=15, allow_redirects=True)
            if resp.status_code != 200:
                return []
        except requests.RequestException:
            return []

        soup = BeautifulSoup(resp.text, "html.parser")
        prospects = []

        # Best-of articles typically list businesses in h2/h3 tags or numbered lists
        headings = soup.select("h2, h3")
        city_name = city.split(",")[0].strip().lower()

        for h in headings:
            text = h.get_text(strip=True)
            # Filter: must look like a business name (not article section headers)
            if not text or len(text) < 3 or len(text) > 80:
                continue
            # Skip generic headers
            if any(skip in text.lower() for skip in [
                "best of", "top ", "our pick", "how we", "methodology",
                "what is", "why ", "frequently", "faq", "related", "share",
                "comment", "table of content", "conclusion", "introduction",
            ]):
                continue
            # Remove numbering (e.g., "1. Salon Name" or "5) Salon Name")
            cleaned = re.sub(r"^\d+[\.\)\-\s]+", "", text).strip()
            if cleaned and len(cleaned) >= 3:
                prospects.append({
                    "business_name": cleaned,
                    "category": category,
                    "city": city.split(",")[0].strip(),
                    "state": city.split(",")[1].strip() if "," in city else settings.target_state,
                    "source": "fresh_source",
                    "prospect_source": "fresh_source",
                    "prospect_source_detail": f"award_list:{url[:100]}",
                })

        return prospects[:20]

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
        city: str | None = None,
        limit: int = 50,
    ) -> dict:
        prospects = self.scrape_all(category, city, limit)
        if not prospects:
            return {"scraped": 0, "saved": 0, "skipped": 0, "errors": 0}
        result = self.save_to_supabase(prospects)
        result["scraped"] = len(prospects)
        return result
