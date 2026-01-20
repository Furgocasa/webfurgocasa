# Corrección: Campo customer_phone Obligatorio

**Última actualización**: 20 de Enero 2026

> ℹ️ **NOTA**: Este problema es independiente del fix crítico v1.0.4  
> Ver `CORRECCION-ERRORES-ADMIN.md` para el fix de autenticación del administrador

---

## Problema

Al editar una reserva y cambiar el vehículo, se produce el error:
```
"Record new has no field customer_phone"
```

### Causa
El campo `customer_phone` en la tabla `bookings` estaba definido como `NOT NULL` (obligatorio), pero:

1. **Los datos del cliente ahora son de solo lectura** en el formulario de edición de reserva
2. **Solo nombre y email son realmente necesarios** para auditoría y GDPR
3. **El teléfono no siempre está disponible** al momento de crear/editar una reserva

## Solución

### 1. Ejecutar Script SQL en Supabase

Debes ejecutar el script `fix-customer-phone-nullable.sql` en tu base de datos de Supabase:

```sql
-- Hacer que customer_phone sea nullable
ALTER TABLE bookings 
ALTER COLUMN customer_phone DROP NOT NULL;

-- Limpiar datos vacíos
UPDATE bookings 
SET customer_phone = NULL 
WHERE customer_phone = '' OR customer_phone = '-';
```

#### Pasos para ejecutar:
1. Ve a tu panel de Supabase: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a la sección **SQL Editor**
4. Copia y pega el contenido del archivo `fix-customer-phone-nullable.sql`
5. Haz clic en **Run** para ejecutar el script

### 2. Cambios Realizados en el Código

✅ Ya aplicados automáticamente:

- **`schema.sql`**: Campo `customer_phone` ahora es opcional (sin `NOT NULL`)
- **`optimize-customer-bookings.sql`**: Comentarios actualizados explicando que es opcional
- **Código de edición de reserva**: Ya no intenta guardar `customer_phone` al actualizar

## Campos Obligatorios vs Opcionales

### En la tabla `bookings` (snapshot):

**Obligatorios:**
- `customer_name` - Necesario para emails, contratos, identificación
- `customer_email` - Necesario para comunicación y auditoría

**Opcionales:**
- `customer_phone` - Solo si está disponible
- `customer_dni` - Información complementaria
- `customer_address` - Información complementaria
- `customer_city` - Información complementaria
- `customer_postal_code` - Información complementaria

### En la tabla `customers`:

**Obligatorios:**
- `email` - Identificador único del cliente

**Opcionales:**
- Todos los demás campos (incluyendo `name` y `phone`)

## Verificación

Después de ejecutar el script SQL, verifica que funciona:

1. Ve a editar una reserva
2. Cambia el vehículo
3. Guarda los cambios
4. No debería aparecer el error de `customer_phone`

## Notas Importantes

- Los datos del cliente **NO se editan desde la reserva**, sino desde la página de clientes
- El snapshot en `bookings` es solo para auditoría y no debe ser editado directamente
- Si necesitas actualizar datos del cliente, usa el botón "Editar cliente" en el formulario de reserva

---

## 📚 Documentación Relacionada

- **[CORRECCION-EDICION-RESERVAS-CLIENTES.md](./CORRECCION-EDICION-RESERVAS-CLIENTES.md)** - Sistema de normalización cliente-reserva
- **[MIGRACION-CLIENTES-NORMALIZADOS.md](./MIGRACION-CLIENTES-NORMALIZADOS.md)** - Migración de datos

---

**Fecha**: Enero 2026  
**Estado**: ✅ Corregido
