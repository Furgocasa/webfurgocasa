# Jerarquía de Z-Index en Furgocasa

## 📋 Reglas de oro
1. **El header sticky SIEMPRE debe estar visible** pero los modales deben poder estar por encima de él.
2. **Los modales/diálogos deben usar `z-[1100]`** para estar por encima del header.

## 🎯 Jerarquía establecida (v1.0.6+)

### Nivel 1100+ (Modales y Diálogos)
- **Modales/Diálogos**: `z-[1100]` - Por encima del header para poder cerrarse
  - Modal calendario reservas
  - Lightbox de imágenes
  - Diálogos de confirmación
  - Modal configuración cookies
  - Selectores de imagen
  - Headless UI Dialogs

### Nivel 1000-1099 (Navegación global)
- **Header**: `z-[1000]` - Barra de navegación sticky
  - Dropdown de idiomas: `z-[1200]`
  - Backdrop idiomas: `z-[1100]`
  - Dropdown Furgocasa: `z-[1200]`
- **Footer**: Sin z-index (siempre al final del documento)

### Nivel 100-200 (Dropdowns de contenido)
- **Dropdowns del SearchWidget**:
  - Calendario fecha: `z-[200]`
  - Selector ubicación: `z-[200]`
  - Backdrop dropdowns: `z-[100]`
- **SearchWidget container**: `z-50`

### Nivel 50 (Elementos flotantes UI)
- **Barras flotantes inferiores**: `z-50`
  - Barra precio móvil en reservas
- **Botones flotantes**: `z-50`
  - WhatsApp chatbot
  - Back to top
  - Cookie banner (bottom)
- **Admin sidebar**: `z-50`

### Nivel 1-50 (Contenido de página)
- **Hero section content**: `z-10`
- **Barras sticky de reserva**: `z-30`

### Nivel 0 (Contenido base)
- **Secciones de contenido**: Sin z-index o `z-0`
- **HeroSlider imágenes**: Sin z-index (dentro del contenedor)

## ✅ Correcciones aplicadas (v1.0.6)

### Antes (INCORRECTO ❌)
```tsx
// Header
z-50 // ¡MUY BAJO!

// Modales
z-50 // ¡Por debajo del header! No se pueden cerrar

// Dropdowns
z-[9999] // ¡Por encima de TODO!
```

### Después (CORRECTO ✅)
```tsx
// Header sticky
z-[1000] // Siempre visible

// Modales/Diálogos
z-[1100] // Por ENCIMA del header para poder cerrarse

// Contenido de página
z-10 a z-50 // Por debajo del header

// Dropdowns header
z-[1200] // Por encima de modales (contexto interno del header)
```

## 🚫 Errores a evitar

1. **NUNCA** poner modales con z-index menor a 1100
2. **NUNCA** usar valores exagerados como `z-[9999]`
3. **SIEMPRE** verificar que los modales puedan cerrarse en móvil
4. **SIEMPRE** verificar que el header quede visible al hacer scroll

## 🔍 Cómo verificar

1. Abrir cualquier modal/diálogo (ej: calendario admin, lightbox)
2. **Verificar móvil**: El botón X de cerrar debe estar accesible
3. **Verificar**: El modal debe estar por encima del header
4. **Verificar**: Al cerrar el modal, el header sigue visible

## 📝 Notas

- El header usa `position: sticky` (v1.0.6+) para quedarse arriba sin necesitar padding compensatorio
- Los modales usan `position: fixed` con `z-[1100]` para estar por encima del header
- Los dropdowns del header usan `z-[1200]` pero están dentro del contexto del header
- Las barras flotantes inferiores usan `z-50` (no interfieren con el header)

## 📅 Historial

- **v1.0.6** (20 Enero 2026): Header sticky + modales a z-[1100]
- **v1.0.4**: Header fixed con z-[1000]
