import {
  Wrench,
  FileCheck,
  Warehouse,
  MapPin,
  Car,
  ShieldCheck,
  Clock,
  ParkingCircle,
  Navigation,
  Home
} from "lucide-react";

// ============================================================================
// TIPOS
// ============================================================================

interface WorkshopService {
  name: string;
  description: string;
  type?: 'taller' | 'accesorios' | 'concesionario' | 'servicio';
  approximate_location?: string;
}

interface StorageOption {
  name: string;
  description: string;
  type?: 'guardamuebles' | 'parking' | 'camping_invernal';
  approximate_location?: string;
}

interface WeekendDestination {
  title: string;
  description: string;
  distance_km?: string;
  duration?: string;
}

// Formato estructurado (propietario)
interface OwnerContentSections {
  owner_introduction?: string;
  workshops_and_services?: WorkshopService[];
  itv_and_regulations?: string;
  storage_and_parking?: StorageOption[];
  weekend_destinations?: WeekendDestination[];
}

// Formato turístico antiguo (alquiler) - para fallback/compatibilidad
interface TourismContentSections {
  introduction?: string;
  attractions?: any[];
  parking_areas?: any[];
  routes?: any[];
  gastronomy?: string;
  practical_tips?: string;
}

type ContentSections = OwnerContentSections | TourismContentSections | any[] | null;

interface SaleLocationOwnerContentProps {
  locationName: string;
  contentSections: ContentSections;
  locale?: 'es' | 'en' | 'fr' | 'de';
}

// ============================================================================
// TRADUCCIONES
// ============================================================================

const translations = {
  es: {
    ownerTitle: 'Ser propietario de camper en {location}',
    ownerSubtitle: 'Todo lo que necesitas saber para disfrutar de tu autocaravana en {location}',
    workshopsTitle: 'Talleres y servicios para autocaravanas en {location}',
    itvTitle: 'ITV y normativa en {location}',
    storageTitle: 'Almacenamiento y parking en {location}',
    destinationsTitle: 'Escapadas de fin de semana desde {location}',
    distance: 'Distancia',
    duration: 'Duración',
    location: 'Ubicación',
  },
  en: {
    ownerTitle: 'Owning a campervan in {location}',
    ownerSubtitle: 'Everything you need to know to enjoy your motorhome in {location}',
    workshopsTitle: 'Workshops and services for motorhomes in {location}',
    itvTitle: 'MOT and regulations in {location}',
    storageTitle: 'Storage and parking in {location}',
    destinationsTitle: 'Weekend getaways from {location}',
    distance: 'Distance',
    duration: 'Duration',
    location: 'Location',
  },
  fr: {
    ownerTitle: 'Être propriétaire d\'un camping-car à {location}',
    ownerSubtitle: 'Tout ce que vous devez savoir pour profiter de votre camping-car à {location}',
    workshopsTitle: 'Ateliers et services pour camping-cars à {location}',
    itvTitle: 'Contrôle technique et réglementation à {location}',
    storageTitle: 'Stockage et parking à {location}',
    destinationsTitle: 'Escapades de week-end depuis {location}',
    distance: 'Distance',
    duration: 'Durée',
    location: 'Emplacement',
  },
  de: {
    ownerTitle: 'Ein Wohnmobil in {location} besitzen',
    ownerSubtitle: 'Alles, was Sie wissen müssen, um Ihr Wohnmobil in {location} zu genießen',
    workshopsTitle: 'Werkstätten und Dienstleistungen für Wohnmobile in {location}',
    itvTitle: 'TÜV und Vorschriften in {location}',
    storageTitle: 'Lagerung und Parken in {location}',
    destinationsTitle: 'Wochenendausflüge ab {location}',
    distance: 'Entfernung',
    duration: 'Dauer',
    location: 'Standort',
  },
};

// ============================================================================
// HELPERS
// ============================================================================

function isOwnerContent(content: ContentSections): content is OwnerContentSections {
  return content !== null && !Array.isArray(content) && typeof content === 'object' &&
    ('owner_introduction' in content || 'workshops_and_services' in content || 'itv_and_regulations' in content);
}

function getServiceIcon(type?: string) {
  switch (type) {
    case 'taller': return Wrench;
    case 'accesorios': return Car;
    case 'concesionario': return Home;
    case 'servicio': return ShieldCheck;
    default: return Wrench;
  }
}

