'use client';

import { useEffect } from 'react';

/**
 * ⛔ Componente de bloqueo de Analytics para páginas de administrador
 * 
 * Este componente se monta en el layout de admin y se asegura de que:
 * 1. Los scripts de gtag NO se ejecuten si ya están cargados
 * 2. Se bloquee cualquier tracking accidental
 * 3. Se elimine window.gtag si existe (para prevenir tracking)
 * 
 * ⚠️ SOLO usar en layouts de /administrator
 */
export function AnalyticsBlocker() {
  useEffect(() => {
    console.log('[AnalyticsBlocker] 🛡️ Bloqueador de Analytics montado en página de admin');

    // Sobrescribir gtag con una función vacía (previene cualquier tracking)
    if (typeof window !== 'undefined') {
      // Si window.gtag existe, reemplazarla con función vacía
      if ((window as any).gtag) {
        console.warn('[AnalyticsBlocker] ⚠️ window.gtag detectado en página admin - BLOQUEANDO');
        (window as any).gtag = function() {
          console.warn('[AnalyticsBlocker] ⛔ Intento de tracking bloqueado en página admin');
        };
      }

      // También bloquear dataLayer si existe
      if ((window as any).dataLayer) {
        console.warn('[AnalyticsBlocker] ⚠️ window.dataLayer detectado en página admin - BLOQUEANDO');
        const originalPush = (window as any).dataLayer.push;
        (window as any).dataLayer.push = function(...args: any[]) {
          console.warn('[AnalyticsBlocker] ⛔ Intento de push a dataLayer bloqueado:', args);
          // No llamar al originalPush - bloquear completamente
        };
      }
    }

    // Cleanup: restaurar (aunque no debería ser necesario)
    return () => {
      console.log('[AnalyticsBlocker] 🛡️ Bloqueador de Analytics desmontado');
    };
  }, []);

  return null; // Este componente no renderiza nada
}
