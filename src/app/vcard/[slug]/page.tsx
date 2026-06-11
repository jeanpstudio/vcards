import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import {
  Phone,
  Mail,
  Globe,
  MapPin,
  Briefcase,
  UserPlus,
  ChevronRight
} from 'lucide-react'

export default async function VCardPublicPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  
  // Conectar a Supabase
  const supabase = await createClient()
  
  const { data: vcard, error } = await supabase
    .from('vcards')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !vcard) {
    notFound()
  }

  // URLs de contacto rápidas
  const phoneUrl = vcard.phone ? `tel:${vcard.phone}` : null
  const emailUrl = vcard.email ? `mailto:${vcard.email}` : null
  
  // Limpiar número de whatsapp
  const cleanWhatsapp = vcard.whatsapp ? vcard.whatsapp.replace(/[^0-9]/g, '') : null
  const whatsappUrl = cleanWhatsapp 
    ? `https://wa.me/${cleanWhatsapp}?text=Hola%20${encodeURIComponent(vcard.first_name)},%20he%20visto%20tu%20vCard%20y%20me%20gustaría%20ponerme%20en%20contacto%20contigo.` 
    : null
    
  const websiteUrl = vcard.website ? (vcard.website.startsWith('http') ? vcard.website : `https://${vcard.website}`) : null
  const mapsUrl = vcard.address ? `https://maps.google.com/?q=${encodeURIComponent(vcard.address)}` : null

  // Color de tema e información del perfil
  const themeColor = vcard.theme_color || '#24744C'
  const social = (vcard.social_links as any) || {}

  // Listado dinámico de plataformas de Redes Sociales configuradas
  const socialPlatforms = [
    {
      key: 'facebook',
      name: 'Facebook',
      url: social.facebook,
      iconBg: 'bg-[#1877F2]',
      iconColor: 'text-white',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    },
    {
      key: 'instagram',
      name: 'Instagram',
      url: social.instagram,
      iconBg: 'bg-gradient-to-tr from-[#FFB200] via-[#FF007F] to-[#7F00FF]',
      iconColor: 'text-white',
      icon: (
        <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
        </svg>
      )
    },
    {
      key: 'linkedin',
      name: 'LinkedIn',
      url: social.linkedin,
      iconBg: 'bg-[#0A66C2]',
      iconColor: 'text-white',
      icon: (
        <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
        </svg>
      )
    },
    {
      key: 'twitter',
      name: 'Twitter / X',
      url: social.twitter,
      iconBg: 'bg-black',
      iconColor: 'text-white',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    }
  ]

  const activeSocials = socialPlatforms.filter(platform => platform.url)

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex items-center justify-center font-sans p-0 md:p-6 relative overflow-x-hidden">
      
      {/* Contenedor principal responsive optimizado para móvil */}
      <div className="w-full md:max-w-md bg-slate-100/70 md:rounded-3xl md:shadow-2xl flex flex-col min-h-screen md:min-h-[800px] md:border border-slate-100">
        
        {/* Cuerpo Principal */}
        <div className="flex-grow flex flex-col">
          {/* Cabecera / Banner Superior con Centrado Absoluto y Altura Balanceada */}
          <div
            className="relative pt-8 pb-6 flex flex-col items-center justify-center text-center px-6 transition-colors duration-300 md:rounded-t-3xl bg-cover bg-center overflow-hidden shrink-0"
            style={{ 
              backgroundColor: themeColor,
              backgroundImage: social.header_bg_url ? `url(${social.header_bg_url})` : undefined
            }}
          >
            {/* Overlay de color de tema sobre la imagen de fondo */}
            {social.header_bg_url && (
              <div 
                className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
                style={{ 
                  backgroundColor: themeColor,
                  opacity: social.header_overlay !== false ? 0.75 : 0
                }}
              />
            )}

            {/* Contenido del header flotado sobre el overlay */}
            <div className="relative z-10 flex flex-col items-center justify-center">
              {/* Foto de Perfil circular */}
              <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden shadow-xl flex items-center justify-center bg-white/10 mb-3 shrink-0">
                {vcard.profile_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={vcard.profile_image_url}
                    alt={`${vcard.first_name} ${vcard.last_name}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-black text-white uppercase">
                    {(vcard.first_name?.[0] || '')}
                    {(vcard.last_name?.[0] || '')}
                  </span>
                )}
              </div>

              {/* Nombre de gran formato */}
              <h1 className="text-2xl font-black text-white tracking-tight leading-tight px-2">
                {vcard.first_name} {vcard.last_name}
              </h1>
              
              {/* Cargo Limpio (Texto plano en tamaño medio-alto según captura) */}
              {vcard.job_title && (
                <p className="text-sm font-medium text-white/90 tracking-wide mt-1 px-4 max-w-full">
                  {vcard.job_title}
                </p>
              )}
            </div>
          </div>

          {/* Tres Botones Flotantes overlapping the boundary con Animación de Elevación */}
          <div className="flex justify-center gap-5 -mt-5.5 relative z-20">
            {/* Llamar */}
            {phoneUrl ? (
              <a
                href={phoneUrl}
                className="w-11 h-11 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all duration-300 ease-out cursor-pointer hover:border-slate-200"
                title="Llamar"
              >
                <Phone className="h-4.5 w-4.5" style={{ color: themeColor }} />
              </a>
            ) : (
              <div className="w-11 h-11 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-350 pointer-events-none">
                <Phone className="h-4.5 w-4.5" />
              </div>
            )}

            {/* Correo */}
            {emailUrl ? (
              <a
                href={emailUrl}
                className="w-11 h-11 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all duration-300 ease-out cursor-pointer hover:border-slate-200"
                title="Enviar Correo"
              >
                <Mail className="h-4.5 w-4.5" style={{ color: themeColor }} />
              </a>
            ) : (
              <div className="w-11 h-11 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-350 pointer-events-none">
                <Mail className="h-4.5 w-4.5" />
              </div>
            )}

            {/* Ubicación */}
            {mapsUrl ? (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all duration-300 ease-out cursor-pointer hover:border-slate-200"
                title="Ver Ubicación"
              >
                <MapPin className="h-4.5 w-4.5" style={{ color: themeColor }} />
              </a>
            ) : (
              <div className="w-11 h-11 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-350 pointer-events-none">
                <MapPin className="h-4.5 w-4.5" />
              </div>
            )}
          </div>

          {/* Bloque de Información de Contacto con Spacing Compacto */}
          <div className="px-4.5 pt-6 pb-6 space-y-4 flex flex-col">
            
            {/* Botón Principal: Guardar en Contactos con Alto Impacto y Animación */}
            <a
              href={`/api/vcard/${slug}/download`}
              className="w-full h-11 text-white font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer"
              style={{ backgroundColor: themeColor }}
            >
              <UserPlus className="h-4.5 w-4.5" />
              Añadir contacto
            </a>

            {/* Biografía / Descripción corta */}
            {vcard.bio && (
              <p className="text-center text-xs text-slate-500 font-medium px-4 leading-relaxed my-4">
                {vcard.bio}
              </p>
            )}

            {/* Ficha de Detalles (Estilizada y Limpia con los Paddings correctos y borders de lado a lado) */}
            <div className="bg-white border border-slate-100/80 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col">
              
              {/* Celular */}
              {vcard.phone && (
                <div className="flex items-center gap-3.5 py-3 px-5 border-b border-slate-100/60 last:border-0 hover:bg-slate-50/40 transition-colors">
                  <div className="h-9 w-9 rounded-full bg-slate-50 border border-slate-100/60 flex items-center justify-center text-slate-500 shrink-0">
                    <Phone className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-xs text-slate-400 font-semibold block mb-0.5">Celular</span>
                    <span className="text-sm font-bold text-slate-800 block">{vcard.phone}</span>
                  </div>
                </div>
              )}

              {/* Correo */}
              {vcard.email && (
                <div className="flex items-center gap-3.5 py-3 px-5 border-b border-slate-100/60 last:border-0 hover:bg-slate-50/40 transition-colors">
                  <div className="h-9 w-9 rounded-full bg-slate-50 border border-slate-100/60 flex items-center justify-center text-slate-500 shrink-0">
                    <Mail className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-xs text-slate-400 font-semibold block mb-0.5">Email</span>
                    <span className="text-sm font-bold text-slate-800 block truncate">{vcard.email}</span>
                  </div>
                </div>
              )}

              {/* Web */}
              {vcard.website && (
                <div className="flex items-center gap-3.5 py-3 px-5 border-b border-slate-100/60 last:border-0 hover:bg-slate-50/40 transition-colors">
                  <div className="h-9 w-9 rounded-full bg-slate-50 border border-slate-100/60 flex items-center justify-center text-slate-500 shrink-0">
                    <Globe className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-xs text-slate-400 font-semibold block mb-0.5">Web</span>
                    <a
                      href={websiteUrl || ''}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-slate-800 block truncate hover:underline hover:text-emerald-700 transition-colors"
                    >
                      {vcard.website}
                    </a>
                  </div>
                </div>
              )}

              {/* Ubicación (Con alineación superior para textos largos) */}
              {vcard.address && (
                <div className="flex items-start gap-3.5 py-3 px-5 border-b border-slate-100/60 last:border-0 hover:bg-slate-50/40 transition-colors">
                  <div className="h-9 w-9 rounded-full bg-slate-50 border border-slate-100/60 flex items-center justify-center text-slate-500 shrink-0 mt-0.5">
                    <MapPin className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="overflow-hidden flex-grow">
                    <span className="text-xs text-slate-400 font-semibold block mb-0.5">Ubicación</span>
                    <span className="text-sm font-bold text-slate-800 block leading-relaxed pr-2">
                      {vcard.address}
                    </span>
                    <a
                      href={mapsUrl || ''}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center mt-2.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      Mostrar en el mapa
                    </a>
                  </div>
                </div>
              )}



            </div>

            {/* Redes Sociales Dinámicas "Encuéntreme en" */}
            {activeSocials.length > 0 && (
              <div className="space-y-3.5 pt-1">
                <h3 className="text-sm font-bold text-slate-800 tracking-tight pl-1">
                  Encuéntreme en
                </h3>

                <div className="flex flex-col gap-2.5">
                  {activeSocials.map((platform) => {
                    const cleanUrl = platform.url.startsWith('http') ? platform.url : `https://${platform.url}`
                    return (
                      <a
                        key={platform.key}
                        href={cleanUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3.5 bg-white border border-slate-100/80 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:bg-slate-50/60 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${platform.iconBg} ${platform.iconColor}`}>
                            {platform.icon}
                          </div>
                          <span className="text-sm font-bold text-slate-800">{platform.name}</span>
                        </div>
                        <ChevronRight className="h-4.5 w-4.5 text-slate-400" />
                      </a>
                    )
                  })}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Marca de agua elegante al final de la pantalla (Sticky Footer) */}
        <div className="py-6 border-t border-slate-100 bg-white text-center z-10 md:rounded-b-3xl mt-auto flex items-center justify-center px-6">
          {vcard.company_logo_url ? (
            <div className="flex flex-col items-center justify-center gap-3 w-full">
              <img
                src={vcard.company_logo_url}
                alt={vcard.company || 'Logo de la Organización'}
                className="h-16 max-w-[200px] object-contain transition-all hover:scale-105"
              />
              {vcard.company && (
                <span className="text-sm font-black text-slate-500 uppercase tracking-widest block">
                  {vcard.company}
                </span>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-1.5 w-full">
              {vcard.company && (
                <span className="text-sm font-black text-slate-500 uppercase tracking-widest block mb-1">
                  {vcard.company}
                </span>
              )}
              <span className="text-[10px] text-slate-400 tracking-widest uppercase font-bold">
                Generado con vCard Studio
              </span>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
