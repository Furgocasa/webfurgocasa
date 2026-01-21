# 🎨 Sistema de Galería de Imágenes para Vehículos - Guía Completa

## ✅ Estado Actual

Tu sistema de galería de imágenes para vehículos está **100% funcional** e integrado con el nuevo sistema de storage (4 buckets).

---

## 📊 Arquitectura del Sistema

### **1. Base de Datos (`vehicle_images`)**

```sql
CREATE TABLE vehicle_images (
    id UUID PRIMARY KEY,
    vehicle_id UUID REFERENCES vehicles(id),
    image_url TEXT NOT NULL,          -- URL de Supabase Storage
    alt_text TEXT,                     -- Para SEO
    sort_order INTEGER DEFAULT 0,     -- Orden en la galería
    is_primary BOOLEAN DEFAULT FALSE, -- Imagen principal (solo una)
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

**Triggers automáticos:**
- `ensure_single_primary_image` - Garantiza solo una imagen principal
- `update_vehicle_images_updated_at` - Actualiza timestamp

---

### **2. Componentes Frontend**

#### **`ImageGalleryManager`** (Manager Principal)
**Ubicación:** `src/components/media/image-gallery-manager.tsx`

**Funcionalidades:**
- ✅ Grid visual de imágenes (hasta 20)
- ✅ Drag & Drop para reordenar
- ✅ Marcar/desmarcar imagen principal (⭐)
- ✅ Editar alt text inline
- ✅ Eliminar imágenes
- ✅ Añadir múltiples imágenes
- ✅ Loading states
- ✅ Límite de imágenes

**Props:**
```typescript
interface ImageGalleryManagerProps {
  images: GalleryImage[];                    // Estado actual
  onChange: (images: GalleryImage[]) => void; // Callback
  maxImages?: number;                         // Default: 20
  bucket: "vehicles" | "blog" | "extras" | "media"; // ✅ Incluye 'media'
  suggestedFolder?: string;                   // Ej: "FU0010"
}
```

---

#### **`UltraSimpleSelector`** (Selector de Imágenes)
**Ubicación:** `src/components/media/ultra-simple-selector.tsx`

**Funcionalidades:**
- ✅ Multi-selección con checkboxes
- ✅ Navegación por carpetas
- ✅ Creación de carpetas
- ✅ Subida de archivos (drag & drop)
- ✅ Eliminar archivos y carpetas
- ✅ Breadcrumb navigation
- ✅ "Seleccionar todas" / "Deseleccionar todas"
- ✅ Soporte para los 4 buckets

**Props:**
```typescript
interface UltraSimpleSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (urls: string[]) => void;
  bucket: BucketType; // ✅ 'vehicles' | 'blog' | 'extras' | 'media'
  suggestedFolder?: string;
}
```

---

### **3. Integración en Editor de Vehículos**

**Archivo:** `src/app/administrator/(protected)/vehiculos/[id]/editar/page.tsx`

**Estados relevantes:**
```typescript
const [internalCode, setInternalCode] = useState("");
const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
```

**Carga de imágenes (al abrir editor):**
```typescript
// En loadVehicleData()
const { data: vehicleImages } = await supabase
  .from("vehicle_images")
  .select("*")
  .eq("vehicle_id", vehicleId)
  .order("sort_order");

setGalleryImages(
  vehicleImages.map((img) => ({
    id: img.id,
    image_url: img.image_url,
    alt_text: img.alt_text || "",
    sort_order: img.sort_order,
    is_primary: img.is_primary,
  }))
);
```

**Guardado de imágenes (al actualizar vehículo):**
```typescript
// En handleSubmit()

// 1. Eliminar todas las imágenes existentes
await supabase
  .from("vehicle_images")
  .delete()
  .eq("vehicle_id", vehicleId);

// 2. Insertar nuevas imágenes
if (galleryImages.length > 0) {
  const imagesToInsert = galleryImages.map((img) => ({
    vehicle_id: vehicleId,
    image_url: img.image_url,
    alt_text: img.alt_text || "",
    sort_order: img.sort_order,
    is_primary: img.is_primary,
  }));

  await supabase
    .from("vehicle_images")
    .insert(imagesToInsert);
}
```

**Renderizado del componente:**
```tsx
<ImageGalleryManager
  images={galleryImages}
  onChange={setGalleryImages}
  maxImages={20}
  bucket="vehicles" // ✅ Usa bucket vehicles
  suggestedFolder={internalCode || ""} // Ej: "FU0010"
