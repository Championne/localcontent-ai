
import json
import os
from collections import Counter

def analyze_review(review_text):
    sentiment = "neutral"
    pain_points = []
    strengths = []

    # Simple keyword-based sentiment analysis
    positive_keywords = ["amazing", "love", "highly recommend", "fantastic", "excellent", "super fast", "five-star", "good", "decent"]
    negative_keywords = ["terrible", "slow", "poor", "disappointed", "worst", "broke", "nightmare", "avoid"]

    positive_count = sum(review_text.lower().count(keyword) for keyword in positive_keywords)
    negative_count = sum(review_text.lower().count(keyword) for keyword in negative_keywords)

    if positive_count > negative_count and positive_count > 0:
        sentiment = "positive"
    elif negative_count > positive_count and negative_count > 0:
        sentiment = "negative"
    elif positive_count == negative_count and positive_count > 0:
        sentiment = "neutral" 


    # Extracting pain points (mock LLM summarization via keyword matching)
    if any(k in review_text.lower() for k in ["slow response", "slow service"]):
        pain_points.append("slow response times")
    if any(k in review_text.lower() for k in ["quality was poor", "bad quality", "low quality"]):
        pain_points.append("poor quality")
    if any(k in review_text.lower() for k in ["broke within a week", "stopped working", "not durable"]):
        pain_points.append("product durability")
    if any(k in review_text.lower() for k in ["refund was a nightmare", "difficult refund", "no refund"]):
        pain_points.append("difficult refund process")
    if any(k in review_text.lower() for k in ["app crashes", "buggy software"]):
        pain_points.append("software stability / bugs")


    # Extracting strengths (mock LLM summarization via keyword matching)
    if any(k in review_text.lower() for k in ["features and ease of use", "easy to use", "great features"]):
        strengths.append("features and ease of use")
    if any(k in review_text.lower() for k in ["customer support was excellent", "great support", "helpful support"]):
        strengths.append("excellent customer support")
    if any(k in review_text.lower() for k in ["delivery was super fast", "fast shipping", "quick delivery"]):
        strengths.append("fast delivery")
    if any(k in review_text.lower() for k in ["gets the job done", "works well", "reliable performance"]):
        strengths.append("adequate performance")
    if any(k in review_text.lower() for k in ["sleek design", "looks great", "modern aesthetic"]):
        strengths.append("attractive design")


    return sentiment, pain_points, strengths

def generate_content_suggestions(all_pain_points_raw, all_strengths_raw):
    suggestions = []

    # Count occurrences to prioritize
    pain_point_counts = Counter(all_pain_points_raw)
    strength_counts = Counter(all_strengths_raw)

    # Translate pain points into content suggestions
    pain_point_mapping = {
        "slow response times": "Highlight quick response times and efficient service.",
        "poor quality": "Emphasize high-quality materials and rigorous testing processes.",
        "product durability": "Showcase product longevity and warranty information.",
        "difficult refund process": "Clearly outline a simple, hassle-free refund policy.",
        "software stability / bugs": "Promote stable software, frequent updates, and bug fixes."
    }

    # Suggestions to Address Pain Points
    for pp, count in pain_point_counts.most_common():
        action_item = pain_point_mapping.get(pp, "Develop content to address this specific concern.")
        suggestions.append({
            "type": "pain_point_addressal",
            "topic": pp,
            "mentions": count,
            "suggestion": action_item
        })

    # Translate strengths into content suggestions
    strength_mapping = {
        "features and ease of use": "Create tutorials, guides, and demos showcasing key features and ease of use.",
        "excellent customer support": "Feature testimonials about outstanding customer support and highlight support channels.",
        "fast delivery": "Advertise guaranteed fast shipping options and delivery timelines.",
        "adequate performance": "Provide clear performance metrics, use cases, and success stories.",
        "attractive design": "Showcase product aesthetics with high-quality imagery and design spotlights."
    }

    # Suggestions to Leverage Strengths
    for s, count in strength_counts.most_common():
        action_item = strength_mapping.get(s, "Create content highlighting this positive aspect.")
        suggestions.append({
            "type": "strength_leverage",
            "topic": s,
            "mentions": count,
            "suggestion": action_item
        })

    return suggestions

def main():
    script_dir = os.path.dirname(__file__)
    mock_data_path = os.path.join(script_dir, '../mock_data/mock_reviews.json')

    if not os.path.exists(mock_data_path):
        print(f"Error: Mock review data not found at {mock_data_path}")
        return

    reviews = []
    try:
        with open(mock_data_path, 'r') as f:
            reviews = json.load(f)
    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from {mock_data_path}. Check file format.")
        return

    sentiments = {"positive": 0, "negative": 0, "neutral": 0}
    all_pain_points = []
    all_strengths = []

    print("Analyzing reviews...\n")
    for review in reviews:
        review_text = review.get("review_text", "")
        if review_text:
            sentiment, pain_points, strengths = analyze_review(review_text)
            sentiments[sentiment] += 1
            all_pain_points.extend(pain_points)
            all_strengths.extend(strengths)
            print(f"Review ID: {review.get('id')}")
            print(f"  Sentiment: {sentiment}")
            print(f"  Pain Points: {', '.join(pain_points) if pain_points else 'None'}")
            print(f"  Strengths: {', '.join(strengths) if strengths else 'None'}\n")

    print("--- Summarized Insights ---\")
    print("\nOverall Sentiment Distribution:")
    for sentiment_type, count in sentiments.items():
        print(f"  {sentiment_type.capitalize()}: {count}")

    print("\nCommon Pain Points:")
    if all_pain_points:
        pain_point_counts = {item: all_pain_points.count(item) for item in set(all_pain_points)}
        sorted_pain_points = sorted(pain_point_counts.items(), key=lambda item: item[1], reverse=True)
        for pp, count in sorted_pain_points:
            print(f"  - {pp} ({count} mentions)")
    else:
        print("  No specific pain points identified.")

    print("\nCommon Strengths:")
    if all_strengths:
        strength_counts = {item: all_strengths.count(item) for item in set(all_strengths)}
        sorted_strengths = sorted(strength_counts.items(), key=lambda item: item[1], reverse=True)
        for s, count in sorted_strengths:
            print(f"  - {s} ({count} mentions)")
    else:
        print("  No specific strengths identified.")

    print("\n--- Actionable Content Suggestions (JSON Output) ---")
    if all_pain_points or all_strengths:
        content_suggestions = generate_content_suggestions(all_pain_points, all_strengths)
        print(json.dumps(content_suggestions, indent=2))
    else:
        print("  No specific pain points or strengths to generate suggestions from.")


if __name__ == "__main__":
    main()
