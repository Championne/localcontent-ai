
import json
import argparse

def translate_content_mock(content_text: str, source_lang: str, target_langs: list[str]) -> dict:
    """
    Simulates translating content into multiple target languages.

    Args:
        content_text (str): The original content to translate.
        source_lang (str): The source language of the content (e.g., "en").
        target_langs (list[str]): A list of target languages (e.g., ["fr", "de"]).

    Returns:
        dict: A dictionary containing the original content and its translations.
              Format: { "original": "...", "translations": { "lang1": "text1", "lang2": "text2" } }
    """
    translations = {}
    for lang in target_langs:
        # Simulate translation by adding a suffix
        translated_text = f"{content_text}[_translated_to_{lang.upper()}]"
        translations[lang] = translated_text
    
    return {
        "original": content_text,
        "translations": translations
    }

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Mock translation manager.")
    parser.add_argument("--content_text", required=True, help="The original content text to translate.")
    parser.add_argument("--source_lang", required=True, help="The source language of the content (e.g., 'en').")
    parser.add_argument("--target_langs", nargs="+", required=True, help="A space-separated list of target languages (e.g., 'fr de es').")

    args = parser.parse_args()

    result = translate_content_mock(args.content_text, args.source_lang, args.target_langs)
    print(json.dumps(result, indent=2))
