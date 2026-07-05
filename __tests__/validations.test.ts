import { describe, it, expect } from 'vitest'
import {
  signUpSchema,
  signInSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  createPageSchema,
  updatePageSchema,
  deletePageSchema,
  movePageSchema,
  restorePageVersionSchema,
  searchPagesSchema,
  createWorkspaceSchema,
  updateWorkspaceSchema,
  updateWorkspaceAISchema,
  inviteMemberSchema,
  removeMemberSchema,
  getWorkspaceBySlugSchema,
  createDatabaseSchema,
  updateDatabaseSchemaSchema,
  createDatabaseItemSchema,
  updateDatabaseItemSchema,
  deleteDatabaseItemSchema,
  updateDatabaseViewSchema,
  formDataToObject,
  formatZodError,
} from '@/lib/validations'
import { z } from 'zod'

// ── Helpers ──────────────────────────────────────────────────

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000'
const VALID_UUID_2 = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'
const INVALID_UUID = 'not-a-uuid'

function expectSuccess(schema: z.ZodType, data: unknown) {
  const result = schema.safeParse(data)
  if (!result.success) {
    throw new Error(`Expected success but got errors: ${JSON.stringify(result.error.issues)}`)
  }
  return result.data
}

function expectFailure(schema: z.ZodType, data: unknown) {
  const result = schema.safeParse(data)
  expect(result.success).toBe(false)
  return result.success === false ? result.error : undefined
}

// ── Auth Schemas ─────────────────────────────────────────────

describe('signUpSchema', () => {
  it('accepts valid input', () => {
    const data = expectSuccess(signUpSchema, {
      email: 'user@example.com',
      password: 'securepass',
      display_name: 'Nobu',
    })
    expect(data.email).toBe('user@example.com')
    expect(data.display_name).toBe('Nobu')
  })

  it('rejects invalid email', () => {
    expectFailure(signUpSchema, {
      email: 'bad-email',
      password: 'securepass',
      display_name: 'Nobu',
    })
  })

  it('rejects empty email', () => {
    expectFailure(signUpSchema, {
      email: '',
      password: 'securepass',
      display_name: 'Nobu',
    })
  })

  it('rejects password shorter than 8 chars', () => {
    expectFailure(signUpSchema, {
      email: 'user@example.com',
      password: '1234567',
      display_name: 'Nobu',
    })
  })

  it('accepts password exactly 8 chars (boundary)', () => {
    expectSuccess(signUpSchema, {
      email: 'user@example.com',
      password: '12345678',
      display_name: 'Nobu',
    })
  })

  it('rejects empty display_name', () => {
    expectFailure(signUpSchema, {
      email: 'user@example.com',
      password: 'securepass',
      display_name: '',
    })
  })

  it('rejects display_name over 100 chars', () => {
    expectFailure(signUpSchema, {
      email: 'user@example.com',
      password: 'securepass',
      display_name: 'a'.repeat(101),
    })
  })

  it('accepts display_name exactly 100 chars (boundary)', () => {
    expectSuccess(signUpSchema, {
      email: 'user@example.com',
      password: 'securepass',
      display_name: 'a'.repeat(100),
    })
  })

  it('rejects missing fields', () => {
    expectFailure(signUpSchema, {})
    expectFailure(signUpSchema, { email: 'user@example.com' })
  })
})

describe('signInSchema', () => {
  it('accepts valid input', () => {
    expectSuccess(signInSchema, {
      email: 'user@example.com',
      password: 'x',
    })
  })

  it('rejects invalid email', () => {
    expectFailure(signInSchema, {
      email: 'not-email',
      password: 'pass',
    })
  })

  it('rejects empty password', () => {
    expectFailure(signInSchema, {
      email: 'user@example.com',
      password: '',
    })
  })
})

describe('resetPasswordSchema', () => {
  it('accepts valid email', () => {
    expectSuccess(resetPasswordSchema, { email: 'test@test.com' })
  })

  it('rejects invalid email', () => {
    expectFailure(resetPasswordSchema, { email: 'nope' })
  })

  it('rejects missing email', () => {
    expectFailure(resetPasswordSchema, {})
  })
})

