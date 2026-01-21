'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Componente que carga los scripts de Google Analytics
 * SOLO en páginas públicas (NO en /administrator ni /admin)
 */
export function AnalyticsScripts() {
  const pathname = usePathname();
  const [shouldLoadAnalytics, setShouldLoadAnalytics] = useState(false);

  useEffect(() => {
    // Verificar si estamos en una página de administrador
    const isAdminPage = pathname?.startsWith('/administrator') || pathname?.startsWith('/admin');
    
    if (isAdminPage) {
      console.log('[Analytics] Ruta de administrador detectada. Scripts de Analytics NO se cargarán.');
      setShouldLoadAnalytics(false);
    } else {
      console.log('[Analytics] Ruta pública detectada. Cargando scripts de Analytics...');
      setShouldLoadAnalytics(true);
    }
  }, [pathname]);

  // NO renderizar nada si estamos en páginas de administrador
  if (!shouldLoadAnalytics) {
    return null;
  }

  return (
    <>
      {/* Google Analytics - Consentimiento por defecto denegado (GDPR) */}
      <Script
        id="gtag-consent-default"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            
            // Consentimiento por defecto denegado (GDPR compliant)
            gtag('consent', 'default', {
              'analytics_storage': 'denied',
              'ad_storage': 'denied',
              'ad_user_data': 'denied',
              'ad_personalization': 'denied',
              'functionality_storage': 'denied',
              'personalization_storage': 'denied',
              'security_storage': 'granted'
            });
          `,
        }}
      />
      
      {/* Google Analytics - Script principal */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-G5YLBN5XXZ"
        strategy="afterInteractive"
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-G5YLBN5XXZ', {
              page_path: window.location.pathname,
            });
            console.log('[Analytics] Google Analytics inicializado para:', window.location.pathname);
          `,
        }}
      />
    </>
  );
}
