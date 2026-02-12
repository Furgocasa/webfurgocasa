# Sistema de Vehículos Vendidos

**Última actualización:** 12 de Febrero 2026  
**Estado:** Implementado y en producción

---

## Resumen

Los vehículos vendidos (`sale_status = 'sold'`) son un **estado definitivo** que mantiene el histórico completo pero los excluye de operaciones activas (calendario, disponibilidad, nueva reserva). Es independiente de si el vehículo estaba "en venta" o solo en alquiler.

---

## Diferencias Clave

| Concepto | Descripción |
|----------|-------------|
| **En venta** | `is_for_sale = true` + `sale_status = 'available'` → Aparece en sección venta. NO afecta alquiler. |
| **Vendido** | `sale_status = 'sold'` → Estado definitivo. Sale de calendario, disponibilidad, reservas. Mantiene histórico. |

---

## Comportamiento por Sección

### Secciones donde NO aparece (excluido automáticamente)

| Sección | Filtro aplicado |
|---------|-----------------|
| **Calendario admin** | `.or('sale_status.neq.sold,sale_status.is.null')` |
| **API disponibilidad** | Búsqueda pública de vehículos |
| **API ocupación** | Estadísticas de ocupación |
| **Nueva reserva (admin)** | Selector de vehículos |
| **Suscripción calendario ICS** | Eventos de entregas |

### Secciones donde SÍ aparece (con opción de mostrar/ocultar)

| Sección | Comportamiento |
|---------|----------------|
| **Lista de vehículos** | Ocultos por defecto. Checkbox "Mostrar vendidos" para verlos. Fondo rojo claro. |
| **Registro de daños** | Ocultos por defecto. Checkbox "Mostrar vendidos" para verlos. Badge VENDIDO. |
| **Informes** | **SIEMPRE visibles** con todos los datos históricos. Fondo rojo claro y badge VENDIDO. |

### Datos que se mantienen (histórico intacto)

- Reservas pasadas del vehículo
- Ingresos históricos en informes
- Tabla de control de ingresos por vehículo y año
- Datos del vehículo en base de datos (no se borra nada)

---

## Flujo en el Administrador

### Marcar como vendido

1. Ir a **Vehículos** → Editar vehículo
2. Sección **"Estado definitivo"** (roja, arriba)
3. Marcar checkbox "Marcar como VENDIDO"
4. **Modal de confirmación** detallado con efectos
5. Confirmar → Se aplica `sale_status = 'sold'` + `is_for_rent = false`

### Revertir venta (caso excepcional)

- Botón "Revertir venta" cuando el vehículo está vendido
- Solo usar si la venta se cancela (ej: comprador se retracta de arras)
- Recupera `sale_status = 'available'`
- El admin decide manualmente si reactiva alquiler

---

## Indicadores Visuales

En todas las secciones donde pueden aparecer vendidos:

- **Fondo rojo claro** (`bg-red-50`) en filas/tarjetas
- **Badge "VENDIDO"** en rojo
- **Checkbox "Mostrar vendidos"** en listas donde están ocultos por defecto

---

## Queries y Filtros

### Excluir vendidos (operaciones activas)

```typescript
.or('sale_status.neq.sold,sale_status.is.null')
```

### Incluir vendidos (informes, histórico)

No aplicar filtro de `sale_status` en queries de informes.

---

## Informes: Cambio Importante (12 Feb 2026)

**Antes:** Los informes filtraban por `is_for_rent`, excluyendo vehículos vendidos (que tienen `is_for_rent = false`).

**Ahora:** Los informes muestran **TODOS** los vehículos (incluidos vendidos) para mantener histórico completo.

- **Cálculo de ocupación:** Solo usa vehículos activos en alquiler (`activeRentableVehicles`)
- **Datos por vehículo:** Usa todos (`allVehiclesForReports`) incluyendo vendidos
- **Tabla de control:** Incluye filas de vehículos vendidos con badge VENDIDO
- **Selector de vehículos:** Botones con fondo rojo para vendidos

---

## Archivos Relacionados

| Archivo | Cambio |
|---------|--------|
| `src/app/api/availability/route.ts` | Filtro exclude sold |
| `src/app/api/occupancy-highlights/route.ts` | Filtro exclude sold |
| `src/app/administrator/(protected)/calendario/page.tsx` | Filtro exclude sold |
| `src/app/administrator/(protected)/reservas/nueva/page.tsx` | Filtro exclude sold |
| `src/app/administrator/(protected)/vehiculos/page.tsx` | Toggle mostrar vendidos + stat |
| `src/app/administrator/(protected)/vehiculos/[id]/editar/page.tsx` | Sección estado definitivo + modal |
| `src/app/administrator/(protected)/danos/page.tsx` | Toggle mostrar vendidos |
| `src/app/administrator/(protected)/informes/informes-client.tsx` | Todos los vehículos + indicadores |
| `src/lib/calendar/calendar-handler.ts` | Filtro exclude sold |

---

## Base de Datos

No se requieren migraciones. El campo `sale_status` ya existe con valores: `'available' | 'reserved' | 'sold'`.
