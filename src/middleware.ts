import { NextResponse, type NextRequest } from 'next/server';
import { i18n, type Locale, getLocaleFromPathname } from './lib/i18n/config';

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
// ✅ SEGURIDAD: Límites MUY generosos para no afectar uso normal
// Un usuario normal nunca alcanzará estos límites
const RATE_LIMITS: Record<string, { limit: number; window: number }> = {
  // Rutas existentes (sin cambios)
  '/api/customers': { limit: 10, window: 60 },
  '/api/bookings/create': { limit: 10, window: 60 },
  '/api/availability': { limit: 60, window: 60 },
  '/api/admin/check-auth': { limit: 30, window: 60 },
  
  // ✅ NUEVAS: Rutas de pago (límites muy generosos - solo protege contra abusos masivos)
  '/api/redsys/initiate': { limit: 30, window: 60 },       // 30 pagos/minuto (muy generoso)
  '/api/redsys/notification': { limit: 200, window: 60 },  // 200 webhooks/minuto (Redsys puede reintentar)
  '/api/stripe/initiate': { limit: 30, window: 60 },       // 30 pagos/minuto
  '/api/stripe/webhook': { limit: 200, window: 60 },       // 200 webhooks/minuto
  
  // ✅ NUEVAS: Otras APIs públicas (límites generosos)
  '/api/coupons/validate': { limit: 60, window: 60 },      // 60 validaciones/minuto
  '/api/search-tracking': { limit: 120, window: 60 },      // 120 trackings/minuto
  '/api/occupancy-highlights': { limit: 120, window: 60 }, // 120 consultas/minuto (público, con cache)
};

