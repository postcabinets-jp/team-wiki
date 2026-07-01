'use client'

import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signIn } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GoogleOAuthButton } from '@/components/auth/google-oauth-button'

type State = { error?: string } | null

export function LoginForm() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message')

  const [state, action, pending] = useActionState<State, FormData>(
    async (_, formData) => signIn(formData),
    null
  )

  return (
    <div className="space-y-4">
      {message && (
        <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          {message}
        </div>
      )}
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
            autoComplete="email"
            className="border-stone-200 focus-visible:ring-stone-400"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-stone-700 text-sm font-medium">パスワード</Label>
            <Link href="/forgot-password" className="text-xs text-stone-500 hover:text-stone-900">
              忘れた場合
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            autoComplete="current-password"
            className="border-stone-200 focus-visible:ring-stone-400"
          />
        </div>

        <Button
          type="submit"
          disabled={pending}
          className="w-full bg-stone-900 hover:bg-stone-800 text-white h-10"
        >
          {pending ? 'ログイン中...' : 'ログイン'}
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

      <GoogleOAuthButton mode="signin" />
    </div>
  )
}
