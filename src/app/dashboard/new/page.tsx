import React from 'react'
import VCardForm from '@/components/VCardForm'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Sparkles } from 'lucide-react'

export default async function NewVCardPage() {
  const supabase = await createClient()

  // Verificar autenticación
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
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
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Crear Tarjeta Digital</h1>
            <p className="text-xs text-slate-500 mt-1">Ingresa los datos para generar tu nueva vCard y código QR.</p>
          </div>
        </div>

        {/* Formulario */}
        <VCardForm />
      </div>
    </div>
  )
}
