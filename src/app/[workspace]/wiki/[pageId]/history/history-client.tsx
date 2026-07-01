'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { restorePageVersion } from '@/app/actions/pages'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import { RotateCcw } from 'lucide-react'

interface Props {
  version: {
    id: string
    created_at: string
    content_text: string | null
    profiles: { display_name: string | null } | null
  }
  pageId: string
  workspaceSlug: string
  isLatest: boolean
}

export function PageHistoryClient({ version, pageId, workspaceSlug, isLatest }: Props) {
  const [restoring, setRestoring] = useState(false)
  const router = useRouter()

  async function handleRestore() {
    if (!confirm('このバージョンに復元しますか？現在の内容は上書きされます。')) return
    setRestoring(true)
    const result = await restorePageVersion(pageId, version.id)
    if (result.success) {
      router.push(`/${workspaceSlug}/wiki/${pageId}`)
    }
    setRestoring(false)
  }

  const preview = version.content_text?.slice(0, 120)

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4 flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-stone-900">
            {version.profiles?.display_name ?? '不明なユーザー'}
          </span>
          <span className="text-xs text-stone-400">
            {formatDistanceToNow(new Date(version.created_at), { locale: ja, addSuffix: true })}
          </span>
          {isLatest && (
            <span className="text-xs bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded">
              最新
            </span>
          )}
        </div>
        {preview && (
          <p className="text-xs text-stone-500 truncate">{preview}...</p>
        )}
      </div>
      {!isLatest && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRestore}
          disabled={restoring}
          className="shrink-0 h-7 text-xs gap-1 text-stone-600 hover:text-stone-900"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {restoring ? '復元中...' : '復元'}
        </Button>
      )}
    </div>
  )
}
