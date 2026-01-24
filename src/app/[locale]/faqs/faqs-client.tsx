"use client";

import { ChevronDown, HelpCircle, Search } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/language-context";

export function FaqsClient() {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "Requisitos para alquilar una camper",
      answer: "Para alquilar una de nuestras campers es necesario tener al menos 25 años y 2 años de antigüedad en el carnet de conducir tipo B. Además, se requiere una fianza de 600€ que se devuelve al finalizar el alquiler si todo está correcto."
    },
    {
      question: "¿Qué incluye el precio del alquiler?",
      answer: "El precio incluye kilometraje ilimitado (para alquileres de más de 7 días), seguro a todo riesgo con franquicia, asistencia en carretera 24h, menaje de cocina completo, kit de limpieza, calzos niveladores, cable de conexión eléctrica y manguera de agua."
    },
    {
      question: "¿Puedo viajar con mi mascota?",
      answer: "¡Sí! En Furgocasa somos pet-friendly. Puedes viajar con tu mascota abonando un suplemento de limpieza extra. Solo pedimos que nos avises al hacer la reserva y que cuides el interior del vehículo."
    },
    {
      question: "¿Dónde puedo recoger y devolver la camper?",
      answer: "Nuestra base principal está en Murcia. Las entregas y devoluciones se realizan en nuestras instalaciones. Ofrecemos servicio de transfer al aeropuerto o estación de tren bajo petición y con coste adicional."
    },
    {
      question: "¿Qué pasa si tengo una avería durante el viaje?",
      answer: "Contamos con asistencia en carretera 24/7 en toda Europa. Además, dispones de nuestro teléfono de soporte técnico y el chat de IA para resolver dudas menores o guiarte en caso de incidencia."
    },
    {
      question: "¿Hay límite de kilómetros?",
      answer: "Para alquileres de 7 días o más, el kilometraje es ilimitado. Para alquileres más cortos, incluimos 300km por día. El exceso se cobra a 0,25€/km."
    }
  ];

  return (
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
            {t("Resolvemos todas tus dudas sobre el alquiler de autocaravanas")}
          </p>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
              >
                <button
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                  <span className="font-heading font-bold text-gray-900 text-lg">{t(faq.question)}</span>
                  <ChevronDown className={`h-5 w-5 text-furgocasa-orange flex-shrink-0 transition-transform ${openIndex === index ? "rotate-180" : ""}`} />
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-5 text-gray-600 leading-relaxed">
                    {t(faq.answer)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("¿No encuentras tu respuesta?")}</h2>
          <p className="text-gray-600 mb-6">{t("Contacta con nosotros y te ayudaremos encantados")}</p>
          <a 
            href="/contacto" 
            className="inline-block bg-furgocasa-orange text-white font-bold py-3 px-8 rounded-xl hover:bg-furgocasa-orange-dark transition-colors"
          >
            {t("Contactar")}
          </a>
        </div>
      </section>
    </main>
  );
}
