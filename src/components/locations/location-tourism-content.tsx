import { 
  MapPin, 
  Camera, 
  Bed, 
  Utensils, 
  Map, 
  Star,
  Compass,
  Clock,
  Gauge,
  Droplets,
  Zap,
  Wifi,
  Waves,
  ShowerHead,
  Lightbulb
} from "lucide-react";

// ============================================================================
// TIPOS
// ============================================================================

interface Attraction {
  title: string;
  description: string;
  type?: 'historical' | 'cultural' | 'natural' | 'leisure';
}

interface ParkingArea {
  name: string;
  description: string;
  services?: string[];
  approximate_location?: string;
}

interface Route {
  title: string;
  description: string;
  duration?: string;
  difficulty?: 'Fácil' | 'Media' | 'Difícil' | 'Easy' | 'Medium' | 'Hard';
}

// Formato estructurado (nuevo)
interface StructuredContentSections {
  introduction?: string;
  attractions?: Attraction[];
  parking_areas?: ParkingArea[];
  routes?: Route[];
  gastronomy?: string;
  practical_tips?: string;
}

// Formato array simple (antiguo)
interface SimpleSection {
  title: string;
  content: string;
}

type ContentSections = StructuredContentSections | SimpleSection[];

interface LocationTourismContentProps {
  locationName: string;
  contentSections: ContentSections | null;
  locale?: 'es' | 'en' | 'fr' | 'de';
}

// ============================================================================
// TRADUCCIONES
// ============================================================================

const translations = {
  es: {
    discover: 'DESCUBRE',
    subtitle: 'Descubre todo lo que puedes hacer y ver en {location} viajando en camper',
    visit_in_camper: 'Visitar {location} en Autocaravana Camper',
    what_to_see: 'Qué ver y hacer en {location}',
    campervan_areas: 'Áreas de autocaravanas cerca de {location}',
    routes_from: 'Rutas en camper desde {location}',
    local_gastronomy: 'Gastronomía local de {location}',
    practical_tips: 'Consejos prácticos para tu viaje',
    duration: 'Duración',
    difficulty: 'Dificultad',
    services: 'Servicios',
  },
  en: {
    discover: 'DISCOVER',
    subtitle: 'Discover everything you can see and do in {location} travelling by camper',
    visit_in_camper: 'Visit {location} by Campervan',
    what_to_see: 'What to see and do in {location}',
    campervan_areas: 'Campervan areas near {location}',
    routes_from: 'Camper routes from {location}',
    local_gastronomy: 'Local gastronomy of {location}',
    practical_tips: 'Practical tips for your trip',
    duration: 'Duration',
    difficulty: 'Difficulty',
    services: 'Services',
  },
  fr: {
    discover: 'DÉCOUVREZ',
    subtitle: 'Découvrez tout ce que vous pouvez voir et faire à {location} en camping-car',
    visit_in_camper: 'Visiter {location} en Camping-car',
    what_to_see: 'Que voir et faire à {location}',
    campervan_areas: 'Aires de camping-car près de {location}',
    routes_from: 'Routes en camping-car depuis {location}',
    local_gastronomy: 'Gastronomie locale de {location}',
    practical_tips: 'Conseils pratiques pour votre voyage',
    duration: 'Durée',
    difficulty: 'Difficulté',
    services: 'Services',
  },
  de: {
    discover: 'ENTDECKEN SIE',
    subtitle: 'Entdecken Sie alles, was Sie in {location} mit dem Wohnmobil sehen und unternehmen können',
    visit_in_camper: '{location} mit dem Wohnmobil besuchen',
    what_to_see: 'Was man in {location} sehen und unternehmen kann',
    campervan_areas: 'Wohnmobil-Stellplätze in der Nähe von {location}',
    routes_from: 'Wohnmobil-Routen ab {location}',
    local_gastronomy: 'Lokale Gastronomie von {location}',
    practical_tips: 'Praktische Tipps für Ihre Reise',
    duration: 'Dauer',
    difficulty: 'Schwierigkeit',
    services: 'Dienstleistungen',
  },
};

