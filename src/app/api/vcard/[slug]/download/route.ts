import { createClient } from '@/utils/supabase/server'
import { generateVCF } from '@/utils/vcf'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    // Conectar a Supabase como cliente del servidor
    const supabase = await createClient()
    
    // Obtener los datos de la vCard correspondientes al slug
    const { data: vcard, error } = await supabase
      .from('vcards')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error || !vcard) {
      return new NextResponse('vCard no encontrada', { status: 404 })
    }

    // Generar el contenido del archivo .vcf
    const vcfString = generateVCF(vcard)
    
    // Formatear el nombre de archivo seguro
    const safeFirstName = (vcard.first_name || '').replace(/[^a-zA-Z0-9]/g, '')
    const safeLastName = (vcard.last_name || '').replace(/[^a-zA-Z0-9]/g, '')
    const filename = `${safeFirstName}_${safeLastName}` || 'contacto'

    // Retornar el archivo VCF con las cabeceras HTTP correctas para forzar la descarga en el móvil
    return new NextResponse(vcfString, {
      status: 200,
      headers: {
        'Content-Type': 'text/vcard; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}.vcf"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    console.error('Error al generar la descarga de vCard:', error)
    return new NextResponse('Error interno del servidor', { status: 500 })
  }
}
