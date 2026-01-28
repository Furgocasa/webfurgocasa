# Migración: Agregar 'completed' al constraint de payments

## 📋 Descripción

Esta migración agrega los valores `'completed'` y `'failed'` al constraint de la tabla `payments`, permitiendo que el código use términos más semánticos y apropiados para el negocio.

## ⚠️ Importante

**Esta migración debe ejecutarse ANTES de desplegar el código actualizado**, de lo contrario los pagos fallarán con error de constraint.

## 🚀 Cómo ejecutar

### Opción 1: Supabase Dashboard (RECOMENDADO)

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Click en **SQL Editor** en el menú lateral
3. Click en **+ New Query**
4. Copia y pega el contenido de `add-completed-status-to-payments.sql`
5. Click en **Run** (▶️)
6. Verifica que aparezca "Success. No rows returned"

### Opción 2: Supabase CLI (local)

```bash
# Aplicar la migración
supabase migration up
```

### Opción 3: psql directo (si tienes acceso)

```bash
psql -h db.xxx.supabase.co -U postgres -d postgres -f supabase/migrations/add-completed-status-to-payments.sql
```

## ✅ Verificación

Después de ejecutar la migración, verifica que funcionó:

```sql
-- Debe mostrar la lista de status válidos
SELECT 
  conname, 
  consrc 
FROM pg_constraint 
WHERE conname = 'payments_status_check';
```

Deberías ver: `'pending', 'completed', 'authorized', 'failed', 'error', 'cancelled', 'refunded'`

## 🔄 Rollback (si es necesario)

Si necesitas revertir la migración:

```sql
ALTER TABLE payments DROP CONSTRAINT payments_status_check;
ALTER TABLE payments ADD CONSTRAINT payments_status_check 
CHECK (status IN ('pending', 'authorized', 'cancelled', 'error', 'refunded'));
```

## 📝 Notas

- La migración mantiene `'authorized'` por compatibilidad con pagos antiguos
- El código nuevo usa `'completed'` (más claro para el negocio)
- No se modifican datos existentes, solo se amplía el constraint
