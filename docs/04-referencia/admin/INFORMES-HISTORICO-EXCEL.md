# Informes admin: histórico Excel + modos de ingresos

**Última actualización:** 2 de junio de 2026
**Estado:** Implementado y en producción
**Ruta:** `/administrator/informes`

---

## Resumen

La página de **Informes y Estadísticas** combina dos fuentes de datos sin doble conteo:

1. **Reservas reales** de la web nueva (tabla `bookings`).
2. **Histórico de ocupación** importado del Excel `FURGOCASA - ANALISIS OCUPACION.xlsx` (hoja `DATOS`), guardado en la tabla `historical_bookings`.

El histórico cubre **2018–2026** y permite ver la evolución del negocio antes de la web actual. Se puede activar/desactivar con el toggle **"Histórico incluido"** (activo por defecto).

---

## Tabla `historical_bookings`

- Migración: `supabase/migrations/20260602-historical-bookings.sql`.
- **RLS activado SIN políticas públicas**: solo se lee/escribe con `service_role` (`createAdminClient`). La página `informes/page.tsx` la carga en servidor con paginación (la API de Supabase limita a 1000 filas por petición).
- Cada fila es **un alquiler agrupado** (no un día suelto): fechas, días, `total_price`, vehículo como texto, cliente, canal, etc.
- **1.244 registros**, ingresos totales **931.008,87 €**.

---

## Importación desde el Excel

Script: `scripts/import-historical-occupancy.ts` → `npm run import:historical`
(`-- --dry-run` para previsualizar).

### Lógica
- El Excel es un registro **diario**: 1 fila por vehículo y día (~22.430 filas).
- Se agrupan los días `ALQUILADA`/`PREVENTA` consecutivos (mismo vehículo + cliente) en un alquiler.
- `total_price` = suma de los precios diarios (`PVP ALQUILER`) del tramo.
- `external_key` idempotente (`código|inicio|fin|cliente`) → reimportar es seguro (upsert).

### ⚠️ GOTCHA CRÍTICO: celdas con fórmula en el .xlsx
El precio (`9 - PVP ALQUILER` / `10 - PRECIO`) viene en el Excel como **fórmula con valor cacheado**:

```xml
<c r="O50" s="8"><f>IF(...="VACIA","0,00",[9 - PVP ALQUILER])</f><v>100</v></c>
```

El parser **debe extraer `<v>` aunque vaya precedido de `<f>`**. El regex original solo capturaba `<v>` pegado a `>`, así que **descartaba todas las celdas con fórmula** y se quedaba con ~15% de los importes (145.430 € en vez de 931.008,87 €).

Regex correcto (usado en `import-historical-occupancy.ts` y `_verify-historical-import.ts`):

```ts
const cRe = /<c r="([A-Z]+\d+)"([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g;
// y luego, dentro del contenido de la celda:
const vMatch = /<v>([\s\S]*?)<\/v>/.exec(inner);
```

### Validación
La fuente de verdad para validar es la **caché del pivot del Excel** (`xl/pivotCache/pivotCacheRecords1.xml`), que suma exactamente lo que el usuario ve en su tabla dinámica:

| Año | Excel (pivot) |
|-----|---------------|
| 2018 | 25.817,06 |
| 2019 | 49.757,58 |
| 2020 | 39.546,50 |
| 2021 | 66.990,31 |
| 2022 | 113.276,68 |
| 2023 | 189.211,09 |
| 2024 | 238.212,43 |
| 2025 | 192.337,94 |
| 2026 | 18.185,71 |
| **Total** | **933.335,30** |

La BD guarda **931.008,87 €**: la diferencia (2.326,43 €) son **67 días de 2021 marcados como `AVERÍA`** (KNAUS BOX FU0001, indemnización repartida por día). El pivot los suma porque no filtra por estado; la web los **excluye a propósito** porque no son alquileres reales.

---

## Combinación histórico + reservas (`mergeHistorical`)

En `informes-client.tsx`:
- Los alquileres históricos cuyo código de vehículo coincide con un vehículo actual se atribuyen a ese vehículo.
- **Alias de códigos** (vehículos renombrados): `FU0013→MA0013`, `FU0014→MA0014`, `FU0017→MA0017`, `FU0008→FU0021`.
- Vehículos antiguos ya vendidos → vehículos sintéticos `hist:...` con `is_for_rent=false` (fuera del denominador de ocupación actual).
- **Deduplicación:** si un alquiler histórico solapa (mismo vehículo + fechas) con una reserva real válida, se descarta para no contar doble en el periodo de transición a la web nueva.
- El histórico se importa con **`created_at = null`** (ver más abajo).

---

## Los DOS modos de ingresos

La tabla mensual y el gráfico de ingresos tienen un selector con dos modos:

| Modo | Qué hace | Histórico Excel |
|------|----------|-----------------|
| **Creación de pedidos** | Imputa el importe **completo** de la reserva al mes en que se **creó el pedido** (`created_at`). Mide actividad comercial. | ❌ No aparece (no tiene fecha de creación de pedido). |
| **Días alquilados** | Reparte el importe **proporcionalmente entre los días** que la furgo estuvo alquilada, mes a mes. Mide facturación operativa. | ✅ Aparece y **cuadra con el Excel**. |

- **Por defecto: "Días alquilados"** (es el que cuadra con el Excel de ocupación).
- El histórico tiene `created_at = null` a propósito: solo conocemos cuándo se alquiló, no cuándo se creó el pedido. Por eso en "Creación de pedidos" solo se ven las reservas reales de la web.

### ⚠️ GOTCHA: alquileres que cruzan de año
En la tabla de control, cada año debe sumar **solo los días que realmente caen en él**. NO filtrar por "año de recogida": un alquiler 28-dic → 5-ene repartía mal y **perdía los días de enero del año siguiente**. La lógica correcta procesa cada año por solapamiento real (recogida y devolución) y reparte por días. Verificado: el reparto por días cuadra al céntimo con el Excel diario en todos los años.

---

## UI de la tabla de control

- Arranca con **todos los años contraídos**.
- Botón **"Expandir todos / Contraer todos"** en la cabecera (junto al selector de modo).
- Click en la flecha de cada año para abrir/cerrar uno solo.

---

## Cómo reimportar el histórico

1. Colocar el Excel actualizado como `FURGOCASA - ANALISIS OCUPACION.xlsx` en la raíz.
2. `npm run import:historical -- --dry-run` para previsualizar totales.
3. `npm run import:historical` para escribir (upsert idempotente).
4. Verificar con `npx tsx scripts/_verify-historical-import.ts`.

---

## Archivos clave

- `supabase/migrations/20260602-historical-bookings.sql`
- `scripts/import-historical-occupancy.ts` (importador)
- `scripts/_verify-historical-import.ts` (verificación contra el Excel)
- `src/app/administrator/(protected)/informes/page.tsx` (carga con `createAdminClient` + paginación)
- `src/app/administrator/(protected)/informes/informes-client.tsx` (`mergeHistorical`, `revenueByMonth`, `revenueControlTable`, modos de ingresos, UI)
