"use client";

import { useState } from "react";
import Link from"next/link";
import { Play, X, Youtube } from"lucide-react";

// Videos de YouTube con sus IDs reales
const videos = [
  {
    id:"1",
    youtubeId:"Rd1YaquF2wg",
  },
  {
    id:"2",
    youtubeId:"Ccb1PZMPyuA",
  },
  {
    id:"3",
    youtubeId:"tOWVLB_1Tok",
  },
  {
    id:"4",
    youtubeId:"DGJw9IsCx4Q",
  },
];

export default function VideosVentasPage() {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<string, number>>({});

  const getThumbnailUrl = (youtubeId: string) => {
    const errorCount = imgErrors[youtubeId] || 0;
    // Intentar diferentes calidades de miniatura en orden
    const qualities = ['maxresdefault', 'hqdefault', 'mqdefault', 'default'];
    return `https://img.youtube.com/vi/${youtubeId}/${qualities[errorCount]}.jpg`;
  };

  const handleImageError = (youtubeId: string) => {
    setImgErrors(prev => ({
      ...prev,
      [youtubeId]: (prev[youtubeId] || 0) + 1
    }));
  };

  return (
    <>
<main className="min-h-screen bg-gray-50">
        <section className="bg-gradient-to-br from-furgocasa-blue to-furgocasa-blue-dark py-16">
          <div className="container mx-auto px-4 text-center">
            <Youtube className="h-16 w-16 text-furgocasa-orange mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Videos de Campers en Venta</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">Descubre cada detalle de nuestros vehículos en video</p>
          </div>
        </section>

        {/* Videos Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {videos.map((video) => (
                <div key={video.id} className="bg-white rounded-2xl shadow-sm overflow-hidden group hover:shadow-lg transition-shadow">
                  {/* Video Thumbnail */}
                  <button
                    onClick={() => setSelectedVideo(video.youtubeId)}
                    className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 block w-full overflow-hidden"
                  >
                    <img 
                      key={`${video.youtubeId}-${imgErrors[video.youtubeId] || 0}`}
                      src={getThumbnailUrl(video.youtubeId)}
                      alt="Video del vehículo"
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={() => handleImageError(video.youtubeId)}
                    />
                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                      <div className="w-20 h-20 bg-furgocasa-orange rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                        <Play className="h-10 w-10 text-white ml-1" />
                      </div>
                    </div>
                    {/* YouTube badge */}
                    <div className="absolute top-3 right-3 bg-red-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                      <Youtube className="h-3 w-3" />
                      <span>YouTube</span>
                    </div>
                  </button>

                  {/* Info */}
                  <div className="p-6 text-center">
                    <p className="text-gray-600 text-sm mb-4">
                      Haz clic para ver el video completo del vehículo
                    </p>
                    <button
                      onClick={() => setSelectedVideo(video.youtubeId)}
                      className="w-full bg-furgocasa-orange hover:bg-furgocasa-orange/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Play className="h-5 w-5" />
                      Ver Video
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Info */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Videos de nuestros vehículos en venta</h2>
            <p className="text-gray-600 max-w-3xl mx-auto mb-8">
              Todos nuestros videos están en nuestro canal de YouTube. Haz clic en cualquier video 
              para verlo aquí mismo y conocer cada detalle del vehículo.
            </p>
            <a
              href="https://www.youtube.com/@furgocasa"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              <Youtube className="h-5 w-5" />
              Visitar nuestro canal de YouTube
            </a>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 bg-furgocasa-orange">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">¿Te interesa alguno?</h2>
            <p className="text-white/90 mb-6">Ven a verlo en persona y pruébalo sin compromiso</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/ventas" className="inline-flex items-center gap-2 bg-white text-furgocasa-orange font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors">
                Ver todos los vehículos
              </Link>
              <Link href="/contacto" className="inline-flex items-center gap-2 bg-furgocasa-blue text-white font-semibold py-3 px-6 rounded-lg hover:bg-furgocasa-blue-dark transition-colors">
                Contactar
              </Link>
            </div>
          </div>
        </section>

        {/* Modal de video */}
        {selectedVideo && (
          <div 
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedVideo(null)}
          >
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 text-white hover:text-furgocasa-orange transition-colors z-10"
              aria-label="Cerrar video"
            >
              <X className="h-8 w-8" />
            </button>
            <div 
              className="w-full max-w-5xl aspect-video"
              onClick={(e) => e.stopPropagation()}
            >
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1&rel=0`}
                title="Video del vehículo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full rounded-lg"
              />
            </div>
          </div>
        )}
      </main>
</>
  );
}
