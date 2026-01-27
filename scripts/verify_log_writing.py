import logging
import os

LOG_FILE = "localcontent_ai/ab_test_metrics.log"

def setup_ab_test_logger():
    # Ensure the log file exists
    os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)
    if not os.path.exists(LOG_FILE):
        with open(LOG_FILE, 'a'):
            pass # Create empty file if it doesn't exist

    logger = logging.getLogger('ab_test_metrics')
    logger.setLevel(logging.INFO)

    # Prevent adding multiple handlers if the script is run multiple times
    if not logger.handlers:
        file_handler = logging.FileHandler(LOG_FILE)
        formatter = logging.Formatter('%(asctime)s - %(message)s')
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
    return logger

def mock_log_entry(user_id, content_id, ab_group, action):
    logger = setup_ab_test_logger()
    logger.info(f"USER_ID:{user_id}, CONTENT_ID:{content_id}, AB_GROUP:{ab_group}, ACTION:{action}")

if __name__ == "__main__":
    print(f"Writing mock log entries to {LOG_FILE}...")
    mock_log_entry("user123", "content_A", "control", "view")
    mock_log_entry("user456", "content_B", "variant", "click")
    mock_log_entry("user789", "content_C", "control", "skip")
    print("Mock log entries written. You can now check the file content.")
