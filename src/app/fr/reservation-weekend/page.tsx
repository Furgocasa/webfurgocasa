import { LocalizedLink } from "@/components/localized-link";
import { Calendar, Clock, CheckCircle, ArrowRight, AlertCircle, Phone, Euro } from "lucide-react";
import { Metadata } from "next";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { translateServer } from "@/lib/i18n/server-translation";
import type { Locale } from "@/lib/i18n/config";

interface PageProps {
  ;
}

const COMO_RESERVAR_FIN_SEMANA_METADATA: Metadata = {
  title: "Cómo Reservar un Fin de Semana",
  description: "Guía completa para alquilar una camper de fin de semana. Horarios, precios y condiciones especiales para escapadas cortas.",
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale: Locale = 'fr'; // Locale fijo
  
  const alternates = buildCanonicalAlternates('/como-reservar-fin-semana', locale);

  return {
    ...COMO_RESERVAR_FIN_SEMANA_METADATA,
    alternates,
    openGraph: {
      ...COMO_RESERVAR_FIN_SEMANA_METADATA,
      url: alternates.canonical,
    },
  };
}

const steps = [
  { step:"1", title:"Elige tu fecha", desc:"Selecciona el viernes de recogida en nuestro calendario", icon: Calendar },
  { step:"2", title:"Selecciona el vehículo", desc:"Elige entre los campers disponibles para esas fechas", icon: CheckCircle },
  { step:"3", title:"Añade extras", desc:"Sillas, mesa, kit de playa... lo que necesites", icon: CheckCircle },
  { step:"4", title:"Confirma y paga", desc:"Solo el 30% de señal. El resto a la recogida", icon: Euro },
];

export default async function LocaleComoReservarFinSemanaPage({ params }: PageProps) {
  const locale: Locale = 'fr'; // Locale fijo
  
  const t = (key: string) => translateServer(key, locale);
  
  return (
    <>
<main className="min-h-screen bg-gray-50">
        <section className="bg-gradient-to-br from-furgocasa-blue to-furgocasa-blue-dark py-16">
          <div className="container mx-auto px-4 text-center">
            <Calendar className="h-16 w-16 text-furgocasa-orange mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">¿Cómo reservar un fin de semana?</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">Escapadas cortas a partir de 2 noches. Perfecto para probar la experiencia camper.</p>
          </div>
        </section>

        {/* Horarios */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center flex items-center justify-center gap-2">
              <Clock className="h-7 w-7 text-furgocasa-orange" />Horarios de fin de semana
            </h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <h3 className="font-bold text-green-800 mb-4">Recogida - VIERNES</h3>
                <div className="space-y-2 text-green-700">
                  <p className="flex items-center gap-2"><Clock className="h-4 w-4" />De 17:00 a 19:00</p>
                  <p className="text-sm">Te esperamos para entregarte el camper totalmente preparado y explicarte su funcionamiento.</p>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="font-bold text-blue-800 mb-4">Devolución - DOMINGO o LUNES</h3>
                <div className="space-y-2 text-blue-700">
                  <p className="flex items-center gap-2"><Clock className="h-4 w-4" />Domingo antes de las 20:00</p>
                  <p className="flex items-center gap-2"><Clock className="h-4 w-4" />Lunes antes de las 10:00</p>
                  <p className="text-sm">Elige la opción que mejor te convenga. La devolución el lunes cuenta como día extra.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pasos */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Cómo reservar paso a paso</h2>
            <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {steps.map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-16 h-16 bg-furgocasa-orange text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">{item.step}</div>
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <LocalizedLink href={`/${locale}/reservar`} className="inline-flex items-center gap-2 bg-furgocasa-orange text-white font-semibold py-3 px-8 rounded-lg hover:bg-furgocasa-orange-dark transition-colors">
                Reservar ahora<ArrowRight className="h-5 w-5" />
              </LocalizedLink>
            </div>
          </div>
        </section>

        {/* Precios */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Precios de fin de semana</h2>
            <div className="max-w-2xl mx-auto">
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-gray-900">2 noches (Viernes - Domingo)</span>
                  <span className="text-2xl font-bold text-furgocasa-orange">Desde 220€</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-gray-900">3 noches (Viernes - Lunes)</span>
                  <span className="text-2xl font-bold text-furgocasa-orange">Desde 300€</span>
                </div>
                <p className="text-sm text-gray-500">* Precios orientativos. Varían según vehículo y temporada.</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-700">
                    <p className="font-semibold mb-1">Importante</p>
                    <p>En temporada alta (julio, agosto, puentes festivos) el alquiler mínimo puede ser de 7 días. Consulta disponibilidad.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Incluido */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">¿Qué incluye?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {["Seguro a todo riesgo","Asistencia en carretera 24h","Kilómetros ilimitados","Kit de cocina completo","Ropa de cama y toallas","Sillas y mesa de camping","Depósito de agua lleno","Bombona de gas","Segundo conductor",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 bg-white p-3 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Preguntas frecuentes</h2>
            <div className="max-w-2xl mx-auto space-y-4">
              {[
                { q:"¿Puedo recoger el sábado por la mañana?", a:"Sí, pero en ese caso la devolución sería el lunes antes de las 10:00 para completar las 2 noches mínimas." },
                { q:"¿Hay algún recargo por fin de semana?", a:"No, el precio por día es el mismo. Solo aplicamos las tarifas de temporada correspondientes." },
                { q:"¿Puedo alargar el alquiler si me gusta?", a:"Sí, si el vehículo está disponible puedes alargar tu estancia. Avísanos con la mayor antelación posible." },
                { q:"¿Y si llueve todo el fin de semana?", a:"Las condiciones meteorológicas no son motivo de cancelación. Pero recuerda que una camper es genial también con lluvia." },
              ].map((faq, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-bold text-gray-900 mb-2">{faq.q}</h3>
                  <p className="text-gray-600">{faq.a}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-6">
              <LocalizedLink href={`/${locale}/faqs`} className="text-furgocasa-orange hover:underline">Ver todas las FAQs →</LocalizedLink>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-furgocasa-blue">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">¿Listo para tu escapada?</h2>
            <p className="text-white/80 mb-8">Reserva ahora y empieza a planear tu aventura de fin de semana</p>
            <div className="flex flex-wrap justify-center gap-4">
              <LocalizedLink href={`/${locale}/reservar`} className="inline-flex items-center gap-2 bg-furgocasa-orange text-white font-semibold py-3 px-8 rounded-lg hover:bg-furgocasa-orange-dark transition-colors">
                Reservar fin de semana<ArrowRight className="h-5 w-5" />
              </LocalizedLink>
              <a href="tel:+34968000000" className="inline-flex items-center gap-2 bg-white text-furgocasa-blue font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors">
                <Phone className="h-5 w-5" />Llamar
              </a>
            </div>
          </div>
        </section>
      </main>
</>
  );
}
