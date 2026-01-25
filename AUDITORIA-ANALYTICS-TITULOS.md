# Auditoría y Solución Definitiva (V3): Títulos en Analytics

**Fecha**: 25 de enero de 2026
**Autor**: Equipo de Desarrollo
**Estado**: ✅ Implementado (V3 - Bulletproof)

## 1. Hallazgos de la Auditoría

Tras analizar el comportamiento de Next.js y Google Analytics, identificamos por qué fallaban las versiones anteriores:

1. **Problema de la V1 (Retraso fijo 100ms)**:
   - Insuficiente para páginas lentas (blog, traducciones). Analytics enviaba el título "viejo" antes de que llegara el nuevo.

2. **Problema de la V2 (Solo MutationObserver)**:
   - Si Next.js reemplazaba el nodo `<title>` completo en lugar de actualizar su texto, el observador perdía la conexión ("desconectado") y nunca detectaba el cambio.
   - Si el título *no cambiaba* (ej: recarga de página o navegación entre parámetros), dependía exclusivamente del fallback lento.

## 2. Solución Implementada (V3 - Estrategia Híbrida)

Hemos reescrito `src/components/analytics.tsx` con una estrategia de **triple redundancia** para garantizar que NO se pierda ningún título:

### A. Polling Inteligente (Cada 100ms)
- **Qué hace**: Comprueba activamente cada 0.1 segundos si el título actual es diferente al de la página anterior.
- **Ventaja**: Es inmune a si Next.js reemplaza nodos o cambia el DOM de forma extraña. Si el texto cambia, lo detecta.

### B. MutationObserver (Reacción Inmediata)
- **Qué hace**: Escucha eventos del navegador.
- **Ventaja**: Reacción instantánea (0ms) en la mayoría de los casos estándar.

### C. Fallback de Seguridad (1.5 segundos)
- **Qué hace**: Si después de 1.5s el título no ha cambiado (raro, pero posible), envía los datos de todas formas.
- **Ventaja**: Garantiza que NUNCA se pierda una visita, incluso si el sistema de títulos falla.

## 3. Cómo Auditar/Verificar en tu Navegador

Para verificar que esto funciona 100%, sigue estos pasos:

1. Abre tu web en Chrome.
2. Abre la consola de desarrollador (F12 o Clic Derecho > Inspeccionar > Consola).
3. Escribe o pega este filtro en la caja de filtro de la consola: `[Analytics]`
4. Navega por el menú principal (ej: Inicio -> Vehículos -> Blog).

### Lo que DEBES ver:

Deberías ver mensajes como estos:

```text
[Analytics] 📡 Enviando (mutation_detected) | Path: /es/vehiculos | Title: "Nuestros Vehículos - Furgocasa"
[Analytics] 📡 Enviando (polling_change_detected) | Path: /es/blog | Title: "Blog de Viajes - Furgocasa"
```

- Si ves `mutation_detected`: Funcionó la detección rápida.
- Si ves `polling_change_detected`: Funcionó la detección robusta (el observer falló pero el polling salvó el día).
- Si ves `timeout_fallback`: La página tardó mucho, pero se envió igual.

### Verificación de Títulos Específicos

Si ves `Title: "..."` con el texto correcto del artículo o página, **CONFIRMADO**: Analytics está recibiendo el dato correcto.

## 4. Conclusión

Esta implementación es la más robusta posible para Single Page Applications (SPA). Cubre:
- ✅ Cargas rápidas
- ✅ Cargas lentas (API/CMS)
- ✅ Cambios de idioma
- ✅ Reemplazo de nodos del DOM
- ✅ Navegación interrumpida

El sistema ahora es **auditado y autoverificable** a través de la consola.
