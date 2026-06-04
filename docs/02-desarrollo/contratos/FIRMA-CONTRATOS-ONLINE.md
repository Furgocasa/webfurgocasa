# Firma online de contratos — Documentación técnica

**Estado:** ✅ Producción  
**Versión documento legal:** `v2` (`CONTRACT_VERSION` en `src/lib/contracts/config.ts`)  
**Última actualización:** 4 de junio de 2026

---

## Resumen

Los clientes firman el **contrato de alquiler** y el **anexo de protección de datos (GPS)** en la página pública de documentación, sin imprimir ni escanear. La identidad se valida con **nº de reserva + email** (mismo patrón que Storytellers). El PDF firmado se genera en servidor, se guarda en Supabase Storage y se envía por email al cliente y a `reservas@furgocasa.com`.

**URL pública (ES):** https://www.furgocasa.com/es/documentacion-alquiler  
**Admin:** https://www.furgocasa.com/administrator/contratos-firmados

---

## Flujo del cliente

1. Entra en `/es/documentacion-alquiler` (equivalentes EN/DE/FR).
2. Ve los pasos para confirmar la reserva (DNI, firma, fianza, etc.). **No hay enlaces públicos a PDFs** del contrato.
3. En «Firma tu contrato sin imprimir nada», introduce **nº de reserva** y **email**.
4. Tras validar (`POST /api/contracts/validate-booking`), lee cada documento en **texto HTML** con scroll obligatorio hasta el final.
5. Marca los **puntos delicados** (fianza, franquicia, limpieza, etc.) y las casillas de aceptación.
6. Firma en canvas (condiciones + protección de datos).
7. Confirma en modal final → `POST /api/contracts/sign`.
8. Recibe email con PDF adjunto; Furgocasa recibe la misma copia.

Si no acepta o no firma ambos documentos: mensaje *«No se puede continuar con el alquiler. Debes aceptar y firmar ambos documentos.»*

---

## Página pública (sin PDFs descargables)

Las tarjetas «Documentación del Contrato» con «Ver documento» se **eliminaron** (junio 2026). El texto del contrato solo es visible **después** de validar reserva + email, para no exponer el contenido a visitantes anónimos.

| Idioma | Ruta |
|--------|------|
| ES | `src/app/es/documentacion-alquiler/documentacion-client.tsx` |
| EN | `src/app/en/rental-documentation/documentacion-client.tsx` |
| DE | `src/app/de/mietdokumentation/documentacion-client.tsx` |
| FR | `src/app/fr/documentation-location/documentacion-client.tsx` |

Componente de firma: `src/components/contracts/contract-signing.tsx`

---

## Contenido del contrato (texto)

| Archivo | Uso |
|---------|-----|
| `src/lib/contracts/contract-content.ts` | Texto íntegro condiciones + anexo GPS. Fuente única para **lectura en web** y **PDF firmado**. |
| `src/lib/contracts/confirmations.ts` | IDs y textos de los checks obligatorios (cliente + servidor + PDF). |

Cláusulas críticas van con `highlight: true` → se muestran en **rojo** en el lector web y en el PDF generado.

**Importante:** Los PDF en `public/documentos/*.pdf` ya **no** se usan en el flujo de firma (solo referencia histórica / archivo). No enlazarlos desde la web.

---

