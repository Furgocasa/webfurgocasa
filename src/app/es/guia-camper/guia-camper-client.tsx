"use client";

import { LocalizedLink } from "@/components/localized-link";
import { BookOpen, Gauge, Zap, Flame, Thermometer, Droplets, AlertTriangle, Info, ArrowRight, MapPin, Box } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import Image from "next/image";
import Link from "next/link";

export function GuiaCamperClient() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-gray-50 font-amiko">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-furgocasa-blue via-furgocasa-blue-dark to-gray-900 py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <BookOpen className="h-16 w-16 text-white/20 mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6">
            {t("Guía Camper")}
          </h1>
          <h2 className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto font-light leading-relaxed">
            {t("Todo lo que necesitas saber sobre el funcionamiento de tu camper de alquiler")}
          </h2>
        </div>
      </section>

      {/* Introducción */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-gray-50 rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100">
            <h3 className="text-2xl font-heading font-bold text-gray-900 mb-6 text-center">{t("Bienvenidos al mundo Caravaning")}</h3>
            <div className="space-y-6 text-gray-600 leading-relaxed text-lg">
              <p>
                {t("En los últimos años las Campervans de Gran Volumen han proliferado en gran medida y se han hecho un hueco importante dentro del sector de Caravaning.")}
              </p>
              <p>
                {t("Creemos que esto se debe a la optimización y mejora de determinados equipos, sobre todo electrónicos, que han permitido que estos vehículos, en espacios mucho mas reducidos, puedan ofrecer las mismas comodidades básicas que una autocaravana de mayor tamaño. Hablamos por ejemplo de la mayor capacidad en las baterías, menores consumos en la iluminación, luces led, sistemas de calefacción y aguas más eficientes.")}
              </p>
              <p>
                {t("Al principio, sobre todo si es tu primera vez con una autocaravana, puede que no conozcas como funcionan algunos de estos sistemas o que, haciendo uso de ellos, te surjan dudas acerca de su correcto uso, cuidado y mantenimiento.")}
              </p>
              <div className="bg-white p-6 rounded-2xl border-l-4 border-furgocasa-orange shadow-md">
                <p className="font-bold text-gray-800 flex items-center gap-3">
                  <Info className="h-6 w-6 text-furgocasa-orange" />
                  {t("¡No te preocupes! Es muy fácil.")}
                </p>
                <p className="mt-2 text-gray-600">
                  {t("Para ayudarte hemos creado esta sección donde te explicamos al detalle como funcionan cada uno de los equipamientos que lleva instalada tu camper.")}
                </p>
              </div>

              <div className="mt-8 rounded-2xl overflow-hidden border border-gray-200 shadow-md bg-gradient-to-br from-[#0B1024] via-[#1a2744] to-[#0B1024] p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-furgocasa-orange/20 flex items-center justify-center">
                  <Box className="h-8 w-8 text-furgocasa-orange" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <p className="text-xs uppercase tracking-[0.25em] text-furgocasa-orange font-semibold mb-2">
                    {t("¿Primera vez con una camper?")}
                  </p>
                  <h4 className="text-xl md:text-2xl font-heading font-bold text-white mb-2">
                    {t("Explora la Guía Camper en 3D")}
                  </h4>
                  <p className="text-blue-100/90 text-sm md:text-base leading-relaxed">
                    {t("Recorre la furgo por dentro con modo rayos X: batería, gas, aguas, WC y calefacción explicados mientras la cámara vuela a cada sistema.")}
                  </p>
                </div>
                <Link
                  href="/es/guia-camper/guia-camper-3d"
                  className="flex-shrink-0 inline-flex items-center gap-2 bg-furgocasa-orange text-white font-bold py-3 px-6 rounded-full hover:bg-furgocasa-orange-dark transition-all shadow-lg hover:-translate-y-0.5"
                >
                  {t("Abrir guía 3D")}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Panel de Control */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-6 mb-12 justify-center md:justify-start">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg text-furgocasa-orange">
                <Gauge className="h-10 w-10" />
              </div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900">
                {t("El panel de control")}
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 bg-furgocasa-blue rounded-full"></span>
                  {t("Funciones principales")}
                </h3>
                <ul className="space-y-4">
                  {[
                    "Encender el automático de la electricidad",
                    "Encender la bomba de aguas limpias",
                    "Verificar el estado de carga de las baterías",
                    "Verificar la cantidad restante de aguas limpias",
                    "Comprobar si el deposito de aguas sucias esta lleno",
                    "Encender la iluminación exterior (según modelo)"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-600">
                      <ArrowRight className="h-5 w-5 text-furgocasa-orange flex-shrink-0 mt-0.5" />
                      <span>{t(item)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-600 text-white rounded-3xl p-8 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 relative z-10">
                  <Info className="h-6 w-6 text-blue-200" />
                  {t("Funcionamiento")}
                </h3>
                <div className="space-y-6 relative z-10 text-blue-100">
                  <p>
                    <strong className="text-white block mb-1">{t("Botones de verificación:")}</strong>
                    {t("Presiona el botón correspondiente para ver los niveles de batería o agua en la barra de estado.")}
                  </p>
                  <p>
                    <strong className="text-white block mb-1">{t("Alerta de aguas grises:")}</strong>
                    {t("El icono parpadea cuando el depósito supera el 75% de capacidad. ¡Es hora de vaciar!")}
                  </p>
                  <p>
                    <strong className="text-white block mb-1">{t("Activación de servicios:")}</strong>
                    {t("Los botones de electricidad y bomba de agua tienen un piloto indicador de encendido/apagado.")}
                  </p>
                </div>
              </div>
            </div>

            {/* Imagen del Panel de Control */}
            <div className="mt-12">
              <div className="bg-white rounded-3xl p-4 shadow-lg border border-gray-100">
                <Image
                  src="/images/funcionamiento/furgocasa_panel_control_baterias_knaus.jpg"
                  alt="Panel de control de baterías Knaus - Furgocasa"
                  width={1200}
                  height={800}
                  className="rounded-2xl w-full h-auto"
                  quality={90}
                />
                <p className="text-center text-sm text-gray-500 mt-4">
                  {t("Panel de control donde puedes verificar el estado de las baterías y depósitos de agua")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Electricidad */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-6 mb-12 justify-center md:justify-start">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center shadow-md text-furgocasa-blue">
                <Zap className="h-10 w-10" />
              </div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900">
                {t("Electricidad")}
              </h2>
            </div>

            <div className="bg-gray-50 rounded-3xl p-8 md:p-12 shadow-inner border border-gray-100 mb-12">
              <p className="text-gray-600 text-lg mb-8 text-center max-w-3xl mx-auto">
                {t("Las camper llevan dos sistemas eléctricos independientes. Puedes comprobar la carga de ambos desde el panel de control.")}
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl p-8 shadow-sm border-t-4 border-furgocasa-blue hover:shadow-md transition-shadow">
                  <h3 className="font-bold text-xl text-gray-900 mb-4 text-center">
                    {t("Sistema del Vehículo")}
                  </h3>
                  <p className="text-gray-600 text-center">
                    {t("Exclusivo para el motor y elementos del salpicadero (radio, mechero cabina). Funciona como un coche normal.")}
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-8 shadow-sm border-t-4 border-furgocasa-orange hover:shadow-md transition-shadow">
                  <h3 className="font-bold text-xl text-gray-900 mb-4 text-center">
                    {t("Sistema de la Vivienda")}
                  </h3>
                  <p className="text-gray-600 text-center">
                    {t("Alimenta luces, nevera, calefacción, bomba de agua y enchufes traseros. Funciona con batería auxiliar de 12v.")}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 flex items-start gap-4">
              <Info className="h-8 w-8 text-yellow-600 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-yellow-900 text-lg mb-2">{t("¿Cómo se cargan las baterías?")}</h3>
                <ul className="text-yellow-800 space-y-2 text-sm">
                  <li>• {t("La batería del vehículo se carga mientras conduces (alternador).")}</li>
                  <li>• {t("La batería auxiliar se carga también mientras conduces y, además, con la placa solar del techo.")}</li>
                  <li>• {t("Usa placas de inducción o conexión a 220v para cargar tus dispositivos más potentes.")}</li>
                </ul>
              </div>
            </div>

            {/* Imagen de Conexión Eléctrica */}
            <div className="mt-12">
              <div className="bg-white rounded-3xl p-4 shadow-lg border border-gray-100">
                <Image
                  src="/images/funcionamiento/furgocasa_conexion_electricidad_autocaravana.jpg"
                  alt="Conexión eléctrica de autocaravana - Furgocasa"
                  width={1200}
                  height={800}
                  className="rounded-2xl w-full h-auto"
                  quality={90}
                />
                <p className="text-center text-sm text-gray-500 mt-4">
                  {t("Conexión a 220v para cargar las baterías auxiliares en áreas de autocaravanas")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gas y Calefacción */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12">
            {/* Gas */}
            <div className="bg-white rounded-3xl p-10 shadow-lg border border-gray-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
                  <Flame className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-heading font-bold text-gray-900">{t("Gas Propano")}</h2>
              </div>
              
              <p className="text-gray-600 mb-6">
                {t("Alimenta la cocina, calefacción y agua caliente. Las botellas están en el maletero trasero.")}
              </p>

              <div className="bg-red-50 rounded-xl p-6 border border-red-100">
                <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  {t("Seguridad")}
                </h4>
                <p className="text-red-700 text-sm">
                  {t("Cierra siempre las botellas durante el viaje. Ábrelas solo cuando estés parado y vayas a usar los servicios.")}
                </p>
              </div>
            </div>

            {/* Calefacción */}
            <div className="bg-white rounded-3xl p-10 shadow-lg border border-gray-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-600">
                  <Thermometer className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-heading font-bold text-gray-900">{t("Climatización")}</h2>
              </div>

              <p className="text-gray-600 mb-6">
                {t("Controlada desde su propio panel digital. Funciona a gas o gasoil (según modelo) y requiere electricidad para los ventiladores.")}
              </p>

              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  {t("Abrir gas antes de encender")}
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  {t("Subir temperatura progresivamente")}
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  {t("Ventilar para evitar condensación")}
                </li>
              </ul>
            </div>
          </div>

          {/* Imagen del Panel de Calefacción */}
          <div className="mt-12 max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl p-4 shadow-lg border border-gray-100">
              <Image
                src="/images/funcionamiento/Furgocasa_panel_control_calefaccion_truma_cp_plus.jpg"
                alt="Panel de control de calefacción Truma CP Plus - Furgocasa"
                width={1200}
                height={800}
                className="rounded-2xl w-full h-auto"
                quality={90}
              />
              <p className="text-center text-sm text-gray-500 mt-4">
                {t("Panel digital de control de la calefacción Truma")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Depósitos de Agua */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block p-4 bg-blue-50 rounded-full mb-4">
              <Droplets className="h-10 w-10 text-furgocasa-blue" />
            </div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
              {t("Gestión de Aguas")}
            </h2>
            <p className="text-gray-600">
              {t("Todo lo que necesitas saber sobre los 3 tipos de agua en tu camper")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Limpias */}
            <div className="bg-blue-50/50 rounded-3xl p-8 border border-blue-100 hover:border-blue-300 transition-colors">
              <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">💧</span> {t("Aguas Limpias")}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {t("Depósito de 100-120L para grifos y ducha. Llenar solo con agua potable en áreas habilitadas.")}
              </p>
              <div className="bg-white p-4 rounded-xl shadow-sm text-xs text-gray-500">
                <strong>{t("Ojo:")}</strong> {t("Nunca introducir combustible u otros líquidos. Dañaría todo el sistema.")}
              </div>
            </div>

            {/* Grises */}
            <div className="bg-gray-100 rounded-3xl p-8 border border-gray-200 hover:border-gray-400 transition-colors">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">🚿</span> {t("Aguas Grises")}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {t("Recoge desagües de ducha y fregadero. Vaciar cuando el piloto del panel parpadee (75%).")}
              </p>
              <div className="bg-white p-4 rounded-xl shadow-sm text-xs text-gray-500">
                <strong>{t("Vaciado:")}</strong> {t("Solo en rejillas de áreas de autocaravanas. Nunca en la naturaleza.")}
              </div>
            </div>

            {/* Negras */}
            <div className="bg-gray-800 text-white rounded-3xl p-8 shadow-xl hover:bg-gray-900 transition-colors">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">🚽</span> {t("Aguas Negras (WC)")}
              </h3>
              <p className="text-sm text-gray-300 mb-4">
                {t("Depósito extraíble (cassette). Usar siempre con producto químico azul/verde para descomponer y evitar olores.")}
              </p>
              <div className="bg-gray-700 p-4 rounded-xl shadow-sm text-xs text-gray-300 border border-gray-600">
                <strong>{t("Importante:")}</strong> {t("Abrir válvula antes de usar. Cerrar después. Vaciar solo en puntos autorizados.")}
              </div>
            </div>
          </div>

          {/* Imágenes de Gestión de Aguas */}
          <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Llenado de aguas limpias */}
            <div className="bg-white rounded-3xl p-4 shadow-lg border border-blue-100">
              <Image
                src="/images/funcionamiento/Furgocasa_llenado_deposito_aguas_autocaravana_camper.jpg"
                alt="Llenado de depósito de aguas limpias - Furgocasa"
                width={600}
                height={400}
                className="rounded-2xl w-full h-auto"
                quality={85}
              />
              <p className="text-center text-sm text-gray-500 mt-3">
                {t("Punto de llenado del depósito de aguas limpias")}
              </p>
            </div>

            {/* Vaciado de aguas grises */}
            <div className="bg-white rounded-3xl p-4 shadow-lg border border-gray-200">
              <Image
                src="/images/funcionamiento/Furgocasa_vaciado_aguas_grises_autocaravana.jpg"
                alt="Vaciado de aguas grises en área de autocaravanas - Furgocasa"
                width={600}
                height={400}
                className="rounded-2xl w-full h-auto"
                quality={85}
              />
              <p className="text-center text-sm text-gray-500 mt-3">
                {t("Vaciado de aguas grises en área habilitada")}
              </p>
            </div>

            {/* Depósito de aguas negras */}
            <div className="bg-white rounded-3xl p-4 shadow-lg border border-gray-800">
              <Image
                src="/images/funcionamiento/Furgocasa_deposito_aguas_negras_wc_quimico.jpg"
                alt="Depósito cassette de aguas negras WC químico - Furgocasa"
                width={600}
                height={400}
                className="rounded-2xl w-full h-auto"
                quality={85}
              />
              <p className="text-center text-sm text-gray-500 mt-3">
                {t("Depósito cassette extraíble para aguas negras")}
              </p>
            </div>
          </div>

          {/* Banner promocional: Mapa Furgocasa App */}
          <div className="mt-16 max-w-5xl mx-auto">
            <div 
              className="relative bg-gradient-to-br from-furgocasa-blue to-blue-700 rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden"
            >
              {/* Imagen de fondo con overlay */}
              <div className="absolute inset-0 opacity-20">
                <Image
                  src="/images/funcionamiento/Furgocasa_seal_area_autocaravanas.jpg"
                  alt="Área de autocaravanas"
                  fill
                  className="object-cover"
                  quality={60}
                />
              </div>

              {/* Contenido del banner */}
              <div className="relative z-10 text-center text-white">
                <h3 className="text-2xl md:text-3xl font-heading font-bold mb-4">
                  {t("¿Dónde encontrar áreas de autocaravanas certificadas?")}
                </h3>
                <p className="text-lg md:text-xl mb-2 font-semibold text-blue-100">
                  {t("Usa nuestra app gratuita con todas las áreas de España")}
                </p>
                <p className="text-sm md:text-base text-blue-50 max-w-2xl mx-auto mb-8 leading-relaxed">
                  {t("Encuentra áreas validadas, con servicios de agua, electricidad y vaciado. Comentarios reales de usuarios. Rutas, POIs y mucho más.")}
                </p>
                
                <a
                  href="https://www.mapafurgocasa.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white text-furgocasa-blue px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-50 hover:scale-105 transition-all duration-300 shadow-xl"
                >
                  <MapPin className="h-5 w-5" />
                  {t("Abrir Mapa Furgocasa")}
                  <span className="text-xl">→</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tips para evitar olores */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-gray-100">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-gray-900 mb-8 flex items-center gap-3">
              <span className="p-2 bg-green-100 rounded-lg text-green-600"><Zap className="h-6 w-6" /></span>
              {t("Tips para evitar olores")}
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold text-gray-900 mb-3 text-lg">{t("En el fregadero")}</h4>
                <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-4 rounded-xl">
                  {t("Evita verter restos de comida, café o aceite. Intenta que caiga solo agua con jabón. Los restos orgánicos se descomponen y huelen.")}
                </p>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-3 text-lg">{t("En el baño")}</h4>
                <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-4 rounded-xl">
                  {t("Usa siempre el químico adecuado y en la cantidad correcta. En verano, con el calor, vacía el cassette con más frecuencia, aunque no esté lleno.")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 bg-gradient-to-br from-furgocasa-blue to-furgocasa-blue-dark relative overflow-hidden text-center">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-furgocasa-orange/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>

        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-white mb-6">
            {t("¿Listo para ponerlo en práctica?")}
          </h2>
          <p className="text-blue-100 mb-10 text-xl max-w-2xl mx-auto font-light">
            {t("Ahora que conoces los secretos, ¡es hora de reservar tu compañera de viaje!")}
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <LocalizedLink href="/vehiculos" className="bg-furgocasa-orange text-white font-bold py-4 px-10 rounded-xl hover:bg-furgocasa-orange-dark transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
              {t("Ver vehículos disponibles")}
            </LocalizedLink>
            <LocalizedLink href="/video-tutoriales" className="bg-white/10 backdrop-blur-md text-white border border-white/20 font-bold py-4 px-10 rounded-xl hover:bg-white/20 transition-all">
              {t("Ver video tutoriales")}
            </LocalizedLink>
          </div>
        </div>
      </section>
    </main>
  );
}
