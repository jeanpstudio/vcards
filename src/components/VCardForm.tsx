'use client'

import React, { useState, useTransition, useEffect } from 'react'
import { saveVCard } from '@/actions/vcard'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  User,
  Briefcase,
  Mail,
  Phone,
  MessageSquare,
  Globe,
  MapPin,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
  Save,
  ArrowLeft
} from 'lucide-react'

export interface VCardFormProps {
  initialData?: {
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
  }
}

export default function VCardForm({ initialData }: VCardFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [firstName, setFirstName] = useState(initialData?.first_name || '')
  const [lastName, setLastName] = useState(initialData?.last_name || '')
  const [slug, setSlug] = useState(initialData?.slug || '')
  const [isSlugManual, setIsSlugManual] = useState(!!initialData?.slug)

  const [profileImage, setProfileImage] = useState(initialData?.profile_image_url || '')
  const [companyLogo, setCompanyLogo] = useState(initialData?.company_logo_url || '')
  const [themeColor, setThemeColor] = useState(initialData?.theme_color || '#24744C')
  const [bio, setBio] = useState(initialData?.bio || '')

  // Redes sociales
  const [socialFacebook, setSocialFacebook] = useState((initialData?.social_links as any)?.facebook || '')
  const [socialInstagram, setSocialInstagram] = useState((initialData?.social_links as any)?.instagram || '')
  const [socialLinkedin, setSocialLinkedin] = useState((initialData?.social_links as any)?.linkedin || '')
  const [socialTwitter, setSocialTwitter] = useState((initialData?.social_links as any)?.twitter || '')
  const [headerBg, setHeaderBg] = useState((initialData?.social_links as any)?.header_bg_url || '')
  const [headerOverlay, setHeaderOverlay] = useState((initialData?.social_links as any)?.header_overlay !== false)

  // Hostname detection for URL preview
  const [hostUrl, setHostUrl] = useState('https://mi-dominio.com')
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHostUrl(`${window.location.protocol}//${window.location.host}`)
    }
  }, [])

  // Auto-generate slug from name if not manually modified
  useEffect(() => {
    if (!isSlugManual && (firstName || lastName)) {
      const generated = `${firstName} ${lastName}`
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
        .replace(/[^a-z0-9]/g, '-')     // Cambiar espacios/especiales por guion
        .replace(/-+/g, '-')            // Quitar guiones duplicados
        .replace(/^-|-$/g, '')          // Quitar guiones iniciales/finales
      setSlug(generated)
    }
  }, [firstName, lastName, isSlugManual])

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugManual(true)
    const cleaned = e.target.value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9-_]/g, '')
    setSlug(cleaned)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    // Asegurar que pasamos el slug autogenerado/limpio y el id
    formData.set('slug', slug)
    if (initialData?.id) {
      formData.set('id', initialData.id)
    }

    startTransition(async () => {
      const result = await saveVCard(formData)
      if (result.error) {
        setError(result.error)
      } else if (result.success && result.redirect) {
        router.push(result.redirect)
        router.refresh()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-8 max-w-4xl mx-auto pb-16">
      
      {/* Volver */}
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors cursor-pointer font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al panel
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm leading-relaxed">
          ⚠️ {error}
        </div>
      )}

      {/* Grid Principal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Columna Izquierda: Vista Previa y Fotos */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-700 text-xs tracking-wider uppercase">
              Previsualización
            </h3>

            {/* Avatar Preview */}
            <div className="flex flex-col items-center py-4 space-y-3">
              <div className="w-24 h-24 rounded-full bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center relative shadow-sm">
                {profileImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profileImage}
                    alt="Perfil"
                    className="w-full h-full object-cover"
                    onError={() => setProfileImage('')}
                  />
                ) : (
                  <User className="h-10 w-10 text-slate-400" />
                )}
              </div>
              <span className="text-xs text-slate-500 font-semibold">Foto de Perfil</span>
            </div>

            {/* Logo Preview */}
            <div className="flex flex-col items-center py-4 border-t border-slate-100 space-y-3">
              <div className="w-20 h-20 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center relative shadow-sm">
                {companyLogo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={companyLogo}
                    alt="Empresa Logo"
                    className="w-full h-full object-contain p-2"
                    onError={() => setCompanyLogo('')}
                  />
                ) : (
                  <Briefcase className="h-8 w-8 text-slate-400" />
                )}
              </div>
              <span className="text-xs text-slate-500 font-semibold">Logo de Empresa</span>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Campos Formulario */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm space-y-6">
            <h3 className="font-extrabold text-slate-900 text-lg">
              Información de la vCard
            </h3>

            {/* Fila: Nombres */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase block">
                  Nombre *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    name="first_name"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Ej. Juan"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase block">
                  Apellido *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    name="last_name"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Ej. Pérez"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Fila: Slug (Personalizado) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase block">
                Slug (URL de tu tarjeta) *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <LinkIcon className="h-4 w-4" />
                </span>
                <input
                  name="slug"
                  type="text"
                  required
                  value={slug}
                  onChange={handleSlugChange}
                  placeholder="ej-juan-perez"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-sm"
                />
              </div>
              <p className="text-xs text-indigo-600 font-semibold truncate">
                Vista previa de la URL: {hostUrl}/vcard/{slug || '...'}
              </p>
            </div>

            {/* Fila: Cargo y Empresa */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase block">
                  Cargo / Título Profesional
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Briefcase className="h-4 w-4" />
                  </span>
                  <input
                    name="job_title"
                    type="text"
                    defaultValue={initialData?.job_title || ''}
                    placeholder="Ej. Desarrollador Fullstack"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase block">
                  Empresa / Compañía
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Briefcase className="h-4 w-4" />
                  </span>
                  <input
                    name="company"
                    type="text"
                    defaultValue={initialData?.company || ''}
                    placeholder="Ej. Mi Negocio SL"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Fila: Correo y Teléfono */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase block">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    name="email"
                    type="email"
                    defaultValue={initialData?.email || ''}
                    placeholder="juan@ejemplo.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase block">
                  Teléfono Móvil
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Phone className="h-4 w-4" />
                  </span>
                  <input
                    name="phone"
                    type="tel"
                    defaultValue={initialData?.phone || ''}
                    placeholder="Ej. +34600112233"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Fila: Whatsapp y Sitio Web */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase block">
                  WhatsApp (Completo con prefijo)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <MessageSquare className="h-4 w-4" />
                  </span>
                  <input
                    name="whatsapp"
                    type="tel"
                    defaultValue={initialData?.whatsapp || ''}
                    placeholder="Ej. 34600112233"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase block">
                  Sitio Web
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Globe className="h-4 w-4" />
                  </span>
                  <input
                    name="website"
                    type="url"
                    defaultValue={initialData?.website || ''}
                    placeholder="https://misitio.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Dirección */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase block">
                Dirección Física
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <MapPin className="h-4 w-4" />
                </span>
                <input
                  name="address"
                  type="text"
                  defaultValue={initialData?.address || ''}
                  placeholder="Calle 123, Ciudad, País"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-sm"
                />
              </div>
            </div>

            {/* Imagen de Perfil (Subir archivo) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase block">
                Foto de Perfil (Subir archivo)
              </label>
              <input
                type="hidden"
                name="profile_image_url"
                value={profileImage}
              />
              <div className="relative">
                <input
                  name="profile_image_file"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setProfileImage(URL.createObjectURL(file))
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-sm file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 file:cursor-pointer cursor-pointer"
                />
              </div>
              <p className="text-[10px] text-slate-400">Se optimizará automáticamente a formato WebP y tamaño 400x400.</p>
            </div>

            {/* Logo de Empresa (Subir archivo) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase block">
                Logo de Empresa (Subir archivo)
              </label>
              <input
                type="hidden"
                name="company_logo_url"
                value={companyLogo}
              />
              <div className="relative">
                <input
                  name="company_logo_file"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setCompanyLogo(URL.createObjectURL(file))
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-sm file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 file:cursor-pointer cursor-pointer"
                />
              </div>
              <p className="text-[10px] text-slate-400">Se optimizará automáticamente a formato WebP (max 500x250 píxeles).</p>
            </div>

            {/* Imagen de Fondo de Portada (Subir archivo) */}
            <div className="space-y-4 border-t border-slate-100 pt-6">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                  Fondo de Portada (Opcional)
                </label>
                <p className="text-[11px] text-slate-500">Agrega un toque de estilo con una imagen o patrón de fondo para el banner superior.</p>
              </div>
              
              <input
                type="hidden"
                name="header_bg_url"
                value={headerBg}
              />

              <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Subir Imagen de Fondo</label>
                  <input
                    name="header_bg_file"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setHeaderBg(URL.createObjectURL(file))
                      }
                    }}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-sm file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 file:cursor-pointer cursor-pointer shadow-sm"
                  />
                  <p className="text-[9px] text-slate-450 leading-normal">Se optimizará automáticamente a formato WebP.</p>
                </div>

                <div className="flex flex-col justify-center space-y-2">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      id="header_overlay"
                      name="header_overlay"
                      value="true"
                      checked={headerOverlay}
                      onChange={(e) => setHeaderOverlay(e.target.checked)}
                      className="w-4.5 h-4.5 text-indigo-600 border-slate-350 rounded-md focus:ring-indigo-500/40 cursor-pointer transition-all"
                    />
                    <label htmlFor="header_overlay" className="text-xs font-bold text-slate-600 cursor-pointer select-none">
                      Aplicar overlay de color de tema
                    </label>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal pl-7">Mejora el contraste aplicando el color de tema seleccionado sobre la imagen de fondo.</p>
                </div>
              </div>

              {headerBg && (
                <div className="relative w-full h-28 rounded-2xl border border-slate-200/80 overflow-hidden bg-cover bg-center shadow-inner" style={{ backgroundImage: `url(${headerBg})` }}>
                  <div className="absolute inset-0 transition-opacity duration-300" style={{ backgroundColor: themeColor, opacity: headerOverlay ? 0.75 : 0 }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs text-white font-extrabold bg-black/55 px-4 py-2 rounded-full backdrop-blur-md shadow-sm tracking-wide">Vista Previa de Portada</span>
                  </div>
                </div>
              )}
            </div>

            {/* Biografía */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase block">
                Biografía / Descripción corta
              </label>
              <textarea
                name="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Ej. Oficial de comunicaciones programa Acción Andina"
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-sm"
              />
            </div>

            {/* Redes Sociales */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Redes Sociales (Encuéntreme en)
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Facebook */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Facebook URL</label>
                  <input
                    name="social_facebook"
                    type="url"
                    value={socialFacebook}
                    onChange={(e) => setSocialFacebook(e.target.value)}
                    placeholder="https://facebook.com/usuario"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-xs"
                  />
                </div>

                {/* Instagram */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Instagram URL</label>
                  <input
                    name="social_instagram"
                    type="url"
                    value={socialInstagram}
                    onChange={(e) => setSocialInstagram(e.target.value)}
                    placeholder="https://instagram.com/usuario"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-xs"
                  />
                </div>

                {/* LinkedIn */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">LinkedIn URL</label>
                  <input
                    name="social_linkedin"
                    type="url"
                    value={socialLinkedin}
                    onChange={(e) => setSocialLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/usuario"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-xs"
                  />
                </div>

                {/* Twitter / X */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Twitter / X URL</label>
                  <input
                    name="social_twitter"
                    type="url"
                    value={socialTwitter}
                    onChange={(e) => setSocialTwitter(e.target.value)}
                    placeholder="https://x.com/usuario"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Color del Tema */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase block">
                Color de Tema de la vCard
              </label>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                  <input
                    type="color"
                    name="theme_color"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                  <span className="text-xs font-mono font-bold text-slate-600 uppercase">{themeColor}</span>
                </div>

                {/* Paletas de colores rápidas */}
                <div className="flex items-center gap-2">
                  {[
                    { name: 'Forest', color: '#24744C' },
                    { name: 'Ocean', color: '#1E40AF' },
                    { name: 'Sunset', color: '#EA580C' },
                    { name: 'Grape', color: '#6B21A8' },
                    { name: 'Charcoal', color: '#1F2937' },
                    { name: 'Crimson', color: '#BE123C' }
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setThemeColor(preset.color)}
                      className="w-7 h-7 rounded-full border-2 transition-all hover:scale-110 active:scale-95 cursor-pointer"
                      style={{
                        backgroundColor: preset.color,
                        borderColor: themeColor === preset.color ? '#8b5cf6' : 'transparent',
                        boxShadow: themeColor === preset.color ? '0 0 8px rgba(139,92,246,0.3)' : 'none'
                      }}
                      title={preset.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Botón de Enviar */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_4px_12px_rgba(79,70,229,0.2)]"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Guardando datos...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {initialData?.id ? 'Guardar Cambios' : 'Crear vCard'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

      </div>
    </form>
  )
}
