import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function proxy(request: NextRequest) {
  // Redirigimos la petición al helper de Supabase SSR
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Intercepta todas las peticiones excluyendo:
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico (icono del sitio)
     * - rutas de webhooks, api públicas, etc.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
