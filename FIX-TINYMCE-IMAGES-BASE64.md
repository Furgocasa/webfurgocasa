# Fix: Error al guardar artículos con imágenes en TinyMCE

## 🔴 Problema Detectado

Al intentar guardar artículos del blog que contienen imágenes insertadas desde el editor TinyMCE, se producía un error 500 en Supabase:

```
Error al guardar el artículo: canceling statement due to statement timeout
```

### Causa Raíz

El editor TinyMCE estaba configurado para convertir las imágenes a formato **base64** e insertarlas directamente en el campo `content` de la base de datos. Esto generaba strings HTML extremadamente largos (varios MB) que:

1. Excedían el timeout de Supabase (por defecto 60 segundos)
2. Sobrecargaban la base de datos con datos binarios
3. Ralentizaban la carga de artículos
4. Aumentaban innecesariamente el tamaño de la base de datos

**Ejemplo de lo que NO se debe hacer:**
```html
<!-- HTML con imagen base64 (varios KB o MB de texto) -->
<img src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBD...MILES_DE_CARACTERES..." />
```

## ✅ Solución Implementada

### 1. Integración con el Gestor de Medios Existente

Se modificó el componente `src/components/admin/tiny-editor.tsx` para integrar el **gestor de medios completo** (`ImageSelector`) que ya existe en la aplicación.

**Funcionalidades del gestor integrado:**
- ✅ **Navegar por carpetas** en el bucket 'blog'
- ✅ **Subir nuevas imágenes** directamente desde el modal
- ✅ **Crear carpetas** para organizar las imágenes
- ✅ **Buscar imágenes** por nombre
- ✅ **Eliminar carpetas** vacías
- ✅ **Previsualización** de imágenes antes de seleccionar
- ✅ **Breadcrumbs** para navegar fácilmente

**Cómo funciona:**

1. **Desde el botón "Imagen" de TinyMCE:**
   - Al hacer clic en el botón "Imagen" → "Seleccionar desde galería"
   - Se abre el modal completo del gestor de medios
   - Puedes navegar, buscar, subir o seleccionar imágenes existentes
   - Al seleccionar, se inserta solo la URL en el HTML

2. **Arrastrando imágenes al editor:**
   - También puedes arrastrar y soltar imágenes directamente al editor
   - Se subirán automáticamente a `blog-content/` en Supabase Storage
   - Se insertará la URL pública en lugar de base64

### 2. Configuración de Supabase Storage

Se creó el script `supabase/setup-blog-storage.sql` para configurar el bucket 'blog' con las políticas necesarias.

**Ejecutar en Supabase SQL Editor:**

```bash
# En el dashboard de Supabase:
1. Ve a SQL Editor
2. Abre el archivo supabase/setup-blog-storage.sql
3. Ejecuta el script
```

El script configura:
- ✅ Bucket 'blog' como **público** (lectura pública de imágenes)
- ✅ Políticas para que **usuarios autenticados** puedan subir/modificar/eliminar
- ✅ Organización en carpetas:
  - `blog-content/` → Imágenes del contenido (TinyMCE)
  - `featured/` → Imágenes destacadas (opcional)

### 3. Límites y Optimizaciones

Se añadieron configuraciones adicionales en TinyMCE:

```typescript
images_file_types: 'jpg,jpeg,png,gif,webp',  // Formatos permitidos
automatic_uploads: true,                      // Subida automática al pegar/arrastrar
```

## 📋 Pasos para Aplicar la Solución

### 1. Actualizar el código
```bash
# Ya está actualizado en:
# - src/components/admin/tiny-editor.tsx
```

### 2. Configurar Supabase Storage (si no está configurado)

**NOTA:** Si ya usas el gestor de medios en `/administrator/media`, el bucket 'blog' probablemente ya está configurado. Puedes verificarlo en Supabase Dashboard → Storage.

Si el bucket 'blog' NO existe, ejecuta el script SQL:

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **SQL Editor** → **New Query**
3. Copia y pega el contenido de `supabase/setup-blog-storage.sql`
4. Ejecuta el script (Run)

El script configura:
- ✅ Bucket 'blog' como **público** (lectura pública de imágenes)
- ✅ Políticas para que **usuarios autenticados** puedan subir/modificar/eliminar
- ✅ Organización en carpetas:
  - `blog-content/` → Imágenes del contenido (TinyMCE)
  - `featured/` → Imágenes destacadas (opcional)
```sql
-- Ver configuración del bucket
SELECT * FROM storage.buckets WHERE id = 'blog';

-- Ver políticas
SELECT policyname, cmd
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects' 
  AND policyname LIKE '%blog%';
```

### 3. Verificar la configuración

1. Ve al panel de administración: `https://www.furgocasa.com/administrator/blog/articulos`
2. Edita un artículo o crea uno nuevo
3. **Opción A - Usando el gestor de medios completo:**
   - Click en el botón "Imagen" en la barra de TinyMCE
   - Se abrirá el gestor de medios completo
   - Puedes:
     - **Navegar** entre carpetas existentes
     - **Crear nueva carpeta** para organizar imágenes
     - **Subir nuevas imágenes** desde tu ordenador
     - **Buscar imágenes** por nombre
     - **Seleccionar imágenes existentes**
   - Al seleccionar una imagen, se insertará en el contenido
   
4. **Opción B - Arrastrando imágenes:**
   - Arrastra una imagen directamente al editor TinyMCE
   - La imagen se subirá automáticamente a `blog-content/`
   - Se insertará la URL pública en el HTML
   
5. **Opción C - Copiar y pegar:**
   - Copia una imagen desde tu navegador o escritorio
   - Pega directamente en TinyMCE (Ctrl+V)
   - Se subirá automáticamente a Storage

