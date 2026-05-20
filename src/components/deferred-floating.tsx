"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

/**
 * Carga todos los componentes flotantes (no críticos para el LCP) tras la
 * hidratación inicial y, además, sólo después de que el navegador esté libre
 * (requestIdleCallback) o el usuario interactúe.
 *
 * Antes: WhatsAppChatbot + BackToTop + AdminFABButton + CookieBanner +
 * CookieSettingsModal + Toaster + AnalyticsDebug se hidrataban todos desde el
 * primer paint, contribuyendo al TBT y al INP.
 *
 * Ahora: nada de eso entra en el bundle inicial. Se cargan cuando el navegador
 * está idle (o tras 1,5 s como fallback). El CookieProvider sigue cargándose
 * arriba (Server Component-friendly) para que el contexto exista.
 */

const CookieBanner = dynamic(
  () => import("@/components/cookies").then((m) => m.CookieBanner),
  { ssr: false }
);
const CookieSettingsModal = dynamic(
  () => import("@/components/cookies").then((m) => m.CookieSettingsModal),
  { ssr: false }
);
const BackToTop = dynamic(() => import("@/components/back-to-top"), {
  ssr: false,
});
const WhatsAppChatbot = dynamic(
  () => import("@/components/whatsapp-chatbot"),
  { ssr: false }
);
const AdminFABButton = dynamic(
  () =>
    import("@/components/admin-fab-button").then((m) => m.AdminFABButton),
  { ssr: false }
);
const Toaster = dynamic(
  () => import("sonner").then((m) => m.Toaster),
  { ssr: false }
);
const AnalyticsDebug = dynamic(
  () => import("@/components/analytics-debug").then((m) => m.AnalyticsDebug),
  { ssr: false }
);

export function DeferredFloating() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const trigger = () => {
      if (cancelled) return;
      setReady(true);
    };

    const ric = (
      window as unknown as {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      }
    ).requestIdleCallback;

    if (typeof ric === "function") {
      ric(trigger, { timeout: 1500 });
    } else {
      // Fallback Safari / navegadores sin requestIdleCallback
      const id = window.setTimeout(trigger, 1500);
      return () => {
        cancelled = true;
        window.clearTimeout(id);
      };
    }

    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) return null;

  return (
    <>
      <CookieBanner />
      <CookieSettingsModal />
      <BackToTop />
      <WhatsAppChatbot />
      <AdminFABButton />
      <Toaster position="top-right" richColors />
      <AnalyticsDebug />
    </>
  );
}