function getStorageIcon(type?: string) {
  switch (type) {
    case 'guardamuebles': return Warehouse;
    case 'parking': return ParkingCircle;
    case 'camping_invernal': return Home;
    default: return Warehouse;
  }
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function SaleLocationOwnerContent({
  locationName,
  contentSections,
  locale = 'es'
}: SaleLocationOwnerContentProps) {
  if (!contentSections) return null;

  const t = translations[locale] || translations.es;
  const replaceLocation = (str: string) => str.replace('{location}', locationName);

  // Si es contenido de propietario (nuevo formato)
  if (isOwnerContent(contentSections)) {
    const {
      owner_introduction,
      workshops_and_services,
      itv_and_regulations,
      storage_and_parking,
      weekend_destinations
    } = contentSections;

    const hasContent = owner_introduction ||
      (workshops_and_services && workshops_and_services.length > 0) ||
      itv_and_regulations ||
      (storage_and_parking && storage_and_parking.length > 0) ||
      (weekend_destinations && weekend_destinations.length > 0);

    if (!hasContent) return null;

    return (
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900 mb-4">
                {replaceLocation(t.ownerTitle)}
              </h2>
              <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
                {replaceLocation(t.ownerSubtitle)}
              </p>
            </div>

            <div className="text-gray-700 leading-relaxed space-y-8">
              {/* INTRODUCCIÓN */}
              {owner_introduction && (
                <div
                  className="text-base lg:text-lg leading-relaxed prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: owner_introduction }}
                />
              )}

              {/* TALLERES Y SERVICIOS */}
              {workshops_and_services && workshops_and_services.length > 0 && (
                <div className="mt-12">
                  <h3 className="text-2xl lg:text-3xl font-heading font-bold text-furgocasa-blue mb-6">
                    {replaceLocation(t.workshopsTitle)}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {workshops_and_services.map((service, index) => {
                      const Icon = getServiceIcon(service.type);
                      return (
                        <div
                          key={index}
                          className="bg-blue-50 p-6 rounded-xl border-l-4 border-furgocasa-blue"
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <div className="bg-furgocasa-blue/10 p-2 rounded-lg flex-shrink-0">
                              <Icon className="h-5 w-5 text-furgocasa-blue" />
                            </div>
                            <h4 className="text-lg font-bold text-furgocasa-blue">
                              {service.name}
                            </h4>
                          </div>
                          <div
                            className="text-gray-700 text-sm"
                            dangerouslySetInnerHTML={{ __html: service.description }}
                          />
                          {service.approximate_location && (
                            <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {service.approximate_location}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ITV Y NORMATIVA */}
              {itv_and_regulations && (
                <div className="mt-12 bg-orange-50 p-8 rounded-2xl border-l-4 border-furgocasa-orange">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="bg-furgocasa-orange/10 p-2 rounded-lg flex-shrink-0">
                      <FileCheck className="h-6 w-6 text-furgocasa-orange" />
                    </div>
                    <h3 className="text-2xl font-heading font-bold text-furgocasa-orange">
                      {replaceLocation(t.itvTitle)}
                    </h3>
                  </div>
                  <div
                    className="text-gray-700 prose prose-lg max-w-none [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-gray-800 [&_h3]:mt-4 [&_h3]:mb-2"
                    dangerouslySetInnerHTML={{ __html: itv_and_regulations }}
                  />
                </div>
              )}

              {/* ALMACENAMIENTO Y PARKING */}
              {storage_and_parking && storage_and_parking.length > 0 && (
                <div className="mt-12">
                  <h3 className="text-2xl lg:text-3xl font-heading font-bold text-purple-700 mb-6">
                    {replaceLocation(t.storageTitle)}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {storage_and_parking.map((option, index) => {
                      const Icon = getStorageIcon(option.type);
                      return (
                        <div
                          key={index}
                          className="bg-purple-50 p-6 rounded-xl border-l-4 border-purple-600"
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <div className="bg-purple-100 p-2 rounded-lg flex-shrink-0">
                              <Icon className="h-5 w-5 text-purple-700" />
                            </div>
                            <h4 className="text-lg font-bold text-purple-700">
                              {option.name}
                            </h4>
                          </div>
                          <div
                            className="text-gray-700 text-sm"
                            dangerouslySetInnerHTML={{ __html: option.description }}
                          />
                          {option.approximate_location && (
                            <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {option.approximate_location}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* DESTINOS DE FIN DE SEMANA */}
              {weekend_destinations && weekend_destinations.length > 0 && (
                <div className="mt-12">
                  <h3 className="text-2xl lg:text-3xl font-heading font-bold text-green-700 mb-6">
                    {replaceLocation(t.destinationsTitle)}
                  </h3>
                  <div className="space-y-6">
                    {weekend_destinations.map((destination, index) => (
                      <div
                        key={index}
                        className="bg-green-50 p-6 rounded-xl border-l-4 border-green-600"
                      >
                        <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
                          <div className="flex items-start gap-3">
                            <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
                              <Navigation className="h-5 w-5 text-green-700" />
                            </div>
                            <h4 className="text-lg font-bold text-green-700">
                              {destination.title}
                            </h4>
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            {destination.distance_km && (
                              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                                {destination.distance_km}
                              </span>
                            )}
                            {destination.duration && (
                              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {destination.duration}
                              </span>
                            )}
                          </div>
                        </div>
                        <div
                          className="text-gray-700 text-sm"
                          dangerouslySetInnerHTML={{ __html: destination.description }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Si no es contenido de propietario, no renderizar nada
  // (el contenido turístico antiguo se maneja en LocationTourismContent)
  return null;
}
