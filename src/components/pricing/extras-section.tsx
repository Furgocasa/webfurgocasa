"use client";

import { CheckCircle, Euro } from "lucide-react";
import { LocalizedLink } from "@/components/localized-link";
import { useLanguage } from "@/contexts/language-context";

/**
 * 🎯 COMPONENTE: ExtrasSection
 * ============================
 * 
 * Sección visual que muestra qué incluye el precio del alquiler
 * y qué extras tienen coste adicional.
 * 
 * DISEÑO:
 * - Diseño moderno tipo banner/sección
 * - Dos columnas: Incluido sin coste | Extras opcionales
 * - Destaca especialmente el extra de mascotas permitidas
 * - Coherente con el diseño de la web (Home y Landings)
 * 
 * USO:
 * - Home page (después de precios)
 * - Landing pages de ubicaciones (después de precios)
 * - Cualquier página donde se quiera mostrar esta información
 */

const includedItems = [
  "Kilómetros ilimitados",
  "Conductor/es adicional/es",
  "Utensilios de cocina completos",
  "Kit de camping (mesa y sillas)",
  "Derecho a desistir los primeros 14 días",
  "Cancelación gratuita hasta 60 días antes",
];

const optionalExtras = [
  { name: "Sábanas y almohadas", price: "30,00", unit: "€", per: "viaje" },
  { name: "Edredón invierno", price: "20,00", unit: "€", per: "viaje" },
  { name: "Toallas de baño", price: "20,00", unit: "€", per: "viaje" },
  { name: "Mascotas permitidas", price: "40,00", unit: "€", per: "viaje", highlight: true },
  { name: "Aparcamiento en Murcia", price: "10,00", unit: "€", per: "día" },
  { name: "2ª cama (4 plazas)", price: "10,00", unit: "€", per: "día" },
];

interface ExtrasSectionProps {
  /**
   * Título de la sección (opcional)
   * Por defecto: "¿Qué incluye tu alquiler?"
   */
  title?: string;
  
  /**
   * Fondo de la sección (opcional)
   * Por defecto: "bg-gray-50"
   */
  backgroundColor?: string;
  
  /**
   * Mostrar enlace a página de tarifas (opcional)
   * Por defecto: true
   */
  showMoreLink?: boolean;
}

export function ExtrasSection({ 
  title, 
  backgroundColor = "bg-gray-50",
  showMoreLink = true 
}: ExtrasSectionProps) {
  const { t } = useLanguage();
  
  const sectionTitle = title || t("¿Qué incluye tu alquiler?");
  
  return (
    <section className={`py-16 lg:py-24 ${backgroundColor}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900 mb-4">
            {sectionTitle}
          </h2>
          <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
            {t("Qué está incluido en el precio y qué tiene coste adicional")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {/* Incluido sin coste */}
          <div className="bg-gradient-to-br from-green-50 to-green-100/50 border-2 border-green-200 rounded-3xl p-6 lg:p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-6 lg:mb-8">
              <div className="bg-green-500 p-3 rounded-2xl shadow-lg">
                <CheckCircle className="h-7 w-7 lg:h-8 lg:w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl lg:text-3xl font-heading font-bold text-green-900">
                  {t("Incluido sin coste")}
                </h3>
                <p className="text-green-700 text-sm lg:text-base font-medium">
                  {t("Todo lo necesario para que disfrutes al máximo de tu viaje")}
                </p>
              </div>
            </div>
            
            <ul className="space-y-3 lg:space-y-4">
              {includedItems.map((item) => (
                <li key={item} className="flex items-start gap-3 bg-white p-3 lg:p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-800 font-medium text-sm lg:text-base">{t(item)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Extras opcionales */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-2 border-blue-200 rounded-3xl p-6 lg:p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-6 lg:mb-8">
              <div className="bg-furgocasa-blue p-3 rounded-2xl shadow-lg">
                <Euro className="h-7 w-7 lg:h-8 lg:w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl lg:text-3xl font-heading font-bold text-furgocasa-blue">
                  {t("Extras opcionales")}
                </h3>
                <p className="text-blue-700 text-sm lg:text-base font-medium">
                  {t("Complementos adicionales para mayor comodidad")}
                </p>
              </div>
            </div>

            <ul className="space-y-3 lg:space-y-4">
              {optionalExtras.map((item) => (
                <li 
                  key={item.name} 
                  className={`flex items-center justify-between p-3 lg:p-4 rounded-xl shadow-sm hover:shadow-md transition-all ${
                    item.highlight 
                      ? 'bg-gradient-to-r from-orange-50 to-furgocasa-orange/10 border-2 border-furgocasa-orange/30 hover:border-furgocasa-orange' 
                      : 'bg-white'
                  }`}
                >
                  <span className={`font-medium text-sm lg:text-base ${
                    item.highlight ? 'text-gray-900 font-bold' : 'text-gray-800'
                  }`}>
                    {t(item.name)}
                    {item.highlight && (
                      <span className="ml-2 text-xs bg-furgocasa-orange text-white px-2 py-0.5 rounded-full font-bold uppercase">
                        {t("Popular")}
                      </span>
                    )}
                  </span>
                  <span className={`px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg font-bold text-xs lg:text-sm whitespace-nowrap ${
                    item.highlight
                      ? 'bg-furgocasa-orange text-white shadow-md'
                      : 'bg-furgocasa-blue/10 text-furgocasa-blue'
                  }`}>
                    {item.price}{item.unit} / {t(item.per)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Información destacada */}
        <div className="mt-8 lg:mt-12 max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-furgocasa-orange/10 via-yellow-50 to-furgocasa-orange/10 border-2 border-furgocasa-orange/30 rounded-2xl p-6 lg:p-8">
            <div className="flex items-start gap-4">
              <div className="bg-furgocasa-orange/20 p-2 rounded-xl flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-furgocasa-orange" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2 text-lg lg:text-xl">
                  {t("Todo incluido para tu aventura")}
                </h4>
                <p className="text-gray-700 leading-relaxed text-sm lg:text-base">
                  {t("Kilómetros ilimitados, equipamiento completo de cocina y camping, conductores adicionales sin coste extra. Solo añade los extras opcionales que necesites para personalizar tu experiencia.")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enlace a tarifas completas */}
        {showMoreLink && (
          <div className="text-center mt-8 lg:mt-12">
            <LocalizedLink
              href="/tarifas"
              className="inline-flex items-center gap-2 text-furgocasa-blue font-bold uppercase tracking-wider hover:text-furgocasa-blue-dark transition-colors text-base lg:text-lg group"
            >
              {t("Ver información completa de tarifas y condiciones")} 
              <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
            </LocalizedLink>
          </div>
        )}
      </div>
    </section>
  );
}
