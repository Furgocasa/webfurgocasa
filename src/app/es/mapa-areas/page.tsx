import { Metadata } from "next";
import { 
  MapPin, Wifi, Droplets, Plug, Trash2, ShowerHead, ExternalLink, Sparkles, Route, Map, Shield,
  QrCode, Bell, Phone, FileText, Brain, TrendingUp, MessageCircle, Lock, Zap, Globe,
  Camera, Calendar, DollarSign, BarChart3, CheckCircle, Cloud, Star, ChevronRight
} from "lucide-react";
import { translateServer } from "@/lib/i18n/server-translation";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import type { Locale } from "@/lib/i18n/config";
import Image from "next/image";

interface PageProps {}

const MAPA_AREAS_METADATA: Metadata = {
  title: "Mapa Furgocasa - Áreas Autocaravanas + IA | +3600 Ubicaciones | Furgocasa",
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
          url: "https://www.mapafurgocasa.com/og-image.jpg",
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
    <main className="min-h-screen bg-white font-amiko">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-furgocasa-blue via-blue-700 to-indigo-900 py-20 overflow-hidden">
        {/* Patrón de fondo */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge GPT-4 */}
            <div className="inline-flex items-center gap-2 bg-yellow-400/20 text-yellow-300 px-4 py-2 rounded-full text-sm font-bold tracking-wider uppercase mb-6 backdrop-blur-sm border border-yellow-400/30">
              <Sparkles className="h-4 w-4" />
              Ahora con Inteligencia Artificial GPT-4
            </div>

            <h1 className="text-4xl md:text-6xl font-heading font-black text-white mb-6">
              Mapa Furgocasa
            </h1>
            <p className="text-2xl md:text-3xl text-blue-100 font-bold mb-4">
              Mucho más que una app de áreas de autocaravanas
            </p>
            <p className="text-xl text-blue-200 mb-8 max-w-3xl mx-auto leading-relaxed">
              Tu plataforma completa para gestionar tu autocaravana con IA. Valoraciones automáticas, rutas inteligentes y protección 24/7.
            </p>

            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <p className="text-3xl font-heading font-bold text-white">+1000</p>
                <p className="text-sm text-blue-200">Áreas Verificadas</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <p className="text-3xl font-heading font-bold text-white">100%</p>
                <p className="text-sm text-blue-200">Gratis Siempre</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <p className="text-3xl font-heading font-bold text-white">24/7</p>
                <p className="text-sm text-blue-200">Actualizado</p>
              </div>
            </div>

            {/* CTA Principal */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="https://www.mapafurgocasa.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-furgocasa-orange hover:bg-furgocasa-orange-dark text-white font-bold py-4 px-8 rounded-xl transition-all hover:scale-105 shadow-2xl shadow-orange-500/30 text-lg"
              >
                <Map className="h-5 w-5" />
                Empezar Gratis
                <ExternalLink className="h-4 w-4" />
              </a>
              <a 
                href="https://www.mapafurgocasa.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold py-4 px-8 rounded-xl transition-colors border-2 border-white/30 text-lg"
              >
                Ver Mapa de Áreas
                <ChevronRight className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Sección: Todo lo que necesitas */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900 mb-4">
              Todo lo que necesitas en una sola plataforma
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Gestión completa de tu autocaravana con tecnología de última generación
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {[
              {
                icon: Map,
                title: "+1000 Áreas Actualizadas",
                description: "Base de datos completa con áreas públicas, privadas, campings y parkings. Información verificada de servicios, precios y ubicaciones exactas.",
                color: "from-green-500 to-emerald-600"
              },
              {
                icon: Route,
                title: "Planificador de Rutas",
                description: "Crea rutas personalizadas y descubre automáticamente áreas de pernocta cercanas. Optimiza distancias y tiempos de viaje.",
                color: "from-blue-500 to-blue-600"
              },
              {
                icon: Globe,
                title: "Cobertura Mundial",
                description: "España, Portugal, Francia, Andorra, Argentina y más países. Expandimos constantemente nuestra red global de áreas.",
                color: "from-purple-500 to-indigo-600"
              },
              {
                icon: Shield,
                title: "Protección 24/7",
                description: "Sistema QR inteligente para reportar incidentes y daños. Notificaciones instantáneas con ubicación GPS.",
                color: "from-red-500 to-rose-600"
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group border border-gray-100"
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-heading font-bold text-gray-900 mb-3">
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

      {/* Sección: Gestión Inteligente con IA */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 relative overflow-hidden">
        {/* Efecto de brillo */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12 lg:mb-16">
            <div className="inline-flex items-center gap-2 bg-yellow-400/20 text-yellow-300 px-4 py-2 rounded-full text-sm font-bold mb-6 backdrop-blur-sm">
              <Brain className="h-4 w-4" />
              POWERED BY GPT-4
            </div>
            <h2 className="text-3xl lg:text-5xl font-heading font-bold text-white mb-4">
              Gestión Inteligente de tu Autocaravana
            </h2>
            <p className="text-xl text-blue-200 max-w-3xl mx-auto">
              Valoración automática con GPT-4 en segundos. Control total con comparación de precios de mercado en tiempo real.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {[
              { icon: Brain, title: "Valoración IA", desc: "GPT-4 en segundos", color: "bg-purple-500/20 border-purple-400/30" },
              { icon: BarChart3, title: "Precios Mercado", desc: "Comparación real", color: "bg-blue-500/20 border-blue-400/30" },
              { icon: Calendar, title: "Mantenimientos", desc: "Historial completo", color: "bg-green-500/20 border-green-400/30" },
              { icon: DollarSign, title: "Control Gastos", desc: "ROI automático", color: "bg-yellow-500/20 border-yellow-400/30" },
              { icon: TrendingUp, title: "Histórico Valor", desc: "Evolución precio", color: "bg-red-500/20 border-red-400/30" },
              { icon: Camera, title: "Gestión Fotos", desc: "Galería completa", color: "bg-pink-500/20 border-pink-400/30" },
            ].map((item, index) => (
              <div
                key={index}
                className={`${item.color} backdrop-blur-sm p-6 rounded-xl border-2 hover:scale-105 transition-all duration-300 cursor-pointer`}
              >
                <item.icon className="h-10 w-10 text-white mb-4" />
                <h3 className="text-lg font-heading font-bold text-white mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-white/80">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <a
              href="https://www.mapafurgocasa.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-white font-semibold hover:text-yellow-300 transition-colors"
            >
              Conoce más sobre Valoración IA
              <ChevronRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Sección: Sistema QR Inteligente */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-bold mb-6">
                  <Shield className="h-4 w-4" />
                  SISTEMA ANTI DAÑOS
                </div>
                <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900 mb-6">
                  Sistema QR Inteligente: Protección 24/7
                </h2>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Código QR único para tu vehículo. Los testigos pueden reportar incidentes o daños escaneándolo. Recibe notificaciones instantáneas con fotos, GPS y datos.
                </p>

                <div className="space-y-6">
                  {[
                    { icon: Bell, title: "Alertas de accidentes", desc: "Con fotos y ubicación GPS" },
                    { icon: QrCode, title: "Notificación de daños", desc: "Si ven daños en tu vehículo" },
                    { icon: Phone, title: "Contacto emergencia", desc: "Para autoridades y aseguradoras" },
                    { icon: FileText, title: "Historial completo", desc: "Todos los reportes guardados" },
                  ].map((feature, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <feature.icon className="h-6 w-6 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-gray-900 text-lg mb-1">
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
                    className="inline-flex items-center gap-2 text-furgocasa-orange font-bold hover:text-furgocasa-orange-dark transition-colors"
                  >
                    Descubre el Sistema de Alertas
                    <ChevronRight className="h-5 w-5" />
                  </a>
                </div>
              </div>

              {/* Mockup visual del QR */}
              <div className="relative">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 shadow-2xl border border-gray-200">
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="aspect-square bg-gradient-to-br from-red-50 to-orange-50 rounded-xl flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 gap-2 p-4">
                        {Array.from({ length: 64 }).map((_, i) => (
                          <div
                            key={i}
                            className={`${Math.random() > 0.5 ? 'bg-gray-900' : 'bg-transparent'} rounded-sm`}
                          ></div>
                        ))}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white rounded-lg p-4 shadow-lg">
                          <QrCode className="h-16 w-16 text-red-600" />
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <p className="font-bold text-gray-900 text-lg">Código QR Protección</p>
                      <p className="text-sm text-gray-500">ID: ABC-12345-XYZ</p>
                    </div>
                  </div>
                  
                  {/* Badge flotante */}
                  <div className="absolute -top-4 -right-4 bg-red-500 text-white font-bold px-6 py-3 rounded-full shadow-xl transform rotate-12 animate-pulse">
                    24/7
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección: Tecnología IA */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-bold mb-6">
              <Sparkles className="h-4 w-4" />
              INTELIGENCIA ARTIFICIAL
            </div>
            <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900 mb-4">
              Tecnología que entiende tu autocaravana
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              GPT-4 analiza, valora y te asesora en tiempo real
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Brain,
                title: "Valoración Inteligente",
                description: "GPT-4 analiza marca, modelo, año, kilometraje y mercado para darte una valoración precisa en segundos con informe PDF profesional.",
                color: "from-purple-500 to-purple-600"
              },
              {
                icon: BarChart3,
                title: "Comparación de Mercado",
                description: "Comparamos con miles de anuncios reales de portales especializados para determinar el precio justo de tu vehículo.",
                color: "from-blue-500 to-blue-600"
              },
              {
                icon: MessageCircle,
                title: "Chatbot Experto",
                description: "Asistente IA disponible 24/7 para responder preguntas sobre áreas, rutas y recomendaciones personalizadas.",
                color: "from-green-500 to-emerald-600"
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-heading font-bold text-gray-900 mb-3">
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

      {/* Sección: Empieza en 3 pasos */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900 mb-4">
              Empieza en 3 simples pasos
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Desde el registro hasta tu primera valoración IA en menos de 5 minutos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto">
            {[
              {
                step: "1",
                icon: CheckCircle,
                title: "Regístrate Gratis",
                description: "Crea tu cuenta en 30 segundos. Sin tarjeta de crédito. Acceso inmediato a todas las funciones.",
                color: "from-green-500 to-emerald-600"
              },
              {
                step: "2",
                icon: Camera,
                title: "Registra tu Vehículo",
                description: "Añade marca, modelo, año y kilometraje. Sube fotos y obtén tu código QR de protección.",
                color: "from-blue-500 to-blue-600"
              },
              {
                step: "3",
                icon: Brain,
                title: "Valoración IA Instantánea",
                description: "Clic en \"Valorar con IA\" y recibe un informe profesional en 30 segundos con precio real de mercado.",
                color: "from-purple-500 to-purple-600"
              },
            ].map((step, index) => (
              <div key={index} className="relative">
                {/* Línea conectora (solo desktop) */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-gray-300 to-transparent -z-10"></div>
                )}
                
                <div className="text-center">
                  <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-6 shadow-xl`}>
                    <step.icon className="h-12 w-12 text-white" />
                  </div>
                  <div className="mb-4">
                    <span className="text-5xl font-heading font-black text-gray-200">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="text-xl font-heading font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <a
              href="https://www.mapafurgocasa.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-furgocasa-orange hover:bg-furgocasa-orange-dark text-white font-bold py-4 px-8 rounded-xl transition-all hover:scale-105 shadow-xl text-lg"
            >
              Crear Cuenta Gratuita
              <ChevronRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Sección: ¿Por qué confiar? */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-5xl font-heading font-bold mb-4">
              ¿Por qué deberías confiar en nosotros?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Tecnología de primera línea para darte la información más precisa y confiable
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {[
              {
                icon: Map,
                title: "Integración Google Maps API",
                description: "Datos verificados directamente de Google Maps. Ubicaciones precisas con GPS, fotos reales, horarios actualizados y valoraciones de usuarios.",
                badge: "Google Maps"
              },
              {
                icon: Brain,
                title: "Valoración con OpenAI GPT-4",
                description: "Inteligencia artificial de última generación analiza miles de datos del mercado real. Comparación con portales especializados.",
                badge: "OpenAI GPT-4"
              },
              {
                icon: FileText,
                title: "Historial y Trazabilidad Total",
                description: "Registra cada mantenimiento, gasto y valoración con fecha exacta. Base de datos segura que guarda toda la vida de tu vehículo.",
                badge: "100% Trazable"
              },
              {
                icon: Lock,
                title: "Seguridad y Privacidad",
                description: "Encriptación de extremo a extremo para todos tus datos. Servidores seguros en Europa. Cumplimiento total con RGPD.",
                badge: "RGPD"
              },
              {
                icon: Zap,
                title: "Actualizaciones en Tiempo Real",
                description: "Sistema de sincronización automática con fuentes oficiales. Los precios de mercado se actualizan diariamente.",
                badge: "Tiempo Real"
              },
              {
                icon: Star,
                title: "100% Independiente",
                description: "Sin conflictos de interés. No vendemos tus datos. Sin publicidad que influya en resultados. Información objetiva y neutral.",
                badge: "Independiente"
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <feature.icon className="h-10 w-10 text-furgocasa-orange flex-shrink-0" />
                  <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full font-bold">
                    {feature.badge}
                  </span>
                </div>
                <h3 className="text-xl font-heading font-bold mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Badges de tecnología */}
          <div className="mt-16 pt-12 border-t border-white/10">
            <p className="text-center text-gray-400 mb-8 text-sm uppercase tracking-wider font-semibold">
              Tecnología empresarial de primer nivel al servicio de los autocaravanistas
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8">
              <div className="flex items-center gap-3 bg-white/10 px-6 py-3 rounded-lg backdrop-blur-sm">
                <Map className="h-6 w-6 text-green-400" />
                <span className="font-bold">Google Maps API Oficial</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 px-6 py-3 rounded-lg backdrop-blur-sm">
                <Brain className="h-6 w-6 text-purple-400" />
                <span className="font-bold">OpenAI GPT-4 IA Avanzada</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 px-6 py-3 rounded-lg backdrop-blur-sm">
                <Cloud className="h-6 w-6 text-blue-400" />
                <span className="font-bold">AWS Cloud Infraestructura Segura</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-furgocasa-orange via-orange-500 to-red-500 relative overflow-hidden">
        {/* Patrón decorativo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl lg:text-6xl font-heading font-black text-white mb-6">
            Explora más de 1000 áreas en toda España
          </h2>
          <p className="text-xl lg:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
            Mapa Furgocasa es tu compañero perfecto de viaje. Planifica rutas, encuentra áreas verificadas y gestiona tu autocaravana con inteligencia artificial.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <a 
              href="https://www.mapafurgocasa.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 bg-white text-furgocasa-orange font-black py-5 px-10 rounded-2xl hover:bg-gray-100 transition-all hover:scale-105 shadow-2xl text-xl"
            >
              <Map className="h-6 w-6" />
              Ir a Mapa Furgocasa
              <ExternalLink className="h-5 w-5" />
            </a>
            <a 
              href="/es/contacto"
              className="inline-flex items-center justify-center gap-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold py-5 px-10 rounded-2xl transition-colors border-2 border-white/40 text-xl"
            >
              Sugerir un área
            </a>
          </div>

          {/* Testimonial social proof */}
          <div className="mt-16 flex items-center justify-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-12 h-12 rounded-full bg-white/20 border-2 border-white flex items-center justify-center backdrop-blur-sm">
                  <span className="text-white font-bold text-xl">👤</span>
                </div>
              ))}
            </div>
            <div className="text-left">
              <p className="text-white font-bold text-lg">+1k</p>
              <p className="text-white/80 text-sm">Miles de autocaravanistas ya la tienen instalada</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer info */}
      <section className="py-12 bg-gray-900 text-gray-400">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">
            Una empresa de <a href="https://www.furgocasa.com" className="text-furgocasa-orange hover:text-furgocasa-orange-dark font-semibold">www.furgocasa.com</a>
          </p>
          <p className="text-sm">
            Hecho con ❤️ en España
          </p>
        </div>
      </section>
    </main>
  );
}
