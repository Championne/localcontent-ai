"""
Learning engine — tracks email performance and optimizes pipeline parameters.
Modes: passive (collect data), active (recommend), autonomous (auto-apply).
"""

from datetime import datetime, timezone
from config.settings import settings
from config.database import db
from utils.logger import logger


class LearningEngine:
    # Minimum data thresholds before analysis
    MIN_EMAILS_FOR_ACTIVE = 50
    MIN_REPLIES_FOR_PATTERNS = 10
    CONFIDENCE_THRESHOLD_AUTO = 85  # Auto-apply above this

    def __init__(self):
        self.mode = settings.learning_mode  # passive, active, autonomous

    # ── Tracking ──

    def track_email_event(self, lead_id: str, email_number: int, event: str, metadata: dict | None = None):
        """Track opens, replies, bounces."""
        update = {}
        now = datetime.now(timezone.utc).isoformat()

        if event == "opened":
            update = {"opened": True, "opened_at": now}
        elif event == "replied":
            update = {"replied": True, "replied_at": now}
            if metadata and "sentiment" in metadata:
                update["reply_sentiment"] = metadata["sentiment"]
        elif event == "sent":
            update = {"sent": True, "sent_at": now}
        else:
            return

        try:
            db.table("prospect_email_sequences").update(update).eq(
                "lead_id", lead_id
            ).eq("email_number", email_number).execute()
        except Exception as e:
            logger.error(f"Failed to track {event} for lead {lead_id} email {email_number}: {e}")

    def track_conversion(self, lead_id: str, conversion_type: str, value: float = 0):
        """Track demo booked, trial started, became customer."""
        try:
            db.table("outreach_leads").update({
                "status": conversion_type,
                "pipeline_status": "completed",
            }).eq("id", lead_id).execute()
        except Exception as e:
            logger.error(f"Failed to track conversion for lead {lead_id}: {e}")

    # ── Analysis ──

    def analyze_performance(self) -> dict:
        """Analyze overall pipeline performance."""
        try:
            emails = db.table("prospect_email_sequences").select(
                "email_number, insight_type_used, subject_pattern_used, cta_style_used, "
                "word_count, personalization_pct, sent, opened, replied, reply_sentiment"
            ).eq("sent", True).execute()

            if not emails.data:
                return {"status": "insufficient_data", "emails_sent": 0}

            data = emails.data
            total = len(data)
            opened = sum(1 for e in data if e.get("opened"))
            replied = sum(1 for e in data if e.get("replied"))
            positive = sum(1 for e in data if e.get("reply_sentiment") == "positive")

            metrics = {
                "total_sent": total,
                "total_opened": opened,
                "total_replied": replied,
                "total_positive": positive,
                "open_rate": round(opened / total * 100, 1) if total else 0,
                "reply_rate": round(replied / total * 100, 1) if total else 0,
                "positive_rate": round(positive / total * 100, 1) if total else 0,
            }

            # Breakdowns
            metrics["by_email_number"] = self._analyze_by_field(data, "email_number")
            metrics["by_insight_type"] = self._analyze_by_field(data, "insight_type_used")
            metrics["by_cta_style"] = self._analyze_by_field(data, "cta_style_used")
            metrics["by_subject_pattern"] = self._analyze_by_field(data, "subject_pattern_used")

            # Word count analysis
            replied_wc = [e.get("word_count", 0) for e in data if e.get("replied") and e.get("word_count")]
            not_replied_wc = [e.get("word_count", 0) for e in data if not e.get("replied") and e.get("word_count")]
            if replied_wc:
                metrics["optimal_word_count"] = {
                    "replied_avg": round(sum(replied_wc) / len(replied_wc)),
                    "not_replied_avg": round(sum(not_replied_wc) / len(not_replied_wc)) if not_replied_wc else None,
                }

            return metrics

        except Exception as e:
            logger.error(f"Performance analysis failed: {e}")
            return {"status": "error", "error": str(e)}

    def _analyze_by_field(self, data: list[dict], field: str) -> dict:
        groups: dict[str, dict] = {}
        for e in data:
            key = str(e.get(field, "unknown"))
            if key not in groups:
                groups[key] = {"sent": 0, "opened": 0, "replied": 0, "positive": 0}
            groups[key]["sent"] += 1
            if e.get("opened"):
                groups[key]["opened"] += 1
            if e.get("replied"):
                groups[key]["replied"] += 1
            if e.get("reply_sentiment") == "positive":
                groups[key]["positive"] += 1

        for key, g in groups.items():
            g["open_rate"] = round(g["opened"] / g["sent"] * 100, 1) if g["sent"] else 0
            g["reply_rate"] = round(g["replied"] / g["sent"] * 100, 1) if g["sent"] else 0

        return groups

    # ── Recommendations ──

    def generate_recommendations(self) -> list[dict]:
        """Generate optimization recommendations based on patterns."""
        metrics = self.analyze_performance()

        if metrics.get("status") == "insufficient_data":
            logger.info("Learning engine: insufficient data for recommendations")
            return []

        total_sent = metrics.get("total_sent", 0)
        if total_sent < self.MIN_EMAILS_FOR_ACTIVE:
            logger.info(f"Learning engine: {total_sent} emails sent, need {self.MIN_EMAILS_FOR_ACTIVE} for active mode")
            return []

        recommendations = []

        # Insight type performance
        by_insight = metrics.get("by_insight_type", {})
        if len(by_insight) >= 2:
            best = max(by_insight.items(), key=lambda x: x[1].get("reply_rate", 0))
            worst = min(by_insight.items(), key=lambda x: x[1].get("reply_rate", 0))
            if best[1]["reply_rate"] > worst[1]["reply_rate"] + 3:
                recommendations.append({
                    "learning_type": "insight_priority",
                    "parameter_name": "email_1_insight_type",
                    "current_value": {"best": best[0], "best_rate": best[1]["reply_rate"]},
                    "evidence": {"worst": worst[0], "worst_rate": worst[1]["reply_rate"]},
                    "confidence": min(best[1]["sent"] * 2, 95),
                    "description": f"'{best[0]}' insights get {best[1]['reply_rate']}% replies vs '{worst[0]}' at {worst[1]['reply_rate']}%",
                })

        # CTA style performance
        by_cta = metrics.get("by_cta_style", {})
        if len(by_cta) >= 2:
            best = max(by_cta.items(), key=lambda x: x[1].get("reply_rate", 0))
            if best[1]["sent"] >= 10:
                recommendations.append({
                    "learning_type": "cta_style",
                    "parameter_name": "preferred_cta_style",
                    "current_value": {"style": best[0], "reply_rate": best[1]["reply_rate"]},
                    "confidence": min(best[1]["sent"] * 2, 90),
                    "description": f"CTA style '{best[0]}' has highest reply rate at {best[1]['reply_rate']}%",
                })

        # Word count optimization
        wc = metrics.get("optimal_word_count", {})
        if wc.get("replied_avg") and wc.get("not_replied_avg"):
            diff = abs(wc["replied_avg"] - wc["not_replied_avg"])
            if diff > 10:
                recommendations.append({
                    "learning_type": "word_count",
                    "parameter_name": "optimal_word_count",
                    "current_value": {"target": wc["replied_avg"]},
                    "evidence": {
                        "replied_avg": wc["replied_avg"],
                        "not_replied_avg": wc["not_replied_avg"],
                    },
                    "confidence": min(metrics["total_replied"] * 3, 85),
                    "description": f"Replied emails avg {wc['replied_avg']} words vs {wc['not_replied_avg']} for non-replied",
                })

        # Source performance
        try:
            source_stats = db.rpc("", {}).execute()  # Placeholder — actual query below
        except Exception:
            pass

        # Save recommendations
        for rec in recommendations:
            self._save_learning(rec)

        # Auto-apply if autonomous
        if self.mode == "autonomous":
            self._auto_apply(recommendations)

        logger.info(f"Learning engine generated {len(recommendations)} recommendations")
        return recommendations

    def _save_learning(self, rec: dict):
        try:
            db.table("pipeline_learnings").insert({
                "learning_type": rec["learning_type"],
                "parameter_name": rec["parameter_name"],
                "current_value": rec["current_value"],
                "confidence": rec.get("confidence", 0),
                "evidence": rec.get("evidence", {}),
                "status": "recommended" if self.mode != "autonomous" else "applied",
                "sample_size": rec.get("sample_size", 0),
            }).execute()
        except Exception as e:
            logger.error(f"Failed to save learning: {e}")

    def _auto_apply(self, recommendations: list[dict]):
        """Auto-apply high-confidence recommendations."""
        for rec in recommendations:
            if rec.get("confidence", 0) >= self.CONFIDENCE_THRESHOLD_AUTO:
                logger.info(f"AUTO-APPLYING: {rec['description']} (confidence: {rec['confidence']}%)")
                # The actual application happens through the config/prompt system
                # The orchestrator reads learnings and adjusts parameters
                try:
                    db.table("pipeline_learnings").update({
                        "status": "applied",
                        "applied_at": datetime.now(timezone.utc).isoformat(),
                    }).eq("parameter_name", rec["parameter_name"]).eq(
                        "status", "recommended"
                    ).execute()
                except Exception as e:
                    logger.error(f"Failed to auto-apply learning: {e}")

    # ── Source analysis ──

    def analyze_source_performance(self) -> dict:
        """Analyze which prospect sources perform best."""
        try:
            result = db.table("outreach_leads").select(
                "prospect_source, pipeline_status, status"
            ).in_("pipeline_status", ["uploaded_to_instantly", "sending", "completed"]).execute()

            if not result.data:
                return {}

            sources: dict[str, dict] = {}
            for lead in result.data:
                src = lead.get("prospect_source", "unknown")
                if src not in sources:
                    sources[src] = {"total": 0, "contacted": 0, "replied": 0, "converted": 0}
                sources[src]["total"] += 1
                if lead.get("status") in ("contacted", "replied", "interested", "demo_scheduled", "converted"):
                    sources[src]["contacted"] += 1
                if lead.get("status") in ("replied", "interested", "demo_scheduled", "converted"):
                    sources[src]["replied"] += 1
                if lead.get("status") == "converted":
                    sources[src]["converted"] += 1

            for src, s in sources.items():
                s["reply_rate"] = round(s["replied"] / s["contacted"] * 100, 1) if s["contacted"] else 0

            return sources
        except Exception as e:
            logger.error(f"Source analysis failed: {e}")
            return {}
