// Package middleware contains Echo middleware for the PromptDiff API.
package middleware

import (
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/labstack/echo/v4"
	"golang.org/x/time/rate"
)

// rateLimitResponse is the JSON body returned when a request is rate limited.
type rateLimitResponse struct {
	Error   string `json:"error"`
	Message string `json:"message"`
}

// limiterEntry wraps a rate.Limiter with a last-seen timestamp for cleanup.
type limiterEntry struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

// RateLimiter holds per-key token bucket limiters and cleans up stale entries
// periodically via a background goroutine.
type RateLimiter struct {
	mu       sync.Mutex
	limiters map[string]*limiterEntry
	rps      rate.Limit
	burst    int
}

// NewRateLimiter creates a RateLimiter and starts the background cleanup goroutine.
// rps is the sustained request rate (requests per second) and burst is the maximum
// number of tokens that can accumulate. The goroutine stops when the provided done
// channel is closed.
func NewRateLimiter(rps float64, burst int, done <-chan struct{}) *RateLimiter {
	rl := &RateLimiter{
		limiters: make(map[string]*limiterEntry),
		rps:      rate.Limit(rps),
		burst:    burst,
	}
	go rl.cleanup(done)
	return rl
}

// allow returns true if the request identified by key should be allowed.
func (rl *RateLimiter) allow(key string) bool {
	rl.mu.Lock()
	e, ok := rl.limiters[key]
	if !ok {
		e = &limiterEntry{
			limiter: rate.NewLimiter(rl.rps, rl.burst),
		}
		rl.limiters[key] = e
	}
	e.lastSeen = time.Now()
	allowed := e.limiter.Allow()
	rl.mu.Unlock()
	return allowed
}

// retryAfter returns how many whole seconds the caller should wait before the
// next token becomes available for the given key.
func (rl *RateLimiter) retryAfter(key string) int {
	rl.mu.Lock()
	e, ok := rl.limiters[key]
	rl.mu.Unlock()
	if !ok {
		return 1
	}
	// Reserve a token to inspect the delay, then cancel it immediately so we
	// don't actually consume capacity.
	r := e.limiter.Reserve()
	delay := r.Delay()
	r.Cancel()
	secs := int(delay.Seconds())
	if secs < 1 {
		secs = 1
	}
	return secs
}

// cleanup removes entries that have not been accessed for more than 10 minutes.
// It runs every 5 minutes until done is closed.
func (rl *RateLimiter) cleanup(done <-chan struct{}) {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()
	for {
		select {
		case <-done:
			return
		case <-ticker.C:
			rl.mu.Lock()
			for key, e := range rl.limiters {
				if time.Since(e.lastSeen) > 10*time.Minute {
					delete(rl.limiters, key)
				}
			}
			rl.mu.Unlock()
		}
	}
}

// IPRateLimit returns an Echo middleware that rate-limits requests by remote IP.
// rps is the sustained rate in requests per second; burst is the token bucket size.
// Callers should pass (10.0/60, 10) to achieve 10 req/min with burst of 10.
func IPRateLimit(rps float64, burst int, done <-chan struct{}) echo.MiddlewareFunc {
	rl := NewRateLimiter(rps, burst, done)
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			ip := c.RealIP()
			if !rl.allow(ip) {
				retryAfter := rl.retryAfter(ip)
				c.Response().Header().Set("Retry-After", fmt.Sprintf("%d", retryAfter))
				return c.JSON(http.StatusTooManyRequests, rateLimitResponse{
					Error:   "rate_limited",
					Message: fmt.Sprintf("Too many requests. Retry after %d seconds.", retryAfter),
				})
			}
			return next(c)
		}
	}
}

// APIKeyRateLimit returns an Echo middleware that rate-limits requests by API key.
// The API key is read from the Authorization Bearer header. If no key is present
// the request falls through to the next handler (auth middleware will reject it).
// rps is the sustained rate in requests per second; burst is the token bucket size.
func APIKeyRateLimit(rps float64, burst int, done <-chan struct{}) echo.MiddlewareFunc {
	rl := NewRateLimiter(rps, burst, done)
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			key := extractBearerToken(c.Request())
			if key == "" {
				// No API key present — let the auth middleware handle the rejection.
				return next(c)
			}
			if !rl.allow(key) {
				retryAfter := rl.retryAfter(key)
				c.Response().Header().Set("Retry-After", fmt.Sprintf("%d", retryAfter))
				return c.JSON(http.StatusTooManyRequests, rateLimitResponse{
					Error:   "rate_limited",
					Message: fmt.Sprintf("Too many requests. Retry after %d seconds.", retryAfter),
				})
			}
			return next(c)
		}
	}
}

// extractBearerToken parses the "Authorization: Bearer <token>" header value.
// It returns an empty string if the header is absent or malformed.
func extractBearerToken(r *http.Request) string {
	h := r.Header.Get("Authorization")
	if len(h) > 7 && h[:7] == "Bearer " {
		return h[7:]
	}
	return ""
}
