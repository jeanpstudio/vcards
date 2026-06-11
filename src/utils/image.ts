// @ts-expect-error - sharp type exports resolving issue in Next.js tsconfig
import sharp from 'sharp'
import { createClient } from '@/utils/supabase/server'

/**
 * Recibe un objeto File (de un formulario), lo redimensiona y optimiza a WebP con Sharp,
 * y lo sube al bucket 'vcard-images' de Supabase Storage.
 * Retorna la URL pública de la imagen subida.
 */
export async function uploadAndOptimizeImage(
  file: File,
  type: 'avatar' | 'logo' | 'bg',
  userId: string
): Promise<string | null> {
  // Validar si el archivo es válido
  if (!file || file.size === 0 || !file.type.startsWith('image/')) {
    return null
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    let sharpInstance = sharp(buffer)

    if (type === 'avatar') {
      // Foto de perfil: recortar en cuadrado 400x400
      sharpInstance = sharpInstance.resize(400, 400, {
        fit: 'cover',
        position: 'center'
      })
    } else if (type === 'logo') {
      // Logo corporativo: redimensionar a max 500x250 conservando aspecto
      sharpInstance = sharpInstance.resize(500, 250, {
        fit: 'inside',
        withoutEnlargement: true
      })
    } else {
      // Fondo de portada: redimensionar a max 1200x600 conservando aspecto
      sharpInstance = sharpInstance.resize(1200, 600, {
        fit: 'inside',
        withoutEnlargement: true
      })
    }

    // Convertir a WebP y comprimir a calidad 80
    const optimizedBuffer = await sharpInstance
      .webp({ quality: 80 })
      .toBuffer()

    const supabase = await createClient()
    
    // Generar ruta de archivo única estructurada por ID de usuario
    const fileName = `${userId}/${type}_${Date.now()}.webp`

    // Subir a Supabase Storage
    const { data, error } = await supabase.storage
      .from('vcard-images')
      .upload(fileName, optimizedBuffer, {
        contentType: 'image/webp',
        cacheControl: '31536000', // Cache por 1 año
        upsert: true
      })

    if (error || !data) {
      console.error('Error al subir imagen a Supabase Storage:', error)
      return null
    }

    // Obtener la URL pública final
    const { data: { publicUrl } } = supabase.storage
      .from('vcard-images')
      .getPublicUrl(fileName)

    return publicUrl
  } catch (err) {
    console.error('Error al optimizar/subir imagen:', err)
    return null
  }
}
