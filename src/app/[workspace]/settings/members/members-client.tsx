'use client'

import { useState } from 'react'
import { removeMember } from '@/app/actions/workspace'
import type { Workspace } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Trash2, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Member {
  id: string
  user_id: string
  role: string
  joined_at: string
  profiles: { display_name: string | null; avatar_url: string | null } | null
}

interface Props {
  workspace: Workspace
  members: Member[]
  currentUserId: string
  userRole: 'owner' | 'admin'
}

const ROLE_LABELS: Record<string, string> = {
  owner: 'オーナー',
  admin: '管理者',
  member: 'メンバー',
  guest: 'ゲスト',
}

const ROLE_COLORS: Record<string, string> = {
  owner: 'bg-stone-900 text-white',
  admin: 'bg-stone-600 text-white',
  member: 'bg-stone-100 text-stone-700',
  guest: 'bg-stone-50 text-stone-500',
}

export function MembersClient({ workspace, members: initialMembers, currentUserId, userRole }: Props) {
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('member')
  const [inviting, setInviting] = useState(false)
  const [inviteMessage, setInviteMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setInviting(true)
    setInviteMessage(null)

    // Look up user by email via Supabase
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: authUsers } = await (supabase as any).rpc('get_user_id_by_email', { email_addr: inviteEmail })

    if (!authUsers) {
      setInviteMessage({ type: 'error', text: `${inviteEmail} のユーザーが見つかりません。先にアカウント作成が必要です。` })
      setInviting(false)
      return
    }

    const { error } = await supabase.from('workspace_members').insert({
      workspace_id: workspace.id,
      user_id: authUsers as string,
      role: inviteRole as 'admin' | 'member' | 'guest',
    })

    if (error) {
      if (error.code === '23505') {
        setInviteMessage({ type: 'error', text: 'このユーザーは既にメンバーです' })
      } else {
        setInviteMessage({ type: 'error', text: '招待に失敗しました' })
      }
    } else {
      setInviteMessage({ type: 'success', text: `${inviteEmail} を招待しました` })
      setInviteEmail('')
    }
    setInviting(false)
  }

  async function handleRemove(userId: string) {
    if (userId === currentUserId) return
    if (!confirm('このメンバーを削除しますか？')) return

    const result = await removeMember(workspace.id, userId)
    if (result.success) {
      setMembers(prev => prev.filter(m => m.user_id !== userId))
    }
  }

  return (
    <div className="space-y-8">
      {/* Invite */}
      <section>
        <h2 className="text-base font-semibold text-stone-900 mb-3">メンバーを招待</h2>
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          {inviteMessage && (
            <div className={`mb-4 text-sm rounded-lg px-3 py-2 ${
              inviteMessage.type === 'error'
                ? 'text-red-600 bg-red-50 border border-red-200'
                : 'text-emerald-600 bg-emerald-50 border border-emerald-200'
            }`}>
              {inviteMessage.text}
            </div>
          )}
          <form onSubmit={handleInvite} className="flex gap-2">
            <div className="flex-1">
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="email@company.com"
                required
                className="border-stone-200"
              />
            </div>
            <Select value={inviteRole} onValueChange={(v) => setInviteRole(v ?? 'member')}>
              <SelectTrigger className="w-28 border-stone-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">管理者</SelectItem>
                <SelectItem value="member">メンバー</SelectItem>
                <SelectItem value="guest">ゲスト</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" disabled={inviting} className="bg-stone-900 hover:bg-stone-800 text-white">
              {inviting ? '招待中...' : '招待'}
            </Button>
          </form>
          <p className="text-xs text-stone-400 mt-2">
            招待するユーザーは先にteam-wikiアカウントを作成している必要があります
          </p>
        </div>
      </section>

      <Separator />

      {/* Member list */}
      <section>
        <h2 className="text-base font-semibold text-stone-900 mb-3">
          メンバー一覧 ({members.length})
        </h2>
        <div className="bg-white rounded-xl border border-stone-200 divide-y divide-stone-100">
          {members.map((member) => (
            <div key={member.id} className="flex items-center gap-3 px-4 py-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={member.profiles?.avatar_url ?? undefined} />
                <AvatarFallback className="text-xs bg-stone-100 text-stone-600">
                  {member.profiles?.display_name?.[0] ?? '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-stone-900">
                  {member.profiles?.display_name ?? 'ユーザー'}
                  {member.user_id === currentUserId && (
                    <span className="ml-1 text-stone-400 text-xs">（あなた）</span>
                  )}
                </p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[member.role]}`}>
                {ROLE_LABELS[member.role] ?? member.role}
              </span>
              {userRole === 'owner' && member.role !== 'owner' && member.user_id !== currentUserId && (
                <button
                  onClick={() => handleRemove(member.user_id)}
                  className="text-stone-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
