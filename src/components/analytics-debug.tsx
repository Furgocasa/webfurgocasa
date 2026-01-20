'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Componente de Debug para Google Analytics
 * Solo visible en desarrollo (NODE_ENV === 'development')
 * Muestra información sobre el estado de Google Analytics en la página actual
 */
export function AnalyticsDebug() {
  const pathname = usePathname();
  const [analyticsState, setAnalyticsState] = useState<{
    isAdmin: boolean;
    gtagLoaded: boolean;
    dataLayerLength: number;
    consent: 'denied' | 'granted' | 'unknown';
  }>({
    isAdmin: false,
    gtagLoaded: false,
    dataLayerLength: 0,
    consent: 'unknown',
  });

  // Solo mostrar en desarrollo
  const isDevelopment = process.env.NODE_ENV === 'development';

  useEffect(() => {
    if (!isDevelopment) return;

    const isAdmin = pathname?.startsWith('/administrator') || pathname?.startsWith('/admin');
    const gtagLoaded = typeof window !== 'undefined' && !!(window as any).gtag;
    const dataLayerLength = typeof window !== 'undefined' && Array.isArray((window as any).dataLayer)
      ? (window as any).dataLayer.length
      : 0;

    // Intentar detectar el estado de consentimiento
    let consent: 'denied' | 'granted' | 'unknown' = 'unknown';
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      const dataLayerStr = JSON.stringify((window as any).dataLayer);
      if (dataLayerStr.includes('"analytics_storage":"granted"')) {
        consent = 'granted';
      } else if (dataLayerStr.includes('"analytics_storage":"denied"')) {
        consent = 'denied';
      }
    }

    setAnalyticsState({
      isAdmin,
      gtagLoaded,
      dataLayerLength,
      consent,
    });
  }, [pathname, isDevelopment]);

  // No mostrar en producción
  if (!isDevelopment) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: analyticsState.isAdmin ? '#ef4444' : '#10b981',
        color: 'white',
        padding: '12px 16px',
        borderRadius: '8px',
        fontSize: '12px',
        zIndex: 9999,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        fontFamily: 'monospace',
        maxWidth: '300px',
        lineHeight: '1.5',
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '14px' }}>
        🔍 Analytics Debug
      </div>
      <div style={{ marginBottom: '4px' }}>
        📍 Ruta: <strong>{pathname}</strong>
      </div>
      <div style={{ marginBottom: '4px' }}>
        {analyticsState.isAdmin ? '🔴' : '🟢'} Admin Page:{' '}
        <strong>{analyticsState.isAdmin ? 'YES' : 'NO'}</strong>
      </div>
      <div style={{ marginBottom: '4px' }}>
        {analyticsState.gtagLoaded ? '✅' : '❌'} gtag:{' '}
        <strong>{analyticsState.gtagLoaded ? 'Loaded' : 'Not Loaded'}</strong>
      </div>
      <div style={{ marginBottom: '4px' }}>
        📊 dataLayer: <strong>{analyticsState.dataLayerLength} eventos</strong>
      </div>
      <div>
        🍪 Consent:{' '}
        <strong
          style={{
            color: analyticsState.consent === 'granted' ? '#a7f3d0' : analyticsState.consent === 'denied' ? '#fca5a5' : '#fde68a',
          }}
        >
          {analyticsState.consent.toUpperCase()}
        </strong>
      </div>

      {analyticsState.isAdmin && (
        <div
          style={{
            marginTop: '8px',
            padding: '8px',
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '4px',
            fontSize: '11px',
          }}
        >
          ⚠️ ADMIN: Analytics NO debe cargar en esta página
        </div>
      )}

      {!analyticsState.isAdmin && analyticsState.consent === 'denied' && (
        <div
          style={{
            marginTop: '8px',
            padding: '8px',
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '4px',
            fontSize: '11px',
          }}
        >
          💡 Acepta cookies de analytics en el banner para activar tracking
        </div>
      )}
    </div>
  );
}
