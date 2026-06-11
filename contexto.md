# Contexto del Proyecto: SaaS de vCards Dinámicas y Códigos QR

Este archivo sirve para registrar de forma continua las decisiones arquitectónicas, características del sistema, el historial de cambios y las actualizaciones realizadas en el proyecto.

---

## 🛠️ Stack Tecnológico Utilizado
- **Framework**: Next.js 16.2.1 (App Router, Turbopack)
- **Base de Datos y Autenticación**: Supabase (`@supabase/ssr` con cookies seguras en Server Components y Edge Middleware)
- **Estilos**: Tailwind CSS v4 (Scaffolding atómico avanzado)
- **Componentes UI**: shadcn/ui (Basado en `@base-ui/react` y Tailwind CSS)
- **Generación de QR**: `qrcode` (npm) ejecutado en servidor para mayor performance y carga instantánea.
- **Generación de VCF**: Utilidad personalizada e independiente escrita en TypeScript (`src/utils/vcf.ts`).

---

## 📋 Arquitectura e Historial de Implementación

### 1. Base de Datos (Supabase SQL)
- **Archivo**: `supabase_schema.sql` (creado en la raíz).
- **Tabla**: `public.vcards`.
- **Estructura**:
  - `id` (UUID, Primary Key, Auto-generado).
  - `user_id` (UUID, Referencia a `auth.users(id)`).
  - `slug` (TEXT, Único, Indexado para lecturas óptimas).
  - Campos de contacto: `first_name`, `last_name`, `job_title`, `company`, `email`, `phone`, `whatsapp`, `website`, `address`.
  - Archivos multimedia: `profile_image_url`, `company_logo_url`.
  - Fechas: `created_at`, `updated_at` (gestionado con trigger automático `plpgsql`).
- **Seguridad (RLS)**:
  - Lectura (`SELECT`): Pública y accesible para cualquier usuario (`true`).
  - Escritura/Edición/Borrado (`INSERT`/`UPDATE`/`DELETE`): Solo para usuarios autenticados donde `auth.uid() = user_id`.

### 2. Autenticación (Login)
- **Ruta**: `/login`.
- **Acciones**: `signIn` y `signUp` en `src/actions/auth.ts` usando la API de contraseña de Supabase.
- **Diseño**: Interfaz de usuario oscura ultra moderna con gradientes interactivos de alta fidelidad, soporte de cargas (loading states) con `useTransition` y renderizado de errores/éxitos.

### 3. Panel de Administración (Dashboard)
- **Ruta**: `/dashboard`.
- **Componentes Creados**:
  - `CopyButton.tsx`: Botón cliente interactivo con feedback táctil y visual para copiar la URL pública.
  - `DeleteButton.tsx`: Botón cliente con confirmación nativa de eliminación antes de llamar a la Server Action `deleteVCard`.
- **Funcionalidad**:
  - Lista de vCards asociadas al usuario autenticado.
  - Generación en tiempo real del código QR en el servidor (`QRCode.toDataURL`).
  - Botón para descargar el código QR directamente en formato PNG.
  - Onboarding limpio en caso de no tener vCards creadas.

### 4. Creación y Edición de vCards
- **Rutas**: `/dashboard/new` y `/dashboard/edit/[id]`.
- **Componente**: `src/components/VCardForm.tsx` (Formulario compartido).
- **Funcionalidad**:
  - Generación de slug inteligente en tiempo real basada en el Nombre y Apellido introducidos (desactivable de forma manual).
  - Previsualización dinámica en tiempo real de la imagen de perfil y el logotipo de empresa al ingresar sus respectivas URLs.
  - Alerta de errores de validación de slugs duplicados en base de datos.
  - Redirección con revalidación de ruta usando Server Actions en `src/actions/vcard.ts`.

### 5. Generador y Descargador de vCard (.vcf)
- **Utilidad**: `src/utils/vcf.ts`.
- **API Endpoint**: `src/app/api/vcard/[slug]/download/route.ts`.
  - Genera el contenido del archivo bajo la especificación vCard 3.0.
  - Fuerza la descarga inmediata en navegadores de escritorio y móviles mediante cabeceras HTTP (`Content-Type: text/vcard` y `Content-Disposition: attachment`).

