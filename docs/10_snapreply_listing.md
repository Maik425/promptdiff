# SnapReply — Microns.io Listing Materials

> Prepared: 2026-03-23

---

## 1. Title

**SnapReply — AI Review Reply Generator (Go + Next.js, Deployed, 44 Signups)**

---

## 2. Description (Microns.io body)

SnapReply is a fully deployed AI SaaS that generates professional, context-aware replies to customer reviews. A business pastes a review, selects a tone (friendly, professional, apologetic, etc.), and gets a polished response in seconds — powered by the Claude API (Anthropic).

**What it does**

Customer reviews on Google, Yelp, and similar platforms demand timely, thoughtful responses. Most small business owners either ignore them or spend 10+ minutes crafting each reply. SnapReply reduces that to a few seconds. The core flow: paste review → pick tone → one-click generate → copy to clipboard.

**Tech stack**

The codebase is clean and production-ready. Backend is written in Go using the Echo web framework with a layered architecture (handler / service / repository). Frontend is Next.js (App Router) with TypeScript. Authentication uses Google OAuth. The database is PostgreSQL with structured migrations. Thirteen Playwright E2E tests all pass. The app runs on a Ubuntu VPS via systemd and nginx reverse proxy.

| Layer | Technology |
|-------|------------|
| Backend | Go + Echo |
| Frontend | Next.js 14 (TypeScript) |
| Database | PostgreSQL |
| AI | Claude API (Anthropic) |
| Auth | Google OAuth |
| Tests | Playwright E2E (13 tests) |
| Deploy | Ubuntu VPS, systemd, nginx |

**What's included in the sale**

Full source code (monorepo: `/backend` + `/frontend`), database schema and migrations, systemd + nginx deployment configuration, all 13 E2E tests, and a handoff call (30 min, optional).

**Why I'm selling**

I operate a Build & Flip model — build a solid micro-SaaS, then sell it and move on. SnapReply was product #1. I've validated the concept and shipped a production-grade stack, but I'm now focused on PromptDiff (an LLM evaluation API). I'd rather transfer this to someone who can dedicate time to growth and marketing.

**Honest status**

Pre-revenue. 44 registered users (early signups, mostly from soft launch). 20 AI generations completed. Running costs are approximately $5/month (shared VPS + DB). No paid ads have been run. The product works end-to-end and is ready for a focused owner to take it to market.

---

## 3. Asking Price

**$2,500** (negotiable)

**Reasoning:**

- Solo developer rate of ~$75/hr × 40 hours of build time = $3,000 replacement cost
- Pre-revenue products on Microns.io typically list between $1,500–$4,000
- Comparable pre-revenue Go/Next.js SaaS projects sell in the $2,000–$3,500 range
- 44 signups demonstrates real early validation and a working auth + onboarding funnel
- Price reflects honest pre-revenue status while accounting for a clean, tested, deployed codebase

A buyer is paying for ~40 hours of engineering work saved, a functioning product they can market immediately, and a proven concept in a clear niche (review management is a real pain point for local businesses).

---

## 4. What's Included

- Full source code — Go backend (Echo framework, layered architecture) + Next.js 14 frontend (TypeScript, App Router)
- PostgreSQL database schema with migrations
- Google OAuth authentication (fully wired end-to-end)
- Claude API integration (AI reply generation, configurable tone)
- 13 Playwright E2E tests, all passing
- Systemd service file (`snapreply-api`) and nginx reverse proxy config
- Docker Compose file for local development
- GitHub Actions CI/CD configuration (ready to use)
- 44 existing user records (early signups)
- 20 example AI generations in the database
- 30-minute handoff call (optional) covering architecture, deployment, and roadmap ideas

**What's NOT included:**

- No recurring revenue (pre-revenue)
- No paid advertising history or established SEO
- No custom branded domain (buyer provides their own, or negotiate transfer of current hostname)

---

## 5. Potential Improvements

**Highest impact:**

- **Chrome Extension** — Biggest opportunity. Let users reply to Google My Business / Yelp reviews directly from the review management interface without switching tabs. Extension + web app bundle would differentiate significantly.
- **Google My Business API integration** — Fetch reviews automatically and push replies back. Removes the copy-paste step entirely and unlocks a much smoother UX.
- **Subscription monetization** — Add Stripe billing with a free tier (10 replies/month) and a Pro plan ($29–$49/month) for unlimited replies. The foundation (user accounts, session management) is already in place.

**Medium impact:**

- **Multi-platform support** — Yelp, TripAdvisor, Amazon seller reviews, Trustpilot. Each is an additional wedge into new user segments.
- **White-label / agency tier** — Agencies managing 20+ client locations would pay significantly more for a multi-account dashboard.
- **Bulk reply mode** — Upload a CSV of reviews, get a CSV of AI-drafted replies. Appeals to businesses with a backlog of unanswered reviews.
- **API access** — Let reputation management platforms (BirdEye, Podium competitors) integrate SnapReply as a reply-generation microservice.

**Lower effort, quick wins:**

- SEO-optimized landing page targeting "respond to Google reviews automatically"
- ProductHunt launch (the app is ready, just needs a launch post)
- Outreach to local business owner Facebook groups / Reddit (r/smallbusiness, r/entrepreneur)
- AppSumo lifetime deal as a revenue spike + user acquisition channel

---

## 6. Screenshots Needed

Take these before submitting the listing. Aim for clean browser window, no personal data visible.

1. **Landing page** — full hero section showing the value proposition and CTA
2. **Review reply generation UI** — the main dashboard with a review pasted in, tone selector visible
3. **Generated reply example** — a realistic-looking review (e.g. a restaurant complaint) with a generated professional response shown
4. **Reply history / dashboard** — list of past generations if available, showing the app feels "alive"
5. **Code structure screenshot** — terminal showing `tree` or `ls` of the monorepo structure (demonstrates clean architecture)
6. **E2E test results** — terminal or CI screenshot showing all 13 Playwright tests passing (green)
7. **Systemd service running** — `systemctl status snapreply-api` showing `active (running)` (proves it's deployed)

---

## 7. Transfer Process

1. GitHub repository transfer to buyer's account (or zip delivery — buyer's choice)
2. PostgreSQL dump (`pg_dump snapreply`) exported and delivered securely
3. All environment variables documented (Claude API key, Google OAuth credentials — buyer provisions their own)
4. Systemd + nginx config files included in repo
5. Optional 30-minute handoff call via Google Meet or Zoom
6. Expected transfer time: **1–2 business days**

---

## 8. Microns.io Listing Fields

| Field | Value |
|-------|-------|
| Category | SaaS |
| Business model | Not yet monetized (pre-revenue) |
| Age | ~1 month |
| MRR | $0 |
| Users | 44 |
| Monthly costs | ~$5 |
| Tech | Go, Next.js, PostgreSQL, Claude API |
| Reason for selling | Portfolio management (Build & Flip) |
| Asking price | $2,500 |
| Transfer time | 1–2 days |
| Includes | Source code, DB, deployment config, tests |
