# Auditoría V5: Problema de "Initial Load" (Landing Directa)

**Fecha**: 25 de enero de 2026
**Estado**: ✅ Solucionado (V5)

## Problema Detectado
El usuario reportó: "Yo en esta no veo que haya tráfico" al entrar en una URL directa (ej: desde Facebook).

### Diagnóstico Técnico
1. **Race Condition**: Al entrar directamente en la web, el componente `GoogleAnalytics` (Client Component) se montaba y ejecutaba su efecto (`useEffect`) **ANTES** de que el script de Google Analytics (`gtag.js`) estuviera listo.
2. **Consecuencia**: El `if ((window as any).gtag)` fallaba, el código retornaba, y **nunca se enviaba el page_view de la primera página**.
3. **Navegación posterior**: Si luego navegabas a otra página, sí funcionaba (porque `gtag` ya estaba cargado).

Esto explica perfectamente por qué no veías tráfico en aterrizajes directos.

## Solución V5 Implementada

Hemos añadido un sistema de **reintento automático (Polling de Inicialización)** en `src/components/analytics.tsx`:

1. **Intento Inmediato**: Al montar, intenta enviar el pageview.
2. **Si `gtag` no existe**: 
   - Inicia un intervalo que revisa cada 100ms si `window.gtag` ya está definido.
   - En cuanto aparece `gtag` (milésimas de segundo después), dispara la lógica de tracking.
   - Tiene un límite de seguridad de 5 segundos.

### Resumen de Mejoras Acumuladas
- **V1-V3**: Captura robusta de Títulos (Observer + Polling).
- **V4**: Captura de parámetros URL (`fbclid`, campañas).
- **V5**: Captura garantizada de la **primera visita** (Landing).

## Cómo Verificarlo
1. Abre una ventana de incógnito.
2. Pega una URL directa (ej: la de Facebook).
3. Abre la consola inmediatamente.
4. Deberías ver el log `[Analytics] 📡 Enviando ...`.

Si antes no salía nada en la primera carga, ahora debe salir.
