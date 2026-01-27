
import argparse
import os
from pathlib import Path

# Import functions from the other scripts
from localcontent_ai.scripts.generate_variants import generate_all_variants
from localcontent_ai.scripts.serve_content import simulate_content_serving
from localcontent_ai.scripts.analyze_results import (
    aggregate_metrics,
    calculate_conversion_rates,
    generate_html_report,
)

# Define constants for file paths
LOG_FILE = Path("localcontent_ai/ab_test_metrics.log")
OUTPUT_BASE_DIR = Path("localcontent_ai/ab_tests") # This is also defined in generate_variants.py

def run_ab_test(test_name, num_users=100, simulate_click_chance=0.3):
    """
    Orchestrates the entire A/B testing process.
    1. Generates content variants.
    2. Simulates user interactions and logs events.
    3. Analyzes the results and displays them.
    """
    print("--- Starting A/B Test Orchestration ---")

    # Ensure the log file is clean for a new test
    if LOG_FILE.exists():
        os.remove(LOG_FILE)
        print(f"Cleaned up previous log file: {LOG_FILE}")

    # 1. Generate content variants
    print("\n--- Step 1: Generating Content Variants ---")
    generate_all_variants()
    print("Content variants generated successfully.")

    # 2. Simulate user interactions and log events
    print("\n--- Step 2: Simulating User Interactions ---")
    print(f"Simulating {num_users} users with a click chance of {simulate_click_chance*100}%...")
    simulate_content_serving(test_name=test_name, num_users=num_users, simulate_click_chance=simulate_click_chance, log_file=LOG_FILE)
    print("User interactions simulated and events logged.")

    # 3. Analyze the results
    print("\n--- Step 3: Analyzing A/B Test Results ---")
    aggregated_data = aggregate_metrics(LOG_FILE, test_name)
    results = calculate_conversion_rates(aggregated_data)

    report_html = generate_html_report(test_name, results)
    output_dir = OUTPUT_BASE_DIR / "results"
    os.makedirs(output_dir, exist_ok=True)
    report_file_path = output_dir / f"{test_name}_report.html"
    with open(report_file_path, "w") as f:
        f.write(report_html)
    print(f"A/B test report saved to: {report_file_path}")
    print("A/B test results analyzed and displayed.")

    print("\n--- A/B Test Orchestration Complete ---")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Orchestrate an A/B testing framework.")
    parser.add_argument("--test_name", type=str, default="test_name",
                        help="The name of the A/B test to run and analyze (e.g., 'test_name').")
    parser.add_argument("--num_users", type=int, default=100,
                        help="Number of simulated users for the A/B test.")
    parser.add_argument("--click_chance", type=float, default=0.3,
                        help="Probability (0.0 to 1.0) of a simulated user generating a CTA_CLICK event.")

    args = parser.parse_args()

    run_ab_test(args.test_name, args.num_users, args.click_chance)
