"""
Instantly.ai API v2 integration.
Handles campaign creation, lead upload with email sequences, and stats retrieval.
"""

import requests
from config.settings import settings
from config.database import db
from utils.logger import logger
from utils.helpers import retry

INSTANTLY_API_URL = "https://api.instantly.ai/api/v2"


class InstantlyAPI:
    def __init__(self):
        self.api_key = settings.instantly_api_key
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    def _request(self, endpoint: str, method: str = "GET", data: dict | None = None) -> dict | list | None:
        url = f"{INSTANTLY_API_URL}{endpoint}"

        try:
            if method == "GET":
                resp = requests.get(url, headers=self.headers, params=data, timeout=30)
            elif method == "POST":
                resp = requests.post(url, headers=self.headers, json=data, timeout=30)
            elif method == "PATCH":
                resp = requests.patch(url, headers=self.headers, json=data, timeout=30)
            else:
                resp = requests.request(method, url, headers=self.headers, json=data, timeout=30)

            if resp.status_code in (200, 201):
                return resp.json()
            else:
                logger.error(f"Instantly API {endpoint}: {resp.status_code} — {resp.text[:200]}")
                return None
        except Exception as e:
            logger.error(f"Instantly API request failed: {e}")
            return None

    # ── Campaigns ──

    def list_campaigns(self) -> list[dict]:
        result = self._request("/campaigns")
        if isinstance(result, dict):
            return result.get("items", [])
        return result if isinstance(result, list) else []

    @retry(max_attempts=2, delay=3.0)
    def create_campaign(self, name: str) -> str | None:
        result = self._request("/campaigns", method="POST", data={
            "name": name,
            "campaign_schedule": {
                "schedules": [{
                    "name": "Default",
                    "timing": {"from": "09:00", "to": "17:00"},
                    "days": {"0": False, "1": True, "2": True, "3": True, "4": True, "5": True, "6": False},
                    "timezone": "Europe/Berlin",
                }]
            },
        })
        if result and isinstance(result, dict):
            return result.get("id") or result.get("campaign_id")
        return None

    def get_campaign_stats(self, campaign_id: str) -> dict | None:
        return self._request(f"/campaigns/{campaign_id}/analytics")

    def launch_campaign(self, campaign_id: str) -> bool:
        result = self._request(f"/campaigns/{campaign_id}/launch", method="POST")
        return result is not None

    def pause_campaign(self, campaign_id: str) -> bool:
        result = self._request(f"/campaigns/{campaign_id}/pause", method="POST")
        return result is not None

    # ── Leads ──

    @retry(max_attempts=3, delay=3.0)
    def add_lead_with_sequence(
        self,
        campaign_id: str,
        lead_data: dict,
        email_sequence: list[dict],
    ) -> bool:
        email = lead_data.get("contact_email") or lead_data.get("owner_email")
        if not email:
            logger.warning(f"No email for lead {lead_data.get('business_name')} — skipping")
            return False

        first_name = (
            lead_data.get("owner_name", "").split()[0]
            if lead_data.get("owner_name")
            else lead_data.get("contact_name", "").split()[0]
            if lead_data.get("contact_name")
            else ""
        )

        lead = {
            "email": email,
            "first_name": first_name,
            "company_name": lead_data.get("business_name", ""),
            "custom_variables": {
                "business_name": lead_data.get("business_name", ""),
                "city": lead_data.get("city", ""),
                "category": lead_data.get("category", ""),
                "geospark_score": str(lead_data.get("geospark_score", "")),
                "score_tier": lead_data.get("score_tier", ""),
            },
        }

        result = self._request("/leads", method="POST", data={
            "campaign_id": campaign_id,
            "leads": [lead],
            "skip_if_in_workspace": True,
            "skip_if_in_campaign": True,
        })

        if result is None:
            return False

        logger.info(f"Added lead {email} to campaign {campaign_id}")
        return True

    def get_lead_status(self, campaign_id: str, email: str) -> dict | None:
        return self._request("/leads", data={
            "campaign_id": campaign_id,
            "email": email,
        })

    # ── Batch operations ──

    def upload_prospects(
        self,
        campaign_id: str,
        prospects: list[dict],
    ) -> dict:
        uploaded = 0
        failed = 0
        skipped = 0

        for prospect in prospects:
            lead_id = prospect.get("id")
            email = prospect.get("contact_email") or prospect.get("owner_email")

            if not email:
                skipped += 1
                continue

            try:
                seq_result = (
                    db.table("prospect_email_sequences")
                    .select("*")
                    .eq("lead_id", lead_id)
                    .eq("ab_variant", "a")
                    .order("email_number")
                    .execute()
                )
                sequence = seq_result.data or []
            except Exception as e:
                logger.error(f"Failed to fetch sequence for lead {lead_id}: {e}")
                failed += 1
                continue

            success = self.add_lead_with_sequence(campaign_id, prospect, sequence)

            if success:
                uploaded += 1
                try:
                    db.table("outreach_leads").update({
                        "pipeline_status": "uploaded_to_instantly",
                        "instantly_campaign_id": campaign_id,
                        "status": "contacted",
                    }).eq("id", lead_id).execute()
                except Exception:
                    pass
            else:
                failed += 1

        result = {"uploaded": uploaded, "failed": failed, "skipped": skipped}
        logger.info(f"Instantly upload: {result}")
        return result

    def get_or_create_campaign(self, name: str) -> str | None:
        campaigns = self.list_campaigns()
        for c in campaigns:
            if isinstance(c, dict) and c.get("name") == name:
                return c.get("id")

        return self.create_campaign(name)

    # ── Stats sync ──

    def sync_campaign_stats(self, campaign_id: str) -> dict | None:
        stats = self.get_campaign_stats(campaign_id)
        if not stats:
            return None

        try:
            db.table("outreach_campaigns").update({
                "emails_sent": stats.get("emails_sent", 0),
                "emails_opened": stats.get("emails_opened", 0) or stats.get("unique_opens", 0),
                "emails_replied": stats.get("emails_replied", 0),
                "total_leads": stats.get("total_leads", 0),
            }).eq("instantly_campaign_id", campaign_id).execute()
        except Exception as e:
            logger.warning(f"Failed to sync campaign stats: {e}")

        return stats
