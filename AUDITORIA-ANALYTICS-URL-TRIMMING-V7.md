# Auditoría V7: Recorte Agresivo de fbclid

**Fecha**: 25 de enero de 2026
**Estado**: ✅ Solucionado (V7)

## Problema Detectado
El límite de seguridad anterior (>300 caracteres) era demasiado permisivo. URLs "medianas" (250 caracteres) con tokens `fbclid` seguían siendo rechazadas por Google Analytics, probablemente por la complejidad/formato del token más que por la longitud pura.

## Solución V7 Implementada

Se ha endurecido la regla en `src/components/analytics.tsx`:

1.  **Criterio**: ¿Existe el parámetro `fbclid`?
2.  **Acción**: Si existe, **SE RECORTA SIEMPRE**, independientemente de la longitud total de la URL.
3.  **Resultado**: `?fbclid=IwY2xja...` (siempre 20 caracteres + puntos suspensivos).

### Por qué es seguro
- Google Analytics usa la *existencia* del parámetro para la atribución (Paid/Organic Social).
- No necesita el valor completo del token para saber que viene de Facebook.
- Al recortarlo siempre, garantizamos que la URL resultante sea limpia, corta y aceptable para los servidores de Google.

## Verificación

1. Entra desde cualquier enlace de Facebook (largo o corto).
2. Mira la consola.
3. **SIEMPRE** debes ver:
   `[Analytics] ✂️ URL saneada (fbclid recortado) para envío seguro: ...`

Si ves la tijera, la URL ha sido "limpiada" y es segura para envío.
