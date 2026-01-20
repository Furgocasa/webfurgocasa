"use client";

import { ChevronDown, HelpCircle, Search } from"lucide-react";
import { useState } from"react";
import { useLanguage } from"@/contexts/language-context";
export default function FaqsPage() {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question:"Requisitos para alquilar una camper",
      answer:"Para alquilar una de nuestras campers es necesario tener al menos 25 años y 2 años de antigüedad en el carnet de conducir tipo B. Además, se requiere una fianza de 600€ que se devuelve al finalizar el alquiler si todo está correcto."
    },
    {
      question:"¿Qué incluye el precio del alquiler?",
      answer:"El precio incluye kilometraje ilimitado (para alquileres de más de 7 días), seguro a todo riesgo con franquicia, asistencia en carretera 24h, menaje de cocina completo, kit de limpieza, calzos niveladores, cable de conexión eléctrica y manguera de agua."
    },
    {
      question:"¿Puedo viajar con mi mascota?",
      answer:"¡Sí! En Furgocasa somos pet-friendly. Puedes viajar con tu mascota abonando un suplemento de limpieza extra. Solo pedimos que nos avises al hacer la reserva y que cuides el interior del vehículo."
    },
    {
      question:"¿Dónde puedo recoger y devolver la camper?",
      answer:"Nuestra base principal está en Murcia. Las entregas y devoluciones se realizan en nuestras instalaciones. Ofrecemos servicio de transfer al aeropuerto o estación de tren bajo petición y con coste adicional."
    },
    {
      question:"¿Qué pasa si tengo una avería durante el viaje?",
      answer:"Contamos con asistencia en carretera 24/7 en toda Europa. Además, dispones de nuestro teléfono de soporte técnico y el chat de IA para resolver dudas menores o guiarte en caso de incidencia."
    },
    {
      question:"¿Hay límite de kilómetros?",
      answer:"Para alquileres de 7 días o más, el kilometraje es ilimitado. Para alquileres más cortos, incluimos 300km por día. El exceso se cobra a 0,25€/km."
    }
  ];

  return (
    <>
<main className="min-h-screen bg-gray-50 font-amiko">
        {/* Hero */}
        <section className="bg-gradient-to-br from-furgocasa-blue via-furgocasa-blue-dark to-gray-900 py-20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <HelpCircle className="h-16 w-16 text-white/20 mx-auto mb-6" />
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6">
              {t("Preguntas Frecuentes")}
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto font-light leading-relaxed">
              {t("Resolvemos todas tus dudas para que viajes tranquilo")}
            </p>
          </div>
        </section>

        <section className="py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              {/* Search placeholder */}
              <div className="relative mb-8 md:mb-12">
                <input 
                  type="text" 
                  placeholder={t("Buscar una pregunta...")} 
                  className="w-full px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl border-2 border-gray-100 focus:border-furgocasa-blue focus:ring-4 focus:ring-furgocasa-blue/10 transition-all outline-none pl-10 md:pl-12 text-base md:text-lg shadow-sm"
                />
                <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 md:h-5 md:w-5" />
              </div>

              <div className="space-y-3 md:space-y-4">
                {faqs.map((faq, index) => (
                  <div 
                    key={index}
                    className={`bg-white rounded-xl md:rounded-2xl border transition-all duration-300 ${openIndex === index ? 'border-furgocasa-blue shadow-lg ring-1 ring-furgocasa-blue/20' : 'border-gray-100 hover:border-gray-300'}`}
                  >
                    <button
                      onClick={() => setOpenIndex(openIndex === index ? null : index)}
                      className="w-full px-4 md:px-6 py-4 md:py-5 flex items-center justify-between text-left focus:outline-none gap-3"
                    >
                      <span className={`font-heading font-bold text-sm md:text-lg ${openIndex === index ? 'text-furgocasa-blue' : 'text-gray-800'}`}>
                        {t(faq.question)}
                      </span>
                      <ChevronDown className={`h-4 w-4 md:h-5 md:w-5 text-gray-400 flex-shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-180 text-furgocasa-blue' : ''}`} />
                    </button>
                    
                    <div className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="px-4 md:px-6 pb-4 md:pb-6 text-sm md:text-base text-gray-600 leading-relaxed border-t border-gray-100 pt-3 md:pt-4">
                        {t(faq.answer)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Still have questions? */}
              <div className="mt-10 md:mt-16 text-center bg-blue-50 rounded-2xl md:rounded-3xl p-6 md:p-10 border border-blue-100">
                <h3 className="text-xl md:text-2xl font-heading font-bold text-gray-900 mb-3 md:mb-4">{t("¿No encuentras lo que buscas?")}</h3>
                <p className="text-sm md:text-base text-gray-600 mb-6 md:mb-8 max-w-lg mx-auto">
                  {t("Si tienes alguna duda específica que no aparece aquí, no dudes en contactarnos directamente.")}
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
                  <a href="https://wa.me/34868364161" className="bg-[#25D366] text-white font-bold py-3 px-6 md:px-8 rounded-xl hover:bg-[#128C7E] transition-colors shadow-md text-sm md:text-base">
                    {t("WhatsApp")}
                  </a>
                  <a href="/contacto" className="bg-white text-furgocasa-blue border border-furgocasa-blue font-bold py-3 px-6 md:px-8 rounded-xl hover:bg-blue-50 transition-colors shadow-sm text-sm md:text-base">
                    {t("Formulario de contacto")}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
</>
  );
}
