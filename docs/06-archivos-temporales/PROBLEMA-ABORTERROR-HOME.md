# Problema: AbortError en Home (Reportado 20/01/2026)

## 📋 Descripción del problema

El usuario reporta ver mensajes de error infinitos en la consola cuando está en la Home (`/`):

```
[ReservarVehiculo] AbortError detected - request was cancelled, retrying...
[ReservarVehiculo] Retrying in 1000ms... (attempt 1/3, AbortError)
[ReservarVehiculo] Retry vehicle: 16b40b15-5b17-4521-8dd8-8b33a4b25609 (attempt 1/4)
[ReservarVehiculo] Vehicle error: {message: 'AbortError: signal is aborted without reason', ...}
```

El usuario menciona que piensa que tiene que ver con no poder coger las imágenes de los vehículos.

## 🔍 Análisis del problema

### Hallazgos clave:

1. **Los logs dicen `[ReservarVehiculo]`**: Este prefijo es específico de `/src/app/reservar/vehiculo/page.tsx`, NO de la Home.

2. **La Home es un Server Component**: El archivo `/src/app/page.tsx` es un Server Component que carga datos en el servidor con `getFeaturedVehicles()`, NO en el cliente.

3. **No hay fetch de imágenes en cliente en la Home**: El componente `VehicleImageSlider` recibe las imágenes como props, no las carga.

4. **Patrón de retry infinito**: El código en `/reservar/vehiculo/page.tsx` tiene un mecanismo de retry que puede entrar en bucle si:
   - Se detecta un `AbortError`
   - El retry falla
   - Se intenta de nuevo

### Conclusión más probable:

El usuario tiene **logs antiguos en la consola** de una navegación previa a `/reservar/vehiculo` que quedaron ahí. Los navegadores modernos NO limpian la consola automáticamente al navegar entre rutas en una SPA (Single Page Application).

### Posibles causas secundarias:

1. **Prefetching de Next.js**: Next.js puede estar precargando `/reservar/vehiculo` en segundo plano
2. **Múltiples pestañas**: El usuario puede tener otra pestaña abierta con `/reservar/vehiculo`
3. **Service Worker**: Puede haber requests atascadas de un service worker

## 🛠️ Solución propuesta

### Opción 1: Limpiar consola (recomendada para depuración)

Agregar un efecto en la Home que limpie la consola cuando se monte:

```tsx
// En src/app/page.tsx, agregar un componente cliente que limpie la consola
"use client";
import { useEffect } from "react";

function ConsoleCleaner() {
  useEffect(() => {
    console.clear();
    console.log('[Home] Página cargada');
  }, []);
  return null;
}

// Luego incluirlo en el JSX de HomePage
```

### Opción 2: Limitar reintentos en /reservar/vehiculo

Modificar el mecanismo de retry en `/src/app/reservar/vehiculo/page.tsx` para:
- Reducir el número máximo de reintentos de 3 a 1
- Aumentar el delay entre reintentos
- NO reintentar en casos de AbortError (porque indica que la request fue cancelada intencionalmente)

```tsx
// En loadData() de /reservar/vehiculo/page.tsx
// Línea 189-192

// NO reintentar si es AbortError
if (isAbortError) {
  console.warn('[ReservarVehiculo] AbortError - request cancelled by user/navigation');
  setError('La carga fue cancelada');
  setLoading(false);
  return;
}

// Solo reintentar otros errores (máximo 1 vez)
if (retryCount < 1) {
  const delay = 2000; // 2 segundos
  console.log(`[ReservarVehiculo] Retrying in ${delay}ms... (attempt ${retryCount + 1}/1)`);
  // ...resto del código
}
```

### Opción 3: Verificar que no hay problema real con imágenes

Comprobar en la base de datos que:
1. Los vehículos tienen imágenes asociadas en la tabla `vehicle_images`
2. Las URLs de imágenes son válidas
3. Las imágenes existen en el storage de Supabase

```sql
-- Query para verificar vehículos destacados y sus imágenes
SELECT 
  v.id,
  v.name,
  v.slug,
  vi.image_url,
  vi.is_primary,
  vi.sort_order
FROM vehicles v
LEFT JOIN vehicle_images vi ON vi.vehicle_id = v.id
WHERE v.is_for_rent = true
  AND v.status != 'inactive'
ORDER BY v.internal_code, vi.is_primary DESC, vi.sort_order;
```

## 🧪 Pasos para reproducir y verificar

