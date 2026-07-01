'use client'

import { useActionState, useState } from 'react'
import { updateWorkspace, updateWorkspaceAI } from '@/app/actions/workspace'
import type { Workspace, WorkspaceRole } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'

interface Props {
  workspace: Workspace
  userRole: WorkspaceRole
}

type State = { error?: string; success?: boolean } | null

export function SettingsForm({ workspace, userRole }: Props) {
  const [aiProvider, setAiProvider] = useState(workspace.ai_provider ?? '')

  const [wsState, wsAction, wsPending] = useActionState<State, FormData>(
    async (_, formData) => updateWorkspace(workspace.id, formData),
    null
  )

  const [aiState, aiAction, aiPending] = useActionState<State, FormData>(
    async (_, formData) => updateWorkspaceAI(workspace.id, formData),
    null
  )

  return (
    <div className="space-y-10">
      {/* General */}
      <section>
        <h2 className="text-base font-semibold text-stone-900 mb-4">基本情報</h2>
        <form action={wsAction} className="space-y-4 bg-white rounded-xl border border-stone-200 p-6">
          {wsState?.error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {wsState.error}
            </p>
          )}
          {wsState?.success && (
            <p className="text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              保存しました
            </p>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="name">ワークスペース名</Label>
            <Input id="name" name="name" defaultValue={workspace.name} required className="border-stone-200" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="icon">アイコン（絵文字）</Label>
            <Input id="icon" name="icon" defaultValue={workspace.icon ?? ''} placeholder="📁" maxLength={2} className="border-stone-200 w-20" />
          </div>
          <Button type="submit" disabled={wsPending} className="bg-stone-900 hover:bg-stone-800 text-white">
            {wsPending ? '保存中...' : '変更を保存'}
          </Button>
        </form>
      </section>

      <Separator />

      {/* AI Settings */}
      <section>
        <h2 className="text-base font-semibold text-stone-900 mb-1">AI アシスタント</h2>
        <p className="text-sm text-stone-500 mb-4">
          自前のAPIキーを使ってAIアシスタントを有効にします。Anthropic、OpenAI、Google Geminiに対応。
        </p>
        <form action={aiAction} className="space-y-4 bg-white rounded-xl border border-stone-200 p-6">
          {aiState?.error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {aiState.error}
            </p>
          )}
          {aiState?.success && (
            <p className="text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              保存しました
            </p>
          )}
          <div className="space-y-1.5">
            <Label>AIプロバイダー</Label>
            <Select name="provider" value={aiProvider} onValueChange={(v) => setAiProvider(v ?? '')}>
              <SelectTrigger className="border-stone-200">
                <SelectValue placeholder="プロバイダーを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">なし（無効）</SelectItem>
                <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                <SelectItem value="openai">OpenAI (GPT)</SelectItem>
                <SelectItem value="gemini">Google Gemini</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {aiProvider && aiProvider !== 'none' && (
            <div className="space-y-1.5">
              <Label htmlFor="api_key">APIキー</Label>
              <Input
                id="api_key"
                name="api_key"
                type="password"
                placeholder={
                  aiProvider === 'anthropic' ? 'sk-ant-...' :
                  aiProvider === 'openai' ? 'sk-...' : 'AIza...'
                }
                className="border-stone-200"
              />
              <p className="text-xs text-stone-400">APIキーはサーバーで保管されます。第三者には共有されません。</p>
            </div>
          )}
          <Button type="submit" disabled={aiPending} className="bg-stone-900 hover:bg-stone-800 text-white">
            {aiPending ? '保存中...' : 'AI設定を保存'}
          </Button>
        </form>
      </section>

      <Separator />

      {/* Members Link */}
      <section>
        <h2 className="text-base font-semibold text-stone-900 mb-1">メンバー管理</h2>
        <p className="text-sm text-stone-500 mb-3">チームメンバーの招待・役割変更・削除</p>
        <Link
          href={`/${workspace.slug}/settings/members`}
          className="inline-flex items-center gap-2 text-sm font-medium text-stone-900 bg-white rounded-lg border border-stone-200 px-4 py-2.5 hover:bg-stone-50 transition-colors"
        >
          メンバー管理を開く →
        </Link>
      </section>

      {userRole === 'owner' && (
        <>
          <Separator />
          <section>
            <h2 className="text-base font-semibold text-red-600 mb-1">危険ゾーン</h2>
            <p className="text-sm text-stone-500 mb-3">ワークスペースを削除すると元に戻せません</p>
            <button
              onClick={() => alert('この機能は本番環境でのみ利用可能です。まずメールでお問い合わせください。')}
              className="text-sm text-red-600 border border-red-200 rounded-lg px-4 py-2 hover:bg-red-50 transition-colors"
            >
              ワークスペースを削除
            </button>
          </section>
        </>
      )}
    </div>
  )
}
