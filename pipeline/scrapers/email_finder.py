"""
Email finding waterfall.
Tries multiple methods in order of confidence to find a business owner's email.
"""

import re
import socket
import smtplib
import requests
from bs4 import BeautifulSoup
from utils.logger import logger
from utils.helpers import clean_email, extract_domain, retry


class EmailFinder:
    CONTACT_PATHS = ["/contact", "/contact-us", "/about", "/about-us", "/team", "/our-team"]
    EMAIL_REGEX = re.compile(
        r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
    )
    IGNORE_EMAILS = {
        "noreply", "no-reply", "support", "info", "hello", "admin",
        "webmaster", "postmaster", "mailer-daemon", "sentry",
    }
    IGNORE_DOMAINS = {
        "example.com", "sentry.io", "wixpress.com", "squarespace.com",
        "wordpress.com", "godaddy.com", "googleapis.com", "facebook.com",
        "instagram.com", "twitter.com",
    }

    def find_email(self, business_data: dict) -> dict | None:
        """
        Waterfall: tries each method in order, returns first verified hit.
        Returns {"email": str, "source": str, "confidence": str} or None.
        """
        methods = [
            ("outscraper", self._check_outscraper_email),
            ("website", self._scrape_website_email),
            ("social_bio", self._check_social_bios),
        ]

        for source, method in methods:
            try:
                email = method(business_data)
                if email:
                    cleaned = clean_email(email)
                    if cleaned and not self._is_junk_email(cleaned):
                        confidence = "high" if source in ("outscraper", "website") else "medium"
                        logger.info(f"Found email for {business_data.get('business_name')}: {cleaned} (source={source})")
                        return {
                            "email": cleaned,
                            "source": source,
                            "confidence": confidence,
                        }
            except Exception as e:
                logger.debug(f"Email method {source} failed for {business_data.get('business_name')}: {e}")
                continue

        logger.info(f"No email found for {business_data.get('business_name')}")
        return None

    def _check_outscraper_email(self, data: dict) -> str | None:
        return data.get("owner_email") or data.get("contact_email")

    @retry(max_attempts=2, delay=3.0)
    def _scrape_website_email(self, data: dict) -> str | None:
        website = data.get("website")
        if not website:
            return None

        if not website.startswith("http"):
            website = f"https://{website}"

        headers = {
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }

        # Try the homepage first
        email = self._extract_email_from_url(website, headers)
        if email:
            return email

        # Try common contact pages
        domain = extract_domain(website) or ""
        for path in self.CONTACT_PATHS:
            try:
                url = f"https://{domain}{path}"
                email = self._extract_email_from_url(url, headers)
                if email:
                    return email
            except Exception:
                continue

        return None

    def _extract_email_from_url(self, url: str, headers: dict) -> str | None:
        try:
            resp = requests.get(url, headers=headers, timeout=10, allow_redirects=True)
            if resp.status_code != 200:
                return None

            # Check mailto links first (most reliable)
            soup = BeautifulSoup(resp.text, "html.parser")
            for a in soup.find_all("a", href=True):
                href = a["href"]
                if href.startswith("mailto:"):
                    email = href.replace("mailto:", "").split("?")[0].strip()
                    if not self._is_junk_email(email):
                        return email

            # Regex fallback on page text
            text = soup.get_text(separator=" ")
            matches = self.EMAIL_REGEX.findall(text)
            for m in matches:
                if not self._is_junk_email(m):
                    return m

        except requests.RequestException:
            pass
        return None

    def _check_social_bios(self, data: dict) -> str | None:
        bio = data.get("instagram_bio") or data.get("bio") or ""
        matches = self.EMAIL_REGEX.findall(bio)
        for m in matches:
            if not self._is_junk_email(m):
                return m
        return None

    def _is_junk_email(self, email: str) -> bool:
        if not email or "@" not in email:
            return True
        local, domain = email.lower().split("@", 1)
        if local in self.IGNORE_EMAILS:
            return True
        if domain in self.IGNORE_DOMAINS:
            return True
        if domain.endswith((".png", ".jpg", ".gif")):
            return True
        return False

    def verify_email_smtp(self, email: str) -> bool:
        """
        Basic SMTP check — verifies the mail server accepts the address.
        Use sparingly to avoid being flagged.
        """
        try:
            domain = email.split("@")[1]
            records = sorted(
                [(r.preference, str(r.exchange).rstrip("."))
                 for r in __import__("dns.resolver", fromlist=["resolve"]).resolve(domain, "MX")],
                key=lambda x: x[0],
            )
            if not records:
                return False

            mx_host = records[0][1]
            with smtplib.SMTP(mx_host, 25, timeout=10) as server:
                server.helo("geospark.ai")
                server.mail("verify@geospark.ai")
                code, _ = server.rcpt(email)
                return code == 250
        except Exception:
            return False
