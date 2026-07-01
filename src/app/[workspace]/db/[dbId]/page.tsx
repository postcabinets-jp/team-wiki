import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DatabaseViewClient } from './database-view-client'

export default async function DatabasePage({
  params,
}: {
  params: Promise<{ workspace: string; dbId: string }>
}) {
  const { workspace: slug, dbId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: db } = await supabase
    .from('databases')
    .select('*')
    .eq('id', dbId)
    .single()

  if (!db) notFound()

  const { data: items } = await supabase
    .from('database_items')
    .select('*')
    .eq('database_id', dbId)
    .is('deleted_at', null)
    .order('sort_order', { ascending: true })

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id, slug')
    .eq('slug', slug)
    .single()

  const { data: membership } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspace?.id ?? '')
    .eq('user_id', user.id)
    .single()

  const canEdit = membership?.role && ['owner', 'admin', 'member'].includes(membership.role)

  return (
    <DatabaseViewClient
      database={db}
      initialItems={items ?? []}
      canEdit={canEdit ?? false}
      userId={user.id}
      workspaceSlug={slug}
    />
  )
}
