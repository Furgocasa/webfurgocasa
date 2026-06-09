# 🚀 Guía de Migración de Datos

Esta guía te ayudará a migrar todos los clientes y las reservas activas desde la antigua web (VikRentCar + Joomla + MySQL) a la nueva aplicación (Supabase).

---

## 📋 Requisitos Previos

1. ✅ Tener acceso a la base de datos MySQL antigua
2. ✅ Tener las credenciales de Supabase en `.env.local`
3. ✅ Node.js instalado (v18 o superior)
4. ✅ Al menos una ubicación creada en Supabase
5. ✅ Al menos un vehículo creado en Supabase

---

## 🔧 Paso 1: Restaurar Base de Datos MySQL (Temporal)

Primero necesitas restaurar el dump de MySQL en un servidor temporal:

```bash
# Crear base de datos
mysql -u root -p -e "CREATE DATABASE furgocasa_old;"

# Restaurar el dump
mysql -u root -p furgocasa_old < "OLD_FURGOCASA_DATOS/9d7fe11f-30bc-428c-b4db-39411a20fcae-mysql217.furgocasoxfur.2026-01-19-10h51"
```

---

## 📊 Paso 2: Exportar Datos a JSON

### Opción A: Usar MySQL Workbench o phpMyAdmin

1. Conectar a la base de datos `furgocasa_old`
2. Ejecutar la consulta `1-export-customers.sql`
3. Exportar resultados como `customers.json`
4. Ejecutar la consulta `2-export-bookings-activas.sql`
5. Exportar resultados como `bookings-activas.json`
6. Guardar ambos archivos en la carpeta `OLD_FURGOCASA_DATOS/`

### Opción B: Usar línea de comandos

```bash
# Exportar clientes
mysql -u root -p furgocasa_old < OLD_FURGOCASA_DATOS/1-export-customers.sql \
  --batch --skip-column-names \
  | jq -Rs 'split("\n") | map(select(length > 0) | split("\t")) | .[1:] | map({id: .[0], first_name: .[1], last_name: .[2], email: .[3], phone: .[4], country: .[5], address: .[6], city: .[7], zip: .[8], docnum: .[9], bdate: .[10], notes: .[11]})' \
  > OLD_FURGOCASA_DATOS/customers.json

# Exportar reservas activas
mysql -u root -p furgocasa_old < OLD_FURGOCASA_DATOS/2-export-bookings-activas.sql \
  --batch --skip-column-names \
  | jq -Rs 'split("\n") | map(select(length > 0) | split("\t")) | .[1:] | map({id: .[0], ts: .[1], status: .[2], nominative: .[3], custmail: .[4], phone: .[5], country: .[6], idcar: .[7], vehicle_name: .[8], ritiro: .[9], consegna: .[10], days: .[11], order_total: .[12], totpaid: .[13], locationvat: .[14], adminnotes: .[15], optionals: .[16], coupon: .[17], idplace: .[18], idreturnplace: .[19]})' \
  > OLD_FURGOCASA_DATOS/bookings-activas.json
```

### Opción C: Script de exportación automático (RECOMENDADO)

Voy a crear un script que lo haga automáticamente...

---

## 🚀 Paso 3: Ejecutar Script de Migración

Una vez que tengas los archivos JSON:

```bash
# Instalar dependencias si no lo has hecho
npm install

# Compilar TypeScript (si es necesario)
npm run build

# Ejecutar migración
npx tsx scripts/migrate-old-data.ts
```

El script hará:
1. ✅ Leer `customers.json` y `bookings-activas.json`
2. ✅ Transformar datos al formato de Supabase
3. ✅ Insertar clientes en lotes
4. ✅ Insertar reservas activas
5. ✅ Mostrar resumen de migración

---

## 📋 Paso 4: Actualizar Estadísticas

Después de la migración, ejecuta esta consulta en el SQL Editor de Supabase:

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

## ✅ Paso 5: Validación

Verifica que todo se migró correctamente:

### En Supabase Dashboard:

