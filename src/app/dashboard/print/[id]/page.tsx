import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { headers } from 'next/headers'
import QRCode from 'qrcode'
import PrintControls from './PrintControls'

// Utility function to convert hex to HSL (replicated to maintain clean server side execution)
function getDerivedColors(hex: string) {
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

export default async function PrintPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ type?: string }>
}) {
  const { id } = await params
  const { type } = await searchParams
  const supabase = await createClient()

  // 1. Verify Authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Fetch vCard and check ownership
  const { data: vcard, error } = await supabase
    .from('vcards')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !vcard) {
    notFound()
  }

  // 3. Obtain host current url to generate QR URL
  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  const publicUrl = `${protocol}://${host}/vcard/${vcard.slug}`

  // 4. Generate QR Code
  let qrCodeUrl = ''
  try {
    qrCodeUrl = await QRCode.toDataURL(publicUrl, {
      width: 350,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    })
  } catch (err) {
    console.error('Error generating QR code on print page:', err)
  }

  const colors = getDerivedColors(vcard.theme_color || '#24744C')
  const isBadge = type === 'badge'

  return (
    <div className="print-root">
      {/* Dynamic Printing Style Configs */}
      <style dangerouslySetInnerHTML={{ __html: `
        @page {
          size: ${isBadge ? '54mm 86mm' : '85mm 55mm'};
          margin: 0;
        }
        @media print {
          html, body {
            width: ${isBadge ? '54mm' : '85mm'};
            height: ${isBadge ? '86mm' : '110mm'}; /* Account for both pages if card */
            margin: 0 !important;
            padding: 0 !important;
            background-color: transparent !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .print-preview-container {
            display: block !important;
            margin: 0 !important;
            padding: 0 !important;
            gap: 0 !important;
          }
          .print-page {
            box-shadow: none !important;
            border-radius: 0 !important;
            border: none !important;
            page-break-after: always !important;
            page-break-inside: avoid !important;
          }
          .print-page:last-child {
            page-break-after: avoid !important;
          }
        }
        @media screen {
          body {
            background-color: #f8fafc;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 40px 20px;
          }
          .print-preview-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 40px;
          }
          .print-page {
            box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
            border-radius: 16px;
            border: 1px solid #e2e8f0;
          }
        }
      `}} />

      {/* Manual print and close controls */}
      <PrintControls />

      <div className="print-preview-container">
        {isBadge ? (
          /* BADGE FORMAT: 54mm x 86mm */
          <div
            className="print-page flex flex-col justify-between overflow-hidden bg-white select-none"
            style={{
              width: '54mm',
              height: '86mm',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              boxSizing: 'border-box',
            }}
          >
            {/* Header section */}
            <div
              className="relative h-[26mm] flex flex-col items-center justify-end bg-cover bg-center"
              style={{
                backgroundColor: vcard.theme_color || '#24744C',
                backgroundImage: vcard.social_links?.header_bg_url ? `url(${vcard.social_links.header_bg_url})` : undefined
              }}
            >
              {vcard.social_links?.header_bg_url && (
                <div className="absolute inset-0 opacity-70" style={{ backgroundColor: vcard.theme_color || '#24744C' }} />
              )}

              {/* Avatar Frame (circular) */}
              <div className="absolute top-[12mm] w-[20mm] h-[20mm] rounded-full border-[3px] border-white overflow-hidden shadow bg-slate-50 flex items-center justify-center z-10">
                {vcard.profile_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={vcard.profile_image_url}
                    alt={`${vcard.first_name} ${vcard.last_name}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                    {/* Fallback initials or default avatar */}
                    <span className="text-xl font-bold">{vcard.first_name[0]}{vcard.last_name[0]}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Information and QR code */}
            <div className="flex-grow pt-[8mm] pb-[2mm] px-[4mm] flex flex-col items-center justify-between text-center">
              <div className="space-y-[0.5mm]">
                <h2
                  className="font-extrabold tracking-tight leading-tight"
                  style={{
                    color: colors.darker,
                    fontSize: '3.6mm',
                    margin: 0
                  }}
                >
                  {vcard.first_name} {vcard.last_name}
                </h2>
                {vcard.job_title && (
                  <p
                    className="font-bold uppercase tracking-wider text-slate-400"
                    style={{
                      fontSize: '2mm',
                      margin: 0
                    }}
                  >
                    {vcard.job_title}
                  </p>
                )}
              </div>

              {/* QR Container */}
              <div
                className="p-[1.5mm] rounded-xl bg-white border flex items-center justify-center"
                style={{
                  borderColor: colors.lighter,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                }}
              >
                {qrCodeUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrCodeUrl}
                    alt="QR Code"
                    style={{ width: '28mm', height: '28mm' }}
                  />
                ) : (
                  <div style={{ width: '28mm', height: '28mm' }} className="bg-slate-100 flex items-center justify-center text-[8px] text-slate-400">
                    QR Error
                  </div>
                )}
              </div>
            </div>

            {/* Footer Section */}
            <div
              className="py-[3mm] px-[4mm] text-center border-t flex items-center justify-center"
              style={{
                backgroundColor: colors.lightest,
                borderColor: colors.lighter
              }}
            >
              {vcard.company_logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={vcard.company_logo_url}
                  alt={vcard.company || 'Logo'}
                  className="h-[6mm] max-w-[42mm] object-contain"
                />
              ) : (
                <span
                  className="font-black uppercase tracking-widest text-slate-400 truncate max-w-[46mm]"
                  style={{ fontSize: '2mm' }}
                >
                  {vcard.company || 'Credencial de Acceso'}
                </span>
              )}
            </div>
          </div>
        ) : (
          /* BUSINESS CARD FORMAT: 85mm x 55mm (Doble Cara) */
          <>
            {/* FRONT OF THE CARD */}
            <div
              className="print-page flex overflow-hidden bg-white select-none"
              style={{
                width: '85mm',
                height: '55mm',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                boxSizing: 'border-box',
              }}
            >
              {/* Left Column (55%) */}
              <div
                className="flex flex-col justify-between h-full p-[5mm] border-r"
                style={{
                  width: '55%',
                  borderColor: colors.lighter,
                  boxSizing: 'border-box'
                }}
              >
                {/* Profile + names */}
                <div className="flex items-center gap-[3.5mm]">
                  <div
                    className="rounded-full border border-slate-100 overflow-hidden bg-slate-50 shrink-0 flex items-center justify-center shadow-inner"
                    style={{ width: '12mm', height: '12mm' }}
                  >
                    {vcard.profile_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={vcard.profile_image_url}
                        alt={`${vcard.first_name} ${vcard.last_name}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-extrabold text-slate-300">
                        {vcard.first_name[0]}{vcard.last_name[0]}
                      </span>
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <h3
                      className="font-extrabold tracking-tight leading-tight truncate"
                      style={{
                        color: colors.darker,
                        fontSize: '3.6mm',
                        margin: 0
                      }}
                    >
                      {vcard.first_name}
                    </h3>
                    <h3
                      className="font-extrabold tracking-tight leading-tight truncate"
                      style={{
                        color: colors.darker,
                        fontSize: '3.6mm',
                        margin: 0
                      }}
                    >
                      {vcard.last_name}
                    </h3>
                  </div>
                </div>

                {/* Job + Company details */}
                <div className="space-y-[0.5mm] overflow-hidden pr-[1mm]">
                  {vcard.job_title && (
                    <span
                      className="font-extrabold text-slate-400 uppercase block truncate"
                      style={{ fontSize: '2mm', letterSpacing: '0.2mm' }}
                    >
                      {vcard.job_title}
                    </span>
                  )}
                  {vcard.company && (
                    <span
                      className="font-black uppercase tracking-wider block truncate"
                      style={{
                        color: vcard.theme_color || '#24744C',
                        fontSize: '1.8mm'
                      }}
                    >
                      {vcard.company}
                    </span>
                  )}
                </div>
              </div>

              {/* Right Column (45%) */}
              <div
                className="flex flex-col items-center justify-center p-[5mm] gap-[1.5mm]"
                style={{
                  width: '45%',
                  boxSizing: 'border-box'
                }}
              >
                <div
                  className="p-[1.5mm] bg-white border rounded-xl flex items-center justify-center shadow-sm"
                  style={{ borderColor: colors.lighter }}
                >
                  {qrCodeUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={qrCodeUrl}
                      alt="QR Code"
                      style={{ width: '22mm', height: '22mm' }}
                    />
                  ) : (
                    <div style={{ width: '22mm', height: '22mm' }} className="bg-slate-100 flex items-center justify-center text-[6px] text-slate-400">
                      QR Error
                    </div>
                  )}
                </div>
                <span
                  className="font-extrabold uppercase text-slate-400 tracking-wider text-center"
                  style={{ fontSize: '1.6mm', letterSpacing: '0.1mm' }}
                >
                  Escanea mi contacto
                </span>
              </div>
            </div>

            {/* BACK OF THE CARD */}
            <div
              className="print-page flex flex-col items-center justify-center text-center relative overflow-hidden bg-cover bg-center select-none"
              style={{
                width: '85mm',
                height: '55mm',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                boxSizing: 'border-box',
                backgroundColor: vcard.theme_color || '#24744C',
                backgroundImage: vcard.card_back_bg_url ? `url(${vcard.card_back_bg_url})` : undefined
              }}
            >
              {/* Dynamic HSL semi-transparent overlay to keep consistent color branding */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundColor: vcard.theme_color || '#24744C',
                  opacity: vcard.card_back_bg_url ? 0.78 : 1,
                  zIndex: 1
                }}
              />

              {/* Back card info container */}
              <div className="relative z-10 flex flex-col items-center justify-center gap-[4mm] w-full px-[8mm]">
                {vcard.company_logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={vcard.company_logo_url}
                    alt={vcard.company || 'Logo de la empresa'}
                    className="h-[14mm] max-w-[70mm] object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]"
                  />
                ) : (
                  <span
                    className="font-black text-white uppercase tracking-widest leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)] truncate max-w-full"
                    style={{ fontSize: '4.5mm' }}
                  >
                    {vcard.company || 'ORGANIZACIÓN'}
                  </span>
                )}

                {vcard.website && (
                  <span
                    className="font-bold text-white/90 tracking-wider block bg-black/25 py-[1.2mm] px-[4mm] rounded-full backdrop-blur-[2px] truncate max-w-full"
                    style={{
                      fontSize: '2.2mm',
                      letterSpacing: '0.2mm',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 1px 2px rgba(0,0,0,0.15)'
                    }}
                  >
                    {vcard.website.replace(/(^\w+:|^)\/\//, '')}
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