describe('updatePasswordSchema', () => {
  it('accepts password >= 8 chars', () => {
    expectSuccess(updatePasswordSchema, { password: 'newpass88' })
  })

  it('rejects password < 8 chars', () => {
    expectFailure(updatePasswordSchema, { password: 'short' })
  })

  it('accepts exactly 8 chars (boundary)', () => {
    expectSuccess(updatePasswordSchema, { password: 'abcdefgh' })
  })

  it('rejects 7 chars (boundary)', () => {
    expectFailure(updatePasswordSchema, { password: 'abcdefg' })
  })
})

// ── Page Schemas ─────────────────────────────────────────────

describe('createPageSchema', () => {
  it('accepts valid input with all fields', () => {
    const data = expectSuccess(createPageSchema, {
      workspaceId: VALID_UUID,
      spaceId: VALID_UUID_2,
      parentPageId: VALID_UUID,
    })
    expect(data.workspaceId).toBe(VALID_UUID)
  })

  it('accepts null spaceId', () => {
    expectSuccess(createPageSchema, {
      workspaceId: VALID_UUID,
      spaceId: null,
    })
  })

  it('accepts null parentPageId', () => {
    expectSuccess(createPageSchema, {
      workspaceId: VALID_UUID,
      spaceId: null,
      parentPageId: null,
    })
  })

  it('defaults parentPageId to null when omitted', () => {
    const data = expectSuccess(createPageSchema, {
      workspaceId: VALID_UUID,
      spaceId: null,
    })
    expect(data.parentPageId).toBeNull()
  })

  it('rejects invalid UUID for workspaceId', () => {
    expectFailure(createPageSchema, {
      workspaceId: INVALID_UUID,
      spaceId: null,
    })
  })

  it('rejects invalid UUID for spaceId', () => {
    expectFailure(createPageSchema, {
      workspaceId: VALID_UUID,
      spaceId: INVALID_UUID,
    })
  })
})

describe('updatePageSchema', () => {
  it('accepts valid title update', () => {
    expectSuccess(updatePageSchema, {
      pageId: VALID_UUID,
      updates: { title: 'My Page' },
    })
  })

  it('accepts valid content update', () => {
    expectSuccess(updatePageSchema, {
      pageId: VALID_UUID,
      updates: { content: { type: 'doc', content: [] } },
    })
  })

  it('accepts valid published_slug', () => {
    expectSuccess(updatePageSchema, {
      pageId: VALID_UUID,
      updates: { published_slug: 'my-page-123' },
    })
  })

  it('accepts slug with underscores', () => {
    expectSuccess(updatePageSchema, {
      pageId: VALID_UUID,
      updates: { published_slug: 'my_page' },
    })
  })

  it('rejects slug with uppercase', () => {
    expectFailure(updatePageSchema, {
      pageId: VALID_UUID,
      updates: { published_slug: 'MyPage' },
    })
  })

  it('rejects slug with spaces', () => {
    expectFailure(updatePageSchema, {
      pageId: VALID_UUID,
      updates: { published_slug: 'my page' },
    })
  })

  it('rejects slug with special chars', () => {
    expectFailure(updatePageSchema, {
      pageId: VALID_UUID,
      updates: { published_slug: 'my@page!' },
    })
  })

  it('accepts null published_slug', () => {
    expectSuccess(updatePageSchema, {
      pageId: VALID_UUID,
      updates: { published_slug: null },
    })
  })

  it('rejects empty updates object', () => {
    expectFailure(updatePageSchema, {
      pageId: VALID_UUID,
      updates: {},
    })
  })

  it('rejects invalid pageId', () => {
    expectFailure(updatePageSchema, {
      pageId: INVALID_UUID,
      updates: { title: 'ok' },
    })
  })

  it('accepts null icon', () => {
    expectSuccess(updatePageSchema, {
      pageId: VALID_UUID,
      updates: { icon: null },
    })
  })

  it('rejects icon over 32 chars', () => {
    expectFailure(updatePageSchema, {
      pageId: VALID_UUID,
      updates: { icon: 'a'.repeat(33) },
    })
  })

  it('accepts valid cover_url', () => {
    expectSuccess(updatePageSchema, {
      pageId: VALID_UUID,
      updates: { cover_url: 'https://example.com/img.png' },
    })
  })

  it('rejects invalid cover_url', () => {
    expectFailure(updatePageSchema, {
      pageId: VALID_UUID,
      updates: { cover_url: 'not-a-url' },
    })
  })

  it('accepts null cover_url', () => {
    expectSuccess(updatePageSchema, {
      pageId: VALID_UUID,
      updates: { cover_url: null },
    })
  })

  it('accepts is_published boolean', () => {
    expectSuccess(updatePageSchema, {
      pageId: VALID_UUID,
      updates: { is_published: true },
    })
  })

  it('rejects title over 500 chars', () => {
    expectFailure(updatePageSchema, {
      pageId: VALID_UUID,
      updates: { title: 'a'.repeat(501) },
    })
  })

  it('accepts title exactly 500 chars (boundary)', () => {
    expectSuccess(updatePageSchema, {
      pageId: VALID_UUID,
      updates: { title: 'a'.repeat(500) },
    })
  })

  it('rejects published_slug over 200 chars', () => {
    expectFailure(updatePageSchema, {
      pageId: VALID_UUID,
      updates: { published_slug: 'a'.repeat(201) },
    })
  })
})

