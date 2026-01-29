
import sqlite3
import json
from datetime import datetime

# Assuming a basic database connection setup. In a real application, this would use an ORM or a more robust DB connection pool.
DATABASE_PATH = './localcontent.db' # Using the existing localcontent.db as a placeholder

class ContentWorkflowManager:
    def __init__(self, db_path=DATABASE_PATH):
        self.db_path = db_path
        self._initialize_database()

    def _get_db_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row # This allows us to access columns by name
        return conn

    def _initialize_database(self):
        """Ensures the necessary tables exist based on content_approval_workflow.sql."""
        conn = self._get_db_connection()
        cursor = conn.cursor()
        try:
            with open('localcontent_ai/schema/content_approval_workflow.sql', 'r') as f:
                schema_sql = f.read()
                cursor.executescript(schema_sql)
            conn.commit()
            print("Content approval workflow schema initialized successfully.")
        except Exception as e:
            print(f"Error initializing schema (perhaps tables already exist or path is wrong): {e}")
            conn.rollback()
        finally:
            conn.close()

    def create_brand(self, name):
        conn = self._get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("INSERT INTO brands (name) VALUES (?)", (name,))
            conn.commit()
            return cursor.lastrowid
        except sqlite3.IntegrityError:
            print(f"Brand '{name}' already exists.")
            return None
        finally:
            conn.close()

    def create_location(self, brand_id, name, address=None, city=None, state=None, zip_code=None, country=None):
        conn = self._get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute(
                "INSERT INTO locations (brand_id, name, address, city, state, zip_code, country) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (brand_id, name, address, city, state, zip_code, country)
            )
            conn.commit()
            return cursor.lastrowid
        except sqlite3.IntegrityError:
            print(f"Location '{name}' for brand ID {brand_id} already exists.")
            return None
        finally:
            conn.close()

    def add_approver_role(self, user_id, brand_id=None, location_id=None, role_name='local_owner'):
        conn = self._get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute(
                "INSERT INTO approver_roles (user_id, brand_id, location_id, role_name) VALUES (?, ?, ?, ?)",
                (user_id, brand_id, location_id, role_name)
            )
            conn.commit()
            return cursor.lastrowid
        except sqlite3.IntegrityError:
            print(f"Role '{role_name}' already exists for user {user_id} on brand {brand_id}, location {location_id}.")
            return None
        finally:
            conn.close()

    def submit_content_for_approval(self, brand_id, content_type, content_data, generated_by_user_id, location_id=None):
        """
        Submits localized content for approval.
        Creates a localized_content entry and initiates an approval request.
        """
        conn = self._get_db_connection()
        cursor = conn.cursor()
        try:
            # 1. Create localized_content entry
            cursor.execute(
                "INSERT INTO localized_content (brand_id, location_id, content_type, content_data, generated_by_user_id, approval_status) VALUES (?, ?, ?, ?, ?, ?)",
                (brand_id, location_id, content_type, json.dumps(content_data), generated_by_user_id, 'pending')
            )
            localized_content_id = cursor.lastrowid

            # 2. Determine approver(s) and create approval request(s)
            # This logic needs to be enhanced for a real system (e.g., multiple approvers, specific rules)
            approvers = self._get_potential_approvers(brand_id, location_id)
            if not approvers:
                print(f"No approvers found for brand {brand_id}, location {location_id}. Content submitted but no approval request created.")
                conn.rollback() # Or allow to proceed as unassigned
                return None

            request_ids = []
            for approver_user_id in approvers:
                cursor.execute(
                    "INSERT INTO content_approval_requests (localized_content_id, approver_user_id, status) VALUES (?, ?, ?)",
                    (localized_content_id, approver_user_id, 'pending')
                )
                request_ids.append(cursor.lastrowid)
                # In a real system, trigger notification here: self._notify_approver(approver_user_id, localized_content_id)

            conn.commit()
            return localized_content_id, request_ids
        except Exception as e:
            print(f"Error submitting content for approval: {e}")
            conn.rollback()
            return None
        finally:
            conn.close()

    def _get_potential_approvers(self, brand_id, location_id):
        """
        Internal method to find potential approvers based on brand and location.
        This is a simplified example; real logic would be more complex.
        """
        conn = self._get_db_connection()
        cursor = conn.cursor()
        approver_ids = []

        # First, check for location-specific approvers
        if location_id:
            cursor.execute(
                "SELECT user_id FROM approver_roles WHERE brand_id = ? AND location_id = ?",
                (brand_id, location_id)
            )
            approver_ids.extend([row['user_id'] for row in cursor.fetchall()])

        # If no location-specific approvers, or if content is brand-wide, check for brand-level approvers
        if not approver_ids: # For a real system you might want both location and brand approvers.
             cursor.execute(
                "SELECT user_id FROM approver_roles WHERE brand_id = ? AND location_id IS NULL",
                (brand_id,)
            )
             approver_ids.extend([row['user_id'] for row in cursor.fetchall()])

        conn.close()
        return list(set(approver_ids)) # Return unique approver IDs

    def get_pending_approvals(self, approver_user_id):
        """Retrieves content awaiting approval for a specific approver."""
        conn = self._get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT
                car.id AS request_id,
                lc.id AS content_id,
                lc.content_type,
                lc.content_data,
                lc.created_at,
                b.name AS brand_name,
                l.name AS location_name
            FROM content_approval_requests car
            JOIN localized_content lc ON car.localized_content_id = lc.id
            JOIN brands b ON lc.brand_id = b.id
            LEFT JOIN locations l ON lc.location_id = l.id
            WHERE car.approver_user_id = ? AND car.status = 'pending'
            """,
            (approver_user_id,)
        )
        # Convert Row objects to dicts for easier handling
        return [dict(row) for row in cursor.fetchall()]
        conn.close()

    def update_approval_status(self, request_id, approver_user_id, new_status, feedback=None):
        """
        Updates the status of an approval request and the associated localized content.
        Valid new_status values: 'approved', 'rejected', 'revision_requested'.
        """
        conn = self._get_db_connection()
        cursor = conn.cursor()
        try:
            # 1. Update the content_approval_request
            cursor.execute(
                "UPDATE content_approval_requests SET status = ?, feedback = ?, approval_date = ? WHERE id = ? AND approver_user_id = ?",
                (new_status, feedback, datetime.now(), request_id, approver_user_id)
            )
            if cursor.rowcount == 0:
                print(f"Approval request {request_id} not found or user {approver_user_id} is not the designated approver.")
                conn.rollback()
                return False

            # 2. Get the localized_content_id from the request
            cursor.execute("SELECT localized_content_id FROM content_approval_requests WHERE id = ?", (request_id,))
            content_row = cursor.fetchone()
            if not content_row:
                conn.rollback()
                return False
            localized_content_id = content_row['localized_content_id']

            # 3. Update the localized_content entry's approval_status
            cursor.execute(
                "UPDATE localized_content SET approval_status = ?, updated_at = ? WHERE id = ?",
                (new_status, datetime.now(), localized_content_id)
            )
            conn.commit()
            return True
        except Exception as e:
            print(f"Error updating approval status: {e}")
            conn.rollback()
            return False
        finally:
            conn.close()

    def publish_content(self, localized_content_id):
        """Marks content as published if it's approved."""
        conn = self._get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute(
                "UPDATE localized_content SET approval_status = 'published', published_at = ? WHERE id = ? AND approval_status = 'approved'",
                (datetime.now(), localized_content_id)
            )
            if cursor.rowcount == 0:
                print(f"Content {localized_content_id} could not be published. It might not be approved or already published.")
                conn.rollback()
                return False
            conn.commit()
            return True
        except Exception as e:
            print(f"Error publishing content: {e}")
            conn.rollback()
            return False
        finally:
            conn.close()

    # Placeholder for notification function
    def _notify_approver(self, approver_user_id, localized_content_id):
        """
        In a real application, this would trigger an email, in-app notification, or webhook.
        """
        print(f"NOTIFICATION: Approver user {approver_user_id} needs to review content {localized_content_id}.")
        # Use an external messaging tool here if available, e.g., default_api.message.send(...) if integrated
