# Dashboard Design

## Principles

1. **API-first, Dashboard-second**: ダッシュボードはAPIの可視化レイヤー。全機能はAPI経由でも使える
2. **Playground が主役**: 初回体験 = Playgroundでeval実行 → 結果の横並び比較 → 感動 → API keyコピー
3. **最小UI**: ページ数を絞る。設定画面よりPlaygroundに時間を使う

## Page Structure

```
promptdiff.dev/
├── /                        # LP (未ログイン)
├── /login                   # ログイン
├── /signup                  # サインアップ (email + password)
├── /docs                    # ドキュメント (誰でもアクセス可)
│   ├── /docs/api-reference
│   ├── /docs/models
│   └── /docs/examples
├── /dashboard               # ダッシュボードトップ (要ログイン)
│   ├── /dashboard/playground # eval実行
│   ├── /dashboard/evals     # 履歴一覧
│   ├── /dashboard/evals/:id # 結果詳細
│   ├── /dashboard/keys      # APIキー管理
│   └── /dashboard/settings  # アカウント / プラン
```

## Screen Details

### Landing Page `/`

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo] PromptDiff                     [Docs] [Login] [CTA] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│       Compare LLM outputs across models.                    │
│       One API call.                                         │
│                                                             │
│       [Get Started Free]    [View Docs]                     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Interactive demo: 入力 → Compare → 結果アニメ       │    │
│  │  (実際のAPI呼び出し、ただし匿名で1日3回まで)          │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│  How it works     │  Pricing          │  Supported Models   │
│  1. POST prompt   │  Free: 100/mo     │  Claude Sonnet/Haiku│
│  2. Pick models   │  Pro: $29/mo      │  GPT-4o / 4o-mini   │
│  3. Get results   │  Scale: $99/mo    │  Gemini Flash / Pro  │
├─────────────────────────────────────────────────────────────┤
│  curl example (コピーボタン付き)                              │
├─────────────────────────────────────────────────────────────┤
│  Footer: GitHub │ Twitter │ Docs │ Status                    │
└─────────────────────────────────────────────────────────────┘
```

Key: LPにインタラクティブデモを置く。サインアップ前に価値を体感させる。

### Playground `/dashboard/playground`

```
┌─────────────────────────────────────────────────────────────┐
│  [Sidebar]  │  Playground                                    │
│             │                                                │
│  Dashboard  │  Prompt:                                       │
│  Playground │  ┌─────────────────────────────────────────┐   │
│  History    │  │ Summarize this article in 2 sentences   │   │
│  API Keys   │  │                                         │   │
│  Settings   │  └─────────────────────────────────────────┘   │
│             │                                                │
│             │  Input (optional):                              │
│             │  ┌─────────────────────────────────────────┐   │
│             │  │ Article text here...                     │   │
│             │  └─────────────────────────────────────────┘   │
│             │                                                │
│             │  Models:                                        │
│             │  [x] Claude Sonnet  [x] GPT-4o  [x] Gemini    │
│             │  [ ] Claude Haiku   [ ] GPT-4o-mini  [ ] Pro   │
│             │                                                │
│             │  Options: Temp [0.7▾]  Max tokens [500▾]       │
│             │                                                │
│             │  [ Compare ] ─── $0.004 estimated cost         │
│             │                                                │
│             ├────────────────────────────────────────────────│
│             │                                                │
│             │  ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│             │  │Claude    │ │GPT-4o    │ │Gemini    │       │
│             │  │Sonnet    │ │          │ │Flash     │       │
│             │  │          │ │          │ │          │       │
│             │  │"The      │ │"This     │ │"The      │       │
│             │  │ article  │ │ piece    │ │ article  │       │
│             │  │ discuss- │ │ covers   │ │ explains │       │
│             │  │ es..."   │ │ ..."     │ │ ..."     │       │
│             │  │          │ │          │ │          │       │
│             │  │1200ms    │ │980ms     │ │650ms ★   │       │
│             │  │$0.0034   │ │$0.0028   │ │$0.0002 ★ │       │
│             │  │532 tok   │ │524 tok   │ │515 tok ★ │       │
│             │  └──────────┘ └──────────┘ └──────────┘       │
│             │                                                │
│             │  Summary: Gemini fastest & cheapest.            │
│             │           Claude highest quality (subjective).  │
│             │                                                │
│             │  [Copy as JSON]  [Copy curl]  [Save to History] │
└─────────────────────────────────────────────────────────────┘
```

Key features:
- 結果はカード横並び。最速/最安に★マーク
- コスト事前見積もり（Compare押す前に表示）
- Copy as JSON / Copy curl ボタンでAPIへの移行が簡単
- ストリーミング表示（モデルごとに順次表示）

### Eval Detail `/dashboard/evals/:id`

```
┌─────────────────────────────────────────────────────────────┐
│  [Sidebar]  │  Eval #eval_abc123                    [Share]  │
│             │  2026-03-20 10:00:00 JST                       │
│             │                                                │
│             │  Prompt: "Summarize this article in 2..."      │
│             │  Input: "Article text..." [expand]              │
│             │                                                │
│             │  ┌─────────────── Summary Bar ─────────────┐   │
│             │  │ Fastest: Gemini (650ms)                  │   │
│             │  │ Cheapest: Gemini ($0.0002)               │   │
│             │  │ Total cost: $0.0064                      │   │
│             │  └─────────────────────────────────────────┘   │
│             │                                                │
│             │  [比較ビュー / テーブルビュー] toggle            │
│             │                                                │
│             │  ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│             │  │ (横並びカード - Playgroundと同じ)         │       │
│             │  └──────────┘ └──────────┘ └──────────┘       │
│             │                                                │
│             │  [Re-run]  [Copy curl]  [Delete]                │
└─────────────────────────────────────────────────────────────┘
```

### Dashboard Top `/dashboard`

```
┌─────────────────────────────────────────────────────────────┐
│  [Sidebar]  │  Dashboard                                     │
│             │                                                │
│             │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐  │
│             │  │ 47/100 │ │ $0.19  │ │ 12     │ │ Free   │  │
│             │  │ evals  │ │ cost   │ │ today  │ │ plan   │  │
│             │  │ this mo│ │ this mo│ │        │ │[Upgrade]│  │
│             │  └────────┘ └────────┘ └────────┘ └────────┘  │
│             │                                                │
│             │  Recent Evals                                   │
│             │  ┌─────────────────────────────────────────┐   │
│             │  │ eval_abc123 │ 3 models │ $0.006 │ 2h ago│   │
│             │  │ eval_def456 │ 2 models │ $0.003 │ 5h ago│   │
│             │  │ eval_ghi789 │ 3 models │ $0.006 │ 1d ago│   │
│             │  └─────────────────────────────────────────┘   │
│             │                                                │
│             │  [Go to Playground]                              │
└─────────────────────────────────────────────────────────────┘
```

## Design System (MVP)

- **UI Framework**: shadcn/ui (Tailwind CSS)
- **Colors**:
  - Primary: `#7c6aef` (purple)
  - Background: `#f8f7ff` (light lavender)
  - Dark: `#1a1a2e`
  - Text: `#1a1a2e`
- **Font**: Inter (sans-serif), JetBrains Mono (code)
- **Layout**: サイドバー固定 + メインコンテンツスクロール
- **Responsive**: Desktop-first（開発者ツールなのでモバイルは最小限）

## Auth Flow

```
1. GET /signup → email + password 入力
2. POST /v1/auth/signup → アカウント作成 + API key 自動発行
3. Redirect → /dashboard/playground (初回は Playground に直行)
4. Playground でまず1回 eval させる (onboarding)
5. API key は /dashboard/keys でいつでもコピー可能
```

## Tech Details

- Next.js 14+ App Router
- Server Components (LP, Docs)
- Client Components (Playground, Dashboard)
- API calls: Go backend `/api/*` に fetch
- Auth: JWT token (httpOnly cookie)
- State: React Query (TanStack Query) for API data
