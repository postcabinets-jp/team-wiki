'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { resetPassword } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type State = { error?: string; success?: boolean; message?: string } | null

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState<State, FormData>(
    async (_, formData) => resetPassword(formData),
    null
  )

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-stone-900 rounded-lg flex items-center justify-center text-white text-sm font-bold">W</div>
            <span className="font-semibold text-stone-900 text-lg">team-wiki</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900">パスワードリセット</h1>
          <p className="text-stone-500 text-sm mt-1">登録メールアドレスにリセットリンクを送信します</p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
          {state?.success ? (
            <div className="text-center py-4">
              <div className="text-2xl mb-3">📬</div>
              <p className="font-medium text-stone-900">メールを送信しました</p>
              <p className="text-sm text-stone-500 mt-1">{state.message}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {state?.error && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {state.error}
                </div>
              )}
              <form action={action} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-stone-700 text-sm font-medium">メールアドレス</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@company.com"
                    required
                    className="border-stone-200 focus-visible:ring-stone-400"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={pending}
                  className="w-full bg-stone-900 hover:bg-stone-800 text-white h-10"
                >
                  {pending ? '送信中...' : 'リセットリンクを送信'}
                </Button>
              </form>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-stone-500 mt-6">
          <Link href="/login" className="text-stone-900 font-medium underline underline-offset-2">
            ログインに戻る
          </Link>
        </p>
      </div>
    </div>
  )
}
