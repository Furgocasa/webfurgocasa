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
      urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 5 * 60 // 5 minutos
        }
      }
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images-cache',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 días
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
  },
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
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      img-src 'self' data: blob: https://*.supabase.co https://www.googletagmanager.com https://www.google-analytics.com https://www.facebook.com;
      font-src 'self' https://fonts.gstatic.com data:;
      connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https://www.googletagmanager.com https://connect.facebook.net https://api.stripe.com;
      frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://www.youtube.com https://www.youtube-nocookie.com;
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
    ];
  },
  async rewrites() {
    return [
      // ============================================
      // INGLÉS (EN) - Rutas traducidas
      // ============================================
      // Rutas principales
      { source: '/book', destination: '/reservar' },
      { source: '/book/:path*', destination: '/reservar/:path*' },
      { source: '/vehicles', destination: '/vehiculos' },
      { source: '/vehicles/:slug', destination: '/vehiculos/:slug' },
      { source: '/rates', destination: '/tarifas' },
      { source: '/contact', destination: '/contacto' },
      { source: '/offers', destination: '/ofertas' },
      { source: '/sales', destination: '/ventas' },
      { source: '/sales/:slug', destination: '/ventas/:slug' },
      { source: '/search', destination: '/buscar' },
      
      // Páginas de información
      { source: '/about-us', destination: '/quienes-somos' },
      { source: '/camper-guide', destination: '/guia-camper' },
      { source: '/artificial-intelligence', destination: '/inteligencia-artificial' },
      { source: '/areas-map', destination: '/mapa-areas' },
      { source: '/murcia-parking', destination: '/parking-murcia' },
      { source: '/video-tutorials', destination: '/video-tutoriales' },
      { source: '/vip-clients', destination: '/clientes-vip' },
      { source: '/rental-documentation', destination: '/documentacion-alquiler' },
      { source: '/how-it-works', destination: '/como-funciona' },
      { source: '/weekend-booking', destination: '/como-reservar-fin-semana' },
      
      // Páginas legales
      { source: '/legal-notice', destination: '/aviso-legal' },
      { source: '/privacy', destination: '/privacidad' },

      // Páginas de pago
      { source: '/payment/success', destination: '/pago/exito' },
      { source: '/payment/error', destination: '/pago/error' },

      // Categorías del blog (EN)
      { source: '/blog/routes', destination: '/blog/rutas' },
      { source: '/blog/routes/:slug', destination: '/blog/rutas/:slug' },
      { source: '/blog/news', destination: '/blog/noticias' },
      { source: '/blog/news/:slug', destination: '/blog/noticias/:slug' },
      { source: '/blog/vehicles', destination: '/blog/vehiculos' },
      { source: '/blog/vehicles/:slug', destination: '/blog/vehiculos/:slug' },
      { source: '/blog/tips', destination: '/blog/consejos' },
      { source: '/blog/tips/:slug', destination: '/blog/consejos/:slug' },
      { source: '/blog/destinations', destination: '/blog/destinos' },
      { source: '/blog/destinations/:slug', destination: '/blog/destinos/:slug' },
      { source: '/blog/equipment', destination: '/blog/equipamiento' },
      { source: '/blog/equipment/:slug', destination: '/blog/equipamiento/:slug' },
      
      // Rutas dinámicas de localización SEO (EN)
      { source: '/rent-campervan-motorhome-:location', destination: '/alquiler-autocaravanas-campervans-:location' },
      { source: '/campervans-for-sale-in-:location', destination: '/venta-autocaravanas-camper-:location' },

      // ============================================
      // FRANCÉS (FR) - Rutas traducidas
      // ============================================
      // Rutas principales
      { source: '/reserver', destination: '/reservar' },
      { source: '/reserver/:path*', destination: '/reservar/:path*' },
      { source: '/vehicules', destination: '/vehiculos' },
      { source: '/vehicules/:slug', destination: '/vehiculos/:slug' },
      { source: '/tarifs', destination: '/tarifas' },
      // /contact es igual en inglés y francés, ya está cubierto
      { source: '/offres', destination: '/ofertas' },
      { source: '/ventes', destination: '/ventas' },
      { source: '/ventes/:slug', destination: '/ventas/:slug' },
      { source: '/recherche', destination: '/buscar' },
      
      // Páginas de información (FR)
      { source: '/a-propos', destination: '/quienes-somos' },
      { source: '/guide-camping-car', destination: '/guia-camper' },
      { source: '/intelligence-artificielle', destination: '/inteligencia-artificial' },
      { source: '/carte-zones', destination: '/mapa-areas' },
      { source: '/parking-murcie', destination: '/parking-murcia' },
      { source: '/tutoriels-video', destination: '/video-tutoriales' },
      { source: '/clients-vip', destination: '/clientes-vip' },
      { source: '/documentation-location', destination: '/documentacion-alquiler' },
      { source: '/comment-ca-marche', destination: '/como-funciona' },
      { source: '/reservation-weekend', destination: '/como-reservar-fin-semana' },
      
      // Páginas legales (FR)
      { source: '/mentions-legales', destination: '/aviso-legal' },
      { source: '/confidentialite', destination: '/privacidad' },

      // Páginas de pago (FR)
      { source: '/paiement/succes', destination: '/pago/exito' },
      { source: '/paiement/erreur', destination: '/pago/error' },

      // Categorías del blog (FR)
      { source: '/blog/itineraires', destination: '/blog/rutas' },
      { source: '/blog/itineraires/:slug', destination: '/blog/rutas/:slug' },
      { source: '/blog/actualites', destination: '/blog/noticias' },
      { source: '/blog/actualites/:slug', destination: '/blog/noticias/:slug' },
      { source: '/blog/vehicules', destination: '/blog/vehiculos' },
      { source: '/blog/vehicules/:slug', destination: '/blog/vehiculos/:slug' },
      { source: '/blog/conseils', destination: '/blog/consejos' },
      { source: '/blog/conseils/:slug', destination: '/blog/consejos/:slug' },
      // /blog/destinations es igual en francés
      { source: '/blog/equipement', destination: '/blog/equipamiento' },
      { source: '/blog/equipement/:slug', destination: '/blog/equipamiento/:slug' },
      
      // Rutas dinámicas de localización SEO (FR)
      { source: '/location-camping-car-:location', destination: '/alquiler-autocaravanas-campervans-:location' },
      { source: '/camping-cars-a-vendre-:location', destination: '/venta-autocaravanas-camper-:location' },

      // ============================================
      // ALEMÁN (DE) - Rutas traducidas
      // ============================================
      // Rutas principales
      { source: '/buchen', destination: '/reservar' },
      { source: '/buchen/:path*', destination: '/reservar/:path*' },
      { source: '/fahrzeuge', destination: '/vehiculos' },
      { source: '/fahrzeuge/:slug', destination: '/vehiculos/:slug' },
      { source: '/preise', destination: '/tarifas' },
      { source: '/kontakt', destination: '/contacto' },
      { source: '/angebote', destination: '/ofertas' },
      { source: '/verkauf', destination: '/ventas' },
      { source: '/verkauf/:slug', destination: '/ventas/:slug' },
      { source: '/suche', destination: '/buscar' },
      
      // Páginas de información (DE)
      { source: '/uber-uns', destination: '/quienes-somos' },
      { source: '/wohnmobil-guide', destination: '/guia-camper' },
      { source: '/kunstliche-intelligenz', destination: '/inteligencia-artificial' },
      { source: '/gebietskarte', destination: '/mapa-areas' },
      { source: '/parkplatz-murcia', destination: '/parking-murcia' },
      { source: '/video-anleitungen', destination: '/video-tutoriales' },
      { source: '/vip-kunden', destination: '/clientes-vip' },
      { source: '/mietdokumentation', destination: '/documentacion-alquiler' },
      { source: '/wie-es-funktioniert', destination: '/como-funciona' },
      { source: '/wochenend-buchung', destination: '/como-reservar-fin-semana' },
      
      // Páginas legales (DE)
      { source: '/impressum', destination: '/aviso-legal' },
      { source: '/datenschutz', destination: '/privacidad' },

      // Páginas de pago (DE)
      { source: '/zahlung/erfolg', destination: '/pago/exito' },
      { source: '/zahlung/fehler', destination: '/pago/error' },

      // Categorías del blog (DE)
      { source: '/blog/routen', destination: '/blog/rutas' },
      { source: '/blog/routen/:slug', destination: '/blog/rutas/:slug' },
      { source: '/blog/nachrichten', destination: '/blog/noticias' },
      { source: '/blog/nachrichten/:slug', destination: '/blog/noticias/:slug' },
      { source: '/blog/fahrzeuge', destination: '/blog/vehiculos' },
      { source: '/blog/fahrzeuge/:slug', destination: '/blog/vehiculos/:slug' },
      { source: '/blog/tipps', destination: '/blog/consejos' },
      { source: '/blog/tipps/:slug', destination: '/blog/consejos/:slug' },
      { source: '/blog/reiseziele', destination: '/blog/destinos' },
      { source: '/blog/reiseziele/:slug', destination: '/blog/destinos/:slug' },
      { source: '/blog/ausrustung', destination: '/blog/equipamiento' },
      { source: '/blog/ausrustung/:slug', destination: '/blog/equipamiento/:slug' },
      
      // Rutas dinámicas de localización SEO (DE)
      { source: '/wohnmobil-mieten-:location', destination: '/alquiler-autocaravanas-campervans-:location' },
      { source: '/wohnmobile-zu-verkaufen-:location', destination: '/venta-autocaravanas-camper-:location' },
    ];
  },
  async redirects() {
    return [
      // Redirección de la URL de Vercel al dominio personalizado (308 permanente)
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'webfurgocasa.vercel.app',
          },
        ],
        destination: 'https://www.furgocasa.com/:path*',
        permanent: true,
      },
      // Redirect de publicaciones a blog (301 permanente)
      {
        source: '/publicaciones',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/publicaciones/:slug',
        destination: '/blog/:slug',
        permanent: true,
      },
      {
        source: '/publications',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/publications/:slug',
        destination: '/blog/:slug',
        permanent: true,
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
