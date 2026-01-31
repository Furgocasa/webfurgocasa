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
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Campervan Videos for Sale</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">Discover every detail of our vehicles on video</p>
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
                      alt="Vehicle video"
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
                      Click to watch the full vehicle video
                    </p>
                    <button
                      onClick={() => setSelectedVideo(video.youtubeId)}
                      className="w-full bg-furgocasa-orange hover:bg-furgocasa-orange/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Play className="h-5 w-5" />
                      Watch Video
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Videos of our vehicles for sale</h2>
            <p className="text-gray-600 max-w-3xl mx-auto mb-8">
              All our videos are on our YouTube channel. Click on any video 
              to watch it right here and learn every detail of the vehicle.
            </p>
            <a
              href="https://www.youtube.com/@furgocasa"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              <Youtube className="h-5 w-5" />
              Visit our YouTube channel
            </a>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 bg-furgocasa-orange">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Interested in any of them?</h2>
            <p className="text-white/90 mb-6">Come see it in person and test drive it with no obligation</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/en/sales" className="inline-flex items-center gap-2 bg-white text-furgocasa-orange font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors">
                View all vehicles
              </Link>
              <Link href="/en/contact" className="inline-flex items-center gap-2 bg-furgocasa-blue text-white font-semibold py-3 px-6 rounded-lg hover:bg-furgocasa-blue-dark transition-colors">
                Contact us
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
              aria-label="Close video"
            >
              <X className="h-8 w-8" />
            </button>
            <div 
              className="w-full max-w-5xl aspect-video"
              onClick={(e) => e.stopPropagation()}
            >
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1&rel=0`}
                title="Vehicle video"
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
