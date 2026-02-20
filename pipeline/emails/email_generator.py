"""
AI email sequence generator using Claude API.
Uses the Email Playbook prompt to generate hyper-personalized 4-email sequences.
"""

import json
import anthropic
from config.settings import settings
from config.database import db
from utils.logger import logger
from utils.helpers import retry


class EmailGenerator:
    def __init__(self):
        self.client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

    @retry(max_attempts=2, delay=5.0)
    def generate_sequence(
        self,
        lead_id: str,
        lead_data: dict,
        social_data: dict | None = None,
        insights: list[dict] | None = None,
        competitors: list[dict] | None = None,
    ) -> list[dict]:
        system_prompt = self._build_system_prompt()
        user_prompt = self._build_user_prompt(lead_data, social_data, insights, competitors)

        response = self.client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=3000,
            messages=[{"role": "user", "content": user_prompt}],
            system=system_prompt,
        )

        text = response.content[0].text
        emails = self._parse_response(text)

        if not emails:
            logger.warning(f"No emails parsed for lead {lead_id}")
            return []

        logger.info(f"Generated {len(emails)} emails for lead {lead_id}")
        return emails

    def _build_system_prompt(self) -> str:
        return f"""You are GeoSpark's cold email writer. You generate hyper-personalized cold email sequences for local business owners.

You are NOT writing marketing emails. You are writing short, direct messages from one person to another — like a knowledgeable friend texting a business owner something useful they noticed.

## CORE RULES (Never Violate)

1. Never open by introducing yourself or GeoSpark. First line is about THEM.
2. Never use filler phrases. Banned: "I wanted to reach out," "I hope this finds you well," "I came across your business," "Just following up," "Touching base."
3. Every email must contain at least 3 specific numbers from their data. Use exact figures.
4. Word limits: Email 1: 75-100 words. Email 2: 75-100 words. Email 3: 100-125 words. Email 4: 50-75 words.
5. Write at an 8th-grade reading level. Short sentences. No jargon.
6. One idea per email.
7. Never lie or fabricate data.

## TONE
- Conversational. Use contractions (you're, don't, isn't).
- Use dashes instead of semicolons or colons.
- Sentence fragments are fine.
- No exclamation marks in body. One allowed in P.S.
- No emojis.
- First-person singular: "I" not "we."
- Sign off with just: — {settings.sender_first_name}

## SUBJECT LINES
- 3-7 words, lowercase
- Reference something specific to the prospect
- No clickbait, no "RE:" tricks
- Include a number when possible

## EMAIL STRUCTURE

Email 1 (Day 0) — The Insight:
- Question opener using their data
- Strongest insight with 3+ specific numbers
- One-line plain-language implication
- Soft permission CTA: "Want me to send the breakdown?" / "Mind if I share it?"

Email 2 (Day 3) — Different Angle:
- Bridge from Email 1 (brief, no "just following up")
- DIFFERENT insight type than Email 1
- Quick actionable tip
- Soft CTA

Email 3 (Day 7) — Social Proof:
{"Use INDUSTRY BENCHMARKS (no case studies available yet). Compare their numbers to top performers in their category and city. Project what closing the gap would look like." if settings.social_proof_stage == 1 else "Use real case study results."}
- Slightly firmer CTA: "Want to see how this'd work for [business]?"

Email 4 (Day 12) — Breakup:
- Short, human, no pressure
- "Closing the loop" framing
- P.S. with genuine compliment from their data (review quote, best content, rating)

## WHAT NOT TO DO
- Don't mention pricing, packages, or plans
- Don't use "we" — always "I"
- Don't mention AI, automation, or software
- Don't promise specific results
- Don't neg or insult their work
- Don't reference scraping — say "I noticed" or "looking at your numbers"
- Don't use same insight type in Email 1 and Email 2
- Don't include links in any email
- Plain text only, no HTML formatting

## OUTPUT FORMAT
Return ONLY a JSON array of 4 email objects. Each must have:
- email_number (1-4)
- send_delay_days (0, 3, 7, 12)
- subject_line
- body
- insight_type_used
- subject_pattern_used (describe the pattern)
- cta_style_used (describe the CTA approach)
- data_points_used (list of field names)
- data_points_count (integer)
- word_count (integer)
- personalization_pct (estimated 0-100)"""

    def _build_user_prompt(
        self,
        lead: dict,
        social: dict | None,
        insights: list[dict] | None,
        competitors: list[dict] | None,
    ) -> str:
        parts = [
            "Generate a 4-email cold outreach sequence for this prospect.\n",
            "## PROSPECT DATA",
            f"Business Name: {lead.get('business_name')}",
            f"Owner/Contact Name: {lead.get('owner_name') or lead.get('contact_name') or 'Unknown'}",
            f"Category: {lead.get('category', 'Local Business')}",
            f"City: {lead.get('city', '')}, {lead.get('state', '')}",
            f"Google Rating: {lead.get('google_rating', 'N/A')}",
            f"Google Reviews: {lead.get('google_reviews_count', 'N/A')}",
            f"Website: {lead.get('website', 'None')}",
        ]

        source = lead.get("prospect_source", "outscraper")
        if source == "fresh_source":
            parts.append(f"\nSOURCE: Fresh source — {lead.get('prospect_source_detail', 'state license/award')}")
            parts.append("IMPORTANT: Reference the source in Email 1 opener.")
        elif source == "engagement":
            parts.append(f"\nSOURCE: Engagement targeting — {lead.get('prospect_source_detail', 'Instagram engagement')}")
            parts.append("IMPORTANT: Reference their specific engagement in Email 1 opener.")

        if social:
            parts.extend([
                "\n## INSTAGRAM DATA",
                f"Username: @{social.get('username', 'N/A')}",
                f"Followers: {social.get('followers', 'N/A')}",
                f"Following: {social.get('following', 'N/A')}",
                f"Posts Count: {social.get('posts_count', 'N/A')}",
                f"Engagement Rate: {social.get('engagement_rate', 'N/A')}%",
                f"Posts Last 30 Days: {social.get('posts_last_30_days', 'N/A')}",
                f"Posting Frequency: {social.get('posting_frequency', 'N/A')} posts/month",
                f"Days Since Last Post: {social.get('posting_patterns', {}).get('days_since_last_post', 'N/A')}",
                f"Max Gap: {social.get('posting_patterns', {}).get('max_gap_days', 'N/A')} days",
            ])

            eng = social.get("engagement_details", {})
            if eng:
                parts.extend([
                    f"Avg Likes: {eng.get('avg_likes', 'N/A')}",
                    f"Avg Comments: {eng.get('avg_comments', 'N/A')}",
                    f"Best Post Type: {eng.get('best_post_type', 'N/A')} ({eng.get('best_engagement', 0):.2f}% engagement)",
                    f"Worst Post Type: {eng.get('worst_post_type', 'N/A')} ({eng.get('worst_engagement', 0):.2f}% engagement)",
                ])

            content = social.get("content_breakdown", {})
            if content:
                parts.append("\nContent Breakdown:")
                for ctype, data in content.items():
                    if isinstance(data, dict):
                        parts.append(f"  - {ctype}: {data.get('pct', 0)}%")

            tools = social.get("tools_detected", [])
            if tools:
                parts.append(f"\nTools Detected: {', '.join(tools)}")

        if competitors:
            parts.append("\n## COMPETITOR DATA")
            for c in competitors:
                cd = c.get("competitor_data", {})
                parts.append(
                    f"- {c.get('competitor_name')}: "
                    f"{cd.get('ig_followers', 'N/A')} followers, "
                    f"{cd.get('ig_posting_frequency', 'N/A')} posts/month, "
                    f"{cd.get('ig_engagement_rate', 'N/A')}% engagement"
                )

        if insights:
            sorted_insights = sorted(insights, key=lambda x: x.get("priority_score", 0), reverse=True)
            parts.append("\n## AI-GENERATED INSIGHTS (use top ones for emails)")
            for ins in sorted_insights[:7]:
                parts.append(
                    f"- [{ins.get('priority_score', 0)}/10] {ins.get('insight_type')}: "
                    f"{ins.get('insight_title')} — {ins.get('insight_description')}"
                )

        parts.append(f"\nSender name: {settings.sender_first_name}")
        parts.append("\nGenerate the 4-email sequence. Return ONLY the JSON array.")

        return "\n".join(parts)

    def _parse_response(self, text: str) -> list[dict]:
        text = text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[-1]
            text = text.rsplit("```", 1)[0]

        try:
            emails = json.loads(text)
            if isinstance(emails, list):
                valid = []
                for e in emails:
                    if all(k in e for k in ("email_number", "subject_line", "body")):
                        valid.append(e)
                return valid
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse email sequence JSON: {e}")
        return []

    def generate_and_save(
        self,
        lead_id: str,
        lead_data: dict,
        social_data: dict | None = None,
        insights: list[dict] | None = None,
        competitors: list[dict] | None = None,
    ) -> list[dict]:
        emails = self.generate_sequence(lead_id, lead_data, social_data, insights, competitors)

        for e in emails:
            try:
                row = {
                    "lead_id": lead_id,
                    "email_number": e["email_number"],
                    "send_delay_days": e.get("send_delay_days", settings.sequence_day_spacing[e["email_number"] - 1]),
                    "subject_line": e["subject_line"],
                    "email_body": e["body"],
                    "personalization_pct": e.get("personalization_pct"),
                    "data_points_used": e.get("data_points_used", []),
                    "data_points_count": e.get("data_points_count", 0),
                    "word_count": e.get("word_count") or len(e["body"].split()),
                    "insight_type_used": e.get("insight_type_used"),
                    "subject_pattern_used": e.get("subject_pattern_used"),
                    "cta_style_used": e.get("cta_style_used"),
                    "ab_variant": "a",
                }
                db.table("prospect_email_sequences").upsert(
                    row, on_conflict="lead_id,email_number,ab_variant"
                ).execute()
            except Exception as ex:
                logger.error(f"Failed to save email {e.get('email_number')} for lead {lead_id}: {ex}")

        try:
            db.table("outreach_leads").update({
                "pipeline_status": "emails_generated"
            }).eq("id", lead_id).execute()
        except Exception:
            pass

        return emails
