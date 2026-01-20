import { Metadata } from"next";
import { MapPin, Wifi, Droplets, Plug, Trash2, ShowerHead, ExternalLink, Sparkles, Route, Map, Shield } from"lucide-react";
import { translateServer } from"@/lib/i18n/server-translation";

export const metadata: Metadata = {
  title:"Mapa de Áreas para Autocaravanas | Furgocasa Campervans",
  description:"Encuentra las mejores áreas de servicio y pernocta para autocaravanas y campers en España. Mapa interactivo con servicios, valoraciones y fotos.",
};

// TODO: Integrar con API de áreas o base de datos propia
const areas = [
  { id:"1", name:"Área de Cabo de Palos", location:"Cartagena, Murcia", type:"area_servicio", services: ["agua","vaciado","electricidad"], price:"Gratuita", rating: 4.5, lat: 37.6347, lng: -0.6967 },
  { id:"2", name:"Parking La Manga", location:"La Manga, Murcia", type:"parking", services: ["agua"], price:"10€/noche", rating: 4.0, lat: 37.6421, lng: -0.7156 },
  { id:"3", name:"Área Camping Mar Menor", location:"San Javier, Murcia", type:"camping", services: ["agua","vaciado","electricidad","wifi","duchas"], price:"18€/noche", rating: 4.8, lat: 37.7883, lng: -0.8367 },
  { id:"4", name:"Área Municipal Águilas", location:"Águilas, Murcia", type:"area_servicio", services: ["agua","vaciado"], price:"Gratuita", rating: 3.8, lat: 37.4054, lng: -1.5839 },
  { id:"5", name:"Parking Playa Mazarrón", location:"Mazarrón, Murcia", type:"parking", services: [], price:"Gratuita", rating: 3.5, lat: 37.5614, lng: -1.2614 },
];

const serviceIcons: Record<string, { icon: any; label: string }> = {
  agua: { icon: Droplets, label:"Agua potable" },
  vaciado: { icon: Trash2, label:"Vaciado aguas grises" },
  electricidad: { icon: Plug, label:"Electricidad" },
  wifi: { icon: Wifi, label:"WiFi" },
  duchas: { icon: ShowerHead, label:"Duchas" },
};

const typeLabels: Record<string, { label: string; color: string }> = {
  area_servicio: { label:"Área de servicio", color:"bg-green-100 text-green-700" },
  parking: { label:"Parking", color:"bg-blue-100 text-blue-700" },
  camping: { label:"Camping", color:"bg-orange-100 text-orange-700" },
};

