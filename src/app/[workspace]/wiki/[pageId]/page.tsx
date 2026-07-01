import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageEditor } from '@/components/editor/page-editor'

export async function generateMetadata({ params }: { params: Promise<{ workspace: string; pageId: string }> }) {
  const { pageId } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('pages').select('title').eq('id', pageId).single()
  return { title: `${data?.title ?? 'Untitled'} — team-wiki` }
}

export default async function WikiPageEditor({
  params,
}: {
  params: Promise<{ workspace: string; pageId: string }>
}) {
  const { workspace: slug, pageId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: page } = await supabase
    .from('pages')
    .select('*')
    .eq('id', pageId)
    .is('deleted_at', null)
    .single()

  if (!page) notFound()

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id, slug, name')
    .eq('slug', slug)
    .single()

  if (!workspace) notFound()

  const { data: membership } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspace.id)
    .eq('user_id', user.id)
    .single()

  const canEdit = membership?.role && ['owner', 'admin', 'member'].includes(membership.role)

  const { data: comments } = await supabase
    .from('comments')
    .select('*, profiles(display_name, avatar_url)')
    .eq('page_id', pageId)
    .is('parent_comment_id', null)
    .order('created_at', { ascending: true })

  type Comment = {
    id: string
    content: string
    created_at: string
    created_by: string
    profiles: { display_name: string | null; avatar_url: string | null } | null
  }

  return (
    <PageEditor
      page={page}
      workspaceSlug={slug}
      workspaceId={workspace.id}
      canEdit={canEdit ?? false}
      userId={user.id}
      comments={(comments ?? []) as unknown as Comment[]}
    />
  )
}
