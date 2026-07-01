'use client'

import { useState } from 'react'
import { DatabaseTable, DatabaseItem, DatabaseColumn, DatabaseView, Json } from '@/types/database'
import { createDatabaseItem, updateDatabaseItem, deleteDatabaseItem, updateDatabaseView } from '@/app/actions/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table2,
  LayoutGrid,
  Calendar,
  Image,
  Plus,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

interface Props {
  database: DatabaseTable
  initialItems: DatabaseItem[]
  canEdit: boolean
  userId: string
  workspaceSlug: string
}

const VIEW_ICONS = {
  table: Table2,
  board: LayoutGrid,
  calendar: Calendar,
  gallery: Image,
} as const

const VIEW_LABELS = {
  table: 'テーブル',
  board: 'ボード',
  calendar: 'カレンダー',
  gallery: 'ギャラリー',
} as const

export function DatabaseViewClient({ database, initialItems, canEdit, userId, workspaceSlug }: Props) {
  const [items, setItems] = useState<DatabaseItem[]>(initialItems)
  const [view, setView] = useState<DatabaseView>(database.default_view)
  const [adding, setAdding] = useState(false)
  const schema = database.schema as unknown as DatabaseColumn[]

  async function handleAddItem() {
    setAdding(true)
    const defaultProps: Record<string, unknown> = {}
    schema.forEach(col => {
      if (col.type === 'checkbox') defaultProps[col.id] = false
      else if (col.type === 'number') defaultProps[col.id] = 0
      else defaultProps[col.id] = ''
    })

    const result = await createDatabaseItem(database.id, defaultProps as Record<string, Json>)
    if (result.item) {
      setItems(prev => [...prev, result.item!])
    }
    setAdding(false)
  }

  async function handleUpdateItem(itemId: string, colId: string, value: unknown) {
    const item = items.find(i => i.id === itemId)
    if (!item) return

    const updated: Record<string, Json> = {
      ...(item.properties as Record<string, Json>),
      [colId]: value as Json,
    }

    setItems(prev => prev.map(i =>
      i.id === itemId ? { ...i, properties: updated as Json } : i
    ))

    await updateDatabaseItem(itemId, updated)
  }

  async function handleDeleteItem(itemId: string) {
    if (!confirm('このアイテムを削除しますか？')) return
    setItems(prev => prev.filter(i => i.id !== itemId))
    await deleteDatabaseItem(itemId)
  }

  async function handleViewChange(newView: DatabaseView) {
    setView(newView)
    await updateDatabaseView(database.id, newView)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-8 py-4 border-b border-stone-100 bg-white flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-stone-900">{database.name}</h1>
          <p className="text-xs text-stone-400 mt-0.5">{items.length} アイテム</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View switcher */}
          <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-1">
            {(['table', 'board', 'calendar', 'gallery'] as DatabaseView[]).map((v) => {
              const Icon = VIEW_ICONS[v]
              return (
                <button
                  key={v}
                  onClick={() => handleViewChange(v)}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all',
                    view === v
                      ? 'bg-white text-stone-900 shadow-sm'
                      : 'text-stone-500 hover:text-stone-700'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {VIEW_LABELS[v]}
                </button>
              )
            })}
          </div>
          {canEdit && (
            <Button
              onClick={handleAddItem}
              disabled={adding}
              size="sm"
              className="bg-stone-900 hover:bg-stone-800 text-white gap-1.5 h-8"
            >
              <Plus className="w-3.5 h-3.5" />
              追加
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8">
        {view === 'table' && (
          <TableView
            schema={schema}
            items={items}
            canEdit={canEdit}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
          />
        )}
        {view === 'board' && (
          <BoardView
            schema={schema}
            items={items}
            canEdit={canEdit}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
          />
        )}
        {view === 'calendar' && (
          <div className="flex items-center justify-center h-48 text-stone-400 text-sm">
            カレンダービューは近日公開予定
          </div>
        )}
        {view === 'gallery' && (
          <GalleryView schema={schema} items={items} onDeleteItem={handleDeleteItem} />
        )}
      </div>
    </div>
  )
}

function TableView({
  schema, items, canEdit, onUpdateItem, onDeleteItem
}: {
  schema: DatabaseColumn[]
  items: DatabaseItem[]
  canEdit: boolean
  onUpdateItem: (itemId: string, colId: string, value: unknown) => void
  onDeleteItem: (itemId: string) => void
}) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-stone-200 bg-stone-50">
            {schema.map(col => (
              <th key={col.id} className="px-4 py-2.5 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                {col.name}
              </th>
            ))}
            {canEdit && <th className="w-10" />}
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={schema.length + 1} className="text-center py-10 text-stone-400 text-sm">
                アイテムがありません
              </td>
            </tr>
          ) : (
            items.map(item => (
              <tr key={item.id} className="border-b border-stone-100 hover:bg-stone-50 group">
                {schema.map(col => {
                  const props = item.properties as Record<string, unknown>
                  const val = props[col.id]
                  return (
                    <td key={col.id} className="px-4 py-2">
                      <CellInput
                        column={col}
                        value={val}
                        onChange={(v) => canEdit && onUpdateItem(item.id, col.id, v)}
                        canEdit={canEdit}
                      />
                    </td>
                  )
                })}
                {canEdit && (
                  <td className="px-2 py-2">
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-red-600 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

function BoardView({
  schema, items, canEdit, onUpdateItem, onDeleteItem
}: {
  schema: DatabaseColumn[]
  items: DatabaseItem[]
  canEdit: boolean
  onUpdateItem: (itemId: string, colId: string, value: unknown) => void
  onDeleteItem: (itemId: string) => void
}) {
  const statusCol = schema.find(c => c.type === 'select')
  const nameCol = schema.find(c => c.type === 'text') ?? schema[0]
  const statuses = statusCol?.options ?? [{ id: 'none', name: '未分類', color: 'gray' }]

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {statuses.map(status => {
        const colItems = items.filter(item => {
          const props = item.properties as Record<string, unknown>
          return statusCol
            ? props[statusCol.id] === status.id
            : true
        })

        return (
          <div key={status.id} className="min-w-64 flex-shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-stone-400" />
              <span className="text-sm font-medium text-stone-700">{status.name}</span>
              <span className="text-xs text-stone-400">{colItems.length}</span>
            </div>
            <div className="space-y-2">
              {colItems.map(item => {
                const props = item.properties as Record<string, unknown>
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg border border-stone-200 p-3 hover:border-stone-400 group"
                  >
                    <p className="text-sm font-medium text-stone-900">
                      {(props[nameCol?.id ?? ''] as string) || 'Untitled'}
                    </p>
                    {canEdit && (
                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-red-600 transition-all mt-2 block"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function GalleryView({
  schema, items, onDeleteItem
}: {
  schema: DatabaseColumn[]
  items: DatabaseItem[]
  onDeleteItem: (itemId: string) => void
}) {
  const nameCol = schema.find(c => c.type === 'text') ?? schema[0]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {items.map(item => {
        const props = item.properties as Record<string, unknown>
        return (
          <div key={item.id} className="bg-white rounded-xl border border-stone-200 overflow-hidden group hover:border-stone-400 transition-all">
            <div className="h-28 bg-stone-100 flex items-center justify-center text-3xl">
              📄
            </div>
            <div className="p-3">
              <p className="text-sm font-medium text-stone-900 truncate">
                {(props[nameCol?.id ?? ''] as string) || 'Untitled'}
              </p>
              <p className="text-xs text-stone-400 mt-1">
                {formatDistanceToNow(new Date(item.created_at), { locale: ja, addSuffix: true })}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function CellInput({
  column, value, onChange, canEdit
}: {
  column: DatabaseColumn
  value: unknown
  onChange: (v: unknown) => void
  canEdit: boolean
}) {
  if (column.type === 'checkbox') {
    return (
      <input
        type="checkbox"
        checked={Boolean(value)}
        onChange={(e) => onChange(e.target.checked)}
        disabled={!canEdit}
        className="w-4 h-4 rounded border-stone-300 accent-stone-900"
      />
    )
  }

  if (column.type === 'select' && column.options) {
    if (!canEdit) {
      const opt = column.options.find(o => o.id === value)
      return <span className="text-sm text-stone-700">{opt?.name ?? ''}</span>
    }
    return (
      <select
        value={(value as string) ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm border-0 bg-transparent text-stone-700 focus:outline-none cursor-pointer"
      >
        <option value="">—</option>
        {column.options.map(opt => (
          <option key={opt.id} value={opt.id}>{opt.name}</option>
        ))}
      </select>
    )
  }

  if (!canEdit) {
    return <span className="text-sm text-stone-700">{String(value ?? '')}</span>
  }

  return (
    <input
      type={column.type === 'number' ? 'number' : column.type === 'date' ? 'date' : 'text'}
      value={String(value ?? '')}
      onChange={(e) => onChange(
        column.type === 'number' ? Number(e.target.value) : e.target.value
      )}
      className="text-sm bg-transparent border-0 outline-none text-stone-700 w-full focus:bg-stone-50 rounded px-1 -mx-1"
    />
  )
}
