// Package service — billing logic for pass-through pricing.
package service

// Pricing model: LLM API cost × (1 + Margin) = user charge.
// Free tier: 100 evals/month, restricted to cheap models only.

const (
	FreeQuota = 100
	Margin    = 0.40 // 40% markup on LLM API cost
)

// FreeModels lists model IDs available on the free tier.
// These are the cheapest models from each provider.
var FreeModels = map[string]bool{
	"claude-haiku-4-5":  true,
	"gpt-4o-mini":       true,
	"gemini-2.5-flash":  true,
	"grok-3-mini":       true,
}

// UserCharge calculates what the user pays for an eval.
// Returns 0 if within free quota and no payment method.
func UserCharge(llmCost float64, monthlyEvalCount int, hasPaymentMethod bool) float64 {
	if !hasPaymentMethod && monthlyEvalCount < FreeQuota {
		return 0
	}
	return llmCost * (1 + Margin)
}

// CanRunEval checks whether the user can run an eval.
// Returns (allowed, reason).
func CanRunEval(monthlyEvalCount int, hasPaymentMethod bool, monthlySpendUSD float64, spendLimitUSD float64) (bool, string) {
	// Free tier: within quota
	if !hasPaymentMethod {
		if monthlyEvalCount >= FreeQuota {
			return false, "free quota exceeded (100/month). Add a payment method to continue."
		}
		return true, "free"
	}

	// Paid tier: check spend limit
	if spendLimitUSD > 0 && monthlySpendUSD >= spendLimitUSD {
		return false, "monthly spend limit reached. Increase your limit in settings."
	}

	return true, "paid"
}

// IsFreeModel returns true if the model is available on the free tier.
func IsFreeModel(modelID string) bool {
	return FreeModels[modelID]
}
