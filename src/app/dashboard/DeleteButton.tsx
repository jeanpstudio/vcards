'use client'

import React, { useTransition } from 'react'
import { deleteVCard } from '@/actions/vcard'
import { Trash, Loader2 } from 'lucide-react'

export default function DeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    const consent = confirm(
      '¿Estás seguro de que deseas eliminar esta vCard de forma permanente? Se borrará también su acceso público.'
    )
    if (consent) {
      startTransition(async () => {
        const result = await deleteVCard(id)
        if (result?.error) {
          alert(`Error al eliminar: ${result.error}`)
        }
      })
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
      title="Eliminar vCard"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash className="h-4 w-4" />
      )}
    </button>
  )
}
