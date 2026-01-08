# Sistema de Gestión de Temporadas

## 📅 Descripción

Este sistema permite al administrador configurar y gestionar los periodos de temporadas (Baja, Media, Alta) directamente desde el panel de administración. Los calendarios se muestran automáticamente en la página pública de tarifas.

## 🗄️ Base de Datos

### Tabla: `seasons`

La tabla `seasons` almacena los periodos de temporadas con la siguiente estructura:

```sql
CREATE TABLE public.seasons (
  id UUID PRIMARY KEY,
  year INTEGER NOT NULL,
  season_type VARCHAR(20) NOT NULL, -- 'baja', 'media', 'alta'
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  color VARCHAR(7) DEFAULT '#3B82F6',
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Migración Inicial

Para crear la tabla en Supabase, ejecuta la migración:

```bash
# La migración se encuentra en:
supabase/migrations/20250107_create_seasons_table.sql
```

Este script:
1. Crea la tabla `seasons`
2. Configura índices para optimizar consultas
3. Habilita Row Level Security (RLS)
4. Crea políticas de acceso (lectura pública, escritura solo admin)
5. Inserta datos de ejemplo para 2025 y 2026

## 👨‍💼 Panel de Administración

### Acceso

Navega a: **`/administrator/temporadas`**

### Funcionalidades

#### 1. **Selector de Año**
- Permite cambiar entre diferentes años (2024-2028)
- Los cambios se aplican inmediatamente

#### 2. **Añadir Nueva Temporada**
Completa el formulario con:
- **Tipo de Temporada**: Baja / Media / Alta
- **Fecha Inicio**: Primer día del periodo
- **Fecha Fin**: Último día del periodo

Los colores se asignan automáticamente:
- 🔵 **Baja**: Azul (#3B82F6)
- 🟠 **Media**: Naranja (#F59E0B)
- 🔴 **Alta**: Rojo (#EF4444)

#### 3. **Lista de Temporadas**
Muestra todas las temporadas configuradas con:
- Tipo y color
- Fechas de inicio y fin
- Duración en días
- Botón para eliminar

#### 4. **Validaciones**
- No se pueden crear periodos duplicados
- Las fechas deben ser válidas
- El sistema previene solapamientos (recomendado gestionarlo manualmente)

## 🌐 Visualización Pública

### Página de Tarifas

Los calendarios se muestran automáticamente en:
**`/tarifas`**

### Características

1. **Dos Calendarios**
   - Año en curso (2025)
   - Año siguiente (2026)

2. **Visualización Mensual**
   - Grid de 12 meses por año
   - Cada día coloreado según su temporada
   - Día actual marcado con borde naranja

3. **Leyenda de Colores**
   - Muestra los tres tipos de temporada
   - Con sus respectivos colores

4. **Multiidioma**
   - Español / English
   - Nombres de meses y temporadas traducidos

## 🔧 Componentes Técnicos

### 1. Página de Administración
```
src/app/administrator/temporadas/page.tsx
```
- Formulario para gestionar temporadas
- Conectado a Supabase
- CRUD completo

### 2. Componente de Calendario
```
src/components/seasons-calendar.tsx
```
- Renderiza calendarios visuales
- Lee datos desde Supabase
- Responsive y multiidioma

### 3. Integración en Tarifas
```
src/app/tarifas/page.tsx
```
- Importa y muestra los calendarios
- Configurado para 2025 y 2026

## 📝 Flujo de Trabajo Recomendado

### Configuración Inicial

1. **Ejecutar migración** de base de datos
2. **Acceder al panel** de administración
3. **Revisar datos** de ejemplo insertados
4. **Ajustar fechas** según necesidad real

### Mantenimiento Anual

1. **A finales de cada año**:
   - Acceder a `/administrator/temporadas`
   - Seleccionar el año siguiente
   - Configurar las nuevas temporadas

2. **Durante el año**:
   - Ajustar fechas si hay cambios
   - Verificar que no haya solapamientos
   - Eliminar periodos incorrectos

## 🎨 Personalización

### Cambiar Colores

Edita en `src/app/administrator/temporadas/page.tsx`:

```typescript
const seasonColors = {
  baja: '#3B82F6',    // Cambiar aquí
  media: '#F59E0B',   // Cambiar aquí
  alta: '#EF4444',    // Cambiar aquí
};
```

### Añadir Más Años

Actualiza el selector de años en el mismo archivo:

```typescript
{[2024, 2025, 2026, 2027, 2028, 2029].map(year => (
  <option key={year} value={year}>{year}</option>
))}
```

### Mostrar Más/Menos Calendarios

En `src/app/tarifas/page.tsx`:

```typescript
{/* Añadir calendario 2027 */}
<div>
  <h3>Calendario de Temporadas 2027</h3>
  <SeasonsCalendar year={2027} />
</div>
```

## 🔒 Seguridad

- **RLS Habilitado**: Solo usuarios autenticados pueden modificar
- **Lectura Pública**: Cualquiera puede ver los calendarios
- **Validación**: Frontend y backend validan datos

## 🐛 Solución de Problemas

### Los calendarios no se muestran

1. Verificar que la migración se ejecutó correctamente
2. Comprobar que hay datos en la tabla `seasons` para esos años
3. Revisar la consola del navegador por errores de Supabase

### No puedo añadir temporadas

1. Verificar que estás autenticado como administrador
2. Comprobar las políticas RLS en Supabase
3. Revisar que las fechas no están duplicadas

### Los colores no se muestran

1. Verificar que los valores en `seasonColors` son válidos
2. Comprobar que los datos en la BD tienen el campo `color` correcto

## 📊 Mejoras Futuras

- [ ] Validación de solapamiento de fechas
- [ ] Importar/Exportar configuraciones
- [ ] Vista previa del calendario antes de guardar
- [ ] Copiar configuración de un año a otro
- [ ] Historial de cambios
- [ ] Notificaciones al modificar temporadas activas

## 📞 Soporte

Si encuentras algún problema o necesitas ayuda:
1. Revisa este documento
2. Consulta los logs del navegador (F12)
3. Verifica la configuración de Supabase
4. Contacta al equipo de desarrollo






