import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import { FileText, Clock } from 'lucide-react'

export default async function WorkspaceHomePage({
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

  if (!workspace) redirect('/dashboard')

  const { data: recentPages } = await supabase
    .from('pages')
    .select('id, title, icon, space_id, created_by, updated_at, spaces(name)')
    .eq('workspace_id', workspace.id)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })
    .limit(12)

  const { data: memberCount } = await supabase
    .from('workspace_members')
    .select('id', { count: 'exact' })
    .eq('workspace_id', workspace.id)

  const { data: pageCount } = await supabase
    .from('pages')
    .select('id', { count: 'exact' })
    .eq('workspace_id', workspace.id)
    .is('deleted_at', null)

  return (
    <div className="max-w-4xl mx-auto px-8 py-10">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">{workspace.icon ?? '📁'}</span>
          <h1 className="text-3xl font-bold text-stone-900">{workspace.name}</h1>
        </div>
        <div className="flex items-center gap-6 text-sm text-stone-400 mt-2">
          <span>{memberCount?.length ?? 0} メンバー</span>
          <span>{pageCount?.length ?? 0} ページ</span>
        </div>
      </div>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-stone-400" />
          <h2 className="text-sm font-semibold text-stone-600 uppercase tracking-wider">最近のページ</h2>
        </div>

        {(!recentPages || recentPages.length === 0) ? (
          <div className="text-center py-16 bg-white rounded-xl border border-stone-200">
            <FileText className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500 text-sm">まだページがありません</p>
            <p className="text-stone-400 text-xs mt-1">サイドバーの「新規ページ」からページを作成してください</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentPages.map((page) => (
              <Link
                key={page.id}
                href={`/${slug}/wiki/${page.id}`}
                className="bg-white rounded-xl border border-stone-200 p-4 hover:border-stone-400 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-xl mt-0.5 shrink-0">{page.icon ?? '📄'}</span>
                  <div className="min-w-0">
                    <h3 className="font-medium text-stone-900 text-sm truncate group-hover:text-stone-700">
                      {page.title || 'Untitled'}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {page.spaces && (
                        <span className="text-xs text-stone-400 truncate">
                          {(page.spaces as unknown as { name: string }).name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-400 mt-1">
                      {formatDistanceToNow(new Date(page.updated_at), { locale: ja, addSuffix: true })}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
