"use client";

import { usePathname } from "next/navigation";
import { useLanguage } from "@/contexts/language-context";
import { getTranslatedRoute } from "@/lib/route-translations";
import type { Locale } from "@/lib/i18n/config";

/**
 * Componente que genera los tags hreflang para SEO multiidioma
 * Debe incluirse en el <head> de cada página
 */
export function HreflangTags() {
  const pathname = usePathname();
  const { language } = useLanguage();
  
  // Eliminar el prefijo de idioma actual para obtener la ruta base
  const pathWithoutLang = pathname.replace(/^\/(es|en|fr|de)/, '') || '/';
  
  // Lista de idiomas soportados
  const locales: Locale[] = ['es', 'en', 'fr', 'de'];
  
  // Dominio base (cambiar por tu dominio en producción)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.furgocasa.com';
  
  return (
    <>
      {/* x-default apunta al español como idioma por defecto */}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={`${baseUrl}${getTranslatedRoute(pathWithoutLang, 'es')}`}
      />
      
      {/* Generar un tag hreflang para cada idioma */}
      {locales.map((locale) => {
        const translatedPath = getTranslatedRoute(pathWithoutLang, locale);
        const fullUrl = `${baseUrl}${translatedPath}`;
        
        return (
          <link
            key={locale}
            rel="alternate"
            hrefLang={locale}
            href={fullUrl}
          />
        );
      })}
      
      {/* Canonical URL para el idioma actual */}
      <link
        rel="canonical"
        href={`${baseUrl}${pathname}`}
      />
    </>
  );
}
