"use client";

import { LocalizedLink } from "@/components/localized-link";
import { 
  CheckCircle, Calendar, Euro, Shield, FileText, AlertCircle, Percent, 
  User, Clock, RefreshCw, Lock, CreditCard, XCircle, Info, Download
} from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { SeasonsCalendar } from "@/components/seasons-calendar";

const pricingTable = [
  { season: "Baja", lessThanWeek: "95,00", oneWeek: "85,00", twoWeeks: "75,00", threeWeeks: "65,00" },
  { season: "Media", lessThanWeek: "125,00", oneWeek: "115,00", twoWeeks: "105,00", threeWeeks: "95,00" },
  { season: "Alta", lessThanWeek: "155,00", oneWeek: "145,00", twoWeeks: "135,00", threeWeeks: "125,00" },
];

const discounts = [
  { percentage: "hasta -10%", description: "Alquileres de 7 días o más (Temp. Baja)", icon: "📅" },
  { percentage: "hasta -20%", description: "Alquileres de 14 días o más (Temp. Baja)", icon: "🗓️" },
  { percentage: "hasta -30%", description: "Alquileres de 21 días o más (Temp. Baja)", icon: "🔥" },
];

const includedFree = [
  "Kilómetros ilimitados",
  "Conductor/es adicional/es",
  "Utensilios de cocina completos",
  "Kit de camping (mesa y sillas)",
  "Derecho a desistir los primeros 14 días",
  "Cancelación gratuita hasta 60 días antes",
];

const extrasOptional = [
  { name: "Sábanas y almohadas", price: "30,00 €", per: "viaje" },
  { name: "Edredón invierno", price: "20,00 €", per: "viaje" },
  { name: "Toallas de baño", price: "20,00 €", per: "viaje" },
  { name: "Mascotas permitidas", price: "40,00 €", per: "viaje" },
  { name: "Aparcamiento en Murcia", price: "10,00 €", per: "día" },
  { name: "2ª cama (4 plazas)", price: "10,00 €", per: "día" },
];