// ============================================================================
// HELPERS
// ============================================================================

function isStructuredContent(content: ContentSections): content is StructuredContentSections {
  return content !== null && !Array.isArray(content) && typeof content === 'object';
}

function getServiceIcon(service: string) {
  const s = service.toLowerCase();
  if (s.includes('agua') || s.includes('water')) return Droplets;
  if (s.includes('electric') || s.includes('luz')) return Zap;
  if (s.includes('wifi') || s.includes('internet')) return Wifi;
  if (s.includes('piscina') || s.includes('pool') || s.includes('schwimm')) return Waves;
  if (s.includes('ducha') || s.includes('shower') || s.includes('douche')) return ShowerHead;
  return Star;
}

function getAttractionIcon(type?: string) {
  switch (type) {
    case 'historical': return Camera;
    case 'cultural': return Star;
    case 'natural': return Compass;
    case 'leisure': return Waves;
    default: return Camera;
  }
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function LocationTourismContent({ 
  locationName, 
  contentSections,
  locale = 'es'
}: LocationTourismContentProps) {
  if (!contentSections) return null;

  const t = translations[locale] || translations.es;
  const replaceLocation = (str: string) => str.replace('{location}', locationName);

  // Si es formato estructurado (objeto con introduction, attractions, etc.)
  if (isStructuredContent(contentSections)) {
    const { introduction, attractions, parking_areas, routes, gastronomy, practical_tips } = contentSections;
    
    const hasContent = introduction || (attractions && attractions.length > 0) || 
                       (parking_areas && parking_areas.length > 0) || 
                       (routes && routes.length > 0) || 
                       gastronomy || practical_tips;

    if (!hasContent) return null;

    return (
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900 mb-4">
                {replaceLocation(t.visit_in_camper)}
              </h2>
              <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
                {replaceLocation(t.subtitle)}
              </p>
            </div>

            <div className="text-gray-700 leading-relaxed space-y-8">
              {/* INTRODUCCIÓN */}
              {introduction && (
                <div 
                  className="text-base lg:text-lg leading-relaxed prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: introduction }}
                />
              )}

              {/* ATRACCIONES - Diseño idéntico a producción (cards azules) */}
              {attractions && attractions.length > 0 && (
                <div className="mt-12">
                  <h3 className="text-2xl lg:text-3xl font-heading font-bold text-furgocasa-blue mb-6">
                    {replaceLocation(t.what_to_see)}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {attractions.map((attraction, index) => (
                      <div 
                        key={index}
                        className="bg-blue-50 p-6 rounded-xl border-l-4 border-furgocasa-blue"
                      >
                        <h4 className="text-lg font-bold text-furgocasa-blue mb-3">
                          {attraction.title}
                        </h4>
                        <div 
                          className="text-gray-700 text-sm"
                          dangerouslySetInnerHTML={{ __html: attraction.description }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ÁREAS DE AUTOCARAVANAS - Diseño idéntico a producción (cards naranjas) */}
              {parking_areas && parking_areas.length > 0 && (
                <div className="mt-12">
                  <h3 className="text-2xl lg:text-3xl font-heading font-bold text-furgocasa-orange mb-6">
                    {replaceLocation(t.campervan_areas)}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {parking_areas.map((area, index) => (
                      <div 
                        key={index}
                        className="bg-orange-50 p-6 rounded-xl border-l-4 border-furgocasa-orange"
                      >
                        <h4 className="text-lg font-bold text-furgocasa-orange mb-2">
                          {area.name}
                        </h4>
                        {area.approximate_location && (
                          <p className="text-xs text-gray-500 mb-3">
                            📍 {area.approximate_location}
                          </p>
                        )}
                        <div 
                          className="text-gray-700 text-sm mb-3"
                          dangerouslySetInnerHTML={{ __html: area.description }}
                        />
                        {area.services && area.services.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {area.services.map((service, sIndex) => (
                              <span 
                                key={sIndex}
                                className="bg-white px-2 py-1 rounded text-xs text-gray-600"
                              >
                                {service}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* RUTAS - Diseño idéntico a producción (cards púrpuras) */}
              {routes && routes.length > 0 && (
                <div className="mt-12">
                  <h3 className="text-2xl lg:text-3xl font-heading font-bold text-purple-700 mb-6">
                    {replaceLocation(t.routes_from)}
                  </h3>
                  <div className="space-y-6">
                    {routes.map((route, index) => (
                      <div 
                        key={index}
                        className="bg-purple-50 p-6 rounded-xl border-l-4 border-purple-600"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="text-lg font-bold text-purple-700">
                            {route.title}
                          </h4>
                          {route.duration && (
                            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">
                              {route.duration}
                            </span>
                          )}
                        </div>
                        <div 
                          className="text-gray-700 text-sm"
                          dangerouslySetInnerHTML={{ __html: route.description }}
                        />
                        {route.difficulty && (
                          <p className="text-xs text-gray-500 mt-2">
                            {t.difficulty}: <span className="font-semibold">{route.difficulty}</span>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* GASTRONOMÍA - Diseño idéntico a producción (card verde) */}
              {gastronomy && (
                <div className="mt-12 bg-green-50 p-8 rounded-2xl border-l-4 border-green-600">
                  <h3 className="text-2xl font-heading font-bold text-green-700 mb-4">
                    🍽️ {replaceLocation(t.local_gastronomy)}
                  </h3>
                  <div 
                    className="text-gray-700"
                    dangerouslySetInnerHTML={{ __html: gastronomy }}
                  />
                </div>
              )}

              {/* CONSEJOS PRÁCTICOS - Diseño idéntico a producción (card azul con gradiente) */}
              {practical_tips && (
                <div className="mt-12 bg-gradient-to-r from-furgocasa-blue to-blue-600 text-white p-8 rounded-2xl">
                  <h3 className="text-2xl font-heading font-bold mb-4">
                    💡 {t.practical_tips}
                  </h3>
                  <div 
                    className="[&_h2]:text-white [&_h3]:text-white [&_p]:text-white/90 [&_li]:text-white/90"
                    dangerouslySetInnerHTML={{ __html: practical_tips }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Si es formato array simple (antiguo) - fallback
  if (Array.isArray(contentSections) && contentSections.length > 0) {
    return (
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900 mb-4">
              {replaceLocation(t.visit_in_camper)}
            </h2>
            <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
              {replaceLocation(t.subtitle)}
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            {contentSections.map((section: SimpleSection, index: number) => {
              const getIcon = (title: string) => {
                const lower = title?.toLowerCase() || '';
                if (lower.includes('dormir') || lower.includes('pernoctar') || lower.includes('sleep') || lower.includes('park')) return Bed;
                if (lower.includes('comer') || lower.includes('gastronomía') || lower.includes('eat') || lower.includes('food')) return Utensils;
                if (lower.includes('ver') || lower.includes('visitar') || lower.includes('see') || lower.includes('visit')) return Camera;
                if (lower.includes('ruta') || lower.includes('route')) return Map;
                return Star;
              };
              const Icon = getIcon(section.title);
              
              return (
                <div key={index} className="mb-12">
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 lg:p-10 shadow-lg border border-gray-100">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="bg-furgocasa-orange/10 p-3 rounded-xl">
                        <Icon className="h-8 w-8 text-furgocasa-orange" />
                      </div>
                      {section.title && (
                        <h3 className="text-2xl lg:text-3xl font-heading font-bold text-gray-900">
                          {section.title}
                        </h3>
                      )}
                    </div>
                    {section.content && (
                      <div 
                        className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: section.content }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  return null;
}
