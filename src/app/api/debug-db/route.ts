import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Obtener sesión activa
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    // Obtener todas las vCards sin filtros de RLS
    // Nota: Como estamos en un endpoint de servidor, RLS se aplicará según las credenciales de la cookie.
    const { data: vcards, error: dbError } = await supabase
      .from('vcards')
      .select('*')

    return NextResponse.json({
      success: true,
      currentUserSession: user 
        ? { id: user.id, email: user.email } 
        : 'SIN SESIÓN ACTIVA (Nulo)',
      authError: authError ? authError.message : null,
      totalVCardsInDB: vcards ? vcards.length : 0,
      vcardsList: vcards || [],
      dbError: dbError ? dbError.message : null
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