/>
```

---

## 🚀 Flujo de Trabajo Completo

### **Escenario 1: Añadir imágenes a un vehículo nuevo**

1. **Crear vehículo**
   - Llenar formulario
   - Código interno: `FU0015`
   - Guardar vehículo primero

2. **Editar vehículo**
   - Ir a editar el vehículo recién creado
   - Scroll hasta "Galería de Imágenes"

3. **Crear carpeta en Storage**
   - Clic "Añadir Primera Imagen"
   - Modal se abre con sugerencia: "FU0015"
   - Clic "Nueva Carpeta" → Ya dice "FU0015"
   - Clic "Crear Carpeta"
   - ✅ Carpeta `vehicles/FU0015/` creada

4. **Subir imágenes**
   - Clic "Subir Nueva"
   - Seleccionar 8 fotos del vehículo
   - Esperar a que suban
   - ✅ Todas en `vehicles/FU0015/`

5. **Añadir a galería**
   - Seleccionar `exterior-frontal.jpg` (checkbox)
   - Clic "Seleccionar"
   - ✅ Añadida como imagen #1 (Principal ⭐)
   - Repetir para más imágenes

6. **Organizar**
   - Arrastra imagen #3 a posición #1
   - Clic ⭐ en imagen #2 para marcarla como principal
   - Clic ✏️ para añadir alt text: "Exterior frontal Knaus Boxstar 600"

7. **Guardar**
   - Scroll abajo
   - Clic "Guardar Cambios"
   - ✅ Todas las imágenes guardadas en DB

---

### **Escenario 2: Editar galería de un vehículo existente**

1. **Abrir editor**
   - Ir a `/administrator/vehiculos`
   - Editar vehículo existente (ej: FU0010)
   - ✅ Galería se carga automáticamente

2. **Reordenar**
   - Arrastra imágenes para cambiar orden
   - ✅ `sort_order` se actualiza automáticamente

3. **Cambiar principal**
   - Clic ⭐ en la imagen que quieres como principal
   - ✅ Solo una puede ser principal

4. **Añadir más imágenes**
   - Clic "Añadir Imagen"
   - Modal abre en carpeta `FU0010` (automático)
   - Seleccionar más imágenes
   - ✅ Se añaden al final

5. **Editar alt text**
   - Clic ✏️ en cualquier imagen
   - Modal con textarea
   - Escribe texto descriptivo
   - ✅ Guardado instantáneamente

6. **Eliminar imagen**
   - Clic 🗑️ en la imagen
   - Confirmar
   - ✅ Eliminada de la galería (no del storage)

7. **Guardar cambios**
   - Clic "Guardar Cambios"
   - ✅ Todas las modificaciones persistidas en DB

---

## 🎨 Interfaz Visual

### **Estado Vacío**
```
┌─────────────────────────────────────────────────────┐
│ Galería de Imágenes            [+ Añadir Imagen]   │
│ 0 de 20 imágenes                                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│              🖼️                                      │
│                                                     │
│         No hay imágenes aún                         │
│     Añade hasta 20 imágenes para este vehículo     │
│                                                     │
│        [+ Añadir Primera Imagen]                    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### **Con 5 Imágenes**
```
┌─────────────────────────────────────────────────────┐
│ Galería de Imágenes            [+ Añadir Imagen]   │
│ 5 de 20 imágenes • Arrastra para reordenar         │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐    │
│  │🖼️ ⭐ │ │🖼️    │ │🖼️    │ │🖼️    │ │🖼️    │    │
│  │ #1   │ │ #2   │ │ #3   │ │ #4   │ │ #5   │    │
│  │☰⭐✏️🗑│ │☰⭐✏️🗑│ │☰⭐✏️🗑│ │☰⭐✏️🗑│ │☰⭐✏️🗑│    │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘    │
│                                                     │
├─────────────────────────────────────────────────────┤
│ 💡 Consejos:                                        │
│  • Arrastra las imágenes para cambiar el orden     │
│  • La imagen con ⭐ Principal se muestra en listados│
│  • Añade texto alternativo para mejorar el SEO     │
│  • Máximo 20 imágenes por vehículo                 │
└─────────────────────────────────────────────────────┘
```

---

## 🔗 Integración con Storage

### **Buckets Disponibles**

El sistema está completamente integrado con los 4 buckets:

