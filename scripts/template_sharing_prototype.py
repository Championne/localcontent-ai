
import json
import os

DATA_FILE = "localcontent_ai/scripts/shared_templates.json"

def _read_data():
    """Reads the mock data from the JSON file."""
    if not os.path.exists(DATA_FILE):
        return {
            "shared_templates": [],
            "peer_connections": [
                {"user_id": "user_alice", "connections": ["user_bob", "user_charlie"]},
                {"user_id": "user_bob", "connections": ["user_alice", "user_david"]},
                {"user_id": "user_charlie", "connections": ["user_alice"]},
                {"user_id": "user_david", "connections": ["user_bob"]}
            ],
            "community_engagement_metrics": {
                "total_shares": 0,
                "active_users": 10,
                "new_templates_this_week": 0
            }
        }
    with open(DATA_FILE, 'r') as f:
        return json.load(f)

def _write_data(data):
    """Writes the mock data to the JSON file."""
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=4)

def share_template(template_id: str, recipient: str, permissions: str, shared_by: str):
    """
    Simulates sharing a template with a recipient.
    Updates the mock data structure and engagement metrics.
    """
    data = _read_data()
    
    new_share = {
        "template_id": template_id,
        "recipient": recipient,
        "permissions": permissions,
        "shared_by": shared_by,
        "timestamp": os.path.getmtime(DATA_FILE) # Mock timestamp
    }
    data["shared_templates"].append(new_share)
    data["community_engagement_metrics"]["total_shares"] += 1

    _write_data(data)
    return {"status": "success", "message": f"Template {template_id} shared with {recipient}"}

def get_shared_templates(user_id: str):
    """
    Retrieves templates shared with a specific user.
    """
    data = _read_data()
    shared_with_user = [
        template for template in data["shared_templates"] 
        if template["recipient"] == user_id
    ]
    return {"user_id": user_id, "shared_templates": shared_with_user}

def get_peer_connections(user_id: str):
    """
    Retrieves mock peer connections for a given user.
    """
    data = _read_data()
    for user_conn in data["peer_connections"]:
        if user_conn["user_id"] == user_id:
            return {"user_id": user_id, "connections": user_conn["connections"]}
    return {"user_id": user_id, "connections": []}

def get_community_engagement_metrics():
    """
    Retrieves mock community engagement metrics.
    """
    data = _read_data()
    return data["community_engagement_metrics"]

if __name__ == "__main__":
    # Initialize data file if it doesn't exist
    if not os.path.exists(DATA_FILE):
        _write_data(_read_data()) # This will write the initial structure

    print("--- Initial State ---")
    print("All Data:", _read_data())
    print("\n")

    # Example Usage: Share templates
    print("--- Sharing Templates ---")
    print(share_template("template_001", "user_alice", "view", "user_bob"))
    print(share_template("template_002", "user_bob", "edit", "user_charlie"))
    print(share_template("template_003", "user_alice", "comment", "user_david"))
    print("\n")

    # Example Usage: Get shared templates for a user
    print("--- Templates shared with user_alice ---")
    print(get_shared_templates("user_alice"))
    print("\n")

    print("--- Templates shared with user_bob ---")
    print(get_shared_templates("user_bob"))
    print("\n")

    # Example Usage: Get peer connections
    print("--- Peer Connections for user_alice ---")
    print(get_peer_connections("user_alice"))
    print("\n")

    print("--- Peer Connections for user_charlie ---")
    print(get_peer_connections("user_charlie"))
    print("\n")

    # Example Usage: Get community engagement metrics
    print("--- Community Engagement Metrics ---")
    print(get_community_engagement_metrics())
    print("\n")

    print("--- Final State (after sharing) ---")
    print("All Data:", _read_data())
    print("\n")
