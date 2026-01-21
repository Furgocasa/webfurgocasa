"use client";

import { usePathname } from "next/navigation";
import { Header } from "./header";
import { Footer } from "./footer";

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // No mostrar Header ni Footer SOLO en rutas del panel de administrador
  // Detecta: /administrator, /es/administrator, /en/administrator, etc.
  // Las páginas públicas como /reservar, /admin (si existen), etc. SÍ llevan header y footer
  const isAdministratorRoute = 
    pathname?.startsWith("/administrator") || 
    pathname?.includes("/administrator");

  if (isAdministratorRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
