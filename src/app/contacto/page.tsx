import { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { LocalizedLink } from "@/components/localized-link";
import { Phone, Mail, MapPin, Clock, MessageSquare, Send } from "lucide-react";
import { translateServer } from "@/lib/i18n/server-translation";

// ✅ METADATOS SEO
export const metadata: Metadata = {
  title: "Contacto | Furgocasa Campervans",
  description: "Contacta con Furgocasa para alquilar tu autocaravana en Murcia. Sede en Casillas, Murcia. Teléfono: 868 36 41 61. Email: info@furgocasa.com",
  keywords: "contacto furgocasa, alquiler autocaravanas murcia contacto, furgocasa murcia, telefono furgocasa",
  openGraph: {
    title: "Contacto | Furgocasa Campervans",
    description: "Contáctanos para alquilar tu autocaravana en Murcia. Sede en Casillas.",
    type: "website",
    locale: "es_ES",
  },
};

export default function ContactoPage() {
  // Usar traducción del servidor (por ahora español por defecto)
  const t = (key: string) => translateServer(key, 'es');
  
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-furgocasa-blue via-furgocasa-blue-dark to-gray-900 py-20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6">
              {t("Contacta con nosotros")}
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto font-light leading-relaxed">
              {t("Estamos aquí para ayudarte a planificar tu aventura perfecta")}
            </p>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {/* Teléfono */}
              <a
                href="tel:+34868364161"
                className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-furgocasa-blue"
              >
                <div className="bg-furgocasa-blue/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4 group-hover:bg-furgocasa-blue group-hover:scale-110 transition-all">
                  <Phone className="h-8 w-8 text-furgocasa-blue group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-heading font-bold text-gray-900 mb-2">
                  {t("Teléfono")}
                </h3>
                <p className="text-furgocasa-blue font-semibold text-xl">868 36 41 61</p>
                <p className="text-sm text-gray-600 mt-2">
                  {t("Llámanos ahora")}
                </p>
              </a>

              {/* Email */}
              <a
                href="mailto:info@furgocasa.com"
                className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-furgocasa-orange"
              >
                <div className="bg-furgocasa-orange/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4 group-hover:bg-furgocasa-orange group-hover:scale-110 transition-all">
                  <Mail className="h-8 w-8 text-furgocasa-orange group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-heading font-bold text-gray-900 mb-2">
                  {t("Email")}
                </h3>
                <p className="text-furgocasa-orange font-semibold text-lg">info@furgocasa.com</p>
                <p className="text-sm text-gray-600 mt-2">
                  {t("Escríbenos")}
                </p>
              </a>

              {/* Dirección */}
              <a
                href="https://maps.google.com/?q=Avenida+Puente+Tocinos+4+Casillas+Murcia"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-green-500"
              >
                <div className="bg-green-500/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4 group-hover:bg-green-500 group-hover:scale-110 transition-all">
                  <MapPin className="h-8 w-8 text-green-500 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-heading font-bold text-gray-900 mb-2">
                  {t("Dirección")}
                </h3>
                <p className="text-gray-700 font-medium">Avenida Puente Tocinos, 4</p>
                <p className="text-gray-700 font-medium">30007 Casillas - Murcia</p>
                <p className="text-sm text-gray-600 mt-2">
                  {t("Ver en mapa")}
                </p>
              </a>

              {/* Horario */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-purple-500">
                <div className="bg-purple-500/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <Clock className="h-8 w-8 text-purple-500" />
                </div>
                <h3 className="text-lg font-heading font-bold text-gray-900 mb-2">
                  {t("Horario")}
                </h3>
                <p className="text-gray-700 font-medium">{t("Lunes a Viernes")}</p>
                <p className="text-purple-600 font-semibold">09:00 - 18:00</p>
                <p className="text-sm text-gray-600 mt-2">
                  {t("Horario comercial")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mapa */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
                  {t("Nuestra ubicación")}
                </h2>
                <p className="text-lg text-gray-600">
                  {t("Visítanos en nuestra sede de Casillas, Murcia")}
                </p>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3143.2!2d-1.099!3d38.007!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzjCsDAwJzI1LjIiTiAxwrAwNScyNi40Ilc!5e0!3m2!1ses!2ses!4v1234567890"
                  width="100%"
                  height="300"
                  className="md:h-[450px]"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación de Furgocasa en Murcia"
                ></iframe>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Quick Links */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-6">
                {t("¿Tienes preguntas?")}
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                {t("Consulta nuestras preguntas frecuentes o contáctanos directamente")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <LocalizedLink
                  href="/faqs"
                  className="inline-flex items-center justify-center gap-2 bg-furgocasa-blue text-white font-heading font-bold px-8 py-4 rounded-xl hover:bg-furgocasa-blue-dark transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <MessageSquare className="h-5 w-5" />
                  {t("Ver Preguntas Frecuentes")}
                </LocalizedLink>
                <a
                  href="tel:+34868364161"
                  className="inline-flex items-center justify-center gap-2 bg-white text-furgocasa-blue border-2 border-furgocasa-blue font-heading font-bold px-8 py-4 rounded-xl hover:bg-furgocasa-blue hover:text-white transition-all duration-200 shadow-lg"
                >
                  <Phone className="h-5 w-5" />
                  {t("Llamar ahora")}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-16 bg-gradient-to-r from-furgocasa-blue to-furgocasa-blue-dark text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
              {t("¿Listo para tu aventura?")}
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              {t("Reserva tu autocaravana camper ahora y comienza a planificar tu viaje")}
            </p>
            <LocalizedLink
              href="/reservar"
              className="inline-flex items-center gap-2 bg-furgocasa-orange hover:bg-furgocasa-orange-dark text-white font-heading font-bold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Send className="h-5 w-5" />
              {t("Reservar ahora")}
            </LocalizedLink>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
