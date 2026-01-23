import type { Locale } from './i18n/config';
import { translateCategorySlug, getCategorySlugInSpanish, translatePostSlug, getPostSlugInSpanish } from './blog-translations';

/**
 * Mapeo de rutas traducidas
 * Ahora con soporte para ES, EN, FR, DE
 */
export const routeTranslations = {
  // Páginas principales
  "/": { 
    es: "/", 
    en: "/", 
    fr: "/", 
    de: "/" 
  },
  "/reservar": { 
    es: "/reservar", 
    en: "/book", 
    fr: "/reserver", 
    de: "/buchen" 
  },
  "/reservar/vehiculo": { 
    es: "/reservar/vehiculo", 
    en: "/book/vehicle", 
    fr: "/reserver/vehicule", 
    de: "/buchen/fahrzeug" 
  },
  "/reservar/nueva": { 
    es: "/reservar/nueva", 
    en: "/book/new", 
    fr: "/reserver/nouvelle", 
    de: "/buchen/neu" 
  },
  "/buscar": { 
    es: "/buscar", 
    en: "/search", 
    fr: "/recherche", 
    de: "/suche" 
  },
  "/vehiculos": { 
    es: "/vehiculos", 
    en: "/vehicles", 
    fr: "/vehicules", 
    de: "/fahrzeuge" 
  },
  "/tarifas": { 
    es: "/tarifas", 
    en: "/rates", 
    fr: "/tarifs", 
    de: "/preise" 
  },
  "/contacto": { 
    es: "/contacto", 
    en: "/contact", 
    fr: "/contact", 
    de: "/kontakt" 
  },
  "/ofertas": { 
    es: "/ofertas", 
    en: "/offers", 
    fr: "/offres", 
    de: "/angebote" 
  },
  "/ventas": { 
    es: "/ventas", 
    en: "/sales", 
    fr: "/ventes", 
    de: "/verkauf" 
  },
  "/blog": { 
    es: "/blog", 
    en: "/blog", 
    fr: "/blog", 
    de: "/blog" 
  },
  "/blog/rutas": { 
    es: "/blog/rutas", 
    en: "/blog/routes", 
    fr: "/blog/itineraires", 
    de: "/blog/routen" 
  },
  "/blog/noticias": { 
    es: "/blog/noticias", 
    en: "/blog/news", 
    fr: "/blog/actualites", 
    de: "/blog/nachrichten" 
  },
  "/blog/vehiculos": { 
    es: "/blog/vehiculos", 
    en: "/blog/vehicles", 
    fr: "/blog/vehicules", 
    de: "/blog/fahrzeuge" 
  },
  "/blog/consejos": { 
    es: "/blog/consejos", 
    en: "/blog/tips", 
    fr: "/blog/conseils", 
    de: "/blog/tipps" 
  },
  "/blog/destinos": { 
    es: "/blog/destinos", 
    en: "/blog/destinations", 
    fr: "/blog/destinations", 
    de: "/blog/reiseziele" 
  },
  "/blog/equipamiento": { 
    es: "/blog/equipamiento", 
    en: "/blog/equipment", 
    fr: "/blog/equipement", 
    de: "/blog/ausrustung" 
  },
  "/publicaciones": { 
    es: "/publicaciones", 
    en: "/publications", 
    fr: "/publications", 
    de: "/publikationen" 
  },
  
  // Páginas de información
  "/quienes-somos": { 
    es: "/quienes-somos", 
    en: "/about-us", 
    fr: "/a-propos", 
    de: "/uber-uns" 
  },
  "/guia-camper": { 
    es: "/guia-camper", 
    en: "/camper-guide", 
    fr: "/guide-camping-car", 
    de: "/wohnmobil-guide" 
  },
  "/inteligencia-artificial": { 
    es: "/inteligencia-artificial", 
    en: "/artificial-intelligence", 
    fr: "/intelligence-artificielle", 
    de: "/kunstliche-intelligenz" 
  },
  "/mapa-areas": { 
    es: "/mapa-areas", 
    en: "/areas-map", 
    fr: "/carte-zones", 
    de: "/gebietskarte" 
  },
  "/parking-murcia": { 
    es: "/parking-murcia", 
    en: "/murcia-parking", 
    fr: "/parking-murcie", 
    de: "/parkplatz-murcia" 
  },
  "/video-tutoriales": { 
    es: "/video-tutoriales", 
    en: "/video-tutorials", 
    fr: "/tutoriels-video", 
    de: "/video-anleitungen" 
  },
  "/faqs": { 
    es: "/faqs", 
    en: "/faqs", 
    fr: "/faqs", 
    de: "/faqs" 
  },
  
  // Páginas secundarias
  "/clientes-vip": { 
    es: "/clientes-vip", 
    en: "/vip-clients", 
    fr: "/clients-vip", 
    de: "/vip-kunden" 
  },
  "/documentacion-alquiler": { 
    es: "/documentacion-alquiler", 
    en: "/rental-documentation", 
    fr: "/documentation-location", 
    de: "/mietdokumentation" 
  },
  "/como-funciona": { 
    es: "/como-funciona", 
    en: "/how-it-works", 
    fr: "/comment-ca-marche", 
    de: "/wie-es-funktioniert" 
  },
  "/como-reservar-fin-semana": { 
    es: "/como-reservar-fin-semana", 
    en: "/weekend-booking", 
    fr: "/reservation-weekend", 
    de: "/wochenend-buchung" 
  },
  
  // Páginas legales
  "/aviso-legal": { 
    es: "/aviso-legal", 
    en: "/legal-notice", 
    fr: "/mentions-legales", 
    de: "/impressum" 
  },
  "/privacidad": { 
    es: "/privacidad", 
    en: "/privacy", 
    fr: "/confidentialite", 
    de: "/datenschutz" 
  },
  "/cookies": { 
    es: "/cookies", 
    en: "/cookies", 
    fr: "/cookies", 
    de: "/cookies" 
  },
  
  // Páginas de pago
  "/pago/exito": {
    es: "/pago/exito",
    en: "/payment/success",
    fr: "/paiement/succes",
    de: "/zahlung/erfolg"
  },
  "/pago/error": {
    es: "/pago/error",
    en: "/payment/error",
    fr: "/paiement/erreur",
    de: "/zahlung/fehler"
  },
  // Segmentos individuales para rutas dinámicas con ID (ej: /reservar/{id}/pago)
  "/pago": {
    es: "/pago",
    en: "/payment",
    fr: "/paiement",
    de: "/zahlung"
  },
  "/confirmacion": {
    es: "/confirmacion",
    en: "/confirmation",
    fr: "/confirmation",
    de: "/bestaetigung"
  },
  
  // Páginas de localización SEO (patrón base dinámico)
  // El patrón completo sería: /es/alquiler-autocaravanas-campervans-{location}
  "/alquiler-autocaravanas-campervans": { 
    es: "/alquiler-autocaravanas-campervans", 
    en: "/rent-campervan-motorhome", 
    fr: "/location-camping-car", 
    de: "/wohnmobil-mieten" 
  },
  // Páginas de venta por localización (patrón base dinámico)
  // El patrón completo sería: /es/venta-autocaravanas-camper-{location}
  "/venta-autocaravanas-camper": { 
    es: "/venta-autocaravanas-camper", 
    en: "/campervans-for-sale-in", 
    fr: "/camping-cars-a-vendre", 
    de: "/wohnmobile-zu-verkaufen" 
  },
} as const;