// ============================================
// MIDDLEWARE PRINCIPAL
// ============================================
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ============================================
  // 🛡️ BLOQUEO GEOGRÁFICO
  // ============================================
  // Vercel proporciona automáticamente la geolocalización en request.geo
  const country = request.geo?.country || 'unknown';
  
  // Bloquear China debido a tráfico no legítimo (0.68% interacción, 0s permanencia)
  const blockedCountries = ['CN'];
  
  if (blockedCountries.includes(country)) {
    return new Response('Access denied', { status: 403 });
  }

  // ✅ RATE LIMITING para APIs
  if (pathname.startsWith('/api/')) {
    const rateLimitConfig = Object.entries(RATE_LIMITS).find(([path]) => 
      pathname.startsWith(path)
    );
    
    if (rateLimitConfig) {
      const [, config] = rateLimitConfig;
      const ip = getClientIP(request);
      const key = `${ip}:${pathname}`;
      const result = checkRateLimit(key, config.limit, config.window);
      
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
      
      const response = NextResponse.next();
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return response;
    }
    
    return NextResponse.next();
  }

  // ✅ Redirigir blog URLs con categoría en idioma incorrecto → idioma que corresponde a esa categoría
  // Ejemplo: /es/blog/routes/english-slug → /en/blog/routes/english-slug (routes es categoría EN)
  // Ejemplo: /en/blog/rutas/slug → /es/blog/rutas/slug (rutas es categoría ES)
  // ⚠️ Excepción: artículos con slug en francés en /fr/blog/destinations/ no redirigir a EN (evita bucle AHREF)
  const blogCategoryMatch = pathname.match(/^\/(es|en|fr|de)\/blog\/([^/]+)\/([^/]+)\/?$/);
  if (blogCategoryMatch) {
    const [, urlLocale, category, slug] = blogCategoryMatch;
    const isFrenchSlugInDestinations = urlLocale === 'fr' && category === 'destinations' &&
      slug.includes('evenements') && slug.includes('region-de-murcie');
    if (isFrenchSlugInDestinations) {
      // Mantener en FR: artículo en francés (evita bucle fr→en→fr)
    } else {
      const categoryToLocale: Record<string, string> = {
        rutas: 'es', noticias: 'es', vehiculos: 'es', consejos: 'es', destinos: 'es', equipamiento: 'es',
        routes: 'en', news: 'en', vehicles: 'en', tips: 'en', destinations: 'en', equipment: 'en',
        itineraires: 'fr', actualites: 'fr', vehicules: 'fr', conseils: 'fr', equipement: 'fr',
        routen: 'de', nachrichten: 'de', fahrzeuge: 'de', tipps: 'de', reiseziele: 'de', ausrustung: 'de',
      };
      const correctLocale = categoryToLocale[category];
      if (correctLocale && correctLocale !== urlLocale) {
        const url = request.nextUrl.clone();
        url.pathname = `/${correctLocale}/blog/${category}/${slug}`;
        return NextResponse.redirect(url, 301);
      }
    }
  }

  // ✅ Redirigir rutas españolas bajo locale incorrecto → /es/
  // Ejemplo: /de/alquiler-casas-rodantes-murcia → /es/alquiler-casas-rodantes-murcia
  const localeMatch = pathname.match(/^\/(en|fr|de)(\/.*)/);
  if (localeMatch) {
    const [, , rest] = localeMatch;
    const spanishPrefixes = [
      '/alquiler-autocaravanas-campervans',
      '/alquiler-casas-rodantes',
      '/alquiler-motorhome',
      '/venta-autocaravanas-camper',
    ];
    if (spanishPrefixes.some(prefix => rest.startsWith(prefix))) {
      const url = request.nextUrl.clone();
      url.pathname = `/es${rest}`;
      return NextResponse.redirect(url, 301);
    }
  }

  // ✅ Limpiar "undefined" en URLs (bug legacy del LanguageProvider)
  // Ejemplo: /es/undefined/blog/rutas → /es/blog/rutas
  if (pathname.includes('/undefined/')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/\/undefined\//g, '/');
    return NextResponse.redirect(url, 301);
  }

  // ✅ Redirigir URLs con slugs de ruta incorrectos (traducciones erróneas)
  const typoRedirects: Record<string, string> = {
    '/en/area-map': '/en/areas-map',
    '/fr/carte-aires': '/fr/carte-zones',
    '/fr/reservez': '/fr/reserver',
    '/de/stellplatzkarte': '/de/gebietskarte',
    '/de/kuenstliche-intelligenz': '/de/kunstliche-intelligenz',
  };
  if (typoRedirects[pathname]) {
    const url = request.nextUrl.clone();
    url.pathname = typoRedirects[pathname];
    return NextResponse.redirect(url, 301);
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
    '/vehicle-views/',
    '/favicon',
    '/sw.js',
    '/sw-admin.js',
    '/workbox-',
    '/robots.txt',
    '/sitemap.xml',
    '/manifest.json',
    '/admin-manifest.json',
    '/icon-',
    '/icon.png',
    '/apple-icon',
    '/opengraph-image',
    '/documentos/',
    '/socket.io',
    '/__nextjs_original-stack-frame',
    '/webpack-hmr',
  ];

  // ⚠️ CRÍTICO: Admin NO debe tener i18n
  const shouldSkip = skipLocaleFor.some(path => pathname.startsWith(path)) ||
                     pathname === '/administrator' || pathname.startsWith('/administrator/') ||
                     pathname === '/admin' || pathname.startsWith('/admin/');
  
  // ⚠️ CRÍTICO: Redirigir /es/administrator → /administrator (admin NO tiene i18n)
  const locale = getLocaleFromPathname(pathname);
  if (locale && (pathname.startsWith(`/${locale}/administrator`) || pathname.startsWith(`/${locale}/admin`))) {
    const pathnameWithoutLocale = pathname.replace(new RegExp(`^/${locale}`), '');
    request.nextUrl.pathname = pathnameWithoutLocale;
    return NextResponse.redirect(request.nextUrl, { status: 301 });
  }
  
  if (!shouldSkip) {
    const locale = getLocaleFromPathname(pathname);
    
    if (locale) {
      // ✅ NUEVA ARQUITECTURA: Carpetas fijas por idioma (/es/, /en/, /fr/, /de/)
      // Next.js manejará las rutas físicas automáticamente
      // Solo pasamos headers informativos
      const response = NextResponse.next();
      response.headers.set('x-detected-locale', locale);
      response.headers.set('x-original-pathname', pathname);
      return response;
      
    } else {
      // ✅ Estrategia estable: toda URL sin locale canonicaliza a español.
      request.nextUrl.pathname = `/${i18n.defaultLocale}${pathname}`;
      return NextResponse.redirect(request.nextUrl, { status: 301 });
    }
  }

  return NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next|favicon\\.ico|images|vehicle-views|sw\\.js|robots\\.txt|sitemap\\.xml|socket\\.io|__nextjs|webpack-hmr).*)',
  ],
};
