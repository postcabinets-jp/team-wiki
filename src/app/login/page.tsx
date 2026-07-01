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
          <Suspense>
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
