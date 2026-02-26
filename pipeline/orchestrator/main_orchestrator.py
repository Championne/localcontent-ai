"""
Main pipeline orchestrator.
Coordinates all modules: scrape → enrich → score → insights → emails → upload.
"""

import time
from datetime import datetime, timezone
from config.settings import settings
from config.database import db
from scrapers.outscraper_scraper import OutscraperScraper
from scrapers.instagram_scraper import InstagramScraper
from scrapers.email_finder import EmailFinder
from scrapers.fresh_sources import FreshSourcesScraper
from scrapers.engagement_scraper import EngagementScraper
from enrichment.multi_platform import MultiPlatformEnricher
from enrichment.competitor_finder import CompetitorFinder
from scoring.scoring_engine import ScoringEngine
from insights.insight_generator import InsightGenerator
from emails.email_generator import EmailGenerator
from integrations.instantly_api import InstantlyAPI
from learning.learning_engine import LearningEngine
from utils.logger import logger
from utils.helpers import extract_instagram_username


class MainOrchestrator:
    def __init__(self):
        self.outscraper = OutscraperScraper()
        self.ig_scraper = InstagramScraper()
        self.email_finder = EmailFinder()
        self.fresh_sources = FreshSourcesScraper()
        self.engagement_scraper = EngagementScraper()
        self.enricher = MultiPlatformEnricher()
        self.competitor_finder = CompetitorFinder()
        self.scorer = ScoringEngine()
        self.insight_gen = InsightGenerator()
        self.email_gen = EmailGenerator()
        self.instantly = InstantlyAPI()
        self.learner = LearningEngine()

    def run_daily_workflow(self) -> dict:
        """Execute the full daily pipeline."""
        if not settings.pipeline_enabled:
            logger.info("Pipeline is DISABLED via dashboard settings. Exiting.")
            return {"run_id": None, "status": "disabled"}

        # Reload remote settings at start of each run
        settings.load_remote_settings()
        if not settings.pipeline_enabled:
            logger.info("Pipeline is DISABLED via dashboard settings. Exiting.")
            return {"run_id": None, "status": "disabled"}

        run_id = self._start_run()
        results = {
            "run_id": run_id,
            "scraped": 0,
            "enriched": 0,
            "scored": 0,
            "insights_generated": 0,
            "emails_generated": 0,
            "uploaded": 0,
            "errors": [],
        }

        start_time = time.time()

        # ── STEP 1: SCRAPE ──
        # Outscraper gets full target; fresh/engagement get spillover only if Outscraper under-delivers.
        try:
            logger.info("=" * 60)
            logger.info("STEP 1: SCRAPING")
            total_target = settings.daily_scrape_target

            # Primary: Outscraper (Google Maps) — full target
            logger.info(f"  1a. Outscraper: targeting {total_target}")
            outscraper_result = self.outscraper.scrape_and_save(limit=total_target)
            outscraper_saved = outscraper_result.get("saved", 0)

            # Spillover to secondary sources if Outscraper fell short
            remaining = max(0, total_target - outscraper_saved)
            fresh_saved = 0
            engagement_saved = 0

            if remaining > 0:
                logger.info(f"  1b. Fresh sources: targeting {remaining}")
                try:
                    fresh_result = self.fresh_sources.scrape_and_save(limit=remaining)
                    fresh_saved = fresh_result.get("saved", 0)
                except Exception as e:
                    logger.warning(f"  Fresh sources failed (non-fatal): {e}")

            remaining = max(0, remaining - fresh_saved)
            if remaining > 0:
                logger.info(f"  1c. Engagement targeting: targeting {remaining}")
                try:
                    engagement_result = self.engagement_scraper.scrape_and_save(max_prospects=remaining)
                    engagement_saved = engagement_result.get("saved", 0)
                except Exception as e:
                    logger.warning(f"  Engagement targeting failed (non-fatal): {e}")

            results["scraped"] = outscraper_saved + fresh_saved + engagement_saved
            logger.info(
                f"Scraped: {results['scraped']} total "
                f"(Outscraper: {outscraper_saved}, Fresh: {fresh_saved}, Engagement: {engagement_saved})"
            )
        except Exception as e:
            logger.error(f"Scraping failed: {e}", exc_info=True)
            results["errors"].append({"step": "scraping", "error": str(e)})

        # ── STEP 2: ENRICH ──
        try:
            logger.info("=" * 60)
            logger.info("STEP 2: ENRICHMENT")
            results["enriched"] = self._enrich_pending_leads()
        except Exception as e:
            logger.error(f"Enrichment failed: {e}", exc_info=True)
            results["errors"].append({"step": "enrichment", "error": str(e)})

        # ── STEP 3: SCORE ──
        try:
            logger.info("=" * 60)
            logger.info("STEP 3: SCORING")
            results["scored"] = self._score_enriched_leads()
        except Exception as e:
            logger.error(f"Scoring failed: {e}", exc_info=True)
            results["errors"].append({"step": "scoring", "error": str(e)})

        # ── STEP 4: INSIGHTS ──
        try:
            logger.info("=" * 60)
            logger.info("STEP 4: AI INSIGHTS")
            results["insights_generated"] = self._generate_insights_for_top_leads()
        except Exception as e:
            logger.error(f"Insight generation failed: {e}", exc_info=True)
            results["errors"].append({"step": "insights", "error": str(e)})

        # ── STEP 5: EMAIL GENERATION ──
        try:
            logger.info("=" * 60)
            logger.info("STEP 5: EMAIL GENERATION")
            results["emails_generated"] = self._generate_emails_for_top_leads()
        except Exception as e:
            logger.error(f"Email generation failed: {e}", exc_info=True)
            results["errors"].append({"step": "emails", "error": str(e)})

        # ── STEP 6: UPLOAD TO INSTANTLY ──
        # Disabled while email accounts are warming up — re-enable when ready
        logger.info("=" * 60)
        logger.info("STEP 6: INSTANTLY UPLOAD — SKIPPED (warmup mode)")
        results["uploaded"] = 0

        # ── STEP 7: LEARNING ──
        try:
            logger.info("=" * 60)
            logger.info("STEP 7: LEARNING ENGINE")
            recs = self.learner.generate_recommendations()
            logger.info(f"Learning engine: {len(recs)} recommendations")
        except Exception as e:
            logger.error(f"Learning engine failed: {e}", exc_info=True)
            results["errors"].append({"step": "learning", "error": str(e)})

        duration = int(time.time() - start_time)
        self._finish_run(run_id, results, duration)

        logger.info("=" * 60)
        logger.info("DAILY WORKFLOW COMPLETE")
        logger.info(f"Scraped: {results['scraped']} | Enriched: {results['enriched']} | "
                     f"Scored: {results['scored']} | Insights: {results['insights_generated']} | "
                     f"Emails: {results['emails_generated']} | Uploaded: {results['uploaded']}")
        logger.info(f"Duration: {duration}s | Errors: {len(results['errors'])}")
        logger.info("=" * 60)

        return results

    # ── Step implementations ──

    def _enrich_pending_leads(self) -> int:
        """Enrich all leads with pending enrichment status."""
        leads = (
            db.table("outreach_leads")
            .select("*")
            .eq("enrichment_status", "pending")
            .eq("pipeline_status", "scraped")
            .limit(settings.daily_scrape_target)
            .execute()
        )

        if not leads.data:
            logger.info("No leads to enrich")
            return 0

        enriched = 0
        for lead in leads.data:
            try:
                lead_id = lead["id"]

                # Mark as in progress
                db.table("outreach_leads").update({
                    "enrichment_status": "in_progress"
                }).eq("id", lead_id).execute()

                # Instagram
                ig_username = extract_instagram_username(lead.get("instagram_url"))
                if ig_username:
                    ig_data = self.ig_scraper.scrape_profile(ig_username)
                    if ig_data:
                        self.ig_scraper.save_profile_to_supabase(lead_id, ig_data)

                # Multi-platform (Yelp, website)
                self.enricher.enrich_lead(lead_id, lead)

                # Email finding (if no email yet)
                if not lead.get("contact_email") and not lead.get("owner_email"):
                    email_result = self.email_finder.find_email(lead)
                    if email_result:
                        db.table("outreach_leads").update({
                            "contact_email": email_result["email"],
                            "owner_email": email_result["email"],
                            "email_confidence": email_result["confidence"],
                            "email_source": email_result["source"],
                        }).eq("id", lead_id).execute()

                # Competitors (only for leads with Instagram)
                if ig_username:
                    try:
                        self.competitor_finder.analyze_competitors(lead_id, lead, max_competitors=2)
                    except Exception as e:
                        logger.warning(f"Competitor analysis failed for {lead_id}: {e}")

                # Mark enriched
                db.table("outreach_leads").update({
                    "enrichment_status": "completed",
                    "pipeline_status": "enriched",
                    "last_enriched_at": datetime.now(timezone.utc).isoformat(),
                }).eq("id", lead_id).execute()

                enriched += 1
                logger.info(f"Enriched lead {lead_id} ({lead.get('business_name')})")

            except Exception as e:
                logger.error(f"Enrichment failed for lead {lead.get('id')}: {e}")
                try:
                    db.table("outreach_leads").update({
                        "enrichment_status": "failed"
                    }).eq("id", lead["id"]).execute()
                except Exception:
                    pass

        return enriched

    def _score_enriched_leads(self) -> int:
        """Score all enriched but unscored leads."""
        leads = (
            db.table("outreach_leads")
            .select("*")
            .eq("pipeline_status", "enriched")
            .limit(500)
            .execute()
        )

        if not leads.data:
            return 0

        scored = 0
        for lead in leads.data:
            try:
                lead_id = lead["id"]

                # Get social data
                social = self._get_social_data(lead_id)
                self.scorer.score_and_save(lead_id, lead, social)
                scored += 1
            except Exception as e:
                logger.error(f"Scoring failed for lead {lead.get('id')}: {e}")

        return scored

    def _generate_insights_for_top_leads(self) -> int:
        """Generate insights for scored Tier 1-2 leads."""
        leads = (
            db.table("outreach_leads")
            .select("*")
            .eq("pipeline_status", "scored")
            .in_("score_tier", ["TIER_1", "TIER_2", "TIER_3"])
            .limit(50)
            .execute()
        )

        if not leads.data:
            return 0

        count = 0
        for lead in leads.data:
            try:
                lead_id = lead["id"]
                social = self._get_social_data(lead_id)
                competitors = self._get_competitors(lead_id)
                self.insight_gen.generate_and_save(lead_id, lead, social, competitors)
                count += 1
                time.sleep(2)  # Rate limit Claude API
            except Exception as e:
                logger.error(f"Insight generation failed for lead {lead.get('id')}: {e}")

        return count

    def _generate_emails_for_top_leads(self) -> int:
        """Generate email sequences for leads with insights and a valid email."""
        leads = (
            db.table("outreach_leads")
            .select("*")
            .eq("pipeline_status", "insights_generated")
            .not_.is_("contact_email", "null")
            .limit(50)
            .execute()
        )

        if not leads.data:
            # Also try owner_email
            leads = (
                db.table("outreach_leads")
                .select("*")
                .eq("pipeline_status", "insights_generated")
                .not_.is_("owner_email", "null")
                .limit(50)
                .execute()
            )

        if not leads.data:
            return 0

        count = 0
        for lead in leads.data:
            try:
                lead_id = lead["id"]
                social = self._get_social_data(lead_id)
                insights = self._get_insights(lead_id)
                competitors = self._get_competitors(lead_id)
                self.email_gen.generate_and_save(lead_id, lead, social, insights, competitors)
                count += 1
                time.sleep(2)  # Rate limit Claude API
            except Exception as e:
                logger.error(f"Email generation failed for lead {lead.get('id')}: {e}")

        return count

    def _upload_to_instantly(self) -> int:
        """Upload leads with generated emails to Instantly."""
        leads = (
            db.table("outreach_leads")
            .select("*")
            .eq("pipeline_status", "emails_generated")
            .limit(50)
            .execute()
        )

        if not leads.data:
            return 0

        campaign_name = (
            f"GeoSpark — {settings.target_category} — {settings.target_city} — "
            f"{datetime.now().strftime('%Y-%m-%d')}"
        )
        campaign_id = self.instantly.get_or_create_campaign(campaign_name)
        if not campaign_id:
            logger.error("Failed to get/create Instantly campaign")
            return 0

        result = self.instantly.upload_prospects(campaign_id, leads.data)
        return result.get("uploaded", 0)

    # ── Helpers ──

    def _get_social_data(self, lead_id: str) -> dict | None:
        try:
            result = (
                db.table("prospect_social_profiles")
                .select("*")
                .eq("lead_id", lead_id)
                .eq("platform", "instagram")
                .limit(1)
                .execute()
            )
            if result.data:
                profile = result.data[0]
                raw = profile.get("raw_data", {})
                profile["posting_patterns"] = raw.get("posting_patterns", {})
                profile["engagement_details"] = raw.get("engagement_details", {})
                return profile
        except Exception:
            pass
        return None

    def _get_competitors(self, lead_id: str) -> list[dict]:
        try:
            result = (
                db.table("prospect_competitors")
                .select("*")
                .eq("lead_id", lead_id)
                .execute()
            )
            return result.data or []
        except Exception:
            return []

    def _get_insights(self, lead_id: str) -> list[dict]:
        try:
            result = (
                db.table("prospect_marketing_insights")
                .select("*")
                .eq("lead_id", lead_id)
                .order("priority_score", desc=True)
                .execute()
            )
            return result.data or []
        except Exception:
            return []

    # ── Run tracking ──

    def _start_run(self) -> str | None:
        try:
            result = db.table("pipeline_runs").insert({
                "status": "running",
                "config_snapshot": {
                    "target_city": settings.target_city,
                    "target_category": settings.target_category,
                    "daily_target": settings.daily_scrape_target,
                    "learning_mode": settings.learning_mode,
                },
            }).execute()
            return result.data[0]["id"] if result.data else None
        except Exception as e:
            logger.error(f"Failed to create pipeline run: {e}")
            return None

    def _finish_run(self, run_id: str | None, results: dict, duration: int):
        if not run_id:
            return
        try:
            db.table("pipeline_runs").update({
                "status": "completed" if not results["errors"] else "partial",
                "prospects_scraped": results["scraped"],
                "prospects_enriched": results["enriched"],
                "prospects_scored": results["scored"],
                "insights_generated": results["insights_generated"],
                "emails_generated": results["emails_generated"],
                "uploaded_to_instantly": results["uploaded"],
                "errors": results["errors"],
                "duration_seconds": duration,
                "completed_at": datetime.now(timezone.utc).isoformat(),
            }).eq("id", run_id).execute()
        except Exception as e:
            logger.error(f"Failed to update pipeline run: {e}")
