'use client';

import Link from "next/link";
import { useEffect } from "react";
import { 
  Home, 
  Car, 
  MapPin, 
  Calendar, 
  Phone, 
  BookOpen,
  Search,
  ArrowRight,
  Compass,
  Mountain
} from "lucide-react";

// Metadata para SEO (debe estar en componente Server)
// Se configura en layout.tsx o mediante generateMetadata

// Componente de vehículo animado SVG
function AnimatedVan() {
  return (
    <div className="relative w-64 h-40 mx-auto mb-8">
      {/* Carretera */}
      <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 rounded-full" />
      <div className="absolute bottom-1 left-1/4 w-2 h-1 bg-yellow-400 rounded-full animate-pulse" />
      <div className="absolute bottom-1 left-1/2 w-2 h-1 bg-yellow-400 rounded-full animate-pulse delay-300" />
      <div className="absolute bottom-1 left-3/4 w-2 h-1 bg-yellow-400 rounded-full animate-pulse delay-700" />
      
      {/* Furgoneta SVG con animación */}
      <svg 
        viewBox="0 0 200 100" 
        className="w-full h-full animate-bounce-slow"
      >
        {/* Cuerpo de la furgoneta - Azul corporativo Furgocasa */}
        <rect x="20" y="35" width="140" height="50" rx="8" fill="#063971" />
        <rect x="130" y="25" width="40" height="60" rx="8" fill="#063971" />
        
        {/* Ventanas */}
        <rect x="135" y="30" width="30" height="25" rx="4" fill="#87CEEB" opacity="0.9" />
        <rect x="30" y="40" width="25" height="20" rx="3" fill="#87CEEB" opacity="0.9" />
        <rect x="60" y="40" width="25" height="20" rx="3" fill="#87CEEB" opacity="0.9" />
        <rect x="90" y="40" width="25" height="20" rx="3" fill="#87CEEB" opacity="0.9" />
        
        {/* Detalles - Naranja corporativo Furgocasa */}
        <rect x="25" y="65" width="100" height="4" rx="2" fill="#FF6B35" />
        <circle cx="150" cy="45" r="4" fill="#FF6B35" />
        
        {/* Ruedas */}
        <circle cx="55" cy="85" r="12" fill="#1E293B" />
        <circle cx="55" cy="85" r="6" fill="#475569" />
        <circle cx="145" cy="85" r="12" fill="#1E293B" />
        <circle cx="145" cy="85" r="6" fill="#475569" />
        
        {/* Signo de interrogación flotando */}
        <text x="100" y="20" fontSize="22" fill="#FF6B35" fontWeight="bold" className="animate-pulse">?</text>
      </svg>
      
      {/* Nubes decorativas */}
      <div className="absolute top-0 left-0 w-12 h-6 bg-white/60 rounded-full blur-sm animate-float" />
      <div className="absolute top-4 right-8 w-16 h-8 bg-white/50 rounded-full blur-sm animate-float [animation-delay:1s]" />
      <div className="absolute top-2 left-1/3 w-10 h-5 bg-white/40 rounded-full blur-sm animate-float [animation-delay:2s]" />
    </div>
  );
}

