# ❓ FAQ - Gestión de Media Storage

## Preguntas Frecuentes sobre el Sistema de Archivos

---

## 📁 Gestión de Carpetas

### ¿Por qué se quedaba parado el botón "Nueva Carpeta"?

**Respuesta:** Los buckets `media` y `extras` no tenían políticas RLS (Row Level Security) configuradas. Sin estas políticas, Supabase rechaza cualquier operación de escritura, incluyendo la creación de carpetas.

**Solución:** Ejecutar el script `supabase/configurar-storage-media-extras.sql` que crea las 4 políticas necesarias por cada bucket.

---

### ¿Cómo se crean las carpetas en Supabase Storage?

**Respuesta:** Supabase Storage no tiene carpetas "reales" como un sistema de archivos tradicional. Las carpetas son simuladas mediante:

1. **Paths en los nombres de archivos:** Los archivos se nombran con rutas como `FU0010/imagen.jpg`
2. **Archivo placeholder:** Se crea un archivo oculto `.folder` dentro de cada carpeta para que persista aunque esté vacía

**Código relevante:**
```typescript
const placeholderPath = `${folderPath}/.folder`;
const emptyFile = new File([''], '.folder', { type: 'text/plain' });
await supabase.storage.from(bucket).upload(placeholderPath, emptyFile);
```

---

### ¿Puedo crear subcarpetas dentro de carpetas?

**Respuesta:** ¡Sí! El sistema soporta estructura de carpetas anidadas.

**Ejemplo:**
```
vehicles/
  └── FU0010/
      └── interiores/
          └── imagen.jpg
```

Simplemente navega a la carpeta donde quieras crear la subcarpeta y usa el botón "Nueva Carpeta".

---

## 🖼️ Gestión de Imágenes

### ¿Qué formatos de imagen están permitidos?

**Respuesta:** Los siguientes formatos:
- **JPG / JPEG** - Recomendado para fotos
- **PNG** - Recomendado para logos y transparencias
- **WebP** - Recomendado para web (mejor compresión)
- **GIF** - Permitido pero no recomendado

**Configuración en Supabase:**
```sql
allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
```

---

### ¿Cuál es el tamaño máximo de archivo?

**Respuesta:** **10 MB por archivo**

Si necesitas subir archivos más grandes:
1. Comprime la imagen antes de subirla
2. Usa herramientas como TinyPNG, Squoosh, o ImageOptim
3. Convierte a WebP para mejor compresión

**Para cambiar el límite en Supabase:**
```sql
UPDATE storage.buckets 
SET file_size_limit = 20971520  -- 20MB
WHERE id = 'vehicles';
```

---

### ¿Cómo subo múltiples imágenes a la vez?

**Respuesta:** Simplemente arrastra múltiples archivos al área de carga. El sistema las procesará una por una y te mostrará el progreso.

**Límite:** No hay límite en el número de archivos, pero se procesan secuencialmente para evitar sobrecargar el navegador.

---

## 🔐 Seguridad y Permisos

### ¿Quién puede ver las imágenes?

**Respuesta:** **Todos los buckets son públicos.** Cualquiera que tenga la URL puede ver las imágenes.

Esto es intencional porque:
- Las imágenes se usan en el frontend público
- Mejora el rendimiento (sin autenticación)
- Simplifica el CDN y caché

**Si necesitas imágenes privadas:**
- Crea un bucket nuevo no-público
- Configura políticas RLS más restrictivas
- Usa URLs firmadas (signed URLs)

---

### ¿Quién puede subir/eliminar imágenes?

**Respuesta:** Solo los **administradores activos**.

**Verificación en las políticas:**
```sql
EXISTS (
    SELECT 1 FROM public.admins 
    WHERE admins.user_id = auth.uid() 
    AND admins.is_active = true
)
```

Para dar acceso a un usuario:
```sql
INSERT INTO admins (user_id, email, is_active)
VALUES ('uuid-del-usuario', 'email@example.com', true);
```

---

### ¿Qué pasa si un usuario no-admin intenta subir archivos?

**Respuesta:** La operación falla silenciosamente. Supabase devuelve un error 403 (Forbidden) que el frontend captura y muestra como "Error al subir archivos".

**Para verificar permisos:**
```sql
-- Ejecuta en SQL Editor de Supabase
SELECT * FROM admins WHERE user_id = auth.uid();
```

---

## 🗂️ Organización y Estructura

### ¿Cuál es la estructura recomendada para vehículos?

**Respuesta:**
```
vehicles/
├── FU0010/
│   ├── principal.jpg         # Imagen principal
│   ├── interior-1.jpg        # Interior
│   ├── interior-2.jpg
│   ├── exterior-1.jpg        # Exterior
│   └── detalles/
│       ├── cocina.jpg
│       └── cama.jpg
└── FU0011/
    └── ...
```

