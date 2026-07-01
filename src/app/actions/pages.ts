'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Json } from '@/types/database'

export async function createPage(
  workspaceId: string,
  spaceId: string | null,
  parentPageId: string | null = null
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: page, error } = await supabase
    .from('pages')
    .insert({
      workspace_id: workspaceId,
      space_id: spaceId,
      parent_page_id: parentPageId,
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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get current content for version history
  const { data: currentPage } = await supabase
    .from('pages')
    .select('content, content_text, workspace_id')
    .eq('id', pageId)
    .single()

  const { error } = await supabase
    .from('pages')
    .update({ ...updates, last_edited_by: user.id })
    .eq('id', pageId)

  if (error) return { error: '保存に失敗しました' }

  // Save version if content changed
  if (updates.content && currentPage) {
    await supabase.from('page_versions').insert({
      page_id: pageId,
      content: currentPage.content,
      content_text: currentPage.content_text,
      edited_by: user.id,
    })

    // Keep only last 50 versions
    const { data: versions } = await supabase
      .from('page_versions')
      .select('id')
      .eq('page_id', pageId)
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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: page } = await supabase
    .from('pages')
    .select('workspace_id')
    .eq('id', pageId)
    .single()

  // Soft delete
  const { error } = await supabase
    .from('pages')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', pageId)

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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('pages')
    .update({
      parent_page_id: newParentId,
      sort_order: newSortOrder,
    })
    .eq('id', pageId)

  if (error) return { error: '移動に失敗しました' }
  return { success: true }
}

export async function restorePageVersion(pageId: string, versionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: version } = await supabase
    .from('page_versions')
    .select('content, content_text')
    .eq('id', versionId)
    .single()

  if (!version) return { error: 'バージョンが見つかりません' }

  const { error } = await supabase
    .from('pages')
    .update({
      content: version.content,
      content_text: version.content_text,
      last_edited_by: user.id,
    })
    .eq('id', pageId)

  if (error) return { error: '復元に失敗しました' }
  revalidatePath(`/[workspace]/wiki/${pageId}`, 'page')
  return { success: true }
}

export async function searchPages(workspaceId: string, query: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .rpc('search_pages', {
      p_workspace_id: workspaceId,
      p_query: query,
      p_limit: 20,
    })

  if (error) return []
  return data ?? []
}
