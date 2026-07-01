export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      workspaces: {
        Row: {
          id: string
          name: string
          slug: string
          icon: string | null
          owner_id: string
          ai_provider: 'openai' | 'anthropic' | 'gemini' | null
          ai_api_key_encrypted: string | null
          plan: 'free' | 'pro'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          icon?: string | null
          owner_id: string
          ai_provider?: 'openai' | 'anthropic' | 'gemini' | null
          ai_api_key_encrypted?: string | null
          plan?: 'free' | 'pro'
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          slug?: string
          icon?: string | null
          ai_provider?: 'openai' | 'anthropic' | 'gemini' | null
          ai_api_key_encrypted?: string | null
          plan?: 'free' | 'pro'
        }
        Relationships: []
      }
      workspace_members: {
        Row: {
          id: string
          workspace_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member' | 'guest'
          invited_by: string | null
          joined_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'member' | 'guest'
          invited_by?: string | null
          joined_at?: string
        }
        Update: {
          role?: 'owner' | 'admin' | 'member' | 'guest'
        }
        Relationships: []
      }
      spaces: {
        Row: {
          id: string
          workspace_id: string
          name: string
          icon: string | null
          description: string | null
          is_private: boolean
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          name: string
          icon?: string | null
          description?: string | null
          is_private?: boolean
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          icon?: string | null
          description?: string | null
          is_private?: boolean
        }
        Relationships: []
      }
      space_members: {
        Row: {
          id: string
          space_id: string
          user_id: string
          role: 'admin' | 'editor' | 'viewer'
        }
        Insert: {
          id?: string
          space_id: string
          user_id: string
          role?: 'admin' | 'editor' | 'viewer'
        }
        Update: {
          role?: 'admin' | 'editor' | 'viewer'
        }
        Relationships: []
      }
      pages: {
        Row: {
          id: string
          workspace_id: string
          space_id: string | null
          parent_page_id: string | null
          title: string
          icon: string | null
          cover_url: string | null
          content: Json
          content_text: string | null
          is_published: boolean
          published_slug: string | null
          sort_order: number
          created_by: string
          last_edited_by: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          workspace_id: string
          space_id?: string | null
          parent_page_id?: string | null
          title?: string
          icon?: string | null
          cover_url?: string | null
          content?: Json
          content_text?: string | null
          is_published?: boolean
          published_slug?: string | null
          sort_order?: number
          created_by: string
          last_edited_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          title?: string
          icon?: string | null
          cover_url?: string | null
          content?: Json
          content_text?: string | null
          is_published?: boolean
          published_slug?: string | null
          sort_order?: number
          last_edited_by?: string | null
          deleted_at?: string | null
          parent_page_id?: string | null
        }
        Relationships: []
      }
      page_versions: {
        Row: {
          id: string
          page_id: string
          content: Json
          content_text: string | null
          edited_by: string
          created_at: string
        }
        Insert: {
          id?: string
          page_id: string
          content: Json
          content_text?: string | null
          edited_by: string
          created_at?: string
        }
        Update: {
          content?: Json
          content_text?: string | null
        }
        Relationships: []
      }
      comments: {
        Row: {
          id: string
          page_id: string
          parent_comment_id: string | null
          block_id: string | null
          content: string
          resolved: boolean
          resolved_by: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          page_id: string
          parent_comment_id?: string | null
          block_id?: string | null
          content: string
          resolved?: boolean
          resolved_by?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          content?: string
          resolved?: boolean
          resolved_by?: string | null
        }
        Relationships: []
      }
      databases: {
        Row: {
          id: string
          workspace_id: string
          page_id: string | null
          name: string
          schema: Json
          default_view: 'table' | 'board' | 'calendar' | 'gallery'
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          page_id?: string | null
          name: string
          schema?: Json
          default_view?: 'table' | 'board' | 'calendar' | 'gallery'
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          schema?: Json
          default_view?: 'table' | 'board' | 'calendar' | 'gallery'
        }
        Relationships: []
      }
      database_items: {
        Row: {
          id: string
          database_id: string
          properties: Json
          sort_order: number
          created_by: string
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          database_id: string
          properties?: Json
          sort_order?: number
          created_by: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          properties?: Json
          sort_order?: number
          deleted_at?: string | null
        }
        Relationships: []
      }
      media_files: {
        Row: {
          id: string
          workspace_id: string
          page_id: string | null
          storage_path: string
          file_name: string
          mime_type: string
          size_bytes: number
          uploaded_by: string
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          page_id?: string | null
          storage_path: string
          file_name: string
          mime_type: string
          size_bytes: number
          uploaded_by: string
          created_at?: string
        }
        Update: {
          page_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
        }
        Relationships: []
      }
    }
    Views: Record<string, {
      Row: Record<string, unknown>
      Relationships: []
    }>
    Functions: {
      search_pages: {
        Args: { p_workspace_id: string; p_query: string; p_limit?: number }
        Returns: Array<{
          id: string
          title: string
          content_text: string | null
          icon: string | null
          space_id: string | null
          updated_at: string
          rank: number
        }>
      }
    }
    Enums: Record<string, string[]>
    CompositeTypes: Record<string, unknown>
  }
}

export type Workspace = Database['public']['Tables']['workspaces']['Row']
export type WorkspaceMember = Database['public']['Tables']['workspace_members']['Row']
export type Space = Database['public']['Tables']['spaces']['Row']
export type SpaceMember = Database['public']['Tables']['space_members']['Row']
export type Page = Database['public']['Tables']['pages']['Row']
export type PageVersion = Database['public']['Tables']['page_versions']['Row']
export type Comment = Database['public']['Tables']['comments']['Row']
export type DatabaseTable = Database['public']['Tables']['databases']['Row']
export type DatabaseItem = Database['public']['Tables']['database_items']['Row']
export type MediaFile = Database['public']['Tables']['media_files']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']

export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'guest'
export type SpaceRole = 'admin' | 'editor' | 'viewer'
export type DatabaseView = 'table' | 'board' | 'calendar' | 'gallery'
export type AIProvider = 'openai' | 'anthropic' | 'gemini'

export interface DatabaseColumn {
  id: string
  name: string
  type: 'text' | 'number' | 'select' | 'multi_select' | 'date' | 'checkbox' | 'person' | 'url' | 'email' | 'phone'
  options?: { id: string; name: string; color: string }[]
}

export interface BlockContent {
  type: string
  content?: BlockContent[]
  text?: string
  marks?: { type: string; attrs?: Record<string, string> }[]
  attrs?: Record<string, Json>
}
