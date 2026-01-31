import Link from"next/link";
import { Youtube } from"lucide-react";

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
  return (
    <main className="min-h-screen bg-gray-50">
        <section className="bg-gradient-to-br from-furgocasa-blue to-furgocasa-blue-dark py-16">
          <div className="container mx-auto px-4 text-center">
            <Youtube className="h-16 w-16 text-furgocasa-orange mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Vidéos de Camping-Cars à Vendre</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">Regardez nos véhicules en vidéo</p>
          </div>
        </section>

        {/* Videos Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {videos.map((video) => (
                <div key={video.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  {/* Reproductor YouTube embebido */}
                  <div className="relative aspect-video">
                    <iframe
                      src={`https://www.youtube.com/embed/${video.youtubeId}`}
                      title="Vidéo du véhicule"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Info */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Plus de vidéos sur notre chaîne</h2>
            <p className="text-gray-600 max-w-3xl mx-auto mb-8">
              Visitez notre chaîne YouTube pour voir toutes les vidéos de véhicules disponibles
            </p>
            <a
              href="https://www.youtube.com/@furgocasacampervans"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              <Youtube className="h-5 w-5" />
              Voir la chaîne YouTube
            </a>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 bg-furgocasa-orange">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">L&apos;un d&apos;eux vous intéresse ?</h2>
            <p className="text-white/90 mb-6">Contactez-nous pour plus d&apos;informations</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/fr/ventes" className="inline-flex items-center gap-2 bg-white text-furgocasa-orange font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors">
                Voir les véhicules à vendre
              </Link>
              <Link href="/fr/contact" className="inline-flex items-center gap-2 bg-furgocasa-blue text-white font-semibold py-3 px-6 rounded-lg hover:bg-furgocasa-blue-dark transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </section>
      </main>
  );
}
