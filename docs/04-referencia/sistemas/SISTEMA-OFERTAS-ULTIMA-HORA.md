# ⏰ Sistema de Ofertas de Última Hora - Furgocasa

**Versión**: 1.0  
**Fecha**: 23 de Enero, 2026

Sistema para detectar y gestionar huecos entre reservas que no cumplen el mínimo de días de temporada.

---

## 📋 Resumen

Las **Ofertas de Última Hora** son diferentes de los cupones:

| Aspecto | Cupones | Ofertas Última Hora |
|---------|---------|---------------------|
| Aplicación | Cualquier reserva que cumpla condiciones | Vehículo y fechas ESPECÍFICOS |
| Origen | Creados manualmente por admin | Detectados automáticamente por el sistema |
| Duración | Puede durar meses | Días específicos entre reservas |
| Uso típico | Promociones de temporada | Cubrir huecos en temporada alta |

---

## 🔄 Flujo de Trabajo

### 1. Admin detecta huecos

```
/administrator/ofertas-ultima-hora
   ↓
[Botón: Detectar huecos]
   ↓
Sistema analiza reservas → Encuentra huecos < min_days de temporada
```

### 2. Sistema propone ofertas

```
┌────────────────────────────────────────────────┐
│ 🚐 KNAUS Boxstar Street (FU0010)               │
│ 📅 Hueco: 15-20 agosto (5 días)                │
│ ⚠️ Temporada Alta requiere mín. 7 días         │
│ 💰 Precio normal: 145€/día                     │
│                                                │
│ Ajustar oferta:                                │
│ Días: [5] [-][+]  →  15-20 agosto              │
│ Descuento: [20]%  →  116€/día                  │
│                                                │
│ [✅ Publicar]  [❌ Ignorar]                     │
└────────────────────────────────────────────────┘
```

### 3. Admin ajusta y publica

- Puede **reducir días** (ej: 5 → 3 para dejar margen)
- Puede **ajustar descuento** (15%, 20%, 25%...)
- Puede **ignorar** si no le interesa

### 4. Oferta visible en web

La oferta aparece en `/ofertas` → Sección "Última Hora"

---

## 🗄️ Estructura de Base de Datos

### Tabla `last_minute_offers`

```sql
CREATE TABLE last_minute_offers (
    id UUID PRIMARY KEY,
    vehicle_id UUID REFERENCES vehicles(id),
    
    -- Hueco original detectado
    detected_start_date DATE,
    detected_end_date DATE,
    detected_days INTEGER,           -- Calculado automáticamente
    
    -- Fechas publicadas (puede ser menor)
    offer_start_date DATE,
    offer_end_date DATE,
    offer_days INTEGER,              -- Calculado automáticamente
    
    -- Precios
    original_price_per_day DECIMAL,  -- Precio normal
    discount_percentage INTEGER,     -- 15, 20, 25...
    final_price_per_day DECIMAL,     -- Calculado automáticamente
    
    -- Estado
    status VARCHAR(20),
    -- 'detected'  = Pendiente de revisión
    -- 'published' = Visible en web
    -- 'reserved'  = Alguien la reservó
    -- 'expired'   = Pasó la fecha
    -- 'ignored'   = Admin la descartó
    
    booking_id UUID,                 -- Si se reservó
    previous_booking_id UUID,        -- Reserva anterior
    next_booking_id UUID,            -- Reserva siguiente
    
    admin_notes TEXT,
    detected_at TIMESTAMP,
    published_at TIMESTAMP,
    reserved_at TIMESTAMP,
    expired_at TIMESTAMP
);
```

---

## 🔧 Funciones SQL

### `detect_booking_gaps()`

Detecta huecos entre reservas que no cumplen el mínimo de temporada.

```sql
SELECT * FROM detect_booking_gaps();
```

