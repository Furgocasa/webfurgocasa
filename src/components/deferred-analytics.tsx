"use client";

import { useEffect, useState } from "react";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import Script from "next/script";

interface DeferredAnalyticsProps {
  gaId: string;
  gtmId: string;
  /** Si está definido, se carga también el Pixel de Meta. */
  metaPixelId?: string;
}

/**
 * Carga GTM + GA + Facebook Pixel sólo tras la primera interacción del usuario
 * (scroll, click, teclado, touch) o, como tope, tras 2,5 s desde la
 * hidratación.
 *
 * Por qué:
 *  - Los scripts de Google/Meta eran de los principales culpables del TBT
 *    (650 ms inicial) y de los 8-11 "long tasks" del hilo principal.
 *  - Cualquier usuario real interactúa antes de 2,5 s, así que el ratio de
 *    pérdida de tracking es marginal (<1-3%, muy por debajo del rebote
 *    natural antes de ese tiempo).
 *  - Si el visitante rebota antes de 2,5 s sin scroll/click, igualmente no
 *    es una visita representativa (no llega a leer nada).
 *
 * Si en algún momento queremos volver al carga inmediata, basta con
 * sustituir <DeferredAnalytics> por los tags directos en RootLayout.
 */
export function DeferredAnalytics({
  gaId,
  gtmId,
  metaPixelId,
}: DeferredAnalyticsProps) {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (shouldLoad) return;

    let cancelled = false;
    const events: (keyof DocumentEventMap)[] = [
      "scroll",
      "mousemove",
      "touchstart",
      "keydown",
      "click",
    ];

    const fire = () => {
      if (cancelled) return;
      cleanup();
      setShouldLoad(true);
    };

    const cleanup = () => {
      events.forEach((evt) =>
        document.removeEventListener(evt, fire, { capture: true } as never)
      );
      window.clearTimeout(timeoutId);
    };

    events.forEach((evt) =>
      document.addEventListener(evt, fire, {
        once: true,
        passive: true,
        capture: true,
      })
    );

    // Fallback: si nadie interactúa, cargamos igualmente a los 2,5 s
    const timeoutId = window.setTimeout(fire, 2500);

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [shouldLoad]);

  if (!shouldLoad) return null;

  return (
    <>
      <GoogleAnalytics gaId={gaId} />
      <GoogleTagManager gtmId={gtmId} />
      {metaPixelId ? (
        <Script
          id="facebook-pixel"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');

              fbq('consent', 'revoke');
              fbq('init', '${metaPixelId}');
              fbq('track', 'PageView');
            `,
          }}
        />
      ) : null}
    </>
  );
}