1. **Tabla `customers`**: Debe tener ~1015 registros
2. **Tabla `bookings`**: Debe tener las reservas activas/futuras
3. **Verificar fechas**: Las reservas deben tener fechas de devolución futuras

### En tu aplicación:

1. Ir a `/admin/reservas`
2. Ver que aparecen las reservas migradas
3. Verificar datos de clientes
4. Comprobar que los estados son correctos:
   - `confirmed` - Reservas futuras
   - `in_progress` - Reservas en curso

---

## ⚠️ Problemas Comunes

### Error: "Faltan credenciales de Supabase"
**Solución**: Asegúrate de que `.env.local` tiene:
```
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### Error: "No hay ubicaciones configuradas"
**Solución**: Crea al menos una ubicación en Supabase:
```sql
INSERT INTO locations (name, slug, is_pickup, is_dropoff)
VALUES ('Madrid - Sede Principal', 'madrid-principal', true, true);
```

### Error: "Vehículo no encontrado"
**Solución**: Crea vehículos en Supabase o el script usará el primer vehículo disponible por defecto.

### Los archivos JSON están vacíos
**Solución**: Verifica que la base de datos MySQL se restauró correctamente y que las consultas SQL se ejecutan sin errores.

### ⚠️ Reservas sin vincular a clientes
**Problema**: Algunas reservas quedan con `customer_id = NULL`

**Causa**: La base de datos antigua no tiene relación directa entre reservas y clientes. Solo usa email/nombre para vincular, y estos pueden no coincidir.

**Solución**:
1. El script mejorado intenta vincular por email, nombre y teléfono
2. Si aún hay reservas sin vincular, ejecuta:
   ```bash
   npx tsx scripts/fix-customer-links.ts
   ```
3. Ver documentación completa: [`PROBLEMA-VINCULACION-CLIENTES.md`](./PROBLEMA-VINCULACION-CLIENTES.md)

---

## 🎯 Datos que se Migran

### Clientes (TODOS)
- ✅ Nombre completo
- ✅ Email
- ✅ Teléfono
- ✅ DNI
- ✅ Dirección completa
- ✅ País
- ✅ Fecha de nacimiento
- ✅ Notas

### Reservas (Solo activas/futuras)
- ✅ Datos del cliente
- ✅ Vehículo reservado
- ✅ Fechas de recogida/devolución
- ✅ Precios y pagos
- ✅ Estado de la reserva
- ✅ Notas administrativas
- ✅ Cupones usados

---

## 📊 Estadísticas Esperadas

Basado en el análisis de la BD antigua:

| Concepto | Cantidad Estimada |
|----------|-------------------|
| Clientes totales | ~1,015 |
| Reservas activas | 20-50 (depende de la fecha) |
| Reservas futuras | 15-40 |
| Reservas en curso | 5-10 |

---

## 🔒 Seguridad

- ✅ El script usa la `SERVICE_ROLE_KEY` para bypasear RLS
- ✅ Los datos de clientes se mantienen privados
- ✅ Las contraseñas de la antigua web NO se migran (seguridad)
- ✅ Se generan nuevos `booking_number` únicos

---

## 🆘 Soporte

Si encuentras problemas durante la migración:

1. Revisa los logs del script
2. Verifica que los archivos JSON tienen datos
3. Comprueba las credenciales de Supabase
4. Asegúrate de que tienes vehículos y ubicaciones creadas

---

## ✨ Después de la Migración

1. ✅ Elimina la base de datos temporal de MySQL
2. ✅ Guarda backup de los archivos JSON
3. ✅ Prueba hacer una nueva reserva en la app
4. ✅ Verifica que los emails se envían correctamente
5. ✅ Documenta cualquier dato que faltó migrar

---

## 📝 Notas Importantes

- Las reservas pasadas NO se migran (solo activas/futuras)
- Los vehículos deben crearse manualmente en la nueva app
- Las ubicaciones deben configurarse antes de migrar
- Los pagos anteriores se reflejan en `deposit_amount`
- Los IDs originales se guardan en `admin_notes` para referencia
