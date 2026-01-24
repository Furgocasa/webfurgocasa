import { NextResponse, type NextRequest } from 'next/server';
import { i18n, type Locale, isValidLocale, getLocaleFromPathname, removeLocaleFromPathname } from './lib/i18n/config';

// ============================================
// TRADUCCIÓN DE RUTAS - Mapeo de rutas traducidas a español
// ============================================
// Las páginas físicas están en español, pero las URLs pueden estar en otros idiomas
// Este mapa traduce las rutas de EN/FR/DE a ES para que Next.js encuentre la página

const routeToSpanish: Record<string, string> = {
  // === INGLÉS (EN) ===
  '/book': '/reservar',
  '/book/vehicle': '/reservar/vehiculo',
  '/book/new': '/reservar/nueva',
  '/vehicle': '/vehiculo',    // Segmento individual
  '/new': '/nueva',           // Segmento individual
  '/payment': '/pago',        // Para rutas como /book/{id}/payment
  '/confirmation': '/confirmacion', // Para rutas como /book/{id}/confirmation
  '/vehicles': '/vehiculos',
  '/rates': '/tarifas',
  '/contact': '/contacto',
  '/offers': '/ofertas',
  '/sales': '/ventas',
  '/search': '/buscar',
  '/about-us': '/quienes-somos',
  '/camper-guide': '/guia-camper',
  '/artificial-intelligence': '/inteligencia-artificial',
  '/areas-map': '/mapa-areas',
  '/murcia-parking': '/parking-murcia',
  '/video-tutorials': '/video-tutoriales',
  '/vip-clients': '/clientes-vip',
  '/rental-documentation': '/documentacion-alquiler',
  '/how-it-works': '/como-funciona',
  '/weekend-booking': '/como-reservar-fin-semana',
  '/legal-notice': '/aviso-legal',
  '/privacy': '/privacidad',
  '/payment/success': '/pago/exito',
  '/payment/error': '/pago/error',
  // Blog EN
  '/blog/routes': '/blog/rutas',
  '/blog/news': '/blog/noticias',
  '/blog/vehicles': '/blog/vehiculos',
  '/blog/tips': '/blog/consejos',
  '/blog/destinations': '/blog/destinos',
  '/blog/equipment': '/blog/equipamiento',

  // === FRANCÉS (FR) ===
  '/reserver': '/reservar',
  '/reserver/vehicule': '/reservar/vehiculo',
  '/reserver/nouvelle': '/reservar/nueva',
  '/vehicule': '/vehiculo',    // Segmento individual FR
  '/nouvelle': '/nueva',       // Segmento individual FR
  '/paiement': '/pago',        // Para rutas como /reserver/{id}/paiement
  // '/confirmation' ya es igual en FR
  '/vehicules': '/vehiculos',
  '/tarifs': '/tarifas',
  // '/contact' ya es igual
  '/offres': '/ofertas',
  '/ventes': '/ventas',
  '/recherche': '/buscar',
  '/a-propos': '/quienes-somos',
  '/guide-camping-car': '/guia-camper',
  '/intelligence-artificielle': '/inteligencia-artificial',
  '/carte-zones': '/mapa-areas',
  '/parking-murcie': '/parking-murcia',
  '/tutoriels-video': '/video-tutoriales',
  '/clients-vip': '/clientes-vip',
  '/documentation-location': '/documentacion-alquiler',
  '/comment-ca-marche': '/como-funciona',
  '/reservation-weekend': '/como-reservar-fin-semana',
  '/mentions-legales': '/aviso-legal',
  '/confidentialite': '/privacidad',
  '/paiement/succes': '/pago/exito',
  '/paiement/erreur': '/pago/error',
  // Blog FR
  '/blog/itineraires': '/blog/rutas',
  '/blog/actualites': '/blog/noticias',
  '/blog/vehicules': '/blog/vehiculos',
  '/blog/conseils': '/blog/consejos',
  // '/blog/destinations' ya es igual en FR
  '/blog/equipement': '/blog/equipamiento',

  // === ALEMÁN (DE) ===
  '/buchen': '/reservar',
  '/buchen/fahrzeug': '/reservar/vehiculo',
  '/buchen/neu': '/reservar/nueva',
  '/fahrzeug': '/vehiculo',     // Segmento individual DE
  '/neu': '/nueva',             // Segmento individual DE
  '/zahlung': '/pago',          // Para rutas como /buchen/{id}/zahlung
  '/bestaetigung': '/confirmacion', // Para rutas como /buchen/{id}/bestaetigung
  '/fahrzeuge': '/vehiculos',
  '/preise': '/tarifas',
  '/kontakt': '/contacto',
  '/angebote': '/ofertas',
  '/verkauf': '/ventas',
  '/suche': '/buscar',
  '/uber-uns': '/quienes-somos',
  '/wohnmobil-guide': '/guia-camper',
  '/kunstliche-intelligenz': '/inteligencia-artificial',
  '/gebietskarte': '/mapa-areas',
  '/parkplatz-murcia': '/parking-murcia',
  '/video-anleitungen': '/video-tutoriales',
  '/vip-kunden': '/clientes-vip',
  '/mietdokumentation': '/documentacion-alquiler',
  '/wie-es-funktioniert': '/como-funciona',
  '/wochenend-buchung': '/como-reservar-fin-semana',
  '/impressum': '/aviso-legal',
  '/datenschutz': '/privacidad',
  '/zahlung/erfolg': '/pago/exito',
  '/zahlung/fehler': '/pago/error',
  // Blog DE
  '/blog/routen': '/blog/rutas',
  '/blog/nachrichten': '/blog/noticias',
  '/blog/fahrzeuge': '/blog/vehiculos',
  '/blog/tipps': '/blog/consejos',
  '/blog/reiseziele': '/blog/destinos',
  '/blog/ausrustung': '/blog/equipamiento',
};

