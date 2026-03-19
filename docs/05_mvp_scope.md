# MVP Scope

## Goal

Ship a working API in 2 weeks that lets you compare prompt outputs across 3 LLM providers.

## MVP Features (Must Have)

### API Endpoint

```
POST /v1/compare
```

**Request:**
```json
{
  "prompt": "Summarize this article in 2 sentences",
  "input": "Article text here...",
  "models": ["claude-sonnet-4-6", "gpt-4o", "gemini-2.0-flash"],
  "options": {
    "temperature": 0.7,
    "max_tokens": 500
  }
}
```

**Response:**
```json
{
  "id": "eval_abc123",
  "created_at": "2026-03-20T10:00:00Z",
  "results": [
    {
      "model": "claude-sonnet-4-6",
      "provider": "anthropic",
      "output": "The article discusses...",
      "latency_ms": 1200,
      "tokens": {"input": 450, "output": 82, "total": 532},
      "cost_usd": 0.0034,
      "error": null
    },
    {
      "model": "gpt-4o",
      "provider": "openai",
      "output": "This piece covers...",
      "latency_ms": 980,
      "tokens": {"input": 448, "output": 76, "total": 524},
      "cost_usd": 0.0028,
      "error": null
    },
    {
      "model": "gemini-2.0-flash",
      "provider": "google",
      "output": "The article explains...",
      "latency_ms": 650,
      "tokens": {"input": 445, "output": 70, "total": 515},
      "cost_usd": 0.0002,
      "error": null
    }
  ],
  "meta": {
    "total_cost_usd": 0.0064,
    "fastest_model": "gemini-2.0-flash",
    "cheapest_model": "gemini-2.0-flash"
  }
}
```

### Supported Models (MVP)

| Provider | Models |
|----------|--------|
| Anthropic | claude-sonnet-4-6, claude-haiku-4-5 |
| OpenAI | gpt-4o, gpt-4o-mini |
| Google | gemini-2.0-flash, gemini-2.0-pro |

### Auth

- API key based (`Authorization: Bearer pd_xxx`)
- Keys generated via simple signup (email + password)
- Free tier: 100 evals/month (no credit card)

### Other MVP Endpoints

```
GET  /v1/models          # List supported models + pricing
GET  /v1/evals           # List past evals (paginated)
GET  /v1/evals/:id       # Get single eval result
GET  /v1/usage           # Current month usage + remaining quota
POST /v1/auth/signup     # Create account
POST /v1/auth/login      # Get API key
```

### Dashboard (Next.js)

ランディングページとダッシュボードを同一Next.jsアプリで提供。

**ページ構成:**

```
/                    # ランディングページ（LP）
/docs                # APIドキュメント
/login               # ログイン
/signup              # サインアップ
/dashboard           # ダッシュボードトップ（使用量サマリ）
/dashboard/playground # ブラウザからeval実行（フォーム）
/dashboard/evals     # eval履歴一覧
/dashboard/evals/:id # eval結果詳細（横並び比較ビュー）
/dashboard/keys      # APIキー管理
/dashboard/settings  # アカウント設定 / プラン
```

**Playground画面 (MVP最重要UI):**
- プロンプト入力テキストエリア
- モデル選択チェックボックス（デフォルト3つON）
- "Compare" ボタン → リアルタイムでストリーミング表示
- 結果: カード横並び（モデル名 / 出力 / レイテンシ / コスト）

**Eval詳細画面:**
- 3カラム横並び比較ビュー
- 各モデル: 出力テキスト + メタデータ（tokens, cost, latency）
- 上部にサマリバー（fastest / cheapest / 自動ハイライト）

**ダッシュボードトップ:**
- 今月のeval数 / 残りクォータ
- 直近のevals 5件
- 月間コスト推移（簡易グラフ）

### Docs (in-app)

`/docs` 以下に組み込み。別サイト不要。

```
/docs                    # Overview + Quickstart
/docs/api-reference      # 全エンドポイント仕様
/docs/models             # 対応モデル一覧 + 料金表
/docs/examples           # ユースケース別コード例
/docs/sdks               # SDK（Post-MVP）
```

## NOT in MVP (Post-Launch)

- Auto-scoring / rubric-based evaluation
- Structured output / tool_use comparison
- CI/CD integration (GitHub Actions)
- Team features / shared workspaces
- Async mode with webhooks
- Custom model endpoints (self-hosted LLMs)
- Python/TypeScript SDK (use curl/fetch for MVP)

## Architecture (MVP)

```
Browser / curl / SDK
  ↓
Caddy (reverse proxy, auto HTTPS)
  ├→ /api/*  → Go API (Echo) :8082
  │             ├→ Anthropic API
  │             ├→ OpenAI API       (parallel goroutines)
  │             └→ Google AI API
  │             ↓
  │           PostgreSQL (evals, users, usage)
  │
  └→ /*      → Next.js (Dashboard + Docs + LP) :3000
```

## Deploy

- VPS ($10/month) — same Vultr instance (104.156.238.81)
- PostgreSQL — `promptdiff` DB on eastflow-db (Docker)
- Reverse proxy: nginx + Let's Encrypt
  - `promptdiff.bizmarq.com/api/*` → Go API (:8082)
  - `promptdiff.bizmarq.com/*` → Next.js (:3000)
- Domain: promptdiff.bizmarq.com (Cloudflare DNS)
- systemd: `promptdiff.service` (auto-restart)

## Timeline

| Day | Deliverable |
|-----|------------|
| Day 1-2 | Go API scaffold, DB schema, auth (signup/login/API key) |
| Day 3-4 | LLM routing (Anthropic/OpenAI/Google並列), /v1/compare |
| Day 5-6 | Usage tracking, rate limiting, /v1/evals, /v1/models |
| Day 7-8 | Next.js: LP, signup/login, dashboard skeleton |
| Day 9-10 | Playground UI (フォーム→eval実行→横並び比較表示) |
| Day 11-12 | Eval履歴, API key管理, 使用量ダッシュボード |
| Day 13 | Docs (/docs, API reference, quickstart, examples) |
| Day 14 | Deploy to VPS, ドメイン設定, 最終テスト |
| Day 15+ | X投稿 (BIP), Product Hunt prep, 最初のユーザー獲得 |

## Success Criteria (90 days)

- [ ] 50+ API signups
- [ ] 10+ active users (at least 1 eval/week)
- [ ] $100+ MRR
- [ ] If criteria not met → list on Microns.io / Flippa
