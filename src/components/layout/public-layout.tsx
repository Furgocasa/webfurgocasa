import { ReactNode } from "react";

interface PublicLayoutProps {
  children: ReactNode;
}

/**
 * Layout wrapper para páginas públicas
 * Añade el padding-top necesario para compensar el header fijo
 */
export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="pt-[120px]">
      {children}
    </div>
  );
}