const cancellationPolicy = [
  { period: "Más de 60 días antes", charge: "GRATIS", color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
  { period: "Entre 59 y 16 días antes", charge: "10% del total", color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200" },
  { period: "Entre 15 y 8 días antes", charge: "50% del total", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
  { period: "Menos de 7 días antes", charge: "75% del total", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
];

const returnFees = [
  { service: "Vaciado aguas grises", price: "20,00 €", note: "IVA incluido" },
  { service: "Vaciado WC químico", price: "70,00 €", note: "IVA incluido" },
  { service: "Limpieza interior", price: "Desde 120,00 €", note: "IVA incluido" },
];

export function TarifasClient() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  
  return (
    <main className="min-h-screen bg-gray-50 font-amiko">
      {/* Hero Section - Modernizado */}
      <section className="bg-gradient-to-br from-furgocasa-blue via-furgocasa-blue-dark to-gray-900 py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('/images/pattern.png')]"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6">
            {t("Tarifas y Condiciones")}
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto font-light leading-relaxed">
            {t("Información clara y transparente sobre precios, requisitos y condiciones de alquiler de nuestras autocaravanas")}
          </p>
        </div>
      </section>

      {/* Tabla de Tarifas - Modernizado */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
              {t("Precios de alquiler")}
            </h2>
            <p className="text-gray-600 text-lg">
              {t("Tarifas orientativas por día según temporada")}
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            {/* Nota importante */}
            <div className="mb-8 bg-orange-50 border border-orange-200 p-4 rounded-xl flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0" />
              <p className="text-sm text-orange-800">
                <strong>{t("Nota importante:")}</strong> {t("Estos precios son orientativos y pueden variar hasta un ±20% en función de la demanda. Para conocer el precio exacto de tus fechas, realiza una búsqueda en nuestro buscador.")}
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl shadow-xl border border-gray-100 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="bg-furgocasa-blue text-white">
                      <th className="py-3 md:py-6 px-2 md:px-6 text-left font-heading font-bold text-xs md:text-lg border-r border-blue-800/30">
                        {t("Temporada")}
                      </th>
                      <th className="py-3 md:py-6 px-2 md:px-6 text-center font-heading font-bold text-xs md:text-base border-r border-blue-800/30 bg-white/5">
                        <span className="hidden md:inline">{t("Menos de una semana")}</span>
                        <span className="md:hidden">&lt;7d</span>
                      </th>
                      <th className="py-3 md:py-6 px-2 md:px-6 text-center font-heading font-bold text-xs md:text-base border-r border-blue-800/30 bg-white/10">
                        <span className="hidden md:inline">{t("Al menos una semana")}</span>
                        <span className="md:hidden">7d+</span>
                      </th>
                      <th className="py-3 md:py-6 px-2 md:px-6 text-center font-heading font-bold text-xs md:text-base border-r border-blue-800/30 bg-white/5">
                        <span className="hidden md:inline">{t("Al menos dos semanas")}</span>
                        <span className="md:hidden">14d+</span>
                      </th>
                      <th className="py-3 md:py-6 px-2 md:px-6 text-center font-heading font-bold text-xs md:text-base bg-white/10">
                        <span className="hidden md:inline">{t("Al menos 3 semanas")}</span>
                        <span className="md:hidden">21d+</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pricingTable.map((row, index) => (
                      <tr key={row.season} className={`group hover:bg-blue-50/50 transition-colors ${index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}`}>
                        <td className="py-3 md:py-6 px-2 md:px-6 font-bold text-gray-900 border-r border-gray-100">
                          <div className="flex items-center gap-1 md:gap-2">
                            <span className={`w-2 md:w-3 h-2 md:h-3 rounded-full flex-shrink-0 ${
                              row.season === "Baja" ? "bg-furgocasa-blue" : 
                              row.season === "Media" ? "bg-furgocasa-orange" : "bg-red-500"
                            }`}></span>
                            <span className="text-sm md:text-base">{t(row.season)}</span>
                          </div>
                        </td>
                        <td className="py-3 md:py-6 px-2 md:px-6 text-center text-gray-600 font-bold text-sm md:text-xl border-r border-gray-100 group-hover:text-furgocasa-blue transition-colors">
                          {row.lessThanWeek}€
                        </td>
                        <td className="py-3 md:py-6 px-2 md:px-6 text-center text-furgocasa-blue font-bold text-base md:text-2xl border-r border-gray-100 bg-furgocasa-blue/5">
                          {row.oneWeek}€
                        </td>
                        <td className="py-3 md:py-6 px-2 md:px-6 text-center text-gray-600 font-bold text-sm md:text-xl border-r border-gray-100 group-hover:text-furgocasa-blue transition-colors">
                          {row.twoWeeks}€
                        </td>
                        <td className="py-3 md:py-6 px-2 md:px-6 text-center text-gray-600 font-bold text-sm md:text-xl group-hover:text-furgocasa-blue transition-colors">
                          {row.threeWeeks}€
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          {/* Información adicional */}
          <div className="mt-12 max-w-4xl mx-auto bg-white rounded-2xl p-8 border border-gray-100 shadow-lg">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-furgocasa-blue" />
                  {t("Información general")}
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">• {t("Los precios se devengan por períodos completos de 24 horas")}</li>
                  <li className="flex items-start gap-2">• {t("Los descuentos se aplican automáticamente según la duración del alquiler")}</li>
                </ul>
              </div>
              <div>
                 <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-furgocasa-blue" />
                  {t("Método de pago")}
                </h4>
                <p className="text-sm text-gray-700">
                  {t("El método de pago aceptado será el pago con tarjeta de débito o crédito a través de nuestra pasarela de pago segura Redsys.")}
                </p>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-200 grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold text-gray-900 mb-2">{t("Vehículos de 4 plazas:")}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {t("En relación a los vehículos de hasta 4 plazas de noche, con dos camas, en el caso de que se desee incluir el colchón de la segunda cama y, por tanto, disfrutar de la posibilidad de que duerman hasta 4 personas, los precios anteriormente mostrados se incrementarán en 10,00 euros día, debiendo el cliente incluir el referido extra de alquiler en el momento de hacer la reserva.")}
                </p>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">{t("Modificación de fechas:")}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {t("En el caso de que, habiéndose realizado una reserva previa, el cliente ejerza el derecho de modificación de fechas de su alquiler y el precio para estos nuevos días haya variado al alza o a la baja, siempre que la reserva se cambie dentro de la misma \"Temporada\", se mantendrá el precio día inicialmente contratado. En caso de que la modificación se realice a temporada distinta, se tendrán en cuenta para el ajuste los precios orientativos mostrados en esta tabla.")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Descuentos por duración - Modernizado */}
      <section id="descuentos" className="py-24 bg-gradient-to-br from-furgocasa-blue to-furgocasa-blue-dark text-white relative overflow-hidden scroll-mt-20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-furgocasa-orange/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              {t("Descuentos por duración del alquiler")}
            </h2>
            <p className="text-blue-100 text-lg">
              {t("Cuanto más largo sea tu viaje, mejor será el precio")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
            {discounts.map((discount, index) => (
              <div 
                key={index} 
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 text-center hover:bg-white/20 hover:scale-105 transition-all duration-300 shadow-xl"
              >
                <div className="text-4xl mb-4">{discount.icon}</div>
                <div className="text-6xl font-heading font-bold text-white mb-4 tracking-tight drop-shadow-lg">{discount.percentage}</div>
                <p className="text-white font-medium text-lg px-4 py-2 bg-white/10 rounded-full inline-block">{t(discount.description)}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <LocalizedLink 
              href="/reservar" 
              className="inline-block bg-white text-furgocasa-blue font-bold text-lg py-4 px-10 rounded-full hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              {t("Consultar precio para mis fechas")}
            </LocalizedLink>
          </div>
        </div>
      </section>

      {/* Extras y Accesorios - Modernizado */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
              {t("Extras y accesorios")}
            </h2>
            <p className="text-gray-600 text-lg">
              {t("Qué está incluido en el precio y qué tiene coste adicional")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Incluido sin coste */}
            <div className="bg-green-50/50 border border-green-200 rounded-3xl p-8 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-green-100 p-3 rounded-2xl">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-heading font-bold text-green-800">
                    {t("Incluido sin coste")}
                  </h3>
                  <p className="text-green-700 text-sm">
                    {t("Todo lo necesario para que disfrutes al máximo de tu viaje")}
                  </p>
                </div>
              </div>
              
              <ul className="space-y-4">
                {includedFree.map((item) => (
                  <li key={item} className="flex items-start gap-3 bg-white p-4 rounded-xl shadow-sm">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 font-medium">{t(item)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Extras opcionales */}
            <div className="bg-blue-50/50 border border-blue-200 rounded-3xl p-8 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-blue-100 p-3 rounded-2xl">
                  <Euro className="h-8 w-8 text-furgocasa-blue" />
                </div>
                <div>
                  <h3 className="text-2xl font-heading font-bold text-furgocasa-blue">
                    {t("Extras opcionales")}
                  </h3>
                  <p className="text-blue-700 text-sm">
                    {t("Complementos adicionales para mayor comodidad")}
                  </p>
                </div>
              </div>

              <ul className="space-y-4">
                {extrasOptional.map((item) => (
                  <li key={item.name} className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm">
                    <span className="text-gray-700 font-medium">{t(item.name)}</span>
                    <span className="bg-furgocasa-blue/10 text-furgocasa-blue px-3 py-1 rounded-lg font-bold text-sm">
                      {item.price} / {t(item.per)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Destacados */}
          <div className="mt-12 max-w-4xl mx-auto bg-yellow-50 border border-yellow-200 rounded-2xl p-6 md:p-8 flex items-start gap-4">
            <Info className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-yellow-800 mb-3 text-lg">{t("Destacados")}</h4>
              <ul className="grid md:grid-cols-2 gap-3 text-sm text-yellow-900 font-medium">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div> {t("Derecho a desistir los primeros 14 días sin cargo alguno")}</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div> {t("Cancelación gratuita hasta 60 días antes del inicio")}</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div> {t("Kilómetros ilimitados en todos nuestros alquileres")}</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div> {t("Aparcamiento solo disponible a partir de 4 días de alquiler (sede Murcia)")}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pasos del alquiler - Barra de tiempo */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
              {t("Pasos del alquiler")}
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              {t("Así es el proceso de reserva de tu camper paso a paso")}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
            {[
              { paso: "1", titulo: t("Busca fechas y modelo"), descripcion: t("Selecciona tus fechas y escoge tu modelo de camper en nuestro buscador") },
              { paso: "2", titulo: t("Confirma con el primer pago"), descripcion: t("Para confirmar la reserva se abona la primera mitad del importe") },
              { paso: "3", titulo: t("Segundo pago"), descripcion: t("15 días antes del comienzo se abona la segunda mitad") },
              { paso: "4", titulo: t("Documentación y contrato"), descripcion: t("Entre el día 15 y el 3 antes del inicio se envía documentación y contrato firmado") },
              { paso: "5", titulo: t("Fianza"), descripcion: t("Máximo 72 horas (3 días antes del inicio) se debe abonar la fianza de 1.000€") },
              { paso: "6", titulo: t("Confirmación de entrega"), descripcion: t("Con todo verificado: se confirma la cita de entrega") },
            ].map((item) => (
              <div key={item.paso} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-furgocasa-orange text-white rounded-full flex items-center justify-center font-bold text-lg mb-3">
                  {item.paso}
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{item.titulo}</h3>
                <p className="text-sm text-gray-600">{item.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Temporadas - Calendarios - Modernizado */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
              {t("Temporadas de alquiler")}
            </h2>
            <p className="text-gray-600 text-lg mb-6">
              {t("Consulta nuestro calendario para planificar tu viaje")}
            </p>
            
            {/* Leyenda de colores */}
            <div className="flex flex-wrap justify-center gap-6 mt-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white border-2 border-gray-300 rounded"></div>
                <span className="text-sm font-medium text-gray-700">Low Season</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-200 border-2 border-orange-300 rounded"></div>
                <span className="text-sm font-medium text-gray-700">Mid Season</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-200 border-2 border-red-300 rounded"></div>
                <span className="text-sm font-medium text-gray-700">High Season</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-12 max-w-7xl mx-auto">
            {/* Calendario Año Actual - Solo meses restantes */}
            <div className="bg-gray-50 rounded-3xl p-6 md:p-8 shadow-inner">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-heading font-bold text-furgocasa-blue bg-white py-3 px-6 rounded-xl shadow-sm inline-block">
                  {t("Calendario")} {currentYear}
                </h3>
                <p className="text-sm text-gray-600 mt-2">
                  {t("Meses disponibles para reserva")}
                </p>
              </div>
              <SeasonsCalendar year={currentYear} hidePassedMonths={true} />
            </div>

            {/* Calendario Año Siguiente - Todos los meses - OCULTO HASTA SEPTIEMBRE 2026
            <div className="bg-gray-50 rounded-3xl p-6 md:p-8 shadow-inner">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-heading font-bold text-furgocasa-blue bg-white py-3 px-6 rounded-xl shadow-sm inline-block">
                  {t("Calendario")} {nextYear}
                </h3>
                <p className="text-sm text-gray-600 mt-2">
                  {t("Planifica tu viaje con anticipación")}
                </p>
              </div>
              <SeasonsCalendar year={nextYear} hidePassedMonths={false} />
            </div>
            */}
          </div>
        </div>
      </section>

      {/* Requisitos del conductor - Modernizado */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
              {t("Requisitos del conductor")}
            </h2>
            <p className="text-gray-600 text-lg">
              {t("Todo lo que necesitas para alquilar una camper con nosotros")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow text-center border-b-4 border-furgocasa-blue">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">👤</div>
              <h3 className="font-heading font-bold text-xl text-gray-900 mb-3">
                {t("Edad mínima")}
              </h3>
              <p className="text-gray-600 mb-4 font-medium">
                {t("El conductor principal y cada conductor adicional deben tener un mínimo de 25 años de edad.")}
              </p>
              <span className="inline-block bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wide">
                {t("Máximo 2 conductores")}
              </span>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow text-center border-b-4 border-furgocasa-orange">
              <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">🚗</div>
              <h3 className="font-heading font-bold text-xl text-gray-900 mb-3">
                {t("Permiso de conducción")}
              </h3>
              <p className="text-gray-600 mb-4 font-medium">
                {t("Carnet de conducir tipo B en vigor, con una antigüedad mínima de 2 años.")}
              </p>
              <span className="inline-block bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wide">
                {t("Permiso internacional si no UE")}
              </span>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow text-center border-b-4 border-green-500">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">📋</div>
              <h3 className="font-heading font-bold text-xl text-gray-900 mb-3">
                {t("Documentación")}
              </h3>
              <p className="text-gray-600 mb-4 font-medium">
                {t("Debes enviar copia del DNI/Pasaporte y del carnet de conducir antes del inicio del alquiler.")}
              </p>
              <a href="mailto:reservas@furgocasa.com" className="inline-block text-furgocasa-blue font-bold text-sm hover:underline">
                reservas@furgocasa.com
              </a>
            </div>
          </div>

          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
             {/* Documentación necesaria */}
            <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100">
              <h3 className="font-heading font-bold text-xl text-gray-900 mb-6 flex items-center gap-3">
                <FileText className="h-6 w-6 text-furgocasa-blue" />
                {t("Checklist Documentación")}
              </h3>
              <ul className="space-y-4">
                <li className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                  <span className="text-2xl">🆔</span>
                  <div>
                    <strong className="block text-gray-900">{t("DNI o Pasaporte")}</strong>
                    <span className="text-xs text-gray-500 uppercase font-bold tracking-wide">{t("en vigor")}</span>
                  </div>
                </li>
                <li className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                  <span className="text-2xl">🪪</span>
                  <div>
                    <strong className="block text-gray-900">{t("Carnet de conducir")}</strong>
                    <span className="text-xs text-gray-500 uppercase font-bold tracking-wide">{t("ambas caras")}</span>
                  </div>
                </li>
                <li className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                  <span className="text-2xl">🌍</span>
                  <div>
                    <strong className="block text-gray-900">{t("Permiso internacional")}</strong>
                    <span className="text-xs text-gray-500 uppercase font-bold tracking-wide">{t("No residentes UE")}</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Advertencia */}
            <div className="bg-red-50 border border-red-100 p-8 rounded-2xl flex flex-col justify-center">
              <h4 className="font-bold text-red-800 mb-4 flex items-center gap-2 text-xl">
                <AlertCircle className="h-6 w-6" />
                {t("Importante")}
              </h4>
              <p className="text-red-900/80 leading-relaxed font-medium">
                {t("Si realizas una reserva y, tras aportar la documentación, no acreditas el cumplimiento de los requisitos, el alquiler será cancelado y se aplicará una comisión de gestión de 40€ (IVA incluido).")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Duración del alquiler - Modernizado */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
              {t("Duración del alquiler")}
            </h2>
            <p className="text-gray-600 text-lg">
              {t("Mínimos establecidos según temporada")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
            <div className="bg-white border-2 border-blue-100 rounded-3xl p-8 text-center hover:border-blue-500 transition-colors group">
              <h3 className="font-heading font-bold text-lg text-gray-500 mb-4 uppercase tracking-wider group-hover:text-blue-600 transition-colors">
                {t("Temp. Baja y Media")}
              </h3>
              <div className="text-6xl font-heading font-bold text-furgocasa-blue mb-2 group-hover:scale-110 transition-transform duration-300">2</div>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">{t("Días Mínimo")}</p>
            </div>

            <div className="bg-white border-2 border-orange-100 rounded-3xl p-8 text-center hover:border-orange-500 transition-colors group">
              <h3 className="font-heading font-bold text-lg text-gray-500 mb-4 uppercase tracking-wider group-hover:text-orange-600 transition-colors">
                {t("Temporada Alta")}
              </h3>
              <div className="text-6xl font-heading font-bold text-furgocasa-orange mb-2 group-hover:scale-110 transition-transform duration-300">7</div>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">{t("Días Mínimo")}</p>
            </div>

            <div className="bg-white border-2 border-green-100 rounded-3xl p-8 text-center hover:border-green-500 transition-colors group">
              <h3 className="font-heading font-bold text-lg text-gray-500 mb-4 uppercase tracking-wider group-hover:text-green-600 transition-colors">
                {t("Duración máxima")}
              </h3>
              <div className="text-6xl font-heading font-bold text-green-600 mb-2 group-hover:scale-110 transition-transform duration-300">89</div>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">{t("Días Máximo")}</p>
            </div>
          </div>

          <div className="max-w-3xl mx-auto bg-gray-50 rounded-2xl p-8 flex items-start gap-4 shadow-inner">
            <div className="bg-white p-3 rounded-full shadow-sm">
              <Clock className="h-6 w-6 text-furgocasa-blue" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-2 text-lg">{t("Cálculo de días (24h)")}</h4>
              <p className="text-gray-600 leading-relaxed">
                {t("El período de alquiler comienza con la entrega del vehículo a la hora acordada y finaliza con la devolución de las llaves al personal de Furgocasa. Los días se devengan por periodos completos de 24 horas.")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Política de cancelación - Modernizado */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-center text-gray-900 mb-16">
            {t("Política de cancelación")}
          </h2>

          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-6 mb-12">
              {cancellationPolicy.map((item, index) => (
                <div key={index} className={`rounded-2xl p-8 text-center shadow-lg border-t-8 ${item.border} bg-white`}>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 h-10 flex items-center justify-center">{item.period}</p>
                  <p className={`text-3xl font-heading font-bold ${item.color}`}>{item.charge}</p>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Cancellation Insurance */}
              <div className="bg-blue-600 text-white rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/3 -translate-y-1/3">
                  <Shield className="w-64 h-64" />
                </div>
                <div className="relative z-10">
                  <h4 className="font-heading font-bold text-xl mb-3 flex items-center gap-3">
                    <Shield className="h-6 w-6 text-blue-300" />
                    {t("Seguro de Cancelación")}
                  </h4>
                  <p className="text-blue-100 text-base leading-relaxed mb-4">
                    {t("Por 5€/día (contratado al reservar), se limita el coste de cancelación en el periodo de 59 a 16 días a dicho importe.")}
                  </p>
                  <p className="text-xs text-blue-300 font-medium uppercase tracking-wide">
                    {t("* No aplica si restan menos de 16 días para el alquiler")}
                  </p>
                </div>
              </div>

              {/* Right of withdrawal */}
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                <h3 className="font-heading font-bold text-xl text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="h-6 w-6 text-furgocasa-orange" />
                  {t("Derecho de desistimiento")}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed text-sm">
                  {t("El cliente dispone de 14 días naturales del derecho a desistir del contrato de alquiler sin necesidad de justificación y sin penalización alguna.")}
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center font-bold text-green-700 text-sm">14</div>
                    <p className="text-xs text-gray-600">{t("Días desde envío de contrato/factura")}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center font-bold text-red-700 text-sm">7</div>
                    <p className="text-xs text-gray-600">{t("Días antes del viaje (límite)")}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Refund by bank transfer */}
            <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6">
              <h4 className="font-heading font-bold text-lg text-orange-900 mb-3 flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-orange-600" />
                {t("Devolución por transferencia")}
              </h4>
              <p className="text-orange-800 text-sm leading-relaxed">
                {t("En el caso de que las devoluciones, que siempre se realizarán por transferencia, conlleven alguna comisión de gestión de la transferencia, este coste será siempre asumido por el cliente, de manera que Furgocasa devolverá el importe abonado descontando dicha comisión.")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Fianza - Modernizado */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto bg-gray-900 rounded-[2.5rem] p-8 md:p-16 text-white shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-furgocasa-blue/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div className="relative z-10">
              <div className="flex flex-col md:flex-row gap-12 items-center mb-12">
                 <div className="text-center md:text-left">
                   <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">
                    {t("Fianza")}
                  </h2>
                  <p className="text-gray-400 max-w-md">
                    {t("Garantía del fiel cumplimiento del contrato mediante transferencia bancaria.")}
                  </p>
                 </div>
                 <div className="bg-furgocasa-orange text-white px-8 py-4 rounded-2xl text-center shadow-lg shadow-orange-500/20 transform rotate-3">
                   <p className="text-5xl font-heading font-bold">1.000 €</p>
                   <p className="text-sm font-bold uppercase tracking-wider opacity-90 mt-1">{t("Requerida")}</p>
                 </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <ul className="space-y-4">
                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"><CreditCard className="h-4 w-4" /></div>
                    <span>{t("Pago mediante transferencia bancaria")}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"><Clock className="h-4 w-4" /></div>
                    <span>{t("Máximo 72 horas antes del inicio")}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"><FileText className="h-4 w-4" /></div>
                    <span>{t("Enviar justificante y certificado de titularidad")}</span>
                  </li>
                </ul>
                <ul className="space-y-4">
                   <li className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"><User className="h-4 w-4" /></div>
                    <span>{t("El titular debe coincidir con el arrendatario")}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"><RefreshCw className="h-4 w-4" /></div>
                    <span>{t("Devolución en 10 días laborables")}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Puntualidad en citas de entrega / devolución */}
      <section id="puntualidad-citas" className="py-16 md:py-20 bg-gradient-to-b from-amber-50 to-orange-50/70 border-y-2 border-furgocasa-orange/25">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="rounded-3xl bg-white p-8 md:p-12 shadow-xl border-2 border-furgocasa-orange/35 ring-1 ring-orange-100/80">
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
              <div className="shrink-0 flex justify-center md:block w-full md:w-auto">
                <div className="rounded-2xl bg-furgocasa-orange/15 p-4 md:p-5 inline-flex">
                  <Clock className="h-12 w-12 md:h-14 md:w-14 text-furgocasa-orange" strokeWidth={2} aria-hidden />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-gray-900 mb-4">
                  {t("Puntualidad en las citas")}
                </h2>
                <p className="text-gray-700 text-base md:text-lg leading-relaxed mb-6">
                  {t("En Furgocasa damos una importancia muy alta a la puntualidad en las citas de entrega y devolución. Acudimos expresamente a nuestras instalaciones a la hora acordada para preparar cada vehículo. Si llegas tarde, nuestro equipo debe esperar in situ; ese tiempo tiene coste y se factura de acuerdo con las tarifas siguientes, para evitar malentendidos.")}
                </p>
                <div className="rounded-2xl bg-amber-50 border border-amber-200 p-6">
                  <h3 className="font-heading font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-700 shrink-0" aria-hidden />
                    {t("Penalizaciones por retraso en la cita")}
                  </h3>
                  <ul className="space-y-3 mb-4">
                    <li className="flex justify-between items-center text-base py-2 border-b border-amber-200/80">
                      <span className="text-gray-800 font-medium">{t("Primera hora")}</span>
                      <span className="font-heading font-bold text-furgocasa-orange text-lg">40€</span>
                    </li>
                    <li className="flex justify-between items-center text-base py-2">
                      <span className="text-gray-800 font-medium">{t("Hora adicional")}</span>
                      <span className="font-heading font-bold text-furgocasa-orange text-lg">20€</span>
                    </li>
                  </ul>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {t("Si prevés llegar tarde, avisa cuanto antes para intentar ampliar el alquiler.")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seguro y Devolución - Grid */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {/* Seguro */}
            <div className="bg-white rounded-3xl p-10 shadow-lg">
              <h2 className="text-2xl font-heading font-bold text-gray-900 mb-8 flex items-center gap-3">
                <Shield className="h-8 w-8 text-furgocasa-blue" />
                {t("Seguro a todo riesgo")}
              </h2>
              
              <div className="mb-8 text-center p-6 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-gray-500 font-medium uppercase text-xs tracking-wider mb-2">{t("Franquicia por siniestro")}</p>
                <p className="text-5xl font-heading font-bold text-furgocasa-blue">900 €</p>
              </div>

              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{t("Cobertura a todo riesgo incluida")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{t("Si el daño no alcanza 900€, asumes el coste de reparación")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{t("Si supera 900€, ese es el máximo a pagar")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{t("Franquicia independiente por cada accidente")}</span>
                </li>
              </ul>
              
              <div className="mt-8 p-4 bg-red-50 text-red-800 text-sm rounded-xl">
                <strong>{t("Importante:")}</strong> {t("Este seguro no cubre daños ocasionados cuando el vehículo no está en circulación.")}
              </div>
            </div>

            {/* Devolución y Penalizaciones */}
            <div className="space-y-8">
              <div className="bg-white rounded-3xl p-10 shadow-lg">
                <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <RefreshCw className="h-8 w-8 text-furgocasa-orange" />
                  {t("Devolución")}
                </h2>
                <p className="text-gray-600 mb-6 font-medium">
                  {t("El vehículo debe devolverse:")}
                </p>
                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1 bg-gray-100 rounded-lg text-sm text-gray-700 font-medium">{t("Limpio interiormente")}</span>
                  <span className="px-3 py-1 bg-gray-100 rounded-lg text-sm text-gray-700 font-medium">{t("Aguas grises vacías")}</span>
                  <span className="px-3 py-1 bg-gray-100 rounded-lg text-sm text-gray-700 font-medium">{t("WC químico vacío")}</span>
                  <span className="px-3 py-1 bg-gray-100 rounded-lg text-sm text-gray-700 font-medium">{t("En hora")}</span>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-100">
                   <h4 className="font-bold text-gray-900 mb-4">{t("Suplementos por incumplimiento")}</h4>
                   <div className="space-y-3">
                     {returnFees.map((fee, i) => (
                       <div key={i} className="flex justify-between items-center text-sm">
                         <span className="text-gray-600">{fee.service}</span>
                         <span className="font-bold text-orange-600">{fee.price}</span>
                       </div>
                     ))}
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final - Modernizado */}
      <section className="py-24 bg-gradient-to-br from-furgocasa-blue to-furgocasa-blue-dark text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-white mb-6">
            {t("¿Listo para tu aventura?")}
          </h2>
          <p className="text-blue-200 mb-10 max-w-2xl mx-auto text-lg">
            {t("Para cualquier aclaración en relación a lo dispuesto en esta sección, no dude en contactar con nosotros.")}
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <LocalizedLink 
              href="/reservar" 
              className="bg-furgocasa-orange text-white font-bold py-4 px-12 rounded-xl hover:bg-furgocasa-orange-dark transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 text-lg"
            >
              {t("Reservar ahora")}
            </LocalizedLink>
            <LocalizedLink 
              href="/contacto" 
              className="bg-white/10 backdrop-blur-md text-white border border-white/20 font-bold py-4 px-12 rounded-xl hover:bg-white/20 transition-all text-lg"
            >
              {t("Contactar")}
            </LocalizedLink>
          </div>
        </div>
      </section>
    </main>
  );
}
