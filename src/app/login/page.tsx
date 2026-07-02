import { Suspense } from 'react'
import Link from 'next/link'
import { LoginForm } from './login-form'

export const metadata = { title: 'ログイン — team-wiki' }

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-stone-900 rounded-lg flex items-center justify-center text-white text-sm font-bold">W</div>
            <span className="font-semibold text-stone-900 text-lg">team-wiki</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900">おかえりなさい</h1>
          <p className="text-stone-500 text-sm mt-1">チームの知識ベースへログイン</p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
          <Suspense fallback={
            <form className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-stone-700 text-sm font-medium">メールアドレス</label>
                <input id="email" name="email" type="email" placeholder="you@company.com" required autoComplete="email" className="border-stone-200" />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-stone-700 text-sm font-medium">パスワード</label>
                <input id="password" name="password" type="password" placeholder="••••••••" required autoComplete="current-password" className="border-stone-200" />
              </div>
              <button type="submit" className="w-full bg-stone-900 text-white h-10">ログイン</button>
            </form>
          }>
            <LoginForm />
          </Suspense>
        </div>

        <p className="text-center text-sm text-stone-500 mt-6">
          アカウントをお持ちでない方は{' '}
          <Link href="/register" className="text-stone-900 font-medium underline underline-offset-2">
            新規登録
          </Link>
        </p>
      </div>
    </div>
  )
}
