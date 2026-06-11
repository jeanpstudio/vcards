import { Jimp } from 'jimp'
import { createClient } from '@/utils/supabase/server'

/**
 * Recibe un objeto File (de un formulario), lo redimensiona y optimiza a JPEG con Jimp,
 * y lo sube al bucket 'vcard-images' de Supabase Storage.
 * Retorna la URL pública de la imagen subida.
 */
export async function uploadAndOptimizeImage(
  file: File,
  type: 'avatar' | 'logo' | 'bg' | 'card_bg',
  userId: string
): Promise<string | null> {
  // Validar si el archivo es válido
  if (!file || file.size === 0 || !file.type.startsWith('image/')) {
    return null
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const image = await Jimp.read(buffer)

    if (type === 'avatar') {
      // Foto de perfil: recortar en cuadrado 400x400
      image.cover({ w: 400, h: 400 })
    } else if (type === 'logo') {
      // Logo corporativo: redimensionar a max 500x250 conservando aspecto
      const maxWidth = 500
      const maxHeight = 250
      if (image.width > maxWidth || image.height > maxHeight) {
        image.scaleToFit({ w: maxWidth, h: maxHeight })
      }
    } else if (type === 'card_bg') {
      // Fondo de reverso de tarjeta: recortar a 1016x638 (proporción 85.6mm x 53.98mm)
      image.cover({ w: 1016, h: 638 })
    } else {
      // Fondo de portada: redimensionar a max 1200x600 conservando aspecto
      const maxWidth = 1200
      const maxHeight = 600
      if (image.width > maxWidth || image.height > maxHeight) {
        image.scaleToFit({ w: maxWidth, h: maxHeight })
      }
    }

    // Determinar formato, buffer y tipo de contenido según el tipo
    let optimizedBuffer: Buffer
    let fileName: string
    let contentType: string

    if (type === 'logo') {
      optimizedBuffer = await image.getBuffer('image/png')
      fileName = `${userId}/${type}_${Date.now()}.png`
      contentType = 'image/png'
    } else {
      optimizedBuffer = await image.getBuffer('image/jpeg', { quality: 80 })
      fileName = `${userId}/${type}_${Date.now()}.jpg`
      contentType = 'image/jpeg'
    }

    const supabase = await createClient()

    // Subir a Supabase Storage
    const { data, error } = await supabase.storage
      .from('vcard-images')
      .upload(fileName, optimizedBuffer, {
        contentType,
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