**Convención de nombres:**
- Usa el código del vehículo (FU0010, FU0011, etc.)
- Nombres descriptivos en minúsculas
- Separa palabras con guiones `-`
- La primera imagen alfabéticamente será la principal

---

### ¿Cómo organizo las imágenes del blog?

**Respuesta:**
```
blog/
├── ai-covers/
│   └── {slug}-{timestamp}.webp          ← portadas IA (desde abr 2026); ver GESTION-MEDIA-STORAGE.md
├── portadas/
│   ├── guia-costa-brava.jpg
│   └── mejores-rutas-2026.jpg
├── articulos/
│   ├── costa-brava/
│   │   ├── mapa.jpg
│   │   └── playa-1.jpg
│   └── rutas-murcia/
│       └── ...
└── general/
    └── ...
```

**Tips:**
- Agrupa por categoría o tipo
- Usa carpetas por artículo para imágenes relacionadas
- Mantén las portadas separadas
- Las **portadas generadas por IA** se guardan en `blog/ai-covers/` como **WebP**; el flujo técnico está descrito en **`docs/02-desarrollo/media/GESTION-MEDIA-STORAGE.md`** (sección *Portadas del blog generadas por IA*).

---

### ¿Cómo organizo los extras?

**Respuesta:**
```
extras/
├── EX001-bicicleta/
│   ├── frontal.jpg
│   └── lateral.jpg
├── EX002-nevera-portatil/
│   ├── cerrada.jpg
│   └── abierta.jpg
└── EX003-toldo/
    └── desplegado.jpg
```

**Convención:**
- Usa código de extra (EX001, EX002, etc.)
- Una carpeta por extra
- Múltiples ángulos del mismo producto

---

## 🔗 URLs y Uso en Frontend

### ¿Cómo obtengo la URL de una imagen?

**Respuesta:** 
1. Haz hover sobre la imagen
2. Clic en el botón 📋 "Copiar URL"
3. La URL se copia al portapapeles

**Formato de URL:**
```
https://[proyecto].supabase.co/storage/v1/object/public/[bucket]/[path]
```

**Ejemplo real:**
```
https://uyxgnqtdebyzllkbuef.supabase.co/storage/v1/object/public/vehicles/FU0010/principal.jpg
```

---

### ¿Cómo uso estas imágenes en el código?

**Respuesta:**

**Opción 1: URL directa**
```tsx
<img src="https://...supabase.co/storage/v1/object/public/vehicles/FU0010/principal.jpg" />
```

**Opción 2: Función helper**
```typescript
import { getPublicUrl } from '@/lib/supabase/storage';

const imageUrl = getPublicUrl('vehicles', 'FU0010/principal.jpg');
```

**Opción 3: Desde la base de datos**
```typescript
// Guardar solo el path en la BD
main_image_url: "FU0010/principal.jpg"

// Generar URL completa al renderizar
const fullUrl = getPublicUrl('vehicles', vehicle.main_image_url);
```

---

### ¿Las URLs caducan?

**Respuesta:** **No, las URLs públicas no caducan.** Son permanentes mientras el archivo exista.

**Ventajas:**
- Puedes cachearlas
- Funcionan en cualquier lugar
- No necesitas regenerarlas

**Desventaja:**
- Si eliminas el archivo, la URL devuelve 404
- No puedes revocar acceso a una URL específica

---

## 🐛 Troubleshooting

### Error: "Error al crear carpeta"

**Causas posibles:**
1. ❌ El bucket no tiene políticas RLS configuradas
2. ❌ No estás autenticado como administrador
3. ❌ Tu usuario admin tiene `is_active = false`
4. ❌ La carpeta ya existe

**Soluciones:**
1. Ejecuta `configurar-storage-media-extras.sql`
2. Cierra sesión y vuelve a iniciar sesión
3. Verifica: `SELECT * FROM admins WHERE email = 'tu-email';`
4. Intenta con otro nombre

---

### Error: "Error al subir archivos"

**Causas posibles:**
1. ❌ Archivo muy grande (>10MB)
2. ❌ Formato no permitido
3. ❌ Falta configurar políticas RLS
4. ❌ No eres administrador activo

**Soluciones:**
1. Comprime la imagen
2. Convierte a JPG o WebP
3. Ejecuta el script SQL de configuración
4. Verifica tus permisos de admin

---

### Las imágenes no cargan en el frontend

**Causas posibles:**
1. ❌ URL incorrecta
2. ❌ Bucket no es público
3. ❌ Archivo eliminado
4. ❌ CORS mal configurado

**Soluciones:**
1. Verifica la URL en el navegador
2. Marca el bucket como público en Supabase
3. Verifica que el archivo existe
4. No debería ser necesario configurar CORS