## API

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/contracts/validate-booking` | Valida reserva + email; devuelve token de sesión HMAC (30 min). Rate limit + honeypot. |
| `POST` | `/api/contracts/sign` | Verifica token, genera PDF, sube a Storage, inserta en BD, envía email. `runtime: nodejs`, `maxDuration: 60`. |

**Variables de entorno:**

- `CONTRACTS_HMAC_SECRET` (≥32 caracteres) o fallback `STORYTELLERS_HMAC_SECRET`
- `NEXT_PUBLIC_BASE_URL` / `NEXT_PUBLIC_APP_URL` (metadatos; ya no se descargan PDFs base por HTTP)

---

## PDF firmado (generación)

`src/lib/contracts/pdf.ts` — biblioteca `pdf-lib`.

**Estructura del PDF (v2):**

1. Condiciones del alquiler (texto paginado desde `contract-content`)
2. Anexo protección de datos (texto paginado)
3. Página «Puntos importantes confirmados» (lista de checks)
4. Página «Firma electrónica» (datos reserva + rúbricas, **sin recuadros** grandes)

**Nota:** La primera página en blanco (bug inicial) se corrigió en commit `e89c3a9d`: no crear página vacía antes del primer banner.

---

## Email tras firmar

Implementación: `src/app/api/contracts/sign/route.ts` → `sendEmail` con adjunto PDF.

**Asunto (sin nº de reserva):**

```text
Contrato firmado - {internal_code vehículo} - {DD/MM/AAAA inicio} - {Nombre completo cliente}
```

Ejemplo: `Contrato firmado - MA0014 - 18/06/2026 - Narciso Pardo Buendia`

**Destinatarios:** email del cliente + `getCompanyEmail()` (reservas).

**Nombre del adjunto:** `Contrato-firmado-{booking_number}.pdf`

Más contexto de emails: [SISTEMA-EMAILS.md](../../04-referencia/emails/SISTEMA-EMAILS.md) — sección *Contrato firmado online*.

---

## Base de datos y Storage

### Tabla `signed_contracts`

Migraciones:

- `supabase/migrations/20260604-signed-contracts.sql` — tabla + bucket + RLS
- `supabase/migrations/20260604-signed-contracts-confirmations.sql` — columna `confirmations` JSONB

Campos relevantes: `booking_id`, `booking_number`, `customer_email`, `contract_version`, `signed_pdf_path`, `signed_at`, `ip_address`, `confirmations`.

Un cliente puede firmar **varias veces** (nuevo registro cada vez); `alreadySigned` es solo informativo en la UI.

### Bucket `signed-contracts`

- Privado (`public: false`)
- Ruta: `{booking_id}/{uuid}.pdf`
- Acceso descarga admin vía URL firmada (1 h)

### Limpieza de pruebas

**Panel admin:** buscar por nº reserva → **Eliminar todos** o papelera por fila.  
`DELETE /api/admin/signed-contracts?bookingNumber=...` o `?id=...`

**SQL puntual (solo tabla):**

```sql
DELETE FROM signed_contracts WHERE booking_number = 'FG85813107';
```

Ver también: `supabase/migrations/20260605-cleanup-test-signed-contracts-fg85813107.sql`

---

## Panel de administración

Ruta: `/administrator/contratos-firmados`  
API: `GET` / `DELETE` `/api/admin/signed-contracts`  
Doc admin: [CONTRATOS-FIRMADOS.md](../../04-referencia/admin/CONTRATOS-FIRMADOS.md)

---

## Archivos clave

```
src/
├── components/contracts/contract-signing.tsx
├── lib/contracts/
│   ├── config.ts              # versión, documentos, HMAC sesión
│   ├── contract-content.ts    # texto íntegro
│   ├── confirmations.ts       # checks obligatorios
│   ├── booking-validation.ts
│   ├── pdf.ts                 # PDF firmado
│   └── delete-signed-contracts.ts
└── app/api/contracts/
    ├── validate-booking/route.ts
    └── sign/route.ts
```

---

## Commits de referencia

| Commit | Tema |
|--------|------|
| `4a5cc4df` | Firma online inicial |
| `d0265e9b` | Lectura obligatoria + confirmaciones + modal |
| `85973c1a` | Lector texto + cláusulas en rojo (sin pdf.js) |
| `b1e832d2` | PDF desde texto v2, sin sección pública PDF |
| `c26c1d86` | Asunto email vehículo + fecha + nombre |
| `e89c3a9d` | Fix primera página PDF vacía |
| `e0bf8ee5` | Eliminar contratos desde admin |

---

## Mantenimiento

### Cambiar el texto del contrato

1. Editar `src/lib/contracts/contract-content.ts` (fiel al legal).
2. Subir `CONTRACT_VERSION` en `config.ts` (p. ej. `v3`).
3. Desplegar. Las firmas nuevas guardarán la nueva versión; las antiguas conservan la suya en BD/PDF.

### Añadir o quitar un check obligatorio

1. `src/lib/contracts/confirmations.ts` — `CONDITIONS_CONFIRMATIONS` o `DATA_PROTECTION_CONFIRMATIONS`.
2. Marcar la cláusula con `highlight: true` en `contract-content.ts` si aplica.
3. `ALL_CONFIRMATION_IDS` se regenera solo; el servidor valida todos en `/api/contracts/sign`.

### No tocar

- `src/lib/redsys/crypto.ts` (regla del proyecto)
