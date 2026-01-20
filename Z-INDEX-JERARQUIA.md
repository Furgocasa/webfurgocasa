# Jerarquía de Z-Index en Furgocasa

## 📋 Regla de oro
**El header y footer SIEMPRE deben estar por encima de todo el contenido de la página.**

## 🎯 Jerarquía establecida

### Nivel 1000+ (Navegación global)
- **Header**: `z-[1000]` - Barra de navegación fija
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

### Nivel 1-50 (Contenido de página)
- **Hero section content**: `z-10`
- **Barras sticky de reserva**: `z-30`
  - `/reservar/vehiculo`: `z-30`
  - `/reservar/nueva`: `z-30`

### Nivel 0 (Contenido base)
- **Secciones de contenido**: Sin z-index o `z-0`
- **HeroSlider imágenes**: Sin z-index (dentro del contenedor)

## ✅ Correcciones aplicadas

### Antes (INCORRECTO ❌)
```tsx
// Header
z-50 // ¡MUY BAJO!

// Hero content
z-[200] // ¡Por encima del header!

// SearchWidget
z-[300] // ¡Por encima del header!

// Dropdowns
z-[9999] // ¡Por encima de TODO!
```

### Después (CORRECTO ✅)
```tsx
// Header
z-[1000] // Siempre visible

// Hero content
z-10 // Dentro del contenido

// SearchWidget
z-50 // Dentro del contenido, encima del hero

// Dropdowns
z-[200] // Visibles pero por debajo del header
```

## 🚫 Errores a evitar

1. **NUNCA** poner z-index mayor a 999 en contenido de página
2. **NUNCA** usar valores exagerados como `z-[9999]`
3. **SIEMPRE** verificar que el header quede visible al hacer scroll
4. **SIEMPRE** verificar que los dropdowns no tapen el header

## 🔍 Cómo verificar

1. Abrir la home en el navegador
2. Abrir un dropdown (calendario, ubicación, hora)
3. Hacer scroll hacia abajo
4. **Verificar**: El header debe quedar visible por encima del dropdown
5. **Verificar**: Al hacer scroll, el contenido de la página debe pasar por debajo del header

## 📝 Notas

- Los dropdowns usan `position: absolute` relativo a su contenedor padre
- Los backdrops usan `position: fixed` para cubrir toda la pantalla
- El header usa `position: fixed` para quedar siempre visible
- Las barras sticky usan `position: sticky` integradas en el flujo del documento
