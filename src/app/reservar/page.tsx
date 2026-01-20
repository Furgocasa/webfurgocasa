"use client";

import { SearchWidget } from"@/components/booking/search-widget";
import Link from"next/link";
import { MapPin, Clock, Phone, Car, ArrowRight, CheckCircle, Calendar, CreditCard } from"lucide-react";
import { useLanguage } from"@/contexts/language-context";
const locations = [
  {
    id:"murcia",
    name:"Murcia",
    slug:"murcia",
    address:"Avenida Puente Tocinos, 4",
    city:"30007 Casillas, Murcia",
    phone:"+34 868 364 161",
    hours:"Lunes a Viernes: 10:00 - 14:00 | 17:00 - 19:30",
    description:"Nuestra sede central con toda la flota disponible",
    features: ["Flota completa","Parking gratuito clientes","A 15 min de la estación de tren"],
    image:"/images/locations/murcia.jpg", // Placeholder
    available: true,
  },
  {
    id:"madrid",
    name:"Madrid",
    slug:"madrid",
    address:"Servicio de entrega y recogida",
    city:"Madrid",
    phone:"+34 868 364 161",
    hours:"Lunes a Viernes: 10:00 - 14:00 | 17:00 - 19:30",
    description:"Punto de entrega y recogida en Madrid disponible",
    features: ["Entrega personalizada","Cerca del aeropuerto","Servicio premium"],
    image:"/images/locations/madrid.jpg", // Placeholder
    available: true,
  },
];