### 6. Vista Pública de la Tarjeta
- **Ruta**: `/vcard/[slug]`.
- **Diseño**: Orientado a dispositivos móviles, extremadamente limpio y premium con gradientes de fondo, avatar circular y accesos directos optimizados:
  - **Llamar**: Enlace directo `tel:`.
  - **WhatsApp**: Enlace directo `wa.me` con mensaje predefinido y codificado.
  - **Correo**: Enlace directo `mailto:`.
  - **Ubicación**: Enlace directo a Google Maps con la dirección física codificada.
  - **Sitio Web**: Enlace a la URL externa.
  - **Botón Destacado Flotante**: Enlace directo al endpoint de descarga de VCF para añadir el contacto a la agenda del móvil con un solo clic.

### 7. Diseños de Impresión Física y PDF
- **Ruta**: `/dashboard/print/[id]`.
- **Componentes**: 
  - `PrintTab.tsx`: Pestaña interactiva en el Dashboard para previsualizar los formatos físicos en pantalla, gestionar la carga del fondo de la contracara e iniciar el proceso de impresión.
  - `PrintControls.tsx`: Controles cliente flotantes no imprimibles para disparar `window.print()` nativo y cerrar la pestaña.
- **Formatos Físicos de Impresión**:
  - **Fotosheck (Credencial)**: Orientación vertical de `54mm x 86mm`. Muestra foto de perfil circular, nombre grande, cargo, código QR y logo de empresa en el footer.
  - **Tarjeta de Presentación**: Orientación horizontal de `85mm x 55mm` a doble cara. El frente contiene la foto, datos de contacto y QR, y el dorso muestra el logo, el sitio web y permite una imagen de fondo de contracara personalizada.
- **Configuración de Impresión por CSS**:
  - Utiliza reglas `@page` dinámicas basadas en el formato y consultas `@media print` para ocultar controles interactivos, forzar colores de fondo (`print-color-adjust: exact`) y establecer cortes de página perfectos.

---

## 📅 Registro de Cambios

### [2026-06-12] - Diseños de Impresión Física y Exportación PDF
- **Base de Datos**: Agregada columna `card_back_bg_url` a la tabla `vcards` para almacenar fondos personalizados del reverso de la tarjeta.
- **Acciones y Utilidades**: Implementado soporte para tipo de imagen `'card_bg'` (procesado con Jimp a `1016x638` píxeles) y server actions `updateCardBackBg` y `deleteCardBackBg` para gestionar el fondo.
- **Panel de Administración (Dashboard)**: Integrado sistema de pestañas interactivo (`?tab=digital` y `?tab=print`) con selector de vCards, previsualizaciones a escala real con colores derivados (original, claro y oscuro en HSL) y cargador de fondo.
- **Ruta de Impresión**: Creado [`src/app/dashboard/print/[id]/page.tsx`] con soporte para `?type=badge` y `?type=card` aplicando estilos CSS milimétricos exactos para impresión nativa sin librerías pesadas y con auto-disparo de `window.print()`.

### [2026-06-11] - Lanzamiento Inicial
- Creación de base de datos (`supabase_schema.sql`).
- Implementación de toda la arquitectura de la aplicación vCards SaaS (Dashboard, Formulario, QR, VCF y Vista Pública).
- Verificación exitosa de compilación del proyecto con Next.js 16 y TypeScript.

### [2026-06-11] - Optimización de Rutas y Corrección Next.js 16
- **Redirección de Ruta Raíz**: Se modificó `src/app/page.tsx` para redirigir automáticamente de `/` a `/dashboard` para que la aplicación cargue directamente la lógica de vCards.
- **Corrección de Middleware Deprecado**: Se renombró `src/middleware.ts` a `src/proxy.ts` y se exportó la función como `proxy` para cumplir con las convenciones de Next.js 16, eliminando la advertencia `The "middleware" file convention is deprecated. Please use "proxy" instead.` del log de desarrollo.

