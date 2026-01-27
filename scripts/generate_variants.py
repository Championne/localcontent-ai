import json
import os
from pathlib import Path
from localcontent_ai.ab_test_content_generator import generate_content

VARIANTS_FILE = Path("localcontent_ai/variants.json")
OUTPUT_BASE_DIR = Path("localcontent_ai/ab_tests")

def generate_all_variants():
    print(f"Loading variants from {VARIANTS_FILE}")
    with open(VARIANTS_FILE, 'r') as f:
        variants_config = json.load(f)

    for test_name, test_variants in variants_config.items():
        print(f"\n--- Processing Test: {test_name} ---")
        for variant_id, parameters in test_variants.items():
            output_dir = OUTPUT_BASE_DIR / test_name / variant_id
            output_dir.mkdir(parents=True, exist_ok=True)

            print(f"Generating content for variant '{variant_id}' - parameters handled internally.")
            generated_content = generate_content(parameters)

            content_file = output_dir / "content.txt"
            with open(content_file, 'w') as f:
                f.write(generated_content)
            print(f"Saved content to {content_file}")

            metadata_file = output_dir / "metadata.json"
            metadata = {
                "test_name": test_name,
                "variant_id": variant_id,
                "parameters": parameters
            }
            with open(metadata_file, 'w') as f:
                json.dump(metadata, f, indent=2)
            print(f"Saved metadata to {metadata_file}")

if __name__ == "__main__":
    generate_all_variants()
