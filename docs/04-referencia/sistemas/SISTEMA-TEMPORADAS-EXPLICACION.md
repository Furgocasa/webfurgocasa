# Sistema de Temporadas Furgocasa

## 🎯 Concepto Principal

**Por defecto, TODO EL AÑO es TEMPORADA BAJA**. Solo se registran en la base de datos los períodos que tienen un sobrecoste adicional (Temporada Media o Alta).

## 📊 Estructura de Precios Base

### Temporada Baja (Por defecto - no se registra en BD)
- **< 1 semana**: 95€/día
- **1 semana** (7-13 días): 85€/día
- **2 semanas** (14-20 días): 75€/día
- **3+ semanas** (21+ días): 65€/día

## 💰 Sobrecostes por Temporada

### Temporada Media (+30€)
Se aplica en:
- Fin diciembre 2025 (19/12 - 31/12)
- Comienzo enero 2026 (01/01 - 11/01)
- San José 2026 (13/03 - 22/03)
- Mediados junio 2026 (08/06 - 21/06)
- Septiembre-octubre 2026 (21/09 - 18/10)

**Precios:**
- < 1 semana: 125€/día (95+30)
- 1 semana: 115€/día (85+30)
- 2 semanas: 105€/día (75+30)
- 3+ semanas: 95€/día (65+30)

### Temporada Media - Semana Santa (+40€)
- Semana Santa 2026 (29/03 - 12/04)
- **Mínimo 7 días de alquiler**

**Precios:**
- < 1 semana: 135€/día (95+40)
- 1 semana: 125€/día (85+40)
- 2 semanas: 115€/día (75+40)
- 3+ semanas: 105€/día (65+40)

### Temporada Alta - Verano (+60€)
- Verano 2026 (22/06 - 20/09)
- **Mínimo 7 días de alquiler**

**Precios:**
- < 1 semana: 155€/día (95+60)
- 1 semana: 145€/día (85+60)
- 2 semanas: 135€/día (75+60)
- 3+ semanas: 125€/día (65+60)

## 🔍 Lógica de Cálculo

> ⚠️ **IMPORTANTE**: Las temporadas se calculan **DÍA A DÍA**, NO por el período completo del alquiler.
> 
> Si un alquiler cruza varias temporadas, cada día se cobra según la temporada que le corresponde individualmente.

### Algoritmo de Cálculo

```javascript
function calcularPrecio(fechaInicio, fechaFin) {
  const dias = calcularDias(fechaInicio, fechaFin);
  let precioTotal = 0;
  
  // Determinar el precio por día según la duración TOTAL del alquiler
  const obtenerPrecioDia = (temporada) => {
    if (temporada) {
      // Hay un período registrado (MEDIA o ALTA)
      if (dias < 7) return temporada.price_less_than_week;
      else if (dias < 14) return temporada.price_one_week;
      else if (dias < 21) return temporada.price_two_weeks;
      else return temporada.price_three_weeks;
    } else {
      // No hay período registrado = TEMPORADA BAJA
      if (dias < 7) return 95;
      else if (dias < 14) return 85;
      else if (dias < 21) return 75;
      else return 65;
    }
  };
  
  // CALCULAR DÍA POR DÍA
  for (let fecha = fechaInicio; fecha <= fechaFin; fecha.addDays(1)) {
    // Para cada día individual, buscar si está en algún período
    const temporadaDelDia = buscarTemporada(fecha);
    const precioDia = obtenerPrecioDia(temporadaDelDia);
    precioTotal += precioDia;
  }
  
  return precioTotal;
}
```

### Ejemplo Detallado: Alquiler que cruza temporadas

**Alquiler: 18-28 junio 2026 (11 días)**

```
18 jun ─┐
19 jun  │
20 jun  ├─ MEDIA "Mediados Junio" → 4 días × 115€/día = 460€
21 jun ─┘

22 jun ─┐
23 jun  │
24 jun  │
25 jun  ├─ ALTA "Verano" → 7 días × 145€/día = 1,015€
26 jun  │
27 jun  │
28 jun ─┘

TOTAL = 460€ + 1,015€ = 1,475€
```

> 💡 **Nota**: Se usa el precio para "7-13 días" (115€ MEDIA, 145€ ALTA) porque la duración **TOTAL** del alquiler es 11 días, aunque los días se calculan individualmente.

## 📅 Calendario 2025-2026

| Período | Fechas | Tipo | Sobrecoste | Mín. Días |
|---------|--------|------|------------|-----------|
| Fin Dic 2025 | 19/12 - 31/12 | MEDIA | +30€ | 2 |
| Comienzo Ene 2026 | 01/01 - 11/01 | MEDIA | +30€ | 2 |
| San José 2026 | 13/03 - 22/03 | MEDIA | +30€ | 2 |
| Semana Santa 2026 | 29/03 - 12/04 | MEDIA | +40€ | 7 |
| Mediados Jun 2026 | 08/06 - 21/06 | MEDIA | +30€ | 2 |
| Verano 2026 | 22/06 - 20/09 | ALTA | +60€ | 7 |
| Sep-Oct 2026 | 21/09 - 18/10 | MEDIA | +30€ | 2 |

