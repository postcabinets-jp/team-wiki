import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { WorkspaceSidebar } from '@/components/layout/workspace-sidebar'

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode
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

  // Verify membership
  const { data: membership } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspace.id)
    .eq('user_id', user.id)
    .single()

  if (!membership) notFound()

  // Get spaces
  const { data: spaces } = await supabase
    .from('spaces')
    .select('*')
    .eq('workspace_id', workspace.id)
    .order('created_at', { ascending: true })

  // Get recent pages
  const { data: recentPages } = await supabase
    .from('pages')
    .select('id, title, icon, space_id, updated_at')
    .eq('workspace_id', workspace.id)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })
    .limit(20)

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex h-screen bg-stone-50 overflow-hidden">
      <WorkspaceSidebar
        workspace={workspace}
        spaces={spaces ?? []}
        recentPages={recentPages ?? []}
        userRole={membership.role}
        profile={profile}
        userId={user.id}
      />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
