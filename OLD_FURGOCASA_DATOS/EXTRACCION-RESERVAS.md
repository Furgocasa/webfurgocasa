# Extracción de Reservas de la Base de Datos Antigua

## 📊 Resumen de Datos Encontrados

### Sistema de Reservas: **VikRentCar**

La antigua web utilizaba el componente **VikRentCar** de Joomla para gestionar el alquiler de furgonetas camper.

---

## 🗄️ Tablas Principales de Reservas

### 1. **`fur_vikrentcar_orders`** - Pedidos/Reservas
**AUTO_INCREMENT: 2066** (indica que hay reservas con IDs hasta ~2065)

**Campos clave:**
- `id` - ID de la reserva
- `idbusy` - ID de la reserva en tabla busy (calendario)
- `custdata` - Datos del cliente en formato texto (Name, Last Name, e-Mail, Phone)
- `ts` - Timestamp de creación de la reserva
- `status` - Estado: 'confirmed', 'pending', 'cancelled', etc.
- `idcar` - ID del vehículo reservado
- `days` - Número de días de alquiler
- `ritiro` - Fecha/hora de recogida (UNIX timestamp)
- `consegna` - Fecha/hora de devolución (UNIX timestamp)
- `custmail` - Email del cliente
- `phone` - Teléfono del cliente
- `nominative` - Nombre completo del cliente
- `totpaid` - Total pagado
- `order_total` - Total del pedido
- `idpayment` - ID del método de pago
- `paymentlog` - Log de pagos
- `country` - País del cliente (código: 'ESP', etc.)
- `lang` - Idioma de la reserva
- `optionals` - Extras/opcionales añadidos
- `coupon` - Cupón de descuento usado
- `adminnotes` - Notas administrativas
- `locationvat` - IVA
- `tot_taxes` - Impuestos totales
- `car_cost` - Coste del vehículo
- `extracosts` - Costes extra en JSON
- `idplace` - ID lugar de recogida
- `idreturnplace` - ID lugar de devolución

**Ejemplo de reserva:**
```
ID: 9
Cliente: Nombre Apellido Ejemplo
Email: cliente.ejemplo@email.com
Teléfono: +34600000000
Estado: confirmed
Vehículo ID: 2
Días: 3
Recogida: 1646384400 (2022-03-04)
Devolución: 1646589600 (2022-03-07)
Total: 300.00€
IVA: 52.07€
```

---

### 2. **`fur_vikrentcar_customers`** - Clientes
**AUTO_INCREMENT: 1016** (más de 1000 clientes registrados)

**Campos:**
- `id` - ID del cliente
- `first_name` - Nombre
- `last_name` - Apellidos
- `email` - Email
- `phone` - Teléfono
- `country` - País
- `address` - Dirección
- `city` - Ciudad
- `zip` - Código postal
- `doctype` - Tipo de documento
- `docnum` - Número de documento
- `company` - Empresa (para clientes corporativos)
- `vat` - CIF/NIF
- `gender` - Género
- `bdate` - Fecha de nacimiento
- `pbirth` - Lugar de nacimiento
- `notes` - Notas sobre el cliente
- `cfields` - Campos personalizados en JSON

---

### 3. **`fur_vikrentcar_busy`** - Calendario de Ocupación
**AUTO_INCREMENT: 1717** (control de disponibilidad)

**Campos:**
- `id` - ID
- `idcar` - ID del vehículo
- `ritiro` - Fecha/hora inicio ocupación
- `consegna` - Fecha/hora fin ocupación
- `realback` - Fecha/hora real de devolución
- `stop_sales` - Bloqueo de ventas (mantenimiento, etc.)

---

### 4. **`fur_vikrentcar_cars`** - Vehículos
**AUTO_INCREMENT: 44** (hasta 43 vehículos diferentes)

**Campos:**
- `id` - ID del vehículo
- `name` - Nombre/modelo (ej: "FU0006 - Dreamer Fun D55")
- `img` - Imagen principal
- `info` - Información detallada (HTML)
- `short_info` - Descripción corta
- `idcat` - IDs de categorías
- `idcarat` - IDs de características
- `idopt` - IDs de opcionales disponibles
- `avail` - Disponible (1) o no (0)
- `units` - Unidades disponibles
- `idplace` - Lugares de recogida
- `idretplace` - Lugares de devolución
- `moreimgs` - Imágenes adicionales
- `startfrom` - Precio desde
- `alias` - Alias para URL

**Ejemplo encontrado:**
- "FU0006 - Dreamer Fun D55" - Marca: Dreamer (by Rapido), 2 adultos + 1-2 niños

---

### 5. Otras Tablas Relacionadas

