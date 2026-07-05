'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  signUpSchema,
  signInSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  formDataToObject,
  formatZodError,
} from '@/lib/validations'

export async function signUp(formData: FormData) {
  const parsed = signUpSchema.safeParse(formDataToObject(formData))
  if (!parsed.success) return { error: formatZodError(parsed.error) }

  const { email, password, display_name } = parsed.data
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: display_name },
    },
  })

  if (error) return { error: error.message }

  return { success: true, message: '確認メールを送信しました。メールを確認してください。' }
}

export async function signIn(formData: FormData) {
  const parsed = signInSchema.safeParse(formDataToObject(formData))
  if (!parsed.success) return { error: formatZodError(parsed.error) }

  const { email, password } = parsed.data
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { error: 'メールアドレスまたはパスワードが正しくありません' }

  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function resetPassword(formData: FormData) {
  const parsed = resetPasswordSchema.safeParse(formDataToObject(formData))
  if (!parsed.success) return { error: formatZodError(parsed.error) }

  const { email } = parsed.data
  const supabase = await createClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl}/auth/callback?next=/auth/update-password`,
  })

  if (error) return { error: 'メール送信に失敗しました' }
  return { success: true, message: 'パスワードリセットメールを送信しました' }
}

export async function updatePassword(formData: FormData) {
  const parsed = updatePasswordSchema.safeParse(formDataToObject(formData))
  if (!parsed.success) return { error: formatZodError(parsed.error) }

  const { password } = parsed.data
  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({ password })

  if (error) return { error: 'パスワードの更新に失敗しました' }

  redirect('/dashboard')
}
