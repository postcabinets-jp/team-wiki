import { z } from 'zod'

// ── Primitives ──────────────────────────────────────────────

/** UUID v4 format */
const uuid = z.string().uuid()

/** Optional UUID — null means "no parent" / "no reference" */
const optionalUuid = z.string().uuid().nullable()

// ── Auth ────────────────────────────────────────────────────

export const signUpSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上で入力してください'),
  display_name: z.string().min(1, '表示名を入力してください').max(100, '表示名は100文字以内で入力してください'),
})

export const signInSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(1, 'パスワードを入力してください'),
})

export const resetPasswordSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
})

export const updatePasswordSchema = z.object({
  password: z.string().min(8, 'パスワードは8文字以上で入力してください'),
})

// ── Pages ───────────────────────────────────────────────────

export const createPageSchema = z.object({
  workspaceId: uuid,
  spaceId: optionalUuid,
  parentPageId: optionalUuid.optional().default(null),
})

export const updatePageSchema = z.object({
  pageId: uuid,
  updates: z.object({
    title: z.string().min(1).max(500).optional(),
    content: z.any().optional(), // Json — TipTap document structure
    content_text: z.string().optional(),
    icon: z.string().max(32).nullable().optional(),
    cover_url: z.string().url().nullable().optional(),
    is_published: z.boolean().optional(),
    published_slug: z
      .string()
      .regex(/^[a-z0-9_-]+$/, 'スラッグは小文字英数字・ハイフン・アンダースコアのみ使用可能です')
      .min(1)
      .max(200)
      .nullable()
      .optional(),
  }).refine(obj => Object.keys(obj).length > 0, {
    message: '更新内容が空です',
  }),
})

export const deletePageSchema = z.object({
  pageId: uuid,
})

export const movePageSchema = z.object({
  pageId: uuid,
  newParentId: optionalUuid,
  newSortOrder: z.number().int().nonnegative(),
})

export const restorePageVersionSchema = z.object({
  pageId: uuid,
  versionId: uuid,
})

export const searchPagesSchema = z.object({
  workspaceId: uuid,
  query: z.string().min(1, '検索クエリを入力してください').max(500),
})

// ── Workspace ───────────────────────────────────────────────

export const createWorkspaceSchema = z.object({
  name: z.string().min(1, 'ワークスペース名を入力してください').max(100, 'ワークスペース名は100文字以内で入力してください'),
})

export const updateWorkspaceSchema = z.object({
  workspaceId: uuid,
  name: z.string().min(1, 'ワークスペース名を入力してください').max(100).optional(),
  icon: z.string().max(32).optional(),
})

export const updateWorkspaceAISchema = z.object({
  workspaceId: uuid,
  provider: z.enum(['openai', 'anthropic', 'gemini', '']),
  api_key: z.string().max(500).optional().default(''),
})

export const inviteMemberSchema = z.object({
  workspaceId: uuid,
  email: z.string().email('有効なメールアドレスを入力してください'),
  role: z.enum(['admin', 'member', 'guest']).default('member'),
})

export const removeMemberSchema = z.object({
  workspaceId: uuid,
  userId: uuid,
})

export const getWorkspaceBySlugSchema = z.object({
  slug: z.string().min(1).max(100).regex(/^[a-z0-9_-]+$/, '無効なスラッグ形式です'),
})

// ── Database ────────────────────────────────────────────────

const databaseColumnOptionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  color: z.string().min(1),
})

const databaseColumnSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  type: z.enum(['text', 'number', 'select', 'multi_select', 'date', 'checkbox', 'person', 'url', 'email', 'phone']),
  options: z.array(databaseColumnOptionSchema).optional(),
})

export const createDatabaseSchema = z.object({
  workspaceId: uuid,
  name: z.string().min(1, 'データベース名を入力してください').max(200),
  pageId: uuid.optional(),
})

export const updateDatabaseSchemaSchema = z.object({
  databaseId: uuid,
  schema: z.array(databaseColumnSchema).min(1, 'カラムが1つ以上必要です'),
})

export const createDatabaseItemSchema = z.object({
  databaseId: uuid,
  properties: z.record(z.string(), z.any()),
})

export const updateDatabaseItemSchema = z.object({
  itemId: uuid,
  properties: z.record(z.string(), z.any()),
})

export const deleteDatabaseItemSchema = z.object({
  itemId: uuid,
})

export const updateDatabaseViewSchema = z.object({
  databaseId: uuid,
  view: z.enum(['table', 'board', 'calendar', 'gallery']),
})

// ── Helpers ─────────────────────────────────────────────────

/** Extract FormData fields into a plain object for validation */
export function formDataToObject(formData: FormData): Record<string, string> {
  const obj: Record<string, string> = {}
  formData.forEach((value, key) => {
    if (typeof value === 'string') obj[key] = value
  })
  return obj
}

/** Format Zod errors into a single user-facing message */
export function formatZodError(error: z.ZodError): string {
  return error.issues.map(i => i.message).join('; ')
}