### [2026-06-11] - Rediseño de vCard (Fidelidad a Captura) y Selector de Colores
- **Rediseño Visual**: Se modificó la vista pública de vCard [`src/app/vcard/[slug]/page.tsx`](file:///Users/jeanpstudio/Desktop/Apps/vcards/src/app/vcard/[slug]/page.tsx) para calcar el diseño de la captura del usuario (cabecera con foto integrada, 3 botones flotantes circulares para llamar/email/mapa, botón "Añadir contacto" ancho, sección bio y enlace a Facebook).
- **Personalización de Temas**: Se agregaron las columnas `theme_color` y `bio` a la base de datos y se actualizaron las Server Actions de vCard para persistirlos.
- **Formulario Mejorado**: Se actualizó [`src/components/VCardForm.tsx`](file:///Users/jeanpstudio/Desktop/Apps/vcards/src/components/VCardForm.tsx) añadiendo un selector de color interactivo con presets rápidos y un campo de biografía.

### [2026-06-11] - Subida y Optimización de Imágenes con Sharp & Endpoint de Debug
- **Subida de Archivos**: Se reemplazaron los inputs de texto de URL por inputs de archivos de imagen tipo file en el formulario.
- **Optimización con Sharp**: Se instaló la librería `sharp` y se implementó [`src/utils/image.ts`](file:///Users/jeanpstudio/Desktop/Apps/vcards/src/utils/image.ts) para procesar en el servidor las imágenes: redimensión cuadrada a 400x400 para avatares y límite de 500x250 para logos, convirtiéndolas automáticamente a formato WebP ligero con calidad 80.
- **Persistencia en Storage**: Se configuró la subida automática al bucket de Supabase Storage `vcard-images` guardando la URL pública en base de datos.
- **Endpoint de Depuración**: Se creó [`src/app/api/debug-db/route.ts`](file:///Users/jeanpstudio/Desktop/Apps/vcards/src/app/api/debug-db/route.ts) en `/api/debug-db` para auditar rápidamente en el navegador el estado de la sesión de Supabase y las vCards insertadas.

### [2026-06-11] - Redes Sociales Dinámicas (JSONB), Incremento de Padding y Pulido Móvil
- **Base de Datos**: Se diseñó la columna `social_links` de tipo `JSONB` en la tabla `vcards` para guardar de forma flexible los enlaces sociales (Facebook, Instagram, LinkedIn, Twitter/X).
- **Formulario Integrado**: Se actualizaron las acciones y el formulario [`src/components/VCardForm.tsx`](file:///Users/jeanpstudio/Desktop/Apps/vcards/src/components/VCardForm.tsx) con campos específicos para cada red, almacenándolos en un solo objeto JSONB en Supabase.
- **Visuales & Padding**: Se rediseñó la cabecera en [`src/app/vcard/[slug]/page.tsx`](file:///Users/jeanpstudio/Desktop/Apps/vcards/src/app/vcard/[slug]/page.tsx) ampliando el padding vertical a `pt-20 pb-20`, centrando perfectamente los elementos (avatar, nombre y cargo) e incrementando la tipografía del nombre (`text-3xl font-black`) para lograr un aspecto más limpio y premium.
- **Botones de Acción Rápida**: Se añadieron márgenes verticales holgados (`mt-8 mb-8`) al contenedor de los 3 botones flotantes y se implementó una animación hover elegante (`hover:scale-110 hover:shadow-lg transition-all duration-300 ease-out`).
- **Filas de Contacto**: Se duplicó el padding vertical (`py-6`) y se incrementó el padding horizontal un 50% (`px-6`) en las celdas de la ficha de contacto, separando la estructura mediante dividers suaves y añadiendo efectos reactivos de hover (`hover:bg-slate-50/30`).
- **Redes Dinámicas y Adaptabilidad**: Los enlaces sociales se renderizan dinámicamente según lo configurado, con sus colores e iconos oficiales correspondientes. Además, el diseño se optimizó con clases móviles nativas (`w-full min-h-screen` en pantallas pequeñas sin bordes para calzar al 100% y `sm:rounded-3xl sm:border sm:shadow-2xl` en pantallas de escritorio).