- **`fur_vikrentcar_prices`** - Tarifas y precios por temporada
- **`fur_vikrentcar_seasons`** - Temporadas (alta, baja, media)
- **`fur_vikrentcar_places`** - Lugares de recogida/devolución
- **`fur_vikrentcar_optionals`** - Extras disponibles (sillas infantil, GPS, etc.)
- **`fur_vikrentcar_categories`** - Categorías de vehículos
- **`fur_vikrentcar_caratteristiche`** - Características de vehículos
- **`fur_vikrentcar_coupons`** - Cupones de descuento
- **`fur_vikrentcar_iva`** - Configuración de IVA
- **`fur_vikrentcar_gpayments`** - Métodos de pago
- **`fur_vikrentcar_config`** - Configuración general
- **`fur_vikrentcar_critical_dates`** - Fechas críticas (bloqueos, eventos)
- **`fur_vikrentcar_restrictions`** - Restricciones de reserva
- **`fur_vikrentcar_hourscharges`** - Cargos por hora
- **`fur_vikrentcar_locfees`** - Tasas por localización
- **`fur_vikrentcar_oohfees`** - Tasas fuera de horario
- **`fur_vikrentcar_orderhistory`** - Historial de cambios en pedidos
- **`fur_vikrentcar_customers_orders`** - Relación clientes-pedidos

---

## 📋 Campos Principales para Migración

### Datos Esenciales de una Reserva:

```javascript
{
  // Identificación
  id: number,
  created_at: timestamp,
  
  // Cliente
  customer_name: string,
  customer_lastname: string,
  customer_email: string,
  customer_phone: string,
  customer_country: string,
  
  // Reserva
  vehicle_id: number,
  pickup_date: timestamp,
  return_date: timestamp,
  days: number,
  
  // Ubicaciones
  pickup_location_id: number,
  return_location_id: number,
  
  // Estado y Pago
  status: 'confirmed' | 'pending' | 'cancelled',
  total_amount: decimal,
  paid_amount: decimal,
  payment_method: string,
  
  // Extras
  optionals: string, // JSON de extras
  coupon_code: string,
  
  // Impuestos
  vat_amount: decimal,
  taxes_total: decimal,
  
  // Notas
  admin_notes: text,
  customer_notes: text
}
```

---

## 🔄 Script de Extracción SQL

Para extraer las reservas de forma estructurada, necesitarás ejecutar consultas como:

```sql
-- Extraer todas las reservas con información del cliente y vehículo
SELECT 
    o.id,
    o.nominative as customer_name,
    o.custmail as customer_email,
    o.phone as customer_phone,
    o.country,
    FROM_UNIXTIME(o.ts) as created_at,
    FROM_UNIXTIME(o.ritiro) as pickup_date,
    FROM_UNIXTIME(o.consegna) as return_date,
    o.days,
    o.status,
    o.idcar as vehicle_id,
    c.name as vehicle_name,
    o.order_total,
    o.totpaid as paid_amount,
    o.locationvat as vat_amount,
    o.tot_taxes,
    o.optionals,
    o.coupon,
    o.adminnotes,
    o.idplace as pickup_location_id,
    o.idreturnplace as return_location_id,
    o.lang as language
FROM fur_vikrentcar_orders o
LEFT JOIN fur_vikrentcar_cars c ON o.idcar = c.id
ORDER BY o.ts DESC;
```

---

## 📊 Estadísticas Estimadas

Basado en los AUTO_INCREMENT:

- **~2065 reservas** totales en el sistema
- **~1015 clientes** únicos registrados
- **~43 vehículos** diferentes gestionados
- **~1716 períodos** de ocupación en calendario

---

## ⚠️ Notas Importantes para la Migración

1. **Timestamps**: Las fechas están en formato UNIX timestamp. Necesitarás convertirlas:
   ```javascript
   new Date(timestamp * 1000)
   ```

2. **Datos del cliente**: El campo `custdata` tiene formato texto estructurado:
   ```
   Name: [nombre]
   Last Name: [apellidos]
   e-Mail: [email]
   Phone: [teléfono]
   ```

3. **Extras/Opcionales**: El campo `optionals` usa formato: `"1:1;2:1;"` 
   - Formato: `id_opcional:cantidad;`

4. **Campos personalizados**: `cfields` en clientes está en formato JSON

5. **Estados de reserva**: Verificar todos los posibles valores de `status` antes de migrar

6. **IVA y Precios**: Todos los importes están en formato decimal(12,2)

---

## 🎯 Próximos Pasos

1. Crear script de extracción SQL completo
2. Convertir datos a formato compatible con Supabase
3. Mapear campos de VikRentCar a tu nueva estructura de bookings
4. Migrar clientes a la tabla de perfiles
5. Migrar vehículos a la tabla de vans
6. Migrar reservas a la tabla de bookings
7. Validar integridad de datos

---

## 💡 Recomendaciones

- **Exportar primero a CSV/JSON** para revisar los datos antes de la migración
- **Verificar emails duplicados** en clientes
- **Validar fechas** de reservas (algunas pueden estar en el pasado)
- **Preservar IDs originales** en un campo de referencia para trazabilidad
- **Revisar reservas canceladas** - decidir si migrarlas o no
- **Documentos adjuntos**: Verificar si hay PDFs o imágenes asociadas a reservas