describe('deletePageSchema', () => {
  it('accepts valid UUID', () => {
    expectSuccess(deletePageSchema, { pageId: VALID_UUID })
  })

  it('rejects invalid UUID', () => {
    expectFailure(deletePageSchema, { pageId: INVALID_UUID })
  })

  it('rejects missing pageId', () => {
    expectFailure(deletePageSchema, {})
  })
})

describe('movePageSchema', () => {
  it('accepts valid input', () => {
    expectSuccess(movePageSchema, {
      pageId: VALID_UUID,
      newParentId: VALID_UUID_2,
      newSortOrder: 0,
    })
  })

  it('accepts null newParentId (move to root)', () => {
    expectSuccess(movePageSchema, {
      pageId: VALID_UUID,
      newParentId: null,
      newSortOrder: 5,
    })
  })

  it('rejects negative newSortOrder', () => {
    expectFailure(movePageSchema, {
      pageId: VALID_UUID,
      newParentId: null,
      newSortOrder: -1,
    })
  })

  it('rejects non-integer newSortOrder', () => {
    expectFailure(movePageSchema, {
      pageId: VALID_UUID,
      newParentId: null,
      newSortOrder: 1.5,
    })
  })

  it('accepts newSortOrder of 0 (boundary)', () => {
    expectSuccess(movePageSchema, {
      pageId: VALID_UUID,
      newParentId: null,
      newSortOrder: 0,
    })
  })
})

describe('restorePageVersionSchema', () => {
  it('accepts valid input', () => {
    expectSuccess(restorePageVersionSchema, {
      pageId: VALID_UUID,
      versionId: VALID_UUID_2,
    })
  })

  it('rejects invalid pageId', () => {
    expectFailure(restorePageVersionSchema, {
      pageId: INVALID_UUID,
      versionId: VALID_UUID,
    })
  })

  it('rejects invalid versionId', () => {
    expectFailure(restorePageVersionSchema, {
      pageId: VALID_UUID,
      versionId: INVALID_UUID,
    })
  })
})

describe('searchPagesSchema', () => {
  it('accepts valid query', () => {
    expectSuccess(searchPagesSchema, {
      workspaceId: VALID_UUID,
      query: 'test search',
    })
  })

  it('rejects empty query', () => {
    expectFailure(searchPagesSchema, {
      workspaceId: VALID_UUID,
      query: '',
    })
  })

  it('rejects query over 500 chars', () => {
    expectFailure(searchPagesSchema, {
      workspaceId: VALID_UUID,
      query: 'a'.repeat(501),
    })
  })

  it('accepts query exactly 500 chars (boundary)', () => {
    expectSuccess(searchPagesSchema, {
      workspaceId: VALID_UUID,
      query: 'a'.repeat(500),
    })
  })

  it('accepts single char query (boundary)', () => {
    expectSuccess(searchPagesSchema, {
      workspaceId: VALID_UUID,
      query: 'x',
    })
  })
})

// ── Workspace Schemas ────────────────────────────────────────

describe('createWorkspaceSchema', () => {
  it('accepts valid name', () => {
    expectSuccess(createWorkspaceSchema, { name: 'My Workspace' })
  })

  it('rejects empty name', () => {
    expectFailure(createWorkspaceSchema, { name: '' })
  })

  it('rejects name over 100 chars', () => {
    expectFailure(createWorkspaceSchema, { name: 'a'.repeat(101) })
  })

  it('accepts name exactly 100 chars (boundary)', () => {
    expectSuccess(createWorkspaceSchema, { name: 'a'.repeat(100) })
  })

  it('accepts single char name (boundary)', () => {
    expectSuccess(createWorkspaceSchema, { name: 'W' })
  })
})

