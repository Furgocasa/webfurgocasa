# Plantillas de Email - Furgocasa

Esta carpeta contiene las plantillas HTML de ejemplo de los emails que se envían automáticamente en el proceso de reserva.

## Flujo de Emails

Cada email se envía **a los dos destinatarios**:
- Cliente (el email que proporcionó al reservar)
- reservas@furgocasa.com

## Archivos

| Archivo | Cuándo se envía |
|---------|-----------------|
| `01-reserva-creada.html` | Cuando el cliente crea la reserva (pendiente de pago) |
| `02-primer-pago-confirmado.html` | Cuando se confirma el primer pago (50% o 100%) |
| `03-segundo-pago-confirmado.html` | Cuando se completa el pago total (segundo pago) |

## Diseño Compatible con Todos los Clientes de Correo

El diseño está optimizado para **máxima compatibilidad**:

- **Basado en tablas HTML** (no flexbox ni CSS Grid)
- **Estilos inline** (no clases CSS externas)
- **Sin gradientes** - colores sólidos
- **Estructura XHTML** para clientes antiguos
- **Código específico para Outlook** (`<!--[if mso]>`)

### Compatibilidad probada

- Outlook (escritorio y web)
- Gmail (web y app)
- Apple Mail
- Yahoo Mail
- Thunderbird
- Mail iOS/Android

## Previsualización

Puedes abrir cualquier archivo `.html` directamente en el navegador para ver cómo se verá el email.

## Notas

- Los datos mostrados son de ejemplo (Juan García López, reserva FU0018, etc.)
- En producción, estos datos se reemplazan dinámicamente con los datos reales de cada reserva
- Las plantillas reales están en `src/lib/email/templates.ts`
- El **mismo email** se envía tanto al cliente como a reservas@furgocasa.com
- El asunto incluye: código vehículo, fecha inicio, nombre y apellidos del cliente

## Colores de la marca

- **Azul corporativo (cabecera, títulos, botón):** `#063971`
- **Verde éxito (confirmaciones):** `#10b981`
- **Amarillo alerta (avisos):** `#fef3c7` con borde `#f59e0b`
- **Rojo pendiente (importes):** `#dc2626`
- **Fondo secciones:** `#f9fafb`
- **Fondo página:** `#f4f4f5`
