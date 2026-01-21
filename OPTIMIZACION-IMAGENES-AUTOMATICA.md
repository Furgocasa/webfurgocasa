# 🎨 Optimización Automática de Imágenes a WebP

## ✨ Funcionalidad

**TODAS las imágenes** subidas desde el panel de administración se optimizan **automáticamente** a formato WebP antes de ser almacenadas en Supabase Storage.

---

## 🚀 Cómo Funciona

### 1️⃣ **Detección Automática**
Cuando subes una imagen (JPG, PNG, GIF), el sistema:
- ✅ Detecta que es una imagen
- ✅ La convierte automáticamente a WebP
- ✅ La redimensiona si excede los límites
- ✅ La sube optimizada

### 2️⃣ **Configuración por Bucket**

Cada bucket tiene su configuración de optimización:

| Bucket | Ancho Máx | Alto Máx | Calidad | Uso |
|--------|-----------|----------|---------|-----|
| **vehicles** | 2000px | 1500px | 90% | Imágenes de vehículos (alta calidad) |
| **blog** | 1920px | 1080px | 85% | Artículos y contenido |
| **extras** | 1200px | 900px | 85% | Extras y accesorios |
| **media** | 1920px | 1080px | 90% | Slides y media general |

### 3️⃣ **Proceso de Optimización**

```
Usuario sube: "camper.png" (5 MB, 3000x2000px)
           ↓
    [Optimización Automática]
           ↓
  - Redimensionar: 2000x1333px (mantiene ratio)
  - Convertir a WebP calidad 90%
  - Renombrar: "camper.webp"
           ↓
Resultado: "camper.webp" (800 KB, 2000x1333px) ✅
```

---

## 📍 Dónde se Aplica

### ✅ **Panel de Administración**
- **`/administrator/media`** → Gestión de Media
- Arrastra y suelta cualquier imagen → Se optimiza automáticamente

### ✅ **Editor de Blog**
- Cuando subes imágenes desde el editor TinyMCE
- Las imágenes se optimizan antes de insertarlas en el contenido

### ✅ **Creación/Edición de Vehículos**
- Al subir imágenes de vehículos nuevos
- Automáticamente convertidas a WebP de alta calidad

### ✅ **Gestión de Extras**
- Imágenes de extras y accesorios
- Optimización automática a 1200x900px

---

## 🔧 Detalles Técnicos

### Implementación
**Archivo**: `src/lib/supabase/storage.ts`

```typescript
// Función principal
async function optimizeImageToWebP(file: File, bucket: BucketType): Promise<File>

// Se ejecuta en uploadFile() automáticamente
export async function uploadFile(bucket, file, path) {
  if (file.type.startsWith('image/') && file.type !== 'image/webp') {
    file = await optimizeImageToWebP(file, bucket);
  }
  // ... sube la versión optimizada
}
```

### Tecnología Usada
- **Canvas API** del navegador (nativo)
- **Sin dependencias externas** en el cliente
- **Conversión en memoria** (no usa almacenamiento temporal)

---

## 💡 Ventajas

### ⚡ **Performance**
- Imágenes hasta **70% más pequeñas**
- Carga de página más rápida
- Mejor experiencia de usuario

### 💰 **Ahorro de Costos**
- Menos espacio en Supabase Storage
- Menos ancho de banda
- Menor tiempo de transferencia

### 🎯 **Consistencia**
- Todas las imágenes en formato WebP
- Dimensiones controladas
- Calidad uniforme

### 🔒 **Automático y Transparente**
- No requiere acción del usuario
- Funciona para todos los administradores
- Sin configuración adicional

---

## 📊 Ejemplo Real

### **Antes** (sin optimización):
```
📁 vehicles/FU0010/
  ├─ exterior-1.jpg (4.2 MB, 3840x2160px)
  ├─ interior-1.png (6.8 MB, 4000x3000px)
  └─ cocina.jpg (3.5 MB, 3200x2400px)
Total: 14.5 MB
```

### **Después** (con optimización automática):
```
📁 vehicles/FU0010/
  ├─ exterior-1.webp (720 KB, 2000x1125px) ✅
  ├─ interior-1.webp (980 KB, 2000x1500px) ✅
  └─ cocina.webp (640 KB, 2000x1500px) ✅
Total: 2.3 MB (-84% de ahorro!)
```

---

## 🛡️ Fallback de Seguridad

Si la optimización falla por cualquier motivo:
- ⚠️ El sistema sube **la imagen original**
- ⚠️ Se registra el error en consola
- ✅ **La subida no se interrumpe**

```typescript
try {
  fileToUpload = await optimizeImageToWebP(file, bucket);
} catch (optimizeError) {
  console.error('⚠️ Error al optimizar, subiendo original:', optimizeError);
  fileToUpload = file; // ← Usa el original
}
```

---

## 🔍 Logs en Consola del Navegador

Cuando subes una imagen, verás:

```
🔧 Optimizando foto-exterior.jpg a WebP...
✅ Optimizado: foto-exterior.jpg (4200KB) → foto-exterior.webp (720KB)
✅ Subido correctamente: vehicles/2026/01/1737463920-abc123.webp
```

---

## ⚙️ Configuración Avanzada

Si necesitas ajustar la configuración de un bucket:

**Archivo**: `src/lib/supabase/storage.ts`

```typescript
const OPTIMIZATION_CONFIG: Record<BucketType, {
  maxWidth: number;
  maxHeight: number;
  quality: number;
}> = {
  vehicles: { 
    maxWidth: 2000,   // ← Cambiar ancho máximo
    maxHeight: 1500,  // ← Cambiar alto máximo
    quality: 0.90     // ← Cambiar calidad (0.1 a 1.0)
  },
  // ...
};
```

---

## 📚 Documentación Relacionada

- [Gestión de Imágenes - Supabase](./GESTION-IMAGENES-SUPABASE.md)
- [Imágenes Hero de Localizaciones](./IMAGENES-HERO-LOCALIZACIONES.md)
- [Scripts de Migración](./scripts/)

---

## ✅ Checklist de Validación

Para verificar que funciona correctamente:

- [ ] Sube una imagen JPG desde `/administrator/media`
- [ ] Verifica en consola del navegador: `✅ Optimizado: ... → ...webp`
- [ ] Comprueba en Supabase Storage que se guardó como `.webp`
- [ ] Verifica que el tamaño es menor al original
- [ ] Confirma que la URL generada termina en `.webp`

---

## 🔄 Actualizado

**Última actualización:** 21 de enero de 2026  
**Versión:** 1.0.0  
**Estado:** ✅ Activo en producción

---

## 🆘 Soporte

Si tienes problemas o preguntas:
- Revisa los logs en la consola del navegador
- Verifica que el bucket tenga permisos de escritura
- Consulta [GESTION-IMAGENES-SUPABASE.md](./GESTION-IMAGENES-SUPABASE.md)
