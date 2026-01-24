"use client";

import { useEffect } from 'react';
import type { BlogRouteData } from '@/lib/blog-translations';

/**
 * Componente que inyecta los datos de rutas del blog en el DOM
 * Permite que el language switcher conozca los slugs traducidos
 * 
 * Uso:
 * <BlogRouteDataProvider data={blogRouteData} />
 */
export function BlogRouteDataProvider({ data }: { data: BlogRouteData }) {
  useEffect(() => {
    // Guardar en window para acceso global desde el header
    if (typeof window !== 'undefined') {
      (window as any).__BLOG_ROUTE_DATA__ = data;
    }
    
    // Cleanup al desmontar
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).__BLOG_ROUTE_DATA__;
      }
    };
  }, [data]);
  
  // También inyectamos como script JSON para SSR/hidratación
  return (
    <script
      id="blog-route-data"
      type="application/json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data)
      }}
    />
  );
}

/**
 * Hook para obtener los datos de ruta del blog desde el cliente
 * Retorna null si no estamos en una página de blog
 */
export function getBlogRouteData(): BlogRouteData | null {
  if (typeof window === 'undefined') return null;
  
  // Primero intentar desde window (más rápido)
  const windowData = (window as any).__BLOG_ROUTE_DATA__;
  if (windowData) return windowData;
  
  // Fallback: leer desde el script JSON
  const script = document.getElementById('blog-route-data');
  if (script) {
    try {
      return JSON.parse(script.textContent || '');
    } catch {
      return null;
    }
  }
  
  return null;
}
