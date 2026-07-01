'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Workspace, Space, WorkspaceRole } from '@/types/database'
import { createPage } from '@/app/actions/pages'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search,
  Plus,
  Settings,
  ChevronRight,
  FileText,
  Home,
  LogOut,
  Database,
  LayoutGrid,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface RecentPage {
  id: string
  title: string
  icon: string | null
  space_id: string | null
  updated_at: string
}

interface Props {
  workspace: Workspace
  spaces: Space[]
  recentPages: RecentPage[]
  userRole: WorkspaceRole
  profile: { display_name: string | null; avatar_url: string | null } | null
  userId: string
}

export function WorkspaceSidebar({
  workspace,
  spaces,
  recentPages,
  userRole,
  profile,
}: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [, startTransition] = useTransition()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  function handleNewPage() {
    startTransition(async () => {
      const result = await createPage(workspace.id, spaces[0]?.id ?? null)
      if (result.page) {
        router.push(`/${workspace.slug}/wiki/${result.page.id}`)
      }
    })
  }

  if (collapsed) {
    return (
      <div className="w-12 bg-white border-r border-stone-200 flex flex-col items-center py-3 gap-3">
        <button
          onClick={() => setCollapsed(false)}
          className="p-2 rounded-lg hover:bg-stone-100 text-stone-500"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
        <TooltipProvider>
          {[
            { icon: Home, href: `/${workspace.slug}`, label: 'ホーム' },
            { icon: Search, href: `/${workspace.slug}/search`, label: '検索' },
            { icon: Settings, href: `/${workspace.slug}/settings`, label: '設定' },
          ].map(({ icon: Icon, href, label }) => (
            <Tooltip key={href}>
              <TooltipTrigger asChild>
                <Link
                  href={href}
                  className={cn(
                    'p-2 rounded-lg hover:bg-stone-100 text-stone-500',
                    pathname === href && 'bg-stone-100 text-stone-900'
                  )}
                >
                  <Icon className="w-4 h-4" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{label}</TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>
    )
  }

  return (
    <div className="w-64 bg-white border-r border-stone-200 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-3 border-b border-stone-100">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 flex-1 min-w-0 rounded-lg hover:bg-stone-100 px-2 py-1.5 text-left">
              <span className="text-lg">{workspace.icon ?? '📁'}</span>
              <span className="font-semibold text-stone-900 text-sm truncate">{workspace.name}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem asChild>
              <Link href="/dashboard">ワークスペース一覧</Link>
            </DropdownMenuItem>
            {(userRole === 'owner' || userRole === 'admin') && (
              <DropdownMenuItem asChild>
                <Link href={`/${workspace.slug}/settings`}>設定</Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
              <LogOut className="w-4 h-4 mr-2" />
              ログアウト
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <button
          onClick={() => setCollapsed(true)}
          className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 shrink-0"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
      </div>

      <ScrollArea className="flex-1 px-2 py-2">
        {/* Nav items */}
        <nav className="space-y-0.5 mb-4">
          {[
            { icon: Home, label: 'ホーム', href: `/${workspace.slug}` },
            { icon: Search, label: '検索', href: `/${workspace.slug}/search` },
            { icon: LayoutGrid, label: 'テンプレート', href: `/${workspace.slug}/templates` },
          ].map(({ icon: Icon, label, href }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors',
                pathname === href && 'bg-stone-100 text-stone-900 font-medium'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Spaces & Pages */}
        <div className="mb-2">
          <div className="flex items-center justify-between px-3 mb-1">
            <span className="text-xs font-medium text-stone-400 uppercase tracking-wider">スペース</span>
          </div>

          {spaces.map((space) => (
            <SpaceItem
              key={space.id}
              space={space}
              workspace={workspace}
              pages={recentPages.filter(p => p.space_id === space.id)}
              pathname={pathname}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-stone-100 px-3 py-3">
        <button
          onClick={handleNewPage}
          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors"
        >
          <Plus className="w-4 h-4 shrink-0" />
          新規ページ
        </button>
        {(userRole === 'owner' || userRole === 'admin') && (
          <Link
            href={`/${workspace.slug}/settings`}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors',
              pathname.startsWith(`/${workspace.slug}/settings`) && 'bg-stone-100 text-stone-900'
            )}
          >
            <Settings className="w-4 h-4 shrink-0" />
            設定
          </Link>
        )}
      </div>
    </div>
  )
}

function SpaceItem({
  space,
  workspace,
  pages,
  pathname,
}: {
  space: Space
  workspace: Workspace
  pages: RecentPage[]
  pathname: string
}) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="mb-1">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors"
      >
        <ChevronRight
          className={cn('w-3.5 h-3.5 shrink-0 transition-transform', expanded && 'rotate-90')}
        />
        <span className="mr-1">{space.icon ?? '📁'}</span>
        <span className="font-medium text-stone-700 text-xs truncate">{space.name}</span>
      </button>

      {expanded && (
        <div className="ml-4 mt-0.5 space-y-0.5">
          {pages.length === 0 ? (
            <p className="text-xs text-stone-400 px-3 py-1">ページなし</p>
          ) : (
            pages.slice(0, 8).map((page) => (
              <Link
                key={page.id}
                href={`/${workspace.slug}/wiki/${page.id}`}
                className={cn(
                  'flex items-center gap-2 px-3 py-1 rounded-lg text-xs text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors truncate',
                  pathname === `/${workspace.slug}/wiki/${page.id}` && 'bg-stone-100 text-stone-900'
                )}
              >
                <span className="shrink-0">{page.icon ?? '📄'}</span>
                <span className="truncate">{page.title || 'Untitled'}</span>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  )
}
