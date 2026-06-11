'use client'

import React, { useEffect } from 'react'
import { Printer, X } from 'lucide-react'

export default function PrintControls() {
  useEffect(() => {
    // Esperar a que se carguen los estilos y recursos antes de imprimir
    const timer = setTimeout(() => {
      window.print()
    }, 1200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="no-print fixed top-4 right-4 flex gap-3 z-50">
      <button
        onClick={() => window.print()}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-lg hover:shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
        title="Imprimir o exportar PDF"
      >
        <Printer className="h-4 w-4" />
        Imprimir
      </button>
      <button
        onClick={() => window.close()}
        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-extrabold shadow-lg hover:shadow-slate-500/20 active:scale-95 transition-all cursor-pointer"
        title="Cerrar pestaña"
      >
        <X className="h-4 w-4" />
        Cerrar
      </button>
    </div>
  )
}
