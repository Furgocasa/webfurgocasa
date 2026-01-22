"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { preloadTranslations } from '@/lib/translation-service';
import { getPreloadCache, staticTranslations } from '@/lib/translations-preload';
import { getTranslatedRoute, getLanguageFromRoute } from '@/lib/route-translations';
import type { Locale } from '@/lib/i18n/config';

interface LanguageContextType {
  language: Locale;
  setLanguage: (lang: Locale) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Locale>('es');
  const router = useRouter();
  const pathname = usePathname();

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
    
    // Traducir la URL actual al nuevo idioma
    const translatedPath = getTranslatedRoute(pathname, lang);
    
    console.log('🔗 Navegando a:', translatedPath);
    
    // ✅ Navegar a la nueva ruta
    if (translatedPath !== pathname) {
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
      
      if (isLocationPage) {
        // Recarga completa para páginas de localización (Server Components)
        window.location.href = translatedPath;
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
