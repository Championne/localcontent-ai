#!/usr/bin/env python3
"""
GeoSpark Autonomous Sales Machine — Daily Workflow
Run this script daily (via cron) to execute the complete pipeline.

Usage:
    python daily_workflow.py                    # Full daily run
    python daily_workflow.py --scrape-only      # Scrape only
    python daily_workflow.py --target 50        # Override daily target
    python daily_workflow.py --dry-run          # Log but don't save
"""

import sys
import argparse
from config.settings import settings
from orchestrator.main_orchestrator import MainOrchestrator
from utils.logger import logger


def main():
    parser = argparse.ArgumentParser(description="GeoSpark Autonomous Sales Machine")
    parser.add_argument("--target", type=int, help="Override daily scrape target")
    parser.add_argument("--category", type=str, help="Override target category")
    parser.add_argument("--city", type=str, help="Override target city")
    parser.add_argument("--scrape-only", action="store_true", help="Only run scraping step")
    parser.add_argument("--dry-run", action="store_true", help="Log actions but don't execute")
    args = parser.parse_args()

    if args.target:
        settings.daily_scrape_target = args.target
    if args.category:
        settings.target_category = args.category
    if args.city:
        settings.target_city = args.city

    logger.info("=" * 60)
    logger.info("GEOSPARK AUTONOMOUS SALES MACHINE — STARTING")
    logger.info(f"Target: {settings.target_category} in {settings.target_city}")
    logger.info(f"Daily target: {settings.daily_scrape_target}")
    logger.info(f"Learning mode: {settings.learning_mode}")
    logger.info("=" * 60)

    if args.dry_run:
        logger.info("DRY RUN — no data will be saved")
        return 0

    try:
        orchestrator = MainOrchestrator()

        if args.scrape_only:
            from scrapers.outscraper_scraper import OutscraperScraper
            scraper = OutscraperScraper()
            result = scraper.scrape_and_save(limit=settings.daily_scrape_target)
            logger.info(f"Scrape complete: {result}")
            return 0

        results = orchestrator.run_daily_workflow()

        if results.get("errors"):
            logger.warning(f"Completed with {len(results['errors'])} errors")
            return 1

        return 0

    except Exception as e:
        logger.error(f"FATAL ERROR: {e}", exc_info=True)
        return 1


if __name__ == "__main__":
    sys.exit(main())
