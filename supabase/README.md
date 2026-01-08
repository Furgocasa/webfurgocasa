# Furgocasa - Base de Datos Supabase

Esta carpeta contiene el esquema completo y los scripts de la base de datos de Furgocasa.

## 📁 Estructura de Archivos

```
supabase/
├── schema.sql          # Esquema completo de la base de datos
├── seed.sql           # Datos iniciales (categorías, ubicaciones, extras, etc.)
├── README.md          # Este archivo
└── migrations/        # Migraciones de la base de datos
    └── 20250107000000_initial_schema.sql
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
- `bookings` - Reservas de alquiler
- `booking_extras` - Extras contratados en cada reserva
- `payments` - Pagos y transacciones

#### **🏪 Catálogo**
- `locations` - Puntos de recogida/entrega
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

### **Blog y Publicaciones Unificados**

La tabla `posts` maneja ambos tipos de contenido con el campo `post_type`:
- `'blog'` - Artículos del blog de Furgocasa
- `'publication'` - Publicaciones del sector
- `'news'` - Noticias de Furgocasa

### **Sistema de Precios Flexible**

- Precio base por día en `vehicles.base_price_per_day`
- Modificadores de temporada en `seasons.price_modifier`
- Opcionalmente, precios específicos en `vehicle_prices`

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

**Última actualización**: Enero 2025  
**Versión del esquema**: 1.0





