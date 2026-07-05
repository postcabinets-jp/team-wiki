'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Json } from '@/types/database'
import {
  createPageSchema,
  updatePageSchema,
  deletePageSchema,
  movePageSchema,
  restorePageVersionSchema,
  searchPagesSchema,
  formatZodError,
} from '@/lib/validations'

export async function createPage(
  workspaceId: string,
  spaceId: string | null,
  parentPageId: string | null = null
) {
  const parsed = createPageSchema.safeParse({ workspaceId, spaceId, parentPageId })
  if (!parsed.success) return { error: formatZodError(parsed.error) }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: page, error } = await supabase
    .from('pages')
    .insert({
      workspace_id: parsed.data.workspaceId,
      space_id: parsed.data.spaceId,
      parent_page_id: parsed.data.parentPageId,
      title: 'Untitled',
      content: [],
      created_by: user.id,
      last_edited_by: user.id,
      sort_order: Date.now(),
    })
    .select()
    .single()

  if (error) return { error: 'ページの作成に失敗しました' }

  return { page }
}

export async function updatePage(
  pageId: string,
  updates: {
    title?: string
    content?: Json
    content_text?: string
    icon?: string | null
    cover_url?: string | null
    is_published?: boolean
    published_slug?: string | null
  }
) {
  const parsed = updatePageSchema.safeParse({ pageId, updates })
  if (!parsed.success) return { error: formatZodError(parsed.error) }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get current content for version history
  const { data: currentPage } = await supabase
    .from('pages')
    .select('content, content_text, workspace_id')
    .eq('id', parsed.data.pageId)
    .single()

  const { error } = await supabase
    .from('pages')
    .update({ ...parsed.data.updates, last_edited_by: user.id })
    .eq('id', parsed.data.pageId)

  if (error) return { error: '保存に失敗しました' }

  // Save version if content changed
  if (parsed.data.updates.content && currentPage) {
    await supabase.from('page_versions').insert({
      page_id: parsed.data.pageId,
      content: currentPage.content,
      content_text: currentPage.content_text,
      edited_by: user.id,
    })

    // Keep only last 50 versions
    const { data: versions } = await supabase
      .from('page_versions')
      .select('id')
      .eq('page_id', parsed.data.pageId)
      .order('created_at', { ascending: false })
      .range(50, 1000)

    if (versions && versions.length > 0) {
      await supabase
        .from('page_versions')
        .delete()
        .in('id', versions.map(v => v.id))
    }
  }

  return { success: true }
}

export async function deletePage(pageId: string) {
  const parsed = deletePageSchema.safeParse({ pageId })
  if (!parsed.success) return { error: formatZodError(parsed.error) }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: page } = await supabase
    .from('pages')
    .select('workspace_id')
    .eq('id', parsed.data.pageId)
    .single()

  // Soft delete
  const { error } = await supabase
    .from('pages')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', parsed.data.pageId)

  if (error) return { error: '削除に失敗しました' }

  if (page) {
    revalidatePath(`/[workspace]`, 'layout')
  }
  return { success: true }
}

export async function movePage(
  pageId: string,
  newParentId: string | null,
  newSortOrder: number
) {
  const parsed = movePageSchema.safeParse({ pageId, newParentId, newSortOrder })
  if (!parsed.success) return { error: formatZodError(parsed.error) }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('pages')
    .update({
      parent_page_id: parsed.data.newParentId,
      sort_order: parsed.data.newSortOrder,
    })
    .eq('id', parsed.data.pageId)

  if (error) return { error: '移動に失敗しました' }
  return { success: true }
}

export async function restorePageVersion(pageId: string, versionId: string) {
  const parsed = restorePageVersionSchema.safeParse({ pageId, versionId })
  if (!parsed.success) return { error: formatZodError(parsed.error) }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: version } = await supabase
    .from('page_versions')
    .select('content, content_text')
    .eq('id', parsed.data.versionId)
    .single()

  if (!version) return { error: 'バージョンが見つかりません' }

  const { error } = await supabase
    .from('pages')
    .update({
      content: version.content,
      content_text: version.content_text,
      last_edited_by: user.id,
    })
    .eq('id', parsed.data.pageId)

  if (error) return { error: '復元に失敗しました' }
  revalidatePath(`/[workspace]/wiki/${parsed.data.pageId}`, 'page')
  return { success: true }
}

export async function searchPages(workspaceId: string, query: string) {
  const parsed = searchPagesSchema.safeParse({ workspaceId, query })
  if (!parsed.success) return []

  const supabase = await createClient()

  const { data, error } = await supabase
    .rpc('search_pages', {
      p_workspace_id: parsed.data.workspaceId,
      p_query: parsed.data.query,
      p_limit: 20,
    })

  if (error) return []
  return data ?? []
}
