import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('pages').select('title').eq('published_slug', slug).single()
  return { title: `${data?.title ?? 'Page'} — team-wiki` }
}

export default async function PublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: page } = await supabase
    .from('pages')
    .select('*')
    .eq('published_slug', slug)
    .eq('is_published', true)
    .single()

  if (!page) notFound()

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-stone-100 px-6 py-4 flex items-center gap-2">
        <div className="w-6 h-6 bg-stone-900 rounded text-white text-xs flex items-center justify-center font-bold">W</div>
        <span className="text-sm font-medium text-stone-700">team-wiki</span>
      </header>
      <main className="max-w-3xl mx-auto px-8 py-12">
        <div className="text-4xl mb-3">{page.icon ?? '📄'}</div>
        <h1 className="text-4xl font-bold text-stone-900 mb-8">{page.title}</h1>
        <div
          className="prose prose-stone max-w-none"
          dangerouslySetInnerHTML={{ __html: page.content_text ?? '' }}
        />
      </main>
      <footer className="border-t border-stone-100 py-6 px-6 text-center">
        <p className="text-xs text-stone-400">
          Powered by{' '}
          <a href="/" className="hover:text-stone-600">team-wiki</a>
          {' '}— オープンソースのチームWiki
        </p>
      </footer>
    </div>
  )
}
