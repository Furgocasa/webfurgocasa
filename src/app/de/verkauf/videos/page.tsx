import Link from"next/link";
import { Play, Car, ArrowRight, Calendar, Gauge, Euro } from"lucide-react";

export const metadata = {
  title: "Videos von Wohnmobilen zum Verkauf",
  description: "Sehen Sie Videos unserer Wohnmobile und Camper zum Verkauf. Komplette Innen- und Außenbesichtigung jedes Fahrzeugs.",
};

// TODO: Von Supabase/YouTube API laden
const videos = [
  {
    id:"1",
    title:"Volkswagen California Ocean T6.1 2021",
    slug:"vw-california-ocean-t61-2021",
    youtubeId:"dQw4w9WgXcQ", // Placeholder
    thumbnail: null,
    price: 72000,
    mileage: 45000,
    year: 2021,
    description:"Komplette Besichtigung dieses California Ocean in einwandfreiem Zustand. Ein Vorbesitzer.",
    duration:"12:34",
  },
  {
    id:"2",
    title:"Ford Transit Custom Nugget 2022",
    slug:"ford-transit-nugget-2022",
    youtubeId:"dQw4w9WgXcQ", // Placeholder
    thumbnail: null,
    price: 58000,
    mileage: 28000,
    year: 2022,
    description:"Tour durch den praktisch neuen Nugget. Offizielle Ford-Garantie bis 2025.",
    duration:"10:45",
  },
  {
    id:"3",
    title:"Fiat Ducato Roller Team 284 2020",
    slug:"fiat-ducato-roller-team-284-2020",
    youtubeId:"dQw4w9WgXcQ", // Placeholder
    thumbnail: null,
    price: 52000,
    mileage: 62000,
    year: 2020,
    description:"Sehr komplettes teilintegriertes Wohnmobil. Ideal für Familien.",
    duration:"15:20",
  },
];

export default function VideosVentasPage() {
  return (
    <>
<main className="min-h-screen bg-gray-50">
        <section className="bg-gradient-to-br from-furgocasa-blue to-furgocasa-blue-dark py-16">
          <div className="container mx-auto px-4 text-center">
            <Play className="h-16 w-16 text-furgocasa-orange mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Videos von Wohnmobilen zum Verkauf</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">Entdecken Sie jedes Detail unserer Fahrzeuge vor Ihrem Besuch</p>
          </div>
        </section>

        {/* Videos Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {videos.map((video) => (
                <div key={video.id} className="bg-white rounded-2xl shadow-sm overflow-hidden group hover:shadow-lg transition-shadow">
                  {/* Video Thumbnail */}
                  <div className="relative aspect-video bg-gray-200">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Car className="h-16 w-16 text-gray-300" />
                    </div>
                    {/* Play button overlay */}
                    <button className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-16 h-16 bg-furgocasa-orange rounded-full flex items-center justify-center">
                        <Play className="h-8 w-8 text-white ml-1" />
                      </div>
                    </button>
                    {/* Duration */}
                    <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-6">
                    <h3 className="font-bold text-gray-900 mb-2 group-hover:text-furgocasa-orange transition-colors">
                      {video.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">{video.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />{video.year}
                      </span>
                      <span className="flex items-center gap-1">
                        <Gauge className="h-4 w-4" />{video.mileage.toLocaleString()} km
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-1 text-furgocasa-orange">
                        <Euro className="h-5 w-5" />
                        <span className="text-xl font-bold">{video.price.toLocaleString()}</span>
                      </div>
                      <Link 
                        href={`/ventas/${video.slug}`}
                        className="flex items-center gap-1 text-sm font-medium text-furgocasa-orange hover:underline"
                      >
                        Details ansehen<ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Info */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Warum Videos?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              Wir möchten, dass Sie jedes Fahrzeug kennenlernen, als hätten Sie es vor sich. In unseren Videos zeigen wir 
              das Innere, Äußere, die Ausstattung und den tatsächlichen Zustand jedes Wohnmobils zum Verkauf.
            </p>
            <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="p-4">
                <div className="w-12 h-12 bg-furgocasa-orange/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Play className="h-6 w-6 text-furgocasa-orange" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">Komplette Besichtigung</h3>
                <p className="text-gray-600 text-sm">Innen und außen ohne Filter</p>
              </div>
              <div className="p-4">
                <div className="w-12 h-12 bg-furgocasa-orange/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Car className="h-6 w-6 text-furgocasa-orange" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">Tatsächlicher Zustand</h3>
                <p className="text-gray-600 text-sm">Wir zeigen jedes Detail</p>
              </div>
              <div className="p-4">
                <div className="w-12 h-12 bg-furgocasa-orange/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Gauge className="h-6 w-6 text-furgocasa-orange" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">Funktionsweise</h3>
                <p className="text-gray-600 text-sm">Wir testen alle Systeme</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 bg-furgocasa-orange">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Interessiert Sie eines?</h2>
            <p className="text-white/90 mb-6">Kommen Sie vorbei und testen Sie es unverbindlich</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/de/verkauf" className="inline-flex items-center gap-2 bg-white text-furgocasa-orange font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors">
                Alle Fahrzeuge ansehen
              </Link>
              <Link href="/de/kontakt" className="inline-flex items-center gap-2 bg-furgocasa-blue text-white font-semibold py-3 px-6 rounded-lg hover:bg-furgocasa-blue-dark transition-colors">
                Kontakt
              </Link>
            </div>
          </div>
        </section>
      </main>
</>
  );
}
