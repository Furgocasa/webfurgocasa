"use client";

import { LocalizedLink } from "@/components/localized-link";
import { Snowflake, Tag, Mail, Phone, Copy, Check, Clock, Calendar, Ticket, Gift, Zap, Shield, Map, Smile, MousePointer, CreditCard, PartyPopper, AlertCircle, CalendarClock, Percent, Truck, TrendingDown, Loader2, Users, Moon } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useState, useEffect } from "react";
import Image from "next/image";
import { SummerBanner } from "./summer-banner";

interface LastMinuteOffer {
  id: string;
  vehicle_id: string;
  vehicle_name: string;
  vehicle_slug: string;
  vehicle_image_url: string | null;
  vehicle_brand: string;
  vehicle_model: string;
  vehicle_seats: number;
  vehicle_beds: number;
  vehicle_internal_code: string;
  offer_start_date: string;
  offer_end_date: string;
  offer_days: number;
  original_price_per_day: number;
  discount_percentage: number;
  final_price_per_day: number;
  total_original_price: number;
  total_final_price: number;
  savings: number;
  pickup_location_id: string;
  pickup_location_name: string;
  pickup_location_address: string;
  dropoff_location_id: string;
  dropoff_location_name: string;
  dropoff_location_address: string;
}

export function OfertasClient() {
  const { t, locale } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [lastMinuteOffers, setLastMinuteOffers] = useState<LastMinuteOffer[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(true);

  useEffect(() => {
    fetchLastMinuteOffers();
  }, []);

  const fetchLastMinuteOffers = async () => {
    try {
      const response = await fetch('/api/offers/last-minute');
      const data = await response.json();
      setLastMinuteOffers(data.offers || []);
    } catch (error) {
      console.error('Error fetching last minute offers:', error);
    } finally {
      setLoadingOffers(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(locale === 'en' ? 'en-US' : 'es-ES', {
      day: 'numeric',
      month: 'short',
      timeZone: 'Europe/Madrid'
    });
  };

  const formatPrice = (price: number) => {
    // Siempre formato español: 1.234,56 € (separador miles: punto, decimales: coma)
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true
    }).format(numPrice);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText("INV2026");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const benefits = [
    { icon: <Zap className="w-8 h-8 text-yellow-500" />, title: "Flota Moderna", desc: "Autocaravanas nuevas y totalmente equipadas para tu comodidad" },
    { icon: <Snowflake className="w-8 h-8 text-blue-400" />, title: "Calefacción Total", desc: "Disfruta del invierno con calefacción estacionaria en todas las campers" },
    { icon: <Map className="w-8 h-8 text-green-500" />, title: "Libertad Total", desc: "Viaja a tu ritmo. Norte, sur, playa, montaña... ¡Tú decides!" },
    { icon: <Phone className="w-8 h-8 text-furgocasa-blue" />, title: "Asistencia 24/7", desc: "Soporte técnico siempre disponible durante todo tu viaje" },
    { icon: <Shield className="w-8 h-8 text-purple-500" />, title: "Sin Sorpresas", desc: "Precio final transparente. Todo incluido desde el principio" },
    { icon: <Smile className="w-8 h-8 text-orange-500" />, title: "Experiencia Única", desc: "Vive momentos inolvidables. Este será TU mejor invierno" },
  ];

  return (
    <main className="min-h-screen bg-gray-50 font-amiko">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-furgocasa-blue via-furgocasa-blue-dark to-gray-900 py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-block mb-6 p-4 bg-white/10 backdrop-blur-md rounded-full animate-bounce">
            <Gift className="h-16 w-16 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6 leading-tight">
            {t("¿Buscas alquilar al mejor precio?")}
          </h1>
          <p className="text-2xl md:text-3xl text-blue-100 font-light tracking-wide max-w-3xl mx-auto">
            {t("Consulta nuestras OFERTAS especiales y viaja barato")}
          </p>
        </div>
      </section>

      {/* Intro - Dos tipos de ofertas */}
      <section className="py-20 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
                {t("Dos formas de ahorrar en tu alquiler")}
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                {t("En FURGOCASA queremos que todos puedan disfrutar de la aventura camper. Por eso ofrecemos dos tipos de ofertas:")}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              {/* Tipo 1: Cupones de Temporada - Enlace ancla */}
              <a 
                href="#cupones"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('cupones')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-gradient-to-br from-furgocasa-blue/5 to-furgocasa-blue/10 rounded-3xl p-8 border border-furgocasa-blue/20 hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-furgocasa-blue rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Ticket className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-heading font-bold text-gray-900 group-hover:text-furgocasa-blue transition-colors">{t("Cupones de Temporada")}</h3>
                    <p className="text-sm text-furgocasa-blue font-medium">{t("Códigos promocionales")}</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  {t("Promociones especiales con códigos de descuento que se aplican durante el proceso de reserva. Pueden ser de temporada (ej: invierno, Black Friday) o personalizados.")}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Percent className="w-4 h-4" />
                    <span>{t("Descuento sobre el precio total")}</span>
                  </div>
                  <span className="text-furgocasa-blue font-medium text-sm group-hover:translate-x-1 transition-transform">
                    {t("Ver")} →
                  </span>
                </div>
              </a>

              {/* Tipo 2: Ofertas de Última Hora - Enlace ancla */}
              <a 
                href="#ultima-hora"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('ultima-hora')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-gradient-to-br from-furgocasa-orange/5 to-furgocasa-orange/10 rounded-3xl p-8 border border-furgocasa-orange/20 hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-furgocasa-orange rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <CalendarClock className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-heading font-bold text-gray-900 group-hover:text-furgocasa-orange transition-colors">{t("Ofertas de Última Hora")}</h3>
                    <p className="text-sm text-furgocasa-orange font-medium">{t("Huecos entre reservas")}</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  {t("En temporada alta, cuando hay periodos mínimos de alquiler (ej: 7 días en verano), pueden quedar pequeños huecos entre reservas que ofrecemos con descuentos especiales.")}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{t("Fechas específicas con precio reducido")}</span>
                  </div>
                  <span className="text-furgocasa-orange font-medium text-sm group-hover:translate-x-1 transition-transform">
                    {t("Ver")} →
                  </span>
                </div>
              </a>
            </div>

            <div className="mt-10 bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-500">
                  <p className="mb-2">
                    <strong className="text-gray-700">{t("Esta página se actualiza regularmente.")}</strong> {t("Te recomendamos visitarla de vez en cuando para encontrar tu oportunidad.")}
                  </p>
                  <p className="italic">
                    {t("* Las ofertas de esta sección no son acumulables entre sí.")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 1: CUPONES DE TEMPORADA */}
      <section id="cupones" className="py-6 bg-gray-100 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3">
            <Ticket className="w-5 h-5 text-furgocasa-blue" />
            <h2 className="text-lg md:text-xl font-heading font-bold text-gray-700 uppercase tracking-wider">
              {t("Cupones de Temporada Activos")}
            </h2>
          </div>
        </div>
      </section>

      {/* Oferta Verano 2026 (Diseño Original Animado) */}
      <SummerBanner />

      {/* Cómo usar el cupón */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 bg-furgocasa-blue/10 text-furgocasa-blue rounded-full text-sm font-bold tracking-wider uppercase mb-4">
                {t("Fácil y rápido")}
              </span>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900">
                {t("¿Cómo usar tu código de descuento?")}
              </h2>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              {/* Paso 1 */}
              <div className="relative">
                <div className="bg-gray-50 rounded-2xl p-6 text-center h-full border border-gray-100 hover:border-furgocasa-blue/30 hover:shadow-lg transition-all">
                  <div className="w-12 h-12 bg-furgocasa-blue text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    1
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Copy className="w-5 h-5 text-furgocasa-blue" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{t("Copia el código")}</h3>
                  <p className="text-sm text-gray-600">{t("Haz clic en el código de arriba para copiarlo")}</p>
                </div>
                <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-gray-300 text-2xl z-10">→</div>
              </div>

              {/* Paso 2 */}
              <div className="relative">
                <div className="bg-gray-50 rounded-2xl p-6 text-center h-full border border-gray-100 hover:border-furgocasa-blue/30 hover:shadow-lg transition-all">
                  <div className="w-12 h-12 bg-furgocasa-blue text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    2
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Calendar className="w-5 h-5 text-furgocasa-blue" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{t("Elige fechas")}</h3>
                  <p className="text-sm text-gray-600">{t("Selecciona vehículo y fechas (mín. 5 días)")}</p>
                </div>
                <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-gray-300 text-2xl z-10">→</div>
              </div>

              {/* Paso 3 */}
              <div className="relative">
                <div className="bg-gray-50 rounded-2xl p-6 text-center h-full border border-gray-100 hover:border-furgocasa-blue/30 hover:shadow-lg transition-all">
                  <div className="w-12 h-12 bg-furgocasa-blue text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    3
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Ticket className="w-5 h-5 text-furgocasa-blue" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{t("Aplica el cupón")}</h3>
                  <p className="text-sm text-gray-600">{t("En el paso de confirmación, pega el código")}</p>
                </div>
                <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-gray-300 text-2xl z-10">→</div>
              </div>

              {/* Paso 4 */}
              <div className="relative">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 text-center h-full border border-green-200 hover:shadow-lg transition-all">
                  <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    <Check className="w-6 h-6" />
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <PartyPopper className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{t("¡Descuento aplicado!")}</h3>
                  <p className="text-sm text-gray-600">{t("Verás el -15% reflejado en tu precio final")}</p>
                </div>
              </div>
            </div>

            <div className="mt-10 text-center">
              <LocalizedLink
                href="/reservar"
                className="inline-flex items-center gap-3 bg-furgocasa-blue hover:bg-furgocasa-blue-dark text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <Ticket className="w-5 h-5" />
                {t("Empezar reserva con descuento")}
              </LocalizedLink>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 2: OFERTAS DE ÚLTIMA HORA */}
      <section id="ultima-hora" className="py-6 bg-gray-100 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3">
            <CalendarClock className="w-5 h-5 text-furgocasa-orange" />
            <h2 className="text-lg md:text-xl font-heading font-bold text-gray-700 uppercase tracking-wider">
              {t("Ofertas de Última Hora")}
            </h2>
          </div>
        </div>
      </section>

      {/* Ofertas de Última Hora - Contenido */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Explicación */}
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 mb-8">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="w-16 h-16 bg-furgocasa-orange/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <CalendarClock className="w-8 h-8 text-furgocasa-orange" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-heading font-bold text-gray-900 mb-4">
                    {t("¿Qué son las Ofertas de Última Hora?")}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {t("En temporada alta (verano, Semana Santa...) aplicamos periodos mínimos de alquiler (por ejemplo, 7 días en agosto). Esto puede generar pequeños huecos entre reservas que no cumplen el mínimo.")}
                  </p>
                  <div className="bg-furgocasa-orange/5 rounded-xl p-4 border border-furgocasa-orange/20">
                    <p className="text-gray-700 font-medium flex items-start gap-2">
                      <span className="text-lg">💡</span>
                      <span>{t("Ejemplo: Si un alquiler termina el 15 de agosto y el siguiente empieza el 20, esos 5 días no se pueden alquilar normalmente. ¡Pero los ofrecemos con descuento especial!")}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ofertas disponibles o mensaje de no disponible */}
            {loadingOffers ? (
              <div className="bg-gray-50 rounded-3xl p-10 md:p-14 text-center border border-gray-200">
                <Loader2 className="w-10 h-10 text-furgocasa-orange animate-spin mx-auto mb-4" />
                <p className="text-gray-500">{t("Cargando ofertas...")}</p>
              </div>
            ) : lastMinuteOffers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {lastMinuteOffers.map((offer) => (
                  <div 
                    key={offer.id}
                    className="group bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                  >
                    {/* Imagen del vehículo */}
                    <LocalizedLink href={`/reservar/oferta/${offer.id}`} className="block">
                      <div className="h-64 relative bg-gray-100 overflow-hidden">
                        {offer.vehicle_image_url ? (
                          <Image
                            src={offer.vehicle_image_url}
                            alt={offer.vehicle_name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Truck className="w-16 h-16 text-gray-300" />
                          </div>
                        )}
                        {/* Badge de descuento */}
                        <div className="absolute top-4 left-4 bg-furgocasa-orange text-white px-3 py-1.5 rounded-full font-bold text-sm shadow-lg">
                          -{offer.discount_percentage}%
                        </div>
                      </div>
                    </LocalizedLink>

                    {/* Contenido */}
                    <div className="p-6">
                      <LocalizedLink href={`/reservar/oferta/${offer.id}`}>
                        <h4 className="text-xl font-heading font-bold text-gray-900 mb-1 group-hover:text-furgocasa-orange transition-colors">
                          {offer.vehicle_name}
                        </h4>
                        <p className="text-sm text-gray-500 mb-3">
                          {offer.vehicle_brand} {offer.vehicle_model}
                        </p>
                      </LocalizedLink>
                      
                      {/* Características y fechas */}
                      <div className="flex flex-wrap gap-2 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1.5 bg-blue-50 px-2.5 py-1 rounded-full text-furgocasa-blue">
                          <Users className="w-4 h-4" />
                          {offer.vehicle_seats} {t("plazas")}
                        </span>
                        <span className="flex items-center gap-1.5 bg-blue-50 px-2.5 py-1 rounded-full text-furgocasa-blue">
                          <Moon className="w-4 h-4" />
                          {offer.vehicle_beds} {t("plazas noche")}
                        </span>
                        <span className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-full">
                          <Calendar className="w-4 h-4 text-furgocasa-blue" />
                          {formatDate(offer.offer_start_date)} - {formatDate(offer.offer_end_date)}
                        </span>
                        <span className="flex items-center gap-1.5 bg-furgocasa-orange/10 px-2.5 py-1 rounded-full text-furgocasa-orange font-medium">
                          <Clock className="w-4 h-4" />
                          {offer.offer_days} {t("días")}
                        </span>
                      </div>
                      {offer.pickup_location_name && (
                        <p className="text-xs text-gray-500 mb-4 flex items-center gap-1.5">
                          <Map className="w-4 h-4 text-green-600" />
                          {offer.pickup_location_name}
                        </p>
                      )}

                      {/* Precios y CTA */}
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-gray-400 line-through text-sm">
                            {formatPrice(offer.total_original_price)}
                          </span>
                          <span className="text-green-600 text-xs font-medium bg-green-50 px-2 py-0.5 rounded">
                            {t("Ahorras")} {formatPrice(offer.savings)}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2 mb-4">
                          <span className="text-2xl font-bold text-gray-900">
                            {formatPrice(offer.total_final_price)}
                          </span>
                          <span className="text-gray-500 text-sm">
                            ({formatPrice(offer.final_price_per_day)}/{t("día")})
                          </span>
                        </div>
                        <LocalizedLink
                          href={`/reservar/oferta/${offer.id}`}
                          className="flex items-center justify-center gap-2 w-full bg-furgocasa-orange hover:bg-furgocasa-orange-dark text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg"
                        >
                          <CalendarClock className="w-5 h-5" />
                          {t("Reservar ahora")}
                        </LocalizedLink>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-3xl p-10 md:p-14 text-center border-2 border-dashed border-gray-200">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-10 h-10 text-gray-400" />
                </div>
                <h4 className="text-xl font-heading font-bold text-gray-700 mb-3">
                  {t("No hay ofertas de última hora disponibles")}
                </h4>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  {t("Actualmente no tenemos huecos disponibles entre reservas. Esta sección se actualiza regularmente, ¡vuelve a visitarnos pronto!")}
                </p>
                <div className="inline-flex items-center gap-2 text-sm text-furgocasa-blue font-medium">
                  <Clock className="w-4 h-4" />
                  {t("Las ofertas de última hora suelen aparecer en temporada alta")}
                </div>
              </div>
            )}

            {/* Tip de notificación */}
            <div className="mt-8 bg-blue-50 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-4">
              <div className="w-12 h-12 bg-furgocasa-blue rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div className="text-center md:text-left">
                <p className="text-gray-700 font-medium">
                  {t("¿Quieres que te avisemos cuando haya ofertas?")}
                </p>
                <p className="text-gray-500 text-sm">
                  {t("Escríbenos a")} <a href="mailto:info@furgocasa.com" className="text-furgocasa-blue hover:underline">info@furgocasa.com</a> {t("y te incluiremos en nuestra lista de alertas.")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Por qué elegir Furgocasa */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-center text-gray-900 mb-16">
            {t("¿POR QUÉ ELEGIR FURGOCASA?")}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="group bg-gray-50 rounded-[2rem] p-10 hover:bg-white hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-furgocasa-blue/20 flex flex-col items-center text-center">
                <div className="mb-6 p-4 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-heading font-bold text-gray-900 mb-4 group-hover:text-furgocasa-blue transition-colors">
                  {t(benefit.title)}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {t(benefit.desc)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <LocalizedLink
              href="/reservar"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-furgocasa-orange to-furgocasa-orange-dark text-white font-bold text-xl py-5 px-12 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              {t("¡EMPEZAR AHORA!")} <Zap className="w-5 h-5 fill-current" />
            </LocalizedLink>
          </div>
        </div>
      </section>
    </main>
  );
}
