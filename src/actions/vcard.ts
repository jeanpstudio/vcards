'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { uploadAndOptimizeImage } from '@/utils/image'

export interface SaveVCardResponse {
  error?: string
  success?: boolean
  redirect?: string
}

/**
 * Server Action para guardar (crear o actualizar) una vCard.
 */
export async function saveVCard(formData: FormData): Promise<SaveVCardResponse> {
  const supabase = await createClient()
  
  // Obtener usuario actual
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'No estás autenticado.' }
  }

  const id = formData.get('id') as string | null
  const slugRaw = formData.get('slug') as string
  const firstName = formData.get('first_name') as string
  const lastName = formData.get('last_name') as string
  const jobTitle = formData.get('job_title') as string
  const company = formData.get('company') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const whatsapp = formData.get('whatsapp') as string
  const website = formData.get('website') as string
  const address = formData.get('address') as string
  const themeColor = formData.get('theme_color') as string
  const bio = formData.get('bio') as string

  // Redes sociales
  const socialFacebook = formData.get('social_facebook') as string
  const socialInstagram = formData.get('social_instagram') as string
  const socialLinkedin = formData.get('social_linkedin') as string
  const socialTwitter = formData.get('social_twitter') as string

  // Fondo de portada
  const headerBgFile = formData.get('header_bg_file') as File | null
  const existingHeaderBgUrl = formData.get('header_bg_url') as string
  const headerOverlay = formData.get('header_overlay') === 'true'

  // Archivos de imagen
  const profileImageFile = formData.get('profile_image_file') as File | null
  const companyLogoFile = formData.get('company_logo_file') as File | null

  // URLs de imagen existentes/escritas a mano
  const existingProfileImageUrl = formData.get('profile_image_url') as string
  const existingCompanyLogoUrl = formData.get('company_logo_url') as string

  // Validaciones básicas requeridas
  if (!slugRaw || !firstName || !lastName) {
    return { error: 'El slug, nombre y apellido son obligatorios.' }
  }

  // Limpiar y validar slug
  const slug = slugRaw
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^a-z0-9-_]/g, '')     // Caracteres url válidos
    
  if (slug.length < 2) {
    return { error: 'El slug debe tener al menos 2 caracteres válidos.' }
  }

  // Verificar si el slug ya existe en otra vCard
  let checkQuery = supabase
    .from('vcards')
    .select('id')
    .eq('slug', slug)
    
  if (id) {
    checkQuery = checkQuery.neq('id', id)
  }
  
  const { data: existing, error: checkError } = await checkQuery.maybeSingle()
  
  if (checkError) {
    return { error: 'Error al comprobar disponibilidad del slug.' }
  }
  if (existing) {
    return { error: `El slug "${slug}" ya está registrado para otra vCard.` }
  }

  // Procesar Foto de Perfil (Subida local vs URL escrita)
  let profileImageUrl = existingProfileImageUrl ? existingProfileImageUrl.trim() : null
  if (profileImageFile && profileImageFile.size > 0) {
    const uploadedUrl = await uploadAndOptimizeImage(profileImageFile, 'avatar', user.id)
    if (uploadedUrl) {
      profileImageUrl = uploadedUrl
    }
  }

  // Procesar Logo (Subida local vs URL escrita)
  let companyLogoUrl = existingCompanyLogoUrl ? existingCompanyLogoUrl.trim() : null
  if (companyLogoFile && companyLogoFile.size > 0) {
    const uploadedUrl = await uploadAndOptimizeImage(companyLogoFile, 'logo', user.id)
    if (uploadedUrl) {
      companyLogoUrl = uploadedUrl
    }
  }

  // Procesar Fondo de Portada (Subida local vs URL existente)
  let headerBgUrl = existingHeaderBgUrl ? existingHeaderBgUrl.trim() : null
  if (headerBgFile && headerBgFile.size > 0) {
    const uploadedUrl = await uploadAndOptimizeImage(headerBgFile, 'bg', user.id)
    if (uploadedUrl) {
      headerBgUrl = uploadedUrl
    }
  }

  // Construir JSON de enlaces sociales y configuraciones de diseño
  const socialLinks = {
    facebook: socialFacebook ? socialFacebook.trim() : null,
    instagram: socialInstagram ? socialInstagram.trim() : null,
    linkedin: socialLinkedin ? socialLinkedin.trim() : null,
    twitter: socialTwitter ? socialTwitter.trim() : null,
    header_bg_url: headerBgUrl,
    header_overlay: headerOverlay
  }

  const payload = {
    slug,
    first_name: firstName.trim(),
    last_name: lastName.trim(),
    job_title: jobTitle ? jobTitle.trim() : null,
    company: company ? company.trim() : null,
    email: email ? email.trim() : null,
    phone: phone ? phone.trim() : null,
    whatsapp: whatsapp ? whatsapp.trim() : null,
    website: website ? website.trim() : null,
    address: address ? address.trim() : null,
    profile_image_url: profileImageUrl,
    company_logo_url: companyLogoUrl,
    theme_color: themeColor ? themeColor.trim() : '#24744C',
    bio: bio ? bio.trim() : null,
    social_links: socialLinks,
    user_id: user.id
  }


  if (id) {
    // Modo Edición
    const { error: updateError } = await supabase
      .from('vcards')
      .update(payload)
      .eq('id', id)
      .eq('user_id', user.id) // Validar propiedad
      
    if (updateError) {
      return { error: `Error al actualizar vCard: ${updateError.message}` }
    }
  } else {
    // Modo Creación
    const { error: insertError } = await supabase
      .from('vcards')
      .insert(payload)
      
    if (insertError) {
      return { error: `Error al crear vCard: ${insertError.message}` }
    }
  }

  // Revalidar cachés
  revalidatePath('/dashboard')
  revalidatePath(`/vcard/${slug}`)

  return { success: true, redirect: '/dashboard' }
}

/**
 * Server Action para eliminar una vCard.
 */
export async function deleteVCard(id: string): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'No estás autorizado.' }
  }

  const { error } = await supabase
    .from('vcards')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
