# Imágenes Hero - Furgocasa

## 📋 Resumen

Se han optimizado **18 imágenes variadas** en formato WebP, seleccionadas de la carpeta `images/slides web/` para usar en diferentes partes de la web.

## 🖼️ Uso de Imágenes

### Home (`src/app/page.tsx`)
Usa un **slider con 6 imágenes variadas** que rotan cada 5 segundos:
- `hero-01.webp`, `hero-05.webp`, `hero-11.webp`, `hero-13.webp`, `hero-15.webp`, `hero-17.webp`

### Páginas de Localizaciones (`src/app/[location]/page.tsx`)
Cada página de localización muestra una **imagen fija única** según la ciudad:
- **Murcia**: hero-11.webp (Murcia)
- **Madrid**: hero-12.webp (España)
- **Cartagena**: hero-17.webp (Mazarrón)
- **Lorca**: hero-18.webp (Lorca)
- **Alicante**: hero-16.webp (Altea)
- **Albacete**: hero-04.webp
- **Almería**: hero-08.webp
- **Valencia**: hero-15.webp (Gandía)
- **Elche**: hero-14.webp (A Coruña)
- **Resto de ciudades**: hero-13.webp (Pirineos) como imagen por defecto

## 🎯 Origen de las Imágenes

| Archivo WebP | Imagen Original | Usado en |
|-------------|----------------|----------|
| hero-01.webp | furgocasa_..._rent_ (1).jpg | Home slider |
| hero-02.webp | furgocasa_..._rent_ (10).jpg | - |
| hero-03.webp | furgocasa_..._rent_ (22).jpg | - |
| hero-04.webp | furgocasa_..._rent_ (35).jpg | Albacete |
| hero-05.webp | furgocasa_..._rent_ (46).jpg | Home slider |
| hero-06.webp | furgocasa_..._rent_ (54).jpg | - |
| hero-07.webp | furgocasa_..._rent_ (60).jpg | - |
| hero-08.webp | furgocasa_..._rent_ (70).jpg | Almería |
| hero-09.webp | furgocasa_..._rent_ (83).jpg | - |
| hero-10.webp | furgocasa_..._rent_ (93).jpg | - |
| hero-11.webp | furgocasa_..._murcia.jpg | Home slider + Murcia |
| hero-12.webp | furgocasa_..._espana.jpg | Madrid |
| hero-13.webp | furgocasa_..._pirineos.jpg | Home slider + Default |
| hero-14.webp | furgocasa_..._a_coruna.jpg | Elche |
| hero-15.webp | furgocasa_..._gandia.jpg | Home slider + Valencia |
| hero-16.webp | furgocasa_..._altea.jpg | Alicante |
| hero-17.webp | furgocasa_..._mazarron.jpg | Home slider + Cartagena |
| hero-18.webp | furgocasa_..._lorca.jpg | Lorca |

## 🔧 Script de Optimización

Se creó el script `scripts/optimize-hero-images.js` que:
- Convierte imágenes JPG → WebP
- Redimensiona a 1920x1080 (mantiene ratio con fit: cover)
- Aplica calidad 85% (balance entre calidad/tamaño)
- Genera nombres secuenciales (hero-01, hero-02, etc.)

### Uso del script:
```bash
node scripts/optimize-hero-images.js
```

## 📊 Resultados de Optimización

**Total de imágenes:** 18
**Tamaño promedio:** ~298 KB por imagen
**Tamaño total:** ~5.36 MB (vs originales JPG que serían ~15-20 MB)
**Ahorro:** ~70-75% de reducción de tamaño

## 🎨 Estrategia de Uso

### ✅ Ventajas del enfoque actual:

1. **Home con slider (6 imágenes)**: 
   - Crea dinamismo en la página principal
   - Muestra variedad de la oferta
   - No sobrecarga (rotación cada 5s)

2. **Localizaciones con imagen fija**:
   - Cada ciudad tiene identidad visual única
   - Carga más rápida (solo 1 imagen)
   - Mejor SEO (imagen específica por localización)
   - Usuario identifica mejor la página

## 🚀 Añadir Nuevas Localizaciones

Para asignar imagen a una nueva ciudad, editar la función en `src/app/[location]/page.tsx`:

```typescript
const getLocationHeroImage = (cityName: string): string => {
  const cityImageMap: Record<string, string> = {
    'NuevaCiudad': '/images/slides/hero-XX.webp',
    // ... resto de ciudades
  };
  return cityImageMap[cityName] || '/images/slides/hero-13.webp';
};
```

## 🔄 Actualizar Imágenes

Si se desea cambiar la selección:

1. Editar el array `selectedImages` en `scripts/optimize-hero-images.js`
2. Ejecutar `node scripts/optimize-hero-images.js`
3. Actualizar referencias en:
   - `src/app/page.tsx` (array del slider - máximo 8 imágenes)
   - `src/app/[location]/page.tsx` (función `getLocationHeroImage`)

## 📝 Notas

- Las imágenes optimizadas están en `public/images/slides/`
- Las originales permanecen en `images/slides web/`
- El componente `HeroSlider` solo se usa en la home
- Páginas de localizaciones usan `<Image>` de Next.js con `priority` para carga inmediata
