import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { CreateWorkspaceDialog } from '@/components/workspace/create-workspace-dialog'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

export const metadata = { title: 'ダッシュボード — team-wiki' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url')
    .eq('id', user.id)
    .single()

  // Get workspaces where user is owner or member
  const { data: memberships } = await supabase
    .from('workspace_members')
    .select('workspace_id, role, workspaces(*)')
    .eq('user_id', user.id)
    .order('joined_at', { ascending: false })

  type WorkspaceWithRole = {
    id: string
    slug: string
    name: string
    icon: string | null
    created_at: string
    role: string
  }
  const workspaces: WorkspaceWithRole[] = memberships?.map(m => ({
    ...(m.workspaces as unknown as Record<string, unknown>),
    role: m.role,
  })) as unknown as WorkspaceWithRole[] ?? []

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-stone-900 rounded-lg flex items-center justify-center text-white text-xs font-bold">W</div>
          <span className="font-semibold text-stone-900">team-wiki</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-stone-600">
            {profile?.display_name ?? user.email}
          </span>
          <form action="/api/auth/signout" method="post">
            <button className="text-sm text-stone-400 hover:text-stone-700">ログアウト</button>
          </form>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">
              こんにちは、{profile?.display_name ?? 'ゲスト'}さん
            </h1>
            <p className="text-stone-500 text-sm mt-1">ワークスペースを選択して始めましょう</p>
          </div>
          <CreateWorkspaceDialog />
        </div>

        {workspaces.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-stone-200">
            <div className="text-4xl mb-4">📚</div>
            <h2 className="text-lg font-semibold text-stone-900 mb-2">ワークスペースがありません</h2>
            <p className="text-stone-500 text-sm mb-6">チームのWikiを始めるワークスペースを作成してください</p>
            <CreateWorkspaceDialog />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {workspaces.map((ws) => (
              <Link
                key={ws.id as string}
                href={`/${ws.slug}`}
                className="bg-white rounded-xl border border-stone-200 p-5 hover:border-stone-400 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl">{(ws.icon as string) ?? '📁'}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-stone-900 truncate group-hover:text-stone-700">
                      {ws.name as string}
                    </h3>
                    <span className="text-xs text-stone-400 capitalize">{ws.role as string}</span>
                  </div>
                </div>
                <p className="text-xs text-stone-400">
                  {formatDistanceToNow(new Date(ws.created_at as string), { locale: ja, addSuffix: true })} 作成
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
