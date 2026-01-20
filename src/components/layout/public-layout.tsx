import { ReactNode } from "react";

interface PublicLayoutProps {
  children: ReactNode;
}

/**
 * Layout wrapper para páginas públicas
 * Con header sticky, el contenido fluye naturalmente
 */
export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <>
      {children}
    </>
  );
}
