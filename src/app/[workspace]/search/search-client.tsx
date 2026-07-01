'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { searchPages } from '@/app/actions/pages'
import { Input } from '@/components/ui/input'
import { Search, FileText, Loader2 } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'

interface SearchResult {
  id: string
  title: string
  content_text: string | null
  icon: string | null
  space_id: string | null
  updated_at: string
  rank: number
}

interface Props {
  workspaceId: string
  workspaceSlug: string
}

export function SearchClient({ workspaceId, workspaceSlug }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const debouncedSearch = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setResults([])
        setHasSearched(false)
        return
      }
      setSearching(true)
      const data = await searchPages(workspaceId, q)
      setResults(data as SearchResult[])
      setHasSearched(true)
      setSearching(false)
    },
    [workspaceId]
  )

  useDebounce(() => { debouncedSearch(query) }, 300, [query])

  function highlight(text: string, query: string) {
    if (!query.trim()) return text
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    return parts.map((part, i) =>
      regex.test(part) ? <mark key={i} className="bg-yellow-100 text-yellow-900 rounded">{part}</mark> : part
    )
  }

  return (
    <div>
      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ページを検索..."
          autoFocus
          className="pl-10 h-11 border-stone-200 focus-visible:ring-stone-400 text-base"
        />
        {searching && (
          <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 animate-spin" />
        )}
      </div>

      {hasSearched && results.length === 0 && (
        <div className="text-center py-16 text-stone-400">
          <Search className="w-8 h-8 mx-auto mb-3 opacity-50" />
          <p className="text-sm">「{query}」に一致するページが見つかりませんでした</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((result) => (
            <Link
              key={result.id}
              href={`/${workspaceSlug}/wiki/${result.id}`}
              className="flex items-start gap-3 bg-white rounded-xl border border-stone-200 p-4 hover:border-stone-400 hover:shadow-sm transition-all"
            >
              <span className="text-xl mt-0.5 shrink-0">{result.icon ?? '📄'}</span>
              <div className="min-w-0">
                <h3 className="font-medium text-stone-900 text-sm mb-1">
                  {highlight(result.title || 'Untitled', query)}
                </h3>
                {result.content_text && (
                  <p className="text-xs text-stone-500 line-clamp-2">
                    {highlight(result.content_text.slice(0, 200), query)}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {!hasSearched && !searching && (
        <p className="text-sm text-stone-400 text-center py-8">
          キーワードを入力してください
        </p>
      )}
    </div>
  )
}
