"""
Lead Magnet Thief — Engagement Targeting Scraper.

Fully autonomous. Monitors target Instagram creators, finds high-engagement posts
about marketing/growth, scrapes commenters who are business owners, enriches them
with +15 score bonus, and generates emails referencing their specific engagement.

Expected response rate: 15-25% (3-4x better than cold outreach).

Flow:
1. Scan target creator accounts for recent high-engagement posts
2. Scrape commenters from those posts
3. Filter for business accounts in the target category/city
4. Tag as "engagement" source with the specific post + comment
5. Enrich, score (+15 bonus), generate emails referencing the engagement
6. Upload to Instantly within 24 hours
"""

import re
import time
import json
from datetime import datetime, timedelta, timezone
import instaloader
from config.settings import settings
from config.database import db
from utils.logger import logger
from utils.helpers import extract_instagram_username, clean_email, rate_limit

def _build_engagement_loader() -> instaloader.Instaloader:
    loader = instaloader.Instaloader(
        download_pictures=False,
        download_videos=False,
        download_video_thumbnails=False,
        download_geotags=False,
        download_comments=True,
        save_metadata=False,
        compress_json=False,
        quiet=True,
        max_connection_attempts=1,
        fatal_status_codes=[429],
    )
    proxy = settings.social_proxy
    if proxy:
        loader.context._session.proxies = {"http": proxy, "https": proxy}
    return loader

# Default target creators — configurable via dashboard pipeline_settings
DEFAULT_TARGET_CREATORS = {
    "Hair Salon": [
        "salonownershub",
        "instagramforsalons",
        "behindthechair_com",
        "modernsalon",
        "salontoday",
    ],
    "Restaurant": [
        "restaurantmarketing",
        "restaurantowner",
        "toabornottoab",
    ],
    "Fitness": [
        "fitnessbusinesspodcast",
        "gymlaunchsecrets",
    ],
    "default": [
        "smallbizmarketingtips",
        "localmarketingtips",
        "socialmediaexaminer",
    ],
}

# Keywords that signal a post is about marketing/growth (what we want)
MARKETING_KEYWORDS = [
    "instagram", "social media", "posting", "content", "engagement",
    "followers", "growth", "marketing", "clients", "bookings",
    "visibility", "online presence", "google", "reviews", "brand",
    "consistency", "schedule", "reels", "stories", "algorithm",
]


