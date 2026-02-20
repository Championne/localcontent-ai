"""
100-point GeoSpark scoring engine.
50 points for problem signals, 50 points for readiness signals.
"""

from config.settings import settings
from config.database import db
from utils.logger import logger


class ScoringEngine:

    def calculate_score(self, lead_id: str, lead_data: dict, social_data: dict | None = None) -> dict:
        """
        Calculate GeoSpark score (0-100).
        Returns {"score": int, "tier": str, "breakdown": dict}
        """
        breakdown = {}

        # ── PROBLEM SIGNALS (50 points max) ──
        breakdown["inconsistent_posting"] = self._score_posting_consistency(social_data)
        breakdown["low_engagement"] = self._score_engagement(social_data)
        breakdown["review_social_gap"] = self._score_review_social_gap(lead_data, social_data)
        breakdown["partial_platform"] = self._score_platform_presence(lead_data, social_data)
        breakdown["generic_content"] = self._score_content_quality(social_data)

        # ── READINESS SIGNALS (50 points max) ──
        breakdown["using_tools"] = self._score_tool_usage(social_data)
        breakdown["review_quality"] = self._score_review_quality(lead_data)
        breakdown["follower_range"] = self._score_follower_range(social_data)
        breakdown["content_quality_gap"] = self._score_content_variance(social_data)
        breakdown["email_confidence"] = self._score_email_confidence(lead_data)

        total = sum(v["points"] for v in breakdown.values())

        # +15 bonus for engagement source prospects (Lead Magnet Thief)
        source = lead_data.get("prospect_source")
        if source == "engagement":
            breakdown["engagement_bonus"] = {"points": 15, "reason": "Engagement source — proved interest in marketing content"}
            total += 15

        total = max(0, min(100, total))

        tier = self._assign_tier(total)

        result = {
            "score": total,
            "tier": tier,
            "breakdown": breakdown,
            "problem_score": sum(
                v["points"] for k, v in breakdown.items()
                if k in ("inconsistent_posting", "low_engagement", "review_social_gap", "partial_platform", "generic_content")
            ),
            "readiness_score": sum(
                v["points"] for k, v in breakdown.items()
                if k in ("using_tools", "review_quality", "follower_range", "content_quality_gap", "email_confidence")
            ),
        }

        logger.info(f"Scored lead {lead_id}: {total}/100 ({tier})")
        return result

    # ── Problem signals ──

    def _score_posting_consistency(self, social: dict | None) -> dict:
        """0-15 points based on posting frequency and gaps."""
        if not social:
            return {"points": 8, "reason": "No social data available"}

        posts_30d = social.get("posts_last_30_days", 0)
        posting_freq = social.get("posting_frequency", 0) or 0
        max_gap = social.get("posting_patterns", {}).get("max_gap_days", 0) or 0

        points = 0
        reasons = []

        if posts_30d == 0:
            points += 10
            reasons.append("Zero posts in last 30 days")
        elif posts_30d < 4:
            points += 7
            reasons.append(f"Only {posts_30d} posts in 30 days")
        elif posts_30d < 8:
            points += 4
            reasons.append(f"{posts_30d} posts in 30 days (below average)")

        if max_gap > 30:
            points += 5
            reasons.append(f"{max_gap}-day posting gap")
        elif max_gap > 14:
            points += 3
            reasons.append(f"{max_gap}-day posting gap")

        return {"points": min(points, 15), "reason": "; ".join(reasons) or "Consistent posting"}

    def _score_engagement(self, social: dict | None) -> dict:
        """0-10 points based on engagement rate vs 3.5% benchmark."""
        if not social:
            return {"points": 5, "reason": "No engagement data"}

        rate = float(social.get("engagement_rate") or 0)
        benchmark = 3.5

        if rate == 0:
            return {"points": 7, "reason": "No engagement data available"}
        elif rate < 1.0:
            return {"points": 10, "reason": f"{rate:.1f}% engagement (very low vs {benchmark}% benchmark)"}
        elif rate < 2.0:
            return {"points": 7, "reason": f"{rate:.1f}% engagement (below {benchmark}% benchmark)"}
        elif rate < benchmark:
            return {"points": 4, "reason": f"{rate:.1f}% engagement (slightly below benchmark)"}
        else:
            return {"points": 1, "reason": f"{rate:.1f}% engagement (above benchmark)"}

    def _score_review_social_gap(self, lead: dict, social: dict | None) -> dict:
        """0-10 points. High reviews + low social = big opportunity."""
        reviews = lead.get("google_reviews_count") or 0
        posts_30d = (social or {}).get("posts_last_30_days", 0)

        if reviews >= 50 and posts_30d < 4:
            return {"points": 10, "reason": f"{reviews} reviews but only {posts_30d} posts/month"}
        elif reviews >= 20 and posts_30d < 4:
            return {"points": 7, "reason": f"{reviews} reviews but low posting"}
        elif reviews >= 20 and posts_30d < 8:
            return {"points": 4, "reason": f"Good reviews ({reviews}), moderate posting"}
        return {"points": 0, "reason": "No significant gap"}

    def _score_platform_presence(self, lead: dict, social: dict | None) -> dict:
        """0-7 points. Active on only 1 platform = opportunity."""
        platforms = 0
        if lead.get("instagram_url"):
            platforms += 1
        if lead.get("facebook_url"):
            platforms += 1
        if lead.get("yelp_url"):
            platforms += 1
        if lead.get("tiktok_url"):
            platforms += 1

        if platforms == 0:
            return {"points": 7, "reason": "No social media presence found"}
        elif platforms == 1:
            return {"points": 5, "reason": "Active on only 1 platform"}
        elif platforms == 2:
            return {"points": 2, "reason": "Active on 2 platforms"}
        return {"points": 0, "reason": f"Active on {platforms} platforms"}

    def _score_content_quality(self, social: dict | None) -> dict:
        """0-8 points based on content mix (too much promotional = bad)."""
        if not social:
            return {"points": 4, "reason": "No content data"}

        breakdown = social.get("content_breakdown", {})
        if not breakdown:
            return {"points": 4, "reason": "No content classification"}

        promo_pct = breakdown.get("promotional", {}).get("pct", 0)

        if promo_pct > 70:
            return {"points": 8, "reason": f"{promo_pct:.0f}% promotional content (way above 20% ideal)"}
        elif promo_pct > 50:
            return {"points": 6, "reason": f"{promo_pct:.0f}% promotional content (above ideal)"}
        elif promo_pct > 30:
            return {"points": 3, "reason": f"{promo_pct:.0f}% promotional content"}
        return {"points": 0, "reason": "Good content mix"}

    # ── Readiness signals ──

    def _score_tool_usage(self, social: dict | None) -> dict:
        """0-12 points. Using Canva/Linktree/etc = already investing in marketing."""
        if not social:
            return {"points": 0, "reason": "No tool data"}

        tools = social.get("tools_detected", [])
        if not tools:
            return {"points": 0, "reason": "No marketing tools detected"}

        points = min(len(tools) * 4, 12)
        return {"points": points, "reason": f"Using: {', '.join(tools)}"}

    def _score_review_quality(self, lead: dict) -> dict:
        """0-10 points based on Google rating + review count."""
        rating = float(lead.get("google_rating") or 0)
        count = lead.get("google_reviews_count") or 0

        points = 0
        reasons = []

        if rating >= 4.5 and count >= 50:
            points += 10
            reasons.append(f"{rating}★ with {count} reviews — strong reputation")
        elif rating >= 4.0 and count >= 20:
            points += 7
            reasons.append(f"{rating}★ with {count} reviews — good reputation")
        elif rating >= 4.0:
            points += 4
            reasons.append(f"{rating}★ rating")
        elif count > 0:
            points += 2
            reasons.append(f"{rating}★ with {count} reviews")

        return {"points": points, "reason": "; ".join(reasons) or "Limited review data"}

    def _score_follower_range(self, social: dict | None) -> dict:
        """0-10 points. 500-5000 followers = sweet spot (invested but not huge)."""
        if not social:
            return {"points": 3, "reason": "No follower data"}

        followers = social.get("followers") or 0

        if 500 <= followers <= 5000:
            return {"points": 10, "reason": f"{followers:,} followers (sweet spot)"}
        elif 200 <= followers < 500:
            return {"points": 7, "reason": f"{followers:,} followers (growing)"}
        elif 5000 < followers <= 15000:
            return {"points": 6, "reason": f"{followers:,} followers (established)"}
        elif followers > 15000:
            return {"points": 2, "reason": f"{followers:,} followers (may have in-house team)"}
        return {"points": 3, "reason": f"{followers:,} followers (very early stage)"}

    def _score_content_variance(self, social: dict | None) -> dict:
        """0-10 points. High variance between best/worst content = untapped potential."""
        if not social:
            return {"points": 0, "reason": "No content data"}

        details = social.get("engagement_details", {})
        best = details.get("best_engagement", 0)
        worst = details.get("worst_engagement", 0)

        if best and worst and worst > 0:
            ratio = best / worst
            if ratio > 3:
                return {"points": 10, "reason": f"Best content gets {ratio:.1f}x more engagement than worst"}
            elif ratio > 2:
                return {"points": 7, "reason": f"{ratio:.1f}x engagement gap between content types"}
            elif ratio > 1.5:
                return {"points": 4, "reason": f"Moderate content performance gap"}

        return {"points": 0, "reason": "Consistent engagement across content"}

    def _score_email_confidence(self, lead: dict) -> dict:
        """0-8 points based on email availability and confidence."""
        email = lead.get("contact_email") or lead.get("owner_email")
        confidence = lead.get("email_confidence")

        if email and confidence == "high":
            return {"points": 8, "reason": "Verified email found"}
        elif email and confidence == "medium":
            return {"points": 5, "reason": "Email found (medium confidence)"}
        elif email:
            return {"points": 3, "reason": "Email found (unverified)"}
        return {"points": 0, "reason": "No email found"}

    # ── Tier assignment ──

    def _assign_tier(self, score: int) -> str:
        if score >= settings.tier_1_min:
            return "TIER_1"
        elif score >= settings.tier_2_min:
            return "TIER_2"
        elif score >= settings.tier_3_min:
            return "TIER_3"
        elif score >= settings.tier_4_min:
            return "TIER_4"
        return "TIER_5"

    # ── Save ──

    def score_and_save(self, lead_id: str, lead_data: dict, social_data: dict | None = None) -> dict:
        result = self.calculate_score(lead_id, lead_data, social_data)

        try:
            db.table("outreach_leads").update({
                "geospark_score": result["score"],
                "score_tier": result["tier"],
                "score_breakdown": result["breakdown"],
                "pipeline_status": "scored",
            }).eq("id", lead_id).execute()
        except Exception as e:
            logger.error(f"Failed to save score for lead {lead_id}: {e}")

        return result
