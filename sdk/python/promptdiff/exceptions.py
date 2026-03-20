"""Custom exceptions for the PromptDiff SDK."""

from typing import Optional


class PromptDiffError(Exception):
    """Base exception for all PromptDiff SDK errors."""

    def __init__(self, message: str, status_code: Optional[int] = None) -> None:
        super().__init__(message)
        self.status_code = status_code


class AuthenticationError(PromptDiffError):
    """Raised when the API key is missing, invalid, or expired (HTTP 401)."""


class QuotaExceededError(PromptDiffError):
    """Raised when the free quota or paid limit is exhausted (HTTP 402 / 429)."""


class ValidationError(PromptDiffError):
    """Raised when the request payload fails server-side validation (HTTP 422)."""


class APIError(PromptDiffError):
    """Raised for unexpected server-side errors (HTTP 5xx) or unknown HTTP errors."""