6. Guarda el artículo
7. **Verificar:** El artículo debería guardarse sin errores en menos de 2 segundos

### 4. Probar la funcionalidad

1. Ve a Supabase Dashboard → **Storage** → **blog**
2. Deberías ver la carpeta `blog-content/` con las imágenes subidas
3. Las imágenes deben ser accesibles públicamente desde sus URLs

## 🔍 Cómo Detectar si el Problema Persiste

Si después de aplicar la solución el error persiste:

1. **Abrir DevTools del navegador** (F12)
2. Ve a la pestaña **Console**
3. Intenta guardar un artículo con imagen
4. Busca mensajes de error:
   - ❌ `Error uploading image` → Problema con las políticas de Storage
   - ❌ `403 Forbidden` → Usuario no tiene permisos para subir
   - ❌ `404 Not Found` → El bucket 'blog' no existe
   - ✅ `200 OK` → La imagen se subió correctamente

## 🎯 Beneficios de la Solución

| Antes (Base64) | Después (Storage + Gestor) |
|----------------|----------------------------|
| ❌ Artículos de varios MB | ✅ Artículos ligeros (solo HTML + URLs) |
| ❌ Timeout al guardar (>60s) | ✅ Guardado rápido (<2s) |
| ❌ Base de datos sobrecargada | ✅ Base de datos optimizada |
| ❌ Carga lenta de artículos | ✅ Carga rápida con CDN |
| ❌ Sin cache de imágenes | ✅ Imágenes cacheadas (3600s) |
| ❌ Sin organización | ✅ Carpetas para organizar imágenes |
| ❌ Difícil reutilizar imágenes | ✅ Reutilizar imágenes existentes fácilmente |
| ❌ No se pueden buscar imágenes | ✅ Búsqueda integrada |

## 📸 Capturas de Pantalla

### Gestor de Medios Integrado en TinyMCE

Cuando haces clic en "Imagen" en TinyMCE, se abre el mismo gestor de medios que en `/administrator/media`:

- **Navegación por carpetas**: Breadcrumbs y carpetas visibles
- **Búsqueda de imágenes**: Campo de búsqueda en tiempo real
- **Subida de archivos**: Botón "Subir Nueva" con preview
- **Crear carpetas**: Botón "Nueva Carpeta" para organizar
- **Previsualización**: Miniaturas de todas las imágenes
- **Selección visual**: Click para seleccionar, border azul al seleccionar

## 📝 Notas Técnicas

### Integración con ImageSelector

El editor TinyMCE ahora utiliza el componente `ImageSelector` existente a través del callback `file_picker_callback`:

```typescript
file_picker_callback: (callback, value, meta) => {
  if (meta.filetype === 'image') {
    // Guardar el callback para usarlo cuando se seleccione la imagen
    setImageCallback(() => callback);
    // Abrir el modal de selección de imágenes
    setShowImageSelector(true);
  }
}
```

Cuando el usuario selecciona una imagen en el modal, se ejecuta:

```typescript
const handleImageSelected = (imageUrl: string) => {
  if (imageCallback) {
    imageCallback(imageUrl); // Inserta la URL en TinyMCE
    setImageCallback(null);
  }
  setShowImageSelector(false);
};
```

### Doble método de inserción

El editor ahora soporta **dos métodos** para insertar imágenes:

1. **file_picker_callback** (botón "Imagen" → "Seleccionar desde galería")
   - Abre el gestor de medios completo (`ImageSelector`)
   - Permite navegar, buscar y seleccionar imágenes existentes
   - Permite subir nuevas imágenes organizadas en carpetas

2. **images_upload_handler** (drag & drop o copiar/pegar)
   - Sube automáticamente a `blog-content/` en Supabase Storage
   - Genera nombre único para evitar colisiones
   - Devuelve URL pública para insertar en el HTML

### Estructura de URLs generadas
```
https://PROYECTO.supabase.co/storage/v1/object/public/blog/blog-content/1738689234567-k3j9f2.jpg
                                                        └─────┘ └─────────────┘ └─────────────┘
                                                        bucket     carpeta     nombre único
```

### Formatos de imagen soportados
- JPG/JPEG (recomendado para fotos)
- PNG (recomendado para gráficos con transparencia)
- WebP (recomendado para web, mejor compresión)
- GIF (para imágenes animadas)

### Cache Control
Las imágenes se sirven con `Cache-Control: max-age=3600` (1 hora), lo que mejora el rendimiento al evitar descargas repetidas.

## 🚨 Troubleshooting

### Error: "Error al subir la imagen: new row violates row-level security policy"

**Solución:** Ejecuta el script `setup-blog-storage.sql` para crear las políticas necesarias.

### Error: "Bucket not found"

**Solución:** 
1. Ve a Supabase Dashboard → **Storage**
2. Click en **Create bucket**
3. Nombre: `blog`
4. ✅ Marcar "Public bucket"
5. Click en **Create**

### Las imágenes no se ven en el artículo publicado

**Solución:** Verifica que el bucket sea **público**:
```sql
UPDATE storage.buckets 
SET public = true 
WHERE id = 'blog';
```

## 📅 Historial

- **2026-02-04 (v2):** Integrado gestor de medios completo (`ImageSelector`) con navegación de carpetas, búsqueda y subida
- **2026-02-04 (v1):** Problema detectado y solucionado con subida directa a Storage
- **Commit v2:** `feat(blog): integrar gestor de medios completo en TinyMCE con navegación de carpetas`
- **Commit v1:** `fix(blog): subir imágenes a Storage en lugar de base64 en TinyMCE`

## 🔗 Referencias

- [TinyMCE Images Upload](https://www.tiny.cloud/docs/tinymce/6/file-image-upload/)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Row Level Security en Storage](https://supabase.com/docs/guides/storage/security/access-control)
