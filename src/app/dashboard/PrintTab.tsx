'use client'

import React, { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { updateCardBackBg, deleteCardBackBg } from '@/actions/vcard'
import {
  Printer,
  Upload,
  Trash2,
  ChevronRight,
  Sparkles,
  Info,
  Layers,
  Image as ImageIcon,
  User,
  Briefcase,
  QrCode
} from 'lucide-react'

// Convertidor de hexadecimal a HSL para generar colores derivados armoniosos
export function getDerivedColors(hex: string) {
  let c = hex.replace('#', '')
  if (c.length === 3) {
    c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2]
  }
  const r = parseInt(c.substring(0, 2), 16) / 255
  const g = parseInt(c.substring(2, 4), 16) / 255
  const b = parseInt(c.substring(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  const hue = Math.round(h * 360)
  const sat = Math.round(s * 100)
  const light = Math.round(l * 100)

  return {
    theme: `hsl(${hue}, ${sat}%, ${light}%)`,
    lighter: `hsl(${hue}, ${sat}%, ${Math.min(light + 35, 94)}%)`,
    lightest: `hsl(${hue}, ${sat}%, ${Math.min(light + 43, 98)}%)`,
    darker: `hsl(${hue}, ${sat}%, ${Math.max(light - 20, 10)}%)`,
  }
}

interface PrintTabProps {
  vcards: Array<{
    id: string
    slug: string
    first_name: string
    last_name: string
    job_title?: string | null
    company?: string | null
    email?: string | null
    phone?: string | null
    whatsapp?: string | null
    website?: string | null
    address?: string | null
    profile_image_url?: string | null
    company_logo_url?: string | null
    theme_color?: string | null
    bio?: string | null
    social_links?: any
    card_back_bg_url?: string | null
    publicUrl: string
    qrCodeUrl: string
  }>
}

export default function PrintTab({ vcards }: PrintTabProps) {
  const router = useRouter()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const activeVCard = vcards[selectedIndex]

  if (!activeVCard) {
    return (
      <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center max-w-xl mx-auto shadow-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 mb-6 shadow-sm">
          <Sparkles className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">No tienes vCards para diseñar</h2>
        <p className="text-slate-500 text-sm mt-3 mb-8 leading-relaxed">
          Crea primero una tarjeta digital en la pestaña principal antes de poder generar sus diseños de impresión físicos.
        </p>
      </div>
    )
  }

  // Colores derivados para la tarjeta seleccionada
  const colors = getDerivedColors(activeVCard.theme_color || '#24744C')

  const handleUploadBg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('card_back_bg_file', file)

    startTransition(async () => {
      const res = await updateCardBackBg(activeVCard.id, formData)
      if (res.error) {
        alert(res.error)
      } else {
        router.refresh()
      }
    })
  }

  const handleDeleteBg = async () => {
    if (confirm('¿Deseas eliminar la imagen de fondo de la contracara? Se volverá a usar el color plano del tema.')) {
      startTransition(async () => {
        const res = await deleteCardBackBg(activeVCard.id)
        if (res.error) {
          alert(res.error)
        } else {
          router.refresh()
        }
      })
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* Selector lateral izquierdo de vCards */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white border border-slate-150/80 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            1. Selecciona una Tarjeta
          </h3>
          
          <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
            {vcards.map((vcard, idx) => (
              <button
                key={vcard.id}
                onClick={() => setSelectedIndex(idx)}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                  idx === selectedIndex
                    ? 'border-indigo-500 bg-indigo-50/35 text-indigo-900 shadow-sm'
                    : 'border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="overflow-hidden mr-2">
                  <span className="font-bold text-sm block truncate">
                    {vcard.first_name} {vcard.last_name}
                  </span>
                  <span className="text-[10px] text-slate-500 block truncate">
                    {vcard.company || 'Sin organización'}
                  </span>
                </div>
                <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${idx === selectedIndex ? 'text-indigo-600 translate-x-0.5' : 'text-slate-400'}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Panel de Configuración de Reverso (Contracara) */}
        <div className="bg-white border border-slate-150/80 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-indigo-600" />
            <h3 className="font-bold text-slate-800 text-sm">
              Personalizar Contracara
            </h3>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Puedes subir una imagen de fondo para el reverso de la tarjeta de presentación. Se aplicará automáticamente un overlay semitransparente con el color del tema encima.
          </p>

          <div className="space-y-3">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleUploadBg}
              className="hidden"
            />
            
            {activeVCard.card_back_bg_url ? (
              <div className="space-y-2">
                <div className="relative w-full h-24 rounded-xl border border-slate-200 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${activeVCard.card_back_bg_url})` }}>
                  <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center">
                    <span className="text-[10px] text-white font-extrabold uppercase bg-black/60 px-3 py-1 rounded-full tracking-wider">Fondo Activo</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isPending}
                    className="flex-grow flex items-center justify-center gap-1.5 py-2 px-3 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Upload className="h-3.5 w-3.5" /> Cambiar
                  </button>
                  <button
                    onClick={handleDeleteBg}
                    disabled={isPending}
                    className="p-2 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-xl transition-colors cursor-pointer"
                    title="Eliminar imagen"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isPending}
                className="w-full py-4 border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/20 text-slate-500 hover:text-indigo-700 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-2 cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-indigo-50">
                  <Upload className="h-4 w-4" />
                </div>
                Subir fondo de reverso
              </button>
            )}
          </div>
        </div>

        {/* Nota informativa sobre impresión */}
        <div className="bg-indigo-50/60 border border-indigo-100/50 rounded-2xl p-4.5 flex gap-3 text-indigo-950">
          <Info className="h-5 w-5 shrink-0 text-indigo-600 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            <strong>Consejo de Impresión:</strong> Al hacer clic en <em>Exportar PDF / Imprimir</em> se abrirá una pestaña especial. En la ventana de impresión, asegúrate de activar la casilla <strong>"Gráficos de fondo" (Background graphics)</strong> y establecer los márgenes en <strong>"Ninguno" (None)</strong> para conservar los colores y tamaños físicos exactos.
          </p>
        </div>
      </div>

      {/* Previsualizaciones laterales derechas */}
      <div className="lg:col-span-8 space-y-10">
        
        {/* DISEÑO 1: FOTOSHECK VERTICAL */}
        <div className="bg-white border border-slate-150/80 rounded-2xl p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">
                Fotosheck Corporativo (Vertical)
              </h3>
              <p className="text-xs text-slate-400 mt-1">Formato físico estándar: 54mm x 86mm</p>
            </div>
            
            <a
              href={`/dashboard/print/${activeVCard.id}?type=badge`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md text-xs font-bold transition-colors cursor-pointer"
            >
              <Printer className="h-4.5 w-4.5" /> Imprimir Fotosheck
            </a>
          </div>

          {/* Área de Preview del Fotosheck */}
          <div className="flex items-center justify-center bg-slate-50/60 rounded-2xl py-10 border border-slate-100">
            {/* Fotosheck Físico Escalado para pantalla */}
            <div 
              className="w-[280px] h-[445px] bg-white rounded-2xl shadow-xl border border-slate-150 overflow-hidden flex flex-col justify-between select-none"
              style={{ borderColor: colors.lighter }}
            >
              {/* Header con colores dinámicos */}
              <div 
                className="relative h-32 flex flex-col items-center justify-end pb-4 px-4 bg-cover bg-center"
                style={{ 
                  backgroundColor: activeVCard.theme_color || '#24744c',
                  backgroundImage: activeVCard.social_links?.header_bg_url ? `url(${activeVCard.social_links.header_bg_url})` : undefined
                }}
              >
                {/* Overlay de color */}
                {activeVCard.social_links?.header_bg_url && (
                  <div className="absolute inset-0 opacity-70" style={{ backgroundColor: activeVCard.theme_color || '#24744c' }} />
                )}
                
                {/* Foto circular recortada */}
                <div className="absolute top-16 w-20 h-20 rounded-full border-4 border-white overflow-hidden shadow-md bg-slate-50 flex items-center justify-center z-10">
                  {activeVCard.profile_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={activeVCard.profile_image_url} alt="Perfil" className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-8 w-8 text-slate-300" />
                  )}
                </div>
              </div>

              {/* Contenido Central */}
              <div className="flex-grow pt-8 pb-4 px-4 flex flex-col items-center justify-between text-center">
                <div className="space-y-1">
                  <h4 className="font-black text-base tracking-tight leading-tight" style={{ color: colors.darker }}>
                    {activeVCard.first_name} {activeVCard.last_name}
                  </h4>
                  {activeVCard.job_title && (
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {activeVCard.job_title}
                    </p>
                  )}
                </div>

                {/* QR Grande */}
                <div className="relative p-2 rounded-xl bg-white border shadow-sm" style={{ borderColor: colors.lighter }}>
                  {activeVCard.qrCodeUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={activeVCard.qrCodeUrl} alt="QR Code" className="w-28 h-28" />
                  ) : (
                    <QrCode className="w-28 h-28 text-slate-300" />
                  )}
                </div>
              </div>

              {/* Footer de Credencial */}
              <div 
                className="py-3.5 px-4 text-center border-t select-none"
                style={{ backgroundColor: colors.lightest, borderColor: colors.lighter }}
              >
                {activeVCard.company_logo_url ? (
                  <div className="flex justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={activeVCard.company_logo_url} alt="Logo" className="h-6 max-w-[150px] object-contain" />
                  </div>
                ) : (
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block">
                    {activeVCard.company || 'Credencial de Acceso'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* DISEÑO 2: TARJETA DE PRESENTACION HORIZONTAL */}
        <div className="bg-white border border-slate-150/80 rounded-2xl p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">
                Tarjeta de Presentación (Horizontal)
              </h3>
              <p className="text-xs text-slate-400 mt-1">Formato físico estándar: 85mm x 55mm (Doble Cara)</p>
            </div>
            
            <a
              href={`/dashboard/print/${activeVCard.id}?type=card`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md text-xs font-bold transition-colors cursor-pointer"
            >
              <Printer className="h-4.5 w-4.5" /> Imprimir Tarjeta (Doble Cara)
            </a>
          </div>

          {/* Área de Preview del Frente y Dorso */}
          <div className="flex flex-col xl:flex-row items-center justify-center gap-8 bg-slate-50/60 rounded-2xl py-10 px-6 border border-slate-100">
            
            {/* CARA (FRENTE) */}
            <div className="flex flex-col items-center gap-3">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Frente</span>
              <div 
                className="w-[340px] h-[220px] bg-white rounded-xl shadow-lg border p-5 flex select-none"
                style={{ borderColor: colors.lighter }}
              >
                {/* 2 Columnas */}
                <div className="w-[55%] flex flex-col justify-between h-full border-r pr-3" style={{ borderColor: colors.lighter }}>
                  {/* Foto de perfil + info */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full border border-slate-100 overflow-hidden bg-slate-50 shrink-0 flex items-center justify-center">
                      {activeVCard.profile_image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={activeVCard.profile_image_url} alt="Perfil" className="w-full h-full object-cover" />
                      ) : (
                        <User className="h-5 w-5 text-slate-300" />
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <h5 className="font-extrabold text-sm tracking-tight leading-tight block truncate" style={{ color: colors.darker }}>
                        {activeVCard.first_name}
                      </h5>
                      <h5 className="font-extrabold text-sm tracking-tight leading-tight block truncate" style={{ color: colors.darker }}>
                        {activeVCard.last_name}
                      </h5>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    {activeVCard.job_title && (
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase block truncate">
                        {activeVCard.job_title}
                      </span>
                    )}
                    {activeVCard.company && (
                      <span className="text-[8px] font-black uppercase tracking-wider block truncate" style={{ color: activeVCard.theme_color || '#24744C' }}>
                        {activeVCard.company}
                      </span>
                    )}
                  </div>
                </div>

                {/* Columna Derecha: QR Code */}
                <div className="w-[45%] flex flex-col items-center justify-center pl-3 gap-2">
                  <div className="p-1 bg-white border rounded-lg shadow-sm" style={{ borderColor: colors.lighter }}>
                    {activeVCard.qrCodeUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={activeVCard.qrCodeUrl} alt="QR Code" className="w-20 h-20" />
                    ) : (
                      <QrCode className="w-20 h-20 text-slate-300" />
                    )}
                  </div>
                  <span className="text-[7.5px] font-extrabold uppercase text-slate-400 tracking-wider">
                    Escanea mi contacto
                  </span>
                </div>
              </div>
            </div>

            {/* CONTRACARA (DORSO) */}
            <div className="flex flex-col items-center gap-3">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Reverso</span>
              <div 
                className="w-[340px] h-[220px] rounded-xl shadow-lg border p-5 flex flex-col items-center justify-center text-center relative overflow-hidden bg-cover bg-center select-none"
                style={{ 
                  borderColor: colors.lighter,
                  backgroundColor: activeVCard.theme_color || '#24744C',
                  backgroundImage: activeVCard.card_back_bg_url ? `url(${activeVCard.card_back_bg_url})` : undefined
                }}
              >
                {/* Color overlay */}
                <div 
                  className="absolute inset-0 transition-opacity" 
                  style={{ 
                    backgroundColor: activeVCard.theme_color || '#24744C',
                    opacity: activeVCard.card_back_bg_url ? 0.75 : 1
                  }} 
                />

                {/* Contenido en el centro */}
                <div className="relative z-10 flex flex-col items-center justify-center gap-3 w-full px-4">
                  {activeVCard.company_logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={activeVCard.company_logo_url} 
                      alt="Logo de la Empresa" 
                      className="h-12 max-w-[200px] object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]" 
                    />
                  ) : (
                    <span className="text-sm font-black text-white uppercase tracking-widest">
                      {activeVCard.company || 'ORGANIZACIÓN'}
                    </span>
                  )}
                  
                  {activeVCard.website && (
                    <span className="text-[9px] font-bold text-white/80 tracking-wider block bg-black/25 py-1 px-3.5 rounded-full backdrop-blur-[2px] truncate max-w-full">
                      {activeVCard.website.replace(/(^\w+:|^)\/\//, '')}
                    </span>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  )
}
