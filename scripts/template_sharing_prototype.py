
import json
import os

SHARED_TEMPLATES_FILE = "shared_templates.json"

def _load_shared_templates():
    """Loads shared templates from the JSON file."""
    if os.path.exists(SHARED_TEMPLATES_FILE):
        with open(SHARED_TEMPLATES_FILE, "r") as f:
            try:
                return json.load(f)
            except json.JSONDecodeError:
                return []
    return []

def _save_shared_templates(templates):
    """Saves shared templates to the JSON file."""
    with open(SHARED_TEMPLATES_FILE, "w") as f:
        json.dump(templates, f, indent=4)

def share_template(template_id: str, recipient_id: str, permissions: list):
    """
    Simulates sharing a template with a recipient and specified permissions.
    Adds the shared template to a mock JSON data structure.
    """
    shared_templates = _load_shared_templates()
    new_share = {
        "template_id": template_id,
        "recipient_id": recipient_id,
        "permissions": permissions,
        "shared_by": "current_user_mock_id" # Mock user sharing the template
    }
    shared_templates.append(new_share)
    _save_shared_templates(shared_templates)
    return {"status": "success", "message": f"Template {template_id} shared with {recipient_id}"}


def get_shared_templates(user_id: str):
    """
    Retrieves a list of templates shared with the specified user.
    """
    shared_templates = _load_shared_templates()
    user_shares = [
        template for template in shared_templates if template["recipient_id"] == user_id
    ]
    return {"user_id": user_id, "shared_with_you": user_shares}

def get_mock_network_effects_data():
    """
    Returns mock data for peer connections and community engagement metrics.
    This would typically be called by the `network-effects.ts` API.
    """
    return {
        "peer_connections": [
            {"user_id": "user_a", "connections": ["user_b", "user_c"]},
            {"user_id": "user_b", "connections": ["user_a", "user_d"]},
        ],
        "community_engagement_metrics": {
            "total_templates_shared": len(_load_shared_templates()),
            "active_sharers": ["user_a", "user_c", "user_e"],
            "most_popular_templates": [
                {"template_id": "template_001", "shares": 15},
                {"template_id": "template_005", "shares": 10},
            ],
            "average_engagement_score": 7.8
        }
    }

if __name__ == "__main__":
    # Example Usage:

    # Clean up file from previous runs for consistent testing
    if os.path.exists(SHARED_TEMPLATES_FILE):
        os.remove(SHARED_TEMPLATES_FILE)
        print(f"Cleaned up {SHARED_TEMPLATES_FILE}")

    print("--- Sharing Templates ---")
    share_template("template_001", "user_alice", ["view", "edit"])
    share_template("template_002", "user_bob", ["view"])
    share_template("template_001", "user_charlie", ["view"])
    share_template("template_003", "user_alice", ["view"])
    print("Templates shared.")

    print("\n--- Getting Shared Templates for Alice ---")
    alice_templates = get_shared_templates("user_alice")
    print(json.dumps(alice_templates, indent=4))

    print("\n--- Getting Shared Templates for Bob ---")
    bob_templates = get_shared_templates("user_bob")
    print(json.dumps(bob_templates, indent=4))
    
    print("\n--- Getting Shared Templates for Dave (who has none) ---")
    dave_templates = get_shared_templates("user_dave")
    print(json.dumps(dave_templates, indent=4))

    print("\n--- Getting Mock Network Effects Data ---")
    network_data = get_mock_network_effects_data()
    print(json.dumps(network_data, indent=4))