```typescript
type BucketType = 'vehicles' | 'blog' | 'extras' | 'media';
```

### **Para vehículos usa:**
```typescript
bucket="vehicles"
```

### **Estructura recomendada:**
```
vehicles/
├── FU0010/
│   ├── 01-exterior-frontal.jpg    ⭐ Principal
│   ├── 02-exterior-lateral.jpg
│   ├── 03-interior-salon.jpg
│   ├── 04-interior-cocina.jpg
│   ├── 05-interior-dormitorio.jpg
│   ├── 06-bano.jpg
│   └── 07-detalles.jpg
├── FU0011/
│   └── ...
└── FU0012/
    └── ...
```

---

## 🔐 Seguridad y Permisos

### **Políticas RLS en `vehicle_images`**

```sql
-- Lectura pública
CREATE POLICY "vehicle_images_public_read"
ON vehicle_images FOR SELECT
TO public
USING (true);

-- Admin: Insertar
CREATE POLICY "vehicle_images_admin_insert"
ON vehicle_images FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM admins 
        WHERE admins.user_id = auth.uid() 
        AND admins.is_active = true
    )
);

-- Admin: Actualizar
CREATE POLICY "vehicle_images_admin_update"
ON vehicle_images FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admins 
        WHERE admins.user_id = auth.uid() 
        AND admins.is_active = true
    )
);

-- Admin: Eliminar
CREATE POLICY "vehicle_images_admin_delete"
ON vehicle_images FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admins 
        WHERE admins.user_id = auth.uid() 
        AND admins.is_active = true
    )
);
```

### **Políticas RLS en Storage (vehicles bucket)**

Ya configuradas en el paso anterior:
- `vehicles_public_read` - Lectura pública
- `vehicles_admin_insert` - Admin puede subir
- `vehicles_admin_update` - Admin puede modificar
- `vehicles_admin_delete` - Admin puede eliminar

---

## 📱 Uso en Frontend Público

### **Obtener imágenes de un vehículo**

```typescript
// En página de detalle del vehículo
const { data: vehicle } = await supabase
  .from("vehicles")
  .select("*")
  .eq("slug", params.slug)
  .single();

const { data: images } = await supabase
  .from("vehicle_images")
  .select("*")
  .eq("vehicle_id", vehicle.id)
  .order("sort_order");

// Imagen principal
const primaryImage = images?.find(img => img.is_primary) || images?.[0];
```

### **Componente de Galería Pública**

Ya existe: `src/components/vehicle/vehicle-gallery.tsx`

```tsx
<VehicleGallery images={images} vehicleName={vehicle.name} />
```

**Características:**
- Imagen principal grande
- Miniaturas con scroll horizontal
- Lightbox en pantalla completa
- Navegación con flechas
- Indicador "⭐ Imagen Principal"
- Zoom al hover
- Responsive

---

## ✅ Verificación del Sistema

### **1. Verificar tabla en Supabase**

```sql
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'vehicle_images'
ORDER BY ordinal_position;
```

**Resultado esperado:**
```
vehicle_images | id          | uuid
vehicle_images | vehicle_id  | uuid
vehicle_images | image_url   | text
vehicle_images | alt_text    | text
vehicle_images | sort_order  | integer
vehicle_images | is_primary  | boolean
vehicle_images | created_at  | timestamp
vehicle_images | updated_at  | timestamp
```

### **2. Verificar políticas RLS**

```sql
SELECT
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE tablename = 'vehicle_images';
```

**Resultado esperado:** 4 políticas (READ, INSERT, UPDATE, DELETE)

### **3. Verificar triggers**

```sql
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'vehicle_images';
```

**Resultado esperado:** 2 triggers
- `update_vehicle_images_updated_at`
- `ensure_single_primary_image`

### **4. Verificar datos de un vehículo**

```sql
SELECT 
    v.name,
    v.internal_code,
    vi.sort_order,
    vi.is_primary,
    vi.alt_text,
    vi.image_url
FROM vehicles v
LEFT JOIN vehicle_images vi ON v.id = vi.vehicle_id
WHERE v.internal_code = 'FU0010'
ORDER BY vi.sort_order;
```

---

## 🐛 Troubleshooting

### **Error: "No se pueden añadir imágenes"**

**Posibles causas:**
1. Límite de 20 imágenes alcanzado
2. No hay políticas RLS en `vehicle_images`
3. Usuario no es administrador activo

