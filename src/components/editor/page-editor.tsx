'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Highlight from '@tiptap/extension-highlight'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import CharacterCount from '@tiptap/extension-character-count'
import type { Page } from '@/types/database'
import { updatePage } from '@/app/actions/pages'
import { EditorToolbar } from './editor-toolbar'
import { PageComments } from './page-comments'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Clock, Globe, Lock, History, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface Comment {
  id: string
  content: string
  created_at: string
  created_by: string
  profiles: { display_name: string | null; avatar_url: string | null } | null
}

interface Props {
  page: Page
  workspaceSlug: string
  workspaceId: string
  canEdit: boolean
  userId: string
  comments: Comment[]
}

export function PageEditor({ page, workspaceSlug, canEdit, userId, comments }: Props) {
  const [title, setTitle] = useState(page.title)
  const [icon, setIcon] = useState(page.icon)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isPublished, setIsPublished] = useState(page.is_published)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') return 'タイトルを入力...'
          return "「/」でコマンドを入力、または書き始める"
        },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      CharacterCount,
    ],
    content: page.content as object,
    editable: canEdit,
    onUpdate: ({ editor }) => {
      if (!canEdit) return
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = setTimeout(() => {
        handleSave(editor.getJSON(), editor.getText())
      }, 1500)
    },
  })

  const handleSave = useCallback(
    async (content: object, contentText: string) => {
      setSaving(true)
      await updatePage(page.id, {
        content: content as import('@/types/database').Json,
        content_text: contentText,
      })
      setLastSaved(new Date())
      setSaving(false)
    },
    [page.id]
  )

  const handleTitleBlur = useCallback(async () => {
    if (title !== page.title) {
      await updatePage(page.id, { title })
    }
  }, [title, page.title, page.id])

  const togglePublish = async () => {
    const next = !isPublished
    await updatePage(page.id, { is_published: next })
    setIsPublished(next)
  }

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [])

  return (
    <div className="flex flex-col h-full">
      {/* Page header bar */}
      <div className="flex items-center justify-between px-8 py-3 border-b border-stone-100 bg-white">
        <div className="flex items-center gap-2 text-xs text-stone-400">
          <Link href={`/${workspaceSlug}`} className="hover:text-stone-600">ホーム</Link>
          <span>/</span>
          <span className="text-stone-600">{title || 'Untitled'}</span>
        </div>
        <div className="flex items-center gap-3">
          {saving ? (
            <span className="text-xs text-stone-400">保存中...</span>
          ) : lastSaved ? (
            <span className="text-xs text-stone-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(lastSaved, { locale: ja, addSuffix: true })} 保存
            </span>
          ) : null}

          <Button
            variant="ghost"
            size="sm"
            onClick={togglePublish}
            className={cn(
              'text-xs gap-1.5 h-7',
              isPublished ? 'text-emerald-600 hover:text-emerald-700' : 'text-stone-500'
            )}
          >
            {isPublished ? (
              <><Globe className="w-3.5 h-3.5" /> 公開中</>
            ) : (
              <><Lock className="w-3.5 h-3.5" /> 非公開</>
            )}
          </Button>

          <Link
            href={`/${workspaceSlug}/wiki/${page.id}/history`}
            className="text-xs text-stone-500 hover:text-stone-700 flex items-center gap-1"
          >
            <History className="w-3.5 h-3.5" />
            履歴
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={async () => {
                  const { deletePage } = await import('@/app/actions/pages')
                  await deletePage(page.id)
                  window.location.href = `/${workspaceSlug}`
                }}
                className="text-red-600"
              >
                ページを削除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-8 py-10">
          {/* Icon selector */}
          <button
            className="text-5xl mb-4 hover:opacity-70 transition-opacity"
            onClick={() => {
              const newIcon = prompt('アイコンを入力（絵文字1文字）', icon ?? '📄')
              if (newIcon) {
                setIcon(newIcon.trim().slice(0, 2))
                updatePage(page.id, { icon: newIcon.trim().slice(0, 2) })
              }
            }}
          >
            {icon ?? '📄'}
          </button>

          {/* Title */}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            placeholder="タイトル"
            readOnly={!canEdit}
            className="w-full text-4xl font-bold text-stone-900 bg-transparent border-none outline-none resize-none mb-6 placeholder:text-stone-300 leading-tight"
          />

          {/* Toolbar */}
          {canEdit && editor && <EditorToolbar editor={editor} />}

          {/* Editor content */}
          <EditorContent
            editor={editor}
            className="prose prose-stone max-w-none focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-stone-300 [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0"
          />

          {/* Character count */}
          {editor && (
            <div className="mt-8 text-xs text-stone-300">
              {editor.storage.characterCount.characters()} 文字
            </div>
          )}
        </div>

        {/* Comments */}
        <div className="max-w-3xl mx-auto px-8 pb-16 border-t border-stone-100 pt-8">
          <PageComments
            pageId={page.id}
            initialComments={comments}
            userId={userId}
          />
        </div>
      </div>
    </div>
  )
}
