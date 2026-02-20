"""
AI insight generator using Claude API.
Generates 7-10 data-driven marketing insights per prospect.
"""

import json
import anthropic
from config.settings import settings
from config.database import db
from utils.logger import logger
from utils.helpers import retry


class InsightGenerator:
    def __init__(self):
        self.client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

    @retry(max_attempts=2, delay=5.0)
    def generate_insights(self, lead_id: str, lead_data: dict, social_data: dict | None = None, competitors: list[dict] | None = None) -> list[dict]:
        prompt = self._build_prompt(lead_data, social_data, competitors)

        response = self.client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=2000,
            messages=[{"role": "user", "content": prompt}],
            system=self._system_prompt(),
        )

        text = response.content[0].text
        insights = self._parse_response(text)

        if not insights:
            logger.warning(f"No insights parsed for lead {lead_id}")
            return []

        logger.info(f"Generated {len(insights)} insights for lead {lead_id}")
        return insights

    def _system_prompt(self) -> str:
        return """You are a marketing analyst specializing in local business social media presence. 
You generate specific, data-driven insights for cold outreach personalization.

Rules:
- Every insight MUST reference specific numbers from the data provided
- Never invent or estimate numbers — only use what's in the data
- Be specific and actionable — not generic marketing advice
- Insights should highlight gaps, opportunities, and patterns
- Each insight should be usable as a hook in a cold email

Return a JSON array of insights."""

    def _build_prompt(self, lead: dict, social: dict | None, competitors: list[dict] | None) -> str:
        parts = [
            "Analyze this business and generate 7-10 specific marketing insights.\n",
            "## BUSINESS DATA",
            f"Business: {lead.get('business_name')}",
            f"Category: {lead.get('category', 'Unknown')}",
            f"City: {lead.get('city', 'Unknown')}, {lead.get('state', '')}",
            f"Google Rating: {lead.get('google_rating', 'N/A')}",
            f"Google Reviews: {lead.get('google_reviews_count', 'N/A')}",
            f"Website: {lead.get('website', 'None')}",
        ]

        if social:
            parts.extend([
                "\n## SOCIAL MEDIA DATA",
                f"Instagram Followers: {social.get('followers', 'N/A')}",
                f"Following: {social.get('following', 'N/A')}",
                f"Total Posts: {social.get('posts_count', 'N/A')}",
                f"Engagement Rate: {social.get('engagement_rate', 'N/A')}%",
                f"Posts Last 30 Days: {social.get('posts_last_30_days', 'N/A')}",
                f"Posting Frequency: {social.get('posting_frequency', 'N/A')} posts/month",
                f"Last Post: {social.get('last_post_date', 'N/A')}",
                f"Days Since Last Post: {social.get('posting_patterns', {}).get('days_since_last_post', 'N/A')}",
                f"Max Posting Gap: {social.get('posting_patterns', {}).get('max_gap_days', 'N/A')} days",
                f"Is Business Account: {social.get('is_business_account', 'N/A')}",
                f"Bio: {social.get('bio', 'N/A')}",
            ])

            content = social.get("content_breakdown", {})
            if content:
                parts.append("\n## CONTENT BREAKDOWN")
                for ctype, data in content.items():
                    if isinstance(data, dict):
                        parts.append(f"- {ctype}: {data.get('count', 0)} posts ({data.get('pct', 0)}%)")

            tools = social.get("tools_detected", [])
            if tools:
                parts.append(f"\nTools Detected: {', '.join(tools)}")

            eng = social.get("engagement_details", {})
            if eng:
                parts.append(f"\nBest Post Type: {eng.get('best_post_type', 'N/A')} ({eng.get('best_engagement', 0):.2f}% engagement)")
                parts.append(f"Worst Post Type: {eng.get('worst_post_type', 'N/A')} ({eng.get('worst_engagement', 0):.2f}% engagement)")
                parts.append(f"Avg Likes: {eng.get('avg_likes', 'N/A')}")
                parts.append(f"Avg Comments: {eng.get('avg_comments', 'N/A')}")

        if competitors:
            parts.append("\n## COMPETITOR DATA")
            for c in competitors:
                parts.append(f"- {c.get('competitor_name')}: " +
                    f"IG @{c.get('competitor_instagram', 'N/A')}, " +
                    f"Follower gap: {c.get('follower_gap', 'N/A')}, " +
                    f"Posting gap: {c.get('posting_gap', 'N/A')}/month, " +
                    f"Engagement gap: {c.get('engagement_gap', 'N/A')}%")

        parts.append("""

## REQUIRED OUTPUT FORMAT

Return a JSON array. Each insight must have:
- insight_type: one of "posting_pattern", "engagement_analysis", "competitor_gap", "review_social_gap", "content_quality", "platform_gap", "tool_usage", "growth_opportunity"
- insight_title: catchy, short title (under 10 words)
- insight_description: 2-3 sentences with specific numbers from the data
- priority_score: 1-10 (10 = most impactful for cold email)
- supporting_data: dict with the specific numbers used

Example:
[
  {
    "insight_type": "posting_pattern",
    "insight_title": "47 Days of Silence on Instagram",
    "insight_description": "Your last Instagram post was 47 days ago, despite averaging 47 likes on before/after content. Meanwhile, your posting frequency dropped from 4x/month to near zero.",
    "priority_score": 9,
    "supporting_data": {"days_since_last_post": 47, "avg_likes": 47, "previous_frequency": 4}
  }
]

Generate 7-10 insights. Return ONLY the JSON array, no other text.""")

        return "\n".join(parts)

    def _parse_response(self, text: str) -> list[dict]:
        text = text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[-1]
            text = text.rsplit("```", 1)[0]

        try:
            insights = json.loads(text)
            if isinstance(insights, list):
                valid = []
                for ins in insights:
                    if all(k in ins for k in ("insight_type", "insight_title", "insight_description", "priority_score")):
                        ins["priority_score"] = max(1, min(10, int(ins["priority_score"])))
                        valid.append(ins)
                return valid
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse insights JSON: {e}")
        return []

    def generate_and_save(self, lead_id: str, lead_data: dict, social_data: dict | None = None, competitors: list[dict] | None = None) -> list[dict]:
        insights = self.generate_insights(lead_id, lead_data, social_data, competitors)

        for ins in insights:
            try:
                row = {
                    "lead_id": lead_id,
                    "insight_type": ins["insight_type"],
                    "insight_title": ins["insight_title"],
                    "insight_description": ins["insight_description"],
                    "priority_score": ins["priority_score"],
                    "supporting_data": ins.get("supporting_data", {}),
                }
                db.table("prospect_marketing_insights").insert(row).execute()
            except Exception as e:
                logger.error(f"Failed to save insight for lead {lead_id}: {e}")

        try:
            db.table("outreach_leads").update({
                "pipeline_status": "insights_generated"
            }).eq("id", lead_id).execute()
        except Exception:
            pass

        return insights
