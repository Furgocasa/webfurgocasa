"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Play, Video, Tag, HelpCircle, ArrowRight } from "lucide-react";
import { LocalizedLink } from "@/components/localized-link";
import { useLanguage } from "@/contexts/language-context";
// NOTA: Reemplaza 'YOUTUBE_ID_AQUI' con los IDs reales de YouTube
// Ejemplo: si el video es https://www.youtube.com/watch?v=dQw4w9WgXcQ
// entonces el youtubeId sería: dQw4w9WgXcQ
const videoTutorials = [
  {
    title: "Panel de Control",
    youtubeId: "PANEL_CONTROL_ID", // Reemplazar con ID real
    description: "Aprende a usar el panel de control de tu camper"
  },
  {
    title: "Depósitos de agua",
    youtubeId: "DEPOSITOS_AGUA_ID", // Reemplazar con ID real
    description: "Cómo funcionan los depósitos de agua limpia y residual"
  },
  {
    title: "Sistemas eléctricos",
    youtubeId: "SISTEMAS_ELECTRICOS_ID", // Reemplazar con ID real
    description: "Todo sobre el sistema eléctrico de la camper"
  },
  {
    title: "Calefacción y agua caliente",
    youtubeId: "CALEFACCION_ID", // Reemplazar con ID real
    description: "Uso de la calefacción y el sistema de agua caliente"
  },
  {
    title: "Ventanas, cubre soles y mosquiteras",
    youtubeId: "VENTANAS_ID", // Reemplazar con ID real
    description: "Manejo de ventanas, cortinas y mosquiteras"
  },
  {
    title: "Escalón exterior",
    youtubeId: "ESCALON_ID", // Reemplazar con ID real
    description: "Uso correcto del escalón exterior"
  },
  {
    title: "Nevera y congelador",
    youtubeId: "NEVERA_ID", // Reemplazar con ID real
    description: "Funcionamiento de la nevera y congelador"
  },
];

export default function VideoTutorialesPage() {
  const { t } = useLanguage();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 font-amiko">
        {/* Hero Section - Modernizado */}
        <section className="bg-gradient-to-br from-furgocasa-blue via-furgocasa-blue-dark to-gray-900 py-20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>

          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="inline-block mb-6 p-4 bg-white/10 backdrop-blur-md rounded-full">
              <Video className="h-16 w-16 text-furgocasa-orange mx-auto" />
            </div>
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6">
              {t("Video Tutoriales")}
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto font-light leading-relaxed">
              {t("¿Cómo funciona mi camper de alquiler?")}
            </p>
            <p className="text-lg text-white/80 max-w-2xl mx-auto mt-4 font-medium">
              {t("Videos explicativos de los diferentes elementos y accesorios de la Camper.")}
            </p>
          </div>
        </section>

        {/* Videos Grid - Modernizado */}
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
              {videoTutorials.map((video, index) => (
                <div key={index} className="bg-white rounded-3xl shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 flex flex-col h-full">
                  {/* Video Embed */}
                  <div className="relative aspect-video bg-black group-hover:ring-4 ring-furgocasa-orange/20 transition-all">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${video.youtubeId}`}
                      title={video.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    />
                  </div>
                  
                  {/* Video Info */}
                  <div className="p-8 flex-1 flex flex-col">
                    <h3 className="text-xl font-heading font-bold text-gray-900 mb-3 group-hover:text-furgocasa-blue transition-colors">
                      {t(video.title)}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-1">
                      {t(video.description)}
                    </p>
                    <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <span className="flex items-center gap-1"><Play className="h-3 w-3" /> {t("Ver video")}</span>
                      <span className="bg-gray-100 px-2 py-1 rounded">HD</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Ofertas Section - Modernizado */}
        <section className="py-24 bg-gradient-to-br from-furgocasa-orange to-furgocasa-orange-dark relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="inline-block p-4 bg-white/20 backdrop-blur-md rounded-full mb-6">
              <Tag className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-white mb-6">
              {t("Ofertas Camper")}
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-10 font-light leading-relaxed">
              {t("Accede a nuestra sección de ofertas para estar al tanto de las últimas promociones y poder alquilar una Furgocasa al mejor precio.")}
            </p>
            <LocalizedLink
              href="/ofertas"
              className="inline-block bg-white text-furgocasa-orange font-bold text-xl py-4 px-12 rounded-full hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
              {t("Ver Ofertas")}
            </LocalizedLink>
          </div>
        </section>

        {/* CTA Section - Modernizado */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-6 flex items-center justify-center gap-3">
              <HelpCircle className="h-8 w-8 text-furgocasa-blue" />
              {t("¿Tienes alguna duda?")}
            </h2>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              {t("Consulta nuestra guía escrita completa o contáctanos directamente")}
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <LocalizedLink
                href="/guia-camper"
                className="inline-flex items-center gap-2 bg-furgocasa-blue text-white font-bold py-4 px-10 rounded-xl hover:bg-blue-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                {t("Ver guía escrita")} <ArrowRight className="h-5 w-5" />
              </LocalizedLink>
              <LocalizedLink
                href="/contacto"
                className="inline-flex items-center gap-2 bg-white border-2 border-furgocasa-blue text-furgocasa-blue font-bold py-4 px-10 rounded-xl hover:bg-blue-50 transition-all"
              >
                {t("Contactar")}
              </LocalizedLink>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
