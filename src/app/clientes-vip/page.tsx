"use client";

import { Header } from "@/components/layout/header";
import { useLanguage } from "@/contexts/language-context";
import { Footer } from "@/components/layout/footer";
import { LocalizedLink } from "@/components/localized-link";
import { Crown, Percent, Gift, Calendar, Star, CheckCircle, ArrowRight } from "lucide-react";

// Metadata movido a layout.tsx o se debe crear un archivo metadata.ts separado

const benefits = [
  { icon: Percent, title: "10% de descuento permanente", description: "En todos tus alquileres, sin códigos ni condiciones" },
  { icon: Calendar, title: "Prioridad en reservas", description: "Acceso anticipado a fechas de alta demanda" },
  { icon: Gift, title: "Extras gratuitos", description: "Sillas de camping, nevera portátil y kit de playa incluidos" },
  { icon: Star, title: "Late check-out gratuito", description: "Devuelve hasta las 14:00 sin coste adicional" },
];

const howToJoin = [
  { step: "1", title: "Alquila con nosotros", description: "Completa tu primer alquiler con Furgocasa" },
  { step: "2", title: "Acumula días", description: "Por cada 10 días de alquiler, entras en el programa VIP" },
  { step: "3", title: "Disfruta los beneficios", description: "Automáticamente en tu siguiente reserva" },
];

export default function ClientesVipPage() {
  const { t } = useLanguage();
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <section className="bg-gradient-to-br from-yellow-500 to-yellow-600 py-16">
          <div className="container mx-auto px-4 text-center">
            <Crown className="h-16 w-16 text-white mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{t("Clientes VIP Furgocasa")}</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">{t("Nuestros clientes más fieles merecen un trato especial. Descubre todas las ventajas de ser VIP.")}</p>
          </div>
        </section>

        {/* Beneficios */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">{t("Beneficios exclusivos")}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="bg-gray-50 rounded-xl p-6 text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="h-8 w-8 text-yellow-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Más beneficios */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">{t("Y además...")}</h2>
            <div className="max-w-2xl mx-auto space-y-4">
              {[
                "Acceso a ofertas exclusivas antes que nadie",
                "Línea de atención preferente",
                "Invitaciones a eventos y quedadas VIP",
                "Posibilidad de probar nuevos vehículos antes de añadirlos a la flota",
                "Regalo de bienvenida en cada alquiler",
                "Sin fianza adicional (sujeto a historial)",
                "Flexibilidad en cambios de fechas sin penalización",
                "Descuento en parking Furgocasa",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white p-4 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cómo unirse */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">{t("¿Cómo me hago VIP?")}</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              {howToJoin.map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-16 h-16 bg-furgocasa-orange text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">{item.step}</div>
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-gray-500 mt-8">También puedes acceder directamente comprando la tarjeta VIP por 99€ (válida 2 años)</p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-furgocasa-blue">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">{t("¿Ya eres cliente?")}</h2>
            <p className="text-white/80 mb-8">{t("Comprueba si ya cumples los requisitos para ser VIP")}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <LocalizedLink href="/contacto" className="inline-flex items-center gap-2 bg-yellow-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-yellow-600 transition-colors">
                <Crown className="h-5 w-5" />Consultar mi estado VIP
              </LocalizedLink>
              <LocalizedLink href="/reservar" className="inline-flex items-center gap-2 bg-white text-furgocasa-blue font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors">
                Hacer mi primera reserva<ArrowRight className="h-5 w-5" />
              </LocalizedLink>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
