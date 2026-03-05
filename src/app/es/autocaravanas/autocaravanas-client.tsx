"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { LocalizedLink } from "@/components/localized-link";
import {
  Truck, ChevronDown, ChevronLeft, ChevronRight, Search, MapPin, Phone, Globe, Star, ExternalLink,
  Shield, Scale, FileText, Wrench, CarFront, Building2, AlertTriangle, Info,
  ArrowRight, CheckCircle2, XCircle, HelpCircle, BadgeCheck, Filter, X,
  Fuel, Bed, Users, Ruler, CircleDot, Navigation, Map, Wifi, Droplets, Zap,
  LayoutGrid, List
} from "lucide-react";
import type { MotorhomeService } from "@/types/database";

// --- Tipos ---

interface ServiceStats {
  talleres: number;
  concesionarios: number;
  total: number;
  provinces: number;
}

interface ProvinceItem {
  province: string;
  region: string;
  count: number;
}

interface Props {
  initialServices: MotorhomeService[];
  initialCount: number;
  stats: ServiceStats;
  provinces: ProvinceItem[];
}

// --- Datos estáticos para SEO ---

const MOTORHOME_TYPES = [
  {
    name: "Autocaravana Perfilada",
    aka: "Semi-integral",
    description: "La cabina del conductor se integra parcialmente con el habitáculo. El techo cae en forma aerodinámica sobre la cabina. Es el tipo más popular por su equilibrio entre espacio, conducción y precio.",
    pros: ["Buena aerodinámica y consumo", "Fácil de conducir", "Precio intermedio", "Buena habitabilidad"],
    cons: ["Menos espacio que una integral", "Cama sobre cabina limitada"],
    length: "6 - 7,5 m",
    weight: "3.000 - 3.500 kg",
    beds: "2 - 4",
    icon: <Truck className="h-8 w-8" />,
  },
  {
    name: "Autocaravana Integral",
    aka: "Motorhome",
    description: "El chasis y la carrocería forman una sola pieza. Ofrece el máximo espacio habitable y la mejor experiencia de vida. La cabina de conducción se integra completamente en el salón.",
    pros: ["Máximo espacio habitable", "Gran luminosidad (parabrisas panorámico)", "Mejor aislamiento", "Máxima comodidad"],
    cons: ["Mayor precio", "Más difícil de maniobrar", "Mayor consumo", "Puede requerir permiso C1"],
    length: "7 - 9 m",
    weight: "3.500 - 5.000 kg",
    beds: "4 - 6",
    icon: <CarFront className="h-8 w-8" />,
  },
  {
    name: "Autocaravana Capuchina",
    aka: "Overcab",
    description: "Se distingue por el característico altillo sobre la cabina de conducción que alberga una cama doble. Es la opción favorita de familias con niños por ofrecer el mayor número de plazas para dormir.",
    pros: ["Más plazas para dormir (hasta 7)", "Ideal para familias", "Buena relación espacio/precio", "Cama permanente en altillo"],
    cons: ["Mayor altura total", "Peor aerodinámica", "Aspecto menos estético", "Mayor consumo por resistencia al viento"],
    length: "6,5 - 7,5 m",
    weight: "3.200 - 3.500 kg",
    beds: "4 - 7",
    icon: <Bed className="h-8 w-8" />,
  },
  {
    name: "Furgoneta Camperizada",
    aka: "Camper Van",
    description: "Furgonetas de gran volumen (tipo Fiat Ducato, Mercedes Sprinter, VW Crafter) convertidas en vivienda. Combinan la practicidad de una furgoneta con las comodidades de una autocaravana compacta.",
    pros: ["Fácil de aparcar y conducir", "Cabe en parking normal", "Bajo consumo", "Versatilidad día a día"],
    cons: ["Espacio más limitado", "Baño tipo químico portátil", "Menos almacenamiento"],
    length: "5,4 - 6,4 m",
    weight: "2.800 - 3.500 kg",
    beds: "2 - 3",
    icon: <Navigation className="h-8 w-8" />,
  },
];

