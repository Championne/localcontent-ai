import datetime
import os

LOG_FILE = "ab_test_metrics.log"
LOG_DIR = "./"  # Log file will be in the current working directory for simplicity

def log_event(event_type: str, test_id: str, variant: str, user_id: str, details: dict = {}):
    """
    Logs a standardized A/B test event to a file.

    Args:
        event_type (str): The type of interaction recorded (e.g., "VIEW", "CTA_CLICK").
        test_id (str): A unique identifier for the specific A/B test.
        variant (str): The identifier of the content variant presented to the user.
        user_id (str): A unique identifier for the user session.
        details (dict, optional): Additional details for the event. Not included in the primary log format,
                                   but can be used for future extensions or internal debugging.
    """
    timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds').replace('+00:00', 'Z')
    log_entry = f"{timestamp} | {test_id} | {variant} | {event_type} | {user_id}"

    # Ensure the log directory exists
    os.makedirs(LOG_DIR, exist_ok=True)

    log_path = os.path.join(LOG_DIR, LOG_FILE)
    with open(log_path, 'a') as f:
        f.write(log_entry + '\n')
    print(f"Logged event: {log_entry}")

if __name__ == "__main__":
    print("--- Demonstrating A/B Test Logger ---")

    # Example 1: User views a control variant
    log_event(event_type="VIEW",
              test_id="homepage_hero_test",
              variant="control",
              user_id="user_abc123")

    # Example 2: User views a variant B
    log_event(event_type="VIEW",
              test_id="homepage_hero_test",
              variant="variant_B",
              user_id="user_def456")

    # Example 3: User clicks a CTA on variant A
    log_event(event_type="CTA_CLICK",
              test_id="product_page_cta",
              variant="variant_A",
              user_id="user_ghi789",
              details={"cta_text": "Buy Now", "product_id": "P123"})
    
    # Example 4: Another view event
    log_event(event_type="VIEW",
              test_id="product_page_cta",
              variant="control",
              user_id="user_jkl012")

    print(f"Events logged to {os.path.join(LOG_DIR, LOG_FILE)}")
    print("\n--- Contents of ab_test_metrics.log ---")
    try:
        with open(os.path.join(LOG_DIR, LOG_FILE), 'r') as f:
            print(f.read())
    except FileNotFoundError:
        print("Log file not found yet.")
