# API Endpoints Specification

This document outlines the conceptual API endpoints for the Employee Advocacy Content feature within LocalContent.ai.

## 1. Content Management Endpoints

### `POST /api/content`
- **Description**: Creates a new content entry in the system.
- **Request Body**:
  ```json
  {
      "title": "Example Blog Post Title",
      "body": "This is the body of the blog post...",
      "original_url": "https://yourcompany.com/blog/example-post",
      "image_url": "https://yourcompany.com/images/example-post.jpg"
  }
  ```
- **Response**:
  ```json
  {
      "content_id": "a1b2c3d4-e5f6-7890-1234-567890abcdef"
  }
  ```

### `GET /api/content/{{content_id}}`
- **Description**: Retrieves details for a specific content item.
- **Path Parameters**: `content_id` (UUID)

### `GET /api/content`
- **Description**: Lists all content items, with optional pagination and filters.

---

## 2. Employee Management Endpoints

### `POST /api/employees`
- **Description**: Registers a new employee in the system.
- **Request Body**:
  ```json
  {
      "name": "Jane Doe",
      "email": "jane.doe@example.com",
      "department": "Marketing"
  }
  ```
- **Response**:
  ```json
  {
      "employee_id": "b1c2d3e4-f5a6-0987-6543-210fedcba987"
  }
  ```

### `GET /api/employees/{{employee_id}}`
- **Description**: Retrieves details for a specific employee.
- **Path Parameters**: `employee_id` (UUID)

---

## 3. Share Link Generation Endpoint (Core)

### `POST /api/generate-share-link`
- **Description**: Generates a unique, trackable sharing link for a specific content item, attributed to a specific employee, and optionally for a target social media platform.
- **Request Body**:
  ```json
  {
      "content_id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
      "employee_id": "b1c2d3e4-f5a6-0987-6543-210fedcba987",
      "platform": "LinkedIn" // Optional: "LinkedIn", "Twitter", "Facebook", etc.
  }
  ```
- **Backend Logic Details**:
    1.  Validate existence of `content_id` and `employee_id`.
    2.  Generate a new `link_id` (UUID).
    3.  Generate a `unique_share_code` (e.g., a 12-16 character alphanumeric string derived from a hash of `link_id`, `content_id`, `employee_id`, and a random component).
    4.  Construct the `full_share_url` using the base URL and `unique_share_code` (e.g., `https://localcontent.ai/share/{{unique_share_code}}`).
    5.  Insert a new record into the `SharedLinks` table with `link_id`, `content_id`, `employee_id`, `unique_share_code`, `full_share_url`, and `platform`.
- **Response (on success)**:
  ```json
  {
      "link_id": "c1d2e3f4-0123-4567-89ab-cdef01234567",
      "unique_share_code": "some-short-code-1a2b",
      "full_share_url": "https://localcontent.ai/share/some-short-code-1a2b"
  }
  ```
- **Error Responses**: Appropriate HTTP status codes (e.g., 400 for bad request, 404 for content/employee not found).

---

## 4. Click Tracking Redirect Endpoint (Core)

### `GET /share/{{unique_share_code}}`
- **Description**: This is the publicly accessible endpoint that the `full_share_url` points to. It records click events and then redirects the user to the original content.
- **Path Parameters**: `unique_share_code` (string, e.g., `some-short-code-1a2b`)
- **Backend Logic Details**:
    1.  Extract `unique_share_code` from the URL path.
    2.  Query the `SharedLinks` table to find the corresponding `link_id` and the `original_url` associated with the content.
    3.  **If a matching `SharedLinks` entry is found**:
        *   Record a new entry in the `LinkClicks` table, capturing:
            *   `click_id` (new UUID)
            *   `link_id` (foreign key to `SharedLinks`)
            *   `timestamp` (current time)
            *   `ip_address` (client's IP address, potentially anonymized)
            *   `user_agent` (client's browser/device string)
            *   `referrer` (the URL from which the click originated, if available)
        *   Issue an HTTP 302 Found redirect to the `original_url`.
    4.  **If no matching `SharedLinks` entry is found**:
        *   Issue an HTTP 404 Not Found response or redirect to a generic error/fallback page.
- **Response**: HTTP 302 Redirect to `original_url` (on success).

---

## 5. Share Event Confirmation Endpoint (Optional)

### `POST /api/confirm-share`
- **Description**: Allows the LocalContent.ai system (or a webhook from a social media platform, if supported) to confirm that content was successfully shared and to capture platform-specific post IDs.
- **Request Body**:
  ```json
  {
      "link_id": "c1d2e3f4-0123-4567-89ab-cdef01234567",
      "platform": "LinkedIn",
      "post_id": "linkedin-post-id-12345", // Optional, if platform provides it
      "status": "shared" // "shared", "failed", "pending", etc.
  }
  ```
- **Backend Logic Details**:
    1.  Validate `link_id` and `platform`.
    2.  Insert a new record into the `ShareEvents` table with the provided details.
- **Response**:
  ```json
  {
      "status": "success",
      "share_event_id": "d1e2f3a4-0987-6543-210f-edcba9876543"
  }
  ```

---

## 6. Analytics & Reporting Endpoints (Conceptual)

### `GET /api/analytics/content/{{content_id}}`
- **Description**: Retrieves aggregate click and share metrics for a specific content item.

### `GET /api/analytics/employee/{{employee_id}}`
- **Description**: Retrieves performance metrics for an individual employee (e.g., total clicks, number of shares, most successful content).

### `GET /api/analytics/overall`
- **Description**: Provides platform-wide advocacy metrics (e.g., total clicks, most popular content, top employees across all content).