describe('updateWorkspaceSchema', () => {
  it('accepts valid name update', () => {
    expectSuccess(updateWorkspaceSchema, {
      workspaceId: VALID_UUID,
      name: 'Updated Name',
    })
  })

  it('accepts icon only', () => {
    expectSuccess(updateWorkspaceSchema, {
      workspaceId: VALID_UUID,
      icon: '🏢',
    })
  })

  it('accepts both name and icon', () => {
    expectSuccess(updateWorkspaceSchema, {
      workspaceId: VALID_UUID,
      name: 'Test',
      icon: '📝',
    })
  })

  it('rejects invalid workspaceId', () => {
    expectFailure(updateWorkspaceSchema, {
      workspaceId: INVALID_UUID,
      name: 'Test',
    })
  })

  it('rejects icon over 32 chars', () => {
    expectFailure(updateWorkspaceSchema, {
      workspaceId: VALID_UUID,
      icon: 'a'.repeat(33),
    })
  })
})

describe('updateWorkspaceAISchema', () => {
  it('accepts openai provider', () => {
    expectSuccess(updateWorkspaceAISchema, {
      workspaceId: VALID_UUID,
      provider: 'openai',
      api_key: 'sk-test123',
    })
  })

  it('accepts anthropic provider', () => {
    expectSuccess(updateWorkspaceAISchema, {
      workspaceId: VALID_UUID,
      provider: 'anthropic',
    })
  })

  it('accepts gemini provider', () => {
    expectSuccess(updateWorkspaceAISchema, {
      workspaceId: VALID_UUID,
      provider: 'gemini',
    })
  })

  it('accepts empty string provider (disable)', () => {
    expectSuccess(updateWorkspaceAISchema, {
      workspaceId: VALID_UUID,
      provider: '',
    })
  })

  it('rejects unknown provider', () => {
    expectFailure(updateWorkspaceAISchema, {
      workspaceId: VALID_UUID,
      provider: 'unknown-ai',
    })
  })

  it('defaults api_key to empty string when omitted', () => {
    const data = expectSuccess(updateWorkspaceAISchema, {
      workspaceId: VALID_UUID,
      provider: 'openai',
    })
    expect(data.api_key).toBe('')
  })

  it('rejects api_key over 500 chars', () => {
    expectFailure(updateWorkspaceAISchema, {
      workspaceId: VALID_UUID,
      provider: 'openai',
      api_key: 'a'.repeat(501),
    })
  })
})

describe('inviteMemberSchema', () => {
  it('accepts valid input with explicit role', () => {
    expectSuccess(inviteMemberSchema, {
      workspaceId: VALID_UUID,
      email: 'member@example.com',
      role: 'admin',
    })
  })

  it('defaults role to member', () => {
    const data = expectSuccess(inviteMemberSchema, {
      workspaceId: VALID_UUID,
      email: 'member@example.com',
    })
    expect(data.role).toBe('member')
  })

  it('accepts guest role', () => {
    expectSuccess(inviteMemberSchema, {
      workspaceId: VALID_UUID,
      email: 'guest@example.com',
      role: 'guest',
    })
  })

  it('rejects invalid role', () => {
    expectFailure(inviteMemberSchema, {
      workspaceId: VALID_UUID,
      email: 'user@example.com',
      role: 'superadmin',
    })
  })

  it('rejects invalid email', () => {
    expectFailure(inviteMemberSchema, {
      workspaceId: VALID_UUID,
      email: 'bad',
    })
  })
})

describe('removeMemberSchema', () => {
  it('accepts valid input', () => {
    expectSuccess(removeMemberSchema, {
      workspaceId: VALID_UUID,
      userId: VALID_UUID_2,
    })
  })

  it('rejects invalid workspaceId', () => {
    expectFailure(removeMemberSchema, {
      workspaceId: INVALID_UUID,
      userId: VALID_UUID,
    })
  })

  it('rejects invalid userId', () => {
    expectFailure(removeMemberSchema, {
      workspaceId: VALID_UUID,
      userId: INVALID_UUID,
    })
  })
})

