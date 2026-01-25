# Auditoría V6: Recorte de URLs Extremas (Facebook)

**Fecha**: 25 de enero de 2026
**Estado**: ✅ Solucionado (V6)

## Problema Crítico Detectado
Las visitas desde Facebook con parámetros `fbclid` extremadamente largos (tokens cifrados) estaban siendo generadas correctamente por el cliente (Status 200) pero **descartadas silenciosamente** por los servidores de Google Analytics debido a exceder la longitud máxima permitida para el campo `dl` (Document Location).

### Diagnóstico Técnico
1.  **URL Original**: > 500-800 caracteres.
2.  **Payload de Analytics**: `dl=https://...` ocupaba casi todo el ancho de banda del hit.
3.  **Resultado**: El "hit" llega a Google, pero su validador interno lo marca como inválido o trunca la URL de forma que la atribución falla.

## Solución V6 Implementada

Se ha añadido una capa de **Sanitización de URL** justo antes del envío en `src/components/analytics.tsx`:

1.  **Detección de URL Gigante**: Si la URL supera los 300 caracteres...
2.  **Identificación de `fbclid`**: Buscamos específicamente el parámetro culpable.
3.  **Recorte Inteligente**: 
    - No eliminamos el parámetro (para que GA sepa que es tráfico social).
    - Lo recortamos a 20 caracteres + `...` (ej: `fbclid=IwY2xja...`).
4.  **Envío Seguro**: Enviamos la URL "segura" a Analytics (`page_location` y `page_path`).

### Beneficio
- **Atribución Preservada**: GA sigue viendo `?fbclid=...`, así que sabe que es Facebook.
- **Evento Aceptado**: Al reducir el tamaño drásticamente, el evento entra dentro de los límites seguros de procesamiento de Google.
- **Informes Limpios**: En tus informes verás URLs legibles en lugar de códigos criptográficos infinitos.

## Verificación

1. Entra desde el enlace de Facebook largo.
2. Mira la consola.
3. Deberías ver:
   `[Analytics] ✂️ URL recortada para envío seguro: /.../noticia?fbclid=IwY2xja...`

Si ves el icono de la tijera ✂️, el sistema ha funcionado y la visita se registrará.
