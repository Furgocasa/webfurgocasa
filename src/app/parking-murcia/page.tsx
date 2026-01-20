"use client";

import { MapPin, Shield, Clock, Car, Plug, Camera, Phone, CheckCircle, Euro, Droplets, Scale, FileCheck, Maximize, Key } from"lucide-react";
import { useLanguage } from"@/contexts/language-context";
export default function ParkingMurciaPage() {
  const { t } = useLanguage();

  const features = [
    { 
      icon: Key, 
      title:"Acceso Libre", 
      description:"Accede a nuestras instalaciones en cualquier momento, sin restricciones horarias."
    },
    { 
      icon: Camera, 
      title:"Video Vigilancia", 
      description:"Contamos con un sistema de videovigilancia para garantizar la seguridad de las instalaciones."
    },
    { 
      icon: Maximize, 
      title:"Plazas Grandes", 
      description:"Ofrecemos plazas amplias para facilitar la maniobrabilidad de tu autocaravana."
    },
    { 
      icon: FileCheck, 
      title:"Licencia de Actividad", 
      description:"Operamos con todas las licencias y permisos necesarios, asegurando un servicio profesional."
    },
    { 
      icon: Shield, 
      title:"Cobertura de Seguro", 
      description:"Tu vehículo estará protegido bajo nuestra póliza de seguro mientras permanezca aquí."
    },
    { 
      icon: Plug, 
      title:"Plazas con Electricidad", 
      description:"Disponemos de plazas equipadas con suministro eléctrico para mantener tus baterías."
    },
    { 
      icon: Droplets, 
      title:"Zona de Aguas", 
      description:"Zona habilitada para el abastecimiento de agua potable y vaciado de grises."
    },
    { 
      icon: Scale, 
      title:"Vaciado WC químico", 
      description:"Punto específico para el vaciado seguro y limpio de los depósitos de tu WC químico."
    },
  ];

  const reasons = [
    {
      title:"Ubicación estratégica",
      description:"Situado en un punto clave de Murcia con fácil acceso desde las principales vías. Inicia tus viajes sin complicaciones."
    },
    {
      title:"Comodidad y servicios",
      description:"Plazas amplias, electricidad, zonas de carga y descarga. Acceso 24/7 adaptado a tu horario."
    },
    {
      title:"Seguridad garantizada",
      description:"Videovigilancia 24/7, recinto cerrado y seguro incluido. Tu vehículo protegido como nuestra propia flota."
    },
    {
      title:"Tarifas competitivas",
      description:"Tarifas flexibles por meses o larga duración. Servicio profesional y legalmente establecido."
    },
  ];

  const prices = [
    { period:"1 MES", price:"105", note:"/ mes" },
    { period:"3 MESES", price:"95", note:"/ mes" },
    { period:"6 MESES", price:"85", note:"/ mes" },
  ];

  return (
    <>
<main className="min-h-screen bg-gray-50 font-amiko">
        {/* Hero Section - Modernizado */}
        <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-24 overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>

          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="inline-block mb-6">
              <span className="text-sm font-bold text-furgocasa-orange uppercase tracking-wider bg-furgocasa-orange/10 px-6 py-2 rounded-full border border-furgocasa-orange/30 backdrop-blur-md">
                {t("PARKING LARGA DURACION")}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-6 leading-tight">
              {t("Aparcamiento de")}<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">{t("Autocaravanas y Campers")}</span><br />
              <span className="text-furgocasa-orange">{t("en MURCIA")}</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-10 font-light leading-relaxed">
              {t("Parking cubierto en Casillas, Murcia. Videovigilado 24h y con todos los servicios incluidos.")}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="#servicios" className="bg-white text-gray-900 font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition-all shadow-lg hover:-translate-y-1">
                {t("VER SERVICIOS")}
              </a>
              <a href="#precios" className="bg-furgocasa-orange text-white font-bold px-8 py-4 rounded-xl hover:bg-orange-600 transition-all shadow-lg hover:-translate-y-1">
                {t("VER PRECIOS")}
              </a>
            </div>
          </div>
        </section>

        {/* Features Grid - Modernizado */}
        <section id="servicios" className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-heading font-bold text-gray-900 mb-4">
                {t("Servicios Premium Incluidos")}
              </h2>
              <p className="text-gray-600 text-lg">
                {t("Todo lo que necesitas para el cuidado de tu vehículo")}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-gray-50 rounded-3xl p-8 text-center hover:bg-white hover:shadow-xl transition-all duration-300 border border-gray-100 group">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:bg-furgocasa-orange group-hover:text-white transition-colors">
                    <feature.icon className="h-8 w-8 text-furgocasa-orange group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-heading font-bold text-gray-900 mb-3 text-lg uppercase group-hover:text-furgocasa-orange transition-colors">
                    {t(feature.title)}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{t(feature.description)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Section - Modernizado */}
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <p className="text-furgocasa-orange font-bold uppercase tracking-wider text-sm mb-2">
                {t("¿Eres propietario?")}
              </p>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900">
                {t("¿Por qué elegir Furgocasa?")}
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {reasons.map((reason, index) => (
                <div key={index} className="bg-white rounded-3xl p-10 shadow-lg border-l-4 border-furgocasa-blue hover:translate-x-1 transition-transform">
                  <h3 className="font-heading font-bold text-xl text-furgocasa-blue mb-4 flex items-center gap-2">
                    <CheckCircle className="h-6 w-6" />
                    {t(reason.title)}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {t(reason.description)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section - Modernizado */}
        <section id="precios" className="py-24 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
                {t("Tarifas Simples y Transparentes")}
              </h2>
              <p className="text-gray-400 text-sm font-bold uppercase tracking-widest bg-white/10 inline-block px-4 py-1 rounded-full">
                {t("IVA INCLUIDO")}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {prices.map((price, index) => (
                <div key={index} className={`bg-white rounded-[2.5rem] overflow-hidden transition-all duration-300 transform hover:scale-105 ${index === 2 ? 'shadow-2xl ring-4 ring-furgocasa-orange' : 'shadow-xl'}`}>
                  <div className={`p-8 text-center ${index === 2 ? 'bg-furgocasa-orange text-white' : 'bg-gray-100 text-gray-900'}`}>
                    <h3 className="font-heading font-bold text-2xl tracking-wide">{t(price.period)}</h3>
                    {index === 2 && <p className="text-xs font-bold mt-2 bg-white/20 inline-block px-2 py-1 rounded">{t("MEJOR PRECIO")}</p>}
                  </div>
                  <div className="p-10 text-center bg-white">
                    <div className="mb-8 flex items-end justify-center">
                      <span className="text-6xl font-heading font-bold text-gray-900">{price.price}€</span>
                      <span className="text-gray-500 text-xl font-medium mb-2 ml-1">{t(price.note)}</span>
                    </div>
                    <ul className="text-gray-600 text-sm space-y-3 mb-8 text-left max-w-[200px] mx-auto">
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> {t("Acceso 24/7")}</li>
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> {t("Videovigilancia")}</li>
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> {t("Seguro incluido")}</li>
                    </ul>
                    <a 
                      href="https://wa.me/34673414053" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`block w-full font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl ${index === 2 ? 'bg-furgocasa-orange text-white hover:bg-orange-600' : 'bg-gray-900 text-white hover:bg-black'}`}
                    >
                      {t("RESERVAR PLAZA")}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery Placeholder - Modernizado */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-heading font-bold text-center text-gray-900 mb-12">{t("Nuestras instalaciones")}</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-100 h-72 rounded-3xl flex items-center justify-center text-gray-400 border border-gray-200 group overflow-hidden relative">
                  <Camera className="h-12 w-12 opacity-50 group-hover:scale-110 transition-transform duration-500" />
                  <span className="absolute bottom-6 font-bold text-sm tracking-widest uppercase">{t("FOTO INSTALACIÓN")} {i}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Location Section - Modernizado */}
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden flex flex-col md:flex-row">
                <div className="md:w-1/2 bg-gray-200 h-80 md:h-auto flex items-center justify-center text-gray-400 relative">
                   {/* Placeholder Map */}
                  <MapPin className="h-16 w-16 opacity-50" />
                  <span className="absolute mt-24 font-bold text-sm uppercase">{t("Google Maps")}</span>
                </div>
                <div className="md:w-1/2 p-12 bg-furgocasa-blue text-white flex flex-col justify-center">
                  <div className="mb-8">
                    <MapPin className="h-12 w-12 text-furgocasa-orange mb-4" />
                    <h3 className="font-heading font-bold text-3xl mb-2">
                      {t("Ubicación")}
                    </h3>
                    <p className="text-blue-200 text-lg mb-1">{t("Avenida Puente Tocinos, 4")}</p>
                    <p className="text-blue-200 text-lg">{t("30007 Casillas - Murcia")}</p>
                  </div>
                  
                  <div className="space-y-4">
                    <a 
                      href="https://maps.google.com/?q=Avenida+Puente+Tocinos+4+Casillas+Murcia"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-white font-bold hover:text-furgocasa-orange transition-colors"
                    >
                      <MapPin className="h-5 w-5" /> {t("Abrir en Google Maps")}
                    </a>
                    <a 
                      href="tel:+34673414053"
                      className="inline-flex items-center gap-2 text-white font-bold hover:text-furgocasa-orange transition-colors display-block"
                    >
                      <Phone className="h-5 w-5" /> +34 673 41 40 53
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Modernizado */}
        <section className="py-24 bg-white text-center">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-gray-900 mb-6 max-w-4xl mx-auto leading-tight">
              {t("¿Quieres aparcar tu autocaravana con total seguridad?")}
            </h2>
            <p className="text-xl text-gray-600 mb-12">
              {t("Llámanos y reserva tu plaza hoy mismo")}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <a 
                href="tel:+34673414053" 
                className="inline-flex items-center justify-center gap-3 bg-furgocasa-blue text-white font-bold text-xl py-5 px-10 rounded-2xl hover:bg-blue-800 transition-all shadow-xl hover:-translate-y-1 w-full sm:w-auto"
              >
                <Phone className="h-6 w-6" />
                {t("LLAMAR AHORA")}
              </a>
              <a 
                href="https://wa.me/34673414053" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 bg-[#25D366] text-white font-bold text-xl py-5 px-10 rounded-2xl hover:bg-[#128C7E] transition-all shadow-xl hover:-translate-y-1 w-full sm:w-auto"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                {t("WHATSAPP")}
              </a>
            </div>
          </div>
        </section>
      </main>
</>
  );
}
