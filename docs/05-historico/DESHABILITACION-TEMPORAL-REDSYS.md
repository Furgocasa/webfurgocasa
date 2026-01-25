# 🔧 Deshabilitación Temporal de Redsys

## 📋 Resumen

Se ha deshabilitado temporalmente el método de pago **Redsys** en el procesador de reservas hasta que se resuelvan los problemas de configuración de callbacks con el proveedor.

**Estado actual:**
- ✅ **Stripe**: Método activo y funcionando
- ⏸️ **Redsys**: Visible pero deshabilitado con etiqueta "Próximamente"

## 🔄 Cambios Realizados

### Archivo Modificado: `src/app/reservar/[id]/pago/page.tsx`

#### 1. Cambio de método de pago por defecto (Línea 53)

**Antes:**
```typescript
const [paymentMethod, setPaymentMethod] = useState<'redsys' | 'stripe'>('redsys');
```

**Ahora:**
```typescript
const [paymentMethod, setPaymentMethod] = useState<'redsys' | 'stripe'>('stripe'); // Stripe por defecto, Redsys temporalmente deshabilitado
```

#### 2. Modificación del selector de método de pago (Líneas 408-470)

**Cambios aplicados:**
- El botón de Redsys ahora tiene `disabled={true}` y no es clickable
- Aplicados estilos de deshabilitado: `bg-gray-50 opacity-60 cursor-not-allowed`
- Añadida etiqueta visual azul con texto "Próximamente" en la esquina superior derecha
- El logo de Redsys muestra opacidad reducida (50%)
- Stripe se muestra pre-seleccionado y es el único método disponible

**Aspecto visual:**
- Redsys aparece griseado con badge "Próximamente"
- Stripe aparece seleccionado con borde naranja y fondo claro

## 🔙 Cómo Revertir los Cambios

Cuando Redsis configure correctamente los callbacks, sigue estos pasos:

### Paso 1: Restaurar el método de pago por defecto

En `src/app/reservar/[id]/pago/page.tsx` línea 53, cambia:

```typescript
const [paymentMethod, setPaymentMethod] = useState<'redsys' | 'stripe'>('stripe'); // Stripe por defecto, Redsys temporalmente deshabilitado
```

Por:

```typescript
const [paymentMethod, setPaymentMethod] = useState<'redsys' | 'stripe'>('redsys');
```

### Paso 2: Restaurar el selector de método de pago

Reemplaza toda la sección del selector (líneas 408-470 aproximadamente) con el código original:

```tsx
{/* Selector de método de pago */}
<div className="mb-6">
  <label className="block text-sm font-medium text-gray-700 mb-3">
    {t("Selecciona el método de pago")}
  </label>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Redsys */}
    <button
      onClick={() => setPaymentMethod('redsys')}
      className={`p-4 border-2 rounded-lg transition-all ${
        paymentMethod === 'redsys'
          ? 'border-furgocasa-orange bg-orange-50'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
          paymentMethod === 'redsys' ? 'border-furgocasa-orange' : 'border-gray-300'
        }`}>
          {paymentMethod === 'redsys' && (
            <div className="w-3 h-3 rounded-full bg-furgocasa-orange"></div>
          )}
        </div>
        <div className="text-left flex-1">
          <p className="font-semibold text-gray-900">Redsys</p>
          <p className="text-xs text-gray-500">Pasarela bancaria española</p>
        </div>
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/c/ca/Redsys.jpg" 
          alt="Redsys" 
          className="h-5 object-contain"
        />
      </div>
    </button>

    {/* Stripe */}
    <button
      onClick={() => setPaymentMethod('stripe')}
      className={`p-4 border-2 rounded-lg transition-all ${
        paymentMethod === 'stripe'
          ? 'border-furgocasa-orange bg-orange-50'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
          paymentMethod === 'stripe' ? 'border-furgocasa-orange' : 'border-gray-300'
        }`}>
          {paymentMethod === 'stripe' && (
            <div className="w-3 h-3 rounded-full bg-furgocasa-orange"></div>
          )}
        </div>
        <div className="text-left flex-1">
          <p className="font-semibold text-gray-900">Stripe</p>
          <p className="text-xs text-gray-500">Pago internacional seguro</p>
        </div>
        <svg className="h-6" viewBox="0 0 60 25" xmlns="http://www.w3.org/2000/svg">
          <path fill="#635bff" d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 0 1 3.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 8.95c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.88zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 3.07-1.41 3.62-1.22v3.79c-.52-.17-2.29-.43-3.32.86zm-8.55 4.72c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 0 1-4.27-4.24l.01-13.17 4.02-.86v3.54h3.14V9.1h-3.13v5.85zm-4.91.7c0 2.97-2.31 4.66-5.73 4.66a11.2 11.2 0 0 1-4.46-.93v-3.93c1.38.75 3.1 1.31 4.46 1.31.92 0 1.53-.24 1.53-1C6.26 13.77 0 14.51 0 9.95 0 7.04 2.28 5.3 5.62 5.3c1.36 0 2.72.2 4.09.75v3.88a9.23 9.23 0 0 0-4.1-1.06c-.86 0-1.44.25-1.44.93 0 1.85 6.29.97 6.29 5.88z"/>
        </svg>
      </div>
    </button>
  </div>
</div>
```

## ✅ Verificación

Después de revertir los cambios:

1. **Verifica que Redsys funciona correctamente:**
   - Haz una reserva de prueba
   - Selecciona Redsys como método de pago
   - Completa el pago en el entorno de pruebas
   - Verifica que la notificación se reciba correctamente en `/api/redsys/notification`
   - Confirma que el estado de la reserva se actualiza

2. **Comprueba que no hay errores:**
   ```bash
   npm run dev
   ```
   - Navega a la página de pago
   - Verifica que no hay errores en la consola
   - Prueba ambos métodos de pago

## 📞 Contacto con Redsis

Cuando contactes con Redsis para que configuren los callbacks, proporciona:

- **URL de notificación:** `https://tudominio.com/api/redsys/notification`
- **Método:** POST
- **URLs de redirección:**
  - Éxito: `https://tudominio.com/pago/exito?bookingId={Ds_Order}`
  - Error: `https://tudominio.com/pago/error?bookingId={Ds_Order}`

## 📝 Notas Adicionales

- **El código de Redsys NO ha sido eliminado**, solo deshabilitado visualmente
- **Todas las rutas API de Redsys siguen funcionando** (`/api/redsys/initiate` y `/api/redsys/notification`)
- **Las traducciones** ya incluyen "Próximamente" / "Coming soon"
- **Stripe sigue siendo completamente funcional** durante este periodo

## 🎯 Estado de los Métodos de Pago

| Método | Estado | Comisión | Notas |
|--------|--------|----------|-------|
| Stripe | ✅ Activo | ~1.5% + 0.25€ | Funcionando perfectamente |
| Redsys | ⏸️ Deshabilitado temporalmente | 0.3% | Pendiente configuración callbacks |

---

**Fecha de deshabilitación:** 2026-01-20  
**Razón:** Problemas con callbacks de Redsis - pendiente de resolución con el proveedor  
**Impacto:** Los usuarios solo pueden pagar con Stripe temporalmente
