-- ==========================================
-- ESQUEMA DE BASE DE DATOS PARA VCARDS
-- Ejecutar esto en la consola SQL de Supabase
-- ==========================================

-- Crear la tabla vcards si no existe
CREATE TABLE IF NOT EXISTS public.vcards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    slug TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    job_title TEXT,
    company TEXT,
    email TEXT,
    phone TEXT,
    whatsapp TEXT,
    website TEXT,
    address TEXT,
    profile_image_url TEXT,
    company_logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.vcards ENABLE ROW LEVEL SECURITY;

-- 1. Política para SELECT: Permitir lectura pública a cualquiera
CREATE POLICY "Permitir lectura publica de vcards" 
ON public.vcards 
FOR SELECT 
USING (true);

-- 2. Política para INSERT: Solo el usuario autenticado para sí mismo
CREATE POLICY "Permitir insercion a usuarios autenticados" 
ON public.vcards 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- 3. Política para UPDATE: Solo el dueño de la vCard
CREATE POLICY "Permitir actualizacion a dueños" 
ON public.vcards 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- 4. Política para DELETE: Solo el dueño de la vCard
CREATE POLICY "Permitir borrado a dueños" 
ON public.vcards 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- Trigger para mantener actualizado 'updated_at' automáticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_vcard_updated
    BEFORE UPDATE ON public.vcards
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Crear un índice en la columna 'slug' para optimizar las consultas públicas
CREATE INDEX IF NOT EXISTS vcards_slug_idx ON public.vcards (slug);