export default function MapaAreasPage() {
  // Función de traducción del servidor
  const t = (key: string) => translateServer(key, 'es');
  
  return (
    <>
<main className="min-h-screen bg-gray-50">
        <section className="bg-gradient-to-br from-furgocasa-blue to-furgocasa-blue-dark py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{t("Mapa de Áreas")}</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">{t("Encuentra las mejores áreas de servicio y pernocta para tu camper en España")}</p>
          </div>
        </section>

        {/* Banner Principal - Mapa Furgocasa App */}
        <section className="py-12 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
          <div className="container mx-auto px-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-white/20">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 bg-yellow-400/20 text-yellow-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
                    <Sparkles className="h-4 w-4" />
                    Ahora con Inteligencia Artificial GPT-4
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Descubre Mapa Furgocasa
                  </h2>
                  <p className="text-xl text-white/80 mb-6">
                    Tu plataforma completa para gestionar tu autocaravana con IA. +1000 áreas verificadas, rutas inteligentes y protección 24/7.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <Map className="h-5 w-5 text-green-400" />
                      </div>
                      <div>
                        <p className="text-white font-semibold">+1000 Áreas</p>
                        <p className="text-white/60 text-sm">Verificadas</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-white font-semibold">Valoración IA</p>
                        <p className="text-white/60 text-sm">GPT-4</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <Route className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-white font-semibold">Rutas</p>
                        <p className="text-white/60 text-sm">Planificador</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                        <Shield className="h-5 w-5 text-red-400" />
                      </div>
                      <div>
                        <p className="text-white font-semibold">Protección</p>
                        <p className="text-white/60 text-sm">24/7 con QR</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <a 
                      href="https://www.mapafurgocasa.com/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 bg-furgocasa-orange hover:bg-furgocasa-orange/90 text-white font-bold py-4 px-8 rounded-xl transition-all hover:scale-105 shadow-lg shadow-orange-500/30"
                    >
                      <Map className="h-5 w-5" />
                      Ver Mapa Completo
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <a 
                      href="https://www.mapafurgocasa.com/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-xl transition-colors border border-white/30"
                    >
                      100% Gratis
                    </a>
                  </div>
                </div>

                {/* Preview del mapa */}
                <div className="relative">
                  <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                    <div className="bg-gray-100 p-3 flex items-center gap-2 border-b">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      </div>
                      <span className="text-xs text-gray-500 ml-2">mapafurgocasa.com</span>
                    </div>
                    <div className="aspect-video bg-gradient-to-br from-green-100 via-blue-50 to-blue-100 relative p-4">
                      {/* Simulación de mapa con pins */}
                      <div className="absolute top-1/4 left-1/3">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                          <MapPin className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div className="absolute top-1/2 left-1/2">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                          <MapPin className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div className="absolute top-1/3 right-1/4">
                        <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                          <MapPin className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div className="absolute bottom-1/4 left-1/4">
                        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                          <MapPin className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-md p-3">
                        <p className="text-xs font-semibold text-gray-800">+1000 áreas</p>
                        <p className="text-[10px] text-gray-500">España y Europa</p>
                      </div>
                    </div>
                  </div>
                  {/* Badge flotante */}
                  <div className="absolute -top-4 -right-4 bg-yellow-400 text-yellow-900 font-bold px-4 py-2 rounded-full text-sm shadow-lg transform rotate-12">
                    GRATIS
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Algunas áreas destacadas en Murcia</h2>
              <p className="text-gray-600">Para ver el mapa completo con +1000 áreas, visita <a href="https://www.mapafurgocasa.com/" target="_blank" rel="noopener noreferrer" className="text-furgocasa-orange hover:underline font-semibold">mapafurgocasa.com</a></p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {areas.map((area) => (
                <div key={area.id} className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className={`text-xs px-2 py-1 rounded-full ${typeLabels[area.type].color}`}>{typeLabels[area.type].label}</span>
                      <h3 className="font-bold text-gray-900 mt-2">{area.name}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin className="h-3 w-3" />{area.location}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-yellow-500">
                        <span className="font-bold">{area.rating}</span>
                        <span>★</span>
                      </div>
                      <p className="text-sm font-semibold text-furgocasa-orange">{area.price}</p>
                    </div>
                  </div>
                  {area.services.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {area.services.map((service) => {
                        const svc = serviceIcons[service];
                        if (!svc) return null;
                        return (
                          <span key={service} className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded" title={svc.label}>
                            <svc.icon className="h-3 w-3" />{svc.label}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* CTA secundario */}
            <div className="text-center mt-8">
              <a 
                href="https://www.mapafurgocasa.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-furgocasa-blue hover:bg-furgocasa-blue-dark text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                <Map className="h-5 w-5" />
                Ver todas las áreas en el mapa
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>

        {/* Info */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">{t("¿Qué encontrarás en el mapa?")}</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><Droplets className="h-8 w-8 text-green-600" /></div>
                <h3 className="font-bold text-gray-900 mb-2">Áreas de servicio</h3>
                <p className="text-gray-600">Puntos con servicios de agua, vaciado y a veces electricidad. Muchas son gratuitas.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"><MapPin className="h-8 w-8 text-blue-600" /></div>
                <h3 className="font-bold text-gray-900 mb-2">Parkings</h3>
                <p className="text-gray-600">Zonas de aparcamiento donde está permitida la pernocta. Algunos con servicios básicos.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4"><Wifi className="h-8 w-8 text-orange-600" /></div>
                <h3 className="font-bold text-gray-900 mb-2">Campings</h3>
                <p className="text-gray-600">Campings con todos los servicios: electricidad, WiFi, duchas, piscina y más.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-16 bg-gradient-to-r from-furgocasa-orange to-orange-500">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Explora más de 1000 áreas en toda España</h2>
            <p className="text-white/90 mb-8 text-lg max-w-2xl mx-auto">
              Mapa Furgocasa es tu compañero perfecto de viaje. Planifica rutas, encuentra áreas verificadas y gestiona tu autocaravana con inteligencia artificial.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="https://www.mapafurgocasa.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white text-furgocasa-orange font-bold py-4 px-8 rounded-xl hover:bg-gray-100 transition-all hover:scale-105 shadow-lg"
              >
                <Map className="h-5 w-5" />
                Ir a Mapa Furgocasa
                <ExternalLink className="h-4 w-4" />
              </a>
              <a href="/contacto" className="inline-flex items-center justify-center gap-2 bg-white/20 text-white font-semibold py-4 px-8 rounded-xl hover:bg-white/30 transition-colors border border-white/40">
                Sugerir un área
              </a>
            </div>
          </div>
        </section>
      </main>
</>
  );
}
