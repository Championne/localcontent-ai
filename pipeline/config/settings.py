import json
from pydantic_settings import BaseSettings
from pydantic import Field
from typing import Optional


class Settings(BaseSettings):
    # Supabase
    supabase_url: str = Field(..., alias="SUPABASE_URL")
    supabase_service_key: str = Field(..., alias="SUPABASE_SERVICE_KEY")

    # APIs
    outscraper_api_key: str = Field("", alias="OUTSCRAPER_API_KEY")
    openrouter_api_key: str = Field("", alias="OPENROUTER_API_KEY")
    instantly_api_key: str = Field("", alias="INSTANTLY_API_KEY")

    # AI model (OpenRouter model ID)
    ai_model: str = Field("anthropic/claude-sonnet-4", alias="AI_MODEL")

    # Target market
    target_city: str = Field("Denver, CO", alias="TARGET_CITY")
    target_state: str = Field("Colorado", alias="TARGET_STATE")
    target_category: str = Field("Hair Salon", alias="TARGET_CATEGORY")

    # Pipeline
    daily_scrape_target: int = Field(100, alias="DAILY_SCRAPE_TARGET")
    social_proof_stage: int = Field(1, alias="SOCIAL_PROOF_STAGE")
    sender_first_name: str = Field("James", alias="SENDER_FIRST_NAME")
    pipeline_enabled: bool = True

    # Learning engine
    learning_mode: str = Field("passive", alias="LEARNING_MODE")

    # Logging
    log_level: str = Field("INFO", alias="LOG_LEVEL")
    debug: bool = Field(False, alias="DEBUG")

    # Scoring thresholds
    tier_1_min: int = 80
    tier_2_min: int = 70
    tier_3_min: int = 60
    tier_4_min: int = 50

    # Rate limits
    instagram_delay_seconds: int = 60
    outscraper_batch_size: int = 50
    claude_requests_per_minute: int = 20

    # Email sequence
    sequence_day_spacing: list[int] = [0, 3, 7, 12]
    max_emails_per_sequence: int = 4
    ab_test_subject_lines: bool = True

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }

    def load_remote_settings(self):
        """Pull settings from Supabase pipeline_settings table (set via dashboard)."""
        try:
            from supabase import create_client
            db = create_client(self.supabase_url, self.supabase_service_key)
            result = db.table("pipeline_settings").select("key, value").execute()

            if not result.data:
                return

            mapping = {
                "daily_scrape_target": ("daily_scrape_target", int),
                "target_category": ("target_category", str),
                "target_city": ("target_city", str),
                "target_state": ("target_state", str),
                "social_proof_stage": ("social_proof_stage", int),
                "sender_first_name": ("sender_first_name", str),
                "learning_mode": ("learning_mode", str),
                "instagram_delay_seconds": ("instagram_delay_seconds", int),
                "pipeline_enabled": ("pipeline_enabled", bool),
                "tier_1_min": ("tier_1_min", int),
                "tier_2_min": ("tier_2_min", int),
                "max_competitors_per_lead": ("outscraper_batch_size", int),
                "ab_test_subject_lines": ("ab_test_subject_lines", bool),
            }

            for row in result.data:
                key = row["key"]
                raw = row["value"]
                if key in mapping:
                    attr, cast = mapping[key]
                    val = raw if not isinstance(raw, str) else json.loads(raw) if raw.startswith('"') or raw.startswith('{') else raw
                    try:
                        setattr(self, attr, cast(val))
                    except (ValueError, TypeError):
                        pass

        except Exception as e:
            # If remote load fails, continue with .env values
            print(f"[settings] Remote settings load failed (using .env): {e}")


settings = Settings()
settings.load_remote_settings()
