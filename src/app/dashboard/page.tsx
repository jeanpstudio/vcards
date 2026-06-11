import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { signOut } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { headers } from 'next/headers'
import Link from 'next/link'
import QRCode from 'qrcode'
import {
  Plus,
  LogOut,
  ExternalLink,
  Edit,
  Download,
  QrCode,
  User,
  Sparkles
} from 'lucide-react'
import CopyButton from './CopyButton'
import DeleteButton from './DeleteButton'
import DuplicateButton from './DuplicateButton'
import PrintTab from './PrintTab'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab } = await searchParams
  const activeTab = tab || 'digital'
  const supabase = await createClient()

  // 1. Obtener usuario autenticado
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-800">
        <p className="mb-4 font-medium">No has iniciado sesión o tu sesión ha expirado.</p>
        <Link href="/login" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-colors text-sm font-semibold">Ir al Login</Link>
      </div>
    )
  }

  // 2. Obtener host actual para generar URLs dinámicas del QR
  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  const baseUrl = `${protocol}://${host}`

  // 3. Consultar vCards del usuario
  const { data: vcards, error } = await supabase
    .from('vcards')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error al cargar vCards:', error)
  }

  // 4. Pre-generar Códigos QR en Servidor para cada vCard
  const vcardsWithQR = vcards
    ? await Promise.all(
        vcards.map(async (vcard) => {
          const publicUrl = `${baseUrl}/vcard/${vcard.slug}`
          let qrCodeUrl = ''
          try {
            qrCodeUrl = await QRCode.toDataURL(publicUrl, {
              width: 300,
              margin: 2,
              color: {
                dark: '#0f172a', // Slate 900
                light: '#ffffff' // Blanco
              }
            })
          } catch (err) {
            console.error('Error al generar QR para:', vcard.slug, err)
          }
          return { ...vcard, publicUrl, qrCodeUrl }
        })
      )
    : []

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-800 overflow-hidden font-sans">
      {/* Luces de fondo sutiles */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>

      {/* Header */}
      <header className="relative border-b border-slate-200/80 bg-white/80 backdrop-blur-md z-15">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white shadow-[0_4px_12px_rgba(79,70,229,0.2)]">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight block">vCard Studio</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block">SaaS Privado</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden md:inline text-sm text-slate-600 font-medium">
              Sesión: <strong className="text-slate-800 font-semibold">{user.email}</strong>
            </span>
            <form action={signOut}>
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 hover:border-rose-200 rounded-xl text-slate-700 hover:text-rose-600 hover:bg-rose-50 transition-all text-xs font-semibold cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                Cerrar Sesión
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-6 py-12 z-10">
        
        {/* Encabezado Principal */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Mis Tarjetas Digitales
            </h1>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Crea vCards dinámicas, descarga sus códigos QR y actualiza tu información en cualquier momento.
            </p>
          </div>

          <Link href="/dashboard/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto h-12 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(79,70,229,0.25)] transition-all hover:scale-[1.02] cursor-pointer">
              <Plus className="h-4 w-4" />
              Crear Nueva vCard
            </Button>
          </Link>
        </div>

        {/* Pestañas de Navegación */}
        <div className="flex border-b border-slate-200 mb-8 select-none">
          <Link
            href="/dashboard?tab=digital"
            className={`px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'digital'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Tarjetas Digitales
          </Link>
          <Link
            href="/dashboard?tab=print"
            className={`px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'print'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Diseño de Impresión (PDF)
          </Link>
        </div>

        {activeTab === 'print' ? (
          <PrintTab vcards={vcardsWithQR} />
        ) : (
          <>
            {/* Listado / Grid */}
            {vcardsWithQR.length === 0 ? (
              // Vista vacía (Onboarding)
              <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center max-w-xl mx-auto shadow-md">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 mb-6 shadow-sm">
                  <Sparkles className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">No tienes vCards creadas</h2>
                <p className="text-slate-500 text-sm mt-3 mb-8 leading-relaxed">
                  Comienza a digitalizar tus contactos. Crea tu primera vCard y genera su código QR dinámico de manera instantánea.
                </p>
                <Link href="/dashboard/new">
                  <Button size="lg" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-8 font-semibold w-full sm:w-auto shadow-md cursor-pointer">
                    <Plus className="mr-2 h-4 w-4" /> Crear mi primera vCard
                  </Button>
                </Link>
              </div>
            ) : (
              // Grid de vCards
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {vcardsWithQR.map((vcard) => (
                  <div
                    key={vcard.id}
                    className="group relative bg-white border border-slate-100 rounded-3xl p-6 flex flex-col justify-between hover:border-slate-200 transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <div>
                      {/* Fila superior: Avatar y datos */}
                      <div className="flex justify-between items-start gap-4 mb-6">
                        <div className="flex items-center gap-4">
                          {/* Foto */}
                          <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-150 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                            {vcard.profile_image_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={vcard.profile_image_url}
                                alt="Perfil"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="h-6 w-6 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-slate-800 transition-colors">
                              {vcard.first_name} {vcard.last_name}
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">
                              {vcard.job_title || 'Sin cargo'}
                            </p>
                            {vcard.company && (
                              <p
                                className="text-[10px] font-bold uppercase tracking-wider mt-1 px-2 py-0.5 rounded-full inline-block"
                                style={{
                                  backgroundColor: `${vcard.theme_color || '#24744C'}15`,
                                  color: vcard.theme_color || '#24744C'
                                }}
                              >
                                {vcard.company}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* QR Code Container */}
                      <div className="flex flex-col items-center py-6 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
                        {vcard.qrCodeUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={vcard.qrCodeUrl}
                            alt={`QR Code para ${vcard.slug}`}
                            className="w-40 h-40 rounded-xl bg-white p-2 border border-slate-150 shadow-sm group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-40 h-40 flex items-center justify-center bg-slate-100 border border-slate-200 rounded-xl">
                            <span className="text-xs text-slate-400">QR No Disponible</span>
                          </div>
                        )}
                        
                        {/* Public Slug Link */}
                        <span className="text-[10px] font-mono font-semibold text-slate-400 mt-4 truncate max-w-full px-4">
                          /vcard/{vcard.slug}
                        </span>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          {/* Ver link publico */}
                          <Link
                            href={`/vcard/${vcard.slug}`}
                            target="_blank"
                            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
                            title="Ver vCard pública"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>

                          {/* Copiar URL */}
                          <CopyButton url={vcard.publicUrl} />

                          {/* Descargar QR */}
                          {vcard.qrCodeUrl && (
                            <a
                              href={vcard.qrCodeUrl}
                              download={`QR_${vcard.slug}.png`}
                              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
                              title="Descargar código QR"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Duplicar */}
                          <DuplicateButton id={vcard.id} />

                          {/* Editar */}
                          <Link
                            href={`/dashboard/edit/${vcard.id}`}
                            className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100/50 border border-indigo-100 text-indigo-600 hover:text-indigo-700 transition-all cursor-pointer"
                            title="Editar vCard"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>

                          {/* Eliminar */}
                          <DeleteButton id={vcard.id} />
                        </div>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
