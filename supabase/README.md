# Furgocasa - Base de Datos Supabase

Esta carpeta contiene el esquema completo y los scripts de la base de datos de Furgocasa.

## 📁 Estructura de Archivos

```
supabase/
├── schema.sql          # Esquema completo de la base de datos
├── seed.sql           # Datos iniciales (categorías, ubicaciones, extras, etc.)
├── README.md          # Este archivo
└── migrations/        # Migraciones SQL (varios archivos; ej. landings mar. 2026: 20260321–20260323)
```

## 🗄️ Estructura de la Base de Datos

### **Tablas Principales**

#### **🚐 Vehículos**
- `vehicle_categories` - Categorías de vehículos (Furgoneta Camper, Autocaravana, etc.)
- `vehicles` - Tabla principal de vehículos (alquiler Y venta)
- `vehicle_images` - Imágenes de cada vehículo
- `vehicle_damages` - Registro de daños (existentes y reparados)

#### **👥 Clientes y Reservas**
- `customers` - Datos de clientes
- `bookings` - Reservas de alquiler (incluye `coupon_id`, `coupon_code`, `coupon_discount`)
- `booking_extras` - Extras contratados en cada reserva
- `payments` - Pagos y transacciones

#### **🎟️ Cupones de Descuento**
- `coupons` - Cupones de descuento (gift/permanent)
- `coupon_usage` - Historial de uso de cupones

#### **🏪 Catálogo**
- `locations` - Puntos de recogida/entrega (`is_pickup` = sedes reales: Murcia, Madrid, Alicante, Albacete, etc.)
- `location_targets` - Landings SEO de **alquiler por ciudad** (metadatos, `hero_content`, `content_sections` JSONB, `nearest_location_id`, `distance_km`). **Estado típico mar. 2026:** ~**59** filas activas (14 en provincia Murcia + anillo 22 + resto España). Comprobar: `npm run check:location-targets-db` desde la raíz del repo.
- `extras` - Extras y accesorios disponibles
- `seasons` - Temporadas y tarifas estacionales
- `vehicle_prices` - Precios por vehículo y temporada (opcional)
- `blocked_dates` - Fechas bloqueadas por vehículo

#### **📝 Contenido (Blog y Publicaciones)**
- `content_categories` - Categorías de contenido
- `posts` - Artículos del blog y publicaciones del sector
- `tags` - Etiquetas
- `post_tags` - Relación posts-tags
- `comments` - Comentarios en posts

#### **🔧 Administración**
- `admins` - Usuarios administradores
- `media` - Biblioteca de medios (para TinyMCE)
- `activity_log` - Registro de actividad (audit log)
- `settings` - Configuración general

## 🚀 Instalación

### **Opción 1: Desde Supabase Dashboard (Recomendado)**

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **SQL Editor**
3. Crea una nueva query
4. Copia el contenido de `schema.sql`
5. Ejecuta
6. Repite con `seed.sql`

### **Opción 2: Desde CLI**

```bash
# Instalar Supabase CLI si no lo tienes
npm install -g supabase

# Inicializar proyecto
supabase init

# Aplicar el esquema
supabase db push

# O ejecutar migraciones manualmente
supabase db reset
```

## 📊 Características Clave

### **Vehículos Duales (Alquiler y Venta)**

Cada vehículo tiene dos checkboxes:
- `is_for_rent` - Disponible para alquiler
- `is_for_sale` - Disponible para venta

Un mismo vehículo puede estar:
- Solo en alquiler (`is_for_rent = true, is_for_sale = false`)
- Solo en venta (`is_for_rent = false, is_for_sale = true`)
- En ambos (`is_for_rent = true, is_for_sale = true`)

### **Sistema de Daños**

La tabla `vehicle_damages` permite:
- Registrar nuevos daños con fotos
- Marcar como "en reparación"
- Marcar como "reparado" con fecha
- Historial completo de daños
- **Numeración independiente** por tipo: exteriores (1, 2, 3...) e interiores (1, 2, 3...) se numeran por separado
- **Vistas**: `front`, `back`, `left`, `right`, `top` (exterior) e `interior`
- **Constraint**: `vehicle_damages_view_type_check` incluye todos los tipos anteriores

### **Blog y Publicaciones Unificados**

La tabla `posts` maneja ambos tipos de contenido con el campo `post_type`:
- `'blog'` - Artículos del blog de Furgocasa
- `'publication'` - Publicaciones del sector
- `'news'` - Noticias de Furgocasa
- **`featured_image`:** URL pública en Storage (bucket **`blog`**, carpeta típica **`ai-covers/`**). Las portadas generadas por IA en la app se publican como **WebP**; ver `docs/02-desarrollo/media/GESTION-MEDIA-STORAGE.md`.

### **Sistema de Precios Flexible**

- Precio base por día en `vehicles.base_price_per_day`
- Modificadores de temporada en `seasons.price_modifier`
- Opcionalmente, precios específicos en `vehicle_prices`

### **Sistema de Cupones de Descuento**

Dos tipos de cupones:
- **gift**: Un solo uso, personalizados (`RAMON20`)
- **permanent**: Múltiples usos, promociones (`INV2026`, `BLACK2026`)

