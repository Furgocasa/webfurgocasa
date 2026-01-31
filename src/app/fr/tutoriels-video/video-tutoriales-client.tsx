"use client";

import { Video, ArrowRight } from "lucide-react";
import { LocalizedLink } from "@/components/localized-link";
import { useLanguage } from "@/contexts/language-context";

const videoTutorials = [
  {
    title: "Panneau de Contrôle",
    youtubeId: "WWvnqr43Fwk",
    description: "Apprenez à utiliser le panneau de contrôle de votre camping-car"
  },
  {
    title: "Réservoirs d'eau",
    youtubeId: "e0DegVZ55zc",
    description: "Comment fonctionnent les réservoirs d'eau propre et usée"
  },
  {
    title: "Systèmes électriques",
    youtubeId: "rJxVIT79cD8",
    description: "Tout sur le système électrique du camping-car"
  },
  {
    title: "Chauffage et eau chaude",
    youtubeId: "uyJFFnIw1C0",
    description: "Utilisation du chauffage et du système d'eau chaude"
  },
  {
    title: "Fenêtres, pare-soleil et moustiquaires",
    youtubeId: "FkIfAw8p-4Y",
    description: "Manipulation des fenêtres, rideaux et moustiquaires"
  },
  {
    title: "Marche extérieure",
    youtubeId: "ygsYgQpN3SQ",
    description: "Utilisation correcte de la marche extérieure"
  },
  {
    title: "Réfrigérateur et congélateur",
    youtubeId: "LUg-H3uFpb8",
    description: "Fonctionnement du réfrigérateur et congélateur"
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
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {videoTutorials.map((video, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Reproductor YouTube embebido */}
                <div className="relative aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.youtubeId}`}
                    title={t(video.title)}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">{t(video.title)}</h3>
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
