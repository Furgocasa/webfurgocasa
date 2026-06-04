# Admin — Contratos firmados

**Ruta:** `/administrator/contratos-firmados`  
**API:** `/api/admin/signed-contracts`  
**Documentación completa:** [FIRMA-CONTRATOS-ONLINE.md](../../02-desarrollo/contratos/FIRMA-CONTRATOS-ONLINE.md)

---

## Qué muestra

Listado de firmas online completadas: reserva, cliente, versión del documento (`v1`, `v2`, …), fecha/hora, IP y enlace de descarga del PDF (URL firmada 1 h al bucket privado `signed-contracts`).

---

## Búsqueda

Por nº de reserva, email o nombre (`?q=` en la API).

---

## Eliminar registros (pruebas o error)

| Acción | Cómo |
|--------|------|
| Una fila | Icono papelera → confirma → borra fila en BD + PDF en Storage |
| Toda una reserva | Buscar el nº (ej. `FG85813107`) → botón **Eliminar todos (FG85813107)** |

**API:**

- `DELETE /api/admin/signed-contracts?id={uuid}`
- `DELETE /api/admin/signed-contracts?bookingNumber=FG85813107`

Requiere sesión admin (`requireAdmin`).

**Solo SQL (sin borrar PDFs en Storage):**

```sql
DELETE FROM signed_contracts WHERE booking_number = 'FG85813107';
```

Para borrar también los PDF, usar el panel o Storage manualmente.

---

## Sidebar

Entrada «Contratos firmados» en `src/components/admin/sidebar.tsx`.
