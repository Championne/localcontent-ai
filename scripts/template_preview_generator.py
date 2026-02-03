
import argparse
import yaml
import json
import sys

def generate_preview(template_path, variables):
    """
    Generates a template preview by substituting variables into the template's example_output.

    Args:
        template_path (str): Path to the YAML template file.
        variables (dict): A dictionary of input variables for substitution.

    Returns:
        str: The generated content with variables substituted.
    """
    try:
        with open(template_path, 'r') as f:
            template = yaml.safe_load(f)
    except FileNotFoundError:
        return f"Error: Template file not found at '{template_path}'"
    except yaml.YAMLError as e:
        return f"Error: Invalid YAML in template file: {e}"

    if not isinstance(template, dict) or 'example_output' not in template:
        return "Error: Template must be a dictionary and contain an 'example_output' key."

    output_template = template['example_output']

    try:
        # Use str.format() for simple placeholder replacement
        # It expects placeholders like {key}
        generated_content = output_template.format(**variables)
        return generated_content
    except KeyError as e:
        return f"Error: Missing variable '{e}' required by the template. Provided variables: {list(variables.keys())}"
    except Exception as e:
        return f"An unexpected error occurred during substitution: {e}"

def main():
    parser = argparse.ArgumentParser(
        description="Generate a template preview from a YAML file and input variables."
    )
    parser.add_argument(
        "template_path",
        help="Path to the YAML template file."
    )
    parser.add_argument(
        "--variables",
        type=str,
        default="{}",
        help="A JSON string of input variables (e.g., '{\"name\": \"Alice\", \"age\": 30}')."
    )

    args = parser.parse_args()

    try:
        input_variables = json.loads(args.variables)
        if not isinstance(input_variables, dict):
            raise ValueError("Variables must be a JSON object.")
    except json.JSONDecodeError:
        print("Error: --variables must be a valid JSON string.", file=sys.stderr)
        sys.exit(1)
    except ValueError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

    result = generate_preview(args.template_path, input_variables)
    print(result)

if __name__ == "__main__":
    main()
