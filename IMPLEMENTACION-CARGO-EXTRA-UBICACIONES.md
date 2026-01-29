# Añadido campo "Cargo extra" a la gestión de ubicaciones

**Fecha:** 29 de enero de 2026

## Problema detectado

El campo `extra_fee` existe en la base de datos (tabla `locations`), pero no estaba visible ni editable en el panel de administración de ubicaciones.

## Solución implementada

Se ha modificado el archivo `src/app/administrator/(protected)/ubicaciones/page.tsx` para incluir el campo `extra_fee` en:

### 1. Estado del formulario
```typescript
const [formData, setFormData] = useState({
  // ... otros campos
  extra_fee: '',  // ✅ Añadido
  // ...
});
```

### 2. Guardado de datos
```typescript
const dataToSave = {
  // ... otros campos
  extra_fee: formData.extra_fee ? parseFloat(formData.extra_fee) : 0,  // ✅ Añadido
  // ...
};
```

### 3. Carga al editar
```typescript
const handleEdit = (location: Location) => {
  setFormData({
    // ... otros campos
    extra_fee: location.extra_fee?.toString() || '0',  // ✅ Añadido
    // ...
  });
};
```

### 4. Reset del formulario
```typescript
const resetForm = () => {
  setFormData({
    // ... otros campos
    extra_fee: '',  // ✅ Añadido
    // ...
  });
};
```

### 5. Campo visual en el formulario
Se añadió un nuevo campo después de latitud/longitud:

```tsx
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Cargo extra por ubicación (€)
  </label>
  <input
    type="number"
    step="0.01"
    min="0"
    value={formData.extra_fee}
    onChange={(e) => setFormData({ ...formData, extra_fee: e.target.value })}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
    placeholder="0.00"
  />
  <p className="text-xs text-gray-500 mt-1">
    Cargo adicional que se aplicará a las reservas que incluyan esta ubicación (recogida o entrega)
  </p>
</div>
```

### 6. Visualización en las tarjetas
Se muestra el cargo extra (si existe) en cada tarjeta de ubicación:

```tsx
{location.extra_fee && location.extra_fee > 0 && (
  <div className="flex items-center gap-2 text-sm font-medium text-furgocasa-orange">
    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-50">
      Cargo extra: {parseFloat(location.extra_fee.toString()).toFixed(2)} €
    </span>
  </div>
)}
```

## Resultado

✅ Ahora los administradores pueden:
- Ver el cargo extra actual de cada ubicación
- Editar el cargo extra desde el formulario
- El campo acepta decimales (ej: 15.50 €)
- El valor por defecto es 0.00 € (sin cargo)

## Verificación en base de datos

Estado actual en Supabase:
- Madrid: 0.00 € (sin cargo)
- Murcia: 0.00 € (sin cargo)

## Uso en reservas

Este campo se utiliza en el cálculo del precio total de las reservas:
- Campo `location_fee` en la tabla `bookings`
- Se suma automáticamente al precio base cuando una ubicación tiene cargo extra

## Archivos modificados

- `src/app/administrator/(protected)/ubicaciones/page.tsx`

## Script de verificación creado

- `scripts/check-locations-extra-fee.js` - Para verificar cargos extra en todas las ubicaciones
