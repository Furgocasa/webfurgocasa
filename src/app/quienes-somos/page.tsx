import { Metadata } from"next";
import { Users, Heart, Star } from"lucide-react";
import { AboutPageJsonLd } from"@/components/static-pages/jsonld";

// 🎯 Metadata SEO optimizada
export const metadata: Metadata = {
  title: "Quiénes Somos",
  description: "Furgocasa es una empresa familiar nacida de la pasión por el mundo camper. Desde 2012, ofrecemos alquiler de autocaravanas premium en Murcia con más de 500 viajes realizados.",
  keywords: "quienes somos furgocasa, empresa alquiler camper murcia, historia furgocasa, familia furgocasa, autocaravanas murcia",
  authors: [{ name: "Furgocasa" }],
  openGraph: {
    title: "Quiénes Somos",
    description: "Conoce la historia de Furgocasa, empresa familiar especializada en alquiler de autocaravanas en Murcia desde 2012.",
    type: "website",
    url: "https://www.furgocasa.com/quienes-somos",
    siteName: "Furgocasa",
    locale: "es_ES",
  },
  twitter: {
    card: "summary_large_image",
    title: "Quiénes Somos",
    description: "Empresa familiar de alquiler de autocaravanas en Murcia desde 2012.",
  },
  alternates: {
    canonical:"https://www.furgocasa.com/quienes-somos",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

// ✅ Server Component - Sin revalidación (contenido muy estático)
export default function QuienesSomosPage() {
  return (
    <>
      <AboutPageJsonLd />
<main className="min-h-screen bg-gray-50 font-amiko">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-furgocasa-blue via-furgocasa-blue-dark to-gray-900 py-24 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6">
              Sobre Furgocasa
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto font-light leading-relaxed">
              Pasión por viajar, libertad para explorar
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="prose prose-lg text-gray-600 leading-relaxed mx-auto text-center mb-16">
                <p className="text-2xl font-medium text-gray-800 mb-8">
                  Somos una empresa familiar nacida de la pasión por el mundo camper y las ganas de compartir esa libertad con los demás.
                </p>
                <p className="text-lg mb-6">
                  En Furgocasa, no solo alquilamos vehículos; ofrecemos experiencias. Entendemos que cada viaje es único y personal, por eso cuidamos cada detalle para que tu única preocupación sea disfrutar del camino.
                </p>
                <p className="text-lg">
                  Nuestra flota está compuesta por vehículos modernos, seguros y equipados con todo lo necesario para que te sientas como en casa, estés donde estés.
                </p>
              </div>

              {/* Values */}
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-gray-50 rounded-3xl p-8 text-center hover:bg-white hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-furgocasa-blue">
                    <Heart className="h-8 w-8" />
                  </div>
                  <h2 className="text-xl font-heading font-bold text-gray-900 mb-3">Pasión</h2>
                  <p className="text-sm text-gray-600">Amamos lo que hacemos y eso se nota en el cuidado de nuestros vehículos y el trato al cliente.</p>
                </div>
                
                <div className="bg-gray-50 rounded-3xl p-8 text-center hover:bg-white hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 text-furgocasa-orange">
                    <Star className="h-8 w-8" />
                  </div>
                  <h2 className="text-xl font-heading font-bold text-gray-900 mb-3">Calidad</h2>
                  <p className="text-sm text-gray-600">Solo trabajamos con las mejores marcas y mantenemos nuestra flota en perfecto estado.</p>
                </div>

                <div className="bg-gray-50 rounded-3xl p-8 text-center hover:bg-white hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                    <Users className="h-8 w-8" />
                  </div>
                  <h2 className="text-xl font-heading font-bold text-gray-900 mb-3">Cercanía</h2>
                  <p className="text-sm text-gray-600">Te acompañamos antes, durante y después de tu viaje. Somos tu copiloto de confianza.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 md:py-24 bg-furgocasa-blue text-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
                Furgocasa en cifras
              </h2>
              <p className="text-blue-100 text-lg">
                Más de una década compartiendo la pasión por viajar
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 text-center">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl">
                <p className="text-3xl md:text-5xl font-heading font-bold mb-1 md:mb-2">12+</p>
                <p className="text-blue-200 uppercase tracking-wider md:tracking-widest text-xs md:text-sm">Años de experiencia</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl">
                <p className="text-3xl md:text-5xl font-heading font-bold mb-1 md:mb-2">500+</p>
                <p className="text-blue-200 uppercase tracking-wider md:tracking-widest text-xs md:text-sm">Viajes realizados</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl">
                <p className="text-3xl md:text-5xl font-heading font-bold mb-1 md:mb-2">8</p>
                <p className="text-blue-200 uppercase tracking-wider md:tracking-widest text-xs md:text-sm">Vehículos Premium</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl">
                <p className="text-3xl md:text-5xl font-heading font-bold mb-1 md:mb-2">4.9</p>
                <p className="text-blue-200 uppercase tracking-wider md:tracking-widest text-xs md:text-sm">Valoración Media</p>
              </div>
            </div>
          </div>
        </section>
      </main>
</>
  );
}
