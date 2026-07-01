import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PageHistoryClient } from './history-client'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

export default async function PageHistoryPage({
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
    .select('id, title, icon, workspace_id')
    .eq('id', pageId)
    .single()

  if (!page) notFound()

  const { data: versions } = await supabase
    .from('page_versions')
    .select('*, profiles(display_name)')
    .eq('page_id', pageId)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="max-w-3xl mx-auto px-8 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Link
          href={`/${slug}/wiki/${pageId}`}
          className="text-sm text-stone-500 hover:text-stone-900"
        >
          ← {page.icon} {page.title}
        </Link>
        <span className="text-stone-300">/</span>
        <h1 className="text-xl font-bold text-stone-900">バージョン履歴</h1>
      </div>

      {(!versions || versions.length === 0) ? (
        <div className="text-center py-16 bg-white rounded-xl border border-stone-200">
          <p className="text-stone-500 text-sm">バージョン履歴がありません</p>
          <p className="text-stone-400 text-xs mt-1">ページを編集すると自動的にバージョンが保存されます</p>
        </div>
      ) : (
        <div className="space-y-2">
          {versions.map((version, i) => (
            <PageHistoryClient
              key={version.id}
              version={version as unknown as { id: string; created_at: string; content_text: string | null; profiles: { display_name: string | null } | null }}
              pageId={pageId}
              workspaceSlug={slug}
              isLatest={i === 0}
            />
          ))}
        </div>
      )}
    </div>
  )
}