export default function ReservarPage() {
  const { t } = useLanguage();

  return (
    <>
<main className="min-h-screen bg-gray-50 font-amiko">
        {/* Hero Section - Modernizado */}
        <section className="bg-gradient-to-br from-furgocasa-blue via-furgocasa-blue-dark to-gray-900 pt-8 md:pt-12 pb-48 relative overflow-visible">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
          
          <div className="container mx-auto px-4 relative z-10 text-center">
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6 tracking-tight mt-4 md:mt-0">
              {t("Reserva tu aventura")}
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-12 font-light">
              {t("Encuentra tu camper ideal y comienza tu viaje hoy mismo. Sin letra pequeña, con todo incluido.")}
            </p>
            
            {/* Search Widget - Flotando sobre la siguiente sección */}
            <div className="max-w-5xl mx-auto transform translate-y-12 relative z-20">
              <SearchWidget />
            </div>
          </div>
        </section>

        {/* Espacio para el widget flotante */}
        <div className="h-24 bg-gray-50"></div>

        {/* Proceso de reserva - Modernizado */}
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10 md:mb-16">
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-gray-900 mb-3 md:mb-4">
                {t("¿Cómo funciona?")}
              </h2>
              <p className="text-gray-600 text-base md:text-lg">
                {t("Reserva tu camper en 4 sencillos pasos")}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-6xl mx-auto relative">
              {/* Línea conectora (desktop) */}
              <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gray-200 -z-10 rounded-full"></div>

              {[
                { step:"1", title:"Elige ubicación", desc:"Selecciona dónde recoger tu vehículo", icon: MapPin },
                { step:"2", title:"Selecciona fechas", desc:"Indica los días de tu viaje", icon: Calendar },
                { step:"3", title:"Elige vehículo", desc:"Escoge el modelo que mejor te encaje", icon: Car },
                { step:"4", title:"Confirma y paga", desc:"Reserva abonando solo el 50%", icon: CreditCard },
              ].map((item, index) => (
                <div key={item.step} className="flex flex-col items-center text-center group">
                  <div className="w-16 h-16 md:w-24 md:h-24 bg-white rounded-full shadow-lg flex items-center justify-center mb-3 md:mb-6 group-hover:scale-110 transition-transform duration-300 border-2 md:border-4 border-gray-50 relative z-10">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-furgocasa-blue text-white rounded-full flex items-center justify-center">
                      <item.icon className="h-5 w-5 md:h-8 md:w-8" />
                    </div>
                    <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-6 h-6 md:w-8 md:h-8 bg-furgocasa-orange text-white rounded-full flex items-center justify-center font-bold text-xs md:text-sm shadow-md">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="font-heading font-bold text-sm md:text-xl text-gray-900 mb-1 md:mb-2 group-hover:text-furgocasa-blue transition-colors">
                    {t(item.title)}
                  </h3>
                  <p className="text-gray-600 text-xs md:text-sm max-w-[150px] md:max-w-[200px]">
                    {t(item.desc)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Nuestras ubicaciones - Modernizado */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-heading font-bold text-gray-900 mb-4">
                {t("Nuestras ubicaciones")}
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                {t("Puedes recoger y devolver tu camper en nuestra sede central en Murcia. Consulta disponibilidad para entregas especiales.")}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
              {locations.map((location) => (
                <div key={location.id} className={`bg-white rounded-3xl shadow-xl overflow-hidden group border border-gray-100 transition-all duration-300 ${!location.available ? 'opacity-80 grayscale-[0.5]' : 'hover:shadow-2xl hover:-translate-y-1'}`}>
                  <div className="h-56 bg-gray-200 relative overflow-hidden">
                    {/* Placeholder gradient si no hay imagen */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${location.id === 'murcia' ? 'from-furgocasa-blue to-blue-600' : 'from-gray-500 to-gray-700'}`}></div>
                    
                    {/* Overlay contenido */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
                      <MapPin className="h-12 w-12 mb-3 opacity-80" />
                      <h3 className="text-3xl font-heading font-bold">{location.name}</h3>
                    </div>

                    {!location.available && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                        <span className="bg-red-500 text-white px-6 py-2 rounded-full font-bold uppercase tracking-wider shadow-lg transform -rotate-3">
                          {t("Próximamente")}
                        </span>
                      </div>
                    )}
                    {location.available && (
                      <div className="absolute top-4 right-4">
                        <span className="bg-green-500 text-white text-xs px-4 py-1.5 rounded-full font-bold uppercase tracking-wide shadow-md flex items-center gap-1">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          {t("Disponible")}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-8">
                    <p className="text-gray-600 mb-6 text-lg">
                      {t(location.description)}
                    </p>
                    
                    <div className="space-y-4 mb-8">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 text-furgocasa-blue">
                          <MapPin className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{t("Dirección")}</p>
                          <p className="text-gray-600 text-sm">{t(location.address)}</p>
                          <p className="text-gray-500 text-xs">{t(location.city)}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0 text-furgocasa-orange">
                          <Clock className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{t("Horario")}</p>
                          <p className="text-gray-600 text-sm">{t(location.hours)}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 text-green-600">
                          <Phone className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{t("Teléfono")}</p>
                          <a href={`tel:${location.phone}`} className="text-gray-600 text-sm hover:text-furgocasa-blue transition-colors">{t(location.phone)}</a>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-6 border-t border-gray-100">
                      {location.features.map((feature) => (
                        <span key={feature} className="flex items-center gap-1.5 text-xs bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg font-medium">
                          <CheckCircle className="h-3.5 w-3.5 text-furgocasa-blue" />
                          {t(feature)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA - Modernizado */}
        <section className="py-20 bg-furgocasa-blue text-white overflow-hidden relative">
          {/* Decoración */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-furgocasa-orange/20 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>

          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-3xl font-heading font-bold mb-6">
              {t("¿Prefieres que te ayudemos?")}
            </h2>
            <p className="text-blue-100 mb-10 text-lg max-w-2xl mx-auto">
              {t("Llámanos y nuestro equipo te asesorará para elegir la mejor camper para tu viaje sin compromiso.")}
            </p>
            <a 
              href="tel:+34868364161" 
              className="inline-flex items-center gap-3 bg-white text-furgocasa-blue font-bold py-4 px-10 rounded-xl hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 group"
            >
              <Phone className="h-6 w-6 group-hover:animate-bounce" />
              <span>868 36 41 61</span>
            </a>
          </div>
        </section>
      </main>
</>
  );
}
