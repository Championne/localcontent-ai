from pydantic_settings import BaseSettings
from pydantic import Field
from typing import Optional


class Settings(BaseSettings):
    # Supabase
    supabase_url: str = Field(..., alias="SUPABASE_URL")
    supabase_service_key: str = Field(..., alias="SUPABASE_SERVICE_KEY")

    # APIs
    outscraper_api_key: str = Field("", alias="OUTSCRAPER_API_KEY")
    anthropic_api_key: str = Field("", alias="ANTHROPIC_API_KEY")
    instantly_api_key: str = Field("", alias="INSTANTLY_API_KEY")

    # Target market
    target_city: str = Field("Denver, CO", alias="TARGET_CITY")
    target_state: str = Field("Colorado", alias="TARGET_STATE")
    target_category: str = Field("Hair Salon", alias="TARGET_CATEGORY")

    # Pipeline
    daily_scrape_target: int = Field(100, alias="DAILY_SCRAPE_TARGET")
    social_proof_stage: int = Field(1, alias="SOCIAL_PROOF_STAGE")
    sender_first_name: str = Field("James", alias="SENDER_FIRST_NAME")

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


settings = Settings()
