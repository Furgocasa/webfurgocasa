# ⚠️ REDSYS CRYPTO - ARCHIVO CRÍTICO - NO MODIFICAR ⚠️

## Estado: ✅ FUNCIONANDO CORRECTAMENTE

**Última verificación exitosa:** 24/01/2026 11:27

### Pago de prueba exitoso:
- **Pedido:** 260124102740
- **Importe:** 142,50€
- **Comercio:** 347036410
- **Terminal:** 001
- **Código respuesta:** 0000 (Autorizado)

---

## 🔒 Archivo protegido: `src/lib/redsys/crypto.ts`

### Commit de referencia que FUNCIONA:
```
Commit: 3cf6b28
Fecha: 24/01/2026 10:44
Mensaje: fix(redsys): usar zero padding en 3DES segun documentacion oficial Redsys
```

---

## ⛔ PROHIBIDO MODIFICAR

### 1. Función `encrypt3DES`
```typescript
// ✅ CORRECTO - Así debe estar:
cipher.setAutoPadding(false);  // DEBE ser false
return encrypted;              // DEBE devolver Buffer, NO string
```

### 2. Padding
```typescript
// ✅ CORRECTO - Zero padding manual:
const paddingLength = 8 - (dataBuffer.length % 8);
const paddedData = Buffer.concat([
  dataBuffer,
  Buffer.alloc(paddingLength === 8 ? 0 : paddingLength, 0)
]);
```

### 3. Función `createSignature`
```typescript
// ✅ CORRECTO - Usar Buffer directamente:
const derivedKey = encrypt3DES(orderNumber, secretKey);  // Devuelve Buffer
const hmac = crypto.createHmac("sha256", derivedKey);    // Usar Buffer directo
```

---

## ❌ CAMBIOS QUE ROMPEN LA FIRMA (NO HACER)

| Cambio | Resultado |
|--------|-----------|
| `setAutoPadding(true)` | Firma inválida SIS0042 |
| `return encrypted.toString("base64")` | Firma inválida |
| PKCS#7 padding | Firma inválida |
| `Buffer.from(derivedKey, "base64")` | Firma inválida |

---

## 📋 Configuración técnica que FUNCIONA

| Parámetro | Valor |
|-----------|-------|
| Algoritmo | `des-ede3-cbc` |
| IV | 8 bytes de ceros |
| Padding | Zero padding manual |
| setAutoPadding | `false` |
| Retorno encrypt3DES | `Buffer` |
| HMAC | SHA-256 con Buffer directo |

---

## 🔧 Si algo deja de funcionar

1. **NO modifiques crypto.ts**
2. Restaura al commit `3cf6b28`:
   ```bash
   git checkout 3cf6b28 -- src/lib/redsys/crypto.ts
   git add src/lib/redsys/crypto.ts
   git commit -m "fix(redsys): restaurar crypto.ts funcional"
   git push
   ```

---

## 📞 Soporte Redsys

- Email: soportevirtual@redsys.es
- Teléfono: 91 728 23 23
- Portal: https://canales.redsys.es/portal

---

## Historial de cambios críticos (24/01/2026)

| Hora | Commit | Cambio | Resultado |
|------|--------|--------|-----------|
| 10:35 | 2610206e | setAutoPadding(true) + base64 | ❌ Falló |
| 10:44 | 3cf6b28 | Zero padding + Buffer | ✅ **FUNCIONA** |
| 10:45 | 4946733 | PKCS#7 | ❌ Falló |

**Conclusión:** Solo el commit `3cf6b28` con zero padding funciona.