describe('getWorkspaceBySlugSchema', () => {
  it('accepts valid slug', () => {
    expectSuccess(getWorkspaceBySlugSchema, { slug: 'my-workspace' })
  })

  it('accepts slug with underscores', () => {
    expectSuccess(getWorkspaceBySlugSchema, { slug: 'my_workspace' })
  })

  it('accepts slug with numbers', () => {
    expectSuccess(getWorkspaceBySlugSchema, { slug: 'workspace-123' })
  })

  it('rejects slug with uppercase', () => {
    expectFailure(getWorkspaceBySlugSchema, { slug: 'MyWorkspace' })
  })

  it('rejects slug with spaces', () => {
    expectFailure(getWorkspaceBySlugSchema, { slug: 'my workspace' })
  })

  it('rejects slug with special characters', () => {
    expectFailure(getWorkspaceBySlugSchema, { slug: 'work@space!' })
  })

  it('rejects empty slug', () => {
    expectFailure(getWorkspaceBySlugSchema, { slug: '' })
  })

  it('rejects slug over 100 chars', () => {
    expectFailure(getWorkspaceBySlugSchema, { slug: 'a'.repeat(101) })
  })

  it('accepts slug exactly 100 chars (boundary)', () => {
    expectSuccess(getWorkspaceBySlugSchema, { slug: 'a'.repeat(100) })
  })
})

// ── Database Schemas ─────────────────────────────────────────

describe('createDatabaseSchema', () => {
  it('accepts valid input', () => {
    expectSuccess(createDatabaseSchema, {
      workspaceId: VALID_UUID,
      name: 'Tasks DB',
    })
  })

  it('accepts with optional pageId', () => {
    expectSuccess(createDatabaseSchema, {
      workspaceId: VALID_UUID,
      name: 'Tasks DB',
      pageId: VALID_UUID_2,
    })
  })

  it('rejects empty name', () => {
    expectFailure(createDatabaseSchema, {
      workspaceId: VALID_UUID,
      name: '',
    })
  })

  it('rejects name over 200 chars', () => {
    expectFailure(createDatabaseSchema, {
      workspaceId: VALID_UUID,
      name: 'a'.repeat(201),
    })
  })

  it('accepts name exactly 200 chars (boundary)', () => {
    expectSuccess(createDatabaseSchema, {
      workspaceId: VALID_UUID,
      name: 'a'.repeat(200),
    })
  })

  it('rejects invalid pageId', () => {
    expectFailure(createDatabaseSchema, {
      workspaceId: VALID_UUID,
      name: 'DB',
      pageId: INVALID_UUID,
    })
  })
})

describe('updateDatabaseSchemaSchema', () => {
  const validColumn = {
    id: 'col-1',
    name: 'Title',
    type: 'text' as const,
  }

  it('accepts valid schema with one column', () => {
    expectSuccess(updateDatabaseSchemaSchema, {
      databaseId: VALID_UUID,
      schema: [validColumn],
    })
  })

  it('accepts column with options (select type)', () => {
    expectSuccess(updateDatabaseSchemaSchema, {
      databaseId: VALID_UUID,
      schema: [{
        id: 'col-status',
        name: 'Status',
        type: 'select',
        options: [
          { id: 'opt-1', name: 'Open', color: 'green' },
          { id: 'opt-2', name: 'Closed', color: 'red' },
        ],
      }],
    })
  })

  it('accepts all valid column types', () => {
    const types = ['text', 'number', 'select', 'multi_select', 'date', 'checkbox', 'person', 'url', 'email', 'phone'] as const
    for (const type of types) {
      expectSuccess(updateDatabaseSchemaSchema, {
        databaseId: VALID_UUID,
        schema: [{ id: 'c', name: 'Col', type }],
      })
    }
  })

  it('rejects invalid column type', () => {
    expectFailure(updateDatabaseSchemaSchema, {
      databaseId: VALID_UUID,
      schema: [{ id: 'c', name: 'Col', type: 'invalid_type' }],
    })
  })

  it('rejects empty schema array', () => {
    expectFailure(updateDatabaseSchemaSchema, {
      databaseId: VALID_UUID,
      schema: [],
    })
  })

  it('rejects column with empty id', () => {
    expectFailure(updateDatabaseSchemaSchema, {
      databaseId: VALID_UUID,
      schema: [{ id: '', name: 'Col', type: 'text' }],
    })
  })

  it('rejects column with empty name', () => {
    expectFailure(updateDatabaseSchemaSchema, {
      databaseId: VALID_UUID,
      schema: [{ id: 'c', name: '', type: 'text' }],
    })
  })

  it('rejects column name over 100 chars', () => {
    expectFailure(updateDatabaseSchemaSchema, {
      databaseId: VALID_UUID,
      schema: [{ id: 'c', name: 'a'.repeat(101), type: 'text' }],
    })
  })

  it('rejects invalid databaseId', () => {
    expectFailure(updateDatabaseSchemaSchema, {
      databaseId: INVALID_UUID,
      schema: [validColumn],
    })
  })

  it('rejects option with empty fields', () => {
    expectFailure(updateDatabaseSchemaSchema, {
      databaseId: VALID_UUID,
      schema: [{
        id: 'col',
        name: 'Status',
        type: 'select',
        options: [{ id: '', name: '', color: '' }],
      }],
    })
  })
})