class EngagementScraper:
    def __init__(self):
        self.loader = _build_engagement_loader()

    def run_engagement_scan(
        self,
        category: str | None = None,
        city: str | None = None,
        max_prospects: int = 30,
    ) -> list[dict]:
        """
        Full autonomous scan:
        1. Get target creators for category
        2. Find their high-engagement marketing posts
        3. Scrape commenters
        4. Filter for business accounts
        5. Return prospects tagged with engagement data
        """
        category = category or settings.target_category
        city = city or settings.target_city

        creators = self._get_target_creators(category)
        if not creators:
            logger.info("No target creators configured for engagement scraping")
            return []

        logger.info(f"Engagement scan: checking {len(creators)} creators for {category}")

        all_prospects = []

        ig_failures = 0
        for creator_username in creators:
            try:
                posts = self._find_marketing_posts(creator_username)
                if not posts:
                    ig_failures += 1
                    if ig_failures >= 2:
                        logger.warning("Instagram rate-limited — aborting engagement scan")
                        break
                    continue

                ig_failures = 0
                for post_data in posts[:2]:
                    commenters = self._scrape_commenters(post_data)
                    business_commenters = self._filter_business_accounts(commenters, category, city)

                    for commenter in business_commenters:
                        prospect = self._build_prospect(
                            commenter, creator_username, post_data, category, city
                        )
                        if prospect:
                            all_prospects.append(prospect)

                    if len(all_prospects) >= max_prospects:
                        break

                time.sleep(10)

            except Exception as e:
                logger.warning(f"Engagement scan failed for @{creator_username}: {e}")
                ig_failures += 1
                if ig_failures >= 2:
                    logger.warning("Instagram rate-limited — aborting engagement scan")
                    break
                continue

            if len(all_prospects) >= max_prospects:
                break

        logger.info(f"Engagement scan complete: {len(all_prospects)} prospects found")
        return all_prospects[:max_prospects]

    def _get_target_creators(self, category: str) -> list[str]:
        """Get target creators from dashboard settings or defaults."""
        try:
            result = (
                db.table("pipeline_settings")
                .select("value")
                .eq("key", "engagement_target_creators")
                .single()
                .execute()
            )
            if result.data:
                val = result.data["value"]
                if isinstance(val, list):
                    return val
                if isinstance(val, str):
                    return json.loads(val)
        except Exception:
            pass

        # Fall back to defaults
        creators = DEFAULT_TARGET_CREATORS.get(category, [])
        creators.extend(DEFAULT_TARGET_CREATORS.get("default", []))
        return list(set(creators))

    @rate_limit(seconds=30)
    def _find_marketing_posts(self, username: str, max_posts: int = 20) -> list[dict]:
        """Find recent high-engagement posts about marketing/growth."""
        logger.info(f"Scanning @{username} for marketing posts")

        try:
            profile = instaloader.Profile.from_username(self.loader.context, username)
        except Exception as e:
            logger.warning(f"Could not load @{username}: {e}")
            return []

        cutoff = datetime.now(timezone.utc) - timedelta(days=30)
        marketing_posts = []

        try:
            for i, post in enumerate(profile.get_posts()):
                if i >= max_posts:
                    break

                post_date = post.date_utc
                if post_date.tzinfo is None:
                    post_date = post_date.replace(tzinfo=timezone.utc)
                if post_date < cutoff:
                    break

                caption = (post.caption or "").lower()
                is_marketing = sum(1 for kw in MARKETING_KEYWORDS if kw in caption) >= 2

                # High engagement threshold: 300+ comments or 5K+ likes
                high_engagement = post.comments >= 300 or post.likes >= 5000

                if is_marketing and high_engagement:
                    marketing_posts.append({
                        "shortcode": post.shortcode,
                        "url": f"https://instagram.com/p/{post.shortcode}",
                        "caption": (post.caption or "")[:500],
                        "likes": post.likes,
                        "comments_count": post.comments,
                        "date": post_date.isoformat(),
                        "creator": username,
                        "post_obj": post,
                    })

                if i % 5 == 4:
                    time.sleep(2)

        except Exception as e:
            logger.warning(f"Error scanning posts from @{username}: {e}")

        logger.info(f"@{username}: found {len(marketing_posts)} marketing posts with high engagement")
        return marketing_posts

    @rate_limit(seconds=30)
    def _scrape_commenters(self, post_data: dict, max_comments: int = 100) -> list[dict]:
        """Scrape commenters from a high-engagement post."""
        post = post_data.get("post_obj")
        if not post:
            return []

        logger.info(f"Scraping commenters from {post_data['url']} ({post_data['comments_count']} comments)")
        commenters = []

        try:
            for i, comment in enumerate(post.get_comments()):
                if i >= max_comments:
                    break

                commenters.append({
                    "username": comment.owner.username,
                    "comment_text": comment.text[:300] if comment.text else "",
                    "comment_date": comment.created_at_utc.isoformat() if comment.created_at_utc else None,
                })

                if i % 20 == 19:
                    time.sleep(3)

        except Exception as e:
            logger.warning(f"Error scraping comments: {e}")

        logger.info(f"Scraped {len(commenters)} commenters")
        return commenters

    @rate_limit(seconds=settings.instagram_delay_seconds)
    def _filter_business_accounts(
        self, commenters: list[dict], category: str, city: str
    ) -> list[dict]:
        """
        Filter commenters to find business accounts in the target category/city.
        Checks profile bios for business signals.
        """
        city_name = city.split(",")[0].strip().lower()
        state_name = (city.split(",")[1].strip().lower() if "," in city else settings.target_state.lower())

        category_keywords = self._get_category_keywords(category)
        business_commenters = []

        for commenter in commenters:
            username = commenter.get("username", "")
            if not username:
                continue

            # Skip obvious non-businesses
            if username.startswith("__") or len(username) < 3:
                continue

            try:
                profile = instaloader.Profile.from_username(self.loader.context, username)
                time.sleep(3)
            except Exception:
                continue

            if profile.is_private:
                continue

            bio = (profile.biography or "").lower()
            is_business = profile.is_business_account

            # Check if bio matches our category and location
            has_category_signal = any(kw in bio for kw in category_keywords)
            has_location_signal = city_name in bio or state_name in bio

            # Business signals in bio
            has_business_signal = any(
                signal in bio
                for signal in ["book", "appointment", "studio", "salon", "shop", "owner", "📍", "📞", "💇", "✂️", "dm to book"]
            )

            if (is_business or has_business_signal) and (has_category_signal or has_location_signal):
                commenter["profile"] = {
                    "username": username,
                    "bio": profile.biography,
                    "followers": profile.followers,
                    "following": profile.followees,
                    "posts_count": profile.mediacount,
                    "is_business": is_business,
                    "full_name": profile.full_name,
                    "external_url": profile.external_url,
                }
                business_commenters.append(commenter)
                logger.info(f"  Found business: @{username} ({profile.full_name})")

                if len(business_commenters) >= 10:
                    break

        return business_commenters

    def _get_category_keywords(self, category: str) -> list[str]:
        mapping = {
            "Hair Salon": ["salon", "hair", "stylist", "barber", "beauty", "color", "cut", "braid", "extension", "hairdresser"],
            "Restaurant": ["restaurant", "chef", "kitchen", "food", "dining", "eat", "menu", "catering", "bistro", "cafe"],
            "Fitness": ["gym", "fitness", "trainer", "yoga", "pilates", "crossfit", "studio", "workout", "coaching"],
        }
        return mapping.get(category, [category.lower()])

    def _build_prospect(
        self,
        commenter: dict,
        creator: str,
        post_data: dict,
        category: str,
        city: str,
    ) -> dict | None:
        """Build a prospect dict from a commenter's data."""
        profile = commenter.get("profile", {})
        if not profile:
            return None

        # Try to extract email from bio
        bio = profile.get("bio", "") or ""
        email_match = re.search(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", bio)
        email = clean_email(email_match.group()) if email_match else None

        # Extract business name from full_name or username
        business_name = profile.get("full_name") or profile.get("username", "")

        return {
            "business_name": business_name,
            "category": category,
            "city": city.split(",")[0].strip(),
            "state": city.split(",")[1].strip() if "," in city else settings.target_state,
            "contact_email": email,
            "website": profile.get("external_url"),
            "instagram_url": f"https://instagram.com/{profile['username']}",
            "source": "engagement",
            "prospect_source": "engagement",
            "prospect_source_detail": json.dumps({
                "creator": creator,
                "post_url": post_data.get("url"),
                "post_caption_preview": post_data.get("caption", "")[:100],
                "comment_text": commenter.get("comment_text", "")[:200],
                "comment_date": commenter.get("comment_date"),
                "post_date": post_data.get("date"),
            }),
            "source_details": {
                "engagement_creator": creator,
                "engagement_post_url": post_data.get("url"),
                "engagement_comment": commenter.get("comment_text", ""),
            },
            # Social data we already have from the profile check
            "_social_data": {
                "username": profile["username"],
                "followers": profile.get("followers"),
                "following": profile.get("following"),
                "posts_count": profile.get("posts_count"),
                "bio": profile.get("bio"),
                "is_business_account": profile.get("is_business"),
            },
        }

    # ── Save to Supabase ──

    def save_to_supabase(self, prospects: list[dict]) -> dict:
        saved = 0
        skipped = 0
        errors = 0

        for biz in prospects:
            try:
                # Dedup by Instagram URL (more reliable for engagement sources)
                ig_url = biz.get("instagram_url", "")
                if ig_url:
                    existing = (
                        db.table("outreach_leads")
                        .select("id")
                        .eq("instagram_url", ig_url)
                        .execute()
                    )
                    if existing.data:
                        skipped += 1
                        continue

                # Also dedup by business name + city
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

                social_data = biz.pop("_social_data", None)

                row = {
                    "business_name": biz["business_name"],
                    "industry": biz.get("category"),
                    "category": biz.get("category"),
                    "website": biz.get("website"),
                    "contact_email": biz.get("contact_email"),
                    "instagram_url": biz.get("instagram_url"),
                    "city": biz.get("city"),
                    "state": biz.get("state"),
                    "source": "engagement",
                    "prospect_source": "engagement",
                    "prospect_source_detail": biz.get("prospect_source_detail"),
                    "source_details": biz.get("source_details"),
                    "status": "new",
                    "pipeline_status": "scraped",
                    "enrichment_status": "pending",
                }

                result = db.table("outreach_leads").insert(row).execute()
                lead_id = result.data[0]["id"] if result.data else None

                # Pre-save basic social profile data (we already have it)
                if lead_id and social_data:
                    try:
                        db.table("prospect_social_profiles").upsert({
                            "lead_id": lead_id,
                            "platform": "instagram",
                            "username": social_data["username"],
                            "profile_url": biz.get("instagram_url"),
                            "followers": social_data.get("followers"),
                            "following": social_data.get("following"),
                            "posts_count": social_data.get("posts_count"),
                            "bio": social_data.get("bio"),
                            "is_business_account": social_data.get("is_business_account"),
                        }, on_conflict="lead_id,platform").execute()
                    except Exception:
                        pass

                saved += 1

            except Exception as e:
                logger.error(f"Failed to save engagement prospect {biz.get('business_name')}: {e}")
                errors += 1

        logger.info(f"Engagement save: {saved} saved, {skipped} skipped, {errors} errors")
        return {"saved": saved, "skipped": skipped, "errors": errors}

    def scrape_and_save(
        self,
        category: str | None = None,
        city: str | None = None,
        max_prospects: int = 30,
    ) -> dict:
        prospects = self.run_engagement_scan(category, city, max_prospects)
        if not prospects:
            return {"scraped": 0, "saved": 0, "skipped": 0, "errors": 0}
        result = self.save_to_supabase(prospects)
        result["scraped"] = len(prospects)
        return result
