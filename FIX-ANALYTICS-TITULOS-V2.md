# Fix 2.0: Títulos de Página en Analytics (Método MutationObserver)

**Fecha**: 25 de enero de 2026
**Estado**: ✅ Implementado (V2)

## Problema Persistente
A pesar del retraso de 100ms implementado anteriormente, algunas páginas (especialmente Blog y traducciones) siguen enviando títulos vacíos o incorrectos. Esto ocurre porque la carga de datos (fetch) o la hidratación de componentes puede tardar más de 100ms en establecer el `<title>` final.

## Solución Definitiva: MutationObserver

En lugar de "adivinar" cuánto tiempo esperar (100ms, 500ms...), ahora el código **observa activamente** el elemento `<title>` del navegador.

### Lógica Implementada

1. **Detección de Cambio de Ruta**: Se activa al navegar.
2. **Observador (`MutationObserver`)**: Se conecta al tag `<title>`.
3. **Disparo por Evento**: En cuanto el título cambia y tiene contenido, se envía el pageview a Analytics.
4. **Fallback de Seguridad**: Si por alguna razón el título no cambia en **1.5 segundos** (ej: misma página, error de carga), se envía el evento de todas formas con el título actual para no perder la visita.

### Código (src/components/analytics.tsx)

```typescript
// ...
const sendPageView = (trigger: string) => {
  if (sent) return; // Evitar duplicados
  // ... enviar a GA con document.title actual ...
  sent = true;
};

// Observar cambios reales en el DOM del título
observer = new MutationObserver(() => {
  if (document.title && document.title.length > 0) {
    sendPageView('title_change');
  }
});
// ...
```

## Verificación

1. **Navegación Lenta**: Incluso si el blog tarda 1 segundo en cargar el título desde el CMS, Analytics esperará ese segundo y enviará el título correcto.
2. **Navegación Rápida**: Si el título cambia instantáneamente, se envía al instante.
3. **Consola**: Verás `[Analytics] Enviando pageview (title_change): ...` o `(timeout_fallback)` si tardó demasiado.

Esto garantiza la máxima precisión posible en una SPA como Next.js.
