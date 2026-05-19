"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { preloadTranslations } from '@/lib/translation-service';
import { getPreloadCache } from '@/lib/translations-preload';
import { staticTranslations } from '@/lib/i18n/translations';
import { getTranslatedRoute, getLanguageFromRoute } from '@/lib/route-translations';
import { getBlogRouteData } from '@/components/blog/blog-route-data';
import type { Locale } from '@/lib/i18n/config';

interface LanguageContextType {
  language: Locale;
  setLanguage: (lang: Locale) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // ✅ CRÍTICO: Inicializar desde pathname para SSR - evita links /es/blog/routes/... en páginas EN
  const [language, setLanguageState] = useState<Locale>(() => 
    getLanguageFromRoute(pathname || '') || 'es'
  );
  const router = useRouter();

  // ✅ Sincronizar idioma con la URL (detectar cambios de ruta)
  useEffect(() => {
    const langFromRoute = getLanguageFromRoute(pathname);
    
    if (langFromRoute && langFromRoute !== language) {
      console.log('🌍 Idioma detectado desde URL:', langFromRoute);
      setLanguageState(langFromRoute);
      
      // Guardar en localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', langFromRoute);
      }
    }
  }, [pathname]); // Re-ejecutar cada vez que cambia la ruta

  // ✅ Precargar traducciones solo una vez
  useEffect(() => {
    preloadTranslations(getPreloadCache());
  }, []);

  // ✅ Cambio manual de idioma
  const setLanguage = (lang: Locale) => {
    console.log('🔄 Cambiando idioma a:', lang);
    
    // Actualizar el estado INMEDIATAMENTE (esto fuerza re-render)
    setLanguageState(lang);
    
    // Guardar en localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
    }
    
    // ✅ CRÍTICO: Obtener query params y hash de la URL actual
    // pathname solo contiene la ruta, NO los query params
    const queryString = typeof window !== 'undefined' ? window.location.search : '';
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    
    // ✅ BLOG: Comprobar si estamos en una página de blog con datos de rutas
    const blogRouteData = getBlogRouteData();
    const isBlogArticlePage = pathname.includes('/blog/') && 
                              pathname.split('/').length >= 5; // /es/blog/category/slug
    
    let translatedPath: string;
    
    if (isBlogArticlePage && blogRouteData) {
      // Slugs inyectados desde el post (slug_en, slug_fr, slug_de) — no reutilizar slug ES en /en/
      const translatedSlug = blogRouteData.slugs[lang] ?? blogRouteData.slugs.es;
      const translatedCategory = blogRouteData.category[lang] ?? blogRouteData.category.es;
      translatedPath = `/${lang}/blog/${translatedCategory}/${translatedSlug}${queryString}${hash}`;
    } else {
      // Traducir la URL actual al nuevo idioma (incluyendo query params)
      const fullPathWithParams = pathname + queryString + hash;
      translatedPath = getTranslatedRoute(fullPathWithParams, lang);
    }
    
    // ✅ Navegar a la nueva ruta
    const originalPath = pathname + queryString + hash;
    if (translatedPath !== originalPath) {
      // Para páginas de localización (Server Components), usar recarga completa
      // para asegurar que los datos del servidor se recarguen correctamente
      const isLocationPage = pathname.includes('alquiler-autocaravanas') || 
                            pathname.includes('rent-campervan') ||
                            pathname.includes('location-camping-car') ||
                            pathname.includes('wohnmobil-mieten') ||
                            pathname.includes('venta-autocaravanas') ||
                            pathname.includes('campervans-for-sale') ||
                            pathname.includes('camping-cars-a-vendre') ||
                            pathname.includes('wohnmobile-zu-verkaufen');
      
      // También usar recarga completa para páginas del flujo de reserva
      // para asegurar que los datos se carguen correctamente
      const isBookingPage = pathname.includes('reservar') || 
                           pathname.includes('book') ||
                           pathname.includes('reserver') ||
                           pathname.includes('buchen') ||
                           pathname.includes('buscar') ||
                           pathname.includes('search') ||
                           pathname.includes('recherche') ||
                           pathname.includes('suche');
      
      if (isLocationPage || isBookingPage || isBlogArticlePage) {
        // Recarga completa para preservar query params y recargar datos del servidor
        // Para blog, usar replace() para evitar prefetch de Next.js con URL incorrecta
        if (isBlogArticlePage) {
          // Forzar navegación inmediata sin prefetch
          setTimeout(() => {
            window.location.replace(translatedPath);
          }, 0);
        } else {
          window.location.href = translatedPath;
        }
      } else {
        // Navegación suave para páginas normales (Client Components)
        router.push(translatedPath);
      }
    }
  };

  // Función de traducción simple
  const t = (key: string): string => {
    if (language === 'es') return key;
    
    // Buscar la traducción para esta clave en el idioma actual
    const translationEntry = staticTranslations[key];
    if (translationEntry && translationEntry[language]) {
      return translationEntry[language];
    }
    
    // Si no hay traducción, devolver la clave original
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage debe ser usado dentro de un LanguageProvider');
  }
  return context;
}