/**
 * Traduce una ruta de cualquier idioma a español (para encontrar la página física)
 * Ejemplo: /vehicles/dreamer-d55 -> /vehiculos/dreamer-d55
 * Ejemplo con ID: /book/abc123/payment -> /reservar/abc123/pago
 */
function translatePathToSpanish(pathname: string): string {
  // Buscar coincidencia exacta primero
  if (routeToSpanish[pathname]) {
    return routeToSpanish[pathname];
  }

  // Buscar coincidencia por segmentos (para rutas con slug dinámico)
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length >= 1) {
    const firstSegment = '/' + segments[0];
    
    // Si el primer segmento tiene traducción
    if (routeToSpanish[firstSegment]) {
      const translatedFirst = routeToSpanish[firstSegment];
      
      // Si hay más segmentos, también intentar traducirlos
      if (segments.length > 1) {
        const translatedSegments = [translatedFirst.substring(1)]; // Sin la barra inicial
        
        for (let i = 1; i < segments.length; i++) {
          const segment = segments[i];
          const segmentAsPath = '/' + segment;
          
          // Intentar traducir cada segmento individual
          if (routeToSpanish[segmentAsPath]) {
            translatedSegments.push(routeToSpanish[segmentAsPath].substring(1));
          } else {
            // Si no tiene traducción, mantener el segmento original (ej: IDs)
            translatedSegments.push(segment);
          }
        }
        
        return '/' + translatedSegments.join('/');
      }
      
      return translatedFirst;
    }

    // Para rutas de blog con categoría y slug
    if (segments[0] === 'blog' && segments.length >= 2) {
      const blogCategory = '/blog/' + segments[1];
      if (routeToSpanish[blogCategory]) {
        const translatedCategory = routeToSpanish[blogCategory];
        const articleSlug = segments.slice(2).join('/');
        return articleSlug ? `${translatedCategory}/${articleSlug}` : translatedCategory;
      }
    }
  }

  // Si no hay traducción, devolver el pathname original
  return pathname;
}

