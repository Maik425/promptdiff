"""PromptDiff API client."""

from typing import Any, Dict, List, Optional

import httpx

from .exceptions import (
    APIError,
    AuthenticationError,
    PromptDiffError,
    QuotaExceededError,
    ValidationError,
)
from .types import (
    CompareResponse,
    ModelInfo,
    compare_response_from_dict,
    model_info_from_dict,
)

_DEFAULT_BASE_URL = "https://promptdiff.bizmarq.com/api"
_SDK_VERSION = "0.1.0"
_USER_AGENT = f"promptdiff-python/{_SDK_VERSION}"


class PromptDiff:
    """Synchronous client for the PromptDiff API.

    Args:
        api_key: Your PromptDiff API key (``pd_xxx``).
        base_url: Override the default API base URL. Useful for self-hosted
            instances or local development.
        timeout: HTTP request timeout in seconds. Defaults to ``60``.

    Example::

        from promptdiff import PromptDiff

        pd = PromptDiff(api_key="pd_xxx")
        result = pd.compare(
            prompt="Explain quantum entanglement in one sentence.",
            models=["claude-haiku-4-5", "gpt-4o-mini"],
        )
        for r in result.results:
            print(r.model, r.output)
    """

    def __init__(
        self,
        api_key: str,
        base_url: str = _DEFAULT_BASE_URL,
        timeout: float = 60.0,
    ) -> None:
        self._api_key = api_key
        self._base_url = base_url.rstrip("/")
        self._client = httpx.Client(
            headers={
                "Authorization": f"Bearer {api_key}",
                "User-Agent": _USER_AGENT,
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            timeout=timeout,
        )

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def compare(
        self,
        prompt: str,
        models: List[str],
        input: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 500,
    ) -> CompareResponse:
        """Run a prompt across multiple models and return a comparison.

        Args:
            prompt: The instruction or question sent to every model.
            models: List of model IDs to compare (e.g.
                ``["claude-haiku-4-5", "gpt-4o", "gemini-2.0-flash"]``).
            input: Optional additional context or document text appended to
                the prompt.
            temperature: Sampling temperature (0.0–1.0). Defaults to ``0.7``.
            max_tokens: Maximum tokens each model may generate. Defaults to
                ``500``.

        Returns:
            A :class:`~promptdiff.types.CompareResponse` with per-model
            results and aggregate metadata.

        Raises:
            AuthenticationError: Invalid or missing API key.
            QuotaExceededError: Free quota or rate limit exceeded.
            ValidationError: The request payload was rejected by the server.
            APIError: Any other non-2xx response or network error.
        """
        payload: Dict[str, Any] = {
            "prompt": prompt,
            "models": models,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        if input is not None:
            payload["input"] = input

        data = self._post("/compare", payload)
        return compare_response_from_dict(data)

    def models(self) -> List[ModelInfo]:
        """List all LLM models available through PromptDiff.

        Returns:
            A list of :class:`~promptdiff.types.ModelInfo` objects sorted by
            provider and model name.

        Raises:
            AuthenticationError: Invalid or missing API key.
            APIError: Any other non-2xx response or network error.
        """
        data = self._get("/models")
        raw_models: List[Dict[str, Any]] = data if isinstance(data, list) else data.get("models", [])
        return [model_info_from_dict(m) for m in raw_models]

    def usage(self) -> Dict[str, Any]:
        """Retrieve usage statistics for the current billing period.

        Returns:
            A dict containing at minimum ``eval_count`` and
            ``free_evals_remaining``. Additional keys may be present depending
            on the API version.

        Raises:
            AuthenticationError: Invalid or missing API key.
            APIError: Any other non-2xx response or network error.
        """
        return self._get("/usage")

    def evals(self, limit: int = 20, offset: int = 0) -> List[Dict[str, Any]]:
        """List past evaluation runs for the authenticated user.

        Args:
            limit: Maximum number of results to return. Defaults to ``20``.
            offset: Number of results to skip (for pagination). Defaults to
                ``0``.

        Returns:
            A list of raw eval summary dicts. Use :meth:`eval` to fetch full
            details for a specific run.

        Raises:
            AuthenticationError: Invalid or missing API key.
            APIError: Any other non-2xx response or network error.
        """
        data = self._get("/evals", params={"limit": limit, "offset": offset})
        return data if isinstance(data, list) else data.get("evals", [])

    def eval(self, eval_id: str) -> Dict[str, Any]:
        """Fetch the full details of a single evaluation run.

        Args:
            eval_id: The evaluation identifier returned by :meth:`compare`
                (e.g. ``"eval_abc123"``).

        Returns:
            Raw eval detail dict from the API.

        Raises:
            AuthenticationError: Invalid or missing API key.
            APIError: Eval not found or other non-2xx response.
        """
        return self._get(f"/evals/{eval_id}")

    # ------------------------------------------------------------------
    # Internal HTTP helpers
    # ------------------------------------------------------------------

    def _post(self, path: str, json: Dict[str, Any]) -> Dict[str, Any]:
        url = f"{self._base_url}{path}"
        try:
            response = self._client.post(url, json=json)
        except httpx.RequestError as exc:
            raise APIError(f"Network error while calling {url}: {exc}") from exc
        return self._handle_response(response)

    def _get(
        self,
        path: str,
        params: Optional[Dict[str, Any]] = None,
    ) -> Any:
        url = f"{self._base_url}{path}"
        try:
            response = self._client.get(url, params=params)
        except httpx.RequestError as exc:
            raise APIError(f"Network error while calling {url}: {exc}") from exc
        return self._handle_response(response)

    @staticmethod
    def _handle_response(response: httpx.Response) -> Any:
        """Parse the response and raise a typed exception on non-2xx status."""
        if response.is_success:
            try:
                return response.json()
            except Exception as exc:
                raise APIError(
                    f"Failed to parse JSON response: {exc}",
                    status_code=response.status_code,
                ) from exc

        # Try to extract a server-provided error message.
        try:
            body = response.json()
            message: str = (
                body.get("error")
                or body.get("message")
                or body.get("detail")
                or response.text
            )
        except Exception:
            message = response.text or f"HTTP {response.status_code}"

        status = response.status_code

        if status == 401:
            raise AuthenticationError(message, status_code=status)
        if status in (402, 429):
            raise QuotaExceededError(message, status_code=status)
        if status == 422:
            raise ValidationError(message, status_code=status)
        raise APIError(message, status_code=status)

    def close(self) -> None:
        """Close the underlying HTTP connection pool.

        Call this explicitly when not using the client as a context manager.
        """
        self._client.close()

    def __enter__(self) -> "PromptDiff":
        return self

    def __exit__(self, *args: Any) -> None:
        self.close()
