"use client";

import { MapPin, Shield, Clock, Car, Plug, Camera, Phone, CheckCircle, Euro, Droplets, Scale, FileCheck, Maximize, Key } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

export function ParkingMurciaClient() {
  const { t } = useLanguage();

  const features = [
    { 
      icon: Key, 
      title: "Acceso Libre", 
      description: "Accede a nuestras instalaciones en cualquier momento, sin restricciones horarias."
    },
    { 
      icon: Camera, 
      title: "Video Vigilancia", 
      description: "Contamos con un sistema de videovigilancia para garantizar la seguridad de las instalaciones."
    },
    { 
      icon: Maximize, 
      title: "Plazas Grandes", 
      description: "Ofrecemos plazas amplias para facilitar la maniobrabilidad de tu autocaravana."
    },
    { 
      icon: FileCheck, 
      title: "Licencia de Actividad", 
      description: "Operamos con todas las licencias y permisos necesarios, asegurando un servicio profesional."
    },
    { 
      icon: Shield, 
      title: "Cobertura de Seguro", 
      description: "Tu vehículo estará protegido bajo nuestra póliza de seguro mientras permanezca aquí."
    },
    { 
      icon: Plug, 
      title: "Plazas con Electricidad", 
      description: "Disponemos de plazas equipadas con suministro eléctrico para mantener tus baterías."
    },
    { 
      icon: Droplets, 
      title: "Zona de Aguas", 
      description: "Zona habilitada para el abastecimiento de agua potable y vaciado de grises."
    },
    { 
      icon: Scale, 
      title: "Vaciado WC químico", 
      description: "Punto específico para el vaciado seguro y limpio de los depósitos de tu WC químico."
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 font-amiko">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-furgocasa-blue via-furgocasa-blue-dark to-gray-900 py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <Car className="h-16 w-16 text-white/20 mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6">
            {t("Parking para Autocaravanas")}
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            {t("Guarda tu autocaravana en un lugar seguro en Murcia")}
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">{t("Servicios incluidos")}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-furgocasa-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-furgocasa-blue" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{t(feature.title)}</h3>
                <p className="text-gray-600 text-sm">{t(feature.description)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">{t("Tarifas")}</h2>
          <div className="max-w-3xl mx-auto grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
              <p className="text-gray-500 mb-2">{t("Día")}</p>
              <p className="text-4xl font-bold text-furgocasa-blue mb-2">10€</p>
              <p className="text-sm text-gray-400">{t("IVA incluido")}</p>
            </div>
            <div className="bg-furgocasa-orange text-white rounded-2xl p-8 text-center shadow-lg">
              <p className="text-white/80 mb-2">{t("Semana")}</p>
              <p className="text-4xl font-bold mb-2">50€</p>
              <p className="text-sm text-white/70">{t("IVA incluido")}</p>
            </div>
            <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
              <p className="text-gray-500 mb-2">{t("Mes")}</p>
              <p className="text-4xl font-bold text-furgocasa-blue mb-2">120€</p>
              <p className="text-sm text-gray-400">{t("IVA incluido")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 bg-furgocasa-blue text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">{t("¿Necesitas una plaza?")}</h2>
          <p className="text-blue-100 mb-8">{t("Contacta con nosotros para reservar tu plaza")}</p>
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
