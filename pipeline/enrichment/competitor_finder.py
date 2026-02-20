"""
Competitor intelligence.
Finds nearby competitors via Outscraper, analyzes their social presence,
and calculates gaps.
"""

from outscraper import ApiClient
from config.settings import settings
from config.database import db
from scrapers.instagram_scraper import InstagramScraper
from utils.logger import logger
from utils.helpers import extract_instagram_username, retry


class CompetitorFinder:
    def __init__(self):
        self.outscraper = ApiClient(api_key=settings.outscraper_api_key)
        self.ig_scraper = InstagramScraper()

    @retry(max_attempts=2, delay=5.0)
    def find_competitors(
        self,
        business_name: str,
        category: str,
        city: str,
        limit: int = 5,
    ) -> list[dict]:
        query = f"{category} in {city}"
        logger.info(f"Finding competitors for '{business_name}' via '{query}'")

        try:
            results = self.outscraper.google_maps_search(
                query, limit=limit + 5, language="en"
            )
        except Exception as e:
            logger.error(f"Outscraper competitor search failed: {e}")
            return []

        if not results or not results[0]:
            return []

        competitors = []
        for item in results[0]:
            name = item.get("name", "")
            if name.lower().strip() == business_name.lower().strip():
                continue

            ig_url = None
            socials = item.get("social_media", []) or []
            for s in (socials if isinstance(socials, list) else []):
                if isinstance(s, str) and "instagram.com" in s.lower():
                    ig_url = s
                    break

            competitors.append({
                "competitor_name": name,
                "competitor_instagram": extract_instagram_username(ig_url),
                "competitor_website": item.get("site"),
                "rating": item.get("rating"),
                "reviews_count": item.get("reviews"),
            })

            if len(competitors) >= limit:
                break

        return competitors

    def analyze_competitors(
        self, lead_id: str, lead_data: dict, max_competitors: int = 3
    ) -> list[dict]:
        business_name = lead_data.get("business_name", "")
        category = lead_data.get("category") or settings.target_category
        city = lead_data.get("city") or settings.target_city
        if lead_data.get("state"):
            city = f"{city}, {lead_data['state']}"

        competitors = self.find_competitors(business_name, category, city)
        if not competitors:
            return []

        # Get prospect's own Instagram data for gap calculation
        prospect_ig = self._get_prospect_ig(lead_id)

        analyzed = []
        for comp in competitors[:max_competitors]:
            ig_username = comp.get("competitor_instagram")
            comp_ig = None

            if ig_username:
                try:
                    comp_ig = self.ig_scraper.scrape_profile(ig_username)
                except Exception as e:
                    logger.warning(f"Failed to scrape competitor IG @{ig_username}: {e}")

            gaps = self._calculate_gaps(prospect_ig, comp_ig)

            comp_data = {
                "lead_id": lead_id,
                "competitor_name": comp["competitor_name"],
                "competitor_instagram": ig_username,
                "competitor_website": comp.get("competitor_website"),
                "competitor_data": {
                    "rating": comp.get("rating"),
                    "reviews_count": comp.get("reviews_count"),
                    "ig_followers": comp_ig.get("followers") if comp_ig else None,
                    "ig_engagement_rate": comp_ig.get("engagement_rate") if comp_ig else None,
                    "ig_posting_frequency": comp_ig.get("posting_frequency") if comp_ig else None,
                },
                "follower_gap": gaps.get("follower_gap"),
                "posting_gap": gaps.get("posting_gap"),
                "engagement_gap": gaps.get("engagement_gap"),
            }

            analyzed.append(comp_data)

        self._save_competitors(analyzed)
        return analyzed

    def _get_prospect_ig(self, lead_id: str) -> dict | None:
        try:
            result = (
                db.table("prospect_social_profiles")
                .select("followers, posting_frequency, engagement_rate")
                .eq("lead_id", lead_id)
                .eq("platform", "instagram")
                .single()
                .execute()
            )
            return result.data
        except Exception:
            return None

    def _calculate_gaps(self, prospect_ig: dict | None, comp_ig: dict | None) -> dict:
        gaps = {}
        if not prospect_ig or not comp_ig:
            return gaps

        p_followers = prospect_ig.get("followers") or 0
        c_followers = comp_ig.get("followers") or 0
        if c_followers:
            gaps["follower_gap"] = c_followers - p_followers

        p_freq = prospect_ig.get("posting_frequency") or 0
        c_freq = comp_ig.get("posting_frequency") or 0
        if c_freq:
            gaps["posting_gap"] = round(c_freq - p_freq, 1)

        p_eng = float(prospect_ig.get("engagement_rate") or 0)
        c_eng = float(comp_ig.get("engagement_rate") or 0)
        if c_eng:
            gaps["engagement_gap"] = round(c_eng - p_eng, 3)

        return gaps

    def _save_competitors(self, competitors: list[dict]):
        for comp in competitors:
            try:
                db.table("prospect_competitors").insert(comp).execute()
            except Exception as e:
                logger.error(f"Failed to save competitor {comp.get('competitor_name')}: {e}")
