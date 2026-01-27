
import argparse
import yaml
import json
from jsonschema import validate, ValidationError
import sys
import os

def validate_template(yaml_file_path, schema_file_path):
    """
    Validates a YAML template file against a JSON schema.
    Returns a tuple: (success: bool, error_details: dict or None)
    """
    error_details = {}
    try:
        with open(yaml_file_path, 'r') as f:
            yaml_data = yaml.safe_load(f)

        with open(schema_file_path, 'r') as f:
            schema_data = json.load(f)

        validate(instance=yaml_data, schema=schema_data)
        return True, None

    except FileNotFoundError as e:
        error_details = {"type": "FileNotFound", "message": str(e)}
        return False, error_details
    except yaml.YAMLError as e:
        error_details = {"type": "YAMLError", "message": str(e)}
        return False, error_details
    except json.JSONDecodeError as e:
        error_details = {"type": "JSONSchemaError", "message": str(e)}
        return False, error_details
    except ValidationError as e:
        error_details = {
            "type": "ValidationError",
            "message": e.message,
            "path": list(e.path),
            "validator": e.validator,
            "validator_value": e.validator_value,
            "schema_path": list(e.schema_path) # Added for more detail
        }
        return False, error_details
    except Exception as e:
        error_details = {"type": "UnexpectedError", "message": str(e)}
        return False, error_details

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Validate LocalContent.ai YAML prompt templates against a JSON schema.")
    parser.add_argument("yaml_template_file", nargs='?', help="Path to a single YAML template file to validate. Omit to validate prompts/ directory recursively with --recursive.")
    parser.add_argument("--schema", default="prompts/schema/prompt_template_schema.json",
                        help="Path to the JSON schema file. Defaults to prompts/schema/prompt_template_schema.json.")
    parser.add_argument("--recursive", action="store_true",
                        help="Validate all YAML files recursively in the 'prompts/' directory.")

    args = parser.parse_args()

    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, os.pardir, os.pardir))
    default_schema_path = os.path.join(project_root, "localcontent_ai", args.schema) # Adjusted path to be correct relative to project root
    
    schema_to_use = args.schema if not args.schema.startswith("prompts/") else default_schema_path # Use custom schema directly if it's not the default prefix

    files_to_validate = []
    if args.recursive:
        prompts_dir = os.path.join(project_root, "localcontent_ai", "prompts")
        if not os.path.isdir(prompts_dir):
            print(f"Error: 'prompts/' directory not found at {prompts_dir}", file=sys.stderr)
            sys.exit(1)
        for root, _, files in os.walk(prompts_dir):
            for file in files:
                if file.endswith((".yaml", ".yml")):
                    files_to_validate.append(os.path.join(root, file))
        if not files_to_validate:
            print(f"No YAML files found in '{prompts_dir}' for recursive validation.")
            sys.exit(0)
    elif args.yaml_template_file:
        files_to_validate.append(args.yaml_template_file)
    else:
        parser.print_help()
        sys.exit(1)

    successful_validations = 0
    failed_validations = 0
    errors_found = []

    for file_path in files_to_validate:
        print(f"Validating {file_path}...")
        is_valid, error_info = validate_template(file_path, schema_to_use)
        if is_valid:
            print(f"  Validation successful for {file_path}.")
            successful_validations += 1
        else:
            failed_validations += 1
            print(f"  Validation FAILED for {file_path}:", file=sys.stderr)
            if error_info:
                print(f"    Error Type: {error_info.get('type')}", file=sys.stderr)
                print(f"    Message: {error_info.get('message')}", file=sys.stderr)
                if error_info.get('path'):
                    print(f"    Path in document: {' -> '.join(map(str, error_info['path']))}", file=sys.stderr)
                if error_info.get('validator') and error_info.get('validator_value'):
                    print(f"    Validator: {error_info['validator']} (Expected: {error_info['validator_value']})", file=sys.stderr)
                if error_info.get('schema_path'):
                    print(f"    Path in schema: {' -> '.join(map(str, error_info['schema_path']))}", file=sys.stderr)
            
            errors_found.append({"file": file_path, "error": error_info})
    
    print("\n--- Validation Summary ---")
    print(f"Total files validated: {len(files_to_validate)}")
    print(f"Successful validations: {successful_validations}")
    print(f"Failed validations: {failed_validations}")

    if failed_validations > 0:
        print("Details of failed validations:")
        for error_entry in errors_found:
            print(f"  File: {error_entry['file']}")
            error_info = error_entry['error']
            if error_info:
                print(f"    Error Type: {error_info.get('type')}")
                print(f"    Message: {error_info.get('message')}")
                if error_info.get('path'):
                    print(f"    Path in document: {' -> '.join(map(str, error_info['path']))}")
                if error_info.get('validator') and error_info.get('validator_value'):
                    print(f"    Validator: {error_info['validator']} (Expected: {error_info['validator_value']})")
                if error_info.get('schema_path'):
                    print(f"    Path in schema: {' -> '.join(map(str, error_info['schema_path']))}")
            print("-" * 20)
        sys.exit(1)
    else:
        print("All specified YAML templates validated successfully!")
