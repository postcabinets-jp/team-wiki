-- =====================================================
-- team-wiki: Initial Schema v1.0
-- =====================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- Profiles (extends auth.users)
-- =====================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (id = auth.uid());

-- =====================================================
-- Workspaces
-- =====================================================
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ai_provider TEXT CHECK (ai_provider IN ('openai', 'anthropic', 'gemini')),
  ai_api_key_encrypted TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_select" ON workspaces
  FOR SELECT USING (
    owner_id = auth.uid() OR
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_id = workspaces.id AND user_id = auth.uid())
  );

CREATE POLICY "workspace_insert" ON workspaces
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "workspace_update" ON workspaces
  FOR UPDATE USING (
    owner_id = auth.uid() OR
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_id = workspaces.id AND user_id = auth.uid() AND role IN ('owner','admin'))
  );

CREATE POLICY "workspace_delete" ON workspaces
  FOR DELETE USING (owner_id = auth.uid());

-- =====================================================
-- Workspace Members
-- =====================================================
CREATE TABLE workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'guest')),
  invited_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, user_id)
);

ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wm_select" ON workspace_members
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM workspace_members wm2 WHERE wm2.workspace_id = workspace_members.workspace_id AND wm2.user_id = auth.uid())
  );

CREATE POLICY "wm_insert" ON workspace_members
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_id = workspace_members.workspace_id AND user_id = auth.uid() AND role IN ('owner','admin'))
    OR EXISTS (SELECT 1 FROM workspaces WHERE id = workspace_members.workspace_id AND owner_id = auth.uid())
  );

CREATE POLICY "wm_update" ON workspace_members
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM workspaces WHERE id = workspace_members.workspace_id AND owner_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM workspace_members wm2 WHERE wm2.workspace_id = workspace_members.workspace_id AND wm2.user_id = auth.uid() AND wm2.role IN ('owner','admin'))
  );

CREATE POLICY "wm_delete" ON workspace_members
  FOR DELETE USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM workspaces WHERE id = workspace_members.workspace_id AND owner_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM workspace_members wm2 WHERE wm2.workspace_id = workspace_members.workspace_id AND wm2.user_id = auth.uid() AND wm2.role IN ('owner','admin'))
  );

-- =====================================================
-- Spaces
-- =====================================================
CREATE TABLE spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT,
  description TEXT,
  is_private BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "space_select" ON spaces
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_id = spaces.workspace_id AND user_id = auth.uid())
    AND (
      NOT is_private OR
      created_by = auth.uid() OR
      EXISTS (SELECT 1 FROM space_members WHERE space_id = spaces.id AND user_id = auth.uid()) OR
      EXISTS (SELECT 1 FROM workspace_members WHERE workspace_id = spaces.workspace_id AND user_id = auth.uid() AND role IN ('owner','admin'))
    )
  );

CREATE POLICY "space_insert" ON spaces
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_id = spaces.workspace_id AND user_id = auth.uid() AND role IN ('owner','admin','member'))
  );

CREATE POLICY "space_update" ON spaces
  FOR UPDATE USING (
    created_by = auth.uid() OR
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_id = spaces.workspace_id AND user_id = auth.uid() AND role IN ('owner','admin')) OR
    EXISTS (SELECT 1 FROM space_members WHERE space_id = spaces.id AND user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "space_delete" ON spaces
  FOR DELETE USING (
    created_by = auth.uid() OR
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_id = spaces.workspace_id AND user_id = auth.uid() AND role IN ('owner','admin'))
  );

-- =====================================================
-- Space Members
-- =====================================================
CREATE TABLE space_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor', 'viewer')),
  UNIQUE(space_id, user_id)
);

ALTER TABLE space_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sm_select" ON space_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM spaces s
      JOIN workspace_members wm ON wm.workspace_id = s.workspace_id
      WHERE s.id = space_members.space_id AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "sm_insert" ON space_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM spaces s
      JOIN workspace_members wm ON wm.workspace_id = s.workspace_id
      WHERE s.id = space_members.space_id AND wm.user_id = auth.uid() AND wm.role IN ('owner','admin')
    ) OR
    EXISTS (SELECT 1 FROM space_members WHERE space_id = space_members.space_id AND user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "sm_delete" ON space_members
  FOR DELETE USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM spaces s
      JOIN workspace_members wm ON wm.workspace_id = s.workspace_id
      WHERE s.id = space_members.space_id AND wm.user_id = auth.uid() AND wm.role IN ('owner','admin')
    )
  );

-- =====================================================
-- Pages
-- =====================================================
CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  space_id UUID REFERENCES spaces(id) ON DELETE SET NULL,
  parent_page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled',
  icon TEXT,
  cover_url TEXT,
  content JSONB NOT NULL DEFAULT '[]',
  content_text TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_slug TEXT UNIQUE,
  sort_order FLOAT NOT NULL DEFAULT 0,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  last_edited_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_pages_workspace ON pages(workspace_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_pages_parent ON pages(parent_page_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_pages_space ON pages(space_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_pages_fts ON pages USING gin(
  to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(content_text,''))
);

CREATE POLICY "page_select" ON pages
  FOR SELECT USING (
    deleted_at IS NULL AND (
      is_published OR
      EXISTS (SELECT 1 FROM workspace_members WHERE workspace_id = pages.workspace_id AND user_id = auth.uid())
    )
  );

CREATE POLICY "page_insert" ON pages
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_id = pages.workspace_id AND user_id = auth.uid() AND role IN ('owner','admin','member'))
  );

CREATE POLICY "page_update" ON pages
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_id = pages.workspace_id AND user_id = auth.uid() AND role IN ('owner','admin','member'))
  );

