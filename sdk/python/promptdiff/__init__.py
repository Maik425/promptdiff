"""PromptDiff Python SDK.

Compare LLM outputs across models with a single API call.

Example::

    from promptdiff import PromptDiff

    pd = PromptDiff(api_key="pd_xxx")

    result = pd.compare(
        prompt="Summarize this article in 2 sentences",
        input="Article text here...",
        models=["claude-haiku-4-5", "gpt-4o", "gemini-2.0-flash"],
    )

    for r in result.results:
        print(f"{r.model}: {r.output}")
"""

from .client import PromptDiff
from .exceptions import (
    APIError,
    AuthenticationError,
    PromptDiffError,
    QuotaExceededError,
    ValidationError,
)
from .types import (
    CompareResponse,
    EvalMeta,
    EvalResult,
    ModelInfo,
    TokenUsage,
)

__all__ = [
    "PromptDiff",
    # Exceptions
    "PromptDiffError",
    "AuthenticationError",
    "QuotaExceededError",
    "ValidationError",
    "APIError",
    # Types
    "CompareResponse",
    "EvalMeta",
    "EvalResult",
    "ModelInfo",
    "TokenUsage",
]

__version__ = "0.1.0"
