# ⚡ SOLUCIÓN RÁPIDA - Gestión de Media Storage

## 🎯 Problema
El botón "Nueva Carpeta" en `/administrator/media` se queda parado porque los buckets `media` y `extras` **no tienen políticas RLS configuradas**.

## ✅ Solución en 3 Pasos

### 1️⃣ Ejecutar SQL en Supabase (2 minutos)

1. Abre [Supabase Dashboard](https://supabase.com/dashboard)
2. Ve a tu proyecto "Furgocasa Web"
3. Clic en **SQL Editor** (menú izquierdo)
4. Abre el archivo: `supabase/configurar-storage-media-extras.sql`
5. Copia TODO el contenido
6. Pégalo en el editor SQL de Supabase
7. Haz clic en **Run** (botón verde)

**Resultado esperado:**
```
✅ 8 políticas creadas (4 para 'media', 4 para 'extras')
✅ Query devuelve 8 filas mostrando las políticas
```

### 2️⃣ Verificar en Supabase (1 minuto)

Ve a: **Storage > Files** en Supabase Dashboard

Deberías ver:
- **media** - PUBLIC - **4 políticas** ✅
- **blog** - PUBLIC - **4 políticas** ✅  
- **extras** - PUBLIC - **4 políticas** ✅
- **vehicles** - PUBLIC - **4 políticas** ✅

### 3️⃣ Probar en la Aplicación (1 minuto)

1. Ve a: `https://www.furgocasa.com/administrator/media`
2. Selecciona cualquier bucket (Vehículos, Blog, Extras o Media)
3. Haz clic en **"Nueva Carpeta"**
4. Ingresa un nombre (ej: `Prueba`)
5. Haz clic en **"Crear Carpeta"**

**Resultado esperado:**
```
✅ Mensaje: "Carpeta creada correctamente"
✅ La carpeta aparece en la lista
✅ Puedes navegar dentro de ella
```

---

## 🔍 ¿Qué hace el script SQL?

Crea 4 políticas RLS para cada bucket:

| Política | Descripción |
|----------|-------------|
| `*_public_read` | Permite a **cualquiera** ver las imágenes (público) |
| `*_admin_insert` | Permite a **administradores** subir archivos |
| `*_admin_update` | Permite a **administradores** modificar metadata |
| `*_admin_delete` | Permite a **administradores** eliminar archivos |

---

## 📝 Cambios en el Código

Ya están aplicados en los archivos:

1. **`src/lib/supabase/storage.ts`**
   - Añadido `'media'` al tipo `BucketType`

2. **`src/app/administrator/(protected)/media/page.tsx`**
   - Añadido botón "📸 Media"
   - Añadido botón "🎁 Extras"
   - Mejorado display del bucket actual

---

## 🎨 Nueva Interfaz de Media

Ahora tienes **4 buckets** disponibles:

| Botón | Bucket | Uso Recomendado |
|-------|--------|-----------------|
| 🚐 Vehículos | `vehicles` | Fotos de campers y furgonetas |
| 📝 Blog | `blog` | Imágenes de artículos del blog |
| 🎁 Extras | `extras` | Fotos de equipamiento adicional |
| 📸 Media | `media` | Imágenes generales y recursos |

---

## 🚨 Si algo falla

### Error: "Error al crear carpeta"
**Solución:** El script SQL no se ejecutó correctamente. Repite el Paso 1.

### El botón sigue sin funcionar
**Solución:** 
1. Cierra sesión en el administrador
2. Vuelve a iniciar sesión
3. Intenta de nuevo

### Las políticas no aparecen en Supabase
**Solución:**
1. Verifica que estás en el proyecto correcto
2. Verifica que tu usuario tiene permisos de administrador en Supabase
3. Intenta ejecutar el script línea por línea

---

## 📚 Documentación Completa

Para más detalles, consulta: **`GESTION-MEDIA-STORAGE.md`**

---

**Tiempo total estimado:** 4 minutos  
**Dificultad:** ⭐ Muy Fácil