// ============================================
// CORRECCIÓN DE URLs CON IDIOMA INCORRECTO
// ============================================
// Mapeo de rutas españolas a sus traducciones en cada idioma
const routesByLocale: Record<string, Record<Locale, string>> = {
  // Rutas principales
  '/vehiculos': { es: '/vehiculos', en: '/vehicles', fr: '/vehicules', de: '/fahrzeuge' },
  '/reservar': { es: '/reservar', en: '/book', fr: '/reserver', de: '/buchen' },
  '/tarifas': { es: '/tarifas', en: '/rates', fr: '/tarifs', de: '/preise' },
  '/contacto': { es: '/contacto', en: '/contact', fr: '/contact', de: '/kontakt' },
  '/ofertas': { es: '/ofertas', en: '/offers', fr: '/offres', de: '/angebote' },
  '/ventas': { es: '/ventas', en: '/sales', fr: '/ventes', de: '/verkauf' },
  '/buscar': { es: '/buscar', en: '/search', fr: '/recherche', de: '/suche' },
  '/blog': { es: '/blog', en: '/blog', fr: '/blog', de: '/blog' },
  
  // Páginas informativas
  '/quienes-somos': { es: '/quienes-somos', en: '/about-us', fr: '/a-propos', de: '/uber-uns' },
  '/guia-camper': { es: '/guia-camper', en: '/camper-guide', fr: '/guide-camping-car', de: '/wohnmobil-guide' },
  '/inteligencia-artificial': { es: '/inteligencia-artificial', en: '/artificial-intelligence', fr: '/intelligence-artificielle', de: '/kunstliche-intelligenz' },
  '/mapa-areas': { es: '/mapa-areas', en: '/areas-map', fr: '/carte-zones', de: '/gebietskarte' },
  '/parking-murcia': { es: '/parking-murcia', en: '/murcia-parking', fr: '/parking-murcie', de: '/parkplatz-murcia' },
  '/video-tutoriales': { es: '/video-tutoriales', en: '/video-tutorials', fr: '/tutoriels-video', de: '/video-anleitungen' },
  '/clientes-vip': { es: '/clientes-vip', en: '/vip-clients', fr: '/clients-vip', de: '/vip-kunden' },
  '/documentacion-alquiler': { es: '/documentacion-alquiler', en: '/rental-documentation', fr: '/documentation-location', de: '/mietdokumentation' },
  '/como-funciona': { es: '/como-funciona', en: '/how-it-works', fr: '/comment-ca-marche', de: '/wie-es-funktioniert' },
  '/como-reservar-fin-semana': { es: '/como-reservar-fin-semana', en: '/weekend-booking', fr: '/reservation-weekend', de: '/wochenend-buchung' },
  '/aviso-legal': { es: '/aviso-legal', en: '/legal-notice', fr: '/mentions-legales', de: '/impressum' },
  '/privacidad': { es: '/privacidad', en: '/privacy', fr: '/confidentialite', de: '/datenschutz' },
  '/cookies': { es: '/cookies', en: '/cookies', fr: '/cookies', de: '/cookies' },
  '/faqs': { es: '/faqs', en: '/faqs', fr: '/faqs', de: '/faqs' },
  '/sitemap-html': { es: '/sitemap-html', en: '/sitemap-html', fr: '/sitemap-html', de: '/sitemap-html' },
  '/publicaciones': { es: '/publicaciones', en: '/publications', fr: '/publications', de: '/publikationen' },
  '/alquiler-motorhome-europa-desde-espana': { es: '/alquiler-motorhome-europa-desde-espana', en: '/alquiler-motorhome-europa-desde-espana', fr: '/alquiler-motorhome-europa-desde-espana', de: '/alquiler-motorhome-europa-desde-espana' },
  
  // Segmentos individuales para rutas compuestas
  '/vehiculo': { es: '/vehiculo', en: '/vehicle', fr: '/vehicule', de: '/fahrzeug' },
  '/nueva': { es: '/nueva', en: '/new', fr: '/nouvelle', de: '/neu' },
  '/pago': { es: '/pago', en: '/payment', fr: '/paiement', de: '/zahlung' },
  '/confirmacion': { es: '/confirmacion', en: '/confirmation', fr: '/confirmation', de: '/bestaetigung' },
  
  // Categorías de blog
  '/blog/rutas': { es: '/blog/rutas', en: '/blog/routes', fr: '/blog/itineraires', de: '/blog/routen' },
  '/blog/noticias': { es: '/blog/noticias', en: '/blog/news', fr: '/blog/actualites', de: '/blog/nachrichten' },
  '/blog/vehiculos': { es: '/blog/vehiculos', en: '/blog/vehicles', fr: '/blog/vehicules', de: '/blog/fahrzeuge' },
  '/blog/consejos': { es: '/blog/consejos', en: '/blog/tips', fr: '/blog/conseils', de: '/blog/tipps' },
  '/blog/destinos': { es: '/blog/destinos', en: '/blog/destinations', fr: '/blog/destinations', de: '/blog/reiseziele' },
  '/blog/equipamiento': { es: '/blog/equipamiento', en: '/blog/equipment', fr: '/blog/equipement', de: '/blog/ausrustung' },
};

