import { Metadata } from "next";
import {
  Map, Route, Shield, Globe,
  QrCode, Bell, Phone, FileText, Brain, TrendingUp, MessageCircle, Lock, Zap,
  Camera, Calendar, DollarSign, BarChart3, CheckCircle, Cloud, Star,
  Sparkles, ExternalLink
} from "lucide-react";
import { translateServer } from "@/lib/i18n/server-translation";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import type { Locale } from "@/lib/i18n/config";
import Image from "next/image";
import { LocalizedLink } from "@/components/localized-link";

interface PageProps {}

const MAPA_AREAS_METADATA: Metadata = {
  title: "Mapa Furgocasa - Áreas Autocaravanas + IA | +1000 Ubicaciones | Furgocasa",
  description: "Tu plataforma completa para gestionar tu autocaravana con IA. +1000 áreas verificadas, rutas inteligentes, valoración con GPT-4 y protección 24/7 con sistema QR.",
  keywords: "mapa autocaravanas, áreas autocaravanas, pernocta autocaravanas, valoración autocaravana IA, GPT-4, sistema QR autocaravana, rutas autocaravanas",
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale: Locale = 'es';
  const alternates = buildCanonicalAlternates('/mapa-areas', locale);

  return {
    ...MAPA_AREAS_METADATA,
    alternates,
    openGraph: {
      ...MAPA_AREAS_METADATA,
      url: alternates.canonical,
      images: [
        {
          url: "https://www.furgocasa.com/images/slides/hero-05.webp",
          width: 1200,
          height: 630,
          alt: "Mapa Furgocasa - Áreas Autocaravanas con IA",
        },
      ],
    },
  };
}

