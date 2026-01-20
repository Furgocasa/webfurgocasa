import { Metadata } from"next";
import { MapPin, Wifi, Droplets, Plug, Trash2, ShowerHead, Search, ExternalLink, Sparkles, Route, Map, Shield } from"lucide-react";
import { translateServer } from"@/lib/i18n/server-translation";
import Link from "next/link";

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

        {/* Filtros */}
        <section className="bg-white border-b sticky top-0 z-20">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input type="text" placeholder="Buscar por ciudad o zona..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <select className="px-4 py-2 border border-gray-300 rounded-lg">
                <option value="">Todos los tipos</option>
                <option value="area_servicio">Áreas de servicio</option>
                <option value="parking">Parkings</option>
                <option value="camping">Campings</option>
              </select>
              <select className="px-4 py-2 border border-gray-300 rounded-lg">
                <option value="">Todos los servicios</option>
                <option value="agua">Con agua</option>
                <option value="vaciado">Con vaciado</option>
                <option value="electricidad">Con electricidad</option>
                <option value="wifi">Con WiFi</option>
              </select>
              <select className="px-4 py-2 border border-gray-300 rounded-lg">
                <option value="">Cualquier precio</option>
                <option value="gratis">Gratuitas</option>
                <option value="pago">De pago</option>
              </select>
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Mapa */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="h-[500px] bg-gray-200 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 mx-auto mb-2" />
                      <p>Mapa interactivo de Google Maps</p>
                      <p className="text-sm">Integrar con Google Maps API</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de áreas */}
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                <p className="text-sm text-gray-600">{areas.length} áreas encontradas</p>
                {areas.map((area) => (
                  <div key={area.id} className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer">
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
                      <div className="flex gap-2 mt-3">
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

        {/* CTA */}
        <section className="py-12 bg-furgocasa-orange">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">{t("¿Conoces un área que no aparece?")}</h2>
            <p className="text-white/90 mb-6">{t("Ayúdanos a completar el mapa enviándonos la información")}</p>
            <a href="/contacto" className="inline-block bg-white text-furgocasa-orange font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors">Sugerir área</a>
          </div>
        </section>
      </main>
</>
  );
}
