"use client";

import { SearchWidget } from "@/components/booking/search-widget";
import { DestinationsGrid } from "@/components/destinations-grid";
import { BlogArticleLink } from "@/components/blog/blog-article-link";
import { LocalizedLink } from "@/components/localized-link";
import {
  MessageSquare,
  Map,
  Bot,
  CheckCircle,
  Calendar,
  Users,
  Shield,
  Package,
  BookOpen,
  HelpCircle,
  Zap,
  Plane,
  Briefcase,
  Sparkles,
} from "lucide-react";
import { ExtrasSection } from "@/components/pricing/extras-section";
import { HeroScrollIndicator } from "@/components/hero-scroll-indicator";
import Image from "next/image";
import type { Locale } from "@/lib/i18n/config";
import { useLanguage } from "@/contexts/language-context";

interface Vehicle {
  id: string;
  name: string;
  brand: string;
  model: string;
  slug: string;
  main_image: string | null;
}

interface BlogArticle {
  id: string;
  title: string;
  excerpt: string | null;
  slug: string;
  featured_image: string | null;
  published_at: string | null;
  category?: { slug: string; name: string } | null;
}

interface Stats {
  yearsExperience: number;
  totalBookings: number;
  totalVehicles: number;
  averageRating: string;
}

interface Props {
  locale: Locale;
  heroTitle: string;
  heroSubtitle: string;
  deliveryText: string;
  vehicles: Vehicle[];
  blogArticles: BlogArticle[];
  stats: Stats;
}