/**
 * Obtiene la URL correcta según el idioma detectado
 * Si la URL usa segmentos de otro idioma, devuelve la URL corregida
 * Ejemplo: /de/vehicles/slug → /de/fahrzeuge/slug
 * Ejemplo: /fr/reserver/vehiculo → /fr/reserver/vehicule
 */
function getCorrectUrlForLocale(pathname: string, locale: Locale): string | null {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length < 1) return null;
  
  let needsRedirect = false;
  const correctedSegments: string[] = [];
  
  for (const segment of segments) {
    const segmentAsPath = '/' + segment;
    
    // Buscar qué ruta española corresponde a este segmento
    let spanishRoute: string | null = null;
    
    // Primero verificar si es una ruta española directa
    if (routesByLocale[segmentAsPath]) {
      spanishRoute = segmentAsPath;
    } else {
      // Buscar en las traducciones de otros idiomas
      for (const [esRoute, translations] of Object.entries(routesByLocale)) {
        // Solo buscar en rutas de un segmento
        if (esRoute.split('/').filter(Boolean).length !== 1) continue;
        
        for (const [, translation] of Object.entries(translations)) {
          if (translation === segmentAsPath) {
            spanishRoute = esRoute;
            break;
          }
        }
        if (spanishRoute) break;
      }
    }
    
    if (spanishRoute && routesByLocale[spanishRoute]) {
      // Este segmento tiene traducción
      const correctSegment = routesByLocale[spanishRoute][locale];
      const correctSegmentClean = correctSegment.substring(1); // Sin la barra inicial
      
      if (segment !== correctSegmentClean) {
        // El segmento no es correcto para este idioma
        needsRedirect = true;
        correctedSegments.push(correctSegmentClean);
      } else {
        correctedSegments.push(segment);
      }
    } else {
      // No tiene traducción conocida (ej: IDs, slugs dinámicos)
      correctedSegments.push(segment);
    }
  }
  
  if (!needsRedirect) return null;
  
  return '/' + correctedSegments.join('/');
}

// ============================================
// RATE LIMITING - Inline para Edge Runtime
// ============================================
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();
let lastCleanup = Date.now();

function cleanupExpiredEntries() {
  const now = Date.now();
  if (now - lastCleanup < 60000) return;
  lastCleanup = now;
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}

function checkRateLimit(identifier: string, limit: number, windowSeconds: number) {
  cleanupExpiredEntries();
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const existing = rateLimitStore.get(identifier);
  
  if (!existing || existing.resetTime < now) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs });
    return { success: true, remaining: limit - 1, reset: now + windowMs, limit };
  }
  
  existing.count += 1;
  const success = existing.count <= limit;
  return {
    success,
    remaining: Math.max(0, limit - existing.count),
    reset: existing.resetTime,
    limit,
  };
}

function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0].trim() 
    || request.headers.get('cf-connecting-ip') 
    || request.headers.get('x-real-ip') 
    || 'unknown';
}