const FAQ_DATA = [
  {
    q: "¿Qué permiso necesito para conducir una autocaravana?",
    a: "Con el permiso B puedes conducir autocaravanas de hasta 3.500 kg de MMA (Masa Máxima Autorizada). Para autocaravanas de más de 3.500 kg necesitas el permiso C1, que permite conducir vehículos de hasta 7.500 kg. La gran mayoría de autocaravanas de alquiler no superan los 3.500 kg.",
  },
  {
    q: "¿Cuánto cuesta una autocaravana nueva?",
    a: "Los precios varían enormemente según el tipo. Una furgoneta camperizada nueva parte desde 45.000-55.000€. Las autocaravanas perfiladas arrancan desde 55.000-70.000€. Las integrales, desde 80.000€ hasta más de 150.000€. Las capuchinas, desde 50.000-65.000€. El mercado de segunda mano ofrece opciones desde 15.000-20.000€.",
  },
  {
    q: "¿Se puede pernoctar con autocaravana en España?",
    a: "Sí, pernoctar (dormir dentro del vehículo estacionado) es legal en la mayoría de vías públicas donde el estacionamiento esté permitido. Lo que está regulado y generalmente prohibido es la acampada libre (sacar toldos, mesas, sillas, calzar el vehículo). Cada comunidad autónoma y municipio puede tener normativa específica.",
  },
  {
    q: "¿Cuál es la diferencia entre autocaravana y camper?",
    a: "La diferencia principal está en la base. Una autocaravana se construye sobre un chasis-cabina con una carrocería habitable independiente (integral, perfilada o capuchina). Una camper o furgoneta camperizada se construye dentro de una furgoneta comercial manteniendo su carrocería original. Las campers son más compactas y fáciles de conducir.",
  },
  {
    q: "¿Cada cuánto hay que pasar la ITV a una autocaravana?",
    a: "Las autocaravanas nuevas pasan la primera ITV a los 4 años. Después, cada 2 años hasta que cumplen 10 años de antigüedad. A partir de los 10 años, la ITV es anual. Los vehículos catalogados como vivienda tienen la misma periodicidad que los turismos.",
  },
  {
    q: "¿Qué seguro necesita una autocaravana?",
    a: "Como mínimo, un seguro obligatorio de responsabilidad civil. Se recomienda un seguro a terceros ampliado o a todo riesgo que cubra: asistencia en viaje 24h, robo, incendio, lunas, daños propios y contenido interior. Las aseguradoras especializadas como Fénix Directo, Camperfriend o Verti ofrecen pólizas específicas.",
  },
  {
    q: "¿Cuánto consume una autocaravana?",
    a: "El consumo depende del tipo y motorización. Una furgoneta camperizada consume entre 8-10 L/100km. Una perfilada entre 10-12 L/100km. Una integral o capuchina entre 11-14 L/100km. Factores como el peso de carga, la velocidad y las condiciones del viento influyen significativamente.",
  },
  {
    q: "¿Es mejor alquilar o comprar una autocaravana?",
    a: "Depende del uso. Si piensas usarla menos de 8-10 semanas al año, alquilar suele ser más económico (no pagas seguro, ITV, plaza de parking, mantenimiento ni depreciación). Comprar merece la pena si la usas frecuentemente, quieres personalizarla a tu gusto, o planeas vivir a bordo de forma permanente.",
  },
  {
    q: "¿Dónde puedo vaciar las aguas grises y negras?",
    a: "En las áreas de servicio para autocaravanas, que incluyen puntos de vaciado de aguas grises y negras, toma de agua limpia, y a veces electricidad. En España hay más de 700 áreas de servicio. También puedes vaciar en muchos campings y estaciones de servicio adaptadas. Nunca vacíes aguas en la naturaleza.",
  },
  {
    q: "¿Puedo llevar mascotas en una autocaravana de alquiler?",
    a: "Depende de la empresa de alquiler. En Furgocasa permitimos mascotas en todos nuestros vehículos. Es importante comunicarlo al hacer la reserva. Se recomienda llevar una funda protectora para el asiento y los utensilios de la mascota.",
  },
];

// --- Componente de tarjeta de servicio ---

