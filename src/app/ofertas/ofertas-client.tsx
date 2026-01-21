"use client";

import { LocalizedLink } from "@/components/localized-link";
import { Snowflake, Tag, Mail, Phone, Copy, Check, Clock, Calendar, Ticket, Gift, Zap, Shield, Map, Smile } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useState } from "react";

export function OfertasClient() {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText("INV2026");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const benefits = [
    { icon: <Zap className="w-8 h-8 text-yellow-500" />, title: "Flota Moderna", desc: "Autocaravanas nuevas y totalmente equipadas para tu comodidad" },
    { icon: <Snowflake className="w-8 h-8 text-blue-400" />, title: "Calefacción Total", desc: "Disfruta del invierno con calefacción estacionaria en todas las campers" },
    { icon: <Map className="w-8 h-8 text-green-500" />, title: "Libertad Total", desc: "Viaja a tu ritmo. Norte, sur, playa, montaña... ¡Tú decides!" },
    { icon: <Phone className="w-8 h-8 text-furgocasa-blue" />, title: "Asistencia 24/7", desc: "Soporte técnico siempre disponible durante todo tu viaje" },
    { icon: <Shield className="w-8 h-8 text-purple-500" />, title: "Sin Sorpresas", desc: "Precio final transparente. Todo incluido desde el principio" },
    { icon: <Smile className="w-8 h-8 text-orange-500" />, title: "Experiencia Única", desc: "Vive momentos inolvidables. Este será TU mejor invierno" },
  ];

  return (
    <main className="min-h-screen bg-gray-50 font-amiko">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-furgocasa-blue via-furgocasa-blue-dark to-gray-900 py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-block mb-6 p-4 bg-white/10 backdrop-blur-md rounded-full animate-bounce">
            <Gift className="h-16 w-16 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6 leading-tight">
            {t("¿Buscas alquilar al mejor precio?")}
          </h1>
          <p className="text-2xl md:text-3xl text-blue-100 font-light tracking-wide max-w-3xl mx-auto">
            {t("Consulta nuestras OFERTAS especiales y viaja barato")}
          </p>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8 text-gray-600 text-lg leading-relaxed bg-gray-50 p-10 md:p-14 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-furgocasa-blue mb-8 text-center">
              {t("Alquiler de furgonetas camper baratas")}
            </h2>
            <p>
              {t("Con el objetivo de aumentar la ocupación y lograr que todos los clientes que desean viajar en una de nuestras campers puedan hacerlo aprovechando los huecos que se generan como consecuencia de la aplicación de los periodos mínimos de alquiler creamos esta sección.")}
            </p>
            <div className="flex items-start gap-4 p-6 bg-blue-50 rounded-2xl border border-blue-100">
              <Tag className="h-6 w-6 text-furgocasa-blue flex-shrink-0 mt-1" />
              <p className="font-medium text-furgocasa-blue-dark">
                {t("En ella iremos mostrando distintas OFERTAS DE ULTIMA HORA para los periodos que se queden libres entre alquileres.")}
              </p>
            </div>
            <p>
              {t("Esta es una sección dinámica, que iremos cambiando regularmente, así que te recomendamos visitarla de vez en cuando y buscar tu oportunidad.")}
            </p>
            <p className="font-bold text-gray-800 text-xl text-center">
              {t("Si las fechas te encajan podrás disfrutar de tu alquiler con IMPORTANTES DESCUENTOS.")}
            </p>
            <p className="text-sm text-gray-400 italic text-center pt-4">
              {t("* Las ofertas de esta sección no son acumulables con otras promociones.")}
            </p>
          </div>
        </div>
      </section>

      {/* Oferta Principal - Invierno Mágico 2026 */}
      <section className="py-24 bg-gradient-to-br from-furgocasa-blue via-furgocasa-blue-dark to-gray-900 relative overflow-hidden text-white">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Snowflake className="absolute top-10 left-10 text-white/10 w-24 h-24 animate-spin-slow" />
          <Snowflake className="absolute top-32 right-20 text-white/10 w-16 h-16 animate-spin-slow" />
          <Snowflake className="absolute bottom-20 left-1/4 text-white/10 w-32 h-32 animate-spin-slow" />
          <Snowflake className="absolute bottom-32 right-1/3 text-white/10 w-20 h-20 animate-spin-slow" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-10 md:mb-16">
            <span className="inline-block px-4 md:px-6 py-1.5 md:py-2 bg-white/10 backdrop-blur-md rounded-full text-xs md:text-sm font-bold tracking-wider md:tracking-widest uppercase mb-4 md:mb-6 border border-white/20">
              {t("Promoción Especial")}
            </span>
            <h2 className="text-3xl md:text-8xl font-heading font-bold text-white mb-2 md:mb-4 tracking-tight drop-shadow-2xl">
              {t("INVIERNO MÁGICO")}
            </h2>
            <p className="text-xl md:text-4xl text-cyan-300 font-heading font-bold tracking-wide mt-1 md:mt-2">
              2026
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl md:rounded-[3rem] p-6 md:p-16 mb-8 md:mb-12 shadow-2xl text-center">
              <h3 className="text-xl md:text-5xl font-heading font-bold text-white mb-4 md:mb-8 leading-tight">
                {t("¡TU AVENTURA INVERNAL!")}
              </h3>
              <p className="text-blue-100 text-sm md:text-xl mb-0 leading-relaxed max-w-3xl mx-auto font-light">
                {t("¡Descubre el invierno con FURGOCASA! Viaja con libertad en nuestras camper vans totalmente equipadas. Del norte nevado al sur más cálido, ¡tú decides el camino!")}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 md:gap-8 mb-8 md:mb-12">
              <div className="bg-gradient-to-br from-furgocasa-orange to-red-500 rounded-2xl md:rounded-[3rem] p-6 md:p-12 text-center shadow-2xl transform hover:scale-[1.02] transition-transform duration-300 flex flex-col justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-[url('/images/pattern.png')] opacity-10"></div>
                <h3 className="text-4xl md:text-8xl font-heading font-bold text-white mb-1 md:mb-2 tracking-tighter">
                  -15%
                </h3>
                <p className="text-sm md:text-2xl font-bold text-white/90 mb-4 md:mb-8 uppercase tracking-wide md:tracking-widest border-b border-white/20 pb-4 md:pb-8 mx-4 md:mx-10">
                  {t("Descuento Invierno")}
                </p>
                <div className="space-y-2 md:space-y-4 text-white font-medium text-sm md:text-xl">
                  <p className="flex items-center justify-center gap-2"><Zap className="w-4 h-4 md:w-5 md:h-5" /> {t("En TODAS nuestras campers")}</p>
                  <p className="flex items-center justify-center gap-2"><Clock className="w-4 h-4 md:w-5 md:h-5" /> {t("¡ALQUILA MÍNIMO 10 DÍAS!")}</p>
                </div>
              </div>

              <div className="bg-white text-gray-900 rounded-2xl md:rounded-[3rem] p-6 md:p-12 text-center shadow-2xl flex flex-col justify-center border border-gray-100">
                <p className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-wider md:tracking-widest mb-4 md:mb-6">
                  {t("CÓDIGO PROMOCIONAL")}
                </p>
                <div className="relative group cursor-pointer w-full" onClick={handleCopyCode}>
                  <div className="bg-gray-50 rounded-xl md:rounded-2xl p-4 md:p-8 mb-3 md:mb-4 border-2 border-dashed border-gray-300 group-hover:border-furgocasa-blue group-hover:bg-blue-50 transition-all duration-300">
                    <div className="text-2xl md:text-6xl font-mono font-bold text-furgocasa-blue tracking-wider">
                      INV2026
                    </div>
                  </div>
                  <div className="absolute top-1/2 right-3 md:right-6 -translate-y-1/2 text-gray-400 group-hover:text-furgocasa-blue transition-colors bg-white p-1.5 md:p-2 rounded-full shadow-sm">
                    {copied ? <Check className="w-4 h-4 md:w-5 md:h-5 text-green-500" /> : <Copy className="w-4 h-4 md:w-5 md:h-5" />}
                  </div>
                </div>
                <p className="text-gray-500 text-xs md:text-sm mb-4 md:mb-8 font-medium">
                  {copied ? <span className="text-green-500">{t("¡Copiado al portapapeles!")}</span> : t("Haz clic para copiar el código")}
                </p>
                <LocalizedLink
                  href="/reservar"
                  className="block w-full bg-furgocasa-blue hover:bg-furgocasa-blue-dark text-white font-bold py-5 px-8 rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 text-lg"
                >
                  {t("CANJEAR AHORA")}
                </LocalizedLink>
              </div>
            </div>

            <div className="bg-yellow-50/10 backdrop-blur-md border border-yellow-200/30 rounded-3xl p-8 text-center md:text-left flex flex-col md:flex-row items-center gap-6">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-yellow-900 flex-shrink-0">
                <span className="text-2xl">⚠️</span>
              </div>
              <p className="text-yellow-100 text-lg">
                <strong className="text-white">{t("Condiciones:")}</strong> {t("Reserva mínima de 10 días para obtener el 15% de descuento. Promoción válida del 5 de enero hasta el inicio de la primavera 2026.")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Por qué elegir Furgocasa */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-center text-gray-900 mb-16">
            {t("¿POR QUÉ ELEGIR FURGOCASA?")}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="group bg-gray-50 rounded-[2rem] p-10 hover:bg-white hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-furgocasa-blue/20 flex flex-col items-center text-center">
                <div className="mb-6 p-4 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-heading font-bold text-gray-900 mb-4 group-hover:text-furgocasa-blue transition-colors">
                  {t(benefit.title)}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {t(benefit.desc)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <LocalizedLink
              href="/reservar"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-furgocasa-orange to-furgocasa-orange-dark text-white font-bold text-xl py-5 px-12 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              {t("¡EMPEZAR AHORA!")} <Zap className="w-5 h-5 fill-current" />
            </LocalizedLink>
          </div>
        </div>
      </section>
    </main>
  );
}
