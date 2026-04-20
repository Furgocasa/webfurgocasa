import { ReactNode } from "react";
import { Info, type LucideIcon } from "lucide-react";

export interface IntroChip {
  icon: LucideIcon;
  label: ReactNode;
}

interface IntroCardProps {
  /** ID usado como destino del indicador de scroll del hero (default: "home-intro"). */
  id?: string;
  /** Título en negrita al inicio del párrafo (ej: "¿Qué es Furgocasa?"). */
  title: string;
  /** Contenido del párrafo (texto libre / tags inline). */
  children: ReactNode;
  /** Icono del bloque (default: Info). */
  icon?: LucideIcon;
  /** Chips opcionales con datos clave al final de la tarjeta. */
  chips?: IntroChip[];
}

/**
 * Tarjeta introductoria corporativa Furgocasa.
 * - Fondo gris claro con borde izquierdo naranja
 * - Icono en cuadrado naranja
 * - Párrafo destacado con strong azul al inicio
 * - Chips redondos con datos clave
 *
 * Usado tras el hero en homes y landings como "respuesta breve" (optimizado SEO/IA).
 */
export function IntroCard({ id = "home-intro", title, children, icon: Icon = Info, chips }: IntroCardProps) {
  return (
    <section id={id} className="py-10 lg:py-12 bg-white border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-gray-50 border-l-4 border-furgocasa-orange rounded-r-2xl p-6 lg:p-8 shadow-corp">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-furgocasa-orange/10 flex items-center justify-center">
              <Icon className="h-5 w-5 text-furgocasa-orange" />
            </div>
            <div className="flex-1">
              <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                <strong className="text-furgocasa-blue">{title}</strong> {children}
              </p>

              {chips && chips.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {chips.map((chip, index) => {
                    const ChipIcon = chip.icon;
                    return (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1.5 bg-white border border-furgocasa-blue/20 text-furgocasa-blue text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full"
                      >
                        <ChipIcon className="h-3.5 w-3.5" />
                        {chip.label}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