// Componente de tarjeta de enlace
function QuickLinkCard({ 
  href, 
  icon: Icon, 
  title, 
  description, 
  variant = "blue"
}: { 
  href: string; 
  icon: React.ComponentType<{ className?: string }>; 
  title: string; 
  description: string;
  variant?: "blue" | "orange";
}) {
  const iconBgClass = variant === "blue" 
    ? "bg-gradient-to-br from-furgocasa-blue to-furgocasa-blue-dark"
    : "bg-gradient-to-br from-furgocasa-orange to-furgocasa-orange-dark";
  
  const hoverBorderClass = variant === "blue"
    ? "hover:border-furgocasa-blue"
    : "hover:border-furgocasa-orange";
  
  const overlayClass = variant === "blue"
    ? "from-furgocasa-blue/5 to-furgocasa-blue/10"
    : "from-furgocasa-orange/5 to-furgocasa-orange/10";

  return (
    <Link
      href={href}
      className={`group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent ${hoverBorderClass} overflow-hidden`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${overlayClass} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      <div className="relative z-10">
        <div className={`w-14 h-14 rounded-xl ${iconBgClass} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <h3 className="text-lg font-heading font-bold text-gray-900 mb-2 group-hover:text-furgocasa-blue transition-colors">
          {title}
        </h3>
        <p className="text-sm text-gray-600 mb-3">
          {description}
        </p>
        <span className="inline-flex items-center gap-1 text-furgocasa-orange font-semibold text-sm group-hover:gap-2 transition-all">
          Explorar <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </Link>
  );
}

export default function NotFound() {
  // Registrar el error 404 en Google Analytics
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      const url = window.location.href;
      const path = window.location.pathname;
      const search = window.location.search;
      const referrer = document.referrer;

      console.log('[Analytics] Registrando error 404:', path);

      // Enviar evento personalizado de 404
      (window as any).gtag('event', 'page_not_found', {
        page_location: url,
        page_path: path,
        page_search: search,
        page_referrer: referrer,
        event_category: 'Error',
        event_label: '404 - Page Not Found',
        non_interaction: false
      });

      // También enviar como excepción para tener doble tracking
      (window as any).gtag('event', 'exception', {
        description: `404: ${path}${search}`,
        fatal: false,
        page_location: url
      });
    }
  }, []);

  const quickLinks: Array<{
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    variant: "blue" | "orange";
  }> = [
    {
      href: "/es",
      icon: Home,
      title: "Ir al Inicio",
      description: "Vuelve a nuestra página principal",
      variant: "blue"
    },
    {
      href: "/es/vehiculos",
      icon: Car,
      title: "Ver Vehículos",
      description: "Descubre nuestra flota de campers",
      variant: "orange"
    },
    {
      href: "/es/alquiler-autocaravanas-campervans-murcia",
      icon: MapPin,
      title: "Alquiler en Murcia",
      description: "Reserva tu camper desde Murcia",
      variant: "blue"
    },
    {
      href: "/es/tarifas",
      icon: Calendar,
      title: "Tarifas",
      description: "Consulta nuestros precios",
      variant: "orange"
    },
    {
      href: "/es/blog",
      icon: BookOpen,
      title: "Blog de Viajes",
      description: "Inspírate con nuestras rutas",
      variant: "blue"
    },
    {
      href: "/es/contacto",
      icon: Phone,
      title: "Contacto",
      description: "Estamos aquí para ayudarte",
      variant: "orange"
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100">
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          {/* Número 404 Decorativo */}
          <div className="relative mb-6">
            <h1 className="text-[10rem] md:text-[14rem] font-heading font-black text-transparent bg-clip-text bg-gradient-to-br from-furgocasa-blue via-furgocasa-blue-dark to-gray-300 leading-none select-none opacity-20">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <AnimatedVan />
            </div>
          </div>
          
          {/* Mensaje Principal */}
          <div className="space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-gray-900">
              ¡Ups! Parece que te has perdido
            </h2>
            <p className="text-xl md:text-2xl text-furgocasa-orange font-medium">
              en el camino... 🗺️
            </p>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              No te preocupes, hasta los mejores exploradores toman rutas equivocadas a veces. 
              La página que buscas ya no existe o ha cambiado de dirección.
            </p>
          </div>

          {/* Mensaje Amigable */}
          <div className="bg-gradient-to-r from-furgocasa-blue/5 via-furgocasa-orange/5 to-furgocasa-blue/5 rounded-3xl p-8 mb-16 border border-gray-200">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Compass className="w-8 h-8 text-furgocasa-blue animate-spin-slow" />
              <Mountain className="w-8 h-8 text-furgocasa-orange" />
            </div>
            <p className="text-lg text-gray-700 font-medium mb-2">
              ¡Pero la aventura continúa!
            </p>
            <p className="text-gray-600">
              Aprovecha para descubrir nuestras increíbles campers y planifica tu próximo viaje
            </p>
          </div>

          {/* Botones Principales */}
          <div className="flex flex-wrap gap-4 justify-center mb-16">
            <Link
              href="/es"
              className="inline-flex items-center gap-3 bg-furgocasa-blue text-white font-bold px-8 py-4 rounded-xl hover:bg-furgocasa-blue-dark transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 duration-300 text-lg"
            >
              <Home className="w-5 h-5" />
              Volver al Inicio
            </Link>
            <Link
              href="/es/vehiculos"
              className="inline-flex items-center gap-3 bg-furgocasa-orange text-white font-bold px-8 py-4 rounded-xl hover:bg-furgocasa-orange-dark transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 duration-300 text-lg"
            >
              <Car className="w-5 h-5" />
              Ver Campers
            </Link>
          </div>
        </div>
      </section>

      {/* Sección de Enlaces Rápidos */}
      <section className="pb-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-heading font-bold text-gray-900 mb-3">
              ¿Qué te gustaría explorar?
            </h3>
            <p className="text-gray-600">
              Aquí tienes algunas sugerencias para continuar tu aventura
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickLinks.map((link, index) => (
              <QuickLinkCard key={index} {...link} />
            ))}
          </div>
        </div>
      </section>

      {/* Buscador Sugerido */}
      <section className="pb-24 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-gradient-to-br from-furgocasa-blue to-furgocasa-blue-dark rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl">
            <Search className="w-12 h-12 mx-auto mb-6 opacity-80" />
            <h3 className="text-2xl md:text-3xl font-heading font-bold mb-4">
              ¿Buscabas algo específico?
            </h3>
            <p className="text-blue-100 mb-8">
              Si tienes alguna duda o necesitas ayuda para encontrar lo que buscas, 
              nuestro equipo está encantado de asistirte.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/es/contacto"
                className="inline-flex items-center justify-center gap-2 bg-white text-furgocasa-blue font-bold px-6 py-3 rounded-xl hover:bg-gray-100 transition-all"
              >
                <Phone className="w-5 h-5" />
                Contactar
              </Link>
              <a
                href="https://wa.me/34673414053"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-green-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-green-600 transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
