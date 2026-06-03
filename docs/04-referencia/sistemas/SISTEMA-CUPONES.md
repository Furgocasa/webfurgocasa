# 🎟️ Sistema de Cupones de Descuento - Furgocasa

**Versión**: 1.0  
**Fecha**: 23 de Enero, 2026

Sistema completo para gestionar cupones de descuento en el proceso de reserva.

---

## 📋 Resumen

El sistema permite crear y gestionar dos tipos de cupones:

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| **gift** | Un solo uso, personalizado para un cliente | `RAMON20` |
| **permanent** | Múltiples usos, promociones de temporada | `INV2026`, `BLACK2026` |

---

## 🗄️ Estructura de Base de Datos

### Tabla `coupons`

```sql
CREATE TABLE coupons (
    id UUID PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,     -- Código único (ej: INV2026)
    name VARCHAR(200) NOT NULL,           -- Nombre descriptivo
    description TEXT,
    coupon_type VARCHAR(20),              -- 'gift' o 'permanent'
    discount_type VARCHAR(20),            -- 'percentage' o 'fixed'
    discount_value DECIMAL(10,2),         -- 20 para 20% o 50 para 50€
    min_rental_days INTEGER DEFAULT 1,    -- Días mínimos de alquiler
    min_rental_amount DECIMAL(10,2),      -- Importe mínimo
    valid_from TIMESTAMP,                 -- Fecha inicio (opcional)
    valid_until TIMESTAMP,                -- Fecha fin (opcional)
    max_uses INTEGER,                     -- 1 para gift, NULL para permanent
    current_uses INTEGER DEFAULT 0,       -- Contador de usos
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Tabla `coupon_usage`

Historial de uso de cupones:

```sql
CREATE TABLE coupon_usage (
    id UUID PRIMARY KEY,
    coupon_id UUID REFERENCES coupons(id),
    booking_id UUID REFERENCES bookings(id),
    customer_id UUID REFERENCES customers(id),
    discount_amount DECIMAL(10,2),
    original_amount DECIMAL(10,2),
    final_amount DECIMAL(10,2),
    used_at TIMESTAMP
);
```

### Columnas añadidas a `bookings`

```sql
ALTER TABLE bookings ADD COLUMN coupon_id UUID;
ALTER TABLE bookings ADD COLUMN coupon_code VARCHAR(50);
ALTER TABLE bookings ADD COLUMN coupon_discount DECIMAL(10,2) DEFAULT 0;
```

---

## 🔄 Flujo de Uso

### 1. Cliente introduce código en `/reservar/nueva`

```
[Campo cupón] → [Botón Aplicar]
```

### 2. Validación via API

```
POST /api/coupons/validate
{
  "code": "INV2026",
  "pickup_date": "2026-02-01",
  "dropoff_date": "2026-02-12",
  "rental_amount": 1800
}
```

### 3. Respuesta si válido

```json
{
  "valid": true,
  "coupon": {
    "id": "uuid...",
    "code": "INV2026",
    "name": "INVIERNO MÁGICO 2026",
    "discount_type": "percentage",
    "discount_value": 15,
    "discount_amount": 270
  }
}
```

### 4. Cálculo del precio

```typescript
const subtotal = basePrice + extrasPrice;     // 1800€
const couponDiscount = 270;                    // 15%
const totalPrice = subtotal - couponDiscount;  // 1530€
```

### 5. Al confirmar reserva

- Se guarda `coupon_id`, `coupon_code`, `coupon_discount` en `bookings`
- Se incrementa `current_uses` en `coupons`
- Se registra en `coupon_usage`

---

## ✅ Validaciones

El sistema valida:

| Condición | Error |
|-----------|-------|
| Cupón no existe o inactivo | "Cupón no válido o inactivo" |
| `valid_from` > fecha actual | "El cupón aún no está activo" |
| `valid_until` < fecha actual | "El cupón ha expirado" |
| `current_uses >= max_uses` | "El cupón ya ha sido utilizado" |
| días < `min_rental_days` | "El alquiler debe ser de al menos X días" |
| importe < `min_rental_amount` | "El importe mínimo es X€" |

---

## 🛠️ Panel de Administración

**URL**: `/administrator/cupones`

### Funcionalidades

- ✅ Crear nuevos cupones (gift o permanent)
- ✅ Editar cupones existentes
- ✅ Activar/desactivar cupones
- ✅ Ver estadísticas de uso
- ✅ Filtrar por tipo (gift/permanent)
- ✅ Buscar por código o nombre
- ✅ Eliminar cupones

### Información mostrada

| Campo | Descripción |
|-------|-------------|
| Código | Código único del cupón |
| Tipo | Gift (un uso) o Permanent (múltiples) |
| Descuento | Porcentaje o cantidad fija |
| Condiciones | Días mínimos, importe mínimo |
| Validez | Fechas desde/hasta |
| Usos | Contador actual / máximo |
| Estado | Activo, Inactivo, Expirado, Agotado |

---

## 📁 Archivos del Sistema

### Backend (API)

| Archivo | Función |
|---------|---------|
| `src/app/api/coupons/validate/route.ts` | Validar cupón |
| `src/app/api/bookings/create/route.ts` | Guardar cupón en reserva |

### Frontend

| Archivo | Función |
|---------|---------|
| `src/app/reservar/nueva/page.tsx` | Campo de cupón en reserva |
| `src/app/administrator/(protected)/cupones/page.tsx` | Panel admin |
| `src/components/admin/sidebar.tsx` | Enlace en menú |

### SQL

| Archivo | Orden | Función |
|---------|-------|---------|
| `01-create-coupons-table.sql` | 1 | Crear tabla coupons |
| `02-create-coupon-usage-table.sql` | 2 | Crear tabla coupon_usage |
| `03-add-coupon-columns-to-bookings.sql` | 3 | Añadir columnas a bookings |
| `04-create-coupon-validation-function.sql` | 4 | Funciones SQL |
| `05-setup-coupon-rls-policies.sql` | 5 | Políticas de seguridad |
| `06-insert-sample-coupons.sql` | 6 | Cupón INV2026 |

---

## 🎫 Cupón Activo: INV2026

| Campo | Valor |
|-------|-------|
| **Código** | `INV2026` |
| **Nombre** | INVIERNO MÁGICO 2026 |
| **Tipo** | permanent |
| **Descuento** | 15% |
| **Días mínimos** | 10 |
| **Válido desde** | 5 enero 2026 |
| **Válido hasta** | 20 marzo 2026 |
| **Usos** | Ilimitados |

**Visibilidad en web pública (`/ofertas`)**: **NO automática**. Aunque el cupón funcione en checkout, solo aparece en la página de ofertas si se añade un banner manual en `src/lib/offers/seasonal-banners.ts` bajo petición del negocio. Ver **`PAGINA-OFERTAS-WEB.md`**.

---

## ⚠️ Privacidad — Cupones y página `/ofertas`

La tabla `coupons` incluye códigos **gift** (un solo cliente). **Nunca** listar cupones de BD en la web pública.

| Sistema | Dónde se gestiona | Dónde se promociona |
|---------|-------------------|---------------------|
| Cupones checkout (`coupons`) | `/administrator/cupones` | Solo banner manual en `seasonal-banners.ts` |
| Cupones Storytellers (`STO-*`) | `storyteller_coupons` | No en `/ofertas` |
| Ofertas última hora | `last_minute_offers` | Automático en `/ofertas` (otro doc) |

Documentación obligatoria: **`PAGINA-OFERTAS-WEB.md`**

---

## 🔒 Seguridad (RLS)

- **Público**: Puede validar cupones activos en checkout (`/api/coupons/validate`) — **no** implica listarlos en `/ofertas`
- **Admin**: CRUD completo sobre cupones
- **Sistema**: Registro de uso via service_role

---

## 📝 Ejemplos de Uso

### Crear cupón gift (un solo uso)

```sql
INSERT INTO coupons (
    code, name, coupon_type, discount_type, discount_value, max_uses, is_active
) VALUES (
    'CLIENTE123', 'Descuento especial cliente', 'gift', 'percentage', 20, 1, true
);
```

### Crear cupón permanent (promoción)

```sql
INSERT INTO coupons (
    code, name, coupon_type, discount_type, discount_value,
    min_rental_days, valid_from, valid_until, is_active
) VALUES (
    'VERANO2026', 'Promoción Verano', 'permanent', 'percentage', 10,
    7, '2026-06-01', '2026-08-31', true
);
```

### Consultar cupones usados

```sql
SELECT 
    c.code, c.name, c.current_uses, c.max_uses,
    COUNT(cu.id) as total_usos,
    SUM(cu.discount_amount) as total_descuentos
FROM coupons c
LEFT JOIN coupon_usage cu ON c.id = cu.coupon_id
GROUP BY c.id
ORDER BY c.current_uses DESC;
```

---

## 🚀 Próximas Mejoras (Opcional)

- [ ] Cupones por categoría de vehículo
- [ ] Cupones solo para nuevos clientes
- [ ] Límite máximo de descuento (ej: 20% max 500€)
- [ ] Cupones de referidos
- [ ] Notificación cuando un cupón gift es usado
- [ ] Exportar estadísticas de cupones a CSV

---

**Documentación relacionada**:
- `PAGINA-OFERTAS-WEB.md` - **Reglas obligatorias** página `/ofertas` (banners manuales vs BD)
- `FLUJO-RESERVAS-CRITICO.md` - Flujo completo de reservas
- `supabase/README.md` - Esquema de base de datos
- `CHANGELOG.md` - Historial de versiones
