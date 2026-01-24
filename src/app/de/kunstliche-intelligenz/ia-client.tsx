"use client";

import { LocalizedLink } from "@/components/localized-link";
import { Bot, MessageSquare, Map, Wrench, Sparkles, ChevronRight, Brain, Zap, Info } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

export function IAClient() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-gray-50 font-amiko">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-900 via-blue-900 to-furgocasa-blue py-20 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
          <Sparkles className="absolute top-10 left-10 text-white/20 w-16 h-16 animate-pulse" />
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

      {/* Intro Section */}
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
                    <MessageSquare className="h-6 w-6 text-furgocasa-blue flex-shrink-0 mt-1" />
                    <span><strong>{t("Chatbot IA:")}</strong> {t("Tu asistente virtual 24/7 para resolver dudas sobre el camper")}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Map className="h-6 w-6 text-furgocasa-orange flex-shrink-0 mt-1" />
                    <span><strong>{t("Planificador de Rutas IA:")}</strong> {t("Crea itinerarios personalizados en segundos")}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Chatbot */}
            <div className="bg-white rounded-3xl p-10 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <MessageSquare className="h-10 w-10 text-furgocasa-blue" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-gray-900 mb-4">
                {t("Chatbot Inteligente")}
              </h3>
              <p className="text-gray-600 mb-6">
                {t("¿Tienes dudas sobre el funcionamiento del camper? Nuestro chatbot con IA te ayuda en tiempo real, 24 horas al día, 7 días a la semana.")}
              </p>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-furgocasa-orange" />
                  {t("Respuestas instantáneas")}
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-furgocasa-orange" />
                  {t("Disponible 24/7")}
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-furgocasa-orange" />
                  {t("Conoce todos nuestros vehículos")}
                </li>
              </ul>
            </div>

            {/* Route Planner */}
            <div className="bg-white rounded-3xl p-10 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-20 h-20 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                <Map className="h-10 w-10 text-furgocasa-orange" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-gray-900 mb-4">
                {t("Planificador de Rutas")}
              </h3>
              <p className="text-gray-600 mb-6">
                {t("Deja que la IA planifique tu viaje perfecto. Indica tus preferencias y obtén un itinerario personalizado con paradas, áreas de pernocta y puntos de interés.")}
              </p>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-furgocasa-orange" />
                  {t("Rutas personalizadas")}
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-furgocasa-orange" />
                  {t("Áreas de pernocta recomendadas")}
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-furgocasa-orange" />
                  {t("Puntos de interés camper-friendly")}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-furgocasa-blue to-furgocasa-blue-dark text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6">
            {t("¿Listo para probarlo?")}
          </h2>
          <p className="text-blue-100 mb-10 text-xl max-w-2xl mx-auto">
            {t("Reserva tu camper y accede a todas nuestras herramientas de IA")}
          </p>
          <LocalizedLink 
            href="/reservar" 
            className="inline-block bg-furgocasa-orange text-white font-bold py-4 px-10 rounded-xl hover:bg-furgocasa-orange-dark transition-all shadow-lg"
          >
            {t("Reservar ahora")}
          </LocalizedLink>
        </div>
      </section>
    </main>
  );
}