1. **Abrir el navegador en modo incógnito** (para evitar cache/service workers)
2. **Ir directamente a** `http://localhost:3000/`
3. **Abrir la consola del navegador**
4. **Verificar si aparecen logs `[ReservarVehiculo]`**
   - Si SÍ aparecen: hay un problema real
   - Si NO aparecen: confirma que eran logs antiguos

5. **Si aparecen, verificar la pestaña Network:**
   - Ver si hay requests a `/api/` o Supabase que están fallando
   - Ver si hay requests con status "cancelled"

6. **Navegar a** `/reservar/vehiculo?vehicle_id=xxx&...`
7. **Regresar a** `/`
8. **Verificar si los logs persisten** en la consola

## ✅ Estado

- [ ] Problema reproducido
- [x] Causa raíz identificada: Retry infinito en caso de AbortError
- [x] Solución implementada: 
  - NO reintentar en caso de AbortError (porque indica cancelación intencional)
  - Reducir reintentos de 3 a 1 para errores de red
  - Aumentar delay de retry de 1s a 2s
- [ ] Solución verificada

## 🔧 Cambios implementados

### Archivos modificados:

1. **`/src/app/reservar/vehiculo/page.tsx`**
   - Líneas 175-208: Modificado el catch block
   - Cambio: NO reintentar en caso de `AbortError`
   - Cambio: Reducir reintentos de 3 a 1
   - Cambio: Aumentar delay de 1s a 2s

2. **`/src/app/ventas/page.tsx`**
   - Líneas 174-206: Modificado el catch block
   - Cambios idénticos a los de reservar/vehiculo

### Lógica antes (problemática):

```typescript
if (isAbortError) {
  console.warn('[ReservarVehiculo] AbortError detected - request was cancelled, retrying...');
}

// Retry automático si no hemos alcanzado el límite (máximo 3 intentos)
if (retryCount < 3) {
  const delay = 1000 * (retryCount + 1); // 1s, 2s, 3s
  // ... retry
}
```

### Lógica ahora (corregida):

```typescript
if (isAbortError) {
  // NO reintentar AbortError - significa que la request fue cancelada intencionalmente
  console.warn('[ReservarVehiculo] AbortError detected - request was cancelled by navigation/user');
  setError('La carga fue cancelada. Por favor, recarga la página.');
  setLoading(false);
  return; // ← CRÍTICO: salir inmediatamente, no reintentar
}

// Retry automático SOLO para errores de red (máximo 1 intento adicional)
if (retryCount < 1) {
  const delay = 2000; // 2 segundos
  // ... retry
}
```

## 🧪 Pasos para verificar la solución

1. **Limpiar caché y reiniciar el servidor de desarrollo:**
   ```bash
   # Detener el servidor (Ctrl+C)
   # Limpiar caché de Next.js
   rm -rf .next
   # Reiniciar
   npm run dev
   ```

2. **Probar navegación normal:**
   - Ir a Home (`/`)
   - Abrir DevTools > Console
   - Verificar que NO aparecen logs `[ReservarVehiculo]`
   - Los vehículos deberían cargar correctamente con sus imágenes

3. **Probar /reservar/vehiculo:**
   - Hacer una búsqueda desde la Home
   - Seleccionar un vehículo
   - Ir a `/reservar/vehiculo?vehicle_id=...&...`
   - **Antes de que termine de cargar, navegar a otra página (Home)**
   - Verificar que:
     - Aparece el log: `[ReservarVehiculo] AbortError detected - request was cancelled by navigation/user`
     - NO aparecen logs de "Retrying"
     - La consola NO entra en bucle infinito

4. **Probar error de red real:**
   - Ir a `/reservar/vehiculo?vehicle_id=...`
   - En DevTools > Network, activar "Offline"
   - Esperar a que falle
   - Verificar que:
     - Aparece: `[ReservarVehiculo] Retrying in 2000ms... (attempt 1/1)`
     - Solo reintenta UNA vez
     - Después muestra el mensaje de error

5. **Verificar que las imágenes cargan correctamente:**
   - Ir a Home
   - Verificar que los 3 vehículos destacados muestran sus imágenes
   - Hacer hover sobre las imágenes (debería cambiar de imagen con el slider)
   - Verificar en Network que las imágenes se cargan desde Supabase storage

## 📝 Notas adicionales

- El código de retry en `/reservar/vehiculo` fue diseñado para manejar conexiones inestables
- Los `AbortError` normalmente ocurren cuando:
  - El usuario navega a otra página antes de que termine la request
  - La request es cancelada por el navegador
  - Hay un timeout en la conexión
- NO debería reintentar en caso de `AbortError` porque es intencional