```sql
-- Validaciones automáticas:
-- - Fechas de validez (valid_from, valid_until)
-- - Días mínimos de alquiler (min_rental_days)
-- - Importe mínimo (min_rental_amount)
-- - Límite de usos (max_uses para gift)

-- Descuentos:
-- - percentage: Porcentaje sobre el total
-- - fixed: Cantidad fija en euros
```

**SQL de instalación** (ejecutar en orden):
1. `01-create-coupons-table.sql`
2. `02-create-coupon-usage-table.sql`
3. `03-add-coupon-columns-to-bookings.sql`
4. `04-create-coupon-validation-function.sql`
5. `05-setup-coupon-rls-policies.sql`
6. `06-insert-sample-coupons.sql` (cupón INV2026)

### **Sistema de Ofertas de Última Hora**

Detecta huecos entre reservas que no cumplen el mínimo de días y los convierte en ofertas con descuento:

```sql
-- Características:
-- - Detección automática de huecos
-- - Cancelación automática cuando hay reservas solapadas
-- - Panel admin para gestionar ofertas
-- - Ofertas visibles en /ofertas
```

**SQL de instalación** (ejecutar en orden):
1. `07-create-last-minute-offers-table.sql` - Tabla y estructura
2. `08-last-minute-offers-rls-functions.sql` - Funciones de detección
3. `auto-cancel-conflicting-offers.sql` - **Trigger de cancelación automática** ⚡

**Estados de oferta**:
- `published` - Visible en web
- `auto_cancelled` - Cancelada automáticamente por reserva solapada
- `reserved` - Alguien la reservó
- `expired` - Fecha pasada
- `ignored` - Admin la descartó

**Ver documentación**: `docs/04-referencia/sistemas/AUTO-CANCELACION-OFERTAS.md`

## 🔐 Seguridad (RLS)

Row Level Security está habilitado en todas las tablas:

- **Público**: Puede ver vehículos disponibles, posts publicados, extras activos
- **Clientes autenticados**: Pueden ver sus propios datos y reservas
- **Administradores**: Acceso completo vía service_role

## 🔄 Funciones Útiles

### **Verificar Disponibilidad**
```sql
SELECT check_vehicle_availability(
    'vehicle-uuid-here',
    '2025-06-15'::DATE,
    '2025-06-20'::DATE
);
```

### **Incrementar Vistas de Post**
```sql
SELECT increment_post_views('post-uuid-here');
```

## 📦 Storage Buckets Necesarios

Crear manualmente en Supabase Dashboard → Storage:

```sql
-- Ejecutar en SQL Editor
INSERT INTO storage.buckets (id, name, public) VALUES 
    ('vehicles', 'vehicles', true),
    ('extras', 'extras', true),
    ('blog', 'blog', true),
    ('media', 'media', true);
```

## 📜 Scripts de Migración Adicionales

Para BBDD ya existentes, ejecutar en SQL Editor según necesidad:

| Script | Descripción |
|--------|-------------|
| `20260321-location-targets-nearest-pickup-sync.sql` | Alinea `nearest_location_id` en targets que coinciden con sede |
| `20260322-location-target-hellin.sql` | Landing Hellín (recogida Albacete) |
| `20260323-location-targets-ring-madrid-alicante-albacete.sql` | 22 localidades anillo Madrid / Alicante / Albacete |
| `add-min-quantity-to-extras.sql` | Añade `min_quantity` a extras (mín. días para per_day, ej. parking 4 días) |
| `add-availability-dates-to-locations.sql` | Fechas de disponibilidad por ubicación |
| `add-min-days-to-locations.sql` | Días mínimos de alquiler por ubicación |

**Alternativa Node (mismo efecto que la migración del anillo):** `node scripts/apply-location-targets-ring.js`

## 🔄 Migraciones Futuras

Para cambios futuros, crear archivos en `migrations/`:

```
YYYYMMDDHHMMSS_nombre_descriptivo.sql
```

Ejemplo:
```
20250108120000_add_vehicle_insurance_field.sql
```

## 📝 Notas Importantes

1. **Números de Reserva**: Se generan automáticamente con formato `FC2501XXXX`
2. **Tiempo de Lectura**: Se calcula automáticamente para los posts
3. **Slugs**: Deben ser únicos y URL-friendly
4. **Imágenes**: Usar Supabase Storage y guardar solo las URLs

## 🛠️ Mantenimiento

### **Backup Recomendado**
```bash
# Desde Supabase Dashboard: Settings → Database → Backups
# O usando pg_dump si tienes acceso directo
```

### **Ver Logs de Actividad**
```sql
SELECT * FROM activity_log 
ORDER BY created_at DESC 
LIMIT 100;
```

## 🐛 Troubleshooting

### **Error: "function uuid_generate_v4() does not exist"**
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### **Error: RLS impide insertar datos**
Usa el service_role key para operaciones admin.

### **Ver todas las políticas RLS**
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

## 📚 Documentación Adicional

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## 🤝 Contribuir

Para modificar el esquema:
1. Crear una nueva migración en `migrations/`
2. Actualizar `schema.sql` con los cambios
3. Documentar los cambios aquí
4. Probar en desarrollo antes de producción

---

**Última actualización**: marzo 2026 (`location_targets` ampliado; docs alineadas)  
**Versión del esquema**: 1.2+ (ofertas última hora + landings alquiler por ciudad)





