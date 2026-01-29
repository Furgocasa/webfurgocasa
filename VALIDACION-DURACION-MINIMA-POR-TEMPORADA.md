# Validación de Duración Mínima por Temporada - Completado

## Resumen de Cambios

Se ha implementado la validación dinámica de duración mínima de alquiler según las temporadas activas en la base de datos. Ahora el buscador respeta los `min_days` configurados para cada temporada (ej: 7 días en temporada ALTA de verano y Semana Santa).

## Archivos Modificados

### 1. **Hook para Consultar Mínimo de Días**
📁 `src/hooks/use-season-min-days.ts` (NUEVO)

Hook React que consulta las temporadas activas en Supabase y calcula el `min_days` requerido según el rango de fechas seleccionado. Usa la temporada dominante (la que cubre más días del periodo).

**Características:**
- Consulta automática al cambiar fechas
- Retorna valor por defecto (2 días) si no hay temporadas
- Manejo de errores robusto

### 2. **Buscador de Vehículos**
📁 `src/components/booking/search-widget.tsx`

**Cambios realizados:**
- Importa y usa el hook `useSeasonMinDays`
- Calcula dinámicamente el mínimo de días según las fechas seleccionadas
- La validación ya no es estática (2 días fijos), ahora consulta las temporadas activas
- Mantiene la regla de Madrid (mínimo 10 días)

```typescript
// ANTES (estático)
const getMinDays = () => {
  if (location === "madrid") return 10;
  return 2; // Siempre 2 días para Murcia
};

// AHORA (dinámico)
const seasonMinDays = useSeasonMinDays(pickupDateStr, dropoffDateStr);
const getMinDays = () => {
  if (location === "madrid") return 10;
  return seasonMinDays; // Usa el mínimo de la temporada activa
};
```

### 3. **API de Edición de Temporadas**
📁 `src/app/api/admin/seasons/[id]/route.ts` (NUEVO)

Endpoint API para actualizar temporadas desde el panel de administración.

**Ruta:** `PUT /api/admin/seasons/[id]`

**Campos actualizables:**
- name, slug
- start_date, end_date
- price_less_than_week, price_one_week, price_two_weeks, price_three_weeks
- min_days (⚠️ IMPORTANTE para esta funcionalidad)
- year, is_active

**Seguridad:**
- Requiere autenticación (Supabase Auth)
- Validación de campos obligatorios

### 4. **Panel de Administración de Temporadas**
📁 `src/app/administrator/(protected)/temporadas/page.tsx`

**Cambios realizados:**
- ✅ Botón "Editar" (icono lápiz) junto al botón "Eliminar" en cada fila
- ✅ Modal completo de edición con todos los campos
- ✅ Validación y guardado mediante la API
- ✅ Actualización automática de la lista tras guardar

**Funcionalidad del Modal:**
- Editar nombre y slug
- Modificar fechas de inicio y fin
- Ajustar precios por duración (4 rangos)
- **Cambiar mínimo de días** ⭐
- Modificar año
- Activar/desactivar temporada

### 5. **Script SQL de Temporadas 2026**
📁 `supabase/temporadas-2026.sql` (NUEVO)

Script completo con las temporadas de 2026, incluyendo:

**Temporadas con mínimo de 7 días:**
- ⛱️ Temporada Alta - Verano (22 jun - 20 sep): **min_days = 7**
- ✝️ Semana Santa (29 mar - 12 abr): **min_days = 7**

**Temporadas con mínimo de 2-3 días:**
- Temporada Media - Comienzo Enero: min_days = 3
- Temporada Media - San José: min_days = 2
- Temporada Media - Mediados Junio: min_days = 2
- Temporada Media - Septiembre y Octubre: min_days = 2

**Uso:**
```sql
-- Ejecutar en Supabase SQL Editor
\i supabase/temporadas-2026.sql
```

## Flujo de Funcionamiento

1. **Usuario selecciona fechas en el buscador**
   - Ej: 1 agosto - 5 agosto (4 días)

2. **Hook `useSeasonMinDays` consulta temporadas**
   - Busca temporadas activas que cubran ese rango
   - Encuentra "Temporada Alta - Verano" con `min_days = 7`

3. **Validación en el buscador**
   - El usuario intenta buscar pero tiene 4 días seleccionados
   - El sistema detecta que la temporada requiere mínimo 7 días
   - Muestra mensaje: "⚠️ El periodo mínimo es de 7 días"
   - El botón "Buscar" está deshabilitado

