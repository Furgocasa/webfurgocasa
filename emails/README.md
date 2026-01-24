# Plantillas de Email - Furgocasa

Esta carpeta contiene las plantillas HTML de los emails que se envían automáticamente en el proceso de reserva.

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

## Previsualización

Puedes abrir cualquier archivo `.html` directamente en el navegador para ver cómo se verá el email.

## Notas

- Los datos mostrados son de ejemplo (Juan García López, reserva FG20260215-001, etc.)
- En producción, estos datos se reemplazan dinámicamente con los datos reales de cada reserva
- Las plantillas reales están en `src/lib/email/templates.ts`
- El **mismo email** se envía tanto al cliente como a reservas@furgocasa.com

## Colores de la marca

- **Azul corporativo (principal):** `#063971`
- **Azul oscuro (degradado):** `#042a52`
- **Verde (éxito):** `#10b981`
- **Amarillo (warning):** `#f59e0b`
