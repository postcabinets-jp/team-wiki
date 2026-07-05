'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { DatabaseColumn, Json } from '@/types/database'
import {
  createDatabaseSchema,
  updateDatabaseSchemaSchema,
  createDatabaseItemSchema,
  updateDatabaseItemSchema,
  deleteDatabaseItemSchema,
  updateDatabaseViewSchema,
  formatZodError,
} from '@/lib/validations'

export async function createDatabase(
  workspaceId: string,
  name: string,
  pageId?: string
) {
  const parsed = createDatabaseSchema.safeParse({ workspaceId, name, pageId })
  if (!parsed.success) return { error: formatZodError(parsed.error) }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const defaultSchema: DatabaseColumn[] = [
    { id: 'name', name: '名前', type: 'text' },
    { id: 'status', name: 'ステータス', type: 'select', options: [
      { id: 'todo', name: 'ToDo', color: 'gray' },
      { id: 'in_progress', name: '進行中', color: 'blue' },
      { id: 'done', name: '完了', color: 'green' },
    ]},
    { id: 'assignee', name: '担当者', type: 'person' },
    { id: 'due_date', name: '期限', type: 'date' },
  ]

  const { data, error } = await supabase
    .from('databases')
    .insert({
      workspace_id: parsed.data.workspaceId,
      page_id: parsed.data.pageId ?? null,
      name: parsed.data.name,
      schema: defaultSchema as unknown as Json,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) return { error: 'データベースの作成に失敗しました' }
  return { database: data }
}

export async function updateDatabaseSchema(
  databaseId: string,
  schema: DatabaseColumn[]
) {
  const parsed = updateDatabaseSchemaSchema.safeParse({ databaseId, schema })
  if (!parsed.success) return { error: formatZodError(parsed.error) }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('databases')
    .update({ schema: parsed.data.schema as unknown as Json })
    .eq('id', parsed.data.databaseId)

  if (error) return { error: '更新に失敗しました' }
  return { success: true }
}

export async function createDatabaseItem(
  databaseId: string,
  properties: Record<string, Json>
) {
  const parsed = createDatabaseItemSchema.safeParse({ databaseId, properties })
  if (!parsed.success) return { error: formatZodError(parsed.error) }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data, error } = await supabase
    .from('database_items')
    .insert({
      database_id: parsed.data.databaseId,
      properties: parsed.data.properties,
      sort_order: Date.now(),
      created_by: user.id,
    })
    .select()
    .single()

  if (error) return { error: 'アイテムの作成に失敗しました' }
  return { item: data }
}

export async function updateDatabaseItem(
  itemId: string,
  properties: Record<string, Json>
) {
  const parsed = updateDatabaseItemSchema.safeParse({ itemId, properties })
  if (!parsed.success) return { error: formatZodError(parsed.error) }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('database_items')
    .update({ properties: parsed.data.properties })
    .eq('id', parsed.data.itemId)

  if (error) return { error: '更新に失敗しました' }
  return { success: true }
}

export async function deleteDatabaseItem(itemId: string) {
  const parsed = deleteDatabaseItemSchema.safeParse({ itemId })
  if (!parsed.success) return { error: formatZodError(parsed.error) }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('database_items')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', parsed.data.itemId)

  if (error) return { error: '削除に失敗しました' }
  return { success: true }
}

export async function updateDatabaseView(
  databaseId: string,
  view: 'table' | 'board' | 'calendar' | 'gallery'
) {
  const parsed = updateDatabaseViewSchema.safeParse({ databaseId, view })
  if (!parsed.success) return { error: formatZodError(parsed.error) }

  const supabase = await createClient()

  const { error } = await supabase
    .from('databases')
    .update({ default_view: parsed.data.view })
    .eq('id', parsed.data.databaseId)

  if (error) return { error: '更新に失敗しました' }
  revalidatePath(`/[workspace]/db/${parsed.data.databaseId}`, 'page')
  return { success: true }
}
