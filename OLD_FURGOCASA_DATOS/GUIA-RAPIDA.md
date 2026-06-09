# 🚀 GUÍA RÁPIDA: Migración de Datos

## Pasos para Migrar

### 1️⃣ Instalar dependencias

```bash
npm install
```

Esto instalará `mysql2` que necesitamos para conectar a MySQL.

---

### 2️⃣ Configurar MySQL

Edita el archivo `scripts/export-from-mysql.ts` y actualiza las credenciales:

```typescript
const MYSQL_CONFIG = {
  host: 'localhost',     // ⬅️ Cambiar si es necesario
  user: 'root',          // ⬅️ Tu usuario de MySQL
  password: 'tu_password', // ⬅️ Tu contraseña de MySQL
  database: 'furgocasa_old',
  port: 3306,
};
```

---

### 3️⃣ Restaurar BD antigua (si aún no lo has hecho)

```bash
# Crear base de datos
mysql -u root -p -e "CREATE DATABASE furgocasa_old;"

# Restaurar dump
mysql -u root -p furgocasa_old < "OLD_FURGOCASA_DATOS/9d7fe11f-30bc-428c-b4db-39411a20fcae-mysql217.furgocasoxfur.2026-01-19-10h51"
```

---

### 4️⃣ Exportar datos de MySQL a JSON

```bash
npm run migrate:export
```

Esto creará:
- ✅ `OLD_FURGOCASA_DATOS/customers.json` (~1015 clientes)
- ✅ `OLD_FURGOCASA_DATOS/bookings-activas.json` (reservas activas)

---

### 5️⃣ Verificar archivos JSON

Abre los archivos y verifica que tienen datos:

```bash
# Ver primeros clientes
cat OLD_FURGOCASA_DATOS/customers.json | head -n 50

# Ver primeras reservas
cat OLD_FURGOCASA_DATOS/bookings-activas.json | head -n 50
```

---

### 6️⃣ IMPORTANTE: Crear ubicaciones y vehículos en Supabase

Antes de importar, necesitas:

#### A) Crear al menos una ubicación:

```sql
-- En Supabase SQL Editor
INSERT INTO locations (name, slug, is_pickup, is_dropoff, is_active)
VALUES ('Madrid - Sede Principal', 'madrid-principal', true, true, true);
```

#### B) Crear al menos un vehículo:

```sql
-- En Supabase SQL Editor
INSERT INTO vehicles (
  name, 
  slug, 
  seats, 
  beds, 
  base_price_per_day, 
  is_for_rent,
  status
)
VALUES (
  'Furgoneta Genérica', 
  'furgoneta-generica', 
  4, 
  2, 
  100.00,
  true,
  'available'
);
```

---

### 7️⃣ Importar a Supabase

```bash
npm run migrate:import
```

El script:
- ✅ Leerá los archivos JSON
- ✅ Insertará clientes en lotes de 100
- ✅ Insertará reservas activas
- ✅ Mostrará resumen de migración

---

### 8️⃣ Actualizar estadísticas de clientes

Ejecuta en Supabase SQL Editor:

```sql
UPDATE customers SET
  total_bookings = (
    SELECT COUNT(*) 
    FROM bookings 
    WHERE bookings.customer_id = customers.id
  ),
  total_spent = (
    SELECT COALESCE(SUM(total_price), 0) 
    FROM bookings 
    WHERE bookings.customer_id = customers.id 
    AND status != 'cancelled'
  )
WHERE id IN (
  SELECT DISTINCT customer_id 
  FROM bookings 
  WHERE customer_id IS NOT NULL
);
```

---

## 🎯 OPCIÓN RÁPIDA: Todo en un comando

Si ya configuraste MySQL y tienes ubicaciones/vehículos en Supabase:

```bash
npm run migrate:all
```

Esto ejecuta automáticamente:
1. Export de MySQL → JSON
2. Import de JSON → Supabase

---

## ✅ Verificación Final

### En Supabase Dashboard:

1. Ve a la tabla `customers` → Debe tener ~1015 registros
2. Ve a la tabla `bookings` → Debe tener las reservas activas

### En tu aplicación:

```bash
npm run dev
```

- Ir a `http://localhost:3000/admin/reservas`
- Ver que aparecen las reservas migradas
- Verificar datos de clientes

---

## ⚠️ Problemas Comunes

### "Cannot connect to MySQL"
- Verifica que MySQL esté corriendo
- Comprueba usuario y contraseña en `export-from-mysql.ts`
- Asegúrate de que la BD `furgocasa_old` existe

### "Faltan credenciales de Supabase"
- Verifica que `.env.local` tiene las credenciales:
  ```
  NEXT_PUBLIC_SUPABASE_URL=...
  SUPABASE_SERVICE_ROLE_KEY=...
  ```

### "No hay ubicaciones configuradas"
- Crea al menos una ubicación en Supabase (ver paso 6A)

### "Vehículo no encontrado"
- Crea al menos un vehículo en Supabase (ver paso 6B)
- O el script usará el primer vehículo disponible

---

## 📊 Datos que se Migran

### ✅ TODOS los clientes (1015+)
- Nombre, email, teléfono
- DNI, dirección, ciudad
- Fecha de nacimiento
- Notas

### ✅ Solo reservas activas/futuras
- Reservas con fecha de devolución >= HOY
- Incluye: futuras + en curso
- Excluye: reservas completadas

---

## 🆘 Si Algo Sale Mal

1. **Revisa los logs** del script
2. **Verifica los JSON** tienen datos válidos
3. **Comprueba Supabase** tiene ubicaciones y vehículos
4. **Elimina datos** y vuelve a intentar:

```sql
-- ⚠️ Solo si quieres reiniciar
DELETE FROM bookings;
DELETE FROM customers;
```

---

## 📝 Después de Migrar

- ✅ Elimina la BD temporal MySQL
- ✅ Guarda backup de los JSON
- ✅ Prueba crear una nueva reserva
- ✅ Verifica emails de confirmación
- ✅ Actualiza vehículos con datos reales

---

¡Listo! Tu base de datos debería estar completamente migrada 🎉
