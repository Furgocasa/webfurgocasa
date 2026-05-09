"use client";

import { 
  TrendingUp, Target, AlertTriangle, Lightbulb, BarChart3, 
  ShoppingCart, MapPin, Building2, DollarSign, Users, 
  Zap, Shield, Rocket, CheckCircle, XCircle, ArrowRight,
  Package, Globe, LineChart, PieChart, Server, Calendar,
  Award, TrendingDown, Lock, Unlock, Activity
} from "lucide-react";
import { COMPANY } from "@/lib/company";

export function EscalabilidadClient() {
  return (
    <main className="min-h-screen bg-gray-50 font-amiko">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-furgocasa-blue py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[url('/images/pattern.png')]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm mb-6">
              <Lock className="h-4 w-4" />
              <span>Documento Interno - Solo Socios</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6">
              Proyecto de Escalabilidad Digital
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed mb-4">
              Análisis estratégico sobre el futuro de FURGOCASA y la transición hacia un modelo de negocio digital escalable
            </p>
            <div className="flex items-center justify-center gap-4 text-blue-200 text-sm">
              <span>Versión 1.0</span>
              <span>•</span>
              <span>25 de enero de 2026</span>
            </div>
          </div>
        </div>
      </section>

      {/* Resumen Ejecutivo */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <Target className="h-8 w-8 text-furgocasa-blue" />
              <h2 className="text-3xl font-heading font-bold text-gray-900">
                Resumen Ejecutivo
              </h2>
            </div>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 text-lg leading-relaxed">
                FURGOCASA ha alcanzado un punto de <strong>madurez operativa</strong> con una flota de {COMPANY.stats.currentFleetSize} vehículos 
                y un modelo de negocio probado. Sin embargo, hemos identificado dos limitaciones estructurales que 
                frenan nuestro crecimiento:
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="bg-red-50 border border-red-200 p-6 rounded-xl">
                <div className="flex items-start gap-3 mb-3">
                  <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-heading font-bold text-red-900 text-xl mb-2">
                      1. Barrera de Entrada Alta (CAPEX)
                    </h3>
                    <p className="text-red-800 text-sm leading-relaxed">
                      El crecimiento requiere inversión continua en vehículos caros. Hemos agotado 
                      nuestro capital disponible y tenemos deuda bancaria. <strong>Escalar implica más riesgo 
                      financiero sin garantía de retorno proporcional.</strong>
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 p-6 rounded-xl">
                <div className="flex items-start gap-3 mb-3">
                  <TrendingDown className="h-6 w-6 text-orange-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-heading font-bold text-orange-900 text-xl mb-2">
                      2. Rentabilidad Limitada
                    </h3>
                    <p className="text-orange-800 text-sm leading-relaxed">
                      El negocio funciona y es estable, pero los márgenes son modestos tras descontar 
                      mantenimiento, seguros, renovación de flota, estructura y sueldos. <strong>Es difícil 
                      generar riqueza significativa solo alquilando más vehículos.</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 p-8 rounded-xl">
              <div className="flex items-start gap-4">
                <Lightbulb className="h-8 w-8 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-heading font-bold text-gray-900 text-2xl mb-3">
                    La Oportunidad: Producto Digital Escalable
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Los principales operadores europeos (roadsurfer, Indie Campers) han pivotado hacia 
                    <strong> ecosistemas digitales</strong> para superar estas mismas limitaciones. Han añadido 
                    marketplaces de vehículos de terceros y plataformas de reserva de espacios de pernocta, 
                    generando ingresos escalables sin comprar más activos.
                  </p>
                  <p className="text-gray-700 leading-relaxed font-semibold">
                    Nuestra propuesta: construir un producto digital que genere ingresos recurrentes, 
                    mejore la experiencia del cliente y sea escalable sin CAPEX adicional.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Situación Actual */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <Activity className="h-8 w-8 text-furgocasa-blue" />
              <h2 className="text-3xl font-heading font-bold text-gray-900">
                Situación Actual de FURGOCASA
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <Package className="h-10 w-10 text-blue-600" />
                  <span className="text-3xl font-bold text-gray-900">{COMPANY.stats.currentFleetSize}</span>
                </div>
                <h3 className="font-heading font-bold text-gray-900 mb-2">Flota Actual</h3>
                <p className="text-sm text-gray-600">Vehículos en operación</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                  <span className="text-3xl font-bold text-gray-900">✓</span>
                </div>
                <h3 className="font-heading font-bold text-gray-900 mb-2">Modelo Probado</h3>
                <p className="text-sm text-gray-600">Negocio estable y rentable</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <Lock className="h-10 w-10 text-red-600" />
                  <span className="text-3xl font-bold text-gray-900">⚠️</span>
                </div>
                <h3 className="font-heading font-bold text-gray-900 mb-2">Capital Agotado</h3>
                <p className="text-sm text-gray-600">Límite de endeudamiento alcanzado</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-heading font-bold text-gray-900 text-xl mb-4">
                El "Cuello de Botella" del Modelo Clásico
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                  <p className="text-gray-700">
                    <strong>Fortalezas:</strong> Sabemos operar, tenemos know-how real, captamos demanda 
                    eficazmente (SEO, marketing, marca) y ofrecemos experiencia de calidad.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-1" />
                  <p className="text-gray-700">
                    <strong>Limitación:</strong> La forma de escalar (comprar más vehículos) exige capital 
                    que hemos tensionado al máximo. Los márgenes operativos se ven reducidos por costes 
                    recurrentes y carácter intensivo en activos.
                  </p>
                </div>
              </div>
              
              <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-gray-800 font-semibold">
                  💡 Conclusión: Para subir de nivel, necesitamos romper la dependencia exclusiva del CAPEX 
                  y construir un modelo más "asset-light" (digital, escalable).
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tendencia del Mercado */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <Globe className="h-8 w-8 text-furgocasa-blue" />
              <h2 className="text-3xl font-heading font-bold text-gray-900">
                Tendencia del Mercado: Del Rental Puro al Ecosistema Digital
              </h2>
            </div>

            {/* Caso: Escape Campervans */}
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl mb-8">
              <div className="flex items-start gap-3">
                <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-heading font-bold text-red-900 text-xl mb-2">
                    Caso Ilustrativo: Escape Campervans (EE.UU.) - Cierre
                  </h3>
                  <p className="text-red-800 leading-relaxed">
                    <strong>Escape Campervans</strong> fue una referencia de marca y modelo cuando FURGOCASA 
                    se constituyó. Tras años operando, <strong>ha cerrado sus puertas</strong>. Esto refuerza 
                    una idea crítica: <em>el alquiler puro puede sostener un negocio, pero no siempre sostiene 
                    crecimiento ilimitado o rentabilidad extraordinaria</em>.
                  </p>
                </div>
              </div>
            </div>

            {/* Grandes Operadores */}
            <div className="mb-8">
              <h3 className="font-heading font-bold text-gray-900 text-2xl mb-6">
                Movimientos Estratégicos de Grandes Operadores Europeos
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-600 p-2 rounded-lg">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-heading font-bold text-blue-900 text-lg">
                      roadsurfer
                    </h4>
                  </div>
                  <p className="text-blue-900 mb-3 leading-relaxed">
                    Ha lanzado <strong>"roadsurfer spots"</strong>, un marketplace de campings y espacios 
                    de pernocta donde anfitriones ofrecen plazas y viajeros pueden reservar.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-blue-800">
                    <ArrowRight className="h-4 w-4" />
                    <span>Escala sin comprar vehículos</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-purple-600 p-2 rounded-lg">
                      <ShoppingCart className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-heading font-bold text-purple-900 text-lg">
                      Indie Campers
                    </h4>
                  </div>
                  <p className="text-purple-900 mb-3 leading-relaxed">
                    Integra un <strong>marketplace de vehículos</strong>, permitiendo que propietarios 
                    y profesionales pongan sus campers en la plataforma para alquilarse.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-purple-800">
                    <ArrowRight className="h-4 w-4" />
                    <span>Multiplica oferta sin CAPEX</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-green-900 font-semibold mb-2">
                      Lógica Estratégica Común:
                    </p>
                    <ul className="space-y-1 text-green-800 text-sm">
                      <li>✅ El negocio digital escala sin comprar activos (menos CAPEX)</li>
                      <li>✅ La plataforma capta usuarios y multiplica ingresos por servicios anexos</li>
                      <li>✅ Se reduce dependencia de temporada y alquiler exclusivo</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Otros Competidores */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h4 className="font-heading font-bold text-gray-900 text-lg mb-4">
                Plataformas Comparables en el Mercado
              </h4>
              
              <div className="grid gap-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="bg-yellow-500 h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900">Yescapa</h5>
                    <p className="text-sm text-gray-600">
                      Marketplace P2P entre particulares y profesionales
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="bg-green-600 h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900">Camplify</h5>
                    <p className="text-sm text-gray-600">
                      Marketplace P2P en mercados anglosajones con foco en crecimiento
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="bg-gray-600 h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900">Campanda / Mundovan</h5>
                    <p className="text-sm text-gray-600">
                      Portales/directorios SEO orientados a generación de leads
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Oportunidad LATAM */}
      <section className="py-16 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <Globe className="h-8 w-8 text-orange-600" />
              <h2 className="text-3xl font-heading font-bold text-gray-900">
                Oportunidad Latinoamérica: Mercado Emergente sin Líder Claro
              </h2>
            </div>

            {/* Análisis Competidores */}
            <div className="bg-white p-8 rounded-xl shadow-lg border border-orange-200 mb-8">
              <h3 className="font-heading font-bold text-gray-900 text-2xl mb-6">
                ¿Existen Indie Campers o roadsurfer en Latinoamérica?
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded-r-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <ShoppingCart className="h-6 w-6 text-purple-600" />
                    <h4 className="font-bold text-purple-900 text-lg">Indie Campers</h4>
                  </div>
                  <p className="text-purple-800 text-sm leading-relaxed">
                    Opera en <strong>Europa, Norteamérica y Oceanía</strong>. No muestra LATAM como región 
                    operativa con bases propias.
                  </p>
                </div>

                <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <MapPin className="h-6 w-6 text-green-600" />
                    <h4 className="font-bold text-green-900 text-lg">roadsurfer</h4>
                  </div>
                  <p className="text-green-800 text-sm leading-relaxed">
                    Declara alquiler en <strong>Europa y Norteamérica</strong>. Sin presencia en Latinoamérica.
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-100 to-blue-100 border-2 border-green-400 p-6 rounded-xl">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-8 w-8 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-gray-900 font-bold text-lg mb-2">
                      ✅ Conclusión Estratégica:
                    </p>
                    <p className="text-gray-800 leading-relaxed">
                      Los grandes "ecosistemas europeos" aún <strong>no están implantados de forma fuerte en LATAM</strong> 
                      como lo están en Europa. Esto es una <strong>señal excelente</strong> porque significa que 
                      <strong className="text-green-700"> no llegamos tarde</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Estado del Mercado */}
            <div className="bg-white p-8 rounded-xl shadow-lg border border-orange-200 mb-8">
              <h3 className="font-heading font-bold text-gray-900 text-2xl mb-6">
                ¿Cómo está el mercado camper en Latinoamérica?
              </h3>

              <div className="mb-6">
                <h4 className="font-bold text-orange-900 text-lg mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Mercado Fragmentado y Local
                </h4>
                <p className="text-gray-700 leading-relaxed mb-4">
                  En Chile, Argentina, México y Colombia hay oferta, pero está muy repartida entre:
                </p>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-2 p-4 bg-gray-50 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
                    <p className="text-sm text-gray-700">
                      Operadores locales pequeños (buena operación, poca tecnología)
                    </p>
                  </div>
                  <div className="flex items-start gap-2 p-4 bg-gray-50 rounded-lg">
                    <Globe className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
                    <p className="text-sm text-gray-700">
                      Anuncios y grupos (Facebook Marketplace, grupos de viajeros)
                    </p>
                  </div>
                  <div className="flex items-start gap-2 p-4 bg-gray-50 rounded-lg">
                    <Building2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
                    <p className="text-sm text-gray-700">
                      Webs tipo comparador/agregador internacional
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                <p className="text-blue-900 font-semibold mb-3">
                  📌 Lo que significa para nosotros:
                </p>
                <p className="text-blue-800 leading-relaxed">
                  Hay turismo, hay infraestructura, pero <strong>falta una capa especializada "camper" bien montada</strong> 
                  con comunidad, spots, pagos marketplace, verificación de anfitriones, rutas, etc.
                </p>
              </div>
            </div>

            {/* Potencial por País */}
            <div className="bg-white p-8 rounded-xl shadow-lg border border-orange-200 mb-8">
              <h3 className="font-heading font-bold text-gray-900 text-2xl mb-6">
                Mercado Emergente-Intermedio: Análisis por País
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 rounded-r-xl">
                  <div className="bg-blue-600 p-2 rounded-lg flex-shrink-0">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-900 text-lg mb-2">🇨🇱 Chile - TOP PRIORIDAD</h4>
                    <p className="text-blue-800 text-sm leading-relaxed">
                      Muy potente por naturaleza: Patagonia, Carretera Austral, desierto de Atacama. 
                      Mucha cultura outdoor y roadtrips. <strong>País ideal para pilotar.</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500 rounded-r-xl">
                  <div className="bg-green-600 p-2 rounded-lg flex-shrink-0">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-green-900 text-lg mb-2">🇦🇷 Argentina - SEGUNDA PRIORIDAD</h4>
                    <p className="text-green-800 text-sm leading-relaxed">
                      Enorme potencial con Patagonia y rutas infinitas. Logística y distancias más extremas, 
                      requiere buena UX de planificación.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 bg-gray-50 border-l-4 border-gray-400 rounded-r-xl">
                  <div className="bg-gray-600 p-2 rounded-lg flex-shrink-0">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg mb-2">🇲🇽 México - ALTO VOLUMEN</h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      Mercado grande por población y turismo. Requiere control de confianza y soporte por 
                      fricción en seguridad según zonas.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 bg-orange-50 border-l-4 border-orange-400 rounded-r-xl">
                  <div className="bg-orange-600 p-2 rounded-lg flex-shrink-0">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-orange-900 text-lg mb-2">🇵🇪 🇨🇴 Perú / Colombia - CURADO</h4>
                    <p className="text-orange-800 text-sm leading-relaxed">
                      Potencial alto para experiencias, pero el "camper mainstream" va más lento. 
                      Enfoque por rutas puntuales seleccionadas.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ventaja del Español */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-100 border-2 border-yellow-400 p-8 rounded-xl mb-8">
              <div className="flex items-start gap-4 mb-6">
                <Rocket className="h-10 w-10 text-yellow-600 flex-shrink-0" />
                <div>
                  <h3 className="font-heading font-bold text-gray-900 text-2xl mb-3">
                    La Ventaja del Español: 3 Multiplicadores de Valor
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    El español nos da una ventaja estratégica única que multiplica el impacto de cada inversión en contenido y producto.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="bg-yellow-600 h-12 w-12 rounded-lg flex items-center justify-center mb-4">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">1. Contenido Reutilizable</h4>
                  <p className="text-sm text-gray-700">
                    Un mismo contenido sirve para muchos países: SEO, guías, landings, tutoriales, fichas se multiplican.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="bg-orange-600 h-12 w-12 rounded-lg flex items-center justify-center mb-4">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">2. Vacío de Autoridad</h4>
                  <p className="text-sm text-gray-700">
                    Falta "autoridad" en contenidos camper bien hechos. Mucho foro disperso, poca info formal + reserva.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="bg-red-600 h-12 w-12 rounded-lg flex items-center justify-center mb-4">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">3. Marca Paraguas</h4>
                  <p className="text-sm text-gray-700">
                    Podemos ser la "marca paraguas" del mundo camper hispano antes que otros lo hagan.
                  </p>
                </div>
              </div>
            </div>

            {/* Spots en LATAM */}
            <div className="bg-white p-8 rounded-xl shadow-lg border border-orange-200 mb-8">
              <h3 className="font-heading font-bold text-gray-900 text-2xl mb-6">
                ¿Y "Spots" encaja en LATAM?
              </h3>

              <div className="bg-green-50 border border-green-200 p-6 rounded-lg mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-green-900 font-semibold mb-2">
                      ✅ Sí, el concepto puede ser incluso más natural que en Europa
                    </p>
                    <p className="text-green-800 leading-relaxed mb-3">
                      Hay abundancia de: fincas, estancias rurales, viñedos, terrenos grandes, negocios turísticos familiares.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-bold text-orange-900 text-lg mb-4">
                  Pero hay que hacerlo con sentido común en 3 puntos clave:
                </h4>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                    <Shield className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <h5 className="font-bold text-blue-900 mb-2">A) Confianza y Seguridad</h5>
                      <p className="text-blue-800 text-sm">
                        La gente valora muchísimo: <strong>spot verificado, anfitrión identificado, reseñas reales, 
                        soporte rápido</strong>. Es crítico para el éxito.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-purple-50 border-l-4 border-purple-500 rounded-r-lg">
                    <DollarSign className="h-6 w-6 text-purple-600 flex-shrink-0 mt-1" />
                    <div>
                      <h5 className="font-bold text-purple-900 mb-2">B) Pagos</h5>
                      <p className="text-purple-800 text-sm">
                        El pago con tarjeta y los reembolsos "como Europa" no siempre van finos 
                        (comisiones, bancos, hábitos). No es un freno, pero condiciona el diseño del MVP.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg">
                    <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
                    <div>
                      <h5 className="font-bold text-amber-900 mb-2">C) Legalidad "Difusa"</h5>
                      <p className="text-amber-800 text-sm">
                        La norma y presión municipal es variable. Enfoque: <strong>"Spots seguros y acordados con anfitrión"</strong> 
                        más que "garantizamos legalidad absoluta" (depende del país/municipio).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Estrategia 2 Capas */}
            <div className="bg-gradient-to-br from-green-600 to-green-700 text-white p-8 rounded-xl shadow-xl">
              <div className="flex items-start gap-4 mb-6">
                <Lightbulb className="h-10 w-10 text-green-200 flex-shrink-0" />
                <div>
                  <h3 className="font-heading font-bold text-2xl mb-3">
                    Estrategia para FURGOCASA en LATAM: 2 Capas Complementarias
                  </h3>
                  <p className="text-green-100 leading-relaxed mb-4">
                    Para no dispersarnos, debemos construir un sistema coherente donde cada capa alimenta a la siguiente.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-green-400 p-2 rounded-lg">
                      <MapPin className="h-6 w-6 text-green-900" />
                    </div>
                    <h4 className="font-bold text-xl">Capa 1 - MapaFurgoCasa</h4>
                  </div>
                  <p className="text-sm text-green-100 mb-3">Gratuita, expansión, autoridad</p>
                  <ul className="space-y-2 text-sm text-green-50">
                    <li>• Mapa de áreas</li>
                    <li>• Puntos de servicio (agua, vaciado, parking)</li>
                    <li>• Comunidad y reseñas</li>
                    <li>• SEO internacional</li>
                  </ul>
                </div>

                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-yellow-400 p-2 rounded-lg">
                      <DollarSign className="h-6 w-6 text-yellow-900" />
                    </div>
                    <h4 className="font-bold text-xl">Capa 2 - FURGOCASA Spots</h4>
                  </div>
                  <p className="text-sm text-green-100 mb-3">Monetización</p>
                  <ul className="space-y-2 text-sm text-green-50">
                    <li>• Spots privados reservables</li>
                    <li>• Áreas camper de pago (las buenas)</li>
                    <li>• Campings seleccionados (complemento)</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 bg-green-800 p-5 rounded-lg">
                <p className="text-lg font-bold mb-2">🎯 La clave estratégica:</p>
                <p className="text-green-100 leading-relaxed">
                  No intentar ser "Booking de campings LATAM". <strong>Ser la solución camper completa</strong>: 
                  contenido + herramientas + reserva.
                </p>
              </div>
            </div>

            {/* Plan de Acción */}
            <div className="mt-8 bg-white p-8 rounded-xl shadow-lg border-2 border-orange-400">
              <div className="flex items-center gap-3 mb-6">
                <Target className="h-8 w-8 text-orange-600" />
                <h3 className="font-heading font-bold text-gray-900 text-2xl">
                  Plan de Acción para LATAM
                </h3>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3 p-5 bg-blue-50 border-l-4 border-blue-600 rounded-r-lg">
                  <div className="bg-blue-600 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-900 mb-2">Piloto en Chile</h4>
                    <p className="text-blue-800 text-sm">
                      País TOP para roadtrips, turismo internacional fuerte, spots privados con gran potencial.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-5 bg-green-50 border-l-4 border-green-600 rounded-r-lg">
                  <div className="bg-green-600 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-green-900 mb-2">Expansión a Argentina</h4>
                    <p className="text-green-800 text-sm">
                      Una vez validado Chile, expandir a Argentina aprovechando las sinergias de Patagonia.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-5 bg-purple-50 border-l-4 border-purple-600 rounded-r-lg">
                  <div className="bg-purple-600 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-purple-900 mb-2">Fase 3: Perú / Colombia / México</h4>
                    <p className="text-purple-800 text-sm">
                      Expansión selectiva: Perú/Colombia por rutas curadas, México por volumen (con soporte fuerte).
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-100 to-yellow-100 border-2 border-orange-400 p-6 rounded-lg">
                <p className="text-orange-900 font-bold text-lg mb-2">
                  💡 Resumen en una frase:
                </p>
                <p className="text-orange-800 leading-relaxed">
                  <strong>Latinoamérica es una oportunidad real</strong> porque todavía no tiene un líder claro 
                  tipo roadsurfer/Indie, y el español permite escalar contenido y marca rápidamente sin partir de cero 
                  en cada país.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modelos Digitales Disponibles */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <BarChart3 className="h-8 w-8 text-furgocasa-blue" />
              <h2 className="text-3xl font-heading font-bold text-gray-900">
                Modelos Digitales: Análisis y Encaje para FURGOCASA
              </h2>
            </div>

            <div className="space-y-6">
              {/* Opción 1: Marketplace Pernocta */}
              <div className="bg-white rounded-xl shadow-lg border-2 border-green-300 overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-green-700 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-8 w-8 text-white" />
                      <div>
                        <h3 className="text-2xl font-heading font-bold text-white">
                          Opción 1: Marketplace de Pernocta (FURGOCASA Spots)
                        </h3>
                        <p className="text-green-100 text-sm">Producto digital principal RECOMENDADO</p>
                      </div>
                    </div>
                    <Award className="h-12 w-12 text-green-200" />
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="mb-6">
                    <h4 className="font-bold text-gray-900 mb-2">¿En qué consiste?</h4>
                    <p className="text-gray-700 leading-relaxed">
                      Plataforma para reservar espacios de pernocta: campings, áreas privadas, fincas, 
                      terrenos, plazas habilitadas. Conecta anfitriones (particulares y negocios) con 
                      viajeros en camper. Se cobra comisión por reserva.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="font-bold text-green-700 mb-3 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Ventajas
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">✓</span>
                          <span>Ataca un dolor real: "¿Dónde puedo dormir tranquilo y legal?"</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">✓</span>
                          <span>Menos competencia directa que marketplace de vehículos</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">✓</span>
                          <span>Escala sin CAPEX - ingresos recurrentes</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">✓</span>
                          <span>Gran encaje con SEO local y contenido</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">✓</span>
                          <span>Mejora conversión del alquiler actual (complemento perfecto)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">✓</span>
                          <span>Lanzamiento regional controlado (Murcia/Alicante/Valencia/Madrid)</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-bold text-orange-700 mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Retos
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="text-orange-600 font-bold">⚠</span>
                          <span>Captación inicial de anfitriones requiere trabajo comercial</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-orange-600 font-bold">⚠</span>
                          <span>Necesidad de reglas claras y soporte básico a usuarios</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-orange-600 font-bold">⚠</span>
                          <span>Control de calidad del inventario y experiencia</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 p-5 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <Target className="h-6 w-6 text-green-600" />
                      <h4 className="font-bold text-green-900 text-lg">Encaje para FURGOCASA</h4>
                    </div>
                    <p className="text-green-800 font-semibold mb-3">⭐⭐⭐⭐⭐ MUY ALTO</p>
                    <p className="text-green-900 leading-relaxed">
                      Tiene sentido estratégico como producto digital principal. Resuelve fricción real 
                      del viaje camper, aprovecha nuestras fortalezas (SEO, conocimiento local, clientes reales) 
                      y genera ingresos escalables sin comprar vehículos.
                    </p>
                  </div>

                  <div className="mt-6 bg-blue-50 border border-blue-200 p-5 rounded-lg">
                    <h4 className="font-bold text-blue-900 mb-3">Monetización Potencial</h4>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-blue-600" />
                        <span className="text-blue-800">Comisión por reserva (10-15%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-blue-600" />
                        <span className="text-blue-800">Destacados para anfitriones</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span className="text-blue-800">Suscripción anfitrión PRO</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-blue-600" />
                        <span className="text-blue-800">Packs (vehículo + spots + rutas)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Opción 2: Marketplace Vehículos */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6">
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="h-8 w-8 text-white" />
                    <div>
                      <h3 className="text-2xl font-heading font-bold text-white">
                        Opción 2: Marketplace de Vehículos (Curado Profesional)
                      </h3>
                      <p className="text-purple-100 text-sm">Producto complementario - Fase 2</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="mb-6">
                    <h4 className="font-bold text-gray-900 mb-2">¿En qué consiste?</h4>
                    <p className="text-gray-700 leading-relaxed">
                      Red de partners profesionales (empresas pequeñas/medianas) bajo estándares mínimos de calidad. 
                      <strong> NO marketplace P2P genérico</strong> para evitar problemas de calidad irregular, 
                      seguros, disputas y dilución de marca.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="font-bold text-green-700 mb-3 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Ventajas
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">✓</span>
                          <span>Escala oferta sin CAPEX</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">✓</span>
                          <span>Margen alto por comisión</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">✓</span>
                          <span>Control de calidad mediante red curada</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-bold text-orange-700 mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Retos
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="text-orange-600 font-bold">⚠</span>
                          <span>Mercado muy competido (Yescapa, Indie, Camplify)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-orange-600 font-bold">⚠</span>
                          <span>Problema "huevo-gallina": oferta y demanda simultáneas</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-orange-600 font-bold">⚠</span>
                          <span>Complejidad seguros, daños, depósitos</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 p-5 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Target className="h-6 w-6 text-purple-600" />
                      <h4 className="font-bold text-purple-900 text-lg">Encaje para FURGOCASA</h4>
                    </div>
                    <p className="text-purple-800 font-semibold mb-2">⭐⭐⭐ MEDIO-ALTO</p>
                    <p className="text-purple-900 leading-relaxed">
                      Interesante como complemento en <strong>Fase 2</strong>, pero solo si tenemos diferencial 
                      claro y enfoque en red profesional curada. No recomendado como apuesta principal inicial.
                    </p>
                  </div>
                </div>
              </div>

              {/* Opción 3: SaaS B2B */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
                  <div className="flex items-center gap-3">
                    <Server className="h-8 w-8 text-white" />
                    <div>
                      <h3 className="text-2xl font-heading font-bold text-white">
                        Opción 3: SaaS B2B para Operadores de Alquiler
                      </h3>
                      <p className="text-blue-100 text-sm">Spin-off o producto paralelo - Largo plazo</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="mb-6">
                    <h4 className="font-bold text-gray-900 mb-2">¿En qué consiste?</h4>
                    <p className="text-gray-700 leading-relaxed">
                      Software con suscripción mensual para empresas pequeñas/medianas de alquiler. 
                      Módulos: reservas, pricing dinámico, check-in/out digital, gestión de daños, 
                      CRM, mantenimiento, firma digital, contabilidad integrada, etc.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="font-bold text-green-700 mb-3 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Ventajas
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">✓</span>
                          <span>Ingreso recurrente (MRR) y margen muy alto (+80%)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">✓</span>
                          <span>Escala limpia sin CAPEX</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">✓</span>
                          <span>Negocio menos estacional y más defensible</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">✓</span>
                          <span>Conocemos el problema y necesidades reales</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-bold text-orange-700 mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Retos
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="text-orange-600 font-bold">⚠</span>
                          <span>Desarrollo serio y continuo - roadmap exigente</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-orange-600 font-bold">⚠</span>
                          <span>Soporte técnico y ventas B2B profesionales</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-orange-600 font-bold">⚠</span>
                          <span>Requiere foco exclusivo y socio tecnológico potente</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-orange-600 font-bold">⚠</span>
                          <span>Ciclo de venta B2B más largo</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 p-5 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Target className="h-6 w-6 text-blue-600" />
                      <h4 className="font-bold text-blue-900 text-lg">Encaje para FURGOCASA</h4>
                    </div>
                    <p className="text-blue-800 font-semibold mb-2">⭐⭐⭐⭐ ALTO (pero exigente)</p>
                    <p className="text-blue-900 leading-relaxed">
                      Potencialmente muy rentable, pero más exigente en producto y ejecución. Recomendable 
                      como <strong>"segunda etapa"</strong> o como <strong>spin-off</strong> con socio 
                      tecnológico y financiación específica. No como apuesta inicial.
                    </p>
                  </div>
                </div>
              </div>

              {/* Opción 4: Directorio SEO */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-300 overflow-hidden opacity-75">
                <div className="bg-gradient-to-r from-gray-500 to-gray-600 p-6">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-8 w-8 text-white" />
                    <div>
                      <h3 className="text-2xl font-heading font-bold text-white">
                        Opción 4: Directorio SEO + Leads
                      </h3>
                      <p className="text-gray-200 text-sm">No recomendado como apuesta principal</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="mb-4">
                    <h4 className="font-bold text-gray-900 mb-2">¿En qué consiste?</h4>
                    <p className="text-gray-700 leading-relaxed">
                      Portal SEO con muchas páginas por ciudades y tipologías. Monetización con anunciantes 
                      (pago por publicación, cuota, leads). No integra necesariamente pago o reserva completa.
                    </p>
                  </div>

                  <div className="bg-gray-100 border border-gray-300 p-5 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <XCircle className="h-6 w-6 text-gray-600" />
                      <h4 className="font-bold text-gray-900 text-lg">Encaje para FURGOCASA</h4>
                    </div>
                    <p className="text-gray-700 font-semibold mb-2">⭐⭐ BAJO</p>
                    <p className="text-gray-700 leading-relaxed">
                      Útil como <strong>canal de captación</strong> complementario, pero NO como apuesta 
                      principal. Requiere escala SEO nacional masiva para ser rentable. Menos defensible 
                      a largo plazo frente a plataformas transaccionales.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparativa y Recomendación */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <Award className="h-8 w-8 text-furgocasa-blue" />
              <h2 className="text-3xl font-heading font-bold text-gray-900">
                Recomendación Estratégica
              </h2>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-400 p-8 rounded-xl mb-8">
              <div className="flex items-start gap-4 mb-6">
                <Rocket className="h-12 w-12 text-green-600 flex-shrink-0" />
                <div>
                  <h3 className="text-2xl font-heading font-bold text-green-900 mb-3">
                    Apuesta Principal: FURGOCASA Spots (Marketplace de Pernocta)
                  </h3>
                  <p className="text-green-800 text-lg leading-relaxed">
                    Crear la plataforma de referencia (primero regional, luego nacional) para reservar 
                    lugares de pernocta con campers.
                  </p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg mb-6">
                <h4 className="font-bold text-gray-900 mb-4 text-lg">Motivos para Esta Elección:</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                    <p className="text-gray-700 text-sm">
                      <strong>Dolor real del mercado:</strong> Los viajeros necesitan saber dónde dormir 
                      de forma legal y segura
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                    <p className="text-gray-700 text-sm">
                      <strong>Encaja con fortalezas:</strong> SEO local, conocimiento del viaje, clientes reales
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                    <p className="text-gray-700 text-sm">
                      <strong>Lanzamiento controlado:</strong> Zonas piloto (Murcia/Alicante/Valencia/Madrid)
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                    <p className="text-gray-700 text-sm">
                      <strong>Escalable sin CAPEX:</strong> Genera ingresos sin comprar vehículos
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                    <p className="text-gray-700 text-sm">
                      <strong>Mejora negocio actual:</strong> Aumenta conversión y ticket medio del alquiler
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                    <p className="text-gray-700 text-sm">
                      <strong>Menos competencia:</strong> Mercado menos saturado que vehículos
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-700 text-white p-6 rounded-lg">
                <p className="text-lg font-semibold mb-2">
                  🎯 Criterio de Decisión Clave:
                </p>
                <p className="leading-relaxed">
                  El éxito del siguiente paso NO depende de tener más campers, sino de crear 
                  <strong> ingresos escalables</strong> que funcionen incluso si mañana no compramos 
                  un solo vehículo adicional.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl">
                <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                  <ArrowRight className="h-5 w-5" />
                  Recomendación Secundaria
                </h4>
                <p className="text-blue-800 mb-2">
                  <strong>Marketplace curado de oferta profesional</strong>
                </p>
                <p className="text-blue-700 text-sm">
                  Fase 2 o en paralelo controlado. NO entrar en P2P genérico sin diferencial 
                  y sin estructura avanzada de seguros/gestión.
                </p>
              </div>

              <div className="bg-indigo-50 border border-indigo-200 p-6 rounded-xl">
                <h4 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Opcional (Futuro)
                </h4>
                <p className="text-indigo-800 mb-2">
                  <strong>SaaS B2B para operadores</strong>
                </p>
                <p className="text-indigo-700 text-sm">
                  Si se decide pivotar a "producto" como gran apuesta de largo plazo con 
                  socio tecnológico y financiación específica.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hoja de Ruta */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <Calendar className="h-8 w-8 text-furgocasa-blue" />
              <h2 className="text-3xl font-heading font-bold text-gray-900">
                Hoja de Ruta Propuesta: MVP y Escalado
              </h2>
            </div>

            <div className="space-y-6">
              {/* Fase 1: MVP */}
              <div className="bg-white p-8 rounded-xl shadow-lg border-l-4 border-green-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-green-600 text-white rounded-full h-10 w-10 flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="text-2xl font-heading font-bold text-gray-900">
                      Fase 1: MVP (Lanzamiento Rápido)
                    </h3>
                    <p className="text-gray-600">Validar tracción sin construir "la plataforma perfecta"</p>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 p-6 rounded-lg mb-6">
                  <h4 className="font-bold text-green-900 mb-4">MVP FURGOCASA Spots:</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                      <p className="text-green-800 text-sm">
                        Landing + inventario mínimo de spots (20-50) en 1-2 zonas piloto
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                      <p className="text-green-800 text-sm">
                        Reserva simple (pago integrado o solicitud gestionada)
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                      <p className="text-green-800 text-sm">
                        Sistema básico anfitrión (alta + disponibilidad + condiciones)
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                      <p className="text-green-800 text-sm">
                        Políticas claras y soporte mínimo
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                  <h4 className="font-bold text-blue-900 mb-3">Zonas Recomendadas para Piloto:</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      <span className="text-blue-800 font-semibold">Murcia / Costa Cálida</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      <span className="text-blue-800 font-semibold">Alicante / Valencia</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      <span className="text-blue-800 font-semibold">Madrid</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fase 2: Escala Controlada */}
              <div className="bg-white p-8 rounded-xl shadow-lg border-l-4 border-blue-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-blue-600 text-white rounded-full h-10 w-10 flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="text-2xl font-heading font-bold text-gray-900">
                      Fase 2: Escala Controlada (3-6 meses)
                    </h3>
                    <p className="text-gray-600">Expansión regional y mejora del producto</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <ArrowRight className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
                    <p className="text-gray-700 text-sm">Captación sistemática de anfitriones</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <ArrowRight className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
                    <p className="text-gray-700 text-sm">Expansión a más destinos estratégicos</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <ArrowRight className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
                    <p className="text-gray-700 text-sm">Rutas recomendadas y paquetes de viaje</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <ArrowRight className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
                    <p className="text-gray-700 text-sm">Automatización de pagos, calendarios y reglas</p>
                  </div>
                </div>
              </div>

              {/* Fase 3: Ecosistema */}
              <div className="bg-white p-8 rounded-xl shadow-lg border-l-4 border-purple-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-purple-600 text-white rounded-full h-10 w-10 flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="text-2xl font-heading font-bold text-gray-900">
                      Fase 3: Ecosistema Completo (6-12 meses)
                    </h3>
                    <p className="text-gray-600">Integración vertical y productos complementarios</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <Zap className="h-5 w-5 text-purple-600 flex-shrink-0 mt-1" />
                    <p className="text-gray-700 text-sm">
                      <strong>Integración con alquiler:</strong> packs vehículo + spots
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Zap className="h-5 w-5 text-purple-600 flex-shrink-0 mt-1" />
                    <p className="text-gray-700 text-sm">
                      <strong>Suscripciones / membresías:</strong> viajero frecuente PRO
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Zap className="h-5 w-5 text-purple-600 flex-shrink-0 mt-1" />
                    <p className="text-gray-700 text-sm">
                      <strong>Marketplace curado:</strong> campers de terceros profesionales
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Zap className="h-5 w-5 text-purple-600 flex-shrink-0 mt-1" />
                    <p className="text-gray-700 text-sm">
                      <strong>Experiencias:</strong> bodegas, eventos, actividades locales
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Métricas Clave */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <LineChart className="h-8 w-8 text-furgocasa-blue" />
              <h2 className="text-3xl font-heading font-bold text-gray-900">
                Métricas Clave de Éxito
              </h2>
            </div>

            <p className="text-gray-700 mb-8 text-lg">
              Para saber si el proyecto funciona, debemos medir estos indicadores:
            </p>

            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-300 p-8 rounded-xl">
              <h3 className="font-heading font-bold text-green-900 text-xl mb-6 flex items-center gap-2">
                <PieChart className="h-6 w-6" />
                Métricas para FURGOCASA Spots
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border border-green-200">
                  <h4 className="font-bold text-green-900 mb-4">Oferta y Disponibilidad</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">•</span>
                      <p className="text-sm text-gray-700">Nº spots activos en plataforma</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">•</span>
                      <p className="text-sm text-gray-700">Distribución geográfica del inventario</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">•</span>
                      <p className="text-sm text-gray-700">Tasa de ocupación promedio de spots</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-green-200">
                  <h4 className="font-bold text-green-900 mb-4">Conversión y Rentabilidad</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">•</span>
                      <p className="text-sm text-gray-700">Conversión visita → reserva (%)</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">•</span>
                      <p className="text-sm text-gray-700">Take rate (% comisión real)</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">•</span>
                      <p className="text-sm text-gray-700">CAC vs margen por reserva</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-green-200">
                  <h4 className="font-bold text-green-900 mb-4">Experiencia y Calidad</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">•</span>
                      <p className="text-sm text-gray-700">Repetición de usuarios (%)</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">•</span>
                      <p className="text-sm text-gray-700">Satisfacción (reseñas, NPS)</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">•</span>
                      <p className="text-sm text-gray-700">Incidencias por 100 reservas</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-green-200">
                  <h4 className="font-bold text-green-900 mb-4">Impacto en Negocio Core</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">•</span>
                      <p className="text-sm text-gray-700">Aumento conversión alquiler (%)</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">•</span>
                      <p className="text-sm text-gray-700">Incremento ticket medio</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">•</span>
                      <p className="text-sm text-gray-700">Cross-selling (packs combinados)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recursos Necesarios */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <Users className="h-8 w-8 text-furgocasa-blue" />
              <h2 className="text-3xl font-heading font-bold text-gray-900">
                ¿Qué Necesitamos para Ejecutarlo?
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-heading font-bold text-gray-900 text-xl mb-4 flex items-center gap-2">
                  <Building2 className="h-6 w-6 text-blue-600" />
                  Recursos Mínimos (Fase MVP)
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                    <p className="text-gray-700 text-sm">
                      <strong>Liderazgo interno:</strong> producto + estrategia
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                    <p className="text-gray-700 text-sm">
                      <strong>Desarrollo:</strong> web + base de datos + pagos
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                    <p className="text-gray-700 text-sm">
                      <strong>Captación:</strong> anfitriones iniciales (comercial)
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                    <p className="text-gray-700 text-sm">
                      <strong>Marketing:</strong> contenido SEO y distribución
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                    <p className="text-gray-700 text-sm">
                      <strong>Soporte:</strong> atención al cliente operativa básica
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-heading font-bold text-gray-900 text-xl mb-4 flex items-center gap-2">
                  <DollarSign className="h-6 w-6 text-green-600" />
                  Escenarios de Financiación
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-bold text-blue-900 mb-2">Autofinanciación</h4>
                    <p className="text-blue-800 text-sm">
                      MVP pequeño con recursos internos. Lanzamiento controlado sin capital externo.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h4 className="font-bold text-purple-900 mb-2">Capital Externo / Socio Tecnológico</h4>
                    <p className="text-purple-800 text-sm">
                      Si queremos acelerar desarrollo y captación de mercado.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-bold text-green-900 mb-2">Alianzas Estratégicas</h4>
                    <p className="text-green-800 text-sm">
                      Camping, fincas, bodegas, áreas privadas para inventario inicial.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Conclusión Final */}
      <section className="py-20 bg-gradient-to-br from-furgocasa-blue via-blue-700 to-indigo-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Rocket className="h-16 w-16 text-white mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-6">
              Conclusión Final: El Siguiente Paso de FURGOCASA
            </h2>
            
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20 mb-8">
              <div className="space-y-6 text-white text-lg leading-relaxed text-left">
                <p>
                  <strong>FURGOCASA está en un punto lógico de madurez:</strong> el negocio de alquiler 
                  funciona, pero su crecimiento está limitado por capital, deuda y márgenes estructurales. 
                  No es un problema de ejecución, es una característica del modelo.
                </p>
                
                <p>
                  <strong>El mercado se mueve hacia ecosistemas digitales</strong> para escalar sin CAPEX. 
                  Los principales operadores europeos ya lo están haciendo. No es una tendencia futura, 
                  está ocurriendo ahora.
                </p>
                
                <p>
                  <strong>La oportunidad más defendible para nosotros</strong> es construir un producto 
                  digital que resuelva fricción real del viaje camper, empezando por la necesidad de 
                  pernocta legal y planificada.
                </p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-2xl text-left">
              <h3 className="font-heading font-bold text-gray-900 text-2xl mb-4">
                Propuesta de Enfoque:
              </h3>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <div className="bg-green-600 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold flex-shrink-0">
                    1
                  </div>
                  <p className="text-gray-700 pt-1">
                    Lanzar <strong>"FURGOCASA Spots"</strong> como producto digital principal
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-600 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold flex-shrink-0">
                    2
                  </div>
                  <p className="text-gray-700 pt-1">
                    Usarlo para aumentar ingresos recurrentes y mejorar conversión del alquiler actual
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-purple-600 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold flex-shrink-0">
                    3
                  </div>
                  <p className="text-gray-700 pt-1">
                    Escalar de regional a nacional
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-indigo-600 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold flex-shrink-0">
                    4
                  </div>
                  <p className="text-gray-700 pt-1">
                    Valorar en Fase 2: marketplace profesional curado de vehículos y/o SaaS B2B
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-green-600 p-6 rounded-r-lg">
                <p className="text-gray-900 font-bold text-xl mb-2">
                  🎯 Criterio de Decisión Final:
                </p>
                <p className="text-gray-800 leading-relaxed">
                  El éxito del siguiente paso no depende de tener más campers, sino de crear 
                  <strong> ingresos escalables que funcionen incluso si mañana no compramos 
                  un solo vehículo adicional</strong>.
                </p>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-4 text-blue-200 text-sm">
              <Lock className="h-4 w-4" />
              <span>Documento Interno - Confidencial</span>
              <span>•</span>
              <span>Versión 1.0 - Enero 2026</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Información */}
      <section className="py-12 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-gray-400 text-sm mb-4">
              Este documento refleja el análisis estratégico de FURGOCASA sobre el mercado de alquiler 
              de campers y la transición hacia modelos digitales escalables. Está destinado exclusivamente 
              a socios para facilitar la toma de decisiones sobre el futuro del negocio.
            </p>
            <div className="flex items-center justify-center gap-6 text-gray-500 text-xs">
              <span>© 2026 FURGOCASA</span>
              <span>•</span>
              <span>Uso Interno Exclusivo</span>
              <span>•</span>
              <span>No Indexable</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
