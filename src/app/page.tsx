import Link from 'next/link'
import {
  FileText,
  Users,
  Database,
  Search,
  Shield,
  Zap,
  GitBranch,
  History,
  Globe,
  ChevronRight,
  Check,
  Server,
} from 'lucide-react'

export const metadata = {
  title: 'team-wiki — Notionの完全OSS代替。チームWiki・ナレッジベース',
  description: 'セルフホスト可能なオープンソースのチームWiki。ブロックエディタ、インラインDB、全文検索、バージョン管理、AIアシスタントを無制限に使える。',
}

const FEATURES = [
  {
    icon: FileText,
    title: 'ブロックエディタ',
    desc: 'Notion風のブロックベースエディタ。見出し・箇条書き・コード・タスク・引用を自由に組み合わせ。',
  },
  {
    icon: Database,
    title: 'インラインデータベース',
    desc: 'テーブル・ボード・カレンダー・ギャラリービューに対応。フィルタ・ソートでデータを整理。',
  },
  {
    icon: Users,
    title: 'チームコラボ',
    desc: 'ワークスペース/スペース/ページの3層権限管理。Owner/Admin/Member/Guestで細かくコントロール。',
  },
  {
    icon: Search,
    title: '全文検索',
    desc: 'PostgreSQL FTSによるタイトル・本文横断検索。関連度スコアリングで最適な結果を表示。',
  },
  {
    icon: History,
    title: 'バージョン履歴',
    desc: '編集するたびに自動保存。50世代の履歴を保持し、任意のバージョンにワンクリックで復元。',
  },
  {
    icon: Zap,
    title: 'AIアシスタント',
    desc: '自前のAPIキー（Anthropic/OpenAI/Gemini）を接続。文章生成・要約を追加費用ゼロで利用。',
  },
  {
    icon: Shield,
    title: 'RLS完全対応',
    desc: 'SupabaseのRow Level Security全テーブル適用。クロスユーザーデータアクセスを根本から遮断。',
  },
  {
    icon: Globe,
    title: '公開ページ',
    desc: 'ページ単位でWeb公開。URLシェアで外部のステークホルダーと情報共有できる。',
  },
  {
    icon: Server,
    title: 'セルフホスト対応',
    desc: 'Supabase + Next.js + Vercelでクラウド・オンプレを問わずデプロイ。VPS対応予定。',
  },
]

