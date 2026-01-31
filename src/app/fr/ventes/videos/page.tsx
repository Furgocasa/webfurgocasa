import Link from"next/link";
import { Play, Car, ArrowRight, Calendar, Gauge, Euro } from"lucide-react";

export const metadata = {
  title: "Vidéos de Camping-Cars à Vendre",
  description: "Regardez les vidéos de nos camping-cars et vans à vendre. Visite complète intérieure et extérieure de chaque véhicule.",
};

// TODO: Charger depuis Supabase/YouTube API
const videos = [
  {
    id:"1",
    title:"Volkswagen California Ocean T6.1 2021",
    slug:"vw-california-ocean-t61-2021",
    youtubeId:"Rd1YaquF2wg",
    thumbnail: null,
    price: 72000,
    mileage: 45000,
    year: 2021,
    description:"Visite complète de ce California Ocean en parfait état. Un seul propriétaire.",
    duration:"12:34",
  },
  {
    id:"2",
    title:"Ford Transit Custom Nugget 2022",
    slug:"ford-transit-nugget-2022",
    youtubeId:"Ccb1PZMPyuA",
    thumbnail: null,
    price: 58000,
    mileage: 28000,
    year: 2022,
    description:"Tour du Nugget pratiquement neuf. Garantie officielle Ford jusqu'en 2025.",
    duration:"10:45",
  },
  {
    id:"3",
    title:"Fiat Ducato Roller Team 284 2020",
    slug:"fiat-ducato-roller-team-284-2020",
    youtubeId:"tOWVLB_1Tok",
    thumbnail: null,
    price: 52000,
    mileage: 62000,
    year: 2020,
    description:"Camping-car profilé très complet. Idéal pour les familles.",
    duration:"15:20",
  },
  {
    id:"4",
    title:"Autre véhicule à vendre",
    slug:"otro-vehiculo-venta",
    youtubeId:"DGJw9IsCx4Q",
    thumbnail: null,
    price: 48000,
    mileage: 35000,
    year: 2021,
    description:"Véhicule en excellent état avec tous les équipements.",
    duration:"11:30",
  },
];

export default function VideosVentasPage() {
  return (
    <>
<main className="min-h-screen bg-gray-50">
        <section className="bg-gradient-to-br from-furgocasa-blue to-furgocasa-blue-dark py-16">
          <div className="container mx-auto px-4 text-center">
            <Play className="h-16 w-16 text-furgocasa-orange mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Vidéos de Camping-Cars à Vendre</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">Découvrez chaque détail de nos véhicules avant de nous rendre visite</p>
          </div>
        </section>

        {/* Videos Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {videos.map((video) => (
                <div key={video.id} className="bg-white rounded-2xl shadow-sm overflow-hidden group hover:shadow-lg transition-shadow">
                  {/* Video Thumbnail */}
                  <a 
                    href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative aspect-video bg-gray-200 block"
                  >
                    <img 
                      src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
                      alt={video.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Car className="h-16 w-16 text-gray-300 opacity-50" />
                    </div>
                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-16 h-16 bg-furgocasa-orange rounded-full flex items-center justify-center">
                        <Play className="h-8 w-8 text-white ml-1" />
                      </div>
                    </div>
                    {/* Duration */}
                    <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </span>
                  </a>

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
                        Voir fiche<ArrowRight className="h-4 w-4" />
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Pourquoi des vidéos ?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              Nous voulons que vous connaissiez chaque véhicule comme si vous l&apos;aviez devant vous. Dans nos vidéos nous vous montrons 
              l&apos;intérieur, l&apos;extérieur, l&apos;équipement et l&apos;état réel de chaque camping-car à vendre.
            </p>
            <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="p-4">
                <div className="w-12 h-12 bg-furgocasa-orange/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Play className="h-6 w-6 text-furgocasa-orange" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">Visite complète</h3>
                <p className="text-gray-600 text-sm">Intérieur et extérieur sans filtre</p>
              </div>
              <div className="p-4">
                <div className="w-12 h-12 bg-furgocasa-orange/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Car className="h-6 w-6 text-furgocasa-orange" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">État réel</h3>
                <p className="text-gray-600 text-sm">Nous montrons chaque détail</p>
              </div>
              <div className="p-4">
                <div className="w-12 h-12 bg-furgocasa-orange/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Gauge className="h-6 w-6 text-furgocasa-orange" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">Fonctionnement</h3>
                <p className="text-gray-600 text-sm">Nous testons tous les systèmes</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 bg-furgocasa-orange">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">L&apos;un d&apos;eux vous intéresse ?</h2>
            <p className="text-white/90 mb-6">Venez le voir en personne et essayez-le sans engagement</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/fr/ventes" className="inline-flex items-center gap-2 bg-white text-furgocasa-orange font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors">
                Voir tous les véhicules
              </Link>
              <Link href="/fr/contact" className="inline-flex items-center gap-2 bg-furgocasa-blue text-white font-semibold py-3 px-6 rounded-lg hover:bg-furgocasa-blue-dark transition-colors">
                Contacter
              </Link>
            </div>
          </div>
        </section>
      </main>
</>
  );
}
