import json
import random

def load_competitor_data(filepath):
    """Loads mock competitor data from a JSON file."""
    with open(filepath, 'r') as f:
        data = json.load(f)
    return data

def analyze_content_gaps(our_company_data, competitors_data):
    """
    Identifies conceptual content gaps by comparing content types across competitors.
    """
    our_content_types = set(our_company_data['content_types'])
    all_competitor_content_types = set()
    for competitor in competitors_data:
        all_competitor_content_types.update(competitor['content_types'])

    missing_content_types = all_competitor_content_types - our_content_types
    return list(missing_content_types)

def analyze_keyword_opportunities(our_company_data, competitors_data):
    """
    Identifies keyword opportunities by comparing keyword lists.
    """
    our_keywords = set(our_company_data['keywords'])
    all_competitor_keywords = set()
    for competitor in competitors_data:
        all_competitor_keywords.update(competitor['keywords'])

    new_keyword_opportunities = all_competitor_keywords - our_keywords
    return list(new_keyword_opportunities)

def generate_recommendations_json(content_gaps, keyword_opportunities):
    """
    Generates a list of recommendations matching the CompetitorAnalysis interface.
    """
    recommendations_list = []
    rec_id_counter = 1

    priorities = ['High', 'Medium', 'Low']

    if content_gaps:
        for gap in content_gaps:
            content_formats = ["blog posts", "video tutorials", "infographics", "webinars", "e-books"]
            chosen_format = random.choice(content_formats)
            num_pieces = random.randint(2, 5)
            recommended_action = f"Develop {num_pieces} {chosen_format} on '{gap}'"
            description = f"Directly address the content gap in '{gap}', as identified by competitor analysis. Focus on providing unique value and a fresh perspective to differentiate from existing competitor content."

            recommendations_list.append({
                "id": f"REC-{rec_id_counter}",
                "competitorName": "Various Competitors",
                "recommendedAction": recommended_action,
                "description": description,
                "priority": random.choice(priorities),
                "keywords": [gap.replace(" ", "-").lower()], # Mock keyword
                "opportunityScore": random.randint(70, 95)
            })
            rec_id_counter += 1

    if keyword_opportunities:
        for keyword in keyword_opportunities:
            content_formats = ["blog post", "in-depth guide", "video tutorial", "infographic"]
            angles = ["beginner's guide", "advanced techniques", "real-world case studies", "cost-benefit analysis", "future trends"]

            chosen_format = random.choice(content_formats)
            chosen_angle = random.choice(angles)
            num_pieces = random.randint(2, 4)
            recommended_action = f"Develop {num_pieces} {chosen_format}(s) targeting the keyword '{keyword}' "
            description = f"Focus on an angle of '{chosen_angle}' to differentiate from competitors, specifically aiming to provide more depth than their current content for '{keyword}'."

            recommendations_list.append({
                "id": f"REC-{rec_id_counter}",
                "competitorName": "Specific Competitors",
                "recommendedAction": recommended_action,
                "description": description,
                "priority": random.choice(priorities),
                "keywords": [keyword],
                "opportunityScore": random.randint(75, 98)
            })
            rec_id_counter += 1

    if not content_gaps and not keyword_opportunities:
        # Default recommendation if no specific gaps/keywords found
        recommendations_list.append({
            "id": f"REC-{rec_id_counter}",
            "competitorName": "Market",
            "recommendedAction": "Continue regular competitive monitoring",
            "description": "No significant content gaps or new keyword opportunities identified at this time. Maintain vigilance.",
            "priority": "Low",
            "keywords": ["competitive-analysis", "market-trends"],
            "opportunityScore": random.randint(60, 70)
        })

    return {"recommendations": recommendations_list}

if __name__ == "__main__":
    mock_data_filepath = './localcontent_ai/mock_data/mock_competitor_data.json'

    try:
        data = load_competitor_data(mock_data_filepath)
    except FileNotFoundError:
        print(json.dumps({"recommendations": [], "error": "Mock data file not found."}), file=sys.stderr)
        sys.exit(1)
    except json.JSONDecodeError:
        print(json.dumps({"recommendations": [], "error": "Failed to parse mock data file."}), file=sys.stderr)
        sys.exit(1)

    our_company_data = None
    competitors_data = []

    for entity in data['competitors']:
        if entity['name'] == 'Our Company':
            our_company_data = entity
        else:
            competitors_data.append(entity)

    if not our_company_data:
        print(json.dumps({"recommendations": [], "error": "'Our Company' data not found in mock data."}), file=sys.stderr)
        sys.exit(1)
    else:
        content_gaps = analyze_content_gaps(our_company_data, competitors_data)
        keyword_opportunities = analyze_keyword_opportunities(our_company_data, competitors_data)

        response_data = generate_recommendations_json(content_gaps, keyword_opportunities)
        print(json.dumps(response_data))