**Resto del año**: TEMPORADA BAJA (sin sobrecoste)

## 🛠️ Instalación

```bash
# En Supabase SQL Editor:
# 1. Ejecutar el script
supabase/configurar-temporadas-2025-2026.sql
```

## ✅ Verificación

Después de ejecutar el script, puedes verificar:

```sql
-- Ver todas las temporadas
SELECT 
    name,
    start_date,
    end_date,
    price_less_than_week AS "< 1sem",
    price_one_week AS "1sem",
    min_days
FROM seasons 
WHERE year IN (2025, 2026)
ORDER BY start_date;
```

## 🎨 Visualización en Frontend

El sistema de temporadas se muestra en:
- `/tarifas` - Calendarios con colores según temporada
- Buscador de vehículos - Cálculo automático de precios
- Página de reserva - Desglose de precios por día

### Colores
- 🔵 **Temporada Baja**: Sin color especial (blanco/gris)
- 🟠 **Temporada Media**: Naranja (#F59E0B)
- 🔴 **Temporada Alta**: Rojo (#EF4444)

## 📝 Ejemplos Prácticos

### Ejemplo 1: Alquiler en Temporada Baja
- **Fechas**: 5-12 mayo 2026 (8 días)
- **Temporada**: BAJA (no está en ningún período registrado)
- **Cálculo**: 8 días × 85€/día = **680€**
- **Todos los días** están en temporada BAJA

### Ejemplo 2: Alquiler en Temporada Media
- **Fechas**: 15-21 junio 2026 (7 días)
- **Temporada**: MEDIA "Mediados Junio" (+30€)
- **Cálculo**: 7 días × 115€/día = **805€**
- **Todos los días** están en temporada MEDIA

### Ejemplo 3: Alquiler en Temporada Alta
- **Fechas**: 1-15 julio 2026 (15 días)
- **Temporada**: ALTA "Verano" (+60€)
- **Cálculo**: 15 días × 135€/día = **2,025€**
- **Todos los días** están en temporada ALTA

### Ejemplo 4: Alquiler largo en Temporada Baja
- **Fechas**: 1-30 noviembre 2026 (30 días)
- **Temporada**: BAJA (no está en ningún período registrado)
- **Cálculo**: 30 días × 65€/día = **1,950€**
- **Todos los días** están en temporada BAJA

### Ejemplo 5: 🔥 Alquiler que cruza DOS temporadas
- **Fechas**: 18-28 junio 2026 (11 días)
- **Cálculo día a día**:
  - **18-21 jun** (4 días): MEDIA "Mediados Junio" → 4 × 115€ = 460€
  - **22-28 jun** (7 días): ALTA "Verano" → 7 × 145€ = 1,015€
- **TOTAL**: 460€ + 1,015€ = **1,475€**

### Ejemplo 6: 🔥 Alquiler largo que cruza TRES períodos
- **Fechas**: 10 junio - 10 julio 2026 (31 días)
- **Cálculo día a día**:
  - **10-21 jun** (12 días): MEDIA "Mediados Junio" → 12 × 95€ = 1,140€
  - **22 jun-10 jul** (19 días): ALTA "Verano" → 19 × 125€ = 2,375€
- **TOTAL**: 1,140€ + 2,375€ = **3,515€**
- 💡 Se usa precio "21+ días" (95€ MEDIA, 125€ ALTA) porque son 31 días totales

### Ejemplo 7: 🔥 Alquiler que cruza de BAJA a MEDIA
- **Fechas**: 29 mayo - 10 junio 2026 (13 días)
- **Cálculo día a día**:
  - **29 may-7 jun** (10 días): BAJA → 10 × 85€ = 850€
  - **8-10 jun** (3 días): MEDIA "Mediados Junio" → 3 × 115€ = 345€
- **TOTAL**: 850€ + 345€ = **1,195€**
- 💡 Se usa precio "7-13 días" (85€ BAJA, 115€ MEDIA) porque son 13 días totales

## 🔄 Mantenimiento

Para añadir nuevas temporadas en el futuro:

```sql
INSERT INTO seasons (
    id,
    name,
    slug,
    start_date,
    end_date,
    price_less_than_week,
    price_one_week,
    price_two_weeks,
    price_three_weeks,
    year,
    min_days,
    is_active
) VALUES (
    uuid_generate_v4(),
    'Temporada Media - Puente de Diciembre 2027',
    '2027-puente-diciembre',
    '2027-12-06',
    '2027-12-12',
    125.00,  -- 95 + 30
    115.00,  -- 85 + 30
    105.00,  -- 75 + 30
    95.00,   -- 65 + 30
    2027,
    2,
    true
);
```

## ⚠️ Importante

1. **NO registrar períodos de temporada BAJA** - Son el valor por defecto
2. **Verificar que los períodos no se solapan** - Cada día debe pertenecer solo a una temporada
3. **Actualizar el año siguiente** - Ejecutar script nuevo cada año
4. **min_days** - Respetar los mínimos de alquiler según temporada

