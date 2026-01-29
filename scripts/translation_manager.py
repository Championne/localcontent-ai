import json

def translate_content(content_text: str, source_lang: str, target_langs: list[str]) -> dict:
    """
    Simulates translating content into specified target languages.

    Args:
        content_text: The original content to translate.
        source_lang: The source language of the content (e.g., "en").
        target_langs: A list of target languages (e.g., ["fr", "es"]).

    Returns:
        A dictionary with the original content and its translations in JSON format.
        Example: {
            "original": "Hello World",
            "translations": {
                "fr": "Hello World[_translated_to_fr]",
                "es": "Hello World[_translated_to_es]"
            }
        }
    """
    translations = {}
    # Ensure source_lang is used, though not directly in mock translation,
    # it's part of the expected input arguments.
    _ = source_lang 

    for lang in target_langs:
        # Simulate translation by adding a suffix
        translated_text = f"{content_text}[_translated_to_{lang.lower()}]"
        translations[lang] = translated_text

    result = {
        "original": content_text,
        "translations": translations
    }
    return result

if __name__ == "__main__":
    # Example usage when run as a script
    # In a real scenario, these would be passed from a calling function/script or CLI.
    sample_content = "This is a test sentence."
    sample_source_lang = "en"
    sample_target_langs = ["fr", "es", "de"]

    translated_output = translate_content(sample_content, sample_source_lang, sample_target_langs)
    print(json.dumps(translated_output, indent=2))

    sample_content_2 = "Another piece of content."
    sample_source_lang_2 = "en"
    sample_target_langs_2 = ["ja"]
    translated_output_2 = translate_content(sample_content_2, sample_source_lang_2, sample_target_langs_2)
    print(json.dumps(translated_output_2, indent=2))