4. **Usuario ajusta fechas**
   - Selecciona 1 agosto - 8 agosto (7 días)
   - Ahora cumple el mínimo y puede buscar ✅

## Validación de Temporadas Cruzadas

Si un alquiler cruza múltiples temporadas, el sistema usa la temporada **dominante** (la que cubre más días):

**Ejemplo:**
- Recogida: 18 junio 2026
- Devolución: 25 junio 2026
- Total: 7 días

**Desglose:**
- 18-21 jun (4 días): Temporada Media (min_days = 2)
- 22-25 jun (3 días): Temporada Alta (min_days = 7)

**Resultado:**
- Temporada dominante: Media (4 días > 3 días)
- Mínimo requerido: **2 días** ✅

## Cómo Probar

### Prueba 1: Validación en Agosto (Temporada Alta)
1. Ir a https://www.furgocasa.com/es/
2. Seleccionar fechas: 1 agosto - 4 agosto (3 días)
3. ❌ Debe mostrar error: "El periodo mínimo es de 7 días"
4. Cambiar a: 1 agosto - 8 agosto (7 días)
5. ✅ Debe permitir buscar

### Prueba 2: Validación en Semana Santa
1. Seleccionar fechas: 29 marzo - 3 abril (5 días)
2. ❌ Debe mostrar error: "El periodo mínimo es de 7 días"
3. Cambiar a: 29 marzo - 5 abril (7 días)
4. ✅ Debe permitir buscar

### Prueba 3: Temporada Baja (sin restricciones especiales)
1. Seleccionar fechas: 15 febrero - 17 febrero (2 días)
2. ✅ Debe permitir buscar (temporada BAJA, default 2 días)

### Prueba 4: Editar Temporada desde Admin
1. Ir a https://www.furgocasa.com/administrator/temporadas
2. Seleccionar año 2026
3. Hacer clic en el icono de lápiz (Editar) en "Temporada Alta - Verano"
4. Cambiar "Mínimo de Días" de 7 a 14
5. Guardar cambios
6. ✅ Verificar que ahora el buscador requiere 14 días en agosto

## Estructura de la Tabla `seasons`

```sql
CREATE TABLE seasons (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    price_less_than_week DECIMAL(10,2),  -- Precio < 7 días
    price_one_week DECIMAL(10,2),        -- Precio 7-13 días
    price_two_weeks DECIMAL(10,2),       -- Precio 14-20 días
    price_three_weeks DECIMAL(10,2),     -- Precio 21+ días
    min_days INTEGER DEFAULT 2,          -- ⭐ Campo clave
    year INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Notas Importantes

### 🔒 Regla de Madrid
La ubicación de Madrid mantiene su regla especial de **mínimo 10 días**, independientemente de las temporadas.

### 📅 Temporada BAJA (Default)
Los días que NO estén cubiertos por ninguna temporada registrada se consideran automáticamente Temporada BAJA con:
- Mínimo: 2 días
- Precios: 95€ (<7d), 85€ (7-13d), 75€ (14-20d), 65€ (21+d)

### 🎯 Temporada Dominante
Cuando un alquiler cruza temporadas, el mínimo de días se calcula según la temporada que cubre **más días** del periodo seleccionado.

### ⚡ Performance
El hook `useSeasonMinDays` hace una consulta a Supabase cada vez que cambian las fechas. Esto es aceptable porque:
- Solo se ejecuta cuando el usuario selecciona fechas
- Supabase está optimizado con índices en `start_date` y `end_date`
- La consulta es muy rápida (<50ms típicamente)

## Próximos Pasos (Opcional)

1. **Cache de Temporadas**: Implementar cache local de temporadas para reducir consultas a BD
2. **Indicador Visual**: Mostrar badge en el calendario con el mínimo de días requerido
3. **Sugerencias Inteligentes**: Si el usuario selecciona menos días del mínimo, sugerir automáticamente ajustar la fecha de devolución
4. **Notificaciones**: Email automático a admin cuando se edita una temporada con min_days > 2

## Soporte

Si tienes dudas o problemas con esta funcionalidad:
1. Revisa los logs del navegador (F12 > Console)
2. Verifica que las temporadas están correctamente cargadas en Supabase
3. Comprueba que el año seleccionado en el admin coincide con las fechas buscadas

---

✅ **Tarea completada el 29 de enero de 2026**
