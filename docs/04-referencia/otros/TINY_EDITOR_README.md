# Configuración del Editor TinyMCE

Este proyecto utiliza TinyMCE como editor de texto enriquecido para la gestión de contenido de vehículos y artículos del blog.

## API Key

La API key de TinyMCE está configurada en el código como fallback, pero es recomendable configurarla en las variables de entorno.

### Configuración Local

Crea un archivo `.env.local` en la raíz del proyecto (si no existe) y añade:

```env
NEXT_PUBLIC_TINYMCE_API_KEY=di2vd063kukhcz9eqysedg5eyh1hd3q6u7hphgp35035i3hs
```

### Componente TinyEditor

El componente está ubicado en `src/components/admin/tiny-editor.tsx` y se utiliza mediante importación dinámica para evitar problemas con SSR.

## Uso del Editor

### En formularios de vehículos:

```tsx
import dynamic from "next/dynamic";

const TinyEditor = dynamic(
  () => import("@/components/admin/tiny-editor").then((mod) => mod.TinyEditor),
  { ssr: false }
);

// En el componente
<TinyEditor
  value={content}
  onChange={setContent}
  height={400}
  placeholder="Descripción del vehículo..."
/>
```

### En artículos del blog:

```tsx
<TinyEditor
  value={content}
  onChange={setContent}
  height={500}
  placeholder="Escribe el contenido del artículo..."
/>
```

## Características

- ✅ Editor WYSIWYG completo
- ✅ Toolbar personalizable con todas las herramientas necesarias
- ✅ Soporte para imágenes (con subida base64 por defecto)
- ✅ Tablas, listas, enlaces
- ✅ Código y pre-formateado
- ✅ Plantillas predefinidas para CTAs y cajas de información
- ✅ Idioma español
- ✅ Estilos personalizados con los colores de Furgocasa

## Personalización

El editor está configurado con estilos personalizados en `content_style` que incluyen:
- Tipografía Inter
- Colores de marca (Furgocasa Orange: #FF6B35)
- Estilos para títulos, párrafos, imágenes, citas, código, tablas

## Archivos de Idioma

Los archivos de traducción al español están en `public/tinymce/langs/es.js` y se cargan automáticamente.

## Páginas que usan el editor:

1. **Vehículos (Alquiler/Venta)**
   - `/administrator/vehiculos/nuevo` - Crear nuevo vehículo
   - `/administrator/vehiculos/[id]/editar` - Editar vehículo existente

2. **Blog**
   - `/administrator/blog/articulos/nuevo` - Crear nuevo artículo
   - `/administrator/blog/articulos/[id]` - Editar artículo existente

## Notas Importantes

- El editor se carga dinámicamente con `ssr: false` para evitar problemas de hidratación
- La subida de imágenes actualmente convierte a base64. Para producción, se recomienda implementar subida a Supabase Storage
- El componente antiguo `RichTextEditor.tsx` (basado en TipTap) ha sido reemplazado por TinyEditor en los formularios de vehículos


