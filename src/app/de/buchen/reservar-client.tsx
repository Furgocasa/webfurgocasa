"use client";

import { SearchWidget } from "@/components/booking/search-widget";
import Link from "next/link";
import { MapPin, Clock, Phone, Car, ArrowRight, CheckCircle, Calendar, CreditCard } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

const locations = [
  {
    id: "murcia",
    name: "Murcia",
    slug: "murcia",
    address: "Avenida Puente Tocinos, 4",
    city: "30007 Casillas, Murcia",
    phone: "+34 868 364 161",
    hours: "Lunes a Viernes: 10:00 - 14:00 | 17:00 - 19:30",
    description: "Nuestra sede central con toda la flota disponible",
    features: ["Flota completa", "Parking gratuito clientes", "A 15 min de la estación de tren"],
    image: "/images/locations/murcia.jpg",
    available: true,
  },
  {
    id: "madrid",
    name: "Madrid",
    slug: "madrid",
    address: "Servicio de entrega y recogida",
    city: "Madrid",
    phone: "+34 868 364 161",
    hours: "Lunes a Viernes: 10:00 - 14:00 | 17:00 - 19:30",
    description: "Punto de entrega y recogida en Madrid disponible",
    features: ["Entrega personalizada", "Cerca del aeropuerto", "Servicio premium"],
    image: "/images/locations/madrid.jpg",
    available: true,
  },
];

export function ReservarClient() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-gray-50 font-amiko">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-furgocasa-blue via-furgocasa-blue-dark to-gray-900 pt-8 md:pt-12 pb-48 relative overflow-visible">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6 tracking-tight mt-4 md:mt-0">
            {t("Reserva tu aventura")}
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            {t("Selecciona tus fechas y encuentra la camper perfecta para tu viaje")}
          </p>
        </div>

        {/* Search Widget */}
        <div className="container mx-auto px-4 relative z-20">
          <div className="max-w-5xl mx-auto -mb-32">
            <SearchWidget variant="full" />
          </div>
        </div>
      </section>

      {/* Locations */}
      <section className="pt-40 pb-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-heading font-bold text-gray-900 mb-8 text-center">
            {t("Puntos de recogida")}
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {locations.map((location) => (
              <div key={location.id} className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-furgocasa-blue/10 rounded-xl flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-furgocasa-blue" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl text-gray-900 mb-1">{location.name}</h3>
                    <p className="text-gray-600 text-sm">{location.address}</p>
                    <p className="text-gray-500 text-sm">{location.city}</p>
                    
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{location.hours}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{location.phone}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex flex-wrap gap-2">
                      {location.features.map((feature) => (
                        <span key={feature} className="text-xs bg-white px-2 py-1 rounded-full text-gray-600">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-heading font-bold text-gray-900 mb-12 text-center">
            {t("¿Cómo funciona?")}
          </h2>
          
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { icon: Calendar, title: "1. Elige fechas", desc: "Selecciona tus fechas de viaje" },
              { icon: Car, title: "2. Elige camper", desc: "Compara y selecciona tu vehículo" },
              { icon: CreditCard, title: "3. Paga señal", desc: "Solo el 30% para confirmar" },
              { icon: CheckCircle, title: "4. ¡A viajar!", desc: "Recoge tu camper y disfruta" },
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-furgocasa-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <step.icon className="h-8 w-8 text-furgocasa-orange" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{t(step.title)}</h3>
                <p className="text-gray-600 text-sm">{t(step.desc)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
