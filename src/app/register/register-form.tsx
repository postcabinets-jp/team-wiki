'use client'

import { useActionState } from 'react'
import { signUp } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GoogleOAuthButton } from '@/components/auth/google-oauth-button'

type State = { error?: string; success?: boolean; message?: string } | null

export function RegisterForm() {
  const [state, action, pending] = useActionState<State, FormData>(
    async (_, formData) => signUp(formData),
    null
  )

  if (state?.success) {
    return (
      <div className="text-center py-4">
        <div className="text-2xl mb-3">📬</div>
        <p className="font-medium text-stone-900">確認メールを送信しました</p>
        <p className="text-sm text-stone-500 mt-1">{state.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {state?.error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {state.error}
        </div>
      )}

      <form action={action} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="display_name" className="text-stone-700 text-sm font-medium">お名前</Label>
          <Input
            id="display_name"
            name="display_name"
            type="text"
            placeholder="山田 太郎"
            required
            autoComplete="name"
            className="border-stone-200 focus-visible:ring-stone-400"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-stone-700 text-sm font-medium">メールアドレス</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@company.com"
            required
            autoComplete="email"
            className="border-stone-200 focus-visible:ring-stone-400"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-stone-700 text-sm font-medium">パスワード</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="8文字以上"
            required
            minLength={8}
            autoComplete="new-password"
            className="border-stone-200 focus-visible:ring-stone-400"
          />
        </div>

        <Button
          type="submit"
          disabled={pending}
          className="w-full bg-stone-900 hover:bg-stone-800 text-white h-10"
        >
          {pending ? '登録中...' : 'アカウント作成'}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-stone-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-stone-400">または</span>
        </div>
      </div>

      <GoogleOAuthButton mode="signup" />

      <p className="text-xs text-stone-400 text-center">
        登録することで、利用規約およびプライバシーポリシーに同意したことになります
      </p>
    </div>
  )
}
