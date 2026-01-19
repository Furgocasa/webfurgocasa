# Migración y Optimización de Datos: Clientes y Reservas

## 📋 Resumen del Problema

Actualmente los datos de clientes se están guardando en la tabla `bookings` pero no se actualizan en la tabla `customers`, resultando en:
- Tabla `customers` con campos vacíos (phone, dni, address, etc.)
- Datos completos solo en tabla `bookings`
- Arquitectura de datos inconsistente

## 🎯 Solución Implementada

### 1. Corrección en el código (YA APLICADO)
- ✅ API `/api/customers` ahora actualiza datos existentes
- ✅ Proceso de reserva guarda datos completos en `customers`

### 2. Migración de datos históricos (POR EJECUTAR)

#### Paso 1: Ejecutar Script de Migración

```bash
# Desde la raíz del proyecto
npx tsx scripts/migrate-customer-data.ts
```

Este script:
- Lee todas las reservas existentes
- Extrae datos de clientes de cada reserva
- Actualiza la tabla `customers` con los datos faltantes
- Solo actualiza campos vacíos (no sobrescribe datos existentes)
- Genera reporte detallado de cambios

#### Paso 2: Aplicar SQL de Optimización

1. Abrir Supabase Dashboard → SQL Editor
2. Copiar contenido de `supabase/optimize-customer-bookings.sql`
3. Ejecutar el script completo

Este SQL hace:
- ✅ Añade índices para mejorar rendimiento
- ✅ Crea trigger para sincronización automática
- ✅ Crea vista unificada `bookings_with_customer_details`
- ✅ Función para fusionar clientes duplicados
- ✅ Comentarios en campos para documentación

## 📊 Arquitectura de Datos Optimizada

### Tabla `customers` (FUENTE PRINCIPAL)
```
Campos principales:
- id (UUID)
- email (único)
- name
- phone
- dni
- date_of_birth
- address, city, postal_code, country
- driver_license, driver_license_expiry
- total_bookings, total_spent
```

### Tabla `bookings` (SNAPSHOT + REFERENCIA)
```
Campos:
- id (UUID)
- customer_id → customers(id)
- customer_name, customer_email, customer_phone (snapshot)
- customer_dni, customer_address, customer_city, customer_postal_code (snapshot)
```

**Nota:** Los campos `customer_*` en `bookings` son un snapshot histórico del momento de la reserva. Los datos actuales siempre están en `customers`.

## 🔄 Flujo de Datos Actualizado

### Al Crear Reserva:
1. Usuario completa formulario
2. Sistema busca cliente por email/DNI
3. **Si existe**: actualiza datos en `customers`
4. **Si no existe**: crea nuevo registro en `customers`
5. Crea booking con `customer_id` y snapshot de datos
6. **Trigger automático** sincroniza datos adicionales

### Al Consultar Datos:
```sql
-- Usar la vista unificada
SELECT * FROM bookings_with_customer_details 
WHERE id = 'booking-id';

-- O hacer JOIN manual
SELECT b.*, c.* 
FROM bookings b
LEFT JOIN customers c ON b.customer_id = c.id;
```

## 🧪 Verificación

### Antes de la migración:
```sql
SELECT 
  COUNT(*) as total_clientes,
  COUNT(phone) as con_telefono,
  COUNT(dni) as con_dni,
  COUNT(address) as con_direccion
FROM customers;
```

### Después de la migración:
```sql
-- Ejecutar consultas de verificación incluidas en optimize-customer-bookings.sql
-- Deberías ver más clientes con datos completos
```

## 🛠️ Mantenimiento

### Fusionar Clientes Duplicados (Opcional)
```sql
-- Si detectas clientes duplicados por email
SELECT merge_duplicate_customers();
```

### Monitorear Sincronización
El trigger `sync_customer_data_from_booking` se ejecuta automáticamente, pero puedes verificar:
```sql
-- Ver últimas actualizaciones
SELECT id, name, email, updated_at 
FROM customers 
ORDER BY updated_at DESC 
LIMIT 10;
```

## 📈 Beneficios

1. **Datos Centralizados**: Única fuente de verdad en `customers`
2. **Histórico Preservado**: Snapshot en `bookings` para auditoría
3. **Sincronización Automática**: Trigger mantiene datos actualizados
4. **Mejor Rendimiento**: Índices optimizados
5. **Consultas Simplificadas**: Vista unificada lista para usar
6. **Sin Duplicados**: Función de limpieza incluida

## 🚨 Importante

- ⚠️ Hacer backup de la base de datos antes de ejecutar
- ⚠️ Ejecutar en horario de bajo tráfico
- ⚠️ Verificar resultados antes de continuar
- ✅ El script de migración es seguro (solo actualiza campos vacíos)
- ✅ El SQL es reversible (no elimina datos por defecto)

## 📝 Orden de Ejecución

1. ✅ Código actualizado (ya deployado)
2. 🔄 `npx tsx scripts/migrate-customer-data.ts`
3. 🔄 Ejecutar `supabase/optimize-customer-bookings.sql` en Supabase
4. ✅ Verificar resultados
5. ✅ Monitorear nuevas reservas

## 🆘 Soporte

Si algo falla:
1. Revisar logs del script de migración
2. Verificar permisos en Supabase
3. Comprobar que SUPABASE_SERVICE_ROLE_KEY está configurado
4. Restaurar backup si es necesario
