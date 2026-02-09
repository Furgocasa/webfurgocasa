"use client";

import { MapPin, Shield, Clock, Car, Plug, Camera, Phone, CheckCircle, Euro, Droplets, Scale, FileCheck, Maximize, Key, CalendarRange } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

export function ParkingMurciaClient() {
  const { t } = useLanguage();

  const features = [
    { 
      icon: MapPin, 
      title: "Ubicación en Casillas", 
      description: "Nave ubicada en Casillas, Murcia, con plazas amplias y acceso fácil para maniobrar sin problemas."
    },
    { 
      icon: Key, 
      title: "Acceso Libre 24/7", 
      description: "Accede a nuestras instalaciones en cualquier momento, sin restricciones horarias."
    },
    { 
      icon: Camera, 
      title: "Video Vigilancia", 
      description: "Sistema de videovigilancia para garantizar la seguridad de tu vehículo."
    },
    { 
      icon: Maximize, 
      title: "Plazas Amplias", 
      description: "Espacios generosos que facilitan el estacionamiento y maniobrabilidad de autocaravanas y campers."
    },
    { 
      icon: Shield, 
      title: "Cobertura de Seguro", 
      description: "Tu vehículo estará protegido bajo nuestra póliza de seguro mientras permanezca en nuestras instalaciones."
    },
    { 
      icon: Plug, 
      title: "Plazas con Electricidad", 
      description: "Plazas equipadas con suministro eléctrico para mantener tus baterías cargadas."
    },
    { 
      icon: Droplets, 
      title: "Zona de Aguas", 
      description: "Zona trasera habilitada para el abastecimiento de agua potable y vaciado de aguas grises."
    },
    { 
      icon: Scale, 
      title: "Vaciado WC Químico", 
      description: "Punto específico para el vaciado seguro y limpio de los depósitos de tu WC químico."
    },
  ];

  const pricingPlans = [
    {
      period: "Mensual",
      price: "105",
      priceDetail: "€/mes",
      description: "Pago mes a mes",
      highlight: false,
    },
    {
      period: "Trimestral",
      price: "95",
      priceDetail: "€/mes",
      description: "Pago cada 3 meses",
      highlight: true,
      savings: "Ahorra 30€",
    },
    {
      period: "Semestral",
      price: "75",
      priceDetail: "€/mes",
      description: "Pago cada 6 meses",
      highlight: false,
      savings: "Ahorra 180€",
      badge: "Mejor precio",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 font-amiko">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-furgocasa-blue via-furgocasa-blue-dark to-gray-900 py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <Car className="h-16 w-16 text-white/20 mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6">
            Parking Larga Duración para Autocaravanas
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-4">
            Aparcamiento seguro en Casillas, Murcia
          </p>
          <p className="text-lg text-blue-200/80 max-w-3xl mx-auto">
            Ideal para propietarios de autocaravanas, campers y caravanas que buscan un lugar seguro para estancias de larga duración
          </p>
        </div>
      </section>

      {/* Info destacada */}
      <section className="py-8 bg-furgocasa-orange/10 border-y border-furgocasa-orange/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 text-center">
            <div className="flex items-center gap-2">
              <CalendarRange className="h-6 w-6 text-furgocasa-orange" />
              <span className="font-semibold text-gray-900">Estancias de 1 a 6 meses</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-6 w-6 text-furgocasa-orange" />
              <span className="font-semibold text-gray-900">Casillas, Murcia</span>
            </div>
            <div className="flex items-center gap-2">
              <Maximize className="h-6 w-6 text-furgocasa-orange" />
              <span className="font-semibold text-gray-900">Plazas amplias</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Servicios incluidos</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-furgocasa-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-furgocasa-blue" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Tarifas de Larga Duración</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Elige el plan que mejor se adapte a tus necesidades. Cuanto más tiempo, mayor ahorro.
          </p>
          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div 
                key={index} 
                className={`relative rounded-2xl p-8 text-center shadow-lg transition-transform hover:scale-105 ${
                  plan.highlight 
                    ? 'bg-furgocasa-orange text-white ring-4 ring-furgocasa-orange/50' 
                    : 'bg-white'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-furgocasa-blue text-white text-sm font-bold px-4 py-1 rounded-full">
                    {plan.badge}
                  </div>
                )}
                <p className={`text-lg font-semibold mb-3 ${plan.highlight ? 'text-white' : 'text-gray-700'}`}>
                  {plan.period}
                </p>
                <div className="mb-4">
                  <p className={`text-5xl font-bold ${plan.highlight ? 'text-white' : 'text-furgocasa-blue'}`}>
                    {plan.price}€
                  </p>
                  <p className={`text-sm mt-1 ${plan.highlight ? 'text-white/80' : 'text-gray-500'}`}>
                    {plan.priceDetail}
                  </p>
                </div>
                <p className={`text-sm mb-3 ${plan.highlight ? 'text-white/90' : 'text-gray-600'}`}>
                  {plan.description}
                </p>
                {plan.savings && (
                  <p className={`text-sm font-semibold ${plan.highlight ? 'text-white' : 'text-green-600'}`}>
                    {plan.savings}
                  </p>
                )}
                <p className={`text-xs mt-4 ${plan.highlight ? 'text-white/70' : 'text-gray-400'}`}>
                  IVA incluido
                </p>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-500 text-sm mt-8">
            * Los precios se mantienen fijos durante todo el periodo contratado
          </p>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 bg-furgocasa-blue text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">¿Necesitas una plaza de larga duración?</h2>
          <p className="text-blue-100 mb-8">Contacta con nosotros para reservar tu plaza en Casillas, Murcia</p>
          <a 
            href="tel:+34868364161" 
            className="inline-flex items-center gap-2 bg-white text-furgocasa-blue font-bold py-3 px-8 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <Phone className="h-5 w-5" />
            868 36 41 61
          </a>
        </div>
      </section>
    </main>
  );
}
