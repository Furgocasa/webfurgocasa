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
      const restOfPath = segments.slice(1).join('/');
      return restOfPath ? `${translatedFirst}/${restOfPath}` : translatedFirst;
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
  
  // Excluir rutas especiales que no necesitan procesamiento de locale
  const skipLocaleFor = [
    '/_next/',
    '/images/',
    '/favicon.ico',
    '/sw.js',
    '/robots.txt',
    '/sitemap.xml',
    '/administrator/',
    '/admin/',
    '/socket.io/',
    '/__nextjs_original-stack-frame',
    '/webpack-hmr',
  ];

  const shouldSkip = skipLocaleFor.some(path => pathname.startsWith(path));
  
  if (!shouldSkip) {
    // Verificar si el pathname ya tiene un locale válido
    const locale = getLocaleFromPathname(pathname);
    
    if (locale) {
      // Tiene locale, hacer rewrite a la ruta sin locale
      const pathnameWithoutLocale = removeLocaleFromPathname(pathname);
      
      // ✅ TRADUCIR la ruta al español para que Next.js encuentre la página física
      // El usuario ve /fr/vehicules/slug, pero internamente servimos /vehiculos/slug
      const spanishPath = translatePathToSpanish(pathnameWithoutLocale);
      
      // Reescribir la URL internamente
      request.nextUrl.pathname = spanishPath;
      
      // ✅ OPTIMIZADO: Sin llamadas a Supabase = navegación instantánea
      return NextResponse.rewrite(request.nextUrl);
      
    } else {
      // No tiene locale, redirigir añadiendo el locale por defecto
      const acceptLanguage = request.headers.get('accept-language');
      let detectedLocale: Locale = i18n.defaultLocale;
      
      if (acceptLanguage) {
        const locales = acceptLanguage.split(',').map(lang => lang.split(';')[0].trim().split('-')[0]);
        const matchedLocale = locales.find(lang => isValidLocale(lang));
        if (matchedLocale) {
          detectedLocale = matchedLocale;
        }
      }
      
      // Redirigir a la URL con el locale
      request.nextUrl.pathname = `/${detectedLocale}${pathname}`;
      return NextResponse.redirect(request.nextUrl);
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
    '/((?!_next|favicon.ico|images|sw.js|robots.txt|sitemap.xml|socket.io|__nextjs|webpack-hmr).*)',
  ],
};



