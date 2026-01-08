"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { LocalizedLink } from "@/components/localized-link";
import { Bot, MessageSquare, Map, Wrench, Sparkles, ChevronRight, Brain, Zap, Info } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
export default function InteligenciaArtificialPage() {
  const { t } = useLanguage();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 font-amiko">
        {/* Hero Section - Modernizado */}
        <section className="bg-gradient-to-br from-purple-900 via-blue-900 to-furgocasa-blue py-20 relative overflow-hidden">
          {/* Decoración de fondo */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
            <Sparkles className="absolute top-10 left-10 text-white/20 w-16 h-16 animate-pulse" />
            <Sparkles className="absolute top-32 right-20 text-white/20 w-12 h-12 animate-pulse" style={{ animationDelay: '1s' }} />
            <Bot className="absolute bottom-32 right-1/3 text-white/10 w-24 h-24 animate-bounce" style={{ animationDelay: '1.5s' }} />
          </div>

          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="inline-block mb-6 p-4 bg-white/10 backdrop-blur-md rounded-full">
              <Brain className="h-16 w-16 text-furgocasa-orange mx-auto" />
            </div>
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6">
              {t("Inteligencia Artificial")}
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto font-light leading-relaxed">
              {t("La IA al servicio de tu viaje en Camper")}
            </p>
          </div>
        </section>

        {/* Intro Section - Modernizado */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed">
                <p className="text-xl text-gray-800 font-medium mb-8">
                  {t("En Furgocasa, la tecnología siempre ha sido nuestra aliada, pero ahora damos un paso más allá: ponemos la Inteligencia Artificial al alcance de nuestros clientes.")}
                </p>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-3xl mb-10 border border-blue-100">
                  <p className="mb-6">
                    {t("Después de meses de trabajo y mucha ilusión, hemos desarrollado dos herramientas revolucionarias que transformarán tu experiencia de viaje en camper:")}
                  </p>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <span className="bg-green-500 text-white p-1 rounded-full mt-1"><Bot className="h-4 w-4" /></span>
                      <span><strong className="text-gray-900">{t("GPT Chat de Viaje:")}</strong> {t("Tu guía personalizada para planificar rutas, pernoctas y crear bitácoras.")}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-[#25D366] text-white p-1 rounded-full mt-1"><MessageSquare className="h-4 w-4" /></span>
                      <span><strong className="text-gray-900">{t("WhatsApp Bot:")}</strong> {t("Asistencia técnica instantánea para resolver dudas sobre la camper 24/7.")}</span>
                    </li>
                  </ul>
                </div>

                <p className="mb-8">
                  {t("Estas herramientas son el resultado de nuestro compromiso con la innovación y con vosotros, nuestros clientes. La IA ya no es solo para nosotros en la gestión interna; ahora es tuya para que disfrutes al máximo de cada kilómetro.")}
                </p>

                <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-lg flex items-start gap-4">
                  <Info className="h-6 w-6 flex-shrink-0 mt-1" />
                  <p className="font-medium">
                    {t("El acceso a estos Chats de Inteligencia Artificial se te proporcionará una vez realizada la reserva, a pocos días del comienzo de tu viaje en camper.")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tools Section - Modernizado */}
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto">
              {/* GPT Chat */}
              <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 group border border-gray-100">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-10 text-white relative overflow-hidden h-64 flex flex-col justify-center">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                        <Bot className="h-8 w-8 text-white" />
                      </div>
                      <span className="text-sm font-bold bg-black/20 px-3 py-1 rounded-full uppercase tracking-wider">ChatGPT Powered</span>
                    </div>
                    <h3 className="text-4xl font-heading font-bold mb-2">
                      {t("GPT CHAT VIAJE")}
                    </h3>
                    <p className="text-green-100 text-lg font-medium">
                      {t("Tu guía experto personal")}
                    </p>
                  </div>
                </div>

                <div className="p-10">
                  <ul className="space-y-4 mb-8">
                    {[
                      "Planifica tu ruta perfecta origen-destino",
                      "Diseña itinerarios a medida",
                      "Consejos sobre dónde pernoctar",
                      "Redacta tu cuaderno de bitácora"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="p-1 bg-green-100 rounded-full mt-0.5"><ChevronRight className="h-4 w-4 text-green-600" /></div>
                        <span className="text-gray-700 font-medium">{t(item)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="bg-green-50 rounded-xl p-4 text-sm text-green-800 border border-green-100">
                    <strong>{t("Nota:")}</strong> {t("Requiere cuenta de ChatGPT")}
                  </div>
                </div>
              </div>

              {/* WhatsApp Bot */}
              <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 group border border-gray-100">
                <div className="bg-gradient-to-br from-[#25D366] to-[#128C7E] p-10 text-white relative overflow-hidden h-64 flex flex-col justify-center">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                        <MessageSquare className="h-8 w-8 text-white" />
                      </div>
                      <span className="text-sm font-bold bg-black/20 px-3 py-1 rounded-full uppercase tracking-wider">WhatsApp</span>
                    </div>
                    <h3 className="text-4xl font-heading font-bold mb-2">
                      {t("IA ASISTENTE")}
                    </h3>
                    <p className="text-green-100 text-lg font-medium">
                      {t("Soporte técnico inmediato")}
                    </p>
                  </div>
                </div>

                <div className="p-10">
                  <ul className="space-y-4 mb-8">
                    {[
                      "Resuelve dudas de funcionamiento",
                      "Ayuda instantánea ante incidencias",
                      "Admite texto y notas de voz",
                      "Instrucciones técnicas precisas"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="p-1 bg-[#25D366]/20 rounded-full mt-0.5"><Wrench className="h-4 w-4 text-[#128C7E]" /></div>
                        <span className="text-gray-700 font-medium">{t(item)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="bg-[#25D366]/10 rounded-xl p-4 text-sm text-[#128C7E] border border-[#25D366]/20">
                    <strong>{t("Disponible:")}</strong> {t("24/7 durante todo tu viaje")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Grid - Modernizado */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-center text-gray-900 mb-16">
              {t("Innovación para tu aventura")}
            </h2>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                { icon: Sparkles, color: "text-purple-600", bg: "bg-purple-100", title: "Tecnología Avanzada", desc: "IA de última generación adaptada al caravaning" },
                { icon: Map, color: "text-blue-600", bg: "bg-blue-100", title: "Personalización", desc: "Rutas y consejos adaptados a tus gustos" },
                { icon: Zap, color: "text-yellow-600", bg: "bg-yellow-100", title: "Rapidez", desc: "Soluciones al instante, sin esperas" },
              ].map((item, i) => (
                <div key={i} className="text-center p-8 rounded-3xl hover:bg-gray-50 transition-colors">
                  <div className={`w-20 h-20 ${item.bg} rounded-full flex items-center justify-center mx-auto mb-6`}>
                    <item.icon className={`h-10 w-10 ${item.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{t(item.title)}</h3>
                  <p className="text-gray-600">{t(item.desc)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Final - Modernizado */}
        <section className="py-20 bg-gradient-to-br from-furgocasa-orange to-red-500 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[url('/images/pattern.png')]"></div>
          <div className="container mx-auto px-4 relative z-10">
            <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6">
              {t("¿Te animas a probarlo?")}
            </h2>
            <p className="text-white/90 text-xl max-w-2xl mx-auto mb-10 font-light">
              {t("Reserva tu camper ahora y disfruta de la tecnología más avanzada en tu viaje.")}
            </p>
            <LocalizedLink
              href="/ofertas"
              className="inline-block bg-white text-furgocasa-orange font-bold text-xl py-4 px-12 rounded-full hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
              {t("Ver Ofertas")}
            </LocalizedLink>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
