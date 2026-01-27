# A/B Test Metrics Log Design (`ab_test_metrics.log`)

This document outlines the structure and content for the `ab_test_metrics.log` file, which will capture events related to A/B testing within the LocalContent.ai framework.

## 1. Required Fields for Each Log Entry

Each line in the `ab_test_metrics.log` file will represent a single event and will adhere to the following pipe-separated format:

`[TIMESTAMP] | [TEST_ID] | [VARIANT] | [EVENT_TYPE] | [USER_ID]`

Here's a detailed description of each field:

*   **`TIMESTAMP`**:
    *   **Description**: The precise time at which the event occurred.
    *   **Format**: ISO 8601 format (e.g., `YYYY-MM-DDTHH:MM:SSZ`).
    *   **Example**: `2023-10-27T10:30:00Z`
*   **`TEST_ID`**:
    *   **Description**: A unique identifier for the specific A/B test being conducted.
    *   **Example**: `campaign_hero_cta_test`
*   **`VARIANT`**:
    *   **Description**: The identifier of the content variant presented to the user.
    *   **Example**: `control`, `variant_A`, `variant_B`
*   **`EVENT_TYPE`**:
    *   **Description**: The type of interaction recorded.
    *   **Values**: `VIEW` (when content is displayed) or `CTA_CLICK` (when a Call-to-Action is clicked).
    *   **Example**: `VIEW`, `CTA_CLICK`
*   **`USER_ID`**:
    *   **Description**: A unique identifier for the simulated user session. This allows for tracking individual user journeys within a test.
    *   **Example**: `user_12345`, `session_uuid_abcde`

## 2. Example Log Entries

Here are a few examples illustrating how log entries would appear in `ab_test_metrics.log`:

```
2023-10-27T10:05:32Z | campaign_hero_cta_test | control | VIEW | user_98765
2023-10-27T10:06:15Z | campaign_hero_cta_test | variant_A | VIEW | user_54321
2023-10-27T10:07:01Z | campaign_hero_cta_test | variant_A | CTA_CLICK | user_54321
2023-10-27T10:08:40Z | ad_headline_img_test | control | VIEW | user_11223
2023-10-27T10:09:05Z | ad_headline_img_test | variant_B | VIEW | user_33445
2023-10-27T10:09:10Z | ad_headline_img_test | control | CTA_CLICK | user_11223
```

## 3. Rationale for the Chosen Format

The chosen pipe-separated format with distinct fields offers several advantages for the simulated A/B testing framework:

*   **Easy Parsing**: The consistent delimiter (`|`) and defined field order make it straightforward to parse log entries using standard scripting languages (e.g., Python's `split()` method) or command-line tools (e.g., `awk`, `cut`). This simplifies the `analyze_results.py` script's task of extracting and aggregating data.
*   **Human Readability**: The format is clear and easy for a human to read and understand at a glance, especially during development and debugging of the A/B testing system.
*   **Flexibility**: While simple, this format is extensible. New fields could be added to the end of the line if future requirements emerge, as long as parsing logic is updated to accommodate them.
*   **Lightweight**: As a plain text file, it has minimal overhead, making it efficient for logging a high volume of simulated events without introducing complex database or serialization dependencies for this simple simulation.
*   **Direct Alignment with `ab_testing_framework_impl.md`**: This design directly implements the `Log Format` specified in Section 3.1 of the `ab_testing_framework_impl.md` document, ensuring consistency and adherence to the overall plan.