**Solución:**
```sql
-- Verificar políticas
SELECT * FROM pg_policies WHERE tablename = 'vehicle_images';

-- Verificar usuario es admin
SELECT * FROM admins WHERE user_id = auth.uid();
```

---

### **Error: "Imágenes no se guardan en DB"**

**Posibles causas:**
1. Error al insertar en `vehicle_images`
2. No se ejecutó el script SQL
3. Falta trigger `ensure_single_primary_image`

**Solución:**
1. Ejecutar script: `supabase/create-vehicle-images-table.sql`
2. Verificar logs en consola del navegador
3. Verificar trigger existe

---

### **Error: "No se puede crear carpeta en storage"**

**Ya solucionado en el paso anterior:**
- Ejecutar: `supabase/configurar-storage-media-extras.sql`
- Verificar bucket `vehicles` tiene 4 políticas

---

### **Error: "Drag & Drop no funciona"**

**Posibles causas:**
1. JavaScript deshabilitado
2. Navegador no soporta Drag & Drop
3. Error en event handlers

**Solución:**
1. Verificar console.log en navegador
2. Probar en Chrome/Firefox moderno
3. Verificar no hay errores de React

---

## 💡 Mejores Prácticas

### **Orden recomendado de imágenes**
1. Exterior frontal (principal)
2. Exterior lateral derecho
3. Exterior lateral izquierdo
4. Exterior trasero
5. Interior salón/comedor
6. Interior cocina
7. Interior dormitorio
8. Baño completo
9. Detalles especiales
10. Almacenamiento/garaje

### **Nomenclatura de archivos**
```
✅ BIEN:
- 01-exterior-frontal.jpg
- 02-lateral-derecho.jpg
- 03-interior-salon.jpg

❌ MAL:
- IMG_1234.jpg
- foto.jpg
- image (1).jpg
```

### **Alt Text para SEO**
```
✅ BIEN:
- "Exterior frontal del Knaus Boxstar 600 con toldo"
- "Interior del salón con mesa extensible y sofás cama"
- "Cocina equipada con nevera, fogones y fregadero"

❌ MAL:
- "Foto"
- "Imagen del vehículo"
- "IMG_1234"
```

### **Tamaño de imágenes**
- Resolución: 1200x800px (principal)
- Formato: JPG o WebP
- Calidad: 80-85%
- Peso máximo: 500KB por imagen

---

## 📚 Archivos Relacionados

### **Scripts SQL**
- `supabase/create-vehicle-images-table.sql` - Tabla de galería
- `supabase/configurar-storage-media-extras.sql` - Políticas storage

### **Componentes**
- `src/components/media/image-gallery-manager.tsx` - Manager principal
- `src/components/media/ultra-simple-selector.tsx` - Selector de imágenes
- `src/components/vehicle/vehicle-gallery.tsx` - Galería pública

### **Páginas**
- `src/app/administrator/(protected)/vehiculos/[id]/editar/page.tsx` - Editor
- `src/app/vehiculos/[slug]/page.tsx` - Detalle público (usa galería)

### **Utilidades**
- `src/lib/supabase/storage.ts` - Funciones helper de storage

### **Documentación**
- `GALERIA-MULTIPLE-VEHICULOS.md` - Documentación completa original
- `GESTION-MEDIA-STORAGE.md` - Sistema de storage (nuevo)
- `FAQ-MEDIA-STORAGE.md` - Preguntas frecuentes storage

---

## 🎯 Resumen Ejecutivo

✅ **Sistema 100% funcional**
- Galería de hasta 20 imágenes por vehículo
- Drag & Drop para reordenar
- Imagen principal marcada con ⭐
- Alt text editable para SEO
- Integración completa con Storage (4 buckets)
- Selector multi-imagen con creación de carpetas
- Guardado transaccional en DB
- Frontend público con lightbox
- Políticas RLS configuradas
- Triggers automáticos funcionando

✅ **Compatible con nuevo sistema Storage**
- Soporte para 4 buckets: `vehicles`, `blog`, `extras`, `media`
- Políticas RLS configuradas en todos los buckets
- Carpetas sugeridas automáticamente (ej: FU0010)
- Subida múltiple de archivos
- Navegación por carpetas
- Eliminación de archivos y carpetas

---

**¡Todo listo para gestionar galerías de vehículos de forma profesional!** 🚗📸

**Última actualización:** 21 de enero de 2026  
**Versión:** 2.0.0 (Integrado con nuevo sistema Storage)
