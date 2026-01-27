
import os
import yaml
import datetime
import re
import shutil

def to_snake_case(text):
    """Converts a string to snake_case."""
    # Replace spaces and hyphens with underscores
    text = re.sub(r'[s-]+', '_', text)
    # Convert to lowercase
    text = text.lower()
    # Remove any non-alphanumeric characters except underscores
    text = re.sub(r'[^a-z0-9_]', '', text)
    # Remove leading/trailing underscores
    text = text.strip('_')
    # Replace multiple underscores with a single one
    text = re.sub(r'_+', '_', text)
    return text

def ask_confirmation(prompt):
    """Prompts the user for yes/no confirmation."""
    while True:
        response = input(f"{prompt} (y/n): ").lower()
        if response in ['y', 'yes']:
            return True
        elif response in ['n', 'no']:
            return False
        else:
            print("Invalid input. Please enter 'y' or 'n'.")

def consolidate_templates(base_dir="prompts"):
    """
    Consolidates templates by enforcing folder structure, renaming files,
    and updating timestamps based on metadata.
    """
    for root, _, files in os.walk(base_dir):
        for file in files:
            if file.endswith((".yaml", ".yml")):
                original_filepath = os.path.join(root, file)
                print(f"\nProcessing {original_filepath}...")

                with open(original_filepath, 'r') as f:
                    try:
                        data = yaml.safe_load(f)
                    except yaml.YAMLError as e:
                        print(f"Error reading YAML from {original_filepath}: {e}")
                        continue

                if not data or not isinstance(data, dict):
                    print(f"Skipping {original_filepath}: Not a valid YAML dictionary or empty.")
                    continue

                # Ensure metadata block exists
                if "metadata" not in data:
                    data["metadata"] = {}
                    print(f"Added empty 'metadata' block to {original_filepath}")

                metadata = data["metadata"]
                
                # Add/Update created_at and updated_at timestamps
                now_utc = datetime.datetime.now(datetime.timezone.utc)
                if "created_at" not in metadata:
                    metadata["created_at"] = now_utc.isoformat()
                    print(f"Added 'created_at' timestamp to {original_filepath}")
                else:
                    print(f"'created_at' already exists for {original_filepath}")
                
                metadata["updated_at"] = now_utc.isoformat()
                print(f"Updated 'updated_at' timestamp for {original_filepath}")

                # Determine new folder structure and filename
                category = metadata.get("category")
                sub_category = metadata.get("sub_category")
                template_name = metadata.get("name")

                if not category:
                    print(f"Warning: 'category' missing in metadata for {original_filepath}. Skipping folder restructure/rename.")
                    # Still write back updated metadata
                    with open(original_filepath, 'w') as f:
                        yaml.dump(data, f, sort_keys=False)
                    continue
                
                if not template_name:
                    print(f"Warning: 'name' missing in metadata for {original_filepath}. Skipping rename.")
                    # Still write back updated metadata
                    with open(original_filepath, 'w') as f:
                        yaml.dump(data, f, sort_keys=False)
                    continue

                # Construct new directory path
                new_dir_parts = [base_dir, category]
                if sub_category:
                    new_dir_parts.append(sub_category)
                new_template_dir = os.path.join(*new_dir_parts)

                # Construct new filename
                new_filename_snake_case = to_snake_case(template_name) + os.path.splitext(file)[1]
                new_filepath = os.path.join(new_template_dir, new_filename_snake_case)

                # Check if move/rename is needed
                if original_filepath != new_filepath:
                    if ask_confirmation(f"Move/rename '{original_filepath}' to '{new_filepath}'?"):
                        # Create target directory if it doesn't exist
                        os.makedirs(new_template_dir, exist_ok=True)
                        
                        # Move the file
                        shutil.move(original_filepath, new_filepath)
                        print(f"Successfully moved/renamed '{original_filepath}' to '{new_filepath}'")
                    else:
                        print(f"Skipping move/rename for {original_filepath}")
                        new_filepath = original_filepath # Keep current path for metadata write
                else:
                    print(f"No move/rename needed for {original_filepath}")

                # Write back the (potentially updated) YAML content with timestamps
                with open(new_filepath, 'w') as f:
                    yaml.dump(data, f, sort_keys=False)
                    print(f"Updated metadata in {new_filepath}")

if __name__ == "__main__":
    consolidate_templates()
