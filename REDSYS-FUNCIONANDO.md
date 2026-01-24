# ✅ REDSYS - FUNCIONANDO CORRECTAMENTE

**Fecha de verificación:** 24/01/2026 13:00  
**Estado:** ✅ PRODUCCIÓN - FUNCIONANDO

---

## 📋 Resumen

El sistema de pagos con Redsys está **completamente operativo**. Se han realizado múltiples pagos exitosos en producción.

## 🔐 Configuración Actual (NO MODIFICAR)

### Credenciales
- **Código Comercio:** 347036410
- **Terminal:** 001
- **Entorno:** Producción (`sis.redsys.es`)

### Archivos Críticos - ⛔ NO TOCAR
1. `src/lib/redsys/crypto.ts` - Firma HMAC-SHA256
2. `src/lib/redsys/params.ts` - Parámetros del comercio
3. `src/app/api/redsys/initiate/route.ts` - Inicio de pago
4. `src/app/api/redsys/notification/route.ts` - Notificación servidor
5. `src/lib/utils.ts` - Función `generateOrderNumber()`

### Formato del Número de Pedido
```
YYMM + XXXX (4 random) + HHMM = 12 caracteres
Ejemplo: 260142781530
```

## ✅ Pagos Verificados en Producción

| Fecha | Pedido | Importe | Estado |
|-------|--------|---------|--------|
| 24/01/2026 12:11 | 260124111000 | 142,50€ | ✅ Autorizado |
| 24/01/2026 10:48 | 260124094541 | 142,50€ | ✅ Autorizado |

## ⚠️ Notas Importantes

### Bloqueo por Múltiples Intentos
Redsys puede bloquear temporalmente si detecta:
- Muchos intentos desde la misma IP
- Múltiples pagos fallidos seguidos
- Mismo importe repetido muchas veces

**Solución:** Esperar 15-30 minutos o probar desde otra IP.

### Errores 404 en Redsys (Cosméticos)
Los errores de logo/CSS/JS son de **configuración del comercio en el panel de Redsys**, no de nuestro código:
```
347036410-1-1logo.png 404
347036410-1-ni.js 404
347036410-1--ni.css 404
```
Estos errores NO afectan al procesamiento del pago.

## 🔧 Flujo de Pago

1. Usuario hace clic en "Pagar" → Frontend
2. Frontend llama a `/api/redsys/initiate` → Genera orderNumber y firma
3. Se crea registro en tabla `payments` con status `pending`
4. Se envía formulario a `sis.redsys.es/sis/realizarPago`
5. Usuario completa pago en Redsys
6. Redsys envía notificación a `/api/redsys/notification`
7. Se actualiza `payments` a `completed` y `bookings` a `confirmed`
8. Se envía email de confirmación

## 📧 Emails

Los emails se envían a través de `/api/bookings/send-email`:
- `first_payment` - Primer pago (reserva confirmada)
- `second_payment` - Segundo pago (pago completo)

---

**⛔ ADVERTENCIA: NO MODIFICAR NINGÚN ARCHIVO DE REDSYS SIN AUTORIZACIÓN EXPRESA**
