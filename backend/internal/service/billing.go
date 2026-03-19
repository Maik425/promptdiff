// Package service — billing logic for hybrid pricing.
package service

// Pricing tiers and rates for the hybrid model.
// Free: 100 evals/month, no card required.
// Pay-as-you-go: card required, volume discounts.

const (
	FreeQuota = 100

	// Per-eval pricing (USD)
	RateStandard  = 0.005 // 1 - 5,000 evals
	RateVolume5K  = 0.004 // 5,001 - 25,000
	RateVolume25K = 0.003 // 25,001+
)

// PricingTier returns the tier name and per-eval rate based on monthly eval count.
func PricingTier(monthlyEvalCount int) (tier string, rate float64) {
	switch {
	case monthlyEvalCount >= 25000:
		return "volume_25k", RateVolume25K
	case monthlyEvalCount >= 5000:
		return "volume_5k", RateVolume5K
	default:
		return "standard", RateStandard
	}
}

// EvalCost calculates the cost for a single eval based on current monthly count.
// Returns 0 if within free quota and no payment method.
func EvalCost(monthlyEvalCount int, hasPaymentMethod bool) float64 {
	if !hasPaymentMethod && monthlyEvalCount < FreeQuota {
		return 0
	}
	_, rate := PricingTier(monthlyEvalCount)
	return rate
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
