'use client'

import { useActionState, useState } from 'react'
import { createWorkspace } from '@/app/actions/workspace'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus } from 'lucide-react'

type State = { error?: string } | null

export function CreateWorkspaceDialog() {
  const [open, setOpen] = useState(false)
  const [state, action, pending] = useActionState<State, FormData>(
    async (_, formData) => {
      const result = await createWorkspace(formData)
      if (result?.error) return result
      setOpen(false)
      return null
    },
    null
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-stone-900 hover:bg-stone-800 text-white gap-2">
          <Plus className="w-4 h-4" />
          新規ワークスペース
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>ワークスペースを作成</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4 mt-2">
          {state?.error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {state.error}
            </p>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="name">ワークスペース名</Label>
            <Input
              id="name"
              name="name"
              placeholder="Acme Inc. エンジニアリング"
              required
              className="border-stone-200 focus-visible:ring-stone-400"
            />
          </div>
          <Button
            type="submit"
            disabled={pending}
            className="w-full bg-stone-900 hover:bg-stone-800 text-white"
          >
            {pending ? '作成中...' : '作成する'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
