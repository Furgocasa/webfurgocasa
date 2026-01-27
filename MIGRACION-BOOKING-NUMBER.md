# 📋 RESUMEN: Migración UUID → booking_number

## ✅ Archivos YA Actualizados

- ✅ `src/lib/bookings/get-by-number.ts` - Helper creado
- ✅ `src/app/es/reservar/[id]/page.tsx` - Español (detalle)
- ✅ `src/app/es/reservar/[id]/confirmacion/page.tsx` - Español (confirmación)
- ✅ `src/app/es/reservar/[id]/pago/page.tsx` - Español (pago)
- ✅ `src/app/en/book/[id]/page.tsx` - Inglés (detalle)
- ✅ `src/app/fr/reserver/[id]/page.tsx` - Francés (detalle)

## ⏳ Archivos PENDIENTES de Actualizar

### Francés
- ⏳ `src/app/fr/reserver/[id]/confirmation/page.tsx`
- ⏳ `src/app/fr/reserver/[id]/paiement/page.tsx`

### Alemán
- ⏳ `src/app/de/buchen/[id]/page.tsx`
- ⏳ `src/app/de/buchen/[id]/bestaetigung/page.tsx`
- ⏳ `src/app/de/buchen/[id]/zahlung/page.tsx`

### Inglés (restantes)
- ⏳ `src/app/en/book/[id]/confirmation/page.tsx`
- ⏳ `src/app/en/book/[id]/payment/page.tsx`

---

## 🔧 Cambios a Aplicar en Cada Archivo

### 1️⃣ Añadir Import

```typescript
// AL INICIO, después de los otros imports:
import { getBookingByNumber, isValidBookingNumber } from "@/lib/bookings/get-by-number";
```

### 2️⃣ Cambiar Variable

```typescript
// BUSCAR:
const bookingId = params.id as string;

// REEMPLAZAR POR:
const bookingNumber = params.id as string;
```

### 3️⃣ Actualizar useEffect

```typescript
// BUSCAR:
useEffect(() => {
  if (bookingId) {
    loadBooking();
  }
}, [bookingId]);

// REEMPLAZAR POR:
useEffect(() => {
  if (bookingNumber) {
    loadBooking();
  }
}, [bookingNumber]);
```

### 4️⃣ Reemplazar Función `loadBooking`

```typescript
// BUSCAR TODO ESTE BLOQUE:
const loadBooking = async () => {
  try {
    setLoading(true);
    
    const response = await fetch(`/api/bookings/${bookingId}`);
    const payload = await response.json();

    if (!response.ok) {
      setError(payload?.error || 'Error al cargar la reserva');
      return;
    }

    const data = payload?.booking;

    if (!data) {
      setError('Reserva no encontrada');
      return;
    }

    // Procesar la imagen principal del vehículo
    if (data.vehicle && data.vehicle.images) {
      const primaryImage = data.vehicle.images.find((img: any) => img.is_primary);
      const firstImage = data.vehicle.images[0];
      (data.vehicle as any).main_image = primaryImage?.image_url || firstImage?.image_url || null;
    }

    setBooking(data as any);
  } catch (error: any) {
    console.error('Error loading booking:', error);
    setError(error.message || 'Error al cargar la reserva');
  } finally {
    setLoading(false);
  }
};

// REEMPLAZAR POR:
const loadBooking = async () => {
  try {
    setLoading(true);
    
    if (!isValidBookingNumber(bookingNumber)) {
      setError('Número de reserva inválido');  // Traducir según idioma
      return;
    }

    const data = await getBookingByNumber(bookingNumber);

    if (!data) {
      setError('Reserva no encontrada');  // Traducir según idioma
      return;
    }

    setBooking(data as any);
  } catch (error: any) {
    console.error('Error loading booking:', error);
    setError(error.message || 'Error al cargar la reserva');
  } finally {
    setLoading(false);
  }
};
```

---

## 📝 Textos de Error por Idioma

### Español
```typescript
setError('Número de reserva inválido');
setError('Reserva no encontrada');
```

### Inglés
```typescript
setError('Invalid booking number');
setError('Booking not found');
```

### Francés
```typescript
setError('Numéro de réservation invalide');
setError('Réservation non trouvée');
```

### Alemán
```typescript
setError('Ungültige Buchungsnummer');
setError('Buchung nicht gefunden');
```

---

## 🚀 Siguiente Paso

Una vez actualizados todos los archivos, continuar con:

1. ✅ Actualizar redirecciones después de pago (ver paso 5)
2. ✅ Eliminar `/api/bookings/[id]/route.ts` (paso 6)
3. ✅ Documentar cambios finales (paso 7)

---

## 💡 Nota Importante

La función `getBookingByNumber()` ya procesa automáticamente la imagen principal del vehículo, por lo que NO es necesario incluir ese código en `loadBooking`.

---

**Fecha:** 2026-01-27  
**Branch:** feature/migrate-to-booking-number
