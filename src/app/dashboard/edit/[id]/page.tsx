import React from 'react'
import VCardForm from '@/components/VCardForm'
import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Sparkles } from 'lucide-react'

export default async function EditVCardPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Verificar autenticación
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Fetch vCard por ID y asegurar propiedad
  const { data: vcard, error } = await supabase
    .from('vcards')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !vcard) {
    notFound()
  }

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-800 overflow-hidden font-sans py-12">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>

      <div className="relative max-w-4xl mx-auto px-6 z-10">
        {/* Cabecera */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Editar Tarjeta Digital</h1>
            <p className="text-xs text-slate-500 mt-1">Actualiza los datos de tu vCard. Los cambios se verán reflejados inmediatamente en tu código QR.</p>
          </div>
        </div>

        {/* Formulario */}
        <VCardForm initialData={vcard} />
      </div>
    </div>
  )
}
