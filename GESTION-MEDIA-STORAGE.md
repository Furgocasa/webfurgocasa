# Gestión de Media Storage - Furgocasa

## 📋 Resumen

Sistema completo de gestión de archivos multimedia para el panel de administrador de Furgocasa, utilizando Supabase Storage con 4 buckets organizados por categorías.

---

## 🗂️ Estructura de Buckets

La aplicación utiliza **4 buckets públicos** en Supabase Storage:

| Bucket | Descripción | Icono | Uso |
|--------|-------------|-------|-----|
| **vehicles** | Imágenes de vehículos | 🚐 | Fotos principales, galerías de cada furgoneta/camper |
| **blog** | Imágenes del blog | 📝 | Imágenes de artículos, portadas, contenido editorial |
| **extras** | Imágenes de extras | 🎁 | Fotos de equipamiento adicional, accesorios |
| **media** | Media general | 📸 | Imágenes generales, recursos compartidos |

---

## ⚠️ Problema Detectado

Al intentar crear carpetas en el bucket `media`, la operación se quedaba bloqueada porque:

1. ❌ El bucket `media` tenía **0 políticas RLS** configuradas
2. ❌ El bucket `extras` tenía **0 políticas RLS** configuradas
3. ✅ Los buckets `blog` y `vehicles` ya tenían 4 políticas cada uno

**Sin políticas RLS, los administradores no pueden:**
- Subir archivos
- Crear carpetas
- Eliminar archivos
- Actualizar metadata

---

## ✅ Solución Implementada

### Paso 1: Ejecutar Script SQL en Supabase

**Archivo:** `supabase/configurar-storage-media-extras.sql`

Este script configura **4 políticas RLS** para cada bucket (`media` y `extras`):

1. **Lectura pública** (`*_public_read`): Cualquiera puede ver las imágenes
2. **Inserción admin** (`*_admin_insert`): Solo administradores pueden subir
3. **Actualización admin** (`*_admin_update`): Solo administradores pueden modificar
4. **Eliminación admin** (`*_admin_delete`): Solo administradores pueden eliminar

**Cómo ejecutarlo:**

1. Abre Supabase Dashboard
2. Ve a **SQL Editor**
3. Copia y pega el contenido de `configurar-storage-media-extras.sql`
4. Haz clic en **Run**
5. Verifica que aparezcan 4 políticas para cada bucket

### Paso 2: Actualizar Código TypeScript

**Archivos modificados:**

1. **`src/lib/supabase/storage.ts`**
   - Añadido `'media'` al tipo `BucketType`
   
   ```typescript
   export type BucketType = 'vehicles' | 'blog' | 'extras' | 'media';
   ```

2. **`src/app/administrator/(protected)/media/page.tsx`**
   - Añadido botón "📸 Media" para seleccionar el bucket
   - Añadido botón "🎁 Extras" para seleccionar el bucket
   - Actualizado el display del bucket actual en las estadísticas

---

## 🚀 Funcionalidades del Sistema

### Crear Carpetas

1. Navega al bucket deseado (Vehículos, Blog, Extras o Media)
2. Haz clic en **"Nueva Carpeta"**
3. Ingresa el nombre (ej: `FU0010`, `FU0011` para vehículos)
4. Confirma

**Tip:** Usa códigos como `FU0010`, `FU0011` para organizar por vehículo.

### Subir Archivos

**Método 1: Drag & Drop**
- Arrastra imágenes desde tu explorador de archivos
- Suéltalas en el área de carga

**Método 2: Click**
- Haz clic en el área de carga
- Selecciona archivos desde el explorador

**Limitaciones:**
- Formatos permitidos: JPG, PNG, WebP, GIF
- Tamaño máximo: 10MB por archivo
- Se validan automáticamente antes de subir

### Navegar por Carpetas

- Haz clic en el icono 📁 de una carpeta para abrirla
- Usa el **breadcrumb** en la parte superior para navegar
- Haz clic en 🏠 **Raíz** para volver al inicio

### Gestionar Archivos

**Ver imagen:**
- Hover sobre la imagen
- Clic en 👁️ Ver

**Copiar URL:**
- Hover sobre la imagen
- Clic en 📋 Copiar URL
- La URL pública se copia al portapapeles

**Eliminar:**
- Hover sobre la imagen
- Clic en 🗑️ Eliminar
- Confirma la acción

### Eliminar Carpetas

- Hover sobre la carpeta
- Clic en 🗑️ (aparece al hacer hover)
- Confirma la eliminación
- ⚠️ **Se eliminará todo el contenido de la carpeta**

### Búsqueda

Usa el campo de búsqueda en la parte superior para filtrar archivos por nombre.

### Vistas

Alterna entre dos modos de visualización:
- **🔲 Cuadrícula**: Vista de miniaturas (por defecto)
- **📋 Lista**: Vista de tabla con detalles

---

## 🔐 Seguridad

### Políticas RLS

Cada bucket tiene **4 políticas** configuradas:

```sql
-- Ejemplo para bucket 'media'
1. media_public_read    -> Cualquiera puede VER
2. media_admin_insert   -> Solo admins pueden SUBIR
3. media_admin_update   -> Solo admins pueden MODIFICAR
4. media_admin_delete   -> Solo admins pueden ELIMINAR
```

### Validación de Administradores

Las políticas verifican que el usuario:
1. Esté autenticado (`TO authenticated`)
2. Exista en la tabla `admins`
3. Tenga `is_active = true`
4. Su `user_id` coincida con `auth.uid()`

