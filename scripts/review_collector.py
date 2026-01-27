import json
import os

def collect_and_parse_reviews(mock_data_path):
    """
    Simulates collecting reviews from a dummy source (mock JSON file)
    and parses them to extract basic information.
    """
    reviews_data = []
    
    # Check if the mock data file exists
    if not os.path.exists(mock_data_path):
        print(f"Error: Mock data file not found at {mock_data_path}")
        return []

    try:
        with open(mock_data_path, 'r', encoding='utf-8') as f:
            mock_reviews = json.load(f)
    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from {mock_data_path}")
        return []
    except Exception as e:
        print(f"An unexpected error occurred while reading {mock_data_path}: {e}")
        return []

    for review in mock_reviews:
        parsed_review = {
            "text": review.get("review_text"),
            "rating": review.get("rating"),
            "date": review.get("review_date")
        }
        reviews_data.append(parsed_review)
    
    return reviews_data

if __name__ == "__main__":
    current_dir = os.path.dirname(__file__)
    mock_data_file = os.path.join(current_dir, "..", "mock_data", "mock_reviews.json")
    
    print(f"Attempting to collect reviews from: {os.path.abspath(mock_data_file)}")
    collected_reviews = collect_and_parse_reviews(mock_data_file)
    
    if collected_reviews:
        print("\n--- Collected and Parsed Reviews ---")
        for idx, review in enumerate(collected_reviews):
            print(f"Review {idx + 1}:")
            print(f"  Text: {review['text']}")
            print(f"  Rating: {review['rating']}")
            print(f"  Date: {review['date']}")
            print("-" * 20)
    else:
        print("No reviews were collected.")
