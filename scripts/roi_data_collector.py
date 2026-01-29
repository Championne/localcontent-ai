
import json
import random
from datetime import datetime, timedelta
import os

def calculate_roi(revenue, cost):
    """Calculates Return on Investment (ROI)."""
    if cost == 0:
        return 0.0  # Avoid division by zero
    return ((revenue - cost) / cost) * 100

def generate_mock_marketing_data(content_id, start_date, end_date):
    """
    Generates mock marketing metrics for a given contentId and period.
    For simplicity, cost is assumed to be a fixed percentage of revenue,
    or a base cost if revenue is very low.
    """
    impressions = random.randint(1000, 100000)
    clicks = random.randint(impressions // 50, impressions // 10)
    conversions = random.randint(clicks // 20, clicks // 5)
    
    # Revenue can be influenced by conversions
    revenue_per_conversion = random.uniform(5.0, 50.0)
    revenue = conversions * revenue_per_conversion + random.uniform(100, 1000) # Base revenue
    
    # Cost simulation: often a percentage of revenue or fixed ad spend
    base_ad_spend = random.uniform(50, 500)
    cost = base_ad_spend + (0.1 * revenue * random.uniform(0.8, 1.2)) # 10% of revenue with some variance

    # Ensure cost is not zero for ROI calculation, and reasonable.
    cost = max(50.0, cost)

    return {
        "contentId": content_id,
        "metrics": {
            "impressions": impressions,
            "clicks": clicks,
            "conversions": conversions,
            "revenue": round(revenue, 2),
            "cost": round(cost, 2),
        },
        "period": {
            "start_date": start_date.strftime("%Y-%m-%d"),
            "end_date": end_date.strftime("%Y-%m-%d")
        }
    }

def collect_roi_data():
    """
    Collects and calculates ROI data for various content pieces.
    """
    all_roi_data = []
    
    # Define a few mock content items
    content_items = [
        "blog_post_ai_trends",
        "product_page_feature_x",
        "email_campaign_summer_sale",
        "social_ad_platform_y",
        "webinar_signup_page"
    ]

    end_date = datetime.now()
    start_date = end_date - timedelta(days=30) # Last 30 days

    for item in content_items:
        data = generate_mock_marketing_data(item, start_date, end_date)
        
        revenue = data["metrics"]["revenue"]
        cost = data["metrics"]["cost"]
        calculated_roi = calculate_roi(revenue, cost)
        
        data["calculatedROI"] = round(calculated_roi, 2)
        all_roi_data.append(data)
        
    return all_roi_data

def generate_baseline_user_metrics(user_id: str):
    """
    Generates and stores baseline metrics for a new user.
    """
    onboarding_date = datetime.now()
    
    baseline_metrics = {
        "userId": user_id,
        "onboardingDate": onboarding_date.strftime("%Y-%m-%d %H:%M:%S"),
        "initialActivityMetrics": {
            "dashboardViewsLast7Days": 0,
            "reportsGeneratedLast7Days": 0,
            "contentPiecesManaged": 0,
            "integrationsSetup": 0,
        },
        "initialROISummary": {
            "totalRevenueEver": 0.0,
            "totalCostEver": 0.0,
            "overallRoiPercentage": 0.0,
        },
        "onboardingProgress": {
            "profileCompleted": False,
            "firstCampaignCreated": False,
            "dataSourceConnected": False,
            "initialMetricsCaptured": True # This step is now complete
        }
    }

    user_metrics_dir = "localcontent_ai/data/user_metrics"
    os.makedirs(user_metrics_dir, exist_ok=True)
    user_metrics_path = os.path.join(user_metrics_dir, f"{user_id}_baseline_metrics.json")

    with open(user_metrics_path, "w") as f:
        json.dump(baseline_metrics, f, indent=4)
        
    print(f"Baseline metrics for user {user_id} saved to {user_metrics_path}")
    return baseline_metrics

if __name__ == "__main__":
    roi_data = collect_roi_data()
    output_path = "localcontent_ai/data/roi_metrics.json"
    
    # Create the data directory if it doesn't exist
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    with open(output_path, "w") as f:
        json.dump(roi_data, f, indent=4)
    
    print(f"ROI data successfully collected and saved to {output_path}")

    # Example usage for generating baseline metrics for a new user
    # This would be called by the user onboarding system
    # generate_baseline_user_metrics("new_user_123")
