# 🐛 PROBLEMA: Vehículos destacados no se muestran en la HOME

## Fecha: 20 de enero de 2026

## 🔴 Problema identificado

La sección "Los mejores modelos en alquiler" en la home **no muestra los 3 vehículos destacados**, aunque:
- ✅ Los vehículos SÍ están en la base de datos
- ✅ Se muestran correctamente en `/vehiculos`
- ✅ Hay 9 vehículos activos disponibles

## 🔍 Causa raíz

Error en la query de Supabase en `src/lib/home/server-actions.ts`:

### ❌ Query incorrecta (antes):
```typescript
.select(`
  id,
  name,
  slug,
  brand,
  model,
  passengers,
  beds,
  images:vehicle_images(image_url, is_primary)  // ❌ Alias incorrecto
`)
```

La query usaba un alias `images:vehicle_images` que Supabase no estaba interpretando correctamente, causando que:
1. No se obtuvieran las imágenes
2. El mapeo posterior fallaba silenciosamente
3. No había logging de errores para diagnosticar

### ✅ Query corregida (después):
```typescript
.select(`
  id,
  name,
  slug,
  brand,
  model,
  passengers,
  beds,
  vehicle_images(image_url, is_primary)  // ✅ Nombre directo de la tabla
`)
```

Además:
- ✅ Añadido manejo de errores con `console.error`
- ✅ Verificación explícita de error en la respuesta
- ✅ Cambio en el mapeo de `vehicle.images` a `vehicle.vehicle_images`

## 📝 Cambios realizados

### Archivo modificado: `src/lib/home/server-actions.ts`

**Líneas 30-66**: Función `getFeaturedVehicles()`

Cambios principales:
1. Eliminado alias `images:` en la query de Supabase
2. Añadida desestructuración del error: `{ data: vehicles, error }`
3. Añadido logging de errores
4. Actualizado mapeo de `vehicle.images` → `vehicle.vehicle_images`

## 🎯 Resultado esperado

Después del fix:
- ✅ La home mostrará 3 vehículos destacados
- ✅ Se ordenarán por `internal_code` ascendente
- ✅ Mostrarán la imagen principal (`is_primary = true`)
- ✅ Si no hay imagen principal, se usa la primera disponible
- ✅ Los errores se logearán en consola para debugging

## ✅ Testing

Para verificar que funciona:

1. **Recargar la home**: `https://www.furgocasa.com`
2. **Verificar sección**: "Los mejores modelos en alquiler"
3. **Debe mostrar 3 vehículos** con:
   - Imagen principal
   - Nombre
   - Marca y modelo
   - Plazas y camas
   - Enlace a detalle

## 📊 Vehículos en base de datos

Actualmente hay 9 vehículos activos:
1. Dreamer D55 Fun
2. Knaus Boxstar 600 Street
3. Weinsberg CaraTour 600 MQ
4. Knaus Boxstar 600 Family
5. Adria Twin Plus 600 SP Family
6. Knaus Boxlife 600 DQ
7. Weinsberg Carabus 600 MQ
8. Weinsberg Carabus 540 MQ
9. Dethleffs Globetrail DS

La home mostrará los 3 primeros según orden de `internal_code`.

## 🔧 Próximos pasos

Si después del fix todavía no se muestran:

1. **Verificar políticas RLS**: `vehicle_images` debe permitir SELECT público
2. **Verificar imágenes**: Comprobar que los vehículos tienen imágenes asignadas
3. **Verificar `is_primary`**: Al menos uno debe tener `is_primary = true`
4. **Revisar logs**: Vercel Functions logs para ver errores de Supabase

## Prioridad

🟡 **MEDIA** - No crítico pero afecta presentación de la home

## Estado

✅ **SOLUCIONADO** - Query corregida, pendiente verificación en producción