---

## 🗂️ Organización Recomendada

### Bucket: vehicles
```
vehicles/
├── FU0010/
│   ├── 1734567890-abc123.jpg  (principal)
│   ├── 1734567891-def456.jpg  (interior)
│   └── 1734567892-ghi789.jpg  (exterior)
├── FU0011/
│   └── ...
└── FU0012/
    └── ...
```

### Bucket: blog
```
blog/
├── guias-viaje/
│   ├── costa-brava-portada.jpg
│   └── costa-brava-mapa.jpg
├── consejos/
│   └── mantenimiento-camper.jpg
└── noticias/
    └── nuevos-vehiculos-2026.jpg
```

### Bucket: extras
```
extras/
├── EX001-bici/
│   ├── bici-frontal.jpg
│   └── bici-lateral.jpg
├── EX002-nevera/
│   └── nevera-portatil.jpg
└── EX003-toldo/
    └── toldo-desplegado.jpg
```

### Bucket: media
```
media/
├── logos/
│   ├── furgocasa-logo.png
│   └── furgocasa-logo-blanco.png
├── banners/
│   └── promocion-verano-2026.jpg
└── general/
    └── ...
```

---

## 📊 Verificación

### Comprobar políticas en Supabase

Ejecuta en SQL Editor:

```sql
SELECT 
    b.id as bucket_id,
    b.name as bucket_name,
    b.public as is_public,
    COUNT(p.policyname) as policy_count
FROM storage.buckets b
LEFT JOIN pg_policies p ON (
    p.schemaname = 'storage' 
    AND p.tablename = 'objects'
    AND p.policyname LIKE '%' || b.id || '%'
)
WHERE b.id IN ('media', 'blog', 'extras', 'vehicles')
GROUP BY b.id, b.name, b.public
ORDER BY b.id;
```

**Resultado esperado:**

| bucket_id | bucket_name | is_public | policy_count |
|-----------|-------------|-----------|--------------|
| blog      | blog        | true      | 4            |
| extras    | extras      | true      | 4            |
| media     | media       | true      | 4            |
| vehicles  | vehicles    | true      | 4            |

Si algún bucket tiene menos de 4 políticas, ejecuta el script `configurar-storage-media-extras.sql`.

---

## 🔧 Troubleshooting

### Error: "Error al crear carpeta"

**Causa:** El bucket no tiene políticas RLS configuradas.

**Solución:** Ejecuta el script SQL correspondiente en Supabase.

### Error: "Error al subir archivos"

**Posibles causas:**
1. Archivo muy grande (>10MB)
2. Formato no permitido
3. Falta configurar políticas RLS
4. No estás autenticado como administrador

**Solución:**
1. Verifica el tamaño del archivo
2. Usa solo JPG, PNG, WebP o GIF
3. Ejecuta el script SQL
4. Verifica que tu usuario esté en la tabla `admins` con `is_active=true`

### Las imágenes no se ven en el frontend

**Causa:** El bucket no es público.

**Solución:** 
1. Ve a Supabase Dashboard > Storage
2. Selecciona el bucket
3. Haz clic en "Settings"
4. Marca "Public bucket"

---

## 📱 URLs Públicas

Las URLs generadas son públicas y tienen este formato:

```
https://[tu-proyecto].supabase.co/storage/v1/object/public/[bucket]/[path]
```

**Ejemplo:**
```
https://uyxgnqtdebyzllkbuef.supabase.co/storage/v1/object/public/vehicles/FU0010/1734567890-abc123.jpg
```

Estas URLs pueden usarse directamente en:
- Componentes de vehículos
- Artículos del blog
- Galerías de extras
- Meta tags SEO

---

## 🎯 Próximos Pasos

### Mejoras Futuras

1. **Compresión automática de imágenes**
   - Implementar edge function para optimizar imágenes al subir
   - Generar múltiples resoluciones (thumbnail, medium, large)

2. **Metadata enriquecida**
   - Añadir alt text para SEO
   - Tags para búsqueda avanzada
   - Información de copyright

3. **Integración con editor**
   - Selector de imágenes en editor de vehículos
   - Selector de imágenes en editor de blog
   - Preview en tiempo real

4. **Analytics**
   - Tracking de imágenes más usadas
   - Análisis de espacio utilizado por bucket
   - Alertas de límites de storage

---

## 📚 Archivos Relacionados

- `src/app/administrator/(protected)/media/page.tsx` - Página principal de gestión
- `src/lib/supabase/storage.ts` - Funciones helper de storage
- `supabase/configurar-storage-media-extras.sql` - Script de políticas RLS
- `supabase/configurar-storage-media.sql` - Script original (solo vehicles y blog)
- `supabase/configurar-storage-policies.sql` - Script de políticas antiguo

---

## ✅ Checklist de Configuración

- [ ] Ejecutar `configurar-storage-media-extras.sql` en Supabase
- [ ] Verificar que cada bucket tenga 4 políticas
- [ ] Verificar que los buckets sean públicos
- [ ] Probar crear carpeta en cada bucket
- [ ] Probar subir imagen en cada bucket
- [ ] Probar eliminar archivo
- [ ] Probar eliminar carpeta
- [ ] Verificar URLs públicas funcionan

---

**Documentación creada:** 21 de enero de 2026  
**Última actualización:** 21 de enero de 2026  
**Versión:** 1.0.0
