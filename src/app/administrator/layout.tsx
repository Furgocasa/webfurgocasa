import type { Metadata } from "next";
import { AnalyticsBlocker } from "@/components/admin/analytics-blocker";

/**
 * Layout raíz para todas las páginas de administrador
 * 
 * ⚠️ CRÍTICO: Este layout aplica noindex a TODAS las páginas de admin
 * Las páginas de administrador NUNCA deben indexarse en buscadores
 * 
 * ⛔ BLOQUEADOR DE ANALYTICS: AnalyticsBlocker previene cualquier tracking
 */

export const metadata: Metadata = {
  // ⚠️ NUNCA indexar páginas de administración
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'none',
      'max-snippet': -1,
    },
  },
};

export default function AdministratorRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* ⛔ CRÍTICO: Bloqueador de Analytics - Previene tracking en admin */}
      <AnalyticsBlocker />
      {children}
    </>
  );
}
