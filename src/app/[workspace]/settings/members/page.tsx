import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MembersClient } from './members-client'

export default async function MembersPage({
  params,
}: {
  params: Promise<{ workspace: string }>
}) {
  const { workspace: slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!workspace) notFound()

  const { data: membership } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspace.id)
    .eq('user_id', user.id)
    .single()

  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    redirect(`/${slug}`)
  }

  const { data: members } = await supabase
    .from('workspace_members')
    .select('*, profiles(display_name, avatar_url)')
    .eq('workspace_id', workspace.id)
    .order('joined_at', { ascending: true })

  return (
    <div className="max-w-2xl mx-auto px-8 py-10">
      <h1 className="text-2xl font-bold text-stone-900 mb-8">メンバー管理</h1>
      <MembersClient
        workspace={workspace}
        members={(members ?? []) as unknown as Array<{ id: string; user_id: string; role: string; joined_at: string; profiles: { display_name: string | null; avatar_url: string | null } | null }>}
        currentUserId={user.id}
        userRole={membership.role as 'owner' | 'admin'}
      />
    </div>
  )
}
