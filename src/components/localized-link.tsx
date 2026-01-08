"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";
import { getTranslatedRoute } from "@/lib/route-translations";
import { ReactNode } from "react";

interface LocalizedLinkProps {
  href: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
  target?: string;
  rel?: string;
}

/**
 * LocalizedLink - Componente que automáticamente añade el prefijo de idioma a las rutas
 * Uso: <LocalizedLink href="/vehiculos">Ver vehículos</LocalizedLink>
 * Resultado: /es/vehiculos o /en/vehicles según el idioma activo
 */
export function LocalizedLink({ href, className, children, onClick, target, rel }: LocalizedLinkProps) {
  const { language } = useLanguage();
  
  // Si es una URL externa o ya tiene el idioma, usarla tal cual
  if (href.startsWith('http') || href.startsWith('//') || href.startsWith('#') || href.startsWith('/es/') || href.startsWith('/en/') || href.startsWith('/fr/') || href.startsWith('/de/')) {
    return (
      <Link href={href} className={className} onClick={onClick} target={target} rel={rel}>
        {children}
      </Link>
    );
  }
  
  // Añadir el idioma a rutas internas
  const localizedHref = getTranslatedRoute(href, language);
  
  return (
    <Link href={localizedHref} className={className} onClick={onClick} target={target} rel={rel}>
      {children}
    </Link>
  );
}