**Retorna:**
| Campo | Descripción |
|-------|-------------|
| vehicle_id | ID del vehículo |
| vehicle_name | Nombre del vehículo |
| gap_start_date | Inicio del hueco |
| gap_end_date | Fin del hueco |
| gap_days | Días del hueco |
| season_name | Temporada afectada |
| season_min_days | Mínimo de días requerido |
| season_price_per_day | Precio normal por día |
| already_exists | Si ya existe oferta para este hueco |

### `get_active_last_minute_offers()`

Obtiene ofertas publicadas y activas para mostrar en la web.

```sql
SELECT * FROM get_active_last_minute_offers();
```

### `publish_last_minute_offer()`

Publica una oferta ajustando opcionalmente fechas y descuento.

```sql
SELECT publish_last_minute_offer(
    'offer-uuid',
    '2026-08-15'::DATE,  -- nueva fecha inicio (opcional)
    '2026-08-18'::DATE,  -- nueva fecha fin (opcional)
    20,                   -- descuento % (opcional)
    'Notas del admin'     -- notas (opcional)
);
```

### `expire_past_offers()`

Marca como expiradas las ofertas cuya fecha ya pasó.

```sql
SELECT expire_past_offers();
```

---

## 📁 Archivos SQL

| Archivo | Orden | Descripción |
|---------|-------|-------------|
| `07-create-last-minute-offers-table.sql` | 1 | Tabla, índices, trigger |
| `08-last-minute-offers-rls-functions.sql` | 2 | RLS, funciones de detección |

---

## 🎯 Ejemplo Práctico

### Situación:

```
KNAUS Boxstar - Agosto 2026 (Temporada Alta, mín 7 días)

Reserva 1: 1-14 agosto (cliente A)
Reserva 2: 20-31 agosto (cliente B)

Hueco: 15-19 agosto (5 días) ← NO cumple mínimo de 7 días
```

### Sistema detecta:

```json
{
  "vehicle_name": "KNAUS Boxstar Street",
  "gap_start_date": "2026-08-15",
  "gap_end_date": "2026-08-20",
  "gap_days": 5,
  "season_name": "Temporada Alta Agosto",
  "season_min_days": 7,
  "season_price_per_day": 145
}
```

### Admin decide:

- Publicar 3 días (15-18) con 20% descuento
- Dejar 2 días de margen antes de la siguiente reserva

### Resultado:

```
Oferta publicada:
- Fechas: 15-18 agosto (3 días)
- Precio normal: 145€/día = 435€ total
- Precio oferta: 116€/día = 348€ total
- Ahorro cliente: 87€
```

---

## 📱 Panel Admin

**URL**: `/administrator/ofertas-ultima-hora`

### Funcionalidades:

- ✅ Botón "Detectar huecos" 
- ✅ Lista de huecos detectados
- ✅ Ajustar días de la oferta
- ✅ Ajustar % de descuento
- ✅ Publicar / Ignorar ofertas
- ✅ Ver ofertas publicadas
- ✅ Ver ofertas reservadas (historial)
- ✅ Ver ofertas expiradas

---

## 🌐 Web Pública

La sección **"Ofertas de Última Hora"** en `/ofertas` se alimenta automáticamente de la tabla `last_minute_offers` filtrando por `status = 'published'`.

La sección **"Cupones de Temporada"** (banners promocionales) **no** usa esta tabla ni `coupons`. Es manual: ver **`PAGINA-OFERTAS-WEB.md`**.

---

## 🔒 Seguridad (RLS)

| Rol | Permisos |
|-----|----------|
| Público | Ver ofertas publicadas no expiradas |
| Admin | CRUD completo |
| Service Role | CRUD completo (para API) |

---

**Documentación relacionada**:
- `PAGINA-OFERTAS-WEB.md` - Reglas página `/ofertas` (banners manuales vs última hora automática)
- `SISTEMA-CUPONES.md` - Sistema de cupones de descuento
- `FLUJO-RESERVAS-CRITICO.md` - Flujo de reservas
- `supabase/README.md` - Esquema de base de datos
