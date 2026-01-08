# Configuración de Redsys para Furgocasa

## 📋 Variables de Entorno Necesarias

Añade estas variables a tu archivo `.env.local`:

```env
# Redsys TPV Virtual
REDSYS_MERCHANT_CODE=XXXXXXXXX        # Número de comercio (FUC) - Proporcionado por tu banco
REDSYS_TERMINAL=001                    # Número de terminal - Normalmente "001"
REDSYS_SECRET_KEY=XXXXXXXXXXXXXXXX     # Clave secreta (Base64) - Proporcionada por tu banco

# URL pública de tu aplicación
NEXT_PUBLIC_URL=https://furgocasa.com  # Sin barra final

# Cifrado de tokens (generar con: openssl rand -hex 32)
ENCRYPTION_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 🧪 Entorno de Pruebas

Para probar antes de ir a producción, usa las siguientes tarjetas de prueba:

### Tarjeta de Pago Exitoso
- **Número**: 4548812049400004
- **Caducidad**: Cualquier fecha futura (ej: 12/28)
- **CVV**: 123
- **CIP/PIN**: 123456 (si lo pide)

### Tarjeta Denegada (sin fondos)
- **Número**: 4548810000000003
- **Resto igual**

### Tarjeta Caducada
- **Número**: 4548810000000011
- **Resto igual**

## 🔧 URLs de Redsys

El sistema automáticamente usa las URLs correctas según el entorno:

| Entorno | URL de Pago |
|---------|-------------|
| **Pruebas** | https://sis-t.redsys.es:25443/sis/realizarPago |
| **Producción** | https://sis.redsys.es/sis/realizarPago |

## 📁 Archivos del Sistema de Pagos

```
src/
├── lib/redsys/
│   ├── index.ts          # Exportaciones
│   ├── crypto.ts         # Cifrado 3DES y firmas HMAC-SHA256
│   ├── params.ts         # Construcción de parámetros
│   └── types.ts          # Tipos y códigos de respuesta
│
├── app/api/redsys/
│   ├── initiate/route.ts     # POST - Iniciar pago
│   └── notification/route.ts # POST - Recibir notificación de Redsys
│
└── app/pago/
    ├── exito/page.tsx    # Página de pago exitoso
    └── error/page.tsx    # Página de pago fallido
```

## 🔄 Flujo de Pago

```
1. Usuario hace clic en "Pagar"
        ↓
2. Frontend → POST /api/redsys/initiate
        ↓
3. Backend genera parámetros y firma
   - Se crea registro en tabla "payments" (status: pending)
        ↓
4. Frontend redirige a Redsys con formulario
        ↓
5. Usuario paga en pasarela del banco
        ↓
6. Redsys → POST /api/redsys/notification (CRÍTICO)
   - Se valida firma
   - Se actualiza "payments" (status: authorized/error)
   - Se actualiza "bookings" (payment_status, status)
        ↓
7. Usuario es redirigido a /pago/exito o /pago/error
```

## 💳 Política de Pago 50%-50%

El sistema implementa la política de Furgocasa:

1. **Primer pago (50%)**: Al realizar la reserva
2. **Segundo pago (50%)**: Máximo 15 días antes de la recogida

### Cálculo Automático

```typescript
// Si no se ha pagado nada
firstPayment = Math.ceil(total * 0.5);  // 50% redondeado arriba
secondPayment = total - firstPayment;   // Resto

// Si se modificó la reserva (añadió extras, días)
// El segundo pago es el total pendiente REAL
secondPayment = total - amount_paid;
```

## 🗄️ Tabla de Pagos (Supabase)

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id),
  order_number VARCHAR(12) UNIQUE NOT NULL,  -- Número Redsys
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',       -- pending, authorized, error, refunded
  payment_type VARCHAR(20),                   -- deposit, full, preauth
  response_code VARCHAR(4),                   -- Código respuesta Redsys
  authorization_code VARCHAR(50),
  card_country VARCHAR(3),
  card_type VARCHAR(10),
  transaction_date VARCHAR(10),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## ✅ Checklist de Producción

Antes de ir a producción, verifica:

- [ ] Variables de entorno configuradas con datos REALES del banco
- [ ] `NEXT_PUBLIC_URL` apunta al dominio de producción
- [ ] La URL de notificación es accesible públicamente
- [ ] Has probado pagos en entorno de pruebas
- [ ] Has verificado que las notificaciones llegan correctamente
- [ ] El endpoint de notificación NO tiene autenticación
- [ ] Los emails de confirmación están configurados

## 🔒 Seguridad

### Validación de Firma
Cada notificación de Redsys se valida con HMAC-SHA256:

```typescript
const isValid = validateSignature(
  Ds_MerchantParameters,
  Ds_Signature,
  process.env.REDSYS_SECRET_KEY
);

if (!isValid) {
  // NUNCA procesar pagos con firma inválida
  return { error: "Invalid signature" };
}
```

### Cifrado de Tokens (Pagos Recurrentes)
Si implementas pagos recurrentes, los tokens se cifran con AES-256:

```typescript
// Generar ENCRYPTION_KEY:
// openssl rand -hex 32
```

## 🐛 Troubleshooting

### "Número de pedido repetido" (SIS0051)
- El `orderNumber` ya fue usado
- Se genera automáticamente con timestamp

### "Firma inválida"
- Verificar `REDSYS_SECRET_KEY`
- No debe tener espacios al inicio/final
- Debe estar en Base64

### Notificación no llega
1. Verificar que la URL es accesible desde internet
2. El endpoint debe responder 200 OK siempre
3. No debe tener autenticación
4. Para pruebas locales, usar ngrok:
   ```bash
   ngrok http 3000
   # Configurar URL en .env
   ```

### Pago queda en "pending"
- La notificación no llegó o falló
- Revisar logs del servidor
- Revisar panel de Redsys (backoffice)

## 📚 Recursos

- [Documentación oficial Redsys](https://pagosonline.redsys.es/desarrolladores.html)
- [Códigos de respuesta](https://pagosonline.redsys.es/rm-codigos-de-respuesta.html)
- [Generador de firma online (testing)](https://pagosonline.redsys.es/firma-online-redsys.html)

## 📞 Soporte Redsys

- **Email**: soporte.comercios@redsys.es
- **Teléfono**: 902 33 25 45

