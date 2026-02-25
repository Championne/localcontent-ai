"""
Instagram scraper using curl_cffi (browser TLS fingerprint).
Fetches profile + recent posts via Instagram's web API in a single request.
Requires SOCIAL_PROXY in .env pointing to a SOCKS5 proxy through a VPN.
"""

import time
from datetime import datetime, timedelta, timezone
from curl_cffi import requests as cffi_requests
from config.settings import settings
from config.database import db
from utils.logger import logger
from utils.helpers import rate_limit

IG_API = "https://i.instagram.com/api/v1/users/web_profile_info/"
IG_HEADERS = {
    "User-Agent": "Instagram 275.0.0.27.98 Android (33/13; 420dpi; 1080x2400; samsung; SM-G991B; o1s; exynos2100; en_US; 458229258)",
    "X-IG-App-ID": "567067343352427",
}


class InstagramScraper:
    def __init__(self):
        proxy = settings.social_proxy
        self._proxies = {"http": proxy, "https": proxy} if proxy else None
        self._available = True
        self._consecutive_failures = 0
        if not proxy:
            logger.warning("No SOCIAL_PROXY — Instagram scraping disabled")
            self._available = False

    def scrape_profile(self, username: str) -> dict | None:
        if not self._available:
            return None
        return self._scrape_profile_inner(username)

    @rate_limit(seconds=10)
    def _scrape_profile_inner(self, username: str) -> dict | None:
        username = username.strip().lower().lstrip("@")
        logger.info(f"Scraping Instagram: @{username}")

        try:
            resp = cffi_requests.get(
                f"{IG_API}?username={username}",
                headers=IG_HEADERS,
                proxies=self._proxies,
                impersonate="chrome",
                timeout=20,
            )
        except Exception as e:
            logger.error(f"Instagram request failed for @{username}: {e}")
            self._consecutive_failures += 1
            if self._consecutive_failures >= 3:
                logger.warning("Instagram: 3 consecutive failures — disabling for this run")
                self._available = False
            return None

        if resp.status_code == 404:
            logger.warning(f"Instagram profile @{username} does not exist")
            return None

        if resp.status_code == 429:
            logger.warning("Instagram rate-limited — disabling for this run")
            self._available = False
            return None

        if resp.status_code != 200:
            logger.warning(f"Instagram returned {resp.status_code} for @{username}")
            self._consecutive_failures += 1
            if self._consecutive_failures >= 3:
                self._available = False
            return None

        self._consecutive_failures = 0

        try:
            data = resp.json()
            user = data.get("data", {}).get("user")
            if not user:
                logger.warning(f"No user data in response for @{username}")
                return None
            return self._parse_profile(username, user)
        except Exception as e:
            logger.error(f"Failed to parse Instagram data for @{username}: {e}")
            return None

    def _parse_profile(self, username: str, user: dict) -> dict:
        followers = user.get("edge_followed_by", {}).get("count", 0)
        following = user.get("edge_follow", {}).get("count", 0)
        posts_count = user.get("edge_owner_to_timeline_media", {}).get("count", 0)
        bio = user.get("biography", "")
        is_private = user.get("is_private", False)
        is_business = user.get("is_business_account", False)

        if is_private:
            return {
                "username": username,
                "profile_url": f"https://instagram.com/{username}",
                "followers": followers,
                "following": following,
                "posts_count": posts_count,
                "bio": bio,
                "is_business_account": is_business,
                "is_private": True,
                "engagement_rate": None,
                "posts": [],
                "posting_patterns": {},
                "content_breakdown": {},
                "tools_detected": [],
            }

        posts_data = self._parse_posts(user)
        engagement = self._calculate_engagement(posts_data, followers)
        patterns = self._analyze_posting_patterns(posts_data)
        content_breakdown = self._classify_content(posts_data)
        tools = self._detect_tools(bio, posts_data)

        return {
            "username": username,
            "profile_url": f"https://instagram.com/{username}",
            "followers": followers,
            "following": following,
            "posts_count": posts_count,
            "bio": bio,
            "is_business_account": is_business,
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

    def _parse_posts(self, user: dict) -> list[dict]:
        edges = user.get("edge_owner_to_timeline_media", {}).get("edges", [])
        posts = []
        for edge in edges[:50]:
            node = edge.get("node", {})
            ts = node.get("taken_at_timestamp")
            post_date = datetime.fromtimestamp(ts, tz=timezone.utc).isoformat() if ts else None

            caption_edges = node.get("edge_media_to_caption", {}).get("edges", [])
            caption = caption_edges[0]["node"]["text"][:2000] if caption_edges else ""

            typename = node.get("__typename", "")
            if typename == "GraphSidecar":
                post_type = "carousel"
            elif node.get("is_video"):
                post_type = "video"
            else:
                post_type = "photo"

            posts.append({
                "post_url": f"https://instagram.com/p/{node.get('shortcode', '')}",
                "post_date": post_date,
                "caption": caption,
                "likes": node.get("edge_liked_by", {}).get("count", 0),
                "comments": node.get("edge_media_to_comment", {}).get("count", 0),
                "post_type": post_type,
                "is_video": node.get("is_video", False),
                "video_view_count": node.get("video_view_count") if node.get("is_video") else None,
            })
        return posts

    # ── Analysis methods (unchanged) ──

    def _calculate_engagement(self, posts: list[dict], followers: int) -> dict:
        if not posts or followers == 0:
            return {"avg_engagement_rate": 0, "avg_likes": 0, "avg_comments": 0}

        total_likes = sum(p.get("likes", 0) for p in posts)
        total_comments = sum(p.get("comments", 0) for p in posts)
        avg_likes = total_likes / len(posts)
        avg_comments = total_comments / len(posts)
        avg_engagement = ((avg_likes + avg_comments) / followers) * 100

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
            except (ValueError, KeyError, TypeError):
                continue

        if not dates:
            return {"posts_last_30_days": 0, "posts_per_month": 0}

        dates.sort(reverse=True)
        last_post = dates[0]
        posts_last_30 = sum(1 for d in dates if d >= thirty_days_ago)

        if len(dates) > 1:
            span_days = (dates[0] - dates[-1]).days or 1
            posts_per_month = round(len(dates) / (span_days / 30), 1)
        else:
            posts_per_month = posts_last_30

        gaps = [(dates[i] - dates[i + 1]).days for i in range(len(dates) - 1)]
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
        categories = {
            "promotional": 0, "educational": 0, "behind_the_scenes": 0,
            "before_after": 0, "testimonial": 0, "personal": 0, "other": 0,
        }
        promo_kw = ["book now", "appointment", "sale", "discount", "offer", "deal", "% off", "link in bio", "shop", "buy"]
        edu_kw = ["tip", "how to", "guide", "learn", "did you know", "tutorial", "steps"]
        bts_kw = ["behind the scenes", "bts", "day in the life", "team", "process", "making of"]
        ba_kw = ["before and after", "before/after", "transformation", "results", "glow up"]
        test_kw = ["review", "testimonial", "client", "customer", "thank you", "amazing experience"]

        for p in posts:
            caption = (p.get("caption") or "").lower()
            if any(kw in caption for kw in ba_kw):
                categories["before_after"] += 1
            elif any(kw in caption for kw in test_kw):
                categories["testimonial"] += 1
            elif any(kw in caption for kw in bts_kw):
                categories["behind_the_scenes"] += 1
            elif any(kw in caption for kw in edu_kw):
                categories["educational"] += 1
            elif any(kw in caption for kw in promo_kw):
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
            "linktree": ["linktr.ee", "linktree"], "canva": ["canva.com", "made with canva"],
            "milkshake": ["milkshake.app"], "later": ["later.com", "linkin.bio"],
            "planoly": ["planoly"], "vagaro": ["vagaro"], "mindbody": ["mindbody"],
            "square": ["square.site", "squareup"], "schedulicity": ["schedulicity"],
            "fresha": ["fresha"], "booksy": ["booksy"], "glossgenius": ["glossgenius"],
        }
        return [tool for tool, pats in tool_patterns.items() if any(p in text for p in pats)]

    # ── Save to Supabase ──

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

            result = (
                db.table("prospect_social_profiles")
                .upsert(row, on_conflict="lead_id,platform")
                .execute()
            )
            profile_id = result.data[0]["id"] if result.data else None

            if profile_id and profile_data.get("posts"):
                self._save_posts(profile_id, lead_id, profile_data["posts"])

            return profile_id

        except Exception as e:
            logger.error(f"Failed to save Instagram profile for lead {lead_id}: {e}")
            return None

    def _save_posts(self, profile_id: str, lead_id: str, posts: list[dict]):
        rows = [{
            "social_profile_id": profile_id,
            "lead_id": lead_id,
            "post_url": p.get("post_url"),
            "post_date": p.get("post_date"),
            "caption": p.get("caption"),
            "likes": p.get("likes", 0),
            "comments": p.get("comments", 0),
            "views": p.get("video_view_count"),
            "post_type": p.get("post_type", "photo"),
        } for p in posts[:50]]

        try:
            db.table("prospect_posts").delete().eq("social_profile_id", profile_id).execute()
            if rows:
                db.table("prospect_posts").insert(rows).execute()
        except Exception as e:
            logger.error(f"Failed to save posts for profile {profile_id}: {e}")
