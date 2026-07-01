'use client'

import type { Editor } from '@tiptap/react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter,
  Undo,
  Redo,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  editor: Editor
}

export function EditorToolbar({ editor }: Props) {
  const btn = (
    active: boolean,
    onClick: () => void,
    Icon: React.ComponentType<{ className?: string }>,
    title: string
  ) => (
    <Button
      key={title}
      variant="ghost"
      size="sm"
      onClick={onClick}
      title={title}
      className={cn(
        'h-7 w-7 p-0 text-stone-500 hover:text-stone-900 hover:bg-stone-100',
        active && 'bg-stone-100 text-stone-900'
      )}
    >
      <Icon className="w-3.5 h-3.5" />
    </Button>
  )

  return (
    <div className="flex items-center gap-0.5 flex-wrap mb-4 p-1 rounded-lg bg-stone-50 border border-stone-200">
      {btn(false, () => editor.chain().focus().undo().run(), Undo, '元に戻す')}
      {btn(false, () => editor.chain().focus().redo().run(), Redo, 'やり直し')}
      <Separator orientation="vertical" className="h-5 mx-1" />
      {btn(editor.isActive('bold'), () => editor.chain().focus().toggleBold().run(), Bold, '太字')}
      {btn(editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run(), Italic, 'イタリック')}
      {btn(editor.isActive('underline'), () => editor.chain().focus().toggleUnderline().run(), Underline, '下線')}
      {btn(editor.isActive('strike'), () => editor.chain().focus().toggleStrike().run(), Strikethrough, '取り消し線')}
      {btn(editor.isActive('code'), () => editor.chain().focus().toggleCode().run(), Code, 'コード')}
      {btn(editor.isActive('highlight'), () => editor.chain().focus().toggleHighlight().run(), Highlighter, 'ハイライト')}
      <Separator orientation="vertical" className="h-5 mx-1" />
      {btn(editor.isActive('heading', { level: 1 }), () => editor.chain().focus().toggleHeading({ level: 1 }).run(), Heading1, '見出し1')}
      {btn(editor.isActive('heading', { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), Heading2, '見出し2')}
      {btn(editor.isActive('heading', { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run(), Heading3, '見出し3')}
      <Separator orientation="vertical" className="h-5 mx-1" />
      {btn(editor.isActive('bulletList'), () => editor.chain().focus().toggleBulletList().run(), List, '箇条書き')}
      {btn(editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run(), ListOrdered, '番号付きリスト')}
      {btn(editor.isActive('taskList'), () => editor.chain().focus().toggleTaskList().run(), CheckSquare, 'タスクリスト')}
      {btn(editor.isActive('blockquote'), () => editor.chain().focus().toggleBlockquote().run(), Quote, '引用')}
      {btn(false, () => editor.chain().focus().setHorizontalRule().run(), Minus, '区切り線')}
      <Separator orientation="vertical" className="h-5 mx-1" />
      {btn(editor.isActive({ textAlign: 'left' }), () => editor.chain().focus().setTextAlign('left').run(), AlignLeft, '左揃え')}
      {btn(editor.isActive({ textAlign: 'center' }), () => editor.chain().focus().setTextAlign('center').run(), AlignCenter, '中央揃え')}
      {btn(editor.isActive({ textAlign: 'right' }), () => editor.chain().focus().setTextAlign('right').run(), AlignRight, '右揃え')}
    </div>
  )
}
