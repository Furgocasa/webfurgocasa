import { type LucideIcon } from "lucide-react";
import { LocalizedLink } from "@/components/localized-link";
import { translateServer } from "@/lib/i18n/server-translation";
import type { Locale } from "@/lib/i18n/config";

export interface ServiceItem {
  icon: LucideIcon;
  /** Título de la tarjeta. Si empieza por letra, se mostrará en uppercase por CSS. */
  title: string;
  /** Descripción breve. */
  description: string;
  /** Destino del enlace localizado. */
  href: string;
}

interface ServicesGridProps {
  locale: Locale;
  /** Encabezado H2. Si no se pasa, usa "Servicios que te hacen la vida más fácil". */
  heading?: string;
  /** Subtítulo gris. Si no se pasa, usa el genérico. */
  subheading?: string;
  /** Listado de servicios (recomendado 4). */
  services: ServiceItem[];
  /** Color de fondo de la sección. Default blanco. */
  backgroundClassName?: string;
}

/**
 * Rejilla de 4 tarjetas de servicio con estética corporativa Furgocasa.
 * - Cada tarjeta alterna color (azul/naranja) en el border-t-4 y en el cuadrado del icono
 * - H3 azul uppercase, descripción gris
 * - shadow-corp (azul corporativo), hover lift
 *
 * Usado en: homes (es/en/de/fr) y landings que emulan la home.
 */
export function ServicesGrid({
  locale,
  heading,
  subheading,
  services,
  backgroundClassName = "bg-white",
}: ServicesGridProps) {
  const t = (key: string) => translateServer(key, locale);
  const finalHeading = heading ?? t("Servicios que te hacen la vida más fácil");
  const finalSubheading = subheading ?? t("Todo lo que necesitas para disfrutar de tu experiencia camper");

  return (
    <section className={`py-12 lg:py-16 ${backgroundClassName}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl lg:text-5xl font-heading font-black text-furgocasa-blue uppercase tracking-wide mb-4">
            {finalHeading}
          </h2>
          <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
            {finalSubheading}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {services.map((service, index) => {
            const isOdd = index % 2 === 0;
            const borderColor = isOdd ? "border-furgocasa-blue" : "border-furgocasa-orange";
            const iconBg = isOdd ? "bg-furgocasa-blue" : "bg-furgocasa-orange";
            const ServiceIcon = service.icon;

            return (
              <LocalizedLink
                key={index}
                href={service.href}
                className={`bg-white p-6 lg:p-7 rounded-2xl shadow-corp hover:shadow-corp-lg border-t-4 ${borderColor} transition-all duration-300 transform hover:-translate-y-1 group`}
              >
                <div
                  className={`w-14 h-14 rounded-xl ${iconBg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}
                >
                  <ServiceIcon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-lg font-heading font-bold text-furgocasa-blue mb-2 uppercase tracking-wide">
                  {service.title}
                </h3>
                <p className="text-sm text-gray-600">{service.description}</p>
              </LocalizedLink>
            );
          })}
        </div>
      </div>
    </section>
  );
}