-- =====================================================
-- Page Versions
-- =====================================================
CREATE TABLE page_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  content_text TEXT,
  edited_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE page_versions ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_page_versions_page ON page_versions(page_id, created_at DESC);

CREATE POLICY "pv_select" ON page_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pages p
      JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
      WHERE p.id = page_versions.page_id AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "pv_insert" ON page_versions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM pages p
      JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
      WHERE p.id = page_versions.page_id AND wm.user_id = auth.uid() AND wm.role IN ('owner','admin','member')
    )
  );

-- =====================================================
-- Comments
-- =====================================================
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  block_id TEXT,
  content TEXT NOT NULL,
  resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_by UUID REFERENCES auth.users(id),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comment_select" ON comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pages p
      JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
      WHERE p.id = comments.page_id AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "comment_insert" ON comments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM pages p
      JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
      WHERE p.id = comments.page_id AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "comment_update" ON comments
  FOR UPDATE USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM pages p
      JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
      WHERE p.id = comments.page_id AND wm.user_id = auth.uid() AND wm.role IN ('owner','admin')
    )
  );

CREATE POLICY "comment_delete" ON comments
  FOR DELETE USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM pages p
      JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
      WHERE p.id = comments.page_id AND wm.user_id = auth.uid() AND wm.role IN ('owner','admin')
    )
  );

-- =====================================================
-- Databases (Inline DB)
-- =====================================================
CREATE TABLE databases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  schema JSONB NOT NULL DEFAULT '[]',
  default_view TEXT NOT NULL DEFAULT 'table' CHECK (default_view IN ('table','board','calendar','gallery')),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE databases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "db_select" ON databases
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_id = databases.workspace_id AND user_id = auth.uid())
  );

CREATE POLICY "db_insert" ON databases
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_id = databases.workspace_id AND user_id = auth.uid() AND role IN ('owner','admin','member'))
  );

CREATE POLICY "db_update" ON databases
  FOR UPDATE USING (
    created_by = auth.uid() OR
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_id = databases.workspace_id AND user_id = auth.uid() AND role IN ('owner','admin'))
  );

CREATE POLICY "db_delete" ON databases
  FOR DELETE USING (
    created_by = auth.uid() OR
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_id = databases.workspace_id AND user_id = auth.uid() AND role IN ('owner','admin'))
  );

-- =====================================================
-- Database Items
-- =====================================================
CREATE TABLE database_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  database_id UUID NOT NULL REFERENCES databases(id) ON DELETE CASCADE,
  properties JSONB NOT NULL DEFAULT '{}',
  sort_order FLOAT NOT NULL DEFAULT 0,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

ALTER TABLE database_items ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_db_items_database ON database_items(database_id) WHERE deleted_at IS NULL;

CREATE POLICY "dbi_select" ON database_items
  FOR SELECT USING (
    deleted_at IS NULL AND
    EXISTS (
      SELECT 1 FROM databases d
      JOIN workspace_members wm ON wm.workspace_id = d.workspace_id
      WHERE d.id = database_items.database_id AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "dbi_insert" ON database_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM databases d
      JOIN workspace_members wm ON wm.workspace_id = d.workspace_id
      WHERE d.id = database_items.database_id AND wm.user_id = auth.uid() AND wm.role IN ('owner','admin','member')
    )
  );

CREATE POLICY "dbi_update" ON database_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM databases d
      JOIN workspace_members wm ON wm.workspace_id = d.workspace_id
      WHERE d.id = database_items.database_id AND wm.user_id = auth.uid() AND wm.role IN ('owner','admin','member')
    )
  );

-- =====================================================
-- Media Files
-- =====================================================
CREATE TABLE media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  page_id UUID REFERENCES pages(id) ON DELETE SET NULL,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "media_select" ON media_files
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_id = media_files.workspace_id AND user_id = auth.uid())
  );

CREATE POLICY "media_insert" ON media_files
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_id = media_files.workspace_id AND user_id = auth.uid())
  );

CREATE POLICY "media_delete" ON media_files
  FOR DELETE USING (
    uploaded_by = auth.uid() OR
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_id = media_files.workspace_id AND user_id = auth.uid() AND role IN ('owner','admin'))
  );

-- =====================================================
-- Functions & Triggers
-- =====================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER workspaces_updated_at BEFORE UPDATE ON workspaces FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER spaces_updated_at BEFORE UPDATE ON spaces FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER pages_updated_at BEFORE UPDATE ON pages FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER databases_updated_at BEFORE UPDATE ON databases FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER database_items_updated_at BEFORE UPDATE ON database_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Full-text search function
CREATE OR REPLACE FUNCTION search_pages(
  p_workspace_id UUID,
  p_query TEXT,
  p_limit INT DEFAULT 20
)
RETURNS TABLE(
  id UUID,
  title TEXT,
  content_text TEXT,
  icon TEXT,
  space_id UUID,
  updated_at TIMESTAMPTZ,
  rank FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.title,
    p.content_text,
    p.icon,
    p.space_id,
    p.updated_at,
    ts_rank(
      to_tsvector('simple', coalesce(p.title,'') || ' ' || coalesce(p.content_text,'')),
      plainto_tsquery('simple', p_query)
    ) AS rank
  FROM pages p
  WHERE
    p.workspace_id = p_workspace_id
    AND p.deleted_at IS NULL
    AND (
      to_tsvector('simple', coalesce(p.title,'') || ' ' || coalesce(p.content_text,''))
      @@ plainto_tsquery('simple', p_query)
      OR p.title ILIKE '%' || p_query || '%'
    )
  ORDER BY rank DESC, p.updated_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
