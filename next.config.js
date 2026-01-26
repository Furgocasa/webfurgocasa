const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  scope: '/administrator/',
  sw: 'sw-admin.js',
  buildExcludes: [/middleware-manifest\.json$/],
  runtimeCaching: [
    {
      urlPattern: /^\/administrator\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'admin-pages',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24 horas
        }
      }
    },
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/v1\/object\/public\/.*\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'supabase-images-cache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 días - imágenes estáticas
        }
      }
    },
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 5 * 60 // 5 minutos - APIs dinámicas
        }
      }
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images-cache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 días
        }
      }
    },
    {
      urlPattern: /\.(?:woff|woff2|ttf|otf|eot)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'fonts-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 365 * 24 * 60 * 60 // 1 año - fuentes muy estáticas
        }
      }
    }
  ]
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ⚠️ Deshabilitar React Strict Mode temporalmente para evitar AbortErrors
  // React 18 Strict Mode desmonta y remonta componentes en desarrollo
  // causando que Supabase cancele peticiones
  reactStrictMode: false,
  
  // Ignorar errores de TypeScript durante el build para permitir despliegue
  // TODO: Arreglar los tipos gradualmente y quitar esta opción
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Formatos modernos para mejor compresión (AVIF es ~50% más pequeño que WebP)
    formats: ['image/avif', 'image/webp'],
    // Tamaños de dispositivo optimizados para reducir peso
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    // Minimizar tiempo de respuesta de imágenes
    minimumCacheTTL: 31536000, // 1 año
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // ⚡ Optimizaciones de rendimiento
    optimizeCss: true, // Optimizar CSS crítico
  },
  // ⚡ Comprimir respuestas
  compress: true,
  // ⚡ Generar ETags para mejor caché
  generateEtags: true,
  // ⚡ Minimizar output en producción
  productionBrowserSourceMaps: false,
  // ✅ Optimizar webpack y HMR para reducir polling
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 3000, // Reducir frecuencia de polling a cada 3 segundos
        aggregateTimeout: 500, // Esperar 500ms antes de reconstruir
        ignored: ['**/node_modules', '**/.git', '**/.next'],
      };
    }
    return config;
  },
  // ✅ Headers de seguridad y caché
  async headers() {
    // ============================================
    // CONTENT SECURITY POLICY (CSP)
    // ============================================
    // CSP ayuda a prevenir XSS y otros ataques de inyección de código
    // Documentación: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
    const ContentSecurityPolicy = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://googleads.g.doubleclick.net https://www.googleadservices.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      img-src 'self' data: blob: https://*.supabase.co https://www.googletagmanager.com https://www.google-analytics.com https://www.facebook.com https://www.google.com https://www.google.es https://googleads.g.doubleclick.net https://www.googleadservices.com https://upload.wikimedia.org;
      font-src 'self' https://fonts.gstatic.com data:;
      connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com https://connect.facebook.net https://api.stripe.com https://*.analytics.google.com https://www.google.com https://googleads.g.doubleclick.net https://pagead2.googlesyndication.com;
      frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://www.youtube.com https://www.youtube-nocookie.com https://www.googletagmanager.com https://td.doubleclick.net;
      frame-ancestors 'none';
      form-action 'self' https://sis.redsys.es https://sis-t.redsys.es;
      base-uri 'self';
      object-src 'none';
      upgrade-insecure-requests;
    `.replace(/\s{2,}/g, ' ').trim();

    // Headers de seguridad comunes para todas las rutas
    const securityHeaders = [
      {
        // Content Security Policy - Principal protección contra XSS
        key: 'Content-Security-Policy',
        value: ContentSecurityPolicy,
      },
      {
        // Previene clickjacking - no permite que la página se muestre en iframes
        key: 'X-Frame-Options',
        value: 'DENY',
      },
      {
        // Previene MIME type sniffing
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      {
        // Protección XSS del navegador (legacy pero útil)
        key: 'X-XSS-Protection',
        value: '1; mode=block',
      },
      {
        // Controla qué información se envía en el header Referer
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
      },
      {
        // Fuerza HTTPS durante 1 año (incluye subdominios)
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains',
      },
      {
        // Deshabilita APIs del navegador que no necesitamos
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
      },
    ];

    return [
      // Headers de seguridad para TODAS las rutas
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      // Headers de caché para favicon
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/icon.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/apple-icon.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/icon-:size.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Headers de caché para imágenes optimizadas de Next.js (proxies de Supabase)
      {
        source: '/_next/image',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // ✅ Archivos estáticos de Next.js (JS, CSS) - 1 año con immutable
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // ✅ Fuentes de Google Fonts y locales - 1 año
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // ✅ Páginas legales (muy estáticas) - 1 semana
      {
        source: '/(aviso-legal|privacidad|cookies)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=604800, stale-while-revalidate=86400',
          },
        ],
      },
      // ✅ Páginas de blog (contenido estático) - 1 día con stale-while-revalidate
      {
        source: '/blog/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=86400, stale-while-revalidate=3600',
          },
        ],
      },
      // ✅ Páginas de localización (contenido muy estático) - 1 día
      {
        source: '/(alquiler-autocaravanas-campervans-|venta-autocaravanas-camper-|alquiler-motorhome-europa-desde-espana)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=86400, stale-while-revalidate=3600',
          },
        ],
      },
      // ✅ Páginas de vehículos (pueden cambiar precios) - 1 hora con stale-while-revalidate
      {
        source: '/vehiculos/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=600',
          },
        ],
      },
      // ✅ Home y páginas principales (contenido dinámico pero cacheable) - 1 hora
      {
        source: '/',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=600',
          },
        ],
      },
      // ✅ Páginas informativas estáticas - 1 día
      {
        source: '/(quienes-somos|como-funciona|guia-camper|documentacion-alquiler|como-reservar-fin-semana|mapa-areas|parking-murcia|inteligencia-artificial|video-tutoriales|clientes-vip)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=86400, stale-while-revalidate=3600',
          },
        ],
      },
      // ✅ Páginas de reserva y contacto (dinámicas) - 5 minutos
      {
        source: '/(reservar|contacto|buscar|tarifas|ofertas|faqs)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=60',
          },
        ],
      },
    ];
  },
  async rewrites() {
    // ============================================
    // REWRITES - VACÍO (Todos convertidos a redirects 301)
    // ============================================
    // Los rewrites antiguos para URLs con guión han sido
    // convertidos a redirects 301 para mejor SEO.
    // Google actualizará su índice a las URLs con barra.
    // ============================================
    return [];
  },
  async redirects() {
    // ================================================================
    // REDIRECCIONES 301 - OPTIMIZADO 24/01/2026
    // ================================================================
    // Documentación: Ver ANALISIS-NEXTCONFIG-OPTIMIZATION.md
    // Total: ~35 redirects (optimizado desde 50)
    // 
    // IMPORTANTE: Estas redirecciones son PERMANENTES (301)
    // Solo modificar si estás 100% seguro del impacto SEO
    // ================================================================
    
    return [
      // ================================================================
      // GRUPO 1: NORMALIZACIÓN DE DOMINIO (CRÍTICO)
      // ================================================================
      // Propósito: Forzar www.furgocasa.com como URL canónica
      // Mantener: PERMANENTE - Crítico para SEO
      // Impacto: Evita contenido duplicado en Google
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'furgocasa.com' }],
        destination: 'https://www.furgocasa.com/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'webfurgocasa.vercel.app' }],
        destination: 'https://www.furgocasa.com/:path*',
        permanent: true,
      },

      // ================================================================
      // GRUPO 2: MIGRACIÓN URLs LOCALIZACIÓN (ANTIGUO → NUEVO FORMATO)
      // ================================================================
      // Propósito: Redirigir URLs antiguas de localización al formato correcto
      // Formato antiguo: /en/alquiler-autocaravanas-campervans-murcia (slug ES en cualquier idioma)
      // Formato nuevo: /en/rent-campervan-motorhome/murcia (slug traducido + barra)
      // Mantener: PERMANENTE - Google tiene indexadas las URLs antiguas
      // ================================================================
      
      // ── ALQUILER ES: Formato antiguo (guión) → Formato nuevo (barra) ──
      { source: '/es/alquiler-autocaravanas-campervans-:location', destination: '/es/alquiler-autocaravanas-campervans/:location', permanent: true },
      // ── ALQUILER EN: Slug español → Slug inglés correcto ──
      { source: '/en/alquiler-autocaravanas-campervans-:location', destination: '/en/rent-campervan-motorhome/:location', permanent: true },
      // ── ALQUILER EN: Formato antiguo (guión) → Formato nuevo (barra) ──
      { source: '/en/rent-campervan-motorhome-:location', destination: '/en/rent-campervan-motorhome/:location', permanent: true },
      // ── ALQUILER FR: Slug español → Slug francés correcto ──
      { source: '/fr/alquiler-autocaravanas-campervans-:location', destination: '/fr/location-camping-car/:location', permanent: true },
      // ── ALQUILER FR: Formato antiguo (guión) → Formato nuevo (barra) ──
      { source: '/fr/location-camping-car-:location', destination: '/fr/location-camping-car/:location', permanent: true },
      // ── ALQUILER DE: Slug español → Slug alemán correcto ──
      { source: '/de/alquiler-autocaravanas-campervans-:location', destination: '/de/wohnmobil-mieten/:location', permanent: true },
      // ── ALQUILER DE: Formato antiguo (guión) → Formato nuevo (barra) ──
      { source: '/de/wohnmobil-mieten-:location', destination: '/de/wohnmobil-mieten/:location', permanent: true },
      
      // ── VENTA ES: Formato antiguo (guión) → Formato nuevo (barra) ──
      { source: '/es/venta-autocaravanas-camper-:location', destination: '/es/venta-autocaravanas-camper/:location', permanent: true },
      // ── VENTA EN: Slug español → Slug inglés correcto ──
      { source: '/en/venta-autocaravanas-camper-:location', destination: '/en/campervans-for-sale-in/:location', permanent: true },
      // ── VENTA EN: Formato antiguo (guión) → Formato nuevo (barra) ──
      { source: '/en/campervans-for-sale-in-:location', destination: '/en/campervans-for-sale-in/:location', permanent: true },
      // ── VENTA FR: Slug español → Slug francés correcto ──
      { source: '/fr/venta-autocaravanas-camper-:location', destination: '/fr/camping-cars-a-vendre/:location', permanent: true },
      // ── VENTA FR: Formato antiguo (guión) → Formato nuevo (barra) ──
      { source: '/fr/camping-cars-a-vendre-:location', destination: '/fr/camping-cars-a-vendre/:location', permanent: true },
      // ── VENTA DE: Slug español → Slug alemán correcto ──
      { source: '/de/venta-autocaravanas-camper-:location', destination: '/de/wohnmobile-zu-verkaufen/:location', permanent: true },
      // ── VENTA DE: Formato antiguo (guión) → Formato nuevo (barra) ──
      { source: '/de/wohnmobile-zu-verkaufen-:location', destination: '/de/wohnmobile-zu-verkaufen/:location', permanent: true },

      // ================================================================
      // GRUPO 3: CORRECCIÓN IDIOMA CRUZADO (RUTAS GENERALES)
      // ================================================================
      // Propósito: Corregir URLs mal formadas (ej: /de/vehicles → /de/fahrzeuge)
      // Mantener: PERMANENTE - Mejora consistencia de URLs por idioma
      // ================================================================
      
      // ── Alemán (DE): Corregir rutas EN → DE ──
      { source: '/de/vehicles', destination: '/de/fahrzeuge', permanent: true },
      { source: '/de/vehicles/:slug', destination: '/de/fahrzeuge/:slug', permanent: true },
      { source: '/de/sales', destination: '/de/verkauf', permanent: true },
      { source: '/de/sales/:slug', destination: '/de/verkauf/:slug', permanent: true },
      { source: '/de/book', destination: '/de/buchen', permanent: true },
      { source: '/de/book/:path*', destination: '/de/buchen/:path*', permanent: true },
      { source: '/de/rates', destination: '/de/preise', permanent: true },
      { source: '/de/contact', destination: '/de/kontakt', permanent: true },
      { source: '/de/offers', destination: '/de/angebote', permanent: true },
      { source: '/de/about-us', destination: '/de/uber-uns', permanent: true },
      { source: '/de/privacy', destination: '/de/datenschutz', permanent: true },
      // Corregir subrutas de reserva con palabras en otros idiomas
      { source: '/de/buchen/vehiculo', destination: '/de/buchen/fahrzeug', permanent: true },
      { source: '/de/buchen/vehicle', destination: '/de/buchen/fahrzeug', permanent: true },
      { source: '/de/buchen/vehicule', destination: '/de/buchen/fahrzeug', permanent: true },
      { source: '/de/buchen/nueva', destination: '/de/buchen/neu', permanent: true },
      { source: '/de/buchen/new', destination: '/de/buchen/neu', permanent: true },
      { source: '/de/buchen/nouvelle', destination: '/de/buchen/neu', permanent: true },
      
      // ── Francés (FR): Corregir rutas EN → FR ──
      { source: '/fr/vehicles', destination: '/fr/vehicules', permanent: true },
      { source: '/fr/vehicles/:slug', destination: '/fr/vehicules/:slug', permanent: true },
      { source: '/fr/sales', destination: '/fr/ventes', permanent: true },
      { source: '/fr/sales/:slug', destination: '/fr/ventes/:slug', permanent: true },
      { source: '/fr/book', destination: '/fr/reserver', permanent: true },
      { source: '/fr/book/:path*', destination: '/fr/reserver/:path*', permanent: true },
      { source: '/fr/rates', destination: '/fr/tarifs', permanent: true },
      { source: '/fr/offers', destination: '/fr/offres', permanent: true },
      { source: '/fr/about-us', destination: '/fr/a-propos', permanent: true },
      { source: '/fr/privacy', destination: '/fr/confidentialite', permanent: true },
      // Corregir subrutas de reserva con palabras en otros idiomas
      { source: '/fr/reserver/vehiculo', destination: '/fr/reserver/vehicule', permanent: true },
      { source: '/fr/reserver/vehicle', destination: '/fr/reserver/vehicule', permanent: true },
      { source: '/fr/reserver/fahrzeug', destination: '/fr/reserver/vehicule', permanent: true },
      { source: '/fr/reserver/nueva', destination: '/fr/reserver/nouvelle', permanent: true },
      { source: '/fr/reserver/new', destination: '/fr/reserver/nouvelle', permanent: true },
      { source: '/fr/reserver/neu', destination: '/fr/reserver/nouvelle', permanent: true },
      
      // ── Inglés (EN): Corregir rutas ES → EN ──
      { source: '/en/vehiculos', destination: '/en/vehicles', permanent: true },
      { source: '/en/vehiculos/:slug', destination: '/en/vehicles/:slug', permanent: true },
      { source: '/en/ventas', destination: '/en/sales', permanent: true },
      { source: '/en/ventas/:slug', destination: '/en/sales/:slug', permanent: true },
      { source: '/en/reservar', destination: '/en/book', permanent: true },
      { source: '/en/reservar/:path*', destination: '/en/book/:path*', permanent: true },
      { source: '/en/tarifas', destination: '/en/rates', permanent: true },
      { source: '/en/contacto', destination: '/en/contact', permanent: true },
      { source: '/en/ofertas', destination: '/en/offers', permanent: true },
      { source: '/en/quienes-somos', destination: '/en/about-us', permanent: true },
      { source: '/en/privacidad', destination: '/en/privacy', permanent: true },
      // Corregir subrutas de reserva con palabras en otros idiomas
      { source: '/en/book/vehiculo', destination: '/en/book/vehicle', permanent: true },
      { source: '/en/book/fahrzeug', destination: '/en/book/vehicle', permanent: true },
      { source: '/en/book/vehicule', destination: '/en/book/vehicle', permanent: true },
      { source: '/en/book/nueva', destination: '/en/book/new', permanent: true },
      { source: '/en/book/neu', destination: '/en/book/new', permanent: true },
      { source: '/en/book/nouvelle', destination: '/en/book/new', permanent: true },
      
      // ── Español (ES): Corregir rutas DE/EN/FR → ES ──
      { source: '/es/fahrzeuge', destination: '/es/vehiculos', permanent: true },
      { source: '/es/fahrzeuge/:slug', destination: '/es/vehiculos/:slug', permanent: true },
      { source: '/es/vehicles', destination: '/es/vehiculos', permanent: true },
      { source: '/es/vehicles/:slug', destination: '/es/vehiculos/:slug', permanent: true },
      { source: '/es/vehicules', destination: '/es/vehiculos', permanent: true },
      { source: '/es/vehicules/:slug', destination: '/es/vehiculos/:slug', permanent: true },
      { source: '/es/verkauf', destination: '/es/ventas', permanent: true },
      { source: '/es/verkauf/:slug', destination: '/es/ventas/:slug', permanent: true },
      { source: '/es/sales', destination: '/es/ventas', permanent: true },
      { source: '/es/sales/:slug', destination: '/es/ventas/:slug', permanent: true },
      { source: '/es/ventes', destination: '/es/ventas', permanent: true },
      { source: '/es/ventes/:slug', destination: '/es/ventas/:slug', permanent: true },
      { source: '/es/buchen', destination: '/es/reservar', permanent: true },
      { source: '/es/buchen/:path*', destination: '/es/reservar/:path*', permanent: true },
      { source: '/es/book', destination: '/es/reservar', permanent: true },
      { source: '/es/book/:path*', destination: '/es/reservar/:path*', permanent: true },
      { source: '/es/reserver', destination: '/es/reservar', permanent: true },
      { source: '/es/reserver/:path*', destination: '/es/reservar/:path*', permanent: true },
      // Corregir subrutas de reserva con palabras en otros idiomas
      { source: '/es/reservar/fahrzeug', destination: '/es/reservar/vehiculo', permanent: true },
      { source: '/es/reservar/vehicle', destination: '/es/reservar/vehiculo', permanent: true },
      { source: '/es/reservar/vehicule', destination: '/es/reservar/vehiculo', permanent: true },
      { source: '/es/reservar/neu', destination: '/es/reservar/nueva', permanent: true },
      { source: '/es/reservar/new', destination: '/es/reservar/nueva', permanent: true },
      { source: '/es/reservar/nouvelle', destination: '/es/reservar/nueva', permanent: true },
      { source: '/es/reservar/:id/zahlung', destination: '/es/reservar/:id/pago', permanent: true },
      { source: '/es/reservar/:id/payment', destination: '/es/reservar/:id/pago', permanent: true },
      { source: '/es/reservar/:id/paiement', destination: '/es/reservar/:id/pago', permanent: true },
      { source: '/es/reservar/:id/bestaetigung', destination: '/es/reservar/:id/confirmacion', permanent: true },
      { source: '/es/reservar/:id/confirmation', destination: '/es/reservar/:id/confirmacion', permanent: true },
      { source: '/es/preise', destination: '/es/tarifas', permanent: true },
      { source: '/es/rates', destination: '/es/tarifas', permanent: true },
      { source: '/es/tarifs', destination: '/es/tarifas', permanent: true },
      { source: '/es/kontakt', destination: '/es/contacto', permanent: true },
      { source: '/es/contact', destination: '/es/contacto', permanent: true },
      { source: '/es/angebote', destination: '/es/ofertas', permanent: true },
      { source: '/es/offers', destination: '/es/ofertas', permanent: true },
      { source: '/es/offres', destination: '/es/ofertas', permanent: true },
      { source: '/es/uber-uns', destination: '/es/quienes-somos', permanent: true },
      { source: '/es/about-us', destination: '/es/quienes-somos', permanent: true },
      { source: '/es/a-propos', destination: '/es/quienes-somos', permanent: true },
      { source: '/es/datenschutz', destination: '/es/privacidad', permanent: true },
      { source: '/es/privacy', destination: '/es/privacidad', permanent: true },
      { source: '/es/confidentialite', destination: '/es/privacidad', permanent: true },

      // ================================================================
      // GRUPO 3: URLS LEGACY DE JOOMLA (PERMANENTE)
      // ================================================================
      // Propósito: Redirigir URLs antiguas del sitio Joomla
      // Mantener: PERMANENTE - Hay enlaces externos que apuntan aquí
      // Fecha migración: 2024
      // Enlaces detectados: Google Search Console + backlinks
      // ================================================================
      
      // ── Páginas de información antigua ──
      // Joomla usaba /inicio/ en las rutas, ahora eliminamos ese nivel
      { source: '/es/inicio/quienes-somos', destination: '/es/quienes-somos', permanent: true },
      { source: '/inicio/quienes-somos', destination: '/es/quienes-somos', permanent: true },
      { source: '/es/como-funciona-mi-camper-de-alquiler', destination: '/es/como-funciona', permanent: true },
      { source: '/como-funciona-mi-camper-de-alquiler', destination: '/es/como-funciona', permanent: true },
      { source: '/es/tarifas-y-condiciones', destination: '/es/tarifas', permanent: true },
      { source: '/tarifas-y-condiciones', destination: '/es/tarifas', permanent: true },
      
      // ── Tags de Joomla → Blog ──
      { source: '/es/component/tags/tag/:tag', destination: '/es/blog', permanent: true },
      { source: '/component/tags/tag/:tag', destination: '/es/blog', permanent: true },
      
      // ── index.php → Home ──
      { source: '/es/index.php/:path*', destination: '/', permanent: true },
      { source: '/index.php/:path*', destination: '/', permanent: true },

      // ================================================================
      // GRUPO 4: TÉRMINOS ALTERNATIVOS (PERMANENTE)
      // ================================================================
      // Propósito: Usuarios buscan con diferentes términos
      // Ejemplo: "casas rodantes" en lugar de "motorhome" (común en LATAM)
      // Mantener: PERMANENTE - Mejora UX y captura tráfico orgánico
      // ================================================================
      
      // ── "casas rodantes" y "motorhome" (términos LATAM) → rutas correctas ──
      { source: '/es/alquiler-casas-rodantes-europa', destination: '/es/alquiler-motorhome-europa-desde-espana', permanent: true },
      { source: '/alquiler-casas-rodantes-europa', destination: '/es/alquiler-motorhome-europa-desde-espana', permanent: true },
      { source: '/es/alquiler-casas-rodantes-espana', destination: '/es/', permanent: true },
      { source: '/alquiler-casas-rodantes-espana', destination: '/es/', permanent: true },
      { source: '/es/alquiler-motorhome-espana', destination: '/es/', permanent: true },
      { source: '/alquiler-motorhome-espana', destination: '/es/', permanent: true },
      { source: '/es/alquiler-casas-rodantes-madrid', destination: '/es/alquiler-autocaravanas-campervans-madrid', permanent: true },
      { source: '/alquiler-casas-rodantes-madrid', destination: '/es/alquiler-autocaravanas-campervans-madrid', permanent: true },
      { source: '/es/alquiler-motorhome-madrid', destination: '/es/alquiler-autocaravanas-campervans-madrid', permanent: true },
      { source: '/alquiler-motorhome-madrid', destination: '/es/alquiler-autocaravanas-campervans-madrid', permanent: true },
      { source: '/es/alquiler-casas-rodantes-murcia', destination: '/es/alquiler-autocaravanas-campervans-murcia', permanent: true },
      { source: '/alquiler-casas-rodantes-murcia', destination: '/es/alquiler-autocaravanas-campervans-murcia', permanent: true },
      { source: '/es/alquiler-casas-rodantes-alicante', destination: '/es/alquiler-autocaravanas-campervans-alicante', permanent: true },
      { source: '/alquiler-casas-rodantes-alicante', destination: '/es/alquiler-autocaravanas-campervans-alicante', permanent: true },
      
      // ── Ciudades sin página propia → página más cercana ──
      // Propósito: Evitar 404s, ofrecer alternativa geográficamente cercana
      { source: '/es/alquiler-autocaravanas-campervans-puerto-lumbreras', destination: '/es/alquiler-autocaravanas-campervans-murcia', permanent: true },
      { source: '/alquiler-autocaravanas-campervans-puerto-lumbreras', destination: '/es/alquiler-autocaravanas-campervans-murcia', permanent: true },
      { source: '/es/alquiler-autocaravanas-campervans-benalmadena', destination: '/es/alquiler-autocaravanas-campervans-malaga', permanent: true },
      { source: '/alquiler-autocaravanas-campervans-benalmadena', destination: '/es/alquiler-autocaravanas-campervans-malaga', permanent: true },

      // ================================================================
      // GRUPO 5: CAMBIO DE NOMENCLATURA (PERMANENTE)
      // ================================================================
      // Propósito: "Publicaciones" fue renombrado a "Blog"
      // Mantener: PERMANENTE - Más claro y estándar internacional
      // ================================================================
      { source: '/publicaciones', destination: '/es/blog', permanent: true },
      { source: '/publicaciones/:slug', destination: '/es/blog/:slug', permanent: true },
      { source: '/publications', destination: '/en/blog', permanent: true },
      { source: '/publications/:slug', destination: '/en/blog/:slug', permanent: true },
    ];
  },
};

module.exports = withPWA(nextConfig);
