# Live Keyword Research Tools: API Access Research

This document summarizes the API access for leading keyword research tools, focusing on Google Keyword Planner (part of Google Ads API) and SEMrush.

## 1. Google Keyword Planner (via Google Ads API)

*   **API Availability and General Documentation:**
    *   Keyword Planner functionalities are accessible through the **Google Ads API** (specifically via services like `KeywordPlanIdeaService`).
    *   Documentation: [developers.google.com/google-ads/api/docs/keyword-planning/overview](https://developers.google.com/google-ads/api/docs/keyword-planning/overview)
    *   Capabilities include generating keyword ideas, ad group themes, historical metrics, and forecast metrics.
    *   API usage for Keyword Planning services is rate-limited.

*   **Authentication Methods:**
    *   Requires **OAuth 2.0** for authorization.
    *   A **Developer Token** is also necessary for API access.

*   **Specific Terms of Service or Restrictions:**
    *   Subject to the general Google Ads API Terms and Conditions ([developers.google.com/google-ads/api/terms](https://developers.google.com/google-ads/api/terms)).
    *   Keyword Planning services are explicitly rate-limited.
    *   API usage is subject to access levels (Basic, Standard, Standard Blacklisted), which determine daily API operation limits.
    *   Google may set quotas based on the Google Ads spend history of accounts under management.

*   **Existence of Official or Popular Third-Party Client Libraries (Python/Node.js):**
    *   **Python:** Official client library available: [github.com/googleads/google-ads-python](https://github.com/googleads/google-ads-python).
    *   **Node.js:** Official client library available: [npmjs.com/package/google-ads-api](https://www.npmjs.com/package/google-ads-api).

*   **Basic Pricing Models for API Usage:**
    *   The API itself does not have a direct "cost per API call" but is intrinsically linked to an active Google Ads account and its advertising spend.
    *   API access levels (Basic, Standard) govern the daily API operation limits. Higher limits often depend on meeting specific criteria, including a history of significant Google Ads spend.

## 2. SEMrush API

*   **API Availability and General Documentation:**
    *   SEMrush provides two main API options:
        *   **Standard API:** Includes Analytics (Domain, Keyword, Backlink Analytics) and Projects APIs.
        *   **Trends API:** Provides data from Traffic & Market Toolkit reports.
    *   General information and links to specific report documentation are available on their knowledge base: [www.semrush.com/kb/5-api](https://www.semrush.com/kb/5-api)

*   **Authentication Methods:**
    *   Uses an **API key** for authentication. This key is provided after purchasing API units.

*   **Specific Terms of Service or Restrictions:**
    *   **Rate Limits:** Users must not send more than 10 inquiries per second from a single unique IP address or more than 10 simultaneous inquiries from one user (as per Section 2.3 of their terms of service).
    *   **Caching Policy:** Information received from the API cannot be cached for more than one (1) month without explicit written consent from SEMrush.
    *   **Legal Restrictions:** Cannot use the services if legally prohibited by the laws of the user's country of residence or access.

*   **Existence of Official or Popular Third-Party Client Libraries (Python/Node.js):**
    *   No official client libraries were found, but popular third-party wrappers exist:
        *   **Python:** A community-maintained wrapper like `python-semrush` is available: [github.com/storerjeremy/python-semrush](https://github.com/storerjeremy/python-semrush).
        *   **Node.js:** Third-party libraries like `node-semrush` are available: [npmjs.com/package/node-semrush](https://www.npmjs.com/package/node-semrush).

*   **Basic Pricing Models for API Usage:**
    *   **Standard API:** Requires a **Business tier SEMrush SEO Toolkit subscription** as an add-on. API units must be purchased separately. Unused units expire monthly and do not roll over.
    *   **Trends API:** Available only to paid SEMrush users with specific plans:
        *   **Trends Basic API:** Offers broad traffic summaries and visitor behavior data. It includes a default monthly limit of 10,000 requests, which refreshes monthly.
        *   **Trends Premium API:** Includes all Basic features plus 16 additional, more granular data types (e.g., daily/weekly traffic, purchase conversion, geographic distribution, audience interests).
    *   Pricing is based on API units, which vary depending on the type of request and the volume of data. Quotes for specific needs can be obtained by contacting their sales team.
