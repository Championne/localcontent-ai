
import os
import argparse
import json
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

# If modifying these scopes, delete the file token.json related to GMB.
SCOPES = [
    'https://www.googleapis.com/auth/business.readonly', 
    'https://www.googleapis.com/auth/business.management'
]

def get_gmb_service(credentials_path: str, api_name: str, api_version: str):
    creds = None
    token_path = f'gmb_{api_name}_token.json' # Use a separate token file per API

    if os.path.exists(token_path):
        creds = Credentials.from_authorized_user_file(token_path, SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not os.path.exists(credentials_path):
                print(f"Error: GMB credentials file not found at {credentials_path}")
                print("Please ensure you have configured your Google Cloud Project for GMB API,")
                print("created OAuth client ID credentials (Desktop app), downloaded the JSON,")
                print(f"and saved it as '{credentials_path}' or provided the correct path.")
                return None
            flow = InstalledAppFlow.from_client_secrets_file(credentials_path, SCOPES)
            creds = flow.run_local_server(port=0)
        with open(token_path, 'w') as token:
            token.write(creds.to_json())

    service = build(api_name, api_version, credentials=creds)
    return service

def get_accounts(service):
    """Lists accounts the user has access to."""
    try:
        # Ensure we are using the account management service for this.
        accounts = service.accounts().list().execute()
        return accounts.get('accounts', [])
    except Exception as e:
        print(f"An error occurred while fetching GMB accounts: {e}")
        return []

def get_locations(service, account_name):
    """Lists locations for a given account."""
    try:
        locations = service.accounts().locations().list(parent=account_name).execute()
        return locations.get('locations', [])
    except Exception as e:
        print(f"An error occurred while fetching GMB locations for account {account_name}: {e}")
        return []

def get_location_insights(insights_service, location_name, start_date, end_date):
    """Fetches insights for a specific location using the My Business Place Insights API."""
    # Metrics to retrieve (using the names from the Insights API documentation)
    # The available metrics can be found in the GMB API documentation,
    # specifically for the mybusinessplaceinsights.locations.batchGetLocationInsights endpoint.
    # Example metrics (these can vary by business type):
    #   - VIEWS_MAP: How many times the business was viewed on Google Maps.
    #   - VIEWS_SEARCH: How many times the business was viewed on Google Search.
    #   - ACTIONS_WEBSITE: Clicks on website link.
    #   - ACTIONS_PHONE: Clicks on phone number.
    #   - ACTIONS_DRIVING_DIRECTIONS: Requests for driving directions.
    #   - QUERIES_DIRECT: Direct searches for the business name/address.
    #   - QUERIES_INDIRECT: Discovery searches.

    # Note: The GMB insights API typically provides data aggregated by date.
    # The granularity for timeSeries is usually DAILY for these metrics.
    metric_requests = [
        {"metric": "VIEWS_MAP"},
        {"metric": "VIEWS_SEARCH"},
        {"metric": "ACTIONS_WEBSITE"},
        {"metric": "ACTIONS_PHONE"},
        {"metric": "ACTIONS_DRIVING_DIRECTIONS"},
        # The following queries are often under 'QUERIES_TOTAL' with query_type dimension,
        # but newer versions might provide direct query metrics. If these don't work,
        # I'll need to adapt for query_type filtering.
        {"metric": "QUERIES_DIRECT"},
        {"metric": "QUERIES_INDIRECT"},
    ]

    # Construct the request body for batchGetLocationInsights
    request_body = {
        "locationMetrics": [
            {
                "metricRequests": [
                    {"metric": "VIEWS_MAP"},
                    {"metric": "VIEWS_SEARCH"},
                    {"metric": "ACTIONS_WEBSITE"},
                    {"metric": "ACTIONS_PHONE"},
                    {"metric": "ACTIONS_DRIVING_DIRECTIONS"},
                    {"metric": "QUERIES_DIRECT"},
                    {"metric": "QUERIES_INDIRECT"},
                ],
                "timeRange": {
                    "startTime": f"{start_date}T00:00:00Z",
                    "endTime": f"{end_date}T23:59:59Z"
                }
            }
        ]
    }

    try:
        # The batchGetLocationInsights method takes a list of location names.
        # The Insights API endpoint is typically mybusinessplaceinsights.locations.batchGetLocationInsights
        response = insights_service.locations().batchGetLocationInsights(
            name=location_name, # This needs to be the resource name of the location
            body=request_body
        ).execute()
        return response
    except Exception as e:
        print(f"An error occurred while fetching GMB insights for {location_name}: {e}")
        return None


def main():
    parser = argparse.ArgumentParser(description="Fetch Google My Business data.")
    parser.add_argument("--credentials_path", default="gmb_client_secret.json",
                        help="Path to your Google Cloud client secret JSON file for GMB.")
    parser.add_argument("--start_date", required=True,
                        help="Start date in YYYY-MM-DD format.")
    parser.add_argument("--end_date", required=True,
                        help="End date in YYYY-MM-DD format.")

    args = parser.parse_args()

    # Service for account and location management
    account_management_service = get_gmb_service(args.credentials_path, 'mybusinessaccountmanagement', 'v1')
    if not account_management_service:
        return

    # Service for fetching insights (different API)
    insights_service = get_gmb_service(args.credentials_path, 'mybusinessplaceinsights', 'v1')
    if not insights_service:
        return

    print("Fetching GMB accounts...")
    accounts = get_accounts(account_management_service)
    if not accounts:
        print("No GMB accounts found or accessible.")
        return

    for account in accounts:
        print(f"Account: {account.get('accountName')} (Type: {account.get('type')})")
        locations = get_locations(account_management_service, account.get('name'))
        if locations:
            for location in locations:
                print(f"  Location: {location.get('locationName')} (URL: {location.get('googleUrl')})")
                # Now fetch insights using the insights_service
                insights = get_location_insights(insights_service, location.get('name'), args.start_date, args.end_date)
                if insights:
                    print(f"    Insights for {location.get('locationName')}: {json.dumps(insights, indent=2)}")
                else:
                    print(f"    No insights or error fetching for {location.get('locationName')}.")
        else:
            print(f"  No locations found for account {account.get('accountName')}.")

if __name__ == "__main__":
    main()
