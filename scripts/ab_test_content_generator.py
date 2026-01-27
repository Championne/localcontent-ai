import yaml
import random

def generate_content_for_ab_test(
    template_path: str,
    user_inputs: dict,
    keyword_density_percentage: float,
    keywords_to_inject: list[str],
) -> str:
    """
    Generates content from a YAML template, attempting to inject keywords
    at a specified density for A/B testing purposes.
    """
    with open(template_path, 'r') as file:
        template_data = yaml.safe_load(file)

    guidelines = template_data['structure']['guidelines']
    example_prompt = template_data['structure']['example_prompt']
    example_output = template_data['structure']['example_output'] # This would be replaced by AI generation

    # For this prototype, we'll simulate content generation by modifying the example_output.
    # In a real scenario, this would involve calling a language model with `guidelines` and `user_inputs`.
    generated_text = example_output
    
    # Simple keyword injection simulation
    target_word_count = len(generated_text.split())
    target_keyword_count = int(target_word_count * (keyword_density_percentage / 100))
    
    injected_count = 0
    words = generated_text.split()
    random.shuffle(keywords_to_inject) # Shuffle to pick different keywords

    for i in range(len(words)):
        if injected_count < target_keyword_count and random.random() < (keyword_density_percentage / 100):
            if keywords_to_inject: # Ensure there are keywords to inject
                keyword = random.choice(keywords_to_inject)
                # Avoid injecting the same keyword multiple times in very close proximity
                if keyword.lower() not in words[i].lower():
                    words.insert(i, keyword) # Insert keyword before the word
                    injected_count += 1
    
    simulated_content = " ".join(words)

    # Further step: call an actual AI model (e.g., Anthropic Claude, OpenAI GPT) to refine content
    # and ensure natural embedding of keywords based on guidelines.
    # For this script, we're just demonstrating the concept of varying density.

    return simulated_content

if __name__ == "__main__":
    # Example usage for Landscapers template (needs to exist)
    landscapers_template_path = 'prompts/service_descriptions/landscapers.yaml'
    user_inputs_landscapers = {
        "company_name": "GroenMeesters",
        "target_city": "Utrecht",
        "unique_selling_proposition": "unieke tuininrichting",
        "call_to_action": "Vraag offerte aan"
    }
    keywords_landscapers = ["tuinaanleg", "tuinonderhoud", "tuinontwerp"]

    print("\n--- Variant A: Low Keyword Density (1%) ---")
    content_variant_a = generate_content_for_ab_test(
        landscapers_template_path, 
        user_inputs_landscapers, 
        1, 
        keywords_landscapers
    )
    print(content_variant_a)

    print("\n--- Variant B: Higher Keyword Density (3%) ---")
    content_variant_b = generate_content_for_ab_test(
        landscapers_template_path, 
        user_inputs_landscapers, 
        3, 
        keywords_landscapers
    )
    print(content_variant_b)
