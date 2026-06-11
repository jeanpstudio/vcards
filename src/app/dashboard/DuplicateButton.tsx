'use client'

import React, { useTransition } from 'react'
import { duplicateVCard } from '@/actions/vcard'
import { CopyPlus, Loader2 } from 'lucide-react'

export default function DuplicateButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()

  const handleDuplicate = () => {
    const consent = confirm(
      '¿Deseas duplicar esta vCard? Se creará una copia idéntica con el mismo diseño, logo y datos de empresa para que puedas editarla fácilmente.'
    )
    if (consent) {
      startTransition(async () => {
        const result = await duplicateVCard(id)
        if (result?.error) {
          alert(`Error al duplicar: ${result.error}`)
        }
      })
    }
  }

  return (
    <button
      onClick={handleDuplicate}
      disabled={isPending}
      className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-650 hover:text-slate-800 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
      title="Duplicar vCard"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <CopyPlus className="h-4 w-4" />
      )}
    </button>
  )
}
