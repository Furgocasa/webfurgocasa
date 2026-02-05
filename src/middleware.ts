import { NextResponse, type NextRequest } from 'next/server';
import { i18n, type Locale, isValidLocale, getLocaleFromPathname } from './lib/i18n/config';

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
      // ⚠️ URL sin locale - Redirigir con prefijo
      const acceptLanguage = request.headers.get('accept-language');
      let detectedLocale: Locale = i18n.defaultLocale;
      
      if (acceptLanguage) {
        const locales = acceptLanguage.split(',').map(lang => lang.split(';')[0].trim().split('-')[0]);
        const matchedLocale = locales.find(lang => isValidLocale(lang));
        if (matchedLocale) {
          detectedLocale = matchedLocale;
        }
      }
      
      // ✅ IMPORTANTE: Redirigir SIEMPRE con prefijo de locale
      request.nextUrl.pathname = `/${detectedLocale}${pathname}`;
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