/**
 * Obtiene la ruta traducida con prefijo de idioma
 * Ejemplo: /es/contacto -> /en/contact
 * Ejemplo dinámico: /es/alquiler-autocaravanas-campervans-murcia -> /en/rent-campervan-motorhome-murcia
 * Ejemplo blog categoría: /es/blog/rutas -> /en/blog/routes
 * Ejemplo blog artículo: /es/blog/rutas/mi-articulo -> /en/blog/routes/mi-articulo
 */
export function getTranslatedRoute(path: string, targetLang: Locale): string {
  // Eliminar query params y hash
  const basePath = path.split('?')[0].split('#')[0];
  const queryAndHash = path.substring(basePath.length);
  
  // Remover el prefijo de idioma actual si existe
  const segments = basePath.split('/').filter(Boolean);
  let cleanPath = basePath;
  let currentLocale: Locale | null = null;
  
  if (segments.length > 0 && ['es', 'en', 'fr', 'de'].includes(segments[0])) {
    currentLocale = segments[0] as Locale;
    cleanPath = '/' + segments.slice(1).join('/');
    if (cleanPath === '/') cleanPath = '/';
  }
  
  if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;
  
  // Buscar traducción de la ruta limpia
  let translatedPath = cleanPath;
  
  // CASO ESPECIAL: Rutas del blog
  // Detectar: /blog/{category}/{slug} o /blog/{category}
  const blogPattern = /^\/blog\/([^/]+)(?:\/([^/]+))?$/;
  const blogMatch = cleanPath.match(blogPattern);
  
  if (blogMatch) {
    const [, categorySlug, articleSlug] = blogMatch;
    
    // Si el idioma actual no es español, necesitamos obtener el slug en español primero
    const esCategorySlug = currentLocale && currentLocale !== 'es' 
      ? getCategorySlugInSpanish(categorySlug, currentLocale)
      : categorySlug;
    
    // Traducir la categoría al idioma destino
    const translatedCategory = translateCategorySlug(esCategorySlug, targetLang);
    
    if (articleSlug) {
      // Es un artículo: /blog/{category}/{slug}
      const esArticleSlug = currentLocale && currentLocale !== 'es'
        ? getPostSlugInSpanish(articleSlug, currentLocale)
        : articleSlug;
      
      const translatedArticle = translatePostSlug(esArticleSlug, targetLang);
      translatedPath = `/blog/${translatedCategory}/${translatedArticle}`;
    } else {
      // Es listado de categoría: /blog/{category}
      translatedPath = `/blog/${translatedCategory}`;
    }
  } else {
    // Intentar coincidencia exacta
    if (routeTranslations[cleanPath as keyof typeof routeTranslations]) {
      translatedPath = routeTranslations[cleanPath as keyof typeof routeTranslations][targetLang];
    } else {
      // Manejar rutas dinámicas de localización (pattern: /alquiler-autocaravanas-campervans-{location})
      const locationPattern = /^\/(alquiler-autocaravanas-campervans|rent-campervan-motorhome|location-camping-car|wohnmobil-mieten)-(.+)$/;
      const locationMatch = cleanPath.match(locationPattern);
      
      if (locationMatch) {
        const [, basePattern, location] = locationMatch;
        const translatedBase = routeTranslations["/alquiler-autocaravanas-campervans"][targetLang];
        translatedPath = `${translatedBase}-${location}`;
      } else {
        // Manejar rutas dinámicas de venta por localización (pattern: /venta-autocaravanas-camper-{location})
        const saleLocationPattern = /^\/(venta-autocaravanas-camper|campervans-for-sale-in|camping-cars-a-vendre|wohnmobile-zu-verkaufen)-(.+)$/;
        const saleLocationMatch = cleanPath.match(saleLocationPattern);
        
        if (saleLocationMatch) {
          const [, basePattern, location] = saleLocationMatch;
          const translatedBase = routeTranslations["/venta-autocaravanas-camper"][targetLang];
          translatedPath = `${translatedBase}-${location}`;
        } else {
          // Si es una ruta dinámica normal, traducir TODOS los segmentos traducibles
          const pathSegments = cleanPath.split('/').filter(Boolean);
          if (pathSegments.length > 0) {
            const translatedSegments: string[] = [];
            
            for (const segment of pathSegments) {
              const segmentAsRoute = '/' + segment;
              // Intentar traducir cada segmento individual
              if (routeTranslations[segmentAsRoute as keyof typeof routeTranslations]) {
                const translated = routeTranslations[segmentAsRoute as keyof typeof routeTranslations][targetLang];
                translatedSegments.push(translated.substring(1)); // Sin la barra inicial
              } else {
                // Si no tiene traducción, mantener el segmento original (ej: IDs, slugs)
                translatedSegments.push(segment);
              }
            }
            
            translatedPath = '/' + translatedSegments.join('/');
          }
        }
      }
    }
  }
  
  // Añadir prefijo de idioma
  const finalPath = `/${targetLang}${translatedPath}`;
  
  return finalPath + queryAndHash;
}

/**
 * Obtiene el idioma desde una ruta con prefijo
 * Ejemplo: /es/contacto -> 'es'
 */
export function getLanguageFromRoute(path: string): Locale {
  const basePath = path.split('?')[0].split('#')[0];
  const segments = basePath.split('/').filter(Boolean);
  
  // Verificar si el primer segmento es un idioma válido
  if (segments.length > 0) {
    const firstSegment = segments[0];
    if (['es', 'en', 'fr', 'de'].includes(firstSegment)) {
      return firstSegment as Locale;
    }
  }
  
  // Si no hay prefijo, asumir español (default)
  return 'es';
}

/**
 * Remueve el prefijo de idioma de una ruta
 * Ejemplo: /es/contacto -> /contacto
 */
export function removeLanguagePrefix(path: string): string {
  const segments = path.split('/').filter(Boolean);
  
  if (segments.length > 0 && ['es', 'en', 'fr', 'de'].includes(segments[0])) {
    return '/' + segments.slice(1).join('/') || '/';
  }
  
  return path;
}

