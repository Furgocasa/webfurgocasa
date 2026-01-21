import type { Metadata } from "next";

/**
 * Layout para la página de login de administrador
 * 
 * ⚠️ CRÍTICO: NUNCA indexar esta página en buscadores
 */

export const metadata: Metadata = {
  title: "Login - Furgocasa Admin",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

// Login page doesn't use the admin layout
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
