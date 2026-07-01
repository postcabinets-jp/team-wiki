'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50)
    + '-' + Math.random().toString(36).slice(2, 6)
}

export async function createWorkspace(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const name = formData.get('name') as string
  if (!name?.trim()) return { error: 'ワークスペース名を入力してください' }

  const slug = slugify(name)

  const { data: workspace, error } = await supabase
    .from('workspaces')
    .insert({ name: name.trim(), slug, owner_id: user.id })
    .select()
    .single()

  if (error) return { error: 'ワークスペースの作成に失敗しました' }

  // Add owner as workspace member
  await supabase.from('workspace_members').insert({
    workspace_id: workspace.id,
    user_id: user.id,
    role: 'owner',
  })

  // Create default "General" space
  await supabase.from('spaces').insert({
    workspace_id: workspace.id,
    name: 'General',
    icon: '🏠',
    description: 'チーム全体の共有スペース',
    is_private: false,
    created_by: user.id,
  })

  revalidatePath('/dashboard')
  redirect(`/${workspace.slug}`)
}

export async function updateWorkspace(workspaceId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const name = formData.get('name') as string
  const icon = formData.get('icon') as string

  const { error } = await supabase
    .from('workspaces')
    .update({ name, icon })
    .eq('id', workspaceId)

  if (error) return { error: '更新に失敗しました' }

  revalidatePath(`/dashboard`)
  return { success: true }
}

export async function updateWorkspaceAI(workspaceId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const provider = formData.get('provider') as string
  const apiKey = formData.get('api_key') as string

  const { error } = await supabase
    .from('workspaces')
    .update({
      ai_provider: provider as 'openai' | 'anthropic' | 'gemini' | null,
      // In production, encrypt this key. For MVP, store as-is.
      ai_api_key_encrypted: apiKey || null,
    })
    .eq('id', workspaceId)

  if (error) return { error: '更新に失敗しました' }

  revalidatePath(`/[workspace]/settings`, 'page')
  return { success: true }
}

export async function inviteMember(workspaceId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const email = formData.get('email') as string
  const role = (formData.get('role') as string) || 'member'

  // Find user by email
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: userId } = await (supabase as any).rpc('get_user_id_by_email', { email_addr: email })
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId as string)
    .single()

  if (profileError || !profile) {
    return { error: `${email} のユーザーが見つかりません。先にアカウントを作成してもらってください。` }
  }

  const { error } = await supabase
    .from('workspace_members')
    .insert({
      workspace_id: workspaceId,
      user_id: profile.id,
      role: role as 'admin' | 'member' | 'guest',
      invited_by: user.id,
    })

  if (error) {
    if (error.code === '23505') return { error: 'このユーザーは既にメンバーです' }
    return { error: '招待に失敗しました' }
  }

  revalidatePath(`/[workspace]/settings/members`, 'page')
  return { success: true }
}

export async function removeMember(workspaceId: string, userId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('workspace_members')
    .delete()
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)

  if (error) return { error: '削除に失敗しました' }

  revalidatePath(`/[workspace]/settings/members`, 'page')
  return { success: true }
}

export async function getWorkspaceBySlug(slug: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('workspaces')
    .select('*, workspace_members(*)')
    .eq('slug', slug)
    .single()
  return data
}
