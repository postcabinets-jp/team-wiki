-- =====================================================
-- team-wiki: Seed Data (Realistic)
-- =====================================================
-- Note: This seed requires running AFTER the Supabase auth users are created.
-- For development, create these users via Supabase dashboard or auth.signUp().
-- These are placeholder UUIDs - replace with real auth user IDs.

-- For demo purposes, we'll use functions to insert data
-- that references real auth users created via the app.

-- Sample workspace data is created automatically on first login.
-- Additional seed data for testing can be inserted via the app.

-- Template pages (no user_id required, these are system templates)
CREATE TABLE IF NOT EXISTS page_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  icon TEXT,
  content JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO page_templates (name, category, icon, content) VALUES
(
  '週次ミーティング議事録',
  'meeting',
  '📋',
  '[
    {"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"週次ミーティング議事録"}]},
    {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"基本情報"}]},
    {"type":"bulletList","content":[
      {"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"日時: "}]}]},
      {"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"参加者: "}]}]},
      {"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"ファシリテーター: "}]}]}
    ]},
    {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"アジェンダ"}]},
    {"type":"bulletList","content":[
      {"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"前回のアクションアイテム確認"}]}]},
      {"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"進捗報告"}]}]},
      {"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"課題・ブロッカー共有"}]}]}
    ]},
    {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"議論内容"}]},
    {"type":"paragraph","content":[{"type":"text","text":""}]},
    {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"アクションアイテム"}]},
    {"type":"taskList","content":[
      {"type":"taskItem","attrs":{"checked":false},"content":[{"type":"paragraph","content":[{"type":"text","text":"担当者: タスク内容（期限: ）"}]}]}
    ]},
    {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"次回予定"}]},
    {"type":"paragraph","content":[{"type":"text","text":""}]}
  ]'
),
(
  'プロジェクト仕様書',
  'project',
  '📝',
  '[
    {"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"プロジェクト仕様書"}]},
    {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"概要"}]},
    {"type":"paragraph","content":[{"type":"text","text":"プロジェクトの目的と背景を記載してください。"}]},
    {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"目標"}]},
    {"type":"bulletList","content":[
      {"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"目標1: "}]}]},
      {"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"目標2: "}]}]}
    ]},
    {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"スコープ"}]},
    {"type":"heading","attrs":{"level":3},"content":[{"type":"text","text":"含むもの"}]},
    {"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":""}]}]}]},
    {"type":"heading","attrs":{"level":3},"content":[{"type":"text","text":"含まないもの"}]},
    {"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":""}]}]}]},
    {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"タイムライン"}]},
    {"type":"paragraph","content":[{"type":"text","text":""}]},
    {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"ステークホルダー"}]},
    {"type":"paragraph","content":[{"type":"text","text":""}]},
    {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"リスク"}]},
    {"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":""}]}]}]}
  ]'
),
(
  'OKR テンプレート',
  'planning',
  '🎯',
  '[
    {"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"OKR — Q{quarter} {year}"}]},
    {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Objective 1: "}]},
    {"type":"heading","attrs":{"level":3},"content":[{"type":"text","text":"Key Results"}]},
    {"type":"taskList","content":[
      {"type":"taskItem","attrs":{"checked":false},"content":[{"type":"paragraph","content":[{"type":"text","text":"KR1: "}]}]},
      {"type":"taskItem","attrs":{"checked":false},"content":[{"type":"paragraph","content":[{"type":"text","text":"KR2: "}]}]},
      {"type":"taskItem","attrs":{"checked":false},"content":[{"type":"paragraph","content":[{"type":"text","text":"KR3: "}]}]}
    ]},
    {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Objective 2: "}]},
    {"type":"heading","attrs":{"level":3},"content":[{"type":"text","text":"Key Results"}]},
    {"type":"taskList","content":[
      {"type":"taskItem","attrs":{"checked":false},"content":[{"type":"paragraph","content":[{"type":"text","text":"KR1: "}]}]},
      {"type":"taskItem","attrs":{"checked":false},"content":[{"type":"paragraph","content":[{"type":"text","text":"KR2: "}]}]}
    ]}
  ]'
),
(
  'スプリント計画',
  'agile',
  '🏃',
  '[
    {"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Sprint {number} 計画"}]},
    {"type":"paragraph","content":[{"type":"text","marks":[{"type":"bold"}],"text":"期間: "},{"type":"text","text":" "}]},
    {"type":"paragraph","content":[{"type":"text","marks":[{"type":"bold"}],"text":"スプリントゴール: "}]},
    {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"バックログ"}]},
    {"type":"taskList","content":[
      {"type":"taskItem","attrs":{"checked":false},"content":[{"type":"paragraph","content":[{"type":"text","text":"[P1] ストーリー1 (SP: )"}]}]},
      {"type":"taskItem","attrs":{"checked":false},"content":[{"type":"paragraph","content":[{"type":"text","text":"[P2] ストーリー2 (SP: )"}]}]}
    ]},
    {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"デイリースタンドアップ"}]},
    {"type":"bulletList","content":[
      {"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"昨日やったこと: "}]}]},
      {"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"今日やること: "}]}]},
      {"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"ブロッカー: "}]}]}
    ]},
    {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"レトロスペクティブ"}]},
    {"type":"heading","attrs":{"level":3},"content":[{"type":"text","text":"Good 🟢"}]},
    {"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":""}]}]}]},
    {"type":"heading","attrs":{"level":3},"content":[{"type":"text","text":"Improve 🔴"}]},
    {"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":""}]}]}]}
  ]'
),
(
  'ポストモーテム（障害報告）',
  'incident',
  '🚨',
  '[
    {"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"ポストモーテム: {インシデント名}"}]},
    {"type":"paragraph","content":[{"type":"text","marks":[{"type":"bold"}],"text":"重大度: "},{"type":"text","text":"P1 / P2 / P3"}]},
    {"type":"paragraph","content":[{"type":"text","marks":[{"type":"bold"}],"text":"発生日時: "}]},
    {"type":"paragraph","content":[{"type":"text","marks":[{"type":"bold"}],"text":"復旧日時: "}]},
    {"type":"paragraph","content":[{"type":"text","marks":[{"type":"bold"}],"text":"影響範囲: "}]},
    {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"概要"}]},
    {"type":"paragraph","content":[{"type":"text","text":"何が起きたかを3文以内で。"}]},
    {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"タイムライン"}]},
    {"type":"bulletList","content":[
      {"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"HH:MM — 異常検知"}]}]},
      {"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"HH:MM — 調査開始"}]}]},
      {"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"HH:MM — 根本原因特定"}]}]},
      {"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"HH:MM — 復旧完了"}]}]}
    ]},
    {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"根本原因"}]},
    {"type":"paragraph","content":[{"type":"text","text":""}]},
    {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"再発防止策"}]},
    {"type":"taskList","content":[
      {"type":"taskItem","attrs":{"checked":false},"content":[{"type":"paragraph","content":[{"type":"text","text":"対策1: （担当: 、期限: ）"}]}]}
    ]}
  ]'
);
