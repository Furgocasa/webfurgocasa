# CORRECCIÓN COMPLETA DE META_TITLE - ELIMINACIÓN DE DUPLICADOS

**Fecha:** 22 de enero de 2026  
**Problema identificado:** Títulos duplicados con "- Furgocasa" al final

---

## 🎯 PROBLEMA

El título en el navegador mostraba duplicados como:
```
"Alquiler de autocaravanas camper en Cartagena - Furgocasa Campervans - Furgocasa"
```

Cuando debería mostrar:
```
"Alquiler de autocaravanas camper en Cartagena - Furgocasa"
```

---

## 🔍 CAUSA RAÍZ

1. **Template automático en `layout.tsx` (línea 40):**
   ```typescript
   title: {
     template: "%s - Furgocasa"
   }
   ```
   Este template añade AUTOMÁTICAMENTE " - Furgocasa" a todos los títulos.

2. **meta_title en base de datos:**
   Los registros en las tablas tenían " - Furgocasa" o "| Furgocasa" al final, causando la duplicación.

---

## ✅ SOLUCIÓN APLICADA

### 1. Script de auditoría y corrección automática

**Archivo:** `scripts/audit-fix-all-metatitles.js`

**Función:**
- Revisa TODAS las tablas con meta_title
- Detecta cualquier variación de "- Furgocasa" al final
- Elimina automáticamente la duplicación
- Genera reporte completo

### 2. Script SQL manual (alternativa)

**Archivo:** `supabase/fix-meta-titles-format.sql`

**Query:**
```sql
UPDATE location_targets
SET meta_title = 'Alquiler de autocaravanas camper en ' || name
WHERE meta_title IS NOT NULL;
```

---

## 📊 RESULTADOS

### Tablas auditadas y corregidas:

#### ✅ location_targets (ciudades de alquiler)
- **Total:** 36 registros
- **Corregidos:** 0 (ya estaban correctos)
- **Estado:** ✅ OK

#### ✅ sale_location_targets (ciudades de venta)
- **Total:** 22 registros
- **Corregidos:** 22
- **Ejemplos corregidos:**
  - ❌ "Venta de Autocaravanas en Madrid | Furgocasa"
  - ✅ "Venta de Autocaravanas en Madrid"
  
  - ❌ "Venta de Autocaravanas en Cartagena | Entrega en Murcia | Furgocasa"
  - ✅ "Venta de Autocaravanas en Cartagena | Entrega en Murcia"

#### ✅ vehicles (vehículos de alquiler)
- **Total:** 13 registros
- **Corregidos:** 0 (ya estaban correctos)
- **Estado:** ✅ OK

---

## 🎨 FORMATO CORRECTO DE TÍTULOS

### Regla de oro:
> **NUNCA incluir "- Furgocasa" en el meta_title de la base de datos**  
> El template del layout.tsx lo añade automáticamente.

### Ejemplos correctos:

| Tipo de página | meta_title (BD) | Título final (navegador) |
|----------------|-----------------|--------------------------|
| Ciudad alquiler | `Alquiler de autocaravanas camper en Cartagena` | `Alquiler de autocaravanas camper en Cartagena - Furgocasa` |
| Ciudad venta | `Venta de Autocaravanas en Madrid` | `Venta de Autocaravanas en Madrid - Furgocasa` |
| Vehículo | `Dreamer D43 - Camper 4 plazas` | `Dreamer D43 - Camper 4 plazas - Furgocasa` |
| Blog | `Mejores rutas en autocaravana` | `Mejores rutas en autocaravana - Furgocasa` |

---

## 📁 ARCHIVOS CREADOS/MODIFICADOS

### Scripts:
1. ✅ `scripts/audit-fix-all-metatitles.js` - Auditoría completa automática
2. ✅ `scripts/fix-meta-titles.js` - Corrección específica de location_targets
3. ✅ `supabase/fix-meta-titles-format.sql` - Query SQL manual

### Documentación:
4. ✅ `FIX-METATITLES-DUPLICADOS.md` - Este documento

---

## 🔧 CÓMO USAR LOS SCRIPTS

### Opción 1: Script Node.js (Recomendado)
```bash
node scripts/audit-fix-all-metatitles.js
```

**Ventajas:**
- ✅ Audita TODAS las tablas automáticamente
- ✅ Corrige solo lo necesario
- ✅ Genera reporte detallado
- ✅ Manejo de errores robusto

### Opción 2: SQL Manual
```bash
# Ejecutar en Supabase SQL Editor
supabase/fix-meta-titles-format.sql
```

---

## 🎯 RESULTADO FINAL

Después de ejecutar el script, **todos los títulos** ahora muestran correctamente:

```
"Alquiler de autocaravanas camper en Cartagena - Furgocasa"
```

**Sin duplicaciones** ✅  
**Sin texto extra** ✅  
**Formato consistente** ✅

---

## 📝 NOTAS IMPORTANTES

### Para desarrolladores futuros:

1. **NUNCA añadas " - Furgocasa" manualmente en:**
   - Campos `meta_title` de la base de datos
   - Funciones `generateMetadata()` en archivos `.tsx`
   - Scripts de población de datos

2. **El template del layout.tsx se encarga automáticamente:**
   ```typescript
   // src/app/layout.tsx línea 40
   title: {
     template: "%s - Furgocasa"  // ← Esto lo hace por ti
   }
   ```

3. **Si necesitas un título personalizado:**
   ```typescript
   // ✅ CORRECTO
   export const metadata = {
     title: "Alquiler de autocaravanas camper en Madrid"
   }
   
   // ❌ INCORRECTO
   export const metadata = {
     title: "Alquiler de autocaravanas camper en Madrid - Furgocasa"
   }
   ```

---

## ✅ VERIFICACIÓN

Para verificar que todo está correcto:

1. Ejecutar el script de auditoría:
   ```bash
   node scripts/audit-fix-all-metatitles.js
   ```

2. Debe mostrar:
   ```
   ✨ ¡Perfecto! Todos los títulos están correctos.
   ```

3. Verificar en navegador:
   - Abrir: https://www.furgocasa.com/alquiler-autocaravanas-campervans-cartagena
   - Inspeccionar `<title>` en el código fuente
   - Debe ser: "Alquiler de autocaravanas camper en Cartagena - Furgocasa"

---

## 🔄 MANTENIMIENTO FUTURO

Este script puede ejecutarse periódicamente para asegurar que no se introduzcan nuevos duplicados:

```bash
# Ejecutar cada vez que se agreguen nuevas ciudades o vehículos
node scripts/audit-fix-all-metatitles.js
```

---

**Documentado por:** Cursor AI  
**Revisado por:** Usuario  
**Estado:** ✅ Completado y funcionando
