import { Metadata } from "next";
import { SearchWidget } from "@/components/booking/search-widget";
import { LocalizedLink } from "@/components/localized-link";
import { 
  MapPin, 
  CheckCircle, 
  Users, 
  Bed,
  Plane,
  Globe,
  Shield,
  Phone,
  Clock,
  CreditCard,
  Car,
  Star
} from "lucide-react";
import Image from "next/image";
import { getAvailableVehicles } from "@/lib/locations/server-actions";

// ⚡ ISR: Revalidar cada 24 horas
export const revalidate = 86400;

// 🎯 METADATA SEO - Keywords diferenciadas para LATAM (evitar canibalización)
export const metadata: Metadata = {
  title: "Alquiler Motorhome Europa desde España | Casa Rodante para Viajeros LATAM | Furgocasa",
  description: "¿Venís desde Argentina, México, Chile o Colombia? Alquilá tu motorhome en España y recorré toda Europa en casa rodante. Kilómetros ilimitados, seguro europeo, asistencia 24/7 en español. ¡Arrancá tu aventura!",
  keywords: "alquiler motorhome europa, casa rodante europa, motorhome para viajar por europa, renta casa rodante españa, alquiler motorhome viajeros latinoamericanos, casa rodante desde españa recorrer europa, motorhome argentina españa, motorhome mexico europa, campervan latinoamerica europa",
  authors: [{ name: "Furgocasa" }],
  openGraph: {
    title: "Alquiler Motorhome Europa desde España | Viajeros LATAM | Furgocasa",
    description: "Tu aventura europea comienza en España. Casa rodante con kilómetros ilimitados para recorrer Francia, Italia, Portugal y más. Asistencia en español 24/7.",
    type: "website",
    url: "https://furgocasa.com/alquiler-motorhome-europa-desde-espana",
    siteName: "Furgocasa - Alquiler de Motorhomes",
    images: [
      {
        url: "https://furgocasa.com/images/slides/hero-01.webp",
        width: 1200,
        height: 630,
        alt: "Alquiler de motorhome y casa rodante para viajar por Europa desde España",
        type: "image/webp",
      }
    ],
    locale: "es_419", // Español Latinoamérica
    countryName: "España",
  },
  twitter: {
    card: "summary_large_image",
    site: "@furgocasa",
    creator: "@furgocasa",
    title: "Alquiler Motorhome Europa | Viajeros LATAM | €95/día",
    description: "Tu casa rodante te espera en España para recorrer toda Europa. Kilómetros ilimitados, seguro europeo, asistencia 24/7 en español.",
    images: ["https://furgocasa.com/images/slides/hero-01.webp"],
  },
  alternates: {
    canonical: "https://furgocasa.com/alquiler-motorhome-europa-desde-espana",
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
  other: {
    'geo.region': 'ES-MU',
    'geo.placename': 'Murcia, España',
  }
};

// 🎨 Server Component - Página 100% LATAM
export default async function MotorhomeEuropaLatamPage() {
  // Obtener vehículos disponibles
  const vehicles = await getAvailableVehicles(3);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ============================================ */}
      {/* HERO SECTION - Tono LATAM directo */}
      {/* ============================================ */}
      <section className="relative h-[700px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-furgocasa-blue via-purple-900 to-furgocasa-blue-dark" />
        
        {/* Patrón decorativo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 text-9xl">🌍</div>
          <div className="absolute bottom-20 right-10 text-9xl">🚐</div>
          <div className="absolute top-40 right-40 text-6xl">✈️</div>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        <div className="container mx-auto px-4 h-full flex items-center relative z-10">
          <div className="max-w-4xl text-white">
            {/* Badge LATAM */}
            <div className="inline-flex items-center gap-2 bg-furgocasa-orange/90 backdrop-blur-sm text-white px-4 py-2 rounded-full mb-6 text-sm font-medium">
              <Globe className="h-4 w-4" />
              Especial para viajeros de Argentina, México, Chile, Colombia...
            </div>
            
            <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6 leading-tight">
              Alquilá tu Motorhome<br />
              <span className="text-furgocasa-orange">y Recorré toda Europa</span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-blue-100 font-light">
              Tu casa rodante te espera en España.<br />
              <span className="font-medium">Kilómetros ilimitados por toda Europa.</span>
            </p>
            
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-lg px-4 py-2">
                <Plane className="h-5 w-5 text-furgocasa-orange" />
                <span>Llegás a Alicante o Murcia</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-lg px-4 py-2">
                <Clock className="h-5 w-5 text-furgocasa-orange" />
                <span>En 1 hora tenés tu motorhome</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-lg px-4 py-2">
                <Globe className="h-5 w-5 text-furgocasa-orange" />
                <span>Recorrés toda Europa</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <LocalizedLink
                href="/reservar"
                className="inline-flex items-center gap-2 bg-furgocasa-orange text-white font-bold px-8 py-4 rounded-xl hover:bg-furgocasa-orange-dark transition-all shadow-lg text-lg"
              >
                ¡Reservá ahora! →
              </LocalizedLink>
              <a
                href="https://wa.me/34868364161?text=Hola!%20Vengo%20desde%20LATAM%20y%20quiero%20alquilar%20un%20motorhome%20para%20recorrer%20Europa"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-green-700 transition-all shadow-lg text-lg"
              >
                <Phone className="h-5 w-5" />
                WhatsApp directo
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Search Widget */}
      <section className="-mt-20 relative z-20">
        <div className="container mx-auto px-4">
          <SearchWidget />
        </div>
      </section>

      {/* ============================================ */}
      {/* QUÉ ES UN MOTORHOME - Vocabulario LATAM */}
      {/* ============================================ */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 md:p-12 border-2 border-blue-200">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6 text-center">
                🚐 ALQUILER MOTORHOME EUROPA
                <span className="block text-xl text-gray-600 font-normal mt-2">(Casas Rodantes en España)</span>
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div>
                  <h3 className="font-bold text-xl mb-4 text-furgocasa-blue">¿Qué es un Motorhome?</h3>
                  <p className="text-gray-700 mb-4">
                    <strong>Motorhome</strong>, <strong>autocaravana</strong> y <strong>camper</strong> son 
                    términos que se refieren al mismo tipo de vehículo: una furgoneta camper 
                    totalmente equipada para viajar con autonomía total.
                  </p>
                  <p className="text-gray-700">
                    En Latinoamérica también se conocen como <strong>casas rodantes</strong> o 
                    <strong> casas móviles</strong>. En Furgocasa, nos especializamos en el alquiler 
                    de estos vehículos de gran volumen, perfectos para familias y parejas 
                    que buscan la máxima comodidad.
                  </p>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h4 className="font-bold mb-4 text-furgocasa-orange">¿Cómo se llama en tu país?</h4>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-center gap-2">
                      <span>🇪🇸</span>
                      <strong>España:</strong> Autocaravana, Camper, Furgoneta Camper
                    </li>
                    <li className="flex items-center gap-2">
                      <span>🌎</span>
                      <strong>Latinoamérica:</strong> Casa Rodante, Motorhome, Casa Móvil
                    </li>
                    <li className="flex items-center gap-2">
                      <span>🇺🇸</span>
                      <strong>USA:</strong> RV (Recreational Vehicle), Campervan
                    </li>
                    <li className="flex items-center gap-2">
                      <span>🇬🇧</span>
                      <strong>UK:</strong> Motorhome, Campervan
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* DESCUENTO ESPECIAL LATAM */}
      {/* ============================================ */}
      <section className="py-12 bg-gradient-to-r from-furgocasa-orange to-orange-600">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              🌎 Descuento Especial LATAM 🌎
            </h2>
            <p className="text-xl mb-6">
              ¿Venís desde Latinoamérica?
            </p>
            <p className="text-lg mb-8 text-orange-100">
              Obtené un <strong>descuento especial</strong> en el alquiler de tu motorhome / casa rodante. 
              Contactanos y mencioná tu país de origen para recibir una oferta personalizada.
            </p>
            
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {['🇦🇷 Argentina', '🇲🇽 México', '🇨🇱 Chile', '🇨🇴 Colombia', '🇵🇪 Perú', '🇻🇪 Venezuela', '🇺🇾 Uruguay', '🇪🇨 Ecuador'].map((pais) => (
                <span key={pais} className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                  {pais}
                </span>
              ))}
            </div>
            
            <a
              href="https://wa.me/34868364161?text=Hola!%20Soy%20de%20[TU%20PAÍS]%20y%20quiero%20consultar%20por%20el%20descuento%20especial%20LATAM"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-furgocasa-orange font-bold px-8 py-4 rounded-xl hover:bg-orange-50 transition-all shadow-lg text-lg"
            >
              <Phone className="h-5 w-5" />
              Consultá tu descuento por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* POR QUÉ ESPAÑA ES TU BASE PERFECTA */}
      {/* ============================================ */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-4">
              🇪🇸 ¿Por qué España es tu Base Perfecta para Europa?
            </h2>
            <p className="text-xl text-center text-gray-600 mb-12">
              No es casualidad que millones de viajeros LATAM eligen España como punto de partida
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-200">
                <div className="text-4xl mb-4">✈️</div>
                <h3 className="font-bold text-xl mb-3 text-furgocasa-blue">Vuelos Directos desde LATAM</h3>
                <p className="text-gray-700">
                  <strong>Buenos Aires, México DF, Santiago, Bogotá</strong> → Madrid (10-14 hs). 
                  Luego conexión a <strong>Alicante o Murcia</strong> (1 hora).
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border-2 border-orange-200">
                <div className="text-4xl mb-4">🗣️</div>
                <h3 className="font-bold text-xl mb-3 text-furgocasa-orange">Mismo Idioma</h3>
                <p className="text-gray-700">
                  Trámites, señales, menús, todo en <strong>español</strong>. 
                  Nuestro equipo te atiende con acento que entendés perfectamente.
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border-2 border-green-200">
                <div className="text-4xl mb-4">💶</div>
                <h3 className="font-bold text-xl mb-3 text-green-700">30-40% Más Barato</h3>
                <p className="text-gray-700">
                  Alquilar motorhome en España es <strong>mucho más económico</strong> que 
                  en Alemania, Francia o Países Bajos. Misma calidad, mejor precio.
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border-2 border-purple-200">
                <div className="text-4xl mb-4">🌍</div>
                <h3 className="font-bold text-xl mb-3 text-purple-700">Ubicación Estratégica</h3>
                <p className="text-gray-700">
                  Desde Murcia: <strong>1 día a Francia</strong>, 6 horas a Portugal, 
                  2 días a Italia. El Mediterráneo es tu autopista a Europa.
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6 border-2 border-yellow-200">
                <div className="text-4xl mb-4">☀️</div>
                <h3 className="font-bold text-xl mb-3 text-yellow-700">Clima Perfecto</h3>
                <p className="text-gray-700">
                  Región de Murcia: <strong>300 días de sol al año</strong>. 
                  Arrancás tu viaje con buen clima, incluso en invierno europeo.
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border-2 border-red-200">
                <div className="text-4xl mb-4">🍽️</div>
                <h3 className="font-bold text-xl mb-3 text-red-700">Cultura Familiar</h3>
                <p className="text-gray-700">
                  Horarios, comida, forma de vida... España es <strong>como estar en casa</strong>, 
                  pero con castillos medievales y playas increíbles.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* CÓMO FUNCIONA - Paso a Paso */}
      {/* ============================================ */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-4">
              📋 ¿Cómo funciona? Súper fácil
            </h2>
            <p className="text-xl text-center text-gray-600 mb-12">
              El 90% de nuestros clientes LATAM son primerizos. Te guiamos paso a paso.
            </p>
            
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg text-center relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-furgocasa-blue text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">1</div>
                <div className="text-4xl mb-4 mt-4">✈️</div>
                <h3 className="font-bold text-lg mb-2">Llegás a España</h3>
                <p className="text-gray-600 text-sm">
                  Volás a <strong>Alicante o Murcia</strong> (con escala en Madrid)
                </p>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-lg text-center relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-furgocasa-blue text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">2</div>
                <div className="text-4xl mb-4 mt-4">🚐</div>
                <h3 className="font-bold text-lg mb-2">Retirás tu Motorhome</h3>
                <p className="text-gray-600 text-sm">
                  Te buscamos o te damos indicaciones. <strong>Inducción de 1 hora</strong> incluida.
                </p>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-lg text-center relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-furgocasa-blue text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">3</div>
                <div className="text-4xl mb-4 mt-4">🌍</div>
                <h3 className="font-bold text-lg mb-2">Recorrés Europa</h3>
                <p className="text-gray-600 text-sm">
                  <strong>Kilómetros ilimitados</strong>. España, Francia, Italia, Portugal...
                </p>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-lg text-center relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-furgocasa-blue text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">4</div>
                <div className="text-4xl mb-4 mt-4">🔑</div>
                <h3 className="font-bold text-lg mb-2">Devolvés y Volás</h3>
                <p className="text-gray-600 text-sm">
                  Entrega simple en Murcia. <strong>Te llevamos al aeropuerto</strong> si querés.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* RUTAS SUGERIDAS PARA VIAJEROS LATAM */}
      {/* ============================================ */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-4">
              🗺️ Rutas Sugeridas para Viajeros LATAM
            </h2>
            <p className="text-xl text-center text-gray-600 mb-12">
              Rutas probadas por otros viajeros latinoamericanos. Tiempos reales, distancias exactas.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Ruta 1 - Mediterráneo */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border-2 border-blue-200 hover:shadow-xl transition-all">
                <div className="flex items-start gap-4 mb-4">
                  <span className="bg-blue-600 text-white font-bold text-2xl w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                    1
                  </span>
                  <div>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">⭐ MÁS POPULAR</span>
                    <h3 className="text-2xl font-heading font-bold mt-2">
                      Costa Mediterránea
                    </h3>
                    <p className="text-sm text-gray-600">10-14 días | ~1,200 km | Ideal primer viaje</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4 font-medium">
                  Murcia → Alicante → Valencia → Barcelona → Costa Brava → Murcia
                </p>
                <div className="bg-white/70 rounded-lg p-4">
                  <p className="font-bold text-sm mb-2">✨ Por qué les encanta a los LATAM:</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Playas increíbles (Benidorm, Altea, Sitges)</li>
                    <li>• Barcelona: Gaudí, Las Ramblas, Camp Nou</li>
                    <li>• Buena infraestructura de áreas de motorhome</li>
                    <li>• Rutas en español, todo familiar</li>
                  </ul>
                </div>
              </div>
              
              {/* Ruta 2 - Andalucía */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-8 border-2 border-orange-200 hover:shadow-xl transition-all">
                <div className="flex items-start gap-4 mb-4">
                  <span className="bg-orange-600 text-white font-bold text-2xl w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                    2
                  </span>
                  <div>
                    <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded">🏛️ CULTURAL</span>
                    <h3 className="text-2xl font-heading font-bold mt-2">
                      Andalucía Completa
                    </h3>
                    <p className="text-sm text-gray-600">12-16 días | ~1,800 km | Historia + Playas</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4 font-medium">
                  Murcia → Granada → Málaga → Ronda → Sevilla → Córdoba → Madrid → Murcia
                </p>
                <div className="bg-white/70 rounded-lg p-4">
                  <p className="font-bold text-sm mb-2">✨ Imperdibles para LATAM:</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Alhambra de Granada (reservar con anticipación!)</li>
                    <li>• Pueblos blancos de ensueño</li>
                    <li>• Sevilla: Flamenco, tapas, historia</li>
                    <li>• Madrid: Museo del Prado, vida nocturna</li>
                  </ul>
                </div>
              </div>
              
              {/* Ruta 3 - España + Portugal */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-200 hover:shadow-xl transition-all">
                <div className="flex items-start gap-4 mb-4">
                  <span className="bg-green-600 text-white font-bold text-2xl w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                    3
                  </span>
                  <div>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">🇵🇹 2 PAÍSES</span>
                    <h3 className="text-2xl font-heading font-bold mt-2">
                      España + Portugal
                    </h3>
                    <p className="text-sm text-gray-600">16-21 días | ~2,800 km | Dos países, una aventura</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4 font-medium">
                  Murcia → Sevilla → Lisboa → Sintra → Porto → Salamanca → Madrid → Murcia
                </p>
                <div className="bg-white/70 rounded-lg p-4">
                  <p className="font-bold text-sm mb-2">✨ Lo mejor de dos mundos:</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Lisboa: Tranvía 28, pasteles de Belém, miradouros</li>
                    <li>• Sintra: Palacios de cuento de hadas</li>
                    <li>• Porto: Bodegas de vino, puente Don Luis</li>
                    <li>• Sin frontera, mismo seguro, todo incluido</li>
                  </ul>
                </div>
              </div>
              
              {/* Ruta 4 - Gran Tour Europeo */}
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-8 border-2 border-purple-200 hover:shadow-xl transition-all">
                <div className="flex items-start gap-4 mb-4">
                  <span className="bg-purple-600 text-white font-bold text-2xl w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                    4
                  </span>
                  <div>
                    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded">🌍 ÉPICO</span>
                    <h3 className="text-2xl font-heading font-bold mt-2">
                      Gran Tour Europeo
                    </h3>
                    <p className="text-sm text-gray-600">21-30 días | ~4,500 km | El viaje de tu vida</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4 font-medium">
                  España → Sur de Francia → Costa Azul → Italia (Toscana) → Regreso
                </p>
                <div className="bg-white/70 rounded-lg p-4">
                  <p className="font-bold text-sm mb-2">✨ El sueño europeo completo:</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Provenza: Lavanda, pueblitos medievales</li>
                    <li>• Costa Azul: Niza, Mónaco, Cannes</li>
                    <li>• Cinque Terre: Los pueblos de colores</li>
                    <li>• Toscana: Florencia, Siena, viñedos</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="mt-12 bg-gradient-to-r from-furgocasa-blue to-purple-700 rounded-2xl p-8 text-white text-center">
              <h3 className="text-2xl font-bold mb-4">
                📱 Te armamos la ruta a medida
              </h3>
              <p className="text-lg mb-6 text-blue-100">
                Contanos cuántos días tenés, qué querés ver, y te sugerimos la mejor ruta. 
                Apps, campings, áreas de motorhome... todo lo que necesitás saber.
              </p>
              <a
                href="https://wa.me/34868364161?text=Hola!%20Soy%20de%20LATAM%20y%20quiero%20que%20me%20ayuden%20a%20armar%20una%20ruta%20por%20Europa"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-furgocasa-blue font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-all"
              >
                <Phone className="h-5 w-5" />
                Contactanos por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* NUESTROS MOTORHOMES */}
      {/* ============================================ */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-heading font-bold text-center mb-4">
            🚐 Nuestras Motorhomes / Casas Rodantes
          </h2>
          <p className="text-center text-gray-600 mb-12 text-lg">
            Vehículos de gran volumen, totalmente equipados para tu aventura
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {vehicles.map((vehicle) => (
              <LocalizedLink
                key={vehicle.id}
                href={`/vehiculos/${vehicle.slug}`}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                {vehicle.main_image && (
                  <div className="h-48 relative overflow-hidden">
                    <Image
                      src={vehicle.main_image}
                      alt={`Motorhome ${vehicle.name} para alquilar`}
                      fill
                      className="object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h4 className="text-xl font-heading font-bold mb-2">{vehicle.brand} {vehicle.model}</h4>
                  <p className="text-gray-600 mb-4">{vehicle.name}</p>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {vehicle.passengers} personas
                    </span>
                    <span className="flex items-center gap-1">
                      <Bed className="h-4 w-4" />
                      {vehicle.beds} camas
                    </span>
                  </div>
                </div>
              </LocalizedLink>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <LocalizedLink
              href="/vehiculos"
              className="inline-flex items-center gap-2 bg-furgocasa-blue text-white font-bold px-8 py-4 rounded-xl hover:bg-furgocasa-blue-dark transition-all shadow-lg"
            >
              Ver todas las Motorhomes →
            </LocalizedLink>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* PRECIOS */}
      {/* ============================================ */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-heading font-bold text-center mb-4">
              💶 Precios Transparentes (Sin Sorpresas)
            </h2>
            <p className="text-center text-xl mb-4 text-gray-600">
              Nuestras motorhomes en alquiler desde
            </p>
            <p className="text-center text-sm mb-12 text-furgocasa-orange font-medium">
              PAGA el 50% al reservar y el resto 15 días antes. Cancelación gratis hasta 60 días.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-2xl p-8 text-center border-2 border-gray-200">
                <p className="text-sm uppercase tracking-wider text-gray-600 mb-2">Temporada Baja</p>
                <p className="text-5xl font-heading font-bold text-furgocasa-blue mb-1">€95</p>
                <p className="text-gray-600 mb-4">/ día</p>
                <p className="text-sm text-gray-500">Nov-Feb (excepto Navidad)</p>
              </div>
              
              <div className="bg-furgocasa-blue rounded-2xl p-8 text-center shadow-xl transform scale-105 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-furgocasa-orange text-white text-xs font-bold px-3 py-1 rounded-full">
                  MÁS ELEGIDO
                </div>
                <p className="text-sm uppercase tracking-wider text-blue-200 mb-2">Temporada Media</p>
                <p className="text-5xl font-heading font-bold text-white mb-1">€125</p>
                <p className="text-blue-100 mb-4">/ día</p>
                <p className="text-sm text-blue-200">Mar-Jun, Sep-Oct</p>
              </div>
              
              <div className="bg-gray-50 rounded-2xl p-8 text-center border-2 border-gray-200">
                <p className="text-sm uppercase tracking-wider text-gray-600 mb-2">Temporada Alta</p>
                <p className="text-5xl font-heading font-bold text-furgocasa-orange mb-1">€155</p>
                <p className="text-gray-600 mb-4">/ día</p>
                <p className="text-sm text-gray-500">Jul-Ago, Navidad, Semana Santa</p>
              </div>
            </div>
            
            <div className="mt-8 bg-green-50 rounded-xl p-6 border-2 border-green-200">
              <p className="text-center text-lg">
                <strong className="text-green-700">¡Descuentos por estancias largas!</strong><br />
                <span className="text-gray-700">
                  <strong>-10%</strong> (1 semana) | <strong>-20%</strong> (2 semanas) | <strong>-30%</strong> (3+ semanas)
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* QUÉ INCLUYE */}
      {/* ============================================ */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-heading font-bold text-center mb-12">
              ✅ ¿Qué Incluye el Alquiler?
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-xl font-bold mb-6 text-green-700 flex items-center gap-2">
                  <CheckCircle className="h-6 w-6" />
                  Incluido SIN costo extra
                </h3>
                <ul className="space-y-4">
                  {[
                    { icon: Car, text: 'Kilómetros ILIMITADOS en toda Europa' },
                    { icon: Users, text: 'Conductor/es adicional/es' },
                    { icon: Shield, text: 'Seguro básico + Carta Verde europea' },
                    { icon: Star, text: 'Utensilios de cocina completos' },
                    { icon: Star, text: 'Kit de camping (mesa y sillas)' },
                    { icon: Star, text: 'Ropa de cama para todos' },
                    { icon: Phone, text: 'Asistencia 24/7 en español' },
                    { icon: Star, text: 'Inducción completa de 1 hora' },
                    { icon: CreditCard, text: 'Cancelación gratis hasta 60 días' },
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <item.icon className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-xl font-bold mb-6 text-furgocasa-blue flex items-center gap-2">
                  <Star className="h-6 w-6" />
                  Extras opcionales
                </h3>
                <ul className="space-y-4">
                  <li className="flex justify-between items-center pb-3 border-b">
                    <span>Silla para bebé</span>
                    <span className="font-bold text-furgocasa-blue">€30</span>
                  </li>
                  <li className="flex justify-between items-center pb-3 border-b">
                    <span>Bicicletas (por viaje)</span>
                    <span className="font-bold text-furgocasa-blue">€50</span>
                  </li>
                  <li className="flex justify-between items-center pb-3 border-b">
                    <span>Toldo lateral</span>
                    <span className="font-bold text-furgocasa-blue">Consultar</span>
                  </li>
                  <li className="flex justify-between items-center pb-3 border-b">
                    <span>Kit de playa</span>
                    <span className="font-bold text-furgocasa-blue">Consultar</span>
                  </li>
                  <li className="flex justify-between items-center pb-3 border-b">
                    <span>GPS Europa actualizado</span>
                    <span className="font-bold text-furgocasa-blue">Incluido</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span>Seguro TODO RIESGO</span>
                    <span className="font-bold text-furgocasa-blue">Consultar</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* BENEFICIOS PARA LATAM */}
      {/* ============================================ */}
      <section className="py-16 bg-gradient-to-br from-furgocasa-blue to-furgocasa-blue-dark text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-heading font-bold text-center mb-12">
              🌎 ¿Por qué Furgocasa es Ideal para Viajeros LATAM?
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex gap-4">
                <CheckCircle className="h-6 w-6 text-furgocasa-orange flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-lg mb-2">🗣️ Atención 100% en Español</h4>
                  <p className="text-blue-100">
                    Nada de barreras idiomáticas. Te explicamos todo, respondemos todas tus dudas, 
                    y te asistimos 24/7 en tu idioma.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <CheckCircle className="h-6 w-6 text-furgocasa-orange flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-lg mb-2">📱 WhatsApp Directo</h4>
                  <p className="text-blue-100">
                    Sin call centers. Hablás directamente con nuestro equipo. 
                    Antes, durante y después de tu viaje.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <CheckCircle className="h-6 w-6 text-furgocasa-orange flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-lg mb-2">🎓 Inducción para Primerizos</h4>
                  <p className="text-blue-100">
                    El 90% de nuestros clientes LATAM nunca manejaron motorhome. 
                    Te enseñamos TODO en 1 hora: manejo, sistemas, tips.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <CheckCircle className="h-6 w-6 text-furgocasa-orange flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-lg mb-2">🚗 Kilómetros SIN LÍMITE</h4>
                  <p className="text-blue-100">
                    Recorré España, Portugal, Francia, Italia, Suiza, Alemania... 
                    sin preocuparte por costos extras de kilómetros.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <CheckCircle className="h-6 w-6 text-furgocasa-orange flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-lg mb-2">🛡️ Seguro Europeo Completo</h4>
                  <p className="text-blue-100">
                    Carta Verde incluida. Cruzás fronteras sin trámites adicionales ni costos extras. 
                    Cobertura en toda la Unión Europea.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <CheckCircle className="h-6 w-6 text-furgocasa-orange flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-lg mb-2">💳 Pago Flexible</h4>
                  <p className="text-blue-100">
                    50% al reservar, 50% 15 días antes. Cancelación gratuita hasta 60 días. 
                    Pagás en euros, sin sorpresas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* PREGUNTAS FRECUENTES LATAM */}
      {/* ============================================ */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-heading font-bold text-center mb-12">
              ❓ Preguntas Frecuentes de Viajeros LATAM
            </h2>
            
            <div className="space-y-6">
              {[
                {
                  q: '¿Necesito licencia de conducir internacional?',
                  a: 'NO para ciudadanos de países con acuerdos (Argentina, Chile, México, Colombia, Perú, etc.). Tu licencia nacional es válida en España y Europa. Solo necesitás que esté vigente y tenga más de 2 años de antigüedad.'
                },
                {
                  q: '¿Qué edad mínima necesito?',
                  a: '25 años con mínimo 2 años de experiencia de conducción. No hay edad máxima.'
                },
                {
                  q: '¿Puedo cruzar a otros países europeos?',
                  a: '¡SÍ! Francia, Portugal, Italia, Alemania, Suiza, Bélgica, Países Bajos... toda la Unión Europea está incluida sin costo extra. La Carta Verde (seguro europeo) está incluida.'
                },
                {
                  q: '¿Cómo llego desde el aeropuerto?',
                  a: 'Podemos coordinar recogida en aeropuerto de Murcia o Alicante. También hay buses y trenes económicos. Te damos todas las opciones.'
                },
                {
                  q: '¿Es difícil manejar un motorhome?',
                  a: 'No! Es como manejar una camioneta grande. Con licencia B (auto común) alcanza. Te damos una inducción completa de 1 hora donde practicamos maniobras y te explicamos todo.'
                },
                {
                  q: '¿Dónde duermo? ¿Hay campings en Europa?',
                  a: 'Europa tiene miles de opciones: campings (€15-40/noche), áreas de motorhome gratuitas, y pernocta libre en muchos lugares. Te recomendamos las mejores apps: Park4Night, Campercontact.'
                },
                {
                  q: '¿Qué pasa si tengo un problema en la ruta?',
                  a: 'Tenés asistencia 24/7 en español por WhatsApp y teléfono. Además, el seguro incluye asistencia en carretera en toda Europa.'
                },
              ].map((faq, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-bold text-lg mb-3 text-furgocasa-blue">{faq.q}</h3>
                  <p className="text-gray-700">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* CTA FINAL */}
      {/* ============================================ */}
      <section className="py-16 bg-gradient-to-r from-furgocasa-orange to-orange-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6 text-white">
            🌍 ¿Listo para tu Gran Aventura Europea?
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Reservá ahora tu motorhome y comenzá a planear el viaje de tu vida. 
            España, Portugal, Francia, Italia... todo Europa te espera.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <LocalizedLink
              href="/reservar"
              className="inline-flex items-center gap-2 bg-white text-furgocasa-orange font-bold px-8 py-4 rounded-xl hover:bg-orange-50 transition-all shadow-lg text-lg"
            >
              ¡Reservá ahora! →
            </LocalizedLink>
            <a
              href="https://wa.me/34868364161?text=Hola!%20Vengo%20desde%20LATAM%20y%20quiero%20alquilar%20un%20motorhome%20para%20recorrer%20Europa"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-green-700 transition-all shadow-lg text-lg"
            >
              <Phone className="h-5 w-5" />
              WhatsApp directo
            </a>
          </div>
          
          <div className="mt-12 flex flex-wrap justify-center gap-6 text-white/80 text-sm">
            <span>✓ Kilómetros ilimitados</span>
            <span>✓ Seguro europeo incluido</span>
            <span>✓ Cancelación gratis 60 días</span>
            <span>✓ Asistencia 24/7 español</span>
          </div>
        </div>
      </section>
    </main>
  );
}