const COMPARISON = [
  { label: 'AIを追加費用なし', teamwiki: true, notion: false, confluence: false },
  { label: 'セルフホスト可能', teamwiki: true, notion: false, confluence: false },
  { label: 'ページ数無制限（Free）', teamwiki: true, notion: false, confluence: false },
  { label: 'ブロックエディタ', teamwiki: true, notion: true, confluence: false },
  { label: 'インラインDB', teamwiki: true, notion: true, confluence: false },
  { label: 'RBAC対応', teamwiki: true, notion: false, confluence: true },
  { label: 'オープンソース', teamwiki: true, notion: false, confluence: false },
  { label: 'バージョン履歴', teamwiki: true, notion: true, confluence: true },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-stone-100">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-stone-900 rounded-lg flex items-center justify-center text-white text-xs font-bold">W</div>
            <span className="font-bold text-stone-900">team-wiki</span>
            <span className="text-xs text-stone-400 border border-stone-200 rounded px-1.5 py-0.5 ml-1">OSS</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://github.com/postcabinets-jp/team-wiki" target="_blank" rel="noopener noreferrer" className="text-sm text-stone-500 hover:text-stone-900">GitHub</a>
            <Link href="/login" className="text-sm text-stone-500 hover:text-stone-900">ログイン</Link>
            <Link
              href="/register"
              className="text-sm font-medium bg-stone-900 text-white px-4 py-1.5 rounded-lg hover:bg-stone-800 transition-colors"
            >
              無料で始める
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-stone-100 text-stone-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <GitBranch className="w-3.5 h-3.5" />
            MIT License — 完全無料・商用利用可
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-stone-900 tracking-tight leading-tight mb-6">
            Notionを<br />
            <span className="text-stone-400">自分たちで動かす。</span>
          </h1>
          <p className="text-xl text-stone-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            ブロックエディタ、インラインDB、バージョン管理、AIアシスタント。<br />
            Notionの主要機能をOSSで再現。月額$0で全機能使い放題。
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-stone-900 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-stone-800 transition-colors text-base"
            >
              無料で始める
              <ChevronRight className="w-4 h-4" />
            </Link>
            <a
              href="https://vercel.com/new/clone?repository-url=https://github.com/postcabinets-jp/team-wiki&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY&project-name=team-wiki&repository-name=team-wiki"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-stone-900 font-semibold px-8 py-3.5 rounded-xl border-2 border-stone-200 hover:border-stone-400 transition-colors text-base"
            >
              <Server className="w-4 h-4" />
              Vercelにデプロイ
            </a>
          </div>
          <p className="text-sm text-stone-400 mt-4">クレジットカード不要 · Vercel無料枠で動く · 5分でセットアップ</p>
        </div>
      </section>

      {/* App preview mock */}
      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="bg-stone-900 rounded-2xl overflow-hidden shadow-2xl border border-stone-800">
            <div className="flex items-center gap-2 px-4 py-3 bg-stone-800 border-b border-stone-700">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-stone-600" />
                <div className="w-3 h-3 rounded-full bg-stone-600" />
                <div className="w-3 h-3 rounded-full bg-stone-600" />
              </div>
              <div className="flex-1 bg-stone-700 rounded-md h-6 mx-4 flex items-center px-3">
                <span className="text-stone-400 text-xs">team-wiki.vercel.app/acme/wiki/getting-started</span>
              </div>
            </div>
            <div className="flex h-80 bg-white">
              <div className="w-52 bg-stone-50 border-r border-stone-200 p-3 space-y-1 shrink-0">
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-stone-100">
                  <div className="w-5 h-5 bg-stone-900 rounded text-white text-xs flex items-center justify-center font-bold">A</div>
                  <span className="text-xs font-semibold text-stone-900 truncate">Acme Engineering</span>
                </div>
                {['ホーム', '検索', 'テンプレート'].map(item => (
                  <div key={item} className="flex items-center gap-2 px-2 py-1 rounded text-xs text-stone-500">
                    <div className="w-3.5 h-3.5 bg-stone-200 rounded" />
                    {item}
                  </div>
                ))}
                <div className="pt-2 border-t border-stone-200 mt-2">
                  <div className="text-xs text-stone-400 px-2 mb-1">スペース</div>
                  {['📁 General', '⚙️ Engineering', '📋 Product'].map(s => (
                    <div key={s} className="text-xs text-stone-600 px-2 py-1">{s}</div>
                  ))}
                </div>
              </div>
              <div className="flex-1 p-8 overflow-hidden">
                <div className="text-3xl mb-2">📘</div>
                <div className="text-2xl font-bold text-stone-900 mb-5">Getting Started with team-wiki</div>
                <div className="space-y-2.5">
                  <div className="h-3.5 bg-stone-100 rounded w-full" />
                  <div className="h-3.5 bg-stone-100 rounded w-4/5" />
                  <div className="h-3.5 bg-stone-100 rounded w-3/4" />
                  <div className="mt-3 flex gap-2 items-center">
                    <div className="w-4 h-4 rounded bg-emerald-100 border border-emerald-300 shrink-0" />
                    <div className="h-3 bg-stone-100 rounded flex-1" />
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="w-4 h-4 rounded bg-stone-100 border border-stone-300 shrink-0" />
                    <div className="h-3 bg-stone-100 rounded w-3/4" />
                  </div>
                  <div className="mt-3 bg-stone-800 rounded-lg p-3">
                    <div className="h-3 bg-stone-600 rounded w-2/3 mb-2" />
                    <div className="h-3 bg-stone-600 rounded w-1/2" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-stone-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-stone-900 mb-3">Notionの機能を、コストゼロで</h2>
            <p className="text-stone-500">AIやDBなど追加課金が必要だった機能を、ワンパッケージで提供</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-xl border border-stone-200 p-5">
                <div className="w-9 h-9 bg-stone-100 rounded-lg flex items-center justify-center mb-3">
                  <Icon className="w-4 h-4 text-stone-700" />
                </div>
                <h3 className="font-semibold text-stone-900 mb-1.5 text-sm">{title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 mb-3">なぜteam-wikiなのか</h2>
            <p className="text-stone-500">有料SaaSが提供できない、OSSならではの自由度</p>
          </div>
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-100">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-stone-900 w-1/2">機能</th>
                  <th className="px-4 py-4 text-sm font-semibold text-stone-900 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <div className="w-4 h-4 bg-stone-900 rounded text-white text-xs flex items-center justify-center font-bold">W</div>
                      team-wiki
                    </div>
                  </th>
                  <th className="px-4 py-4 text-sm text-stone-400 text-center">Notion</th>
                  <th className="px-4 py-4 text-sm text-stone-400 text-center">Confluence</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={row.label} className={i < COMPARISON.length - 1 ? 'border-b border-stone-50' : ''}>
                    <td className="px-6 py-3.5 text-sm text-stone-700">{row.label}</td>
                    <td className="px-4 py-3.5 text-center">
                      {row.teamwiki ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <span className="text-stone-300">—</span>}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {row.notion ? <Check className="w-4 h-4 text-stone-400 mx-auto" /> : <span className="text-stone-200">—</span>}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {row.confluence ? <Check className="w-4 h-4 text-stone-400 mx-auto" /> : <span className="text-stone-200">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Deploy section */}
      <section className="py-20 px-6 bg-stone-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">5分でデプロイ</h2>
          <p className="text-stone-400 mb-8 leading-relaxed">
            GitHubリポジトリをフォークして、Vercel Deploy Buttonを押すだけ。<br />
            Supabaseの無料プランと組み合わせれば、完全無料で運用できます。
          </p>
          <div className="bg-stone-800 rounded-xl border border-stone-700 p-5 text-left mb-8 font-mono text-sm">
            <div className="text-stone-500 mb-2"># 1. Supabaseプロジェクトを作成・マイグレーション実行</div>
            <div className="text-emerald-400 mb-4">npx supabase db push --linked</div>
            <div className="text-stone-500 mb-2"># 2. Vercelにデプロイ（または下のボタンを使用）</div>
            <div className="text-emerald-400">vercel --prod</div>
          </div>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <a
              href="https://vercel.com/new/clone?repository-url=https://github.com/postcabinets-jp/team-wiki&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY&project-name=team-wiki&repository-name=team-wiki"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-stone-900 font-semibold px-6 py-3 rounded-xl hover:bg-stone-100 transition-colors"
            >
              <Server className="w-4 h-4" />
              Deploy to Vercel
            </a>
            <a
              href="https://github.com/postcabinets-jp/team-wiki"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-stone-300 font-medium px-6 py-3 rounded-xl border border-stone-700 hover:border-stone-500 transition-colors"
            >
              <GitBranch className="w-4 h-4" />
              GitHub で見る
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-stone-900 mb-4">今すぐ試す</h2>
          <p className="text-stone-500 mb-8">クラウド版で無料スタート。セルフホストも可能。</p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-stone-900 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-stone-800 transition-colors text-base"
          >
            無料アカウントを作成
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-100 py-10 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-stone-900 rounded text-white text-xs flex items-center justify-center font-bold">W</div>
            <span className="text-sm font-semibold text-stone-900">team-wiki</span>
            <span className="text-xs text-stone-400 ml-1">MIT License</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-stone-400">
            <a href="https://github.com/postcabinets-jp/team-wiki" target="_blank" rel="noopener noreferrer" className="hover:text-stone-700">GitHub</a>
            <Link href="/login" className="hover:text-stone-700">ログイン</Link>
            <Link href="/register" className="hover:text-stone-700">登録</Link>
          </div>
          <p className="text-xs text-stone-300">
            Built by{' '}
            <a href="https://postcabinets.co.jp" target="_blank" rel="noopener noreferrer" className="hover:text-stone-500">
              POST CABINETS
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
