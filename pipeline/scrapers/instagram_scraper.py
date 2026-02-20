"""
Instagram scraper using Instaloader.
Extracts profile data, recent posts, engagement metrics, and posting patterns.
"""

import time
from datetime import datetime, timedelta, timezone
from typing import Any
import instaloader
from config.settings import settings
from config.database import db
from utils.logger import logger
from utils.helpers import rate_limit

L = instaloader.Instaloader(
    download_pictures=False,
    download_videos=False,
    download_video_thumbnails=False,
    download_geotags=False,
    download_comments=False,
    save_metadata=False,
    compress_json=False,
    quiet=True,
)


class InstagramScraper:
    def __init__(self):
        self.loader = L

    @rate_limit(seconds=settings.instagram_delay_seconds)
    def scrape_profile(self, username: str) -> dict | None:
        username = username.strip().lower().lstrip("@")
        logger.info(f"Scraping Instagram: @{username}")

        try:
            profile = instaloader.Profile.from_username(self.loader.context, username)
        except instaloader.exceptions.ProfileNotExistsException:
            logger.warning(f"Instagram profile @{username} does not exist")
            return None
        except instaloader.exceptions.ConnectionException as e:
            logger.error(f"Instagram connection error for @{username}: {e}")
            return None

        if profile.is_private:
            logger.info(f"@{username} is private — collecting basic info only")
            return {
                "username": username,
                "profile_url": f"https://instagram.com/{username}",
                "followers": profile.followers,
                "following": profile.followees,
                "posts_count": profile.mediacount,
                "bio": profile.biography,
                "is_business_account": profile.is_business_account,
                "is_private": True,
                "engagement_rate": None,
                "posts": [],
                "posting_patterns": {},
                "content_breakdown": {},
                "tools_detected": [],
            }

        posts_data = self._scrape_posts(profile, max_posts=50)
        engagement = self._calculate_engagement(posts_data, profile.followers)
        patterns = self._analyze_posting_patterns(posts_data)
        content_breakdown = self._classify_content(posts_data)
        tools = self._detect_tools(profile.biography, posts_data)

        return {
            "username": username,
            "profile_url": f"https://instagram.com/{username}",
            "followers": profile.followers,
            "following": profile.followees,
            "posts_count": profile.mediacount,
            "bio": profile.biography,
            "is_business_account": profile.is_business_account,
            "is_private": False,
            "engagement_rate": engagement.get("avg_engagement_rate"),
            "posts_last_30_days": patterns.get("posts_last_30_days", 0),
            "last_post_date": patterns.get("last_post_date"),
            "posting_frequency": patterns.get("posts_per_month"),
            "posts": posts_data,
            "posting_patterns": patterns,
            "content_breakdown": content_breakdown,
            "tools_detected": tools,
            "engagement_details": engagement,
        }

    def _scrape_posts(self, profile, max_posts: int = 50) -> list[dict]:
        posts = []
        try:
            for i, post in enumerate(profile.get_posts()):
                if i >= max_posts:
                    break
                posts.append({
                    "post_url": f"https://instagram.com/p/{post.shortcode}",
                    "post_date": post.date_utc.isoformat(),
                    "caption": (post.caption or "")[:2000],
                    "likes": post.likes,
                    "comments": post.comments,
                    "post_type": self._get_post_type(post),
                    "is_video": post.is_video,
                    "video_view_count": post.video_view_count if post.is_video else None,
                })
                # Small delay between post fetches
                if i % 10 == 9:
                    time.sleep(2)
        except Exception as e:
            logger.warning(f"Error fetching posts for @{profile.username}: {e}")

        return posts

    def _get_post_type(self, post) -> str:
        if post.typename == "GraphSidecar":
            return "carousel"
        if post.is_video:
            return "video"
        return "photo"

    def _calculate_engagement(self, posts: list[dict], followers: int) -> dict:
        if not posts or followers == 0:
            return {"avg_engagement_rate": 0, "avg_likes": 0, "avg_comments": 0}

        total_likes = sum(p.get("likes", 0) for p in posts)
        total_comments = sum(p.get("comments", 0) for p in posts)
        avg_likes = total_likes / len(posts)
        avg_comments = total_comments / len(posts)
        avg_engagement = ((avg_likes + avg_comments) / followers) * 100

        # Engagement by post type
        by_type: dict[str, list[float]] = {}
        for p in posts:
            pt = p.get("post_type", "other")
            interactions = p.get("likes", 0) + p.get("comments", 0)
            rate = (interactions / followers) * 100 if followers else 0
            by_type.setdefault(pt, []).append(rate)

        type_averages = {k: round(sum(v) / len(v), 3) for k, v in by_type.items()}

        best_type = max(type_averages, key=type_averages.get) if type_averages else None
        worst_type = min(type_averages, key=type_averages.get) if type_averages else None

        return {
            "avg_engagement_rate": round(avg_engagement, 3),
            "avg_likes": round(avg_likes, 1),
            "avg_comments": round(avg_comments, 1),
            "total_posts_analyzed": len(posts),
            "engagement_by_type": type_averages,
            "best_post_type": best_type,
            "worst_post_type": worst_type,
            "best_engagement": round(type_averages.get(best_type, 0), 3) if best_type else 0,
            "worst_engagement": round(type_averages.get(worst_type, 0), 3) if worst_type else 0,
        }

    def _analyze_posting_patterns(self, posts: list[dict]) -> dict:
        if not posts:
            return {"posts_last_30_days": 0, "posts_per_month": 0, "max_gap_days": None}

        now = datetime.now(timezone.utc)
        thirty_days_ago = now - timedelta(days=30)

        dates = []
        for p in posts:
            try:
                d = datetime.fromisoformat(p["post_date"])
                if d.tzinfo is None:
                    d = d.replace(tzinfo=timezone.utc)
                dates.append(d)
            except (ValueError, KeyError):
                continue

        if not dates:
            return {"posts_last_30_days": 0, "posts_per_month": 0}

        dates.sort(reverse=True)
        last_post = dates[0]
        posts_last_30 = sum(1 for d in dates if d >= thirty_days_ago)

        # Average posts per month over available data
        if len(dates) > 1:
            span_days = (dates[0] - dates[-1]).days or 1
            posts_per_month = round(len(dates) / (span_days / 30), 1)
        else:
            posts_per_month = posts_last_30

        # Max gap between consecutive posts
        gaps = []
        for i in range(len(dates) - 1):
            gap = (dates[i] - dates[i + 1]).days
            gaps.append(gap)
        max_gap = max(gaps) if gaps else 0

        days_since_last = (now - last_post).days

        return {
            "posts_last_30_days": posts_last_30,
            "posts_per_month": posts_per_month,
            "last_post_date": last_post.isoformat(),
            "days_since_last_post": days_since_last,
            "max_gap_days": max_gap,
            "avg_gap_days": round(sum(gaps) / len(gaps), 1) if gaps else 0,
            "total_posts_analyzed": len(dates),
        }

    def _classify_content(self, posts: list[dict]) -> dict:
        """Basic content classification based on captions."""
        categories = {
            "promotional": 0,
            "educational": 0,
            "behind_the_scenes": 0,
            "before_after": 0,
            "testimonial": 0,
            "personal": 0,
            "other": 0,
        }

        promo_keywords = ["book now", "appointment", "sale", "discount", "offer", "deal", "% off", "link in bio", "shop", "buy"]
        edu_keywords = ["tip", "how to", "guide", "learn", "did you know", "tutorial", "steps"]
        bts_keywords = ["behind the scenes", "bts", "day in the life", "team", "process", "making of"]
        ba_keywords = ["before and after", "before/after", "transformation", "results", "glow up"]
        testimonial_keywords = ["review", "testimonial", "client", "customer", "thank you", "amazing experience"]

        for p in posts:
            caption = (p.get("caption") or "").lower()
            if any(kw in caption for kw in ba_keywords):
                categories["before_after"] += 1
            elif any(kw in caption for kw in testimonial_keywords):
                categories["testimonial"] += 1
            elif any(kw in caption for kw in bts_keywords):
                categories["behind_the_scenes"] += 1
            elif any(kw in caption for kw in edu_keywords):
                categories["educational"] += 1
            elif any(kw in caption for kw in promo_keywords):
                categories["promotional"] += 1
            else:
                categories["other"] += 1

        total = sum(categories.values()) or 1
        return {k: {"count": v, "pct": round(v / total * 100, 1)} for k, v in categories.items()}

    def _detect_tools(self, bio: str, posts: list[dict]) -> list[str]:
        bio = (bio or "").lower()
        all_captions = " ".join((p.get("caption") or "") for p in posts).lower()
        text = bio + " " + all_captions

        tool_patterns = {
            "linktree": ["linktr.ee", "linktree"],
            "canva": ["canva.com", "made with canva"],
            "milkshake": ["milkshake.app"],
            "later": ["later.com", "linkin.bio"],
            "planoly": ["planoly"],
            "vagaro": ["vagaro"],
            "mindbody": ["mindbody"],
            "square": ["square.site", "squareup"],
            "schedulicity": ["schedulicity"],
            "fresha": ["fresha"],
            "booksy": ["booksy"],
            "glossgenius": ["glossgenius"],
        }

        detected = []
        for tool, patterns in tool_patterns.items():
            if any(p in text for p in patterns):
                detected.append(tool)
        return detected

    def save_profile_to_supabase(self, lead_id: str, profile_data: dict) -> str | None:
        if not profile_data:
            return None

        try:
            row = {
                "lead_id": lead_id,
                "platform": "instagram",
                "username": profile_data["username"],
                "profile_url": profile_data["profile_url"],
                "followers": profile_data.get("followers"),
                "following": profile_data.get("following"),
                "posts_count": profile_data.get("posts_count"),
                "engagement_rate": profile_data.get("engagement_rate"),
                "posts_last_30_days": profile_data.get("posts_last_30_days"),
                "last_post_date": profile_data.get("last_post_date"),
                "posting_frequency": profile_data.get("posting_frequency"),
                "bio": profile_data.get("bio"),
                "is_business_account": profile_data.get("is_business_account"),
                "is_private": profile_data.get("is_private", False),
                "content_breakdown": profile_data.get("content_breakdown", {}),
                "tools_detected": profile_data.get("tools_detected", []),
                "raw_data": {
                    "posting_patterns": profile_data.get("posting_patterns", {}),
                    "engagement_details": profile_data.get("engagement_details", {}),
                },
            }

            # Upsert (update if profile already exists for this lead + platform)
            result = (
                db.table("prospect_social_profiles")
                .upsert(row, on_conflict="lead_id,platform")
                .execute()
            )
            profile_id = result.data[0]["id"] if result.data else None

            # Save individual posts
            if profile_id and profile_data.get("posts"):
                self._save_posts(profile_id, lead_id, profile_data["posts"])

            return profile_id

        except Exception as e:
            logger.error(f"Failed to save Instagram profile for lead {lead_id}: {e}")
            return None

    def _save_posts(self, profile_id: str, lead_id: str, posts: list[dict]):
        rows = []
        for p in posts[:50]:
            rows.append({
                "social_profile_id": profile_id,
                "lead_id": lead_id,
                "post_url": p.get("post_url"),
                "post_date": p.get("post_date"),
                "caption": p.get("caption"),
                "likes": p.get("likes", 0),
                "comments": p.get("comments", 0),
                "views": p.get("video_view_count"),
                "post_type": p.get("post_type", "photo"),
            })

        try:
            # Delete old posts and insert fresh
            db.table("prospect_posts").delete().eq("social_profile_id", profile_id).execute()
            if rows:
                db.table("prospect_posts").insert(rows).execute()
        except Exception as e:
            logger.error(f"Failed to save posts for profile {profile_id}: {e}")
