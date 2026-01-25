import { MapPin, Navigation, Clock, CheckCircle } from "lucide-react";
import { LocalizedLink } from "@/components/localized-link";
import { translateServer } from "@/lib/i18n/server-translation";
import type { Locale } from "@/lib/i18n/config";

interface NearbyOfficeNoticeProps {
  locationName: string;
  nearestLocationName: string;
  nearestLocationCity: string;
  distanceKm: number;
  travelTimeMinutes: number;
  locale: Locale;
}

/**
 * Componente para mostrar el aviso de oficina cercana en páginas de ciudades sin sede.
 * 
 * Estrategia SEO:
 * - Solo se muestra en ciudades SIN sede física (distance_km > 0)
 * - Mensaje honesto: "No estamos en X, pero estamos muy cerca en Y"
 * - Información clara de distancia y tiempo de viaje
 * - CTA para que el usuario vea el valor de desplazarse
 * 
 * @param locationName - Ciudad actual (ej: "Alicante")
 * @param nearestLocationName - Nombre de la sede cercana (ej: "Murcia")
 * @param nearestLocationCity - Ciudad de la sede (ej: "Murcia")
 * @param distanceKm - Distancia en kilómetros
 * @param travelTimeMinutes - Tiempo de viaje en minutos
 * @param locale - Idioma actual
 */
export async function NearbyOfficeNotice({
  locationName,
  nearestLocationName,
  nearestLocationCity,
  distanceKm,
  travelTimeMinutes,
  locale,
}: NearbyOfficeNoticeProps) {
  const t = (key: string) => translateServer(key, locale);
  const travelHours = Math.round(travelTimeMinutes / 60);

  return (
    <section className="py-12 lg:py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Título principal */}
          <div className="text-center mb-8">
            <h2 className="text-2xl lg:text-4xl font-heading font-bold text-gray-900 mb-3">
              {t("No estamos en")} {locationName}, {t("pero estamos muy cerca")}
            </h2>
            <p className="text-lg lg:text-xl text-gray-600">
              {t("Tenemos sede de entrega en")} <span className="font-bold text-furgocasa-blue">{nearestLocationCity}</span>
            </p>
          </div>

          {/* Tarjeta principal con información de distancia */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-furgocasa-blue/20">
            {/* Información de distancia y tiempo */}
            <div className="bg-gradient-to-r from-furgocasa-blue to-furgocasa-blue-dark text-white p-6 lg:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                {/* Ubicación */}
                <div className="flex flex-col items-center">
                  <MapPin className="h-10 w-10 mb-3 text-furgocasa-orange" />
                  <div className="text-sm lg:text-base opacity-90 mb-1">{t("Sede más cercana")}</div>
                  <div className="text-xl lg:text-2xl font-bold">{nearestLocationCity}</div>
                </div>

                {/* Distancia */}
                <div className="flex flex-col items-center">
                  <Navigation className="h-10 w-10 mb-3 text-furgocasa-orange" />
                  <div className="text-sm lg:text-base opacity-90 mb-1">{t("Distancia")}</div>
                  <div className="text-xl lg:text-2xl font-bold">{distanceKm} km</div>
                </div>

                {/* Tiempo */}
                <div className="flex flex-col items-center">
                  <Clock className="h-10 w-10 mb-3 text-furgocasa-orange" />
                  <div className="text-sm lg:text-base opacity-90 mb-1">{t("Tiempo en coche")}</div>
                  <div className="text-xl lg:text-2xl font-bold">
                    {travelHours === 1 ? t("1 hora") : `${travelHours} ${t("horas")}`}
                  </div>
                </div>
              </div>
            </div>

            {/* Beneficios de venir a nuestra sede */}
            <div className="p-6 lg:p-10">
              <h3 className="text-xl lg:text-2xl font-heading font-bold text-gray-900 mb-6 text-center">
                {t("¿Por qué merece la pena venir desde")} {locationName}?
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {[
                  t("Flota premium de autocaravanas de gran volumen"),
                  t("Kilómetros ilimitados incluidos"),
                  t("Equipamiento completo y moderno"),
                  t("Atención personalizada y profesional"),
                  t("Vehículos nuevos y perfectamente mantenidos"),
                  t("Flexibilidad en fechas y condiciones"),
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Mensaje de confianza */}
              <div className="bg-furgocasa-orange/10 border-2 border-furgocasa-orange/30 rounded-xl p-6 mb-6">
                <p className="text-base lg:text-lg text-gray-800 text-center leading-relaxed">
                  <strong className="text-furgocasa-orange">{t("Miles de clientes")}</strong> {t("de")} {locationName} {t("y ciudades cercanas ya han confiado en nosotros.")} 
                  {" "}<strong>{t("El desplazamiento vale la pena:")}</strong> {t("nuestras campers son las mejores del mercado y nuestro servicio, excepcional.")}
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4 justify-center">
                <LocalizedLink
                  href="/reservar"
                  className="inline-flex items-center gap-2 bg-furgocasa-orange text-white font-bold px-8 py-4 rounded-xl hover:bg-furgocasa-orange-dark transition-all shadow-lg text-base lg:text-lg"
                >
                  {t("Reservar ahora")}
                </LocalizedLink>
                <LocalizedLink
                  href="/contacto"
                  className="inline-flex items-center gap-2 bg-white text-furgocasa-blue border-2 border-furgocasa-blue font-bold px-8 py-4 rounded-xl hover:bg-furgocasa-blue hover:text-white transition-all text-base lg:text-lg"
                >
                  {t("Más información")}
                </LocalizedLink>
              </div>
            </div>
          </div>

          {/* Nota adicional pequeña */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              {t("También puedes contactarnos para resolver cualquier duda sobre tu viaje desde")} {locationName}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