export function MotorhomeRentalMadridLanding({
  locale,
  heroTitle,
  heroSubtitle,
  deliveryText,
  vehicles,
  blogArticles,
  stats,
}: Props) {
  const { t, language } = useLanguage();
  const dateLocale = language === "es" ? "es-ES" : language === "en" ? "en-US" : language === "fr" ? "fr-FR" : "de-DE";

  return (
    <>
      <section className="relative h-screen min-h-[600px] flex items-center justify-center">
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <Image
            src="/images/slides/hero-11.webp"
            alt="Furgocasa - Motorhome rental Madrid"
            fill
            priority
            sizes="100vw"
            className="object-cover"
            quality={80}
          />
          {/* Overlay corporativo controlado */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-furgocasa-blue/40 to-furgocasa-blue-dark/70 pointer-events-none" />
        </div>

        <div className="relative z-10 w-full text-center">
          <div className="w-full px-4 md:px-[25%] space-y-3 pt-16 md:pt-0">
            {/* Kicker corporativo sobre el H1 */}
            <span className="inline-flex items-center gap-2 bg-furgocasa-orange/90 text-white px-4 py-2 rounded-full text-xs lg:text-sm font-bold tracking-wider uppercase shadow-orange mb-2">
              <Plane className="h-4 w-4" />
              Madrid-Barajas · Desde 95€/día
            </span>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-black text-white tracking-wide uppercase mb-4" style={{ textShadow: "3px 3px 12px rgba(0,0,0,0.9)", letterSpacing: "0.08em" }}>
              {heroTitle}
            </h1>

            <div className="w-24 h-1 bg-white/40 mx-auto mb-3"></div>

            <p className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-white/95 leading-tight bg-black/30 inline-block px-6 py-2 rounded-full" style={{ textShadow: "2px 2px 8px rgba(0,0,0,0.8)", marginBottom: "0.5rem" }}>
              A 10 minutos de la Terminal T4
            </p>

            <div className="flex items-center justify-center gap-1 mt-4" style={{ marginBottom: "0.5rem" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className="text-yellow-400 text-3xl md:text-4xl">★</span>
              ))}
            </div>

            <p className="text-xl md:text-2xl lg:text-3xl font-heading font-light text-furgocasa-orange leading-tight mb-6" style={{ textShadow: "2px 2px 8px rgba(0,0,0,0.8)" }}>
              Ideal para viajeros internacionales
            </p>

            <p className="text-sm md:text-base lg:text-lg text-white/85 font-bold leading-relaxed max-w-3xl mx-auto tracking-wide" style={{ textShadow: "1px 1px 4px rgba(0,0,0,0.8)" }}>
              {heroSubtitle}
            </p>
          </div>

          {/* SearchWidget flotante tipo "lift" sobre el slider */}
          <div className="w-full px-4 md:px-[25%] mt-10">
            <div className="rounded-2xl lg:rounded-3xl ring-1 ring-white/40 shadow-corp-lg">
              <SearchWidget />
            </div>
          </div>
        </div>

        {/* Indicador de scroll animado */}
        <HeroScrollIndicator href="#landing-intro" label="Descubre más" />
      </section>

      {/* BENEFICIOS VIAJEROS INTERNACIONALES */}
      <section id="landing-intro" className="py-12 lg:py-16 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-furgocasa-blue mb-4">
              Aterriza y empieza tu viaje por Europa
            </h2>
            <p className="text-lg text-gray-600">
              Nuestra sede en Valdebebas está diseñada para facilitar la logística a viajeros que llegan desde América Latina y el resto del mundo al Aeropuerto de Madrid-Barajas.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
            <div className="bg-gray-50 p-6 rounded-2xl text-center hover:shadow-lg transition-shadow">
              <Plane className="w-12 h-12 text-furgocasa-orange mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">A 10 min del Aeropuerto</h3>
              <p className="text-sm text-gray-600">Llega en Uber o taxi desde cualquier terminal de Barajas (T1, T2, T3, T4) en minutos.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-2xl text-center hover:shadow-lg transition-shadow">
              <Package className="w-12 h-12 text-furgocasa-orange mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Todo incluido</h3>
              <p className="text-sm text-gray-600">Ropa de cama, toallas y menaje de cocina completos. Viaja ligero desde tu país.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-2xl text-center hover:shadow-lg transition-shadow">
              <Shield className="w-12 h-12 text-furgocasa-orange mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Seguro internacional</h3>
              <p className="text-sm text-gray-600">Cobertura total para cruzar fronteras y recorrer toda Europa con total tranquilidad.</p>
            </div>
          </div>

          {/* Sección: Qué es un Motorhome - VOCABULARIO LATAM */}
          <div className="text-center mb-8 lg:mb-12 max-w-5xl mx-auto pt-8 border-t border-gray-200">
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-furgocasa-blue mb-6 uppercase tracking-wide">
              ALQUILER MOTORHOME EN MADRID
            </h2>
            <p className="text-xl text-gray-600 mb-4">
              (Casas Rodantes en España)
            </p>

            <div className="grid md:grid-cols-2 gap-8 mt-10 text-left max-w-4xl mx-auto">
              <div className="bg-gray-50 rounded-2xl p-8">
                <h3 className="text-xl lg:text-2xl font-heading font-bold text-furgocasa-orange mb-4 tracking-wide">
                  ¿Qué es un Motorhome?
                </h3>
                <p className="text-base lg:text-lg text-gray-700 leading-relaxed mb-4">
                  <strong>Motorhome</strong>, <strong>autocaravana</strong> y <strong>camper</strong> son 
                  términos que se refieren al mismo tipo de vehículo: una furgoneta camper 
                  totalmente equipada para viajar con autonomía total.
                </p>
                <p className="text-base lg:text-lg text-gray-700 leading-relaxed">
                  En Latinoamérica también se conocen como <strong>casas rodantes</strong> o 
                  <strong> casas móviles</strong>. En Furgocasa, nos especializamos en el alquiler 
                  de estos vehículos de gran volumen.
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-2xl p-8">
                <h3 className="text-xl lg:text-2xl font-heading font-bold text-furgocasa-blue mb-4 tracking-wide">
                  ¿Cómo se llama en tu país?
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-center gap-3 text-lg">
                    <span className="text-2xl">🇪🇸</span>
                    <span><strong>España:</strong> Autocaravana, Camper</span>
                  </li>
                  <li className="flex items-center gap-3 text-lg">
                    <span className="text-2xl">🌎</span>
                    <span><strong>LATAM:</strong> Casa Rodante, Motorhome</span>
                  </li>
                  <li className="flex items-center gap-3 text-lg">
                    <span className="text-2xl">🇺🇸</span>
                    <span><strong>USA:</strong> RV, Campervan</span>
                  </li>
                  <li className="flex items-center gap-3 text-lg">
                    <span className="text-2xl">🇬🇧</span>
                    <span><strong>UK:</strong> Motorhome, Campervan</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección: Descuento LATAM */}
      <section className="py-12 lg:py-16 bg-gradient-to-r from-furgocasa-orange to-orange-600">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl lg:text-5xl font-heading font-bold mb-4">
              🌎 Descuento Especial LATAM: -15% 🌎
            </h2>
            <p className="text-xl lg:text-2xl mb-6">
              ¿Vienes desde Latinoamérica a Madrid?
            </p>
            <p className="text-lg mb-4 text-orange-100">
              Si viajas desde <strong>Argentina, México, Chile, Colombia, Perú, Venezuela, Uruguay, Ecuador</strong> 
              {' '}o cualquier país de América Latina, tienes un <strong>descuento del -15%</strong> en alquileres de mínimo 2 semanas.
            </p>
            
            {/* Ejemplos de ahorro */}
            <div className="grid md:grid-cols-2 gap-4 mb-8 max-w-2xl mx-auto">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
                <p className="font-bold text-xl mb-1">21 días (3 semanas)</p>
                <p className="text-orange-100">Ahorras hasta <strong className="text-white text-2xl">285€</strong></p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
                <p className="font-bold text-xl mb-1">14 días (2 semanas)</p>
                <p className="text-orange-100">Ahorras hasta <strong className="text-white text-2xl">210€</strong></p>
              </div>
            </div>
            
            {/* Países */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {['🇦🇷 Argentina', '🇲🇽 México', '🇨🇱 Chile', '🇨🇴 Colombia', '🇵🇪 Perú', '🇻🇪 Venezuela', '🇺🇾 Uruguay', '🇪🇨 Ecuador'].map((pais) => (
                <span key={pais} className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                  {pais}
                </span>
              ))}
            </div>
            
            {/* Botones - Artículo primero, WhatsApp segundo */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <LocalizedLink
                href="/blog/noticias/visitas-espana-o-la-ue-desde-america-latina-alquila-tu-mortohome-con-un-15-de-descuento"
                className="inline-flex items-center gap-2 bg-white text-furgocasa-orange font-bold px-8 py-4 rounded-xl hover:bg-orange-50 transition-all shadow-lg text-lg"
              >
                📋 Ver condiciones del descuento
              </LocalizedLink>
              
              <a
                href="https://wa.me/34673414053?text=Hola!%20Llego%20a%20Madrid%20desde%20[TU%20PAÍS]%20y%20quiero%20consultar%20sobre%20el%20descuento%20-15%25%20LATAM"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-green-700 transition-all shadow-lg text-lg"
              >
                <Phone className="h-5 w-5" />
                Consulta por WhatsApp
              </a>
            </div>
            
            {/* Nota pequeña */}
            <p className="text-sm text-orange-100 mt-6 max-w-2xl mx-auto">
              * Válido para alquileres de mínimo 2 semanas en Temporada Baja y Media (septiembre-junio). 
              Debes acreditar tu viaje desde Latinoamérica con billetes de avión.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 lg:mb-12 max-w-5xl mx-auto">
            <h2 className="text-3xl lg:text-5xl font-heading font-bold text-furgocasa-blue mb-6 lg:mb-8 uppercase tracking-wide">
              {t("LAS MEJORES CAMPER VANS EN ALQUILER")}
            </h2>

            <div className="text-center max-w-3xl mx-auto">
              <h3 className="text-xl lg:text-2xl font-heading font-bold text-furgocasa-orange mb-4 tracking-wide uppercase">
                {t("Flota de vehículos de máxima calidad")}
              </h3>
              <p className="text-base lg:text-lg text-gray-700 leading-relaxed mb-3">
                <strong>{t("FURGOCASA:")}</strong> {t("estamos especializados en el alquiler de vehículos campers van de gran volumen.")}
              </p>
              <p className="text-base lg:text-lg text-gray-700 leading-relaxed">
                {t("Contamos con los mejores modelos de furgonetas campers del mercado.")} {deliveryText}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <LocalizedLink href={`/vehiculos/${vehicle.slug}`} className="block">
                  <div className="h-56 lg:h-64 bg-gray-200 relative overflow-hidden">
                    {vehicle.main_image ? (
                      <Image src={vehicle.main_image} alt={vehicle.name} fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" quality={70} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-300">
                        <Package className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </LocalizedLink>

                <div className="p-6 lg:p-8 text-center">
                  <LocalizedLink href={`/vehiculos/${vehicle.slug}`}>
                    <h4 className="text-xl lg:text-2xl font-heading font-bold text-gray-900 mb-2 group-hover:text-furgocasa-blue transition-colors">{vehicle.name}</h4>
                    <p className="text-sm text-gray-600 mb-4">{vehicle.brand} {vehicle.model}</p>
                  </LocalizedLink>
                  <LocalizedLink href="/vehiculos" className="inline-flex items-center gap-2 text-furgocasa-orange font-bold uppercase tracking-wider hover:text-furgocasa-orange-dark transition-colors text-sm">
                    {t("Ver más campers")} <span className="text-xl">→</span>
                  </LocalizedLink>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <span className="inline-block px-4 py-2 bg-furgocasa-orange/10 text-furgocasa-orange rounded-full text-xs lg:text-sm font-bold tracking-wider uppercase mb-4">
              {t("LA MEJOR RELACIÓN CALIDAD PRECIO")}
            </span>
            <h2 className="text-3xl lg:text-5xl font-heading font-black text-furgocasa-blue uppercase tracking-wide mb-4">
              {t("Nuestras autocaravanas Camper en alquiler desde")}
            </h2>
            <p className="text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
              {t("PAGA el 50% al realizar la RESERVA y la mitad restante 15 días antes del comienzo del alquiler.")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto mb-12 lg:mb-16">
            {[
              { seasonKey: "TEMPORADA BAJA", price: "95", color: "text-furgocasa-blue", border: "border-furgocasa-blue" },
              { seasonKey: "Temporada Media", price: "125", color: "text-furgocasa-orange", border: "border-furgocasa-orange" },
              { seasonKey: "Temporada Alta", price: "155", color: "text-red-500", border: "border-red-500" },
            ].map((pricing, index) => (
              <div key={index} className={`bg-white rounded-2xl shadow-xl p-8 lg:p-10 text-center border-t-8 ${pricing.border} transform hover:scale-105 transition-transform duration-300`}>
                <h3 className="text-base lg:text-lg font-heading font-bold text-gray-500 mb-4 lg:mb-6 uppercase tracking-wider">{t(pricing.seasonKey)}</h3>
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className={`text-5xl lg:text-6xl font-heading font-bold ${pricing.color}`}>{pricing.price}€</span>
                  <span className="text-lg lg:text-xl text-gray-400 font-medium">{t("/ día")}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center max-w-3xl mx-auto bg-gray-50 p-6 lg:p-8 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-lg lg:text-xl font-medium text-gray-700">
              {t("Descuentos de hasta el")} <span className="text-furgocasa-orange font-bold text-xl lg:text-2xl mx-1">-10%, -20% y -30%</span> {t("en alquileres de 1, 2 o 3 semanas")}.
            </p>
          </div>

          <div className="text-center mt-12">
            <LocalizedLink href="/tarifas" className="inline-flex items-center gap-2 text-furgocasa-blue font-bold uppercase tracking-wider hover:text-furgocasa-blue-dark transition-colors">
              {t("Ver todas las tarifas")} <span className="text-xl">→</span>
            </LocalizedLink>
          </div>
        </div>
      </section>

      <ExtrasSection backgroundColor="bg-white" />

      <section className="py-12 lg:py-16 bg-gradient-to-br from-red-500 via-orange-500 to-furgocasa-orange relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzQuNDE4IDAgOC0zLjU4MiA4LThzLTMuNTgyLTgtOC04LTggMy41ODItOCA4IDMuNTgyIDggOCA4em0wIDRjLTQuNDE4IDAtOCAzLjU4Mi04IDhzMy41ODIgOCA4IDggOC0zLjU4MiA4LTgtMy41ODItOC04LTh6bTAgMjhjLTQuNDE4IDAtOCAzLjU4Mi04IDhzMy41ODIgOCA4IDggOC0zLjU4MiA4LTgtMy41ODItOC04LTh6TTEyIDZjNC40MTggMCA4LTMuNTgyIDgtOHMtMy41ODItOC04LTgtOCAzLjU4Mi04IDggMy41ODIgOCA4IDh6bTAgNDBjNC40MTggMCA4LTMuNTgyIDgtOHMtMy41ODItOC04LTgtOCAzLjU4Mi04IDggMy41ODIgOCA4IDh6bTQ4IDRjNC40MTggMCA4LTMuNTgyIDgtOHMtMy41ODItOC04LTgtOCAzLjU4Mi04IDggMy41ODIgOCA4IDh6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center justify-center gap-2 mb-6 animate-bounce">
              <Zap className="h-12 w-12 lg:h-16 lg:w-16 text-yellow-300 fill-yellow-300" />
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-6xl font-heading font-black text-white mb-4 lg:mb-6 uppercase tracking-wider" style={{ textShadow: "2px 2px 8px rgba(0,0,0,0.3)" }}>
              {t("¡Ofertas de Última Hora!")}
            </h2>
            <p className="text-lg md:text-xl lg:text-2xl text-white/95 mb-6 lg:mb-8 font-medium leading-relaxed max-w-3xl mx-auto" style={{ textShadow: "1px 1px 4px rgba(0,0,0,0.2)" }}>
              {t("Aprovecha nuestras ofertas especiales con descuentos de hasta el 40% en fechas seleccionadas")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <LocalizedLink href="/ofertas" className="group inline-flex items-center gap-3 bg-white text-furgocasa-orange font-bold px-8 lg:px-10 py-4 lg:py-5 rounded-2xl hover:bg-gray-50 transition-all shadow-2xl text-lg lg:text-xl uppercase tracking-wider transform hover:scale-105 duration-300">
                <Zap className="h-6 w-6 group-hover:animate-pulse" />
                {t("Ver Ofertas Ahora")}
                <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
              </LocalizedLink>
              <span className="text-white/90 text-sm lg:text-base font-medium uppercase tracking-wide">{t("¡Plazas limitadas!")}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Map className="h-8 w-8 text-furgocasa-blue" />
              <h2 className="text-3xl lg:text-5xl font-heading font-black text-furgocasa-blue uppercase tracking-wide">{t("Principales destinos para visitar en Campervan")}</h2>
            </div>
            <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">{t("Descubre los mejores destinos para tu próxima aventura en autocaravana")}</p>
          </div>
          <DestinationsGrid />
        </div>
      </section>

      <section className="py-12 lg:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-5xl font-heading font-black text-furgocasa-blue uppercase tracking-wide mb-4">{t("Servicios que te hacen la vida más fácil")}</h2>
            <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">{t("Todo lo que necesitas para disfrutar de tu experiencia camper")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto">
            {[
              { icon: Bot, titleKey: "Inteligencia Artificial", descKey: "Planifica tu ruta perfecta con IA", link: "/inteligencia-artificial", borderColor: "border-furgocasa-blue", iconBg: "bg-furgocasa-blue" },
              { icon: Map, titleKey: "Mapa de áreas", descKey: "Encuentra áreas de autocaravanas", link: "/mapa-areas", borderColor: "border-furgocasa-orange", iconBg: "bg-furgocasa-orange" },
              { icon: Calendar, titleKey: "Parking MURCIA", descKey: "Guarda tu camper con seguridad", link: "/aparcamiento-autocaravanas-campers-murcia", borderColor: "border-furgocasa-blue", iconBg: "bg-furgocasa-blue" },
              { icon: HelpCircle, titleKey: "FAQs", descKey: "Resuelve todas tus dudas", link: "/faqs", borderColor: "border-furgocasa-orange", iconBg: "bg-furgocasa-orange" },
            ].map((service, index) => (
              <LocalizedLink key={index} href={service.link} className={`bg-white p-6 lg:p-7 rounded-2xl shadow-corp hover:shadow-corp-lg border-t-4 ${service.borderColor} transition-all duration-300 transform hover:-translate-y-1 group`}>
                <div className={`w-14 h-14 rounded-xl ${service.iconBg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <service.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-lg font-heading font-bold text-furgocasa-blue mb-2 uppercase tracking-wide">{t(service.titleKey)}</h3>
                <p className="text-sm text-gray-600">{t(service.descKey)}</p>
              </LocalizedLink>
            ))}
          </div>
        </div>
      </section>

      {blogArticles.length > 0 && (
        <section className="py-12 lg:py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 lg:mb-16">
              <div className="flex items-center justify-center gap-3 mb-4">
                <BookOpen className="h-8 w-8 text-furgocasa-blue" />
                <h2 className="text-3xl lg:text-5xl font-heading font-black text-furgocasa-blue uppercase tracking-wide">{t("Blog de viajes en camper")}</h2>
              </div>
              <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">{t("Consejos, rutas y experiencias para inspirar tu próxima aventura")}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
              {blogArticles.map((article) => (
                <BlogArticleLink key={article.id} categorySlug={article.category?.slug} slug={article.slug} className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="h-48 lg:h-56 bg-gray-200 relative overflow-hidden">
                    {article.featured_image ? (
                      <Image src={article.featured_image} alt={article.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-furgocasa-blue to-blue-600">
                        <BookOpen className="h-16 w-16 text-white/50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    {article.category && (
                      <div className="absolute top-4 left-4">
                        <span className="bg-furgocasa-orange text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{article.category.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg lg:text-xl font-heading font-bold text-gray-900 mb-3 group-hover:text-furgocasa-blue transition-colors line-clamp-2">{article.title}</h3>
                    {article.excerpt && <p className="text-gray-600 text-sm mb-4 line-clamp-3">{article.excerpt}</p>}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      {article.published_at && <time dateTime={article.published_at}>{new Date(article.published_at).toLocaleDateString(dateLocale)}</time>}
                      <span className="text-furgocasa-orange font-semibold group-hover:translate-x-1 transition-transform">{t("Leer más")} →</span>
                    </div>
                  </div>
                </BlogArticleLink>
              ))}
            </div>
            <div className="text-center mt-12">
              <LocalizedLink href="/blog" className="inline-flex items-center gap-2 bg-furgocasa-blue text-white px-8 py-4 rounded-xl font-bold uppercase tracking-wider hover:bg-furgocasa-blue-dark transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 duration-300">
                <BookOpen className="h-5 w-5" />
                {t("Ver más artículos")}
              </LocalizedLink>
            </div>
          </div>
        </section>
      )}

      <section className="py-12 lg:py-16 bg-gradient-to-br from-furgocasa-blue via-furgocasa-blue-dark to-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-5xl font-heading font-black uppercase tracking-wide mb-4">{t("¿Por qué alquilar con Furgocasa?")}</h2>
            <p className="text-lg lg:text-xl text-blue-100 max-w-3xl mx-auto">{t("La tranquilidad de viajar con los mejores")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {[
              { icon: CheckCircle, titleKey: "Kilómetros Ilimitados", descKey: "Viaja sin límites por España y Europa" },
              { icon: Users, titleKey: "Atención Personalizada", descKey: "Soporte por WhatsApp en tu idioma" },
              { icon: Shield, titleKey: "Flota Premium", descKey: "Vehículos modernos y perfectamente equipados" },
              { icon: Package, titleKey: "Todo Incluido", descKey: "Cocina completa, ropa de cama, toallas y kit de camping" },
              { icon: Calendar, titleKey: "Cancelación flexible", descKey: "Cancela hasta 60 días antes sin coste" },
              { icon: MessageSquare, titleKey: "Atención 24/7", descKey: "Te acompañamos durante todo el viaje" },
            ].map((benefit, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300">
                <benefit.icon className="h-12 w-12 text-furgocasa-orange mb-4" />
                <h3 className="text-lg font-heading font-bold mb-2">{t(benefit.titleKey)}</h3>
                <p className="text-sm text-blue-100">{t(benefit.descKey)}</p>
              </div>
            ))}
          </div>
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto text-center">
            <div>
              <p className="text-4xl md:text-5xl font-heading font-bold mb-2">{stats.yearsExperience}+</p>
              <p className="text-blue-200 uppercase tracking-wider text-sm">{t("Años de experiencia")}</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-heading font-bold mb-2">{stats.totalBookings}+</p>
              <p className="text-blue-200 uppercase tracking-wider text-sm">{t("Viajes realizados")}</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-heading font-bold mb-2">{stats.totalVehicles}</p>
              <p className="text-blue-200 uppercase tracking-wider text-sm">{t("Vehículos Premium")}</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-heading font-bold mb-2">{stats.averageRating}</p>
              <p className="text-blue-200 uppercase tracking-wider text-sm">{t("Valoración Media")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-5xl font-heading font-black text-furgocasa-blue uppercase tracking-wide mb-6">{t("¿Listo para tu próxima aventura?")}</h2>
          <p className="text-lg lg:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">{t("Reserva tu camper ahora y comienza a planear tu viaje inolvidable")}</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <LocalizedLink href="/reservar" className="inline-flex items-center gap-2 bg-furgocasa-orange text-white font-bold px-8 py-4 rounded-xl hover:bg-furgocasa-orange-dark transition-all shadow-lg text-lg">
              {t("Reservar ahora")}
            </LocalizedLink>
            <a
              href="https://wa.me/34673414053?text=Hola!%20Llego%20al%20aeropuerto%20de%20Madrid%20desde%20LATAM%20y%20quiero%20alquilar%20un%20motorhome"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 text-white border-2 border-green-600 font-bold px-8 py-4 rounded-xl hover:bg-green-700 transition-all shadow-lg text-lg"
            >
              <Phone className="h-5 w-5" />
              Consulta por WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
