
import random
import datetime
import uuid
import argparse
import time

def get_variants():
    """Defines the available content variants."""
    return ['variant_A', 'variant_B']

def assign_variant():
    """Randomly assigns a user to one of the defined variants."""
    variants = get_variants()
    return random.choice(variants)

def log_event(test_name, user_id, variant, event_type, log_file='ab_test_metrics.log'):
    """Logs an A/B test event to a specified file."""
    timestamp = datetime.datetime.now().isoformat()
    log_entry = f"[{timestamp}] | {test_name} | {variant} | {event_type} | {user_id}\n"
    with open(log_file, 'a') as f:
        f.write(log_entry)
    print(f"Logged: {log_entry.strip()}")

def simulate_content_serving(test_name, num_users=1, simulate_click_chance=0.3, log_file=None):
    """
    Simulates serving content to a number of users, assigning variants,
    logging VIEW events, and optionally logging CTA_CLICK events.
    """
    for _ in range(num_users):
        user_id = str(uuid.uuid4())
        assigned_variant = assign_variant()

        print(f"User {user_id} assigned to {assigned_variant}")

        # Simulate VIEW event
        log_event(test_name, user_id, assigned_variant, 'VIEW', log_file=log_file)

        # Optionally simulate CTA_CLICK event
        if random.random() < simulate_click_chance:
            time.sleep(0.1) # Simulate a small delay before click
            log_event(test_name, user_id, assigned_variant, 'CTA_CLICK', log_file=log_file)

def main():
    parser = argparse.ArgumentParser(description="Simulate A/B testing content serving and event logging.")
    parser.add_argument('--num_users', type=int, default=1,
                        help="Number of simulated users to process.")
    parser.add_argument('--click_chance', type=float, default=0.3,
                        help="Probability (0.0 to 1.0) of a user generating a CTA_CLICK event after a VIEW.")

    args = parser.parse_args()

    simulate_content_serving(args.num_users, args.click_chance)

if __name__ == "__main__":
    main()
