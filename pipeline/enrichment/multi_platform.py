"""
Multi-platform enrichment: Yelp and website analysis.
Enriches prospect data beyond Google Maps + Instagram.
"""

import re
import requests
from bs4 import BeautifulSoup
from config.database import db
from utils.logger import logger
from utils.helpers import retry, clean_email


HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}


class MultiPlatformEnricher:

    @retry(max_attempts=2, delay=3.0)
    def scrape_yelp(self, yelp_url: str) -> dict | None:
        if not yelp_url:
            return None

        logger.info(f"Scraping Yelp: {yelp_url}")
        try:
            resp = requests.get(yelp_url, headers=HEADERS, timeout=15)
            if resp.status_code != 200:
                return None

            soup = BeautifulSoup(resp.text, "html.parser")

            rating = None
            rating_el = soup.select_one('[aria-label*="star rating"]')
            if rating_el:
                label = rating_el.get("aria-label", "")
                try:
                    rating = float(label.split()[0])
                except (ValueError, IndexError):
                    pass

            reviews_count = None
            review_el = soup.select_one('a[href*="reviews"] span, span[class*="review"]')
            if review_el:
                text = review_el.get_text(strip=True)
                import re
                nums = re.findall(r"\d+", text)
                if nums:
                    reviews_count = int(nums[0])

            price = None
            price_el = soup.select_one('span[class*="priceRange"]')
            if price_el:
                price = price_el.get_text(strip=True)

            return {
                "platform": "yelp",
                "rating": rating,
                "reviews_count": reviews_count,
                "price_range": price,
                "url": yelp_url,
            }
        except Exception as e:
            logger.warning(f"Yelp scrape failed for {yelp_url}: {e}")
            return None

    @retry(max_attempts=2, delay=3.0)
    def analyze_website(self, website: str) -> dict | None:
        if not website:
            return None

        if not website.startswith("http"):
            website = f"https://{website}"

        logger.info(f"Analyzing website: {website}")
        try:
            resp = requests.get(website, headers=HEADERS, timeout=15, allow_redirects=True)
            if resp.status_code != 200:
                return None

            soup = BeautifulSoup(resp.text, "html.parser")
            text = soup.get_text(separator=" ", strip=True).lower()

            has_booking = any(
                kw in text
                for kw in ["book now", "book online", "schedule", "appointment", "reserve"]
            )
            has_blog = bool(soup.select('a[href*="blog"], a[href*="articles"], a[href*="news"]'))
            has_ssl = website.startswith("https")

            # Check for common platforms
            html = resp.text.lower()
            platform = "custom"
            if "squarespace" in html:
                platform = "squarespace"
            elif "wix" in html:
                platform = "wix"
            elif "wordpress" in html or "wp-content" in html:
                platform = "wordpress"
            elif "shopify" in html:
                platform = "shopify"
            elif "godaddy" in html:
                platform = "godaddy"

            # Page count estimate (nav links)
            nav_links = set()
            for a in soup.select("nav a, header a"):
                href = a.get("href", "")
                if href.startswith("/") and len(href) > 1:
                    nav_links.add(href)

            social_links = self._extract_social_links(soup, website)
            emails = self._extract_emails(soup, resp.text)

            return {
                "has_ssl": has_ssl,
                "has_booking": has_booking,
                "has_blog": has_blog,
                "platform": platform,
                "estimated_pages": len(nav_links),
                "url": website,
                "social_links": social_links,
                "emails": emails,
            }
        except Exception as e:
            logger.warning(f"Website analysis failed for {website}: {e}")
            return None

    def _extract_social_links(self, soup: BeautifulSoup, base_url: str) -> dict:
        links = {}
        for a in soup.find_all("a", href=True):
            href = a["href"].lower()
            if "instagram.com/" in href and "instagram" not in links:
                links["instagram"] = a["href"]
            elif "facebook.com/" in href and "facebook" not in links:
                links["facebook"] = a["href"]
            elif "tiktok.com/" in href and "tiktok" not in links:
                links["tiktok"] = a["href"]
            elif "youtube.com/" in href and "youtube" not in links:
                links["youtube"] = a["href"]
        return links

    def _extract_emails(self, soup: BeautifulSoup, html: str) -> list[str]:
        found = set()
        for match in re.findall(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}", html):
            email = clean_email(match)
            if email and not any(x in email for x in ["example.com", "sentry.io", "wixpress", "schema.org"]):
                found.add(email)
        for a in soup.find_all("a", href=True):
            if a["href"].startswith("mailto:"):
                email = clean_email(a["href"].replace("mailto:", "").split("?")[0])
                if email:
                    found.add(email)
        return list(found)[:5]

    def enrich_lead(self, lead_id: str, lead_data: dict) -> dict:
        """Run all enrichment for a lead and save results."""
        results = {}

        # Yelp
        yelp_url = lead_data.get("yelp_url")
        if yelp_url:
            yelp_data = self.scrape_yelp(yelp_url)
            if yelp_data:
                results["yelp"] = yelp_data
                self._save_social_profile(lead_id, "yelp", yelp_data)

        # Website analysis + social/email extraction
        website = lead_data.get("website")
        if website:
            site_data = self.analyze_website(website)
            if site_data:
                results["website"] = site_data
                self._update_lead_from_website(lead_id, lead_data, site_data)

        return results

    def _update_lead_from_website(self, lead_id: str, lead_data: dict, site_data: dict):
        updates = {}
        social = site_data.get("social_links", {})

        if social.get("instagram") and not lead_data.get("instagram_url"):
            updates["instagram_url"] = social["instagram"]
        if social.get("facebook") and not lead_data.get("facebook_url"):
            updates["facebook_url"] = social["facebook"]

        emails = site_data.get("emails", [])
        if emails and not lead_data.get("contact_email"):
            updates["contact_email"] = emails[0]
            updates["owner_email"] = emails[0]
            updates["email_source"] = "website"

        if updates:
            try:
                db.table("outreach_leads").update(updates).eq("id", lead_id).execute()
                logger.info(f"Website enrichment for {lead_id}: {list(updates.keys())}")
            except Exception as e:
                logger.error(f"Failed to update lead {lead_id} from website: {e}")

    def _save_social_profile(self, lead_id: str, platform: str, data: dict):
        try:
            row = {
                "lead_id": lead_id,
                "platform": platform,
                "profile_url": data.get("url"),
                "raw_data": data,
            }
            db.table("prospect_social_profiles").upsert(
                row, on_conflict="lead_id,platform"
            ).execute()
        except Exception as e:
            logger.error(f"Failed to save {platform} profile for lead {lead_id}: {e}")