describe('createDatabaseItemSchema', () => {
  it('accepts valid input', () => {
    expectSuccess(createDatabaseItemSchema, {
      databaseId: VALID_UUID,
      properties: { title: 'Item 1', status: 'open' },
    })
  })

  it('accepts empty properties', () => {
    expectSuccess(createDatabaseItemSchema, {
      databaseId: VALID_UUID,
      properties: {},
    })
  })

  it('rejects invalid databaseId', () => {
    expectFailure(createDatabaseItemSchema, {
      databaseId: INVALID_UUID,
      properties: {},
    })
  })
})

describe('updateDatabaseItemSchema', () => {
  it('accepts valid input', () => {
    expectSuccess(updateDatabaseItemSchema, {
      itemId: VALID_UUID,
      properties: { status: 'done' },
    })
  })

  it('rejects invalid itemId', () => {
    expectFailure(updateDatabaseItemSchema, {
      itemId: INVALID_UUID,
      properties: {},
    })
  })
})

describe('deleteDatabaseItemSchema', () => {
  it('accepts valid itemId', () => {
    expectSuccess(deleteDatabaseItemSchema, { itemId: VALID_UUID })
  })

  it('rejects invalid itemId', () => {
    expectFailure(deleteDatabaseItemSchema, { itemId: INVALID_UUID })
  })

  it('rejects missing itemId', () => {
    expectFailure(deleteDatabaseItemSchema, {})
  })
})

describe('updateDatabaseViewSchema', () => {
  it('accepts table view', () => {
    expectSuccess(updateDatabaseViewSchema, {
      databaseId: VALID_UUID,
      view: 'table',
    })
  })

  it('accepts board view', () => {
    expectSuccess(updateDatabaseViewSchema, {
      databaseId: VALID_UUID,
      view: 'board',
    })
  })

  it('accepts calendar view', () => {
    expectSuccess(updateDatabaseViewSchema, {
      databaseId: VALID_UUID,
      view: 'calendar',
    })
  })

  it('accepts gallery view', () => {
    expectSuccess(updateDatabaseViewSchema, {
      databaseId: VALID_UUID,
      view: 'gallery',
    })
  })

  it('rejects invalid view', () => {
    expectFailure(updateDatabaseViewSchema, {
      databaseId: VALID_UUID,
      view: 'kanban',
    })
  })

  it('rejects invalid databaseId', () => {
    expectFailure(updateDatabaseViewSchema, {
      databaseId: INVALID_UUID,
      view: 'table',
    })
  })
})

// ── Helper Functions ─────────────────────────────────────────

describe('formDataToObject', () => {
  it('converts FormData to plain object', () => {
    const fd = new FormData()
    fd.append('name', 'test')
    fd.append('email', 'a@b.com')
    const result = formDataToObject(fd)
    expect(result).toEqual({ name: 'test', email: 'a@b.com' })
  })

  it('skips non-string values (File)', () => {
    const fd = new FormData()
    fd.append('name', 'test')
    fd.append('file', new Blob(['content']), 'test.txt')
    const result = formDataToObject(fd)
    expect(result).toEqual({ name: 'test' })
  })

  it('returns empty object for empty FormData', () => {
    const fd = new FormData()
    const result = formDataToObject(fd)
    expect(result).toEqual({})
  })
})

describe('formatZodError', () => {
  it('formats single error', () => {
    const result = signUpSchema.safeParse({ email: '', password: '', display_name: '' })
    if (result.success) throw new Error('Expected failure')
    const msg = formatZodError(result.error)
    expect(typeof msg).toBe('string')
    expect(msg.length).toBeGreaterThan(0)
  })

  it('joins multiple errors with semicolons', () => {
    const result = signUpSchema.safeParse({ email: 'bad', password: 'x', display_name: '' })
    if (result.success) throw new Error('Expected failure')
    const msg = formatZodError(result.error)
    expect(msg).toContain(';')
  })
})
