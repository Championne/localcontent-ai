import re
import time
from functools import wraps
from utils.logger import logger


def clean_email(email: str | None) -> str | None:
    if not email:
        return None
    email = email.strip().lower()
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return email if re.match(pattern, email) else None


def clean_phone(phone: str | None) -> str | None:
    if not phone:
        return None
    digits = re.sub(r"[^\d+]", "", phone)
    return digits if len(digits) >= 10 else None


def extract_instagram_username(url: str | None) -> str | None:
    if not url:
        return None
    match = re.search(r"instagram\.com/([^/?#]+)", url)
    if match:
        username = match.group(1).strip().lower()
        if username not in ("p", "reel", "stories", "explore", "accounts"):
            return username
    return None


def extract_domain(url: str | None) -> str | None:
    if not url:
        return None
    match = re.search(r"https?://(?:www\.)?([^/?#]+)", url)
    return match.group(1) if match else None


def retry(max_attempts: int = 3, delay: float = 2.0, backoff: float = 2.0):
    """Decorator for retrying functions with exponential backoff."""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            wait = delay
            for attempt in range(1, max_attempts + 1):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_attempts:
                        logger.error(f"{func.__name__} failed after {max_attempts} attempts: {e}")
                        raise
                    logger.warning(f"{func.__name__} attempt {attempt} failed: {e}. Retrying in {wait:.1f}s...")
                    time.sleep(wait)
                    wait *= backoff
        return wrapper
    return decorator


def rate_limit(seconds: float):
    """Decorator to enforce minimum delay between calls."""
    last_call = [0.0]

    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            elapsed = time.time() - last_call[0]
            if elapsed < seconds:
                time.sleep(seconds - elapsed)
            result = func(*args, **kwargs)
            last_call[0] = time.time()
            return result
        return wrapper
    return decorator
