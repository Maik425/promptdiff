"""Basic usage examples for the PromptDiff Python SDK.

Run with:
    PROMPTDIFF_API_KEY=pd_xxx python examples/basic_usage.py
"""

import os
import sys

# Allow running from the repo root without installing the package.
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from promptdiff import PromptDiff

API_KEY = os.environ.get("PROMPTDIFF_API_KEY", "pd_xxx")


def example_compare() -> None:
    """Compare three models on the same prompt."""
    pd = PromptDiff(api_key=API_KEY)

    result = pd.compare(
        prompt="Summarize the following article in exactly 2 sentences.",
        input=(
            "Scientists have discovered a new species of deep-sea jellyfish near the "
            "Mariana Trench. The creature, bioluminescent and translucent, measures "
            "over two metres in diameter and has never before been observed by humans."
        ),
        models=["claude-haiku-4-5", "gpt-4o-mini", "gemini-2.0-flash"],
        temperature=0.7,
        max_tokens=200,
    )

    print(f"Eval ID : {result.eval_id}\n")

    for r in result.results:
        status = f"ERROR: {r.error}" if r.error else r.output
        print(f"[{r.model}]")
        print(f"  Output  : {status}")
        print(f"  Latency : {r.latency_ms} ms")
        print(f"  Tokens  : {r.tokens.total} ({r.tokens.input} in / {r.tokens.output} out)")
        print(f"  Cost    : ${r.cost_usd:.6f}")
        print()

    print(f"Fastest  : {result.meta.fastest_model}")
    print(f"Cheapest : {result.meta.cheapest_model}")
    print(f"Total $  : ${result.meta.total_cost_usd:.6f}")


def example_list_models() -> None:
    """List all available models."""
    pd = PromptDiff(api_key=API_KEY)

    models = pd.models()
    print(f"\n{'ID':<30} {'Provider':<15} {'$/1M in':>10} {'$/1M out':>10}")
    print("-" * 70)
    for m in models:
        print(f"{m.id:<30} {m.provider:<15} ${m.input_per_1m:>9.2f} ${m.output_per_1m:>9.2f}")


def example_usage() -> None:
    """Show current API usage."""
    pd = PromptDiff(api_key=API_KEY)

    usage = pd.usage()
    print(f"\nEvals this month   : {usage.get('eval_count', 'N/A')}")
    print(f"Free remaining     : {usage.get('free_evals_remaining', 'N/A')}")


def example_list_evals() -> None:
    """List recent evaluations and fetch details for the latest one."""
    pd = PromptDiff(api_key=API_KEY)

    evals = pd.evals(limit=5)
    if not evals:
        print("\nNo past evals found.")
        return

    print(f"\nLast {len(evals)} eval(s):")
    for e in evals:
        print(f"  {e.get('eval_id', e.get('id'))} — {e.get('created_at', '')}")

    first_id = evals[0].get("eval_id") or evals[0].get("id")
    if first_id:
        detail = pd.eval(first_id)
        print(f"\nDetail for {first_id}:")
        print(f"  Keys: {list(detail.keys())}")


def example_context_manager() -> None:
    """Use the client as a context manager for automatic cleanup."""
    with PromptDiff(api_key=API_KEY) as pd:
        result = pd.compare(
            prompt="What is 2 + 2?",
            models=["gpt-4o-mini"],
        )
        print(f"\n2 + 2 = {result.results[0].output.strip()}")


if __name__ == "__main__":
    print("=== compare ===")
    example_compare()

    print("\n=== models ===")
    example_list_models()

    print("\n=== usage ===")
    example_usage()

    print("\n=== evals ===")
    example_list_evals()

    print("\n=== context manager ===")
    example_context_manager()