function ServiceCard({ service }: { service: MotorhomeService }) {
  const categoryLabel = service.category === 'taller_camper' ? 'Taller' : 'Concesionario';
  const categoryColor = service.category === 'taller_camper'
    ? 'bg-amber-100 text-amber-800'
    : 'bg-blue-100 text-blue-800';

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-heading font-bold text-gray-900 text-base leading-tight truncate group-hover:text-furgocasa-blue transition-colors">
              {service.name}
            </h3>
            <span className={`inline-block mt-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ${categoryColor}`}>
              {categoryLabel}
            </span>
          </div>
          {service.rating && (
            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg flex-shrink-0">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-bold text-gray-900">{service.rating}</span>
              {service.review_count > 0 && (
                <span className="text-xs text-gray-500">({service.review_count})</span>
              )}
            </div>
          )}
        </div>

        {service.address && (
          <p className="text-sm text-gray-500 flex items-start gap-1.5 mb-2">
            <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-2">{service.address}</span>
          </p>
        )}

        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-50">
          {service.phone && (
            <a
              href={`tel:${service.phone.replace(/\s/g, '')}`}
              className="flex items-center gap-1 text-xs text-furgocasa-blue hover:text-furgocasa-orange transition-colors font-medium"
            >
              <Phone className="h-3.5 w-3.5" />
              {service.phone}
            </a>
          )}
          {service.website && service.website_valid && (
            <a
              href={service.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-furgocasa-blue hover:text-furgocasa-orange transition-colors font-medium ml-auto"
            >
              <Globe className="h-3.5 w-3.5" />
              Web
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        {service.province && (
          <div className="mt-2 flex items-center gap-1.5">
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
              {service.province}
            </span>
            {service.is_verified && (
              <BadgeCheck className="h-4 w-4 text-green-500" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Vista lista compacta ---

function ServiceListRow({ service }: { service: MotorhomeService }) {
  const categoryLabel = service.category === 'taller_camper' ? 'Taller' : 'Concesionario';
  const categoryColor = service.category === 'taller_camper'
    ? 'bg-amber-100 text-amber-800'
    : 'bg-blue-100 text-blue-800';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-4 px-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h3 className="font-heading font-bold text-gray-900 truncate">{service.name}</h3>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${categoryColor}`}>
            {categoryLabel}
          </span>
          {service.rating && (
            <span className="flex items-center gap-1 text-sm text-gray-600">
              <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
              {service.rating}
              {service.review_count > 0 && (
                <span className="text-gray-400">({service.review_count})</span>
              )}
            </span>
          )}
        </div>
        {service.address && (
          <p className="text-sm text-gray-500 truncate flex items-center gap-1">
            <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
            {service.address}
          </p>
        )}
      </div>
      <div className="flex items-center gap-4 flex-shrink-0">
        {service.province && (
          <span className="text-xs text-gray-400 hidden sm:inline">{service.province}</span>
        )}
        {service.phone && (
          <a href={`tel:${service.phone.replace(/\s/g, '')}`} className="flex items-center gap-1 text-sm text-furgocasa-blue hover:text-furgocasa-orange">
            <Phone className="h-4 w-4" />
            <span className="hidden sm:inline">{service.phone}</span>
          </a>
        )}
        {service.website && service.website_valid && (
          <a href={service.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-furgocasa-blue hover:text-furgocasa-orange">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Web</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}

// --- Componente principal ---

export function AutocaravanasClient({ initialServices, initialCount, stats, provinces }: Props) {
  const [services, setServices] = useState<MotorhomeService[]>(initialServices);
  const [totalCount, setTotalCount] = useState(initialCount);
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [provinceFilter, setProvinceFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeTypeTab, setActiveTypeTab] = useState(0);
  const [pageSize, setPageSize] = useState<number | "all">(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'quality' | 'rating' | 'reviews'>('quality');

  const fetchServices = useCallback(async (category: string, province: string, search: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (province) params.set('province', province);
      if (search) params.set('search', search);
      params.set('limit', '1000');

      const res = await fetch(`/api/motorhome-services?${params.toString()}`);
      const json = await res.json();
      setServices(json.data || []);
      setTotalCount(json.count || 0);
    } catch {
      console.error('Error fetching services');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (categoryFilter || provinceFilter || searchTerm) {
      const timeout = setTimeout(() => {
        fetchServices(categoryFilter, provinceFilter, searchTerm);
      }, searchTerm ? 400 : 0);
      return () => clearTimeout(timeout);
    } else {
      setServices(initialServices);
      setTotalCount(initialCount);
    }
  }, [categoryFilter, provinceFilter, searchTerm, fetchServices, initialServices, initialCount]);

  // Reset página al cambiar filtros, resultados por página o orden
  useEffect(() => {
    setCurrentPage(1);
  }, [services, pageSize, sortBy]);

  const PAGE_SIZE_OPTIONS = [20, 30, 50, 100, 200, "all"] as const;

  const sortedServices = [...services].sort((a, b) => {
    if (sortBy === 'rating') {
      const ra = a.rating ?? 0;
      const rb = b.rating ?? 0;
      if (rb !== ra) return rb - ra;
      return (b.review_count ?? 0) - (a.review_count ?? 0);
    }
    if (sortBy === 'reviews') {
      const rcA = a.review_count ?? 0;
      const rcB = b.review_count ?? 0;
      if (rcB !== rcA) return rcB - rcA;
      return (b.rating ?? 0) - (a.rating ?? 0);
    }
    return 0; // quality: mantener orden del servidor
  });

  const totalPages = pageSize === "all" ? 1 : Math.ceil(sortedServices.length / pageSize) || 1;
  const paginatedServices = pageSize === "all"
    ? sortedServices
    : sortedServices.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const tocItems = [
    { id: "que-es", label: "Qué es" },
    { id: "tipos", label: "Tipos" },
    { id: "permisos", label: "Permisos" },
    { id: "normativa", label: "Normativa" },
    { id: "peso", label: "Peso" },
    { id: "seguros", label: "Seguros" },
    { id: "mantenimiento", label: "Mantenimiento" },
    { id: "comprar", label: "Comprar" },
    { id: "alquilar", label: "Alquilar" },
    { id: "areas", label: "Áreas" },
    { id: "directorio", label: "Directorio" },
    { id: "faq", label: "FAQ" },
  ];

  return (
    <main className="min-h-screen bg-white font-amiko">
      {/* ============ HERO con imagen de fondo ============ */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <Image
          src="/images/slides/hero-15.webp"
          alt="Autocaravanas en paisaje"
          fill
          priority
          fetchPriority="high"
          quality={75}
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        <div className="container mx-auto px-4 text-center relative z-10 py-16 lg:py-24">
          <Image
            src="/images/brand/LOGO BLANCO.png"
            alt="Furgocasa"
            width={200}
            height={80}
            className="mx-auto mb-6 h-16 w-auto object-contain opacity-95"
          />
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-white mb-6 leading-tight" style={{ textShadow: "2px 2px 12px rgba(0,0,0,0.8)" }}>
            Autocaravanas
          </h1>
          <p className="text-xl md:text-2xl text-white/95 max-w-3xl mx-auto font-light leading-relaxed mb-10" style={{ textShadow: "1px 1px 6px rgba(0,0,0,0.9)" }}>
            La guía más completa de España: tipos, permisos, normativa, mantenimiento y el mayor directorio de talleres y concesionarios
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            {[
              { n: stats.total.toLocaleString()+"+", l: "Servicios" },
              { n: stats.talleres.toLocaleString(), l: "Talleres" },
              { n: stats.concesionarios.toLocaleString(), l: "Concesionarios" },
              { n: stats.provinces.toString(), l: "Provincias" },
            ].map((s) => (
              <div key={s.l} className="bg-white/15 backdrop-blur-md rounded-xl px-5 py-3 border border-white/20">
                <div className="text-2xl font-heading font-bold text-white">{s.n}</div>
                <div className="text-white/80 text-xs">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TABLE OF CONTENTS (sticky) ============ */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-2 py-3">
            {tocItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="flex-shrink-0 px-4 py-2 text-sm font-medium text-gray-600 hover:text-furgocasa-blue hover:bg-furgocasa-blue/5 rounded-lg border border-transparent hover:border-furgocasa-blue/20 transition-all duration-200 whitespace-nowrap"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* ============ QUÉ ES UNA AUTOCARAVANA ============ */}
      <section id="que-es" className="py-16 lg:py-24 bg-white scroll-mt-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 mb-8">
              ¿Qué es una autocaravana?
            </h2>
            <div className="rounded-2xl overflow-hidden shadow-lg mb-8 aspect-video relative">
              <Image src="/images/slides/hero-01.webp" alt="Autocaravana en ruta" fill className="object-cover" sizes="(max-width: 768px) 100vw, 896px" />
            </div>
            <div className="space-y-5 text-gray-600 text-lg leading-relaxed">
              <p>
                Una <strong className="text-gray-900">autocaravana</strong> es un vehículo que integra un espacio habitable sobre un chasis motorizado. A diferencia de una caravana (que necesita ser remolcada), la autocaravana tiene motor propio y se conduce como un vehículo convencional. En su interior incluye zona de dormitorio, cocina, baño y salón-comedor.
              </p>
              <p>
                En España, las autocaravanas están clasificadas como <strong className="text-gray-900">vehículos vivienda</strong> y deben cumplir la homologación como tal. Según la DGT, se definen como &ldquo;vehículos construidos con propósito especial, incluyendo alojamiento, que contiene al menos el equipamiento siguiente: asientos y mesa, camas o literas y cocina&rdquo;.
              </p>
              <div className="bg-furgocasa-blue/5 border border-furgocasa-blue/10 p-6 rounded-2xl">
                <h3 className="font-heading font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Info className="h-5 w-5 text-furgocasa-blue" />
                  Autocaravana vs Camper vs Caravana
                </h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <p className="font-bold text-gray-900 mb-1">Autocaravana</p>
                    <p className="text-gray-500">Vehículo con carrocería habitable construida sobre un chasis-cabina. Tiene motor propio.</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <p className="font-bold text-gray-900 mb-1">Camper / Furgoneta camperizada</p>
                    <p className="text-gray-500">Furgoneta comercial adaptada como vivienda manteniendo su carrocería original.</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <p className="font-bold text-gray-900 mb-1">Caravana</p>
                    <p className="text-gray-500">Remolque habitable sin motor. Necesita un vehículo tractor para desplazarse.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TIPOS DE AUTOCARAVANAS ============ */}
      <section id="tipos" className="py-16 lg:py-24 bg-gray-50 scroll-mt-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 mb-4 text-center">
            Tipos de autocaravanas
          </h2>
          <p className="text-gray-500 text-center mb-8 max-w-2xl mx-auto">
            Conoce las diferencias entre cada tipo para elegir la que mejor se adapta a tus necesidades
          </p>
          <div className="rounded-2xl overflow-hidden shadow-lg mb-10 max-w-3xl mx-auto aspect-[16/9] relative">
            <Image src="/images/slides/hero-05.webp" alt="Tipos de autocaravanas" fill className="object-cover" sizes="(max-width: 768px) 100vw, 672px" />
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {MOTORHOME_TYPES.map((type, i) => (
              <button
                key={type.name}
                onClick={() => setActiveTypeTab(i)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                  activeTypeTab === i
                    ? 'bg-furgocasa-blue text-white shadow-lg shadow-furgocasa-blue/25'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {type.icon}
                <span className="hidden sm:inline">{type.name}</span>
                <span className="sm:hidden">{type.aka}</span>
              </button>
            ))}
          </div>

          {/* Active type detail */}
          {(() => {
            const type = MOTORHOME_TYPES[activeTypeTab];
            return (
              <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6 md:p-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-furgocasa-blue/10 rounded-2xl flex items-center justify-center text-furgocasa-blue">
                      {type.icon}
                    </div>
                    <div>
                      <h3 className="text-2xl font-heading font-bold text-gray-900">{type.name}</h3>
                      <p className="text-gray-400 text-sm">También conocida como: {type.aka}</p>
                    </div>
                  </div>

                  <p className="text-gray-600 text-lg leading-relaxed mb-8">{type.description}</p>

                  {/* Specs */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                      { icon: <Ruler className="h-5 w-5" />, label: "Longitud", value: type.length },
                      { icon: <Scale className="h-5 w-5" />, label: "Peso MMA", value: type.weight },
                      { icon: <Bed className="h-5 w-5" />, label: "Plazas dormir", value: type.beds },
                      { icon: <Users className="h-5 w-5" />, label: "Permiso", value: "B / C1" },
                    ].map((spec) => (
                      <div key={spec.label} className="bg-gray-50 rounded-xl p-4 text-center">
                        <div className="text-furgocasa-blue mx-auto mb-2 flex justify-center">{spec.icon}</div>
                        <p className="text-xs text-gray-400 mb-1">{spec.label}</p>
                        <p className="font-bold text-gray-900 text-sm">{spec.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Pros & Cons */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
                      <h4 className="font-bold text-green-800 mb-4 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5" /> Ventajas
                      </h4>
                      <ul className="space-y-2">
                        {type.pros.map((pro) => (
                          <li key={pro} className="text-green-700 text-sm flex items-start gap-2">
                            <ArrowRight className="h-4 w-4 flex-shrink-0 mt-0.5" /> {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
                      <h4 className="font-bold text-red-800 mb-4 flex items-center gap-2">
                        <XCircle className="h-5 w-5" /> Inconvenientes
                      </h4>
                      <ul className="space-y-2">
                        {type.cons.map((con) => (
                          <li key={con} className="text-red-700 text-sm flex items-start gap-2">
                            <ArrowRight className="h-4 w-4 flex-shrink-0 mt-0.5" /> {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* ============ PERMISOS DE CONDUCIR ============ */}
      <section id="permisos" className="py-16 lg:py-24 bg-white scroll-mt-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-furgocasa-blue/10 rounded-2xl flex items-center justify-center text-furgocasa-blue">
                <FileText className="h-7 w-7" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900">
                Permisos de conducir para autocaravanas
              </h2>
            </div>

            <div className="space-y-6">
              <div className="bg-white border-2 border-green-200 rounded-2xl p-6">
                <h3 className="text-xl font-heading font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-lg">Permiso B</span>
                  Hasta 3.500 kg de MMA
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  El carnet de conducir estándar. Válido para la <strong>gran mayoría de autocaravanas del mercado</strong>, incluyendo perfiladas, capuchinas y furgonetas camperizadas. Con el B puedes conducir cualquier autocaravana cuya Masa Máxima Autorizada no supere los 3.500 kg, independientemente del número de plazas.
                </p>
              </div>

              <div className="bg-white border-2 border-blue-200 rounded-2xl p-6">
                <h3 className="text-xl font-heading font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="bg-blue-500 text-white text-sm font-bold px-3 py-1 rounded-lg">Permiso C1</span>
                  De 3.500 kg a 7.500 kg
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Necesario para <strong>autocaravanas integrales grandes</strong> que superan los 3.500 kg. Se obtiene con un examen teórico y práctico específico. Edad mínima: 21 años. Requiere renovación cada 5 años con reconocimiento médico.
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
                <h3 className="font-heading font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" /> Importante
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  El peso que cuenta es la <strong>MMA (Masa Máxima Autorizada)</strong>, NO el peso real del vehículo. Es decir, aunque tu autocaravana pese 3.200 kg en vacío, si su MMA es de 3.500 kg, puedes conducirla con el permiso B. Si la MMA supera los 3.500 kg aunque sea por 1 kg, necesitas el C1.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ NORMATIVA ============ */}
      <section id="normativa" className="py-16 lg:py-24 bg-gray-50 scroll-mt-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-furgocasa-blue/10 rounded-2xl flex items-center justify-center text-furgocasa-blue">
                <Shield className="h-7 w-7" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900">
                Normativa de autocaravanas en España
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-heading font-bold text-gray-900 mb-3">Estacionamiento</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Las autocaravanas pueden estacionar en cualquier lugar donde esté permitido el estacionamiento de vehículos de sus dimensiones. La DGT establece que una autocaravana estacionada tiene los mismos derechos y deberes que cualquier otro vehículo.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-heading font-bold text-gray-900 mb-3">Pernocta vs Acampada</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  <strong>Pernoctar</strong> (dormir dentro del vehículo estacionado) es legal. <strong>Acampar</strong> (sacar toldos, mesas, calzar el vehículo, extender elementos fuera del perímetro) está generalmente prohibido fuera de zonas habilitadas.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-heading font-bold text-gray-900 mb-3">ITV</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Primera ITV a los 4 años. Cada 2 años hasta los 10 años. Anual a partir de los 10 años. Se revisan: frenos, luces, emisiones, sistema de gas (si procede), estructura y habitabilidad.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-heading font-bold text-gray-900 mb-3">Velocidad máxima</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Autocaravanas hasta 3.500 kg: mismos límites que turismos (120 km/h autopista, 90 km/h carretera convencional). Más de 3.500 kg: 90 km/h en autopista, 80 km/h en carretera convencional.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-heading font-bold text-gray-900 mb-3">Impuesto de circulación (IVTM)</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Las autocaravanas tributan como vehículos de turismo según su potencia fiscal. El importe varía según el municipio. Generalmente oscila entre 60€ y 200€/año.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-heading font-bold text-gray-900 mb-3">Peajes y ferris</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  En peajes, las autocaravanas se clasifican según su altura (generalmente &gt;2m = categoría superior). En ferris, la tarifa depende de la longitud del vehículo. Consulta siempre las dimensiones exactas de tu autocaravana.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PESO Y DIMENSIONES ============ */}
      <section id="peso" className="py-16 lg:py-24 bg-white scroll-mt-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-furgocasa-blue/10 rounded-2xl flex items-center justify-center text-furgocasa-blue">
                <Scale className="h-7 w-7" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900">
                Peso y dimensiones
              </h2>
            </div>

            <div className="space-y-6">
              <p className="text-gray-600 text-lg leading-relaxed">
                Entender el peso de tu autocaravana es fundamental, tanto para elegir el permiso correcto como para no exceder la carga máxima permitida.
              </p>

              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <h3 className="font-heading font-bold text-gray-900 mb-4">Conceptos clave de peso</h3>
                <div className="space-y-4">
                  {[
                    { term: "MMA (Masa Máxima Autorizada)", def: "Peso máximo total que el vehículo puede alcanzar cargado. Es el dato que determina qué permiso necesitas." },
                    { term: "Tara", def: "Peso del vehículo en vacío, sin pasajeros ni carga, pero con depósitos llenos (agua, combustible)." },
                    { term: "Carga útil", def: "MMA - Tara = lo que puedes cargar (personas, equipaje, comida, agua adicional). Suele estar entre 300 y 600 kg." },
                    { term: "Peso real", def: "Peso actual del vehículo en un momento dado. NUNCA debe superar la MMA." },
                  ].map((item) => (
                    <div key={item.term} className="flex items-start gap-3">
                      <CircleDot className="h-5 w-5 text-furgocasa-orange flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-gray-900">{item.term}: </span>
                        <span className="text-gray-600">{item.def}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <h3 className="font-heading font-bold text-red-800 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" /> Exceso de peso: multas y riesgos
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Circular con exceso de peso es infracción grave. Las multas van desde 200€ hasta 500€ dependiendo del porcentaje de exceso. Además, el exceso de peso afecta a la frenada, estabilidad y desgaste de neumáticos, y puede invalidar el seguro en caso de accidente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ SEGUROS ============ */}
      <section id="seguros" className="py-16 lg:py-24 bg-gray-50 scroll-mt-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-furgocasa-blue/10 rounded-2xl flex items-center justify-center text-furgocasa-blue">
                <Shield className="h-7 w-7" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900">
                Seguro de autocaravanas
              </h2>
            </div>

            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              El seguro de una autocaravana funciona de forma similar al de un turismo, pero con coberturas adicionales específicas para el equipamiento interior.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "Terceros básico",
                  price: "Desde 250€/año",
                  features: ["Responsabilidad civil obligatoria", "Defensa jurídica", "Reclamación de daños"],
                  recommended: false,
                },
                {
                  title: "Terceros ampliado",
                  price: "Desde 400€/año",
                  features: ["Todo lo del básico", "Robo e incendio", "Lunas", "Asistencia en viaje 24h", "Cobertura del contenido"],
                  recommended: true,
                },
                {
                  title: "Todo riesgo",
                  price: "Desde 600€/año",
                  features: ["Todo lo del ampliado", "Daños propios", "Sin franquicia (opción)", "Vehículo de sustitución", "Cobertura en Europa"],
                  recommended: false,
                },
              ].map((plan) => (
                <div key={plan.title} className={`bg-white rounded-2xl p-6 shadow-sm border-2 transition-all ${
                  plan.recommended
                    ? 'border-furgocasa-orange shadow-lg scale-[1.02]'
                    : 'border-gray-100 hover:border-gray-200'
                }`}>
                  {plan.recommended && (
                    <span className="inline-block bg-furgocasa-orange text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                      Recomendado
                    </span>
                  )}
                  <h3 className="text-lg font-heading font-bold text-gray-900 mb-1">{plan.title}</h3>
                  <p className="text-furgocasa-blue font-bold text-xl mb-4">{plan.price}</p>
                  <ul className="space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="text-gray-600 text-sm flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ MANTENIMIENTO ============ */}
      <section id="mantenimiento" className="py-16 lg:py-24 bg-white scroll-mt-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-furgocasa-blue/10 rounded-2xl flex items-center justify-center text-furgocasa-blue">
                <Wrench className="h-7 w-7" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900">
                Mantenimiento de autocaravanas
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                { title: "Motor y mecánica", desc: "Mismo mantenimiento que una furgoneta: aceite, filtros, correa de distribución, frenos. Intervalos cada 15.000-30.000 km según fabricante." },
                { title: "Sistema de agua", desc: "Sanear depósitos con productos específicos. Vaciar en invierno para evitar congelaciones. Revisar bomba de agua y conexiones periódicamente." },
                { title: "Sistema eléctrico", desc: "Verificar estado de baterías auxiliares (AGM, gel o litio). Comprobar carga del panel solar. Revisar conexiones y fusibles." },
                { title: "Gas y calefacción", desc: "Revisión anual del sistema de gas por un profesional. Comprobar estanqueidad de conexiones. Limpieza de filtros de la calefacción estacionaria." },
                { title: "Neumáticos", desc: "Las autocaravanas pasan mucho tiempo paradas. Los neumáticos se degradan con el tiempo (cambiar cada 5-6 años máximo) aunque tengan dibujo. Vigilar la presión." },
                { title: "Sellados y carrocería", desc: "Inspeccionar juntas y sellados de ventanas, lucernarios y claraboyas al menos una vez al año. Las filtraciones de agua son el mayor enemigo de una autocaravana." },
              ].map((item) => (
                <div key={item.title} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <h3 className="font-heading font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ COMPRAR UNA AUTOCARAVANA ============ */}
      <section id="comprar" className="py-16 lg:py-24 bg-gray-50 scroll-mt-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-furgocasa-blue/10 rounded-2xl flex items-center justify-center text-furgocasa-blue">
                <Building2 className="h-7 w-7" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900">
                Comprar una autocaravana
              </h2>
            </div>

            <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
              <p>
                La compra de una autocaravana es una decisión importante. Tanto si optas por nueva como de segunda mano, hay factores clave a considerar.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                  <h3 className="font-heading font-bold text-gray-900 mb-3">Nueva</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" /> Garantía del fabricante (2-3 años)</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" /> Personalización a tu gusto</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" /> Últimas tecnologías</li>
                    <li className="flex items-start gap-2"><XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" /> Mayor inversión inicial</li>
                    <li className="flex items-start gap-2"><XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" /> Depreciación los primeros años</li>
                  </ul>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                  <h3 className="font-heading font-bold text-gray-900 mb-3">Segunda mano</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" /> Precio mucho más accesible</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" /> Menor depreciación</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" /> Pueden incluir extras ya instalados</li>
                    <li className="flex items-start gap-2"><XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" /> Revisar posibles filtraciones</li>
                    <li className="flex items-start gap-2"><XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" /> Menor vida útil restante</li>
                  </ul>
                </div>
              </div>

              <LocalizedLink
                href="/ventas"
                className="inline-flex items-center gap-2 bg-furgocasa-orange text-white font-bold px-6 py-3 rounded-xl hover:bg-furgocasa-orange-dark transition-colors shadow-lg shadow-furgocasa-orange/25"
              >
                Ver autocaravanas en venta en Furgocasa
                <ArrowRight className="h-5 w-5" />
              </LocalizedLink>
            </div>
          </div>
        </div>
      </section>

      {/* ============ ALQUILAR UNA AUTOCARAVANA ============ */}
      <section id="alquilar" className="py-16 lg:py-24 bg-gradient-to-br from-furgocasa-blue via-furgocasa-blue-dark to-gray-900 text-white scroll-mt-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-furgocasa-orange/10 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-white mb-6">
              Alquiler de autocaravanas
            </h2>
            <p className="text-blue-100 text-lg leading-relaxed mb-8">
              Si estás pensando en probar la experiencia autocaravanista antes de comprar, o simplemente quieres disfrutar de unas vacaciones diferentes, el alquiler es la opción perfecta.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-10">
              {[
                { title: "Sin preocupaciones", desc: "Seguro incluido, asistencia 24h, mantenimiento a cargo de la empresa" },
                { title: "Flexibilidad total", desc: "Elige las fechas, el vehículo y los extras que necesites" },
                { title: "Prueba antes de comprar", desc: "Descubre qué tipo de autocaravana se adapta a ti" },
              ].map((item) => (
                <div key={item.title} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <h3 className="font-heading font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-blue-200 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <LocalizedLink
                href="/vehiculos"
                className="inline-flex items-center gap-2 bg-furgocasa-orange text-white font-bold px-6 py-3 rounded-xl hover:bg-furgocasa-orange-dark transition-colors shadow-lg"
              >
                Ver nuestros vehículos de alquiler
                <ArrowRight className="h-5 w-5" />
              </LocalizedLink>
              <LocalizedLink
                href="/tarifas"
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white font-bold px-6 py-3 rounded-xl hover:bg-white/20 transition-colors border border-white/20"
              >
                Consultar tarifas
              </LocalizedLink>
            </div>
          </div>
        </div>
      </section>

      {/* ============ ÁREAS DE SERVICIO Y PERNOCTA ============ */}
      <section id="areas" className="py-16 lg:py-24 bg-gray-50 scroll-mt-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-furgocasa-blue/10 rounded-2xl flex items-center justify-center text-furgocasa-blue">
                <Map className="h-7 w-7" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900">
                Áreas de servicio y pernocta
              </h2>
            </div>

            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              Las áreas de servicio para autocaravanas son espacios habilitados donde puedes vaciar aguas grises y negras, cargar agua limpia, y en muchos casos pernoctar. En España hay más de 700, y en Europa miles. Conocer dónde están es esencial para cualquier viaje en autocaravana.
            </p>
            <div className="rounded-2xl overflow-hidden shadow-lg mb-8 aspect-video relative">
              <Image src="/images/slides/hero-07.webp" alt="Área de pernocta para autocaravanas" fill className="object-cover" sizes="(max-width: 768px) 100vw, 1024px" />
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {[
                { icon: <Droplets className="h-6 w-6" />, title: "Vaciado de aguas", desc: "Puntos para vaciar aguas grises (fregadero, ducha) y negras (WC) de forma segura y ecológica" },
                { icon: <Zap className="h-6 w-6" />, title: "Electricidad", desc: "Muchas áreas ofrecen tomas de corriente para recargar las baterías de servicio del vehículo" },
                { icon: <Wifi className="h-6 w-6" />, title: "Servicios adicionales", desc: "WiFi, lavandería, duchas, barbacoas y zonas de ocio según el tipo de área" },
              ].map((item) => (
                <div key={item.title} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <div className="text-furgocasa-blue mb-3">{item.icon}</div>
                  <h3 className="font-heading font-bold text-gray-900 mb-1 text-sm">{item.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-br from-furgocasa-blue via-furgocasa-blue-dark to-gray-900 rounded-3xl p-8 md:p-10 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-72 h-72 bg-furgocasa-orange/10 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-yellow-400/20 text-yellow-300 text-xs font-bold px-3 py-1 rounded-full">
                    POWERED BY GPT-4
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-heading font-bold text-white mb-3">
                  Mapa Furgocasa
                </h3>
                <p className="text-blue-100 text-lg leading-relaxed mb-6 max-w-2xl">
                  Tenemos nuestra propia app con más de <strong className="text-white">1.000 áreas verificadas</strong> en España, Portugal, Francia, Andorra, Argentina y más países. Planifica rutas, encuentra áreas de pernocta cercanas y gestiona tu autocaravana con inteligencia artificial.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                  {[
                    { n: "+1.000", l: "Áreas verificadas" },
                    { n: "100%", l: "Gratis siempre" },
                    { n: "24/7", l: "Actualizado" },
                    { n: "GPT-4", l: "IA integrada" },
                  ].map((s) => (
                    <div key={s.l} className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 text-center">
                      <div className="text-lg font-heading font-bold text-white">{s.n}</div>
                      <div className="text-blue-200 text-xs">{s.l}</div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3">
                  <LocalizedLink
                    href="/mapa-areas"
                    className="inline-flex items-center gap-2 bg-furgocasa-orange text-white font-bold px-6 py-3 rounded-xl hover:bg-furgocasa-orange-dark transition-colors shadow-lg"
                  >
                    <Map className="h-5 w-5" />
                    Explorar Mapa Furgocasa
                  </LocalizedLink>
                  <a
                    href="https://www.mapafurgocasa.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white font-bold px-6 py-3 rounded-xl hover:bg-white/20 transition-colors border border-white/20"
                  >
                    Ir a la App
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-white rounded-2xl p-6 border border-gray-100">
              <h3 className="font-heading font-bold text-gray-900 mb-4">Tipos de áreas para autocaravanas</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { title: "Áreas públicas gratuitas", desc: "Gestionadas por ayuntamientos. Incluyen vaciado de aguas y a veces electricidad. Suelen tener limitación de estancia (24-72h)." },
                  { title: "Áreas privadas", desc: "Gestionadas por empresas o particulares. Más servicios (WiFi, duchas, lavandería) con tarifas de 8-15€/noche." },
                  { title: "Campings", desc: "Instalaciones completas con parcelas, piscina, restaurante. Ideales para estancias largas. Precios de 20-45€/noche según temporada." },
                  { title: "Parkings habilitados", desc: "Parkings que permiten pernocta de autocaravanas. Servicios mínimos pero ubicación céntrica. De 5-12€/noche." },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <CircleDot className="h-5 w-5 text-furgocasa-orange flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-gray-900 text-sm">{item.title}: </span>
                      <span className="text-gray-600 text-sm">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ DIRECTORIO DE SERVICIOS ============ */}
      <section id="directorio" className="py-16 lg:py-24 bg-white scroll-mt-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 mb-4">
              Directorio de talleres y concesionarios
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              El directorio más completo de España con más de {stats.total} talleres especializados y concesionarios de autocaravanas en {stats.provinces} provincias
            </p>
          </div>

          {/* Filtros */}
          <div className="max-w-4xl mx-auto mb-10">
            <div className="bg-gray-50 rounded-2xl p-4 md:p-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                <Filter className="h-4 w-4" />
                <span className="font-medium">Filtrar directorio</span>
                {(categoryFilter || provinceFilter || searchTerm) && (
                  <button
                    onClick={() => { setCategoryFilter(""); setProvinceFilter(""); setSearchTerm(""); }}
                    className="ml-auto flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
                  >
                    <X className="h-3 w-3" /> Limpiar filtros
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Búsqueda */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o ciudad..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-furgocasa-blue/20 focus:border-furgocasa-blue outline-none"
                  />
                </div>

                {/* Categoría */}
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-furgocasa-blue/20 focus:border-furgocasa-blue outline-none bg-white text-gray-700"
                >
                  <option value="">Todas las categorías</option>
                  <option value="taller_camper">Talleres ({stats.talleres})</option>
                  <option value="concesionario_autocaravanas">Concesionarios ({stats.concesionarios})</option>
                </select>

                {/* Provincia */}
                <select
                  value={provinceFilter}
                  onChange={(e) => setProvinceFilter(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-furgocasa-blue/20 focus:border-furgocasa-blue outline-none bg-white text-gray-700"
                >
                  <option value="">Todas las provincias</option>
                  {provinces.map((p) => (
                    <option key={p.province} value={p.province}>
                      {p.province} ({p.count})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Resultados */}
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <p className="text-sm text-gray-500">
                {loading ? "Buscando..." : `${totalCount} resultado${totalCount !== 1 ? 's' : ''}`}
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center rounded-lg border border-gray-200 p-1 bg-gray-50">
                  <button
                    onClick={() => setViewMode('grid')}
                    title="Vista grid"
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-white text-furgocasa-blue shadow-sm'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    title="Vista lista"
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list'
                        ? 'bg-white text-furgocasa-blue shadow-sm'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Ordenar:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'quality' | 'rating' | 'reviews')}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 bg-white focus:ring-2 focus:ring-furgocasa-blue/20 focus:border-furgocasa-blue outline-none"
                  >
                    <option value="quality">Recomendado</option>
                    <option value="rating">Valoración</option>
                    <option value="reviews">Nº reseñas</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Mostrar:</span>
                  <select
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value === "all" ? "all" : parseInt(e.target.value, 10))}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 bg-white focus:ring-2 focus:ring-furgocasa-blue/20 focus:border-furgocasa-blue outline-none"
                >
                  {PAGE_SIZE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt === "all" ? "Todos" : opt}
                    </option>
                  ))}
                </select>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-2xl h-48 animate-pulse" />
                ))}
              </div>
            ) : services.length > 0 ? (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {paginatedServices.map((service) => (
                      <ServiceCard key={service.id} service={service} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                    {paginatedServices.map((service) => (
                      <ServiceListRow key={service.id} service={service} />
                    ))}
                  </div>
                )}

                {totalPages > 1 && (
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                        let pageNum: number;
                        if (totalPages <= 7) {
                          pageNum = i + 1;
                        } else if (currentPage <= 4) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 3) {
                          pageNum = totalPages - 6 + i;
                        } else {
                          pageNum = currentPage - 3 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                              currentPage === pageNum
                                ? 'bg-furgocasa-blue text-white'
                                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    <span className="text-sm text-gray-500 ml-2">
                      Página {currentPage} de {totalPages}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No se encontraron resultados</p>
                <p className="text-sm mt-1">Prueba con otros filtros o términos de búsqueda</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section id="faq" className="py-16 lg:py-24 bg-gray-50 scroll-mt-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 mb-4 text-center">
              Preguntas frecuentes sobre autocaravanas
            </h2>
            <p className="text-gray-500 text-center mb-10">
              Resolvemos las dudas más comunes sobre el mundo de las autocaravanas
            </p>

            <div className="space-y-3">
              {FAQ_DATA.map((faq, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between gap-4 p-5 text-left"
                  >
                    <span className="font-heading font-bold text-gray-900 text-base">{faq.q}</span>
                    <ChevronDown className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                      openFaq === i ? 'rotate-180' : ''
                    }`} />
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5 text-gray-600 leading-relaxed text-sm border-t border-gray-50 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ CTA FINAL ============ */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-furgocasa-orange via-red-500 to-furgocasa-orange-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }} />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl lg:text-4xl font-heading font-bold text-white mb-4">
            ¿Listo para vivir la experiencia autocaravanista?
          </h2>
          <p className="text-white/80 text-lg max-w-2xl mx-auto mb-8">
            En Furgocasa ponemos a tu disposición las mejores autocaravanas y campers de alquiler desde Murcia, con entrega en toda España
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <LocalizedLink
              href="/vehiculos"
              className="inline-flex items-center gap-2 bg-white text-furgocasa-orange font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors shadow-xl text-lg"
            >
              Ver vehículos disponibles
              <ArrowRight className="h-5 w-5" />
            </LocalizedLink>
            <LocalizedLink
              href="/contacto"
              className="inline-flex items-center gap-2 bg-transparent text-white font-bold px-8 py-4 rounded-xl border-2 border-white/30 hover:bg-white/10 transition-colors text-lg"
            >
              Contactar
            </LocalizedLink>
          </div>
        </div>
      </section>

      {/* ============ FAQ SCHEMA (JSON-LD) ============ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": FAQ_DATA.map((faq) => ({
              "@type": "Question",
              "name": faq.q,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.a,
              },
            })),
          }),
        }}
      />

      {/* ============ BREADCRUMB SCHEMA ============ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://www.furgocasa.com/es" },
              { "@type": "ListItem", "position": 2, "name": "Autocaravanas", "item": "https://www.furgocasa.com/es/autocaravanas" },
            ],
          }),
        }}
      />

      {/* ============ ARTICLE SCHEMA ============ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Autocaravanas: Guía Completa 2026",
            "description": "Todo sobre autocaravanas en España: tipos, permisos, normativa, peso, seguros, mantenimiento y directorio de servicios.",
            "author": { "@type": "Organization", "name": "Furgocasa" },
            "publisher": { "@type": "Organization", "name": "Furgocasa", "url": "https://www.furgocasa.com" },
            "datePublished": "2026-03-01",
            "dateModified": "2026-03-01",
            "mainEntityOfPage": "https://www.furgocasa.com/es/autocaravanas",
          }),
        }}
      />
    </main>
  );
}