export default async function LocaleMapaAreasPage({ params }: PageProps) {
  const locale: Locale = 'es';
  const t = (key: string) => translateServer(key, locale);

  return (
    <main className="bg-white font-amiko">
      {/* ============ HERO ============ */}
      <section className="relative h-[85vh] min-h-[560px] flex items-center justify-center">
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <Image
            src="/images/slides/hero-14.webp"
            alt="Mapa de áreas para autocaravanas - Furgocasa"
            fill
            priority
            sizes="100vw"
            className="object-cover"
            quality={80}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-furgocasa-blue/70 via-furgocasa-blue/60 to-furgocasa-blue-dark/85" />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-5xl mx-auto space-y-4 pt-16 lg:pt-0">
            <span className="inline-flex items-center gap-2 bg-furgocasa-orange/90 text-white px-4 py-2 rounded-full text-xs lg:text-sm font-bold tracking-wider uppercase shadow-lg">
              <Sparkles className="h-4 w-4" />
              Ahora con Inteligencia Artificial GPT-4
            </span>

            <h1
              className="text-4xl md:text-6xl lg:text-7xl font-heading font-black text-white tracking-wide uppercase"
              style={{ textShadow: '3px 3px 12px rgba(0,0,0,0.9)', letterSpacing: '0.08em' }}
            >
              Mapa Furgocasa
            </h1>

            <div className="w-24 h-1 bg-white/40 mx-auto" />

            <p
              className="text-2xl md:text-3xl lg:text-4xl font-heading font-light text-white/95 leading-tight"
              style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}
            >
              Mucho más que una app de áreas de autocaravanas
            </p>

            <p
              className="text-base md:text-lg text-white/90 font-light leading-relaxed max-w-3xl mx-auto tracking-wide"
              style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.8)' }}
            >
              Tu plataforma completa para gestionar tu autocaravana con IA. Valoraciones automáticas, rutas inteligentes y protección 24/7.
            </p>

            {/* Estadísticas */}
            <div className="grid grid-cols-3 gap-3 md:gap-4 max-w-2xl mx-auto pt-6">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <p className="text-2xl md:text-3xl font-heading font-bold text-white">+1000</p>
                <p className="text-xs md:text-sm text-white/80 uppercase tracking-wider">Áreas Verificadas</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <p className="text-2xl md:text-3xl font-heading font-bold text-white">100%</p>
                <p className="text-xs md:text-sm text-white/80 uppercase tracking-wider">Gratis Siempre</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <p className="text-2xl md:text-3xl font-heading font-bold text-white">24/7</p>
                <p className="text-xs md:text-sm text-white/80 uppercase tracking-wider">Actualizado</p>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <a
                href="https://www.mapafurgocasa.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-furgocasa-orange hover:bg-furgocasa-orange-dark text-white font-bold py-4 px-8 rounded-xl transition-all hover:scale-105 shadow-2xl text-base lg:text-lg uppercase tracking-wider"
              >
                <Map className="h-5 w-5" />
                Empezar Gratis
                <ExternalLink className="h-4 w-4" />
              </a>
              <a
                href="https://www.mapafurgocasa.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold py-4 px-8 rounded-xl transition-colors border-2 border-white/40 text-base lg:text-lg uppercase tracking-wider"
              >
                Ver Mapa de Áreas
                <span className="text-xl">→</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============ BLOQUE RESPUESTA BREVE ============ */}
      <section className="py-8 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-base md:text-lg text-gray-700 leading-relaxed">
              <strong>¿Qué es Mapa Furgocasa?</strong> Una plataforma gratuita con <strong>+1000 áreas verificadas</strong> de autocaravanas en España, Portugal, Francia, Andorra y más países. Incluye <strong>planificador de rutas</strong>, <strong>valoración de tu camper con IA (GPT-4)</strong>, <strong>sistema QR anti daños 24/7</strong> y <strong>gestión completa de mantenimientos</strong>. Una empresa de Furgocasa.
            </p>
          </div>
        </div>
      </section>

      {/* ============ FEATURES PRINCIPALES ============ */}
      <section className="py-12 lg:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 lg:mb-14 max-w-4xl mx-auto">
            <span className="inline-block px-4 py-2 bg-furgocasa-orange/10 text-furgocasa-orange rounded-full text-xs lg:text-sm font-bold tracking-wider uppercase mb-4">
              Todo en una sola plataforma
            </span>
            <h2 className="text-3xl lg:text-5xl font-heading font-bold text-furgocasa-blue mb-4 uppercase tracking-wide">
              Gestiona tu autocaravana con tecnología puntera
            </h2>
            <p className="text-lg lg:text-xl text-gray-600">
              Todo lo que necesitas para disfrutar del mundo camper, en una única app.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto">
            {[
              {
                icon: Map,
                title: "+1000 Áreas Actualizadas",
                description: "Base de datos completa con áreas públicas, privadas, campings y parkings. Información verificada de servicios, precios y ubicaciones exactas.",
                borderColor: "border-furgocasa-blue",
                iconBg: "bg-furgocasa-blue",
              },
              {
                icon: Route,
                title: "Planificador de Rutas",
                description: "Crea rutas personalizadas y descubre automáticamente áreas de pernocta cercanas. Optimiza distancias y tiempos de viaje.",
                borderColor: "border-furgocasa-orange",
                iconBg: "bg-furgocasa-orange",
              },
              {
                icon: Globe,
                title: "Cobertura Internacional",
                description: "España, Portugal, Francia, Andorra, Argentina y más países. Expandimos constantemente nuestra red global de áreas.",
                borderColor: "border-furgocasa-blue",
                iconBg: "bg-furgocasa-blue",
              },
              {
                icon: Shield,
                title: "Protección 24/7",
                description: "Sistema QR inteligente para reportar incidentes y daños. Notificaciones instantáneas con ubicación GPS.",
                borderColor: "border-furgocasa-orange",
                iconBg: "bg-furgocasa-orange",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-t-4 ${feature.borderColor}`}
              >
                <div className={`w-14 h-14 rounded-xl ${feature.iconBg} flex items-center justify-center mb-5`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-lg lg:text-xl font-heading font-bold text-furgocasa-blue mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm lg:text-base">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ GESTIÓN CON IA (SECCIÓN OSCURA) ============ */}
      <section className="py-12 lg:py-16 bg-gradient-to-br from-furgocasa-blue via-furgocasa-blue-dark to-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 lg:mb-14 max-w-4xl mx-auto">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-furgocasa-orange/20 text-furgocasa-orange rounded-full text-xs lg:text-sm font-bold tracking-wider uppercase mb-4 border border-furgocasa-orange/30">
              <Brain className="h-4 w-4" />
              Powered by GPT-4
            </span>
            <h2 className="text-3xl lg:text-5xl font-heading font-bold mb-4 uppercase tracking-wide">
              Gestión Inteligente de tu Autocaravana
            </h2>
            <p className="text-lg lg:text-xl text-blue-100">
              Valoración automática con GPT-4 en segundos y comparación de precios de mercado en tiempo real.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6 max-w-6xl mx-auto">
            {[
              { icon: Brain, title: "Valoración IA", desc: "GPT-4 en segundos" },
              { icon: BarChart3, title: "Precios Mercado", desc: "Comparación real" },
              { icon: Calendar, title: "Mantenimientos", desc: "Historial completo" },
              { icon: DollarSign, title: "Control Gastos", desc: "ROI automático" },
              { icon: TrendingUp, title: "Histórico Valor", desc: "Evolución precio" },
              { icon: Camera, title: "Gestión Fotos", desc: "Galería completa" },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm p-5 lg:p-6 rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                <item.icon className="h-9 w-9 text-furgocasa-orange mb-3" />
                <h3 className="text-base lg:text-lg font-heading font-bold text-white mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-blue-100">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <a
              href="https://www.mapafurgocasa.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-white font-bold uppercase tracking-wider hover:text-furgocasa-orange transition-colors"
            >
              Conoce más sobre Valoración IA <span className="text-xl">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* ============ SISTEMA QR ============ */}
      <section className="py-12 lg:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <div>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-furgocasa-orange/10 text-furgocasa-orange rounded-full text-xs lg:text-sm font-bold tracking-wider uppercase mb-4">
                  <Shield className="h-4 w-4" />
                  Sistema anti daños
                </span>
                <h2 className="text-3xl lg:text-5xl font-heading font-bold text-furgocasa-blue mb-5 uppercase tracking-wide">
                  Sistema QR Inteligente: Protección 24/7
                </h2>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Código QR único para tu vehículo. Los testigos pueden reportar incidentes o daños escaneándolo. Recibe notificaciones instantáneas con fotos, GPS y datos.
                </p>

                <div className="space-y-5">
                  {[
                    { icon: Bell, title: "Alertas de accidentes", desc: "Con fotos y ubicación GPS" },
                    { icon: QrCode, title: "Notificación de daños", desc: "Si ven daños en tu vehículo" },
                    { icon: Phone, title: "Contacto de emergencia", desc: "Para autoridades y aseguradoras" },
                    { icon: FileText, title: "Historial completo", desc: "Todos los reportes guardados" },
                  ].map((feature, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="w-11 h-11 bg-furgocasa-blue rounded-lg flex items-center justify-center flex-shrink-0">
                        <feature.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-furgocasa-blue text-lg mb-1">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600">
                          {feature.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <a
                    href="https://www.mapafurgocasa.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-furgocasa-orange font-bold uppercase tracking-wider hover:text-furgocasa-orange-dark transition-colors"
                  >
                    Descubre el Sistema de Alertas <span className="text-xl">→</span>
                  </a>
                </div>
              </div>

              {/* Mockup QR */}
              <div className="relative">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 shadow-2xl border border-gray-200">
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="aspect-square bg-gradient-to-br from-furgocasa-blue/5 to-furgocasa-orange/5 rounded-xl flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 gap-2 p-4">
                        {Array.from({ length: 64 }).map((_, i) => (
                          <div
                            key={i}
                            className={`${(i * 7) % 3 === 0 ? 'bg-furgocasa-blue' : 'bg-transparent'} rounded-sm`}
                          />
                        ))}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white rounded-lg p-4 shadow-lg">
                          <QrCode className="h-16 w-16 text-furgocasa-orange" />
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <p className="font-heading font-bold text-furgocasa-blue text-lg">Código QR Protección</p>
                      <p className="text-sm text-gray-500">ID: ABC-12345-XYZ</p>
                    </div>
                  </div>

                  <div className="absolute -top-4 -right-4 bg-furgocasa-orange text-white font-bold px-6 py-3 rounded-full shadow-xl transform rotate-12 uppercase tracking-wider text-sm">
                    24/7
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TECNOLOGÍA IA ============ */}
      <section className="py-12 lg:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 lg:mb-14 max-w-4xl mx-auto">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-furgocasa-orange/10 text-furgocasa-orange rounded-full text-xs lg:text-sm font-bold tracking-wider uppercase mb-4">
              <Sparkles className="h-4 w-4" />
              Inteligencia Artificial
            </span>
            <h2 className="text-3xl lg:text-5xl font-heading font-bold text-furgocasa-blue mb-4 uppercase tracking-wide">
              Tecnología que entiende tu autocaravana
            </h2>
            <p className="text-lg lg:text-xl text-gray-600">
              GPT-4 analiza, valora y te asesora en tiempo real.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Brain,
                title: "Valoración Inteligente",
                description: "GPT-4 analiza marca, modelo, año, kilometraje y mercado para darte una valoración precisa en segundos con informe PDF profesional.",
                borderColor: "border-furgocasa-blue",
                iconBg: "bg-furgocasa-blue",
              },
              {
                icon: BarChart3,
                title: "Comparación de Mercado",
                description: "Comparamos con miles de anuncios reales de portales especializados para determinar el precio justo de tu vehículo.",
                borderColor: "border-furgocasa-orange",
                iconBg: "bg-furgocasa-orange",
              },
              {
                icon: MessageCircle,
                title: "Chatbot Experto",
                description: "Asistente IA disponible 24/7 para responder preguntas sobre áreas, rutas y recomendaciones personalizadas.",
                borderColor: "border-furgocasa-blue",
                iconBg: "bg-furgocasa-blue",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-t-4 ${feature.borderColor}`}
              >
                <div className={`w-14 h-14 rounded-xl ${feature.iconBg} flex items-center justify-center mb-5`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-heading font-bold text-furgocasa-blue mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 3 PASOS ============ */}
      <section className="py-12 lg:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 lg:mb-14 max-w-4xl mx-auto">
            <span className="inline-block px-4 py-2 bg-furgocasa-orange/10 text-furgocasa-orange rounded-full text-xs lg:text-sm font-bold tracking-wider uppercase mb-4">
              Empieza en 3 pasos
            </span>
            <h2 className="text-3xl lg:text-5xl font-heading font-bold text-furgocasa-blue mb-4 uppercase tracking-wide">
              Desde el registro a tu primera valoración IA
            </h2>
            <p className="text-lg lg:text-xl text-gray-600">
              En menos de 5 minutos tendrás tu camper bajo control total.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto">
            {[
              {
                step: "1",
                icon: CheckCircle,
                title: "Regístrate Gratis",
                description: "Crea tu cuenta en 30 segundos. Sin tarjeta de crédito. Acceso inmediato a todas las funciones.",
              },
              {
                step: "2",
                icon: Camera,
                title: "Registra tu Vehículo",
                description: "Añade marca, modelo, año y kilometraje. Sube fotos y obtén tu código QR de protección.",
              },
              {
                step: "3",
                icon: Brain,
                title: "Valoración IA Instantánea",
                description: "Clic en \"Valorar con IA\" y recibe un informe profesional en 30 segundos con precio real de mercado.",
              },
            ].map((item, index) => (
              <div key={index} className="relative text-center">
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-gray-300 to-transparent -z-10" />
                )}

                <div className="w-24 h-24 rounded-2xl bg-furgocasa-blue flex items-center justify-center mx-auto mb-5 shadow-xl">
                  <item.icon className="h-12 w-12 text-white" />
                </div>
                <div className="mb-3">
                  <span className="text-5xl font-heading font-black text-furgocasa-orange/20">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-xl font-heading font-bold text-furgocasa-blue mb-3 uppercase tracking-wide">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <a
              href="https://www.mapafurgocasa.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-furgocasa-orange hover:bg-furgocasa-orange-dark text-white font-bold py-4 px-8 rounded-xl transition-all hover:scale-105 shadow-xl text-base lg:text-lg uppercase tracking-wider"
            >
              Crear Cuenta Gratuita <span className="text-xl">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* ============ POR QUÉ CONFIAR (SECCIÓN OSCURA) ============ */}
      <section className="py-12 lg:py-16 bg-gradient-to-br from-furgocasa-blue via-furgocasa-blue-dark to-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 lg:mb-14 max-w-4xl mx-auto">
            <h2 className="text-3xl lg:text-5xl font-heading font-bold mb-4 uppercase tracking-wide">
              ¿Por qué confiar en nosotros?
            </h2>
            <p className="text-lg lg:text-xl text-blue-100">
              Tecnología de primera línea para darte la información más precisa y confiable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
            {[
              {
                icon: Map,
                title: "Integración Google Maps API",
                description: "Datos verificados directamente de Google Maps. Ubicaciones precisas con GPS, fotos reales, horarios actualizados y valoraciones de usuarios.",
                badge: "Google Maps",
              },
              {
                icon: Brain,
                title: "Valoración con OpenAI GPT-4",
                description: "Inteligencia artificial de última generación analiza miles de datos del mercado real. Comparación con portales especializados.",
                badge: "OpenAI GPT-4",
              },
              {
                icon: FileText,
                title: "Historial y Trazabilidad Total",
                description: "Registra cada mantenimiento, gasto y valoración con fecha exacta. Base de datos segura que guarda toda la vida de tu vehículo.",
                badge: "100% Trazable",
              },
              {
                icon: Lock,
                title: "Seguridad y Privacidad",
                description: "Encriptación de extremo a extremo para todos tus datos. Servidores seguros en Europa. Cumplimiento total con RGPD.",
                badge: "RGPD",
              },
              {
                icon: Zap,
                title: "Actualizaciones en Tiempo Real",
                description: "Sistema de sincronización automática con fuentes oficiales. Los precios de mercado se actualizan diariamente.",
                badge: "Tiempo Real",
              },
              {
                icon: Star,
                title: "100% Independiente",
                description: "Sin conflictos de interés. No vendemos tus datos. Sin publicidad que influya en resultados. Información objetiva y neutral.",
                badge: "Independiente",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm p-6 lg:p-8 rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <feature.icon className="h-10 w-10 text-furgocasa-orange flex-shrink-0" />
                  <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                    {feature.badge}
                  </span>
                </div>
                <h3 className="text-lg lg:text-xl font-heading font-bold mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm lg:text-base text-blue-100 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Badges tecnología */}
          <div className="mt-14 pt-10 border-t border-white/10">
            <p className="text-center text-blue-200 mb-6 text-xs lg:text-sm uppercase tracking-wider font-semibold">
              Tecnología empresarial al servicio de los autocaravanistas
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="flex items-center gap-3 bg-white/10 px-5 py-3 rounded-lg backdrop-blur-sm border border-white/20">
                <Map className="h-5 w-5 text-furgocasa-orange" />
                <span className="font-bold text-sm">Google Maps API Oficial</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 px-5 py-3 rounded-lg backdrop-blur-sm border border-white/20">
                <Brain className="h-5 w-5 text-furgocasa-orange" />
                <span className="font-bold text-sm">OpenAI GPT-4</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 px-5 py-3 rounded-lg backdrop-blur-sm border border-white/20">
                <Cloud className="h-5 w-5 text-furgocasa-orange" />
                <span className="font-bold text-sm">Cloud Infraestructura Segura</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CTA FINAL ============ */}
      <section className="py-16 lg:py-20 bg-gradient-to-br from-furgocasa-orange-bright via-furgocasa-orange to-furgocasa-orange-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzQuNDE4IDAgOC0zLjU4MiA4LThzLTMuNTgyLTgtOC04LTggMy41ODItOCA4IDMuNTgyIDggOCA4em0wIDRjLTQuNDE4IDAtOCAzLjU4Mi04IDhzMy41ODIgOCA4IDggOC0zLjU4MiA4LTgtMy41ODItOC04LTh6bTAgMjhjLTQuNDE4IDAtOCAzLjU4Mi04IDhzMy41ODIgOCA4IDggOC0zLjU4MiA4LTgtMy41ODItOC04LTh6TTEyIDZjNC40MTggMCA4LTMuNTgyIDgtOHMtMy41ODItOC04LTgtOCAzLjU4Mi04IDggMy41ODIgOCA4IDh6bTAgNDBjNC40MTggMCA4LTMuNTgyIDgtOHMtMy41ODItOC04LTgtOCAzLjU4Mi04IDggMy41ODIgOCA4IDh6bTQ4IDRjNC40MTggMCA4LTMuNTgyIDgtOHMtMy41ODItOC04LTgtOCAzLjU4Mi04IDggMy41ODIgOCA4IDh6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <h2
              className="text-3xl md:text-4xl lg:text-6xl font-heading font-black text-white mb-4 lg:mb-6 uppercase tracking-wider"
              style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.3)' }}
            >
              Explora más de 1000 áreas en toda España
            </h2>
            <p
              className="text-lg md:text-xl lg:text-2xl text-white/95 mb-8 lg:mb-10 font-medium leading-relaxed max-w-3xl mx-auto"
              style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.2)' }}
            >
              Mapa Furgocasa es tu compañero perfecto de viaje. Planifica rutas, encuentra áreas verificadas y gestiona tu autocaravana con inteligencia artificial.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="https://www.mapafurgocasa.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 bg-white text-furgocasa-orange font-bold px-8 lg:px-10 py-4 lg:py-5 rounded-2xl hover:bg-gray-50 transition-all shadow-2xl text-base lg:text-xl uppercase tracking-wider transform hover:scale-105 duration-300"
              >
                <Map className="h-5 w-5 lg:h-6 lg:w-6" />
                Ir a Mapa Furgocasa
                <ExternalLink className="h-4 w-4 lg:h-5 lg:w-5" />
              </a>
              <LocalizedLink
                href="/contacto"
                className="inline-flex items-center gap-3 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white font-bold px-8 lg:px-10 py-4 lg:py-5 rounded-2xl transition-colors border-2 border-white/40 text-base lg:text-xl uppercase tracking-wider"
              >
                Sugerir un área
              </LocalizedLink>
            </div>

            {/* Social proof */}
            <div className="mt-12 flex items-center justify-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-11 h-11 rounded-full bg-white/20 border-2 border-white flex items-center justify-center backdrop-blur-sm"
                  >
                    <span className="text-white font-bold text-lg">★</span>
                  </div>
                ))}
              </div>
              <div className="text-left">
                <p className="text-white font-bold text-lg">+1.000</p>
                <p className="text-white/90 text-xs lg:text-sm uppercase tracking-wider">Autocaravanistas activos</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER INFO ============ */}
      <section className="py-10 bg-furgocasa-blue-dark text-blue-100">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2 text-sm lg:text-base">
            Una empresa de{" "}
            <a
              href="https://www.furgocasa.com"
              className="text-furgocasa-orange hover:text-white font-semibold transition-colors"
            >
              www.furgocasa.com
            </a>
          </p>
          <p className="text-xs lg:text-sm text-blue-200 uppercase tracking-wider">
            Hecho en España
          </p>
        </div>
      </section>
    </main>
  );
}