// Configuración de rate limits por ruta
const RATE_LIMITS: Record<string, { limit: number; window: number }> = {
  '/api/customers': { limit: 10, window: 60 },          // 10 req/min
  '/api/bookings/create': { limit: 10, window: 60 },    // 10 req/min
  '/api/availability': { limit: 60, window: 60 },       // 60 req/min
  '/api/admin/check-auth': { limit: 30, window: 60 },   // 30 req/min
};

// ============================================
// MIDDLEWARE PRINCIPAL
// ============================================
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ✅ RATE LIMITING para APIs
  if (pathname.startsWith('/api/')) {
    // Buscar si esta ruta tiene rate limit configurado
    const rateLimitConfig = Object.entries(RATE_LIMITS).find(([path]) => 
      pathname.startsWith(path)
    );
    
    if (rateLimitConfig) {
      const [, config] = rateLimitConfig;
      const ip = getClientIP(request);
      const key = `${ip}:${pathname}`;
      const result = checkRateLimit(key, config.limit, config.window);
      
      // Headers de rate limit informativos
      const headers = {
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': Math.ceil(result.reset / 1000).toString(),
      };
      
      if (!result.success) {
        return NextResponse.json(
          { 
            error: 'Demasiadas solicitudes. Por favor, espera un momento.',
            retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
          },
          { 
            status: 429,
            headers: {
              ...headers,
              'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
            },
          }
        );
      }
      
      // Continuar con headers de rate limit
      const response = NextResponse.next();
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return response;
    }
    
    // API sin rate limit específico, continuar
    return NextResponse.next();
  }

  // ✅ Normalizar URLs legacy con index.php (SEO)
  if (pathname.startsWith('/index.php')) {
    const normalizedPath = pathname.replace(/^\/index\.php/, '') || '/';
    request.nextUrl.pathname = normalizedPath || '/';
    return NextResponse.redirect(request.nextUrl, { status: 301 });
  }
  
  // Excluir rutas especiales que no necesitan procesamiento de locale
  const skipLocaleFor = [
    '/_next/',
    '/images/',
    '/favicon',
    '/sw.js',
    '/sw-admin.js',  // Service Worker del admin
    '/workbox-',     // Archivos workbox generados por next-pwa
    '/robots.txt',
    '/sitemap.xml',
    '/manifest.json',
    '/admin-manifest.json',
    '/icon-',        // Iconos PWA
    '/icon.png',
    '/apple-icon',
    '/opengraph-image',
    '/documentos/',
    '/socket.io',    // WebSocket connections
    '/__nextjs_original-stack-frame',
    '/webpack-hmr',
  ];

  // ⚠️ CRÍTICO: Admin NO debe tener i18n - excluir tanto /administrator como /administrator/*
  const shouldSkip = skipLocaleFor.some(path => pathname.startsWith(path)) ||
                     pathname === '/administrator' || pathname.startsWith('/administrator/') ||
                     pathname === '/admin' || pathname.startsWith('/admin/');
  
  // ⚠️ CRÍTICO: Redirigir /es/administrator → /administrator (admin NO tiene i18n)
  // El área de administrador NUNCA debe tener prefijo de idioma
  const locale = getLocaleFromPathname(pathname);
  if (locale && (pathname.startsWith(`/${locale}/administrator`) || pathname.startsWith(`/${locale}/admin`))) {
    // Remover el prefijo de idioma del área admin
    const pathnameWithoutLocale = removeLocaleFromPathname(pathname);
    request.nextUrl.pathname = pathnameWithoutLocale;
    return NextResponse.redirect(request.nextUrl, { status: 301 });
  }
  
  if (!shouldSkip) {
    // Verificar si el pathname ya tiene un locale válido
    const locale = getLocaleFromPathname(pathname);
    
    if (locale) {
      // Tiene locale en la URL
      const pathnameWithoutLocale = removeLocaleFromPathname(pathname);
      
      // ✅ VERIFICAR si la URL usa los segmentos correctos para el idioma
      // Si no, redirigir a la URL correcta (ej: /de/vehicles/slug → /de/fahrzeuge/slug)
      const correctPath = getCorrectUrlForLocale(pathnameWithoutLocale, locale);
      if (correctPath) {
        // La URL no usa los segmentos correctos para este idioma, redirigir
        request.nextUrl.pathname = `/${locale}${correctPath}`;
        return NextResponse.redirect(request.nextUrl, { status: 301 });
      }
      
      // ✅ NUEVA ARQUITECTURA: Páginas con [locale] físico
      // Para estas páginas, simplemente pasar el locale como header sin rewrite
      // Next.js las manejará con la carpeta [locale]/
      
      // ⚠️ EXCEPCIÓN: Páginas de localización (alquiler/venta) que usan patrón especial
      // Estas NO usan [locale], siguen con su propio sistema de detección
      const isLocationPage = 
        pathnameWithoutLocale.match(/^\/alquiler-autocaravanas-campervans-/) ||
        pathnameWithoutLocale.match(/^\/rent-campervan-motorhome-/) ||
        pathnameWithoutLocale.match(/^\/location-camping-car-/) ||
        pathnameWithoutLocale.match(/^\/wohnmobil-mieten-/) ||
        pathnameWithoutLocale.match(/^\/venta-autocaravanas-camper-/) ||
        pathnameWithoutLocale.match(/^\/campervans-for-sale-in-/) ||
        pathnameWithoutLocale.match(/^\/camping-cars-a-vendre-/) ||
        pathnameWithoutLocale.match(/^\/wohnmobile-zu-verkaufen-/);
      
      if (isLocationPage) {
        // Páginas de localización: hacer rewrite a la ruta fija /location-target
        // Next.js servirá desde src/app/(location-pages)/location-target/page.tsx
        request.nextUrl.pathname = '/location-target';
        const response = NextResponse.rewrite(request.nextUrl);
        response.headers.set('x-detected-locale', locale);
        response.headers.set('x-original-pathname', pathname);
        response.headers.set('x-location-param', pathnameWithoutLocale);
        return response;
      }
      
      // Para el resto de páginas: dejar que Next.js maneje [locale] naturalmente
      // Solo pasamos el locale como header para componentes que lo necesiten
      const response = NextResponse.next();
      response.headers.set('x-detected-locale', locale);
      response.headers.set('x-original-pathname', pathname);
      
      return response;
      
    } else {
      // ⚠️ CRÍTICO: No tiene locale en la URL - SIEMPRE redirigir con prefijo /es/ para SEO
      // Esto preserva las URLs indexadas en Google que incluyen /es/
      const acceptLanguage = request.headers.get('accept-language');
      let detectedLocale: Locale = i18n.defaultLocale;
      
      if (acceptLanguage) {
        const locales = acceptLanguage.split(',').map(lang => lang.split(';')[0].trim().split('-')[0]);
        const matchedLocale = locales.find(lang => isValidLocale(lang));
        if (matchedLocale) {
          detectedLocale = matchedLocale;
        }
      }
      
      // ✅ IMPORTANTE: Redirigir SIEMPRE con prefijo de locale, incluido /es/
      // Esto asegura que todas las URLs tengan el formato:
      // - /es/vehiculos (español)
      // - /en/vehicles (inglés)
      // - /fr/vehicules (francés)
      // - /de/fahrzeuge (alemán)
      request.nextUrl.pathname = `/${detectedLocale}${pathname}`;
      return NextResponse.redirect(request.nextUrl, { status: 301 });
    }
  }

  // ✅ OPTIMIZADO: Para rutas omitidas, continuar sin procesamiento adicional
  return NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths:
     * - /api/* para rate limiting
     * - Todas las demás rutas para i18n (excepto estáticos)
     */
    '/api/:path*',
    '/((?!_next|favicon\\.ico|images|sw\\.js|robots\\.txt|sitemap\\.xml|socket\\.io|__nextjs|webpack-hmr).*)',
  ],
};



