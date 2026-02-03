import json

def collect_competitor_data(file_path):
    """
    Simulates collecting competitor data from a mock JSON file and parses it.
    """
    try:
        with open(file_path, 'r') as f:
            data = json.load(f)
        return data
    except FileNotFoundError:
        print(f"Error: Mock data file not found at {file_path}")
        return []
    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from {file_path}")
        return []

def extract_competitive_insights(competitor_data):
    """
    Extracts relevant competitive insights from the collected data.
    """
    insights = []
    for competitor in competitor_data:
        name = competitor.get('competitor_name', 'N/A')
        keywords = competitor.get('keywords', [])
        content_types = competitor.get('content_types', [])
        social_metrics = competitor.get('social_media_metrics', {})
        traffic_estimate = competitor.get('traffic_estimate', 0)
        backlinks = competitor.get('backlinks', 0)

        insights.append({
            'competitor_name': name,
            'top_keywords': keywords[:3],  # Take top 3 keywords
            'main_content_types': content_types,
            'total_social_followers': sum(social_metrics.values()),
            'estimated_monthly_traffic': traffic_estimate,
            'total_backlinks': backlinks
        })
    return insights

if __name__ == "__main__":
    mock_data_file = 'localcontent_ai/mock_data/mock_competitor_data.json'
    
    print(f"Collecting data from: {mock_data_file}")
    competitor_raw_data = collect_competitor_data(mock_data_file)

    if competitor_raw_data:
        print("\nExtracting competitive insights...")
        competitive_insights = extract_competitive_insights(competitor_raw_data)

        for insight in competitive_insights:
            print("\n--- Competitor Insight ---")
            for key, value in insight.items():
                print(f"{key.replace('_', ' ').title()}: {value}")
    else:
        print("No competitor data to process.")
