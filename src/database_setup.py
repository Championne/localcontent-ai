
import sqlite3

DATABASE_FILE = 'metrics.db'
SCHEMA_FILE = 'schema.sql'

def setup_database():
    try:
        conn = sqlite3.connect(DATABASE_FILE)
        cursor = conn.cursor()

        with open(SCHEMA_FILE, 'r') as f:
            schema_script = f.read()

        # SQLite doesn't support SERIAL or JSONB directly.
        # SERIAL becomes INTEGER PRIMARY KEY AUTOINCREMENT.
        # JSONB becomes TEXT (and we'll store JSON strings).
        # Also, PostgreSQL-specific data types like DECIMAL(18, 4) should be REAL or TEXT.
        # We should also adapt 'CURRENT_TIMESTAMP' for SQLite if there are no specific functions.

        # Simple replacement for compatibility. For a more robust solution, use a proper ORM or conditional DDL.
        schema_script = schema_script.replace('SERIAL PRIMARY KEY', 'INTEGER PRIMARY KEY AUTOINCREMENT')
        schema_script = schema_script.replace('JSONB', 'TEXT')
        schema_script = schema_script.replace('DECIMAL(18, 4)', 'REAL')
        schema_script = schema_script.replace('CURRENT_TIMESTAMP', 'CURRENT_TIMESTAMP')
        schema_script = schema_script.replace('-- Placeholder for a users table, assuming users exist in the system', '')
        schema_script = schema_script.replace('-- Table for storing user integrations (e.g., connections to Google Analytics, Salesforce)', '')
        schema_script = schema_script.replace('-- Table for storing baseline snapshots of key metrics', '')
        schema_script = schema_script.replace('-- Table for storing historical metric data points', '')
        schema_script = schema_script.replace('-- Indexes for performance', '')


        # Execute each statement separately
        statements = [s.strip() for s in schema_script.split(';') if s.strip()]

        for statement in statements:
            print(f"Executing: {statement[:70]}...") # Print a snippet of the statement
            cursor.execute(statement)

        conn.commit()
        print(f"Database '{DATABASE_FILE}' and tables created/updated successfully.")

    except sqlite3.Error as e:
        print(f"SQLite error during database setup: {e}")
    except Exception as e:
        print(f"An unexpected error occurred during database setup: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    # Before running this, ensure schema.sql is in the same directory
    setup_database()
