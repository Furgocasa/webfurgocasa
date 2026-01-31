"use client";

import { Play, Video, Tag, HelpCircle, ArrowRight } from "lucide-react";
import { LocalizedLink } from "@/components/localized-link";
import { useLanguage } from "@/contexts/language-context";

const videoTutorials = [
  {
    title: "Panel de Control",
    youtubeId: "WWvnqr43Fwk",
    description: "Aprende a usar el panel de control de tu camper"
  },
  {
    title: "Depósitos de agua",
    youtubeId: "e0DegVZ55zc",
    description: "Cómo funcionan los depósitos de agua limpia y residual"
  },
  {
    title: "Sistemas eléctricos",
    youtubeId: "rJxVIT79cD8",
    description: "Todo sobre el sistema eléctrico de la camper"
  },
  {
    title: "Calefacción y agua caliente",
    youtubeId: "uyJFFnIw1C0",
    description: "Uso de la calefacción y el sistema de agua caliente"
  },
  {
    title: "Ventanas, cubre soles y mosquiteras",
    youtubeId: "FkIfAw8p-4Y",
    description: "Manejo de ventanas, cortinas y mosquiteras"
  },
  {
    title: "Escalón exterior",
    youtubeId: "ygsYgQpN3SQ",
    description: "Uso correcto del escalón exterior"
  },
  {
    title: "Nevera y congelador",
    youtubeId: "LUg-H3uFpb8",
    description: "Funcionamiento de la nevera y congelador"
  },
];

export function VideoTutorialesClient() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-gray-50 font-amiko">
      {/* Hero */}
      <section className="bg-gradient-to-br from-furgocasa-blue via-furgocasa-blue-dark to-gray-900 py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <Video className="h-16 w-16 text-white/20 mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6">
            {t("Video Tutoriales")}
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            {t("Aprende a usar tu camper de alquiler con nuestros videos explicativos")}
          </p>
        </div>
      </section>

      {/* Videos Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {videoTutorials.map((video, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
                <a 
                  href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="aspect-video bg-gray-200 relative flex items-center justify-center block group"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <img 
                    src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
                    alt={t(video.title)}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="w-16 h-16 bg-furgocasa-orange rounded-full flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform cursor-pointer">
                    <Play className="h-8 w-8 text-white ml-1" />
                  </div>
                </a>
                <div className="p-6">
                  <h3 className="font-bold text-gray-900 mb-2">{t(video.title)}</h3>
                  <p className="text-gray-600 text-sm">{t(video.description)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("¿Prefieres leer la guía?")}</h2>
          <p className="text-gray-600 mb-6">{t("Consulta nuestra guía escrita con todos los detalles")}</p>
          <LocalizedLink 
            href="/guia-camper" 
            className="inline-flex items-center gap-2 bg-furgocasa-blue text-white font-bold py-3 px-8 rounded-xl hover:bg-furgocasa-blue-dark transition-colors"
          >
            {t("Ver Guía Camper")} <ArrowRight className="h-5 w-5" />
          </LocalizedLink>
        </div>
      </section>
    </main>
  );
}
