'use client'

import { useState, useActionState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import { MessageSquare, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface Comment {
  id: string
  content: string
  created_at: string
  created_by: string
  profiles: { display_name: string | null; avatar_url: string | null } | null
}

interface Props {
  pageId: string
  initialComments: Comment[]
  userId: string
}

export function PageComments({ pageId, initialComments, userId }: Props) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    setSubmitting(true)

    const supabase = createClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, avatar_url')
      .eq('id', userId)
      .single()

    const { data, error } = await supabase
      .from('comments')
      .insert({ page_id: pageId, content: text.trim(), created_by: userId })
      .select()
      .single()

    if (!error && data) {
      setComments(prev => [...prev, {
        ...data,
        profiles: profile,
      }])
      setText('')
    }
    setSubmitting(false)
  }

  async function handleResolve(commentId: string) {
    const supabase = createClient()
    await supabase
      .from('comments')
      .update({ resolved: true, resolved_by: userId })
      .eq('id', commentId)
    setComments(prev => prev.filter(c => c.id !== commentId))
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-4 h-4 text-stone-400" />
        <h3 className="text-sm font-semibold text-stone-600">
          コメント {comments.length > 0 && `(${comments.length})`}
        </h3>
      </div>

      <div className="space-y-4 mb-6">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-stone-200 flex items-center justify-center text-xs font-medium text-stone-600 shrink-0">
              {comment.profiles?.display_name?.[0] ?? '?'}
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-xs font-medium text-stone-900">
                  {comment.profiles?.display_name ?? '不明なユーザー'}
                </span>
                <span className="text-xs text-stone-400">
                  {formatDistanceToNow(new Date(comment.created_at), { locale: ja, addSuffix: true })}
                </span>
              </div>
              <p className="text-sm text-stone-700 whitespace-pre-wrap">{comment.content}</p>
              {comment.created_by === userId && (
                <button
                  onClick={() => handleResolve(comment.id)}
                  className="text-xs text-stone-400 hover:text-stone-600 mt-1"
                >
                  解決済みにする
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="コメントを追加..."
          rows={2}
          className="text-sm border-stone-200 focus-visible:ring-stone-400 resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault()
              handleSubmit(e as unknown as React.FormEvent)
            }
          }}
        />
        <Button
          type="submit"
          disabled={submitting || !text.trim()}
          size="sm"
          className="self-end bg-stone-900 hover:bg-stone-800 text-white h-9 w-9 p-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  )
}
