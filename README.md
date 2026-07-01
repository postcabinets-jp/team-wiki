# team-wiki

**Notionの完全OSS代替。チームWiki・ナレッジベース。**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/postcabinets-jp/team-wiki&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY&project-name=team-wiki&repository-name=team-wiki)
[![License: MIT](https://img.shields.io/badge/License-MIT-stone.svg)](https://opensource.org/licenses/MIT)

## 概要

team-wikiは、Notionの主要機能をオープンソースで再現したチームWiki・ナレッジベースです。月額$0で全機能が使えます。セルフホスト対応。

**Notionと比べたメリット:**
- AIアシスタントに追加課金なし（自前APIキーを接続）
- セルフホスト可能（Vercel + Supabase無料プランで運用可）
- ページ数・メンバー数制限なし
- 完全オープンソース（MITライセンス）

## 機能

- **ブロックエディタ** — TipTap製。見出し/箇条書き/タスクリスト/コードブロック/引用に対応
- **インラインデータベース** — テーブル・ボード・カレンダー・ギャラリービュー切り替え
- **バージョン履歴** — 編集ごとに自動保存、50世代まで保持・ワンクリックで復元
- **全文検索** — PostgreSQL FTSによるタイトル・本文横断検索
- **3層権限管理** — ワークスペース/スペース/ページ × Owner/Admin/Member/Guest
- **AIアシスタント** — OpenAI/Anthropic/Gemini APIキーを自前接続
- **ページコメント** — インラインコメント、解決済みフラグ
- **公開ページ** — ページ単位でURLシェア可能
- **RLS完全対応** — Supabase Row Level Security全テーブル適用

## スクリーンショット

> ※デプロイ後に追加予定

## クイックスタート

### 必要なもの
- Node.js 20+
- Supabaseプロジェクト（無料プラン可）
- Vercelアカウント（または任意のNext.jsホスト）

### セットアップ手順

```bash
# 1. リポジトリをクローン
git clone https://github.com/postcabinets-jp/team-wiki.git
cd team-wiki

# 2. 依存パッケージをインストール
npm install

# 3. 環境変数を設定
cp .env.example .env.local
# .env.local にSupabaseのURLとキーを記入

# 4. Supabaseにスキーマを適用
npx supabase db push --linked
# またはSupabaseダッシュボードのSQLエディタで supabase/migrations/001_initial_schema.sql を実行

# 5. 開発サーバー起動
npm run dev
```

### Vercelへのデプロイ

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/postcabinets-jp/team-wiki&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY&project-name=team-wiki&repository-name=team-wiki)

1. 上のボタンをクリック
2. Supabaseの `URL` と `anon key` を入力
3. デプロイ完了

### 環境変数

| 変数名 | 説明 | 必須 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | SupabaseプロジェクトURL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | ✅ |
| `NEXT_PUBLIC_APP_URL` | アプリのURL（OAuth用） | 推奨 |
| `RESEND_API_KEY` | メール送信（Resend） | 任意 |

## テックスタック

| レイヤー | 技術 |
|---|---|
| フロントエンド | Next.js 15 (App Router, TypeScript strict) |
| エディタ | TipTap (ProseMirror based) |
| バックエンド | Supabase (PostgreSQL + Auth + RLS + Storage) |
| スタイリング | Tailwind CSS v4 + shadcn/ui |
| 認証 | Supabase Auth (Email + Google OAuth) |
| 検索 | PostgreSQL FTS (ts_vector) |
| デプロイ | Vercel (推奨) |

## データベース設計

主要テーブル:
- `workspaces` — ワークスペース（組織単位）
- `workspace_members` — メンバーとロール
- `spaces` — チームスペース（チャンネル相当）
- `pages` — Wikiページ（ブロックJSONを保存）
- `page_versions` — バージョン履歴
- `databases` — インラインデータベース
- `database_items` — DBアイテム（レコード）
- `comments` — ページコメント

全テーブルにRLS適用済み。

## ロードマップ

- [ ] ガントチャートビュー
- [ ] リアルタイム共同編集（Yjs）
- [ ] オフラインモード（Service Worker）
- [ ] Slack/GitHub Webhook通知
- [ ] APIアクセス（OpenAPI仕様）
- [ ] Docker Compose対応（セルフホスト）
- [ ] iOS/Androidアプリ（Expo）

## コントリビューション

IssueやPRは歓迎します。大きな変更の場合はIssueで相談してください。

## ライセンス

MIT License

---

Built by [POST CABINETS](https://postcabinets.co.jp)
