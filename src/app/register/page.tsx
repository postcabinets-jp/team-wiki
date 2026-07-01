import { Suspense } from 'react'
import Link from 'next/link'
import { RegisterForm } from './register-form'

export const metadata = { title: '新規登録 — team-wiki' }

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-stone-900 rounded-lg flex items-center justify-center text-white text-sm font-bold">W</div>
            <span className="font-semibold text-stone-900 text-lg">team-wiki</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900">アカウント作成</h1>
          <p className="text-stone-500 text-sm mt-1">無料でチームWikiを始める</p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
          <Suspense>
            <RegisterForm />
          </Suspense>
        </div>

        <p className="text-center text-sm text-stone-500 mt-6">
          アカウントをお持ちの方は{' '}
          <Link href="/login" className="text-stone-900 font-medium underline underline-offset-2">
            ログイン
          </Link>
        </p>
      </div>
    </div>
  )
}