---

### No veo las carpetas que acabo de crear

**Causas posibles:**
1. ❌ La carpeta está vacía y no tiene el archivo `.folder`
2. ❌ No se recargó la lista
3. ❌ Estás en otro bucket

**Soluciones:**
1. El sistema crea automáticamente el `.folder`
2. Recarga la página (F5)
3. Verifica que estás en el bucket correcto

---

## 🚀 Mejores Prácticas

### Nomenclatura de Archivos

✅ **BIEN:**
- `principal.jpg`
- `interior-cocina.jpg`
- `FU0010-exterior.jpg`

❌ **MAL:**
- `IMG_20260121_123456.jpg` (nombre de cámara)
- `foto final definitiva v2.jpg` (confuso)
- `Imagen Sin Título.jpg` (espacios y mayúsculas)

**Reglas:**
- Usa minúsculas
- Separa palabras con guiones `-`
- Sé descriptivo pero conciso
- No uses espacios, acentos o caracteres especiales

---

### Optimización de Imágenes

**Antes de subir:**
1. Redimensiona a tamaño apropiado:
   - Principal: 1200x800px
   - Galería: 800x600px
   - Thumbnails: 400x300px

2. Comprime con calidad 80-85%

3. Convierte a WebP cuando sea posible

**Herramientas recomendadas:**
- [Squoosh.app](https://squoosh.app/) (online)
- [TinyPNG.com](https://tinypng.com/) (online)
- ImageOptim (Mac)
- FileOptimizer (Windows)

---

### Limpieza Regular

**Recomendación:** Revisa mensualmente el bucket `media` y elimina:
- Imágenes duplicadas
- Archivos de prueba
- Carpetas vacías
- Imágenes no utilizadas

**Script de verificación:**
```sql
-- Ver archivos más antiguos
SELECT name, created_at, metadata->>'size' as size
FROM storage.objects
WHERE bucket_id = 'media'
ORDER BY created_at ASC
LIMIT 20;
```

---

## 📊 Límites y Cuotas

### ¿Cuánto espacio tengo disponible?

**Respuesta:** Depende de tu plan de Supabase:

| Plan | Storage | Transferencia |
|------|---------|---------------|
| Free | 1 GB | 2 GB/mes |
| Pro | 100 GB | 200 GB/mes |
| Team | 100 GB | 200 GB/mes |
| Enterprise | Custom | Custom |

**Para ver uso actual:**
```sql
SELECT 
    bucket_id,
    COUNT(*) as files,
    SUM((metadata->>'size')::bigint) / 1024 / 1024 as mb_used
FROM storage.objects
GROUP BY bucket_id;
```

---

### ¿Qué pasa si supero el límite?

**Respuesta:** 
1. **Storage:** No podrás subir más archivos hasta que liberes espacio
2. **Transferencia:** El acceso a imágenes se pausará hasta el siguiente ciclo

**Soluciones:**
- Actualiza tu plan
- Comprime imágenes existentes
- Elimina archivos no utilizados
- Usa CDN externo para archivos muy pesados

---

## 🔄 Migraciones y Backups

### ¿Cómo hago backup de mis imágenes?

**Opción 1: Manual (Supabase Dashboard)**
1. Ve a Storage > [bucket]
2. Selecciona archivos
3. Descarga

**Opción 2: CLI de Supabase**
```bash
supabase storage download --bucket vehicles --path FU0010/
```

**Opción 3: Script personalizado**
```typescript
// Descargar todas las imágenes de un bucket
const files = await listFilesClient('vehicles');
for (const file of files) {
  // Descargar file.url
}
```

---

### ¿Cómo migro imágenes de otro bucket?

**Respuesta:**
1. Descarga las imágenes del bucket origen
2. Súbelas al nuevo bucket usando la interfaz
3. Actualiza las referencias en la base de datos

**Script SQL para actualizar referencias:**
```sql
-- Ejemplo: Mover referencias de 'media' a 'vehicles'
UPDATE vehicles 
SET main_image_url = REPLACE(main_image_url, 'media/', 'vehicles/')
WHERE main_image_url LIKE 'media/%';
```

---

## 📞 Soporte

### ¿Dónde reporto problemas?

**Opciones:**
1. **GitHub Issues** - Para bugs de código
2. **Supabase Support** - Para problemas de storage/infraestructura
3. **Documentación** - Consulta `GESTION-MEDIA-STORAGE.md`

### ¿Cómo contribuyo mejoras?

**Proceso:**
1. Crea una rama: `git checkout -b feature/mejora-media`
2. Implementa los cambios
3. Prueba localmente
4. Crea Pull Request
5. Documenta cambios en el CHANGELOG

---

**Última actualización:** 21 de enero de 2026  
**Versión:** 1.0.0
