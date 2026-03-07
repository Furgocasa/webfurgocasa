/**
 * Contenido de la guía de autocaravanas por idioma.
 * EN: Contenido centrado explícitamente en España (normativa española, DGT, etc.)
 * ES: Contenido en español (España implícito)
 */

export type AutocaravanasLocale = 'es' | 'en';

export interface MotorhomeTypeContent {
  name: string;
  aka: string;
  description: string;
  pros: string[];
  cons: string[];
  length: string;
  weight: string;
  beds: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface AutocaravanasContent {
  hero: {
    h1: string;
    subtitle: string;
    stats: { n: string; l: string }[];
  };
  toc: { id: string; label: string }[];
  queEs: {
    h2: string;
    p1: string;
    p2: string;
    vsTitle: string;
    motorhome: string;
    camper: string;
    caravan: string;
  };
  tipos: {
    h2: string;
    subtitle: string;
    types: MotorhomeTypeContent[];
    length: string;
    weight: string;
    beds: string;
    permit: string;
    pros: string;
    cons: string;
    alsoKnown: string;
  };
  permisos: {
    h2: string;
    bTitle: string;
    bDesc: string;
    c1Title: string;
    c1Desc: string;
    important: string;
    importantText: string;
  };
  normativa: {
    h2: string;
    estacionamiento: { title: string; text: string };
    pernocta: { title: string; text: string };
    itv: { title: string; text: string };
    velocidad: { title: string; text: string };
    ivtm: { title: string; text: string };
    peajes: { title: string; text: string };
  };
  peso: {
    h2: string;
    intro: string;
    mma: string;
    tara: string;
    cargaUtil: string;
    pesoReal: string;
    excesoTitle: string;
    excesoText: string;
  };
  seguros: {
    h2: string;
    basico: { title: string; price: string; items: string[] };
    ampliado: { title: string; price: string; items: string[] };
    todoRiesgo: { title: string; price: string; items: string[] };
  };
  mantenimiento: {
    h2: string;
    items: { title: string; desc: string }[];
  };
  comprar: {
    h2: string;
    nueva: { title: string; items: string[] };
    segundaMano: { title: string; items: string[] };
    cta: string;
  };
  alquilar: {
    h2: string;
    intro: string;
    items: { title: string; desc: string }[];
    ctaVehiculos: string;
    ctaTarifas: string;
  };
  areas: {
    h2: string;
    intro: string;
    vaciado: { title: string; desc: string };
    electricidad: { title: string; desc: string };
    servicios: { title: string; desc: string };
    mapaTitle: string;
    mapaDesc: string;
    mapaStats: { n: string; l: string }[];
    explorarMapa: string;
    irApp: string;
    tiposTitle: string;
    tiposItems: { title: string; desc: string }[];
  };
  directorio: {
    h2: string;
    intro: (total: number, provinces: number) => string;
    filtrar: string;
    limpiar: string;
    buscarPlaceholder: string;
    talleres: string;
    concesionarios: string;
    ordenar: string;
    mostrar: string;
    resultados: string;
  };
  faq: {
    h2: string;
    subtitle: string;
    items: FaqItem[];
  };
  cta: {
    h2: string;
    intro: string;
    ctaVehiculos: string;
    ctaContacto: string;
  };
  benefits: { title: string; desc: string }[];
}

const CONTENT_ES: AutocaravanasContent = {
  hero: {
    h1: "Autocaravanas",
    subtitle: "La guía más completa de España: tipos, permisos, normativa, mantenimiento y el mayor directorio de talleres y concesionarios",
    stats: [
      { n: "+", l: "Servicios" },
      { n: "", l: "Talleres" },
      { n: "", l: "Concesionarios" },
      { n: "", l: "Provincias" },
    ],
  },
  toc: [
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
  ],
  queEs: {
    h2: "¿Qué es una autocaravana?",
    p1: "Una autocaravana es un vehículo que integra un espacio habitable sobre un chasis motorizado. A diferencia de una caravana (que necesita ser remolcada), la autocaravana tiene motor propio y se conduce como un vehículo convencional. En su interior incluye zona de dormitorio, cocina, baño y salón-comedor.",
    p2: "En España, las autocaravanas están clasificadas como vehículos vivienda y deben cumplir la homologación como tal. Según la DGT, se definen como \"vehículos construidos con propósito especial, incluyendo alojamiento, que contiene al menos el equipamiento siguiente: asientos y mesa, camas o literas y cocina\".",
    vsTitle: "Autocaravana vs Camper vs Caravana",
    motorhome: "Vehículo con carrocería habitable construida sobre un chasis-cabina. Tiene motor propio.",
    camper: "Furgoneta comercial adaptada como vivienda manteniendo su carrocería original.",
    caravan: "Remolque habitable sin motor. Necesita un vehículo tractor para desplazarse.",
  },
  tipos: {
    h2: "Tipos de autocaravanas",
    subtitle: "Conoce las diferencias entre cada tipo para elegir la que mejor se adapta a tus necesidades",
    types: [
      {
        name: "Autocaravana Perfilada",
        aka: "Semi-integral",
        description: "La cabina del conductor se integra parcialmente con el habitáculo. El techo cae en forma aerodinámica sobre la cabina. Es el tipo más popular por su equilibrio entre espacio, conducción y precio.",
        pros: ["Buena aerodinámica y consumo", "Fácil de conducir", "Precio intermedio", "Buena habitabilidad"],
        cons: ["Menos espacio que una integral", "Cama sobre cabina limitada"],
        length: "6 - 7,5 m",
        weight: "3.000 - 3.500 kg",
        beds: "2 - 4",
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
      },
    ],
    length: "Longitud",
    weight: "Peso MMA",
    beds: "Plazas dormir",
    permit: "Permiso",
    pros: "Ventajas",
    cons: "Inconvenientes",
    alsoKnown: "También conocida como:",
  },
  permisos: {
    h2: "Permisos de conducir para autocaravanas",
    bTitle: "Hasta 3.500 kg de MMA",
    bDesc: "El carnet de conducir estándar. Válido para la gran mayoría de autocaravanas del mercado, incluyendo perfiladas, capuchinas y furgonetas camperizadas. Con el B puedes conducir cualquier autocaravana cuya Masa Máxima Autorizada no supere los 3.500 kg, independientemente del número de plazas.",
    c1Title: "De 3.500 kg a 7.500 kg",
    c1Desc: "Necesario para autocaravanas integrales grandes que superan los 3.500 kg. Se obtiene con un examen teórico y práctico específico. Edad mínima: 21 años. Requiere renovación cada 5 años con reconocimiento médico.",
    important: "Importante",
    importantText: "El peso que cuenta es la MMA (Masa Máxima Autorizada), NO el peso real del vehículo. Es decir, aunque tu autocaravana pese 3.200 kg en vacío, si su MMA es de 3.500 kg, puedes conducirla con el permiso B. Si la MMA supera los 3.500 kg aunque sea por 1 kg, necesitas el C1.",
  },
  normativa: {
    h2: "Normativa de autocaravanas en España",
    estacionamiento: {
      title: "Estacionamiento",
      text: "Las autocaravanas pueden estacionar en cualquier lugar donde esté permitido el estacionamiento de vehículos de sus dimensiones. La DGT establece que una autocaravana estacionada tiene los mismos derechos y deberes que cualquier otro vehículo.",
    },
    pernocta: {
      title: "Pernocta vs Acampada",
      text: "Pernoctar (dormir dentro del vehículo estacionado) es legal. Acampar (sacar toldos, mesas, calzar el vehículo, extender elementos fuera del perímetro) está generalmente prohibido fuera de zonas habilitadas.",
    },
    itv: {
      title: "ITV",
      text: "Primera ITV a los 4 años. Cada 2 años hasta los 10 años. Anual a partir de los 10 años. Se revisan: frenos, luces, emisiones, sistema de gas (si procede), estructura y habitabilidad.",
    },
    velocidad: {
      title: "Velocidad máxima",
      text: "Autocaravanas hasta 3.500 kg: mismos límites que turismos (120 km/h autopista, 90 km/h carretera convencional). Más de 3.500 kg: 90 km/h en autopista, 80 km/h en carretera convencional.",
    },
    ivtm: {
      title: "Impuesto de circulación (IVTM)",
      text: "Las autocaravanas tributan como vehículos de turismo según su potencia fiscal. El importe varía según el municipio. Generalmente oscila entre 60€ y 200€/año.",
    },
    peajes: {
      title: "Peajes y ferris",
      text: "En peajes, las autocaravanas se clasifican según su altura (generalmente >2m = categoría superior). En ferris, la tarifa depende de la longitud del vehículo. Consulta siempre las dimensiones exactas de tu autocaravana.",
    },
  },
  peso: {
    h2: "Peso y dimensiones",
    intro: "Entender el peso de tu autocaravana es fundamental, tanto para elegir el permiso correcto como para no exceder la carga máxima permitida.",
    mma: "MMA (Masa Máxima Autorizada): Peso máximo total que el vehículo puede alcanzar cargado. Es el dato que determina qué permiso necesitas.",
    tara: "Tara: Peso del vehículo en vacío, sin pasajeros ni carga, pero con depósitos llenos (agua, combustible).",
    cargaUtil: "Carga útil: MMA - Tara = lo que puedes cargar (personas, equipaje, comida, agua adicional). Suele estar entre 300 y 600 kg.",
    pesoReal: "Peso real: Peso actual del vehículo en un momento dado. NUNCA debe superar la MMA.",
    excesoTitle: "Exceso de peso: multas y riesgos",
    excesoText: "Circular con exceso de peso es infracción grave. Las multas van desde 200€ hasta 500€ dependiendo del porcentaje de exceso. Además, el exceso de peso afecta a la frenada, estabilidad y desgaste de neumáticos, y puede invalidar el seguro en caso de accidente.",
  },
  seguros: {
    h2: "Seguro de autocaravanas",
    basico: {
      title: "Terceros básico",
      price: "Desde 250€/año",
      items: ["Responsabilidad civil obligatoria", "Defensa jurídica", "Reclamación de daños"],
    },
    ampliado: {
      title: "Terceros ampliado",
      price: "Desde 400€/año",
      items: ["Todo lo del básico", "Robo e incendio", "Lunas", "Asistencia en viaje 24h", "Cobertura del contenido"],
    },
    todoRiesgo: {
      title: "Todo riesgo",
      price: "Desde 600€/año",
      items: ["Todo lo del ampliado", "Daños propios", "Sin franquicia (opción)", "Vehículo de sustitución", "Cobertura en Europa"],
    },
  },
  mantenimiento: {
    h2: "Mantenimiento de autocaravanas",
    items: [
      { title: "Motor y mecánica", desc: "Mismo mantenimiento que una furgoneta: aceite, filtros, correa de distribución, frenos. Intervalos cada 15.000-30.000 km según fabricante." },
      { title: "Sistema de agua", desc: "Sanear depósitos con productos específicos. Vaciar en invierno para evitar congelaciones. Revisar bomba de agua y conexiones periódicamente." },
      { title: "Sistema eléctrico", desc: "Verificar estado de baterías auxiliares (AGM, gel o litio). Comprobar carga del panel solar. Revisar conexiones y fusibles." },
      { title: "Gas y calefacción", desc: "Revisión anual del sistema de gas por un profesional. Comprobar estanqueidad de conexiones. Limpieza de filtros de la calefacción estacionaria." },
      { title: "Neumáticos", desc: "Las autocaravanas pasan mucho tiempo paradas. Los neumáticos se degradan con el tiempo (cambiar cada 5-6 años máximo) aunque tengan dibujo. Vigilar la presión." },
      { title: "Sellados y carrocería", desc: "Inspeccionar juntas y sellados de ventanas, lucernarios y claraboyas al menos una vez al año. Las filtraciones de agua son el mayor enemigo de una autocaravana." },
    ],
  },
  comprar: {
    h2: "Comprar una autocaravana",
    nueva: {
      title: "Nueva",
      items: ["Garantía del fabricante (2-3 años)", "Personalización a tu gusto", "Últimas tecnologías", "Mayor inversión inicial", "Depreciación los primeros años"],
    },
    segundaMano: {
      title: "Segunda mano",
      items: ["Precio mucho más accesible", "Menor depreciación", "Pueden incluir extras ya instalados", "Revisar posibles filtraciones", "Menor vida útil restante"],
    },
    cta: "Ver autocaravanas en venta en Furgocasa",
  },
  alquilar: {
    h2: "Alquiler de autocaravanas",
    intro: "Si estás pensando en probar la experiencia autocaravanista antes de comprar, o simplemente quieres disfrutar de unas vacaciones diferentes, el alquiler es la opción perfecta.",
    items: [
      { title: "Sin preocupaciones", desc: "Seguro incluido, asistencia 24h, mantenimiento a cargo de la empresa" },
      { title: "Flexibilidad total", desc: "Elige las fechas, el vehículo y los extras que necesites" },
      { title: "Prueba antes de comprar", desc: "Descubre qué tipo de autocaravana se adapta a ti" },
    ],
    ctaVehiculos: "Ver nuestros vehículos de alquiler",
    ctaTarifas: "Consultar tarifas",
  },
  areas: {
    h2: "Áreas de servicio y pernocta",
    intro: "Las áreas de servicio para autocaravanas son espacios habilitados donde puedes vaciar aguas grises y negras, cargar agua limpia, y en muchos casos pernoctar. En España hay más de 700, y en Europa miles. Conocer dónde están es esencial para cualquier viaje en autocaravana.",
    vaciado: { title: "Vaciado de aguas", desc: "Puntos para vaciar aguas grises (fregadero, ducha) y negras (WC) de forma segura y ecológica" },
    electricidad: { title: "Electricidad", desc: "Muchas áreas ofrecen tomas de corriente para recargar las baterías de servicio del vehículo" },
    servicios: { title: "Servicios adicionales", desc: "WiFi, lavandería, duchas, barbacoas y zonas de ocio según el tipo de área" },
    mapaTitle: "Mapa Furgocasa",
    mapaDesc: "Tenemos nuestra propia app con más de 1.000 áreas verificadas en España, Portugal, Francia, Andorra, Argentina y más países. Planifica rutas, encuentra áreas de pernocta cercanas y gestiona tu autocaravana con inteligencia artificial.",
    mapaStats: [
      { n: "+1.000", l: "Áreas verificadas" },
      { n: "100%", l: "Gratis siempre" },
      { n: "24/7", l: "Actualizado" },
      { n: "GPT-4", l: "IA integrada" },
    ],
    explorarMapa: "Explorar Mapa Furgocasa",
    irApp: "Ir a la App",
    tiposTitle: "Tipos de áreas para autocaravanas",
    tiposItems: [
      { title: "Áreas públicas gratuitas", desc: "Gestionadas por ayuntamientos. Incluyen vaciado de aguas y a veces electricidad. Suelen tener limitación de estancia (24-72h)." },
      { title: "Áreas privadas", desc: "Gestionadas por empresas o particulares. Más servicios (WiFi, duchas, lavandería) con tarifas de 8-15€/noche." },
      { title: "Campings", desc: "Instalaciones completas con parcelas, piscina, restaurante. Ideales para estancias largas. Precios de 20-45€/noche según temporada." },
      { title: "Parkings habilitados", desc: "Parkings que permiten pernocta de autocaravanas. Servicios mínimos pero ubicación céntrica. De 5-12€/noche." },
    ],
  },
  directorio: {
    h2: "Directorio de talleres y concesionarios",
    intro: (total, provinces) => `El directorio más completo de España con más de ${total} talleres especializados y concesionarios de autocaravanas en ${provinces} provincias`,
    filtrar: "Filtrar directorio",
    limpiar: "Limpiar filtros",
    buscarPlaceholder: "Buscar por nombre o ciudad...",
    talleres: "Talleres",
    concesionarios: "Concesionarios",
    ordenar: "Ordenar",
    mostrar: "Mostrar",
    resultados: "resultados",
  },
  faq: {
    h2: "Preguntas frecuentes sobre autocaravanas",
    subtitle: "Resolvemos las dudas más comunes sobre el mundo de las autocaravanas",
    items: [
      { q: "¿Qué permiso necesito para conducir una autocaravana?", a: "Con el permiso B puedes conducir autocaravanas de hasta 3.500 kg de MMA (Masa Máxima Autorizada). Para autocaravanas de más de 3.500 kg necesitas el permiso C1, que permite conducir vehículos de hasta 7.500 kg. La gran mayoría de autocaravanas de alquiler no superan los 3.500 kg." },
      { q: "¿Cuánto cuesta una autocaravana nueva?", a: "Los precios varían enormemente según el tipo. Una furgoneta camperizada nueva parte desde 45.000-55.000€. Las autocaravanas perfiladas arrancan desde 55.000-70.000€. Las integrales, desde 80.000€ hasta más de 150.000€. Las capuchinas, desde 50.000-65.000€. El mercado de segunda mano ofrece opciones desde 15.000-20.000€." },
      { q: "¿Se puede pernoctar con autocaravana en España?", a: "Sí, pernoctar (dormir dentro del vehículo estacionado) es legal en la mayoría de vías públicas donde el estacionamiento esté permitido. Lo que está regulado y generalmente prohibido es la acampada libre (sacar toldos, mesas, sillas, calzar el vehículo). Cada comunidad autónoma y municipio puede tener normativa específica." },
      { q: "¿Cuál es la diferencia entre autocaravana y camper?", a: "La diferencia principal está en la base. Una autocaravana se construye sobre un chasis-cabina con una carrocería habitable independiente (integral, perfilada o capuchina). Una camper o furgoneta camperizada se construye dentro de una furgoneta comercial manteniendo su carrocería original. Las campers son más compactas y fáciles de conducir." },
      { q: "¿Cada cuánto hay que pasar la ITV a una autocaravana?", a: "Las autocaravanas nuevas pasan la primera ITV a los 4 años. Después, cada 2 años hasta que cumplen 10 años de antigüedad. A partir de los 10 años, la ITV es anual. Los vehículos catalogados como vivienda tienen la misma periodicidad que los turismos." },
      { q: "¿Qué seguro necesita una autocaravana?", a: "Como mínimo, un seguro obligatorio de responsabilidad civil. Se recomienda un seguro a terceros ampliado o a todo riesgo que cubra: asistencia en viaje 24h, robo, incendio, lunas, daños propios y contenido interior. Las aseguradoras especializadas como Fénix Directo, Camperfriend o Verti ofrecen pólizas específicas." },
      { q: "¿Cuánto consume una autocaravana?", a: "El consumo depende del tipo y motorización. Una furgoneta camperizada consume entre 8-10 L/100km. Una perfilada entre 10-12 L/100km. Una integral o capuchina entre 11-14 L/100km. Factores como el peso de carga, la velocidad y las condiciones del viento influyen significativamente." },
      { q: "¿Es mejor alquilar o comprar una autocaravana?", a: "Depende del uso. Si piensas usarla menos de 8-10 semanas al año, alquilar suele ser más económico (no pagas seguro, ITV, plaza de parking, mantenimiento ni depreciación). Comprar merece la pena si la usas frecuentemente, quieres personalizarla a tu gusto, o planeas vivir a bordo de forma permanente." },
      { q: "¿Dónde puedo vaciar las aguas grises y negras?", a: "En las áreas de servicio para autocaravanas, que incluyen puntos de vaciado de aguas grises y negras, toma de agua limpia, y a veces electricidad. En España hay más de 700 áreas de servicio. También puedes vaciar en muchos campings y estaciones de servicio adaptadas. Nunca vacíes aguas en la naturaleza." },
      { q: "¿Puedo llevar mascotas en una autocaravana de alquiler?", a: "Depende de la empresa de alquiler. En Furgocasa permitimos mascotas en todos nuestros vehículos. Es importante comunicarlo al hacer la reserva. Se recomienda llevar una funda protectora para el asiento y los utensilios de la mascota." },
    ],
  },
  cta: {
    h2: "¿Listo para vivir la experiencia autocaravanista?",
    intro: "En Furgocasa ponemos a tu disposición las mejores autocaravanas y campers de alquiler desde Murcia, con entrega en toda España",
    ctaVehiculos: "Ver vehículos disponibles",
    ctaContacto: "Contactar",
  },
  benefits: [
    { title: "Kilómetros Ilimitados", desc: "Viaja sin límites por España y Europa" },
    { title: "Atención Personalizada", desc: "Te acompañamos antes, durante y después del viaje" },
    { title: "Flota Premium", desc: "Vehículos modernos y perfectamente equipados" },
    { title: "Todo Incluido", desc: "Cocina completa, ropa de cama, kit de camping" },
    { title: "Cancelación flexible", desc: "Cancela hasta 60 días antes sin coste" },
    { title: "Atención 24/7", desc: "Te acompañamos durante todo el viaje" },
  ],
};

// English content - explicitly focused on Spain (Spanish regulations, DGT, etc.)
const CONTENT_EN: AutocaravanasContent = {
  hero: {
    h1: "Motorhomes in Spain",
    subtitle: "The most complete guide to motorhomes in Spain: types, driving licences, Spanish regulations (DGT), maintenance and the largest directory of workshops and dealers in Spain",
    stats: [
      { n: "+", l: "Services" },
      { n: "", l: "Workshops" },
      { n: "", l: "Dealers" },
      { n: "", l: "Provinces" },
    ],
  },
  toc: [
    { id: "que-es", label: "What is" },
    { id: "tipos", label: "Types" },
    { id: "permisos", label: "Licences" },
    { id: "normativa", label: "Regulations" },
    { id: "peso", label: "Weight" },
    { id: "seguros", label: "Insurance" },
    { id: "mantenimiento", label: "Maintenance" },
    { id: "comprar", label: "Buying" },
    { id: "alquilar", label: "Renting" },
    { id: "areas", label: "Areas" },
    { id: "directorio", label: "Directory" },
    { id: "faq", label: "FAQ" },
  ],
  queEs: {
    h2: "What is a motorhome in Spain?",
    p1: "A motorhome is a vehicle that integrates a living space on a motorised chassis. Unlike a caravan (which needs to be towed), the motorhome has its own engine and is driven like a conventional vehicle. Inside it includes a bedroom area, kitchen, bathroom and living-dining room.",
    p2: "In Spain, motorhomes are classified as residential vehicles (vehículos vivienda) and must meet Spanish homologation. According to the Spanish traffic authority (DGT - Dirección General de Tráfico), they are defined as vehicles built for a special purpose, including accommodation, with at least: seats and table, beds or bunks, and kitchen.",
    vsTitle: "Motorhome vs Camper vs Caravan",
    motorhome: "Vehicle with habitable body built on a cab chassis. Has its own engine.",
    camper: "Commercial van adapted as living space while keeping its original bodywork.",
    caravan: "Habitable trailer without engine. Needs a towing vehicle to move.",
  },
  tipos: {
    h2: "Types of motorhomes in Spain",
    subtitle: "Learn the differences between each type available in Spain to choose the one that best suits your needs",
    types: [
      {
        name: "Semi-integrated Motorhome",
        aka: "Profile",
        description: "The driver's cab partially integrates with the living area. The roof slopes aerodynamically over the cab. It is the most popular type for its balance between space, driving and price.",
        pros: ["Good aerodynamics and fuel consumption", "Easy to drive", "Mid-range price", "Good habitability"],
        cons: ["Less space than an A-class", "Limited overcab bed"],
        length: "6 - 7.5 m",
        weight: "3,000 - 3,500 kg",
        beds: "2 - 4",
      },
      {
        name: "A-class Motorhome",
        aka: "Integral",
        description: "The chassis and body form a single unit. Offers maximum living space and the best living experience. The driving cab is fully integrated into the lounge.",
        pros: ["Maximum living space", "Great brightness (panoramic windscreen)", "Better insulation", "Maximum comfort"],
        cons: ["Higher price", "Harder to manoeuvre", "Higher consumption", "May require C1 licence"],
        length: "7 - 9 m",
        weight: "3,500 - 5,000 kg",
        beds: "4 - 6",
      },
      {
        name: "Overcab Motorhome",
        aka: "Capuchina",
        description: "Distinguished by the characteristic loft over the driving cab that houses a double bed. It is the favourite option for families with children as it offers the most sleeping places.",
        pros: ["More sleeping places (up to 7)", "Ideal for families", "Good space/price ratio", "Permanent bed in loft"],
        cons: ["Greater total height", "Poorer aerodynamics", "Less aesthetic appearance", "Higher consumption due to wind resistance"],
        length: "6.5 - 7.5 m",
        weight: "3,200 - 3,500 kg",
        beds: "4 - 7",
      },
      {
        name: "Camper Van",
        aka: "Converted van",
        description: "Large vans (such as Fiat Ducato, Mercedes Sprinter, VW Crafter) converted into living space. They combine the practicality of a van with the comforts of a compact motorhome.",
        pros: ["Easy to park and drive", "Fits in normal parking", "Low consumption", "Day-to-day versatility"],
        cons: ["More limited space", "Portable chemical toilet", "Less storage"],
        length: "5.4 - 6.4 m",
        weight: "2,800 - 3,500 kg",
        beds: "2 - 3",
      },
    ],
    length: "Length",
    weight: "GVWR",
    beds: "Sleeping places",
    permit: "Licence",
    pros: "Advantages",
    cons: "Disadvantages",
    alsoKnown: "Also known as:",
  },
  permisos: {
    h2: "Driving licences for motorhomes in Spain",
    bTitle: "Up to 3,500 kg GVWR (category B)",
    bDesc: "The standard Spanish driving licence (carnet B). Valid for the vast majority of motorhomes on the Spanish market, including semi-integrated, overcab and camper vans. With a category B licence you can drive any motorhome whose Maximum Authorised Mass (MMA) does not exceed 3,500 kg in Spain, regardless of the number of seats.",
    c1Title: "From 3,500 kg to 7,500 kg (category C1)",
    c1Desc: "Required in Spain for large A-class motorhomes that exceed 3,500 kg. Obtained with a specific theory and practical test at a Spanish driving school. Minimum age: 21 years. Requires renewal every 5 years with a medical examination.",
    important: "Important (Spanish law)",
    importantText: "In Spain, the weight that counts is the MMA (Masa Máxima Autorizada / GVWR), NOT the actual weight of the vehicle. So even if your motorhome weighs 3,200 kg empty, if its MMA is 3,500 kg, you can drive it with a category B licence. If the MMA exceeds 3,500 kg even by 1 kg, you need a C1 licence in Spain.",
  },
  normativa: {
    h2: "Motorhome regulations in Spain (Spanish law)",
    estacionamiento: {
      title: "Parking in Spain",
      text: "In Spain, motorhomes can park anywhere where parking of vehicles of their dimensions is permitted. The Spanish DGT (Dirección General de Tráfico - traffic authority) states that a parked motorhome has the same rights and duties as any other vehicle.",
    },
    pernocta: {
      title: "Overnight stay vs Camping in Spain",
      text: "Staying overnight (sleeping inside the parked vehicle) is legal in Spain. Wild camping (setting up awnings, tables, levelling the vehicle, extending elements outside the perimeter) is generally prohibited outside designated areas in Spain.",
    },
    itv: {
      title: "ITV (Spanish MOT)",
      text: "In Spain, motorhomes pass their first ITV (Inspección Técnica de Vehículos) at 4 years. Then every 2 years until 10 years. Annual from 10 years onwards. Checks include: brakes, lights, emissions, gas system (if applicable), structure and habitability.",
    },
    velocidad: {
      title: "Speed limits in Spain",
      text: "In Spain, motorhomes up to 3,500 kg: same limits as cars (120 km/h motorway, 90 km/h conventional road). Over 3,500 kg: 90 km/h on motorway, 80 km/h on conventional road.",
    },
    ivtm: {
      title: "IVTM - Road tax in Spain",
      text: "In Spain, motorhomes pay IVTM (Impuesto sobre Vehículos de Tracción Mecánica) as tourist vehicles according to their fiscal power. The amount varies by Spanish municipality. Generally between €60 and €200/year.",
    },
    peajes: {
      title: "Tolls and ferries",
      text: "At tolls, motorhomes are classified according to their height (generally >2m = higher category). On ferries, the fare depends on the length of the vehicle. Always check the exact dimensions of your motorhome.",
    },
  },
  peso: {
    h2: "Weight and dimensions (Spain)",
    intro: "Understanding the weight of your motorhome is essential in Spain, both for choosing the correct driving licence and for not exceeding the maximum permitted load.",
    mma: "GVWR (Gross Vehicle Weight Rating): Maximum total weight the vehicle can reach when loaded. This is the figure that determines which licence you need.",
    tara: "Unladen weight: Weight of the vehicle empty, without passengers or cargo, but with full tanks (water, fuel).",
    cargaUtil: "Payload: GVWR - Unladen weight = what you can load (people, luggage, food, additional water). Usually between 300 and 600 kg.",
    pesoReal: "Actual weight: Current weight of the vehicle at any given time. It must NEVER exceed the GVWR.",
    excesoTitle: "Overloading: fines and risks",
    excesoText: "Driving overloaded is a serious offence in Spain. Fines range from €200 to €500 depending on the percentage of overload. In addition, overload affects braking, stability and tyre wear, and can invalidate insurance in the event of an accident.",
  },
  seguros: {
    h2: "Motorhome insurance in Spain",
    basico: {
      title: "Third party basic",
      price: "From €250/year",
      items: ["Compulsory civil liability", "Legal defence", "Damage claims"],
    },
    ampliado: {
      title: "Third party extended",
      price: "From €400/year",
      items: ["Everything in basic", "Theft and fire", "Windows", "24h travel assistance", "Contents cover"],
    },
    todoRiesgo: {
      title: "Comprehensive",
      price: "From €600/year",
      items: ["Everything in extended", "Own damage", "No excess (option)", "Replacement vehicle", "Cover in Europe"],
    },
  },
  mantenimiento: {
    h2: "Motorhome maintenance in Spain",
    items: [
      { title: "Engine and mechanics", desc: "Same maintenance as a van: oil, filters, timing belt, brakes. Intervals every 15,000-30,000 km depending on manufacturer." },
      { title: "Water system", desc: "Sanitise tanks with specific products. Empty in winter to avoid freezing. Check water pump and connections periodically." },
      { title: "Electrical system", desc: "Check condition of auxiliary batteries (AGM, gel or lithium). Check solar panel charge. Inspect connections and fuses." },
      { title: "Gas and heating", desc: "Annual inspection of the gas system by a professional. Check tightness of connections. Clean filters of the stationary heater." },
      { title: "Tyres", desc: "Motorhomes spend a lot of time stationary. Tyres degrade over time (change every 5-6 years maximum) even with tread. Monitor pressure." },
      { title: "Seals and bodywork", desc: "Inspect seals of windows, skylights and roof lights at least once a year. Water leaks are the biggest enemy of a motorhome." },
    ],
  },
  comprar: {
    h2: "Buying a motorhome in Spain",
    nueva: {
      title: "New",
      items: ["Manufacturer warranty (2-3 years)", "Customisation to your taste", "Latest technology", "Higher initial investment", "Depreciation in early years"],
    },
    segundaMano: {
      title: "Second hand",
      items: ["Much more affordable price", "Less depreciation", "May include extras already installed", "Check for possible leaks", "Less remaining useful life"],
    },
    cta: "View motorhomes for sale at Furgocasa",
  },
  alquilar: {
    h2: "Renting a motorhome in Spain",
    intro: "If you're thinking of trying the motorhome experience before buying, or simply want to enjoy a different holiday, renting is the perfect option. Furgocasa offers motorhome rental from Murcia, with delivery throughout Spain.",
    items: [
      { title: "Worry-free", desc: "Insurance included, 24h assistance, maintenance by the company" },
      { title: "Total flexibility", desc: "Choose the dates, vehicle and extras you need" },
      { title: "Try before you buy", desc: "Discover which type of motorhome suits you" },
    ],
    ctaVehiculos: "View our rental vehicles",
    ctaTarifas: "Check rates",
  },
  areas: {
    h2: "Service areas and overnight stays in Spain",
    intro: "Motorhome service areas (áreas de servicio) are designated spaces in Spain where you can empty grey and black water, fill with clean water, and in many cases stay overnight. Spain has over 700 service areas for motorhomes, and thousands across Europe. Knowing where they are is essential for any motorhome trip in Spain.",
    vaciado: { title: "Water disposal", desc: "Points to empty grey water (sink, shower) and black water (toilet) safely and ecologically" },
    electricidad: { title: "Electricity", desc: "Many areas offer power points to recharge the vehicle's service batteries" },
    servicios: { title: "Additional services", desc: "WiFi, laundry, showers, barbecues and leisure areas depending on the type of area" },
    mapaTitle: "Furgocasa Map",
    mapaDesc: "We have our own app with over 1,000 verified areas in Spain, Portugal, France, Andorra, Argentina and more countries. Plan routes in Spain, find nearby overnight areas and manage your motorhome with artificial intelligence.",
    mapaStats: [
      { n: "+1,000", l: "Verified areas" },
      { n: "100%", l: "Always free" },
      { n: "24/7", l: "Updated" },
      { n: "GPT-4", l: "Built-in AI" },
    ],
    explorarMapa: "Explore Furgocasa Map",
    irApp: "Go to App",
    tiposTitle: "Types of motorhome areas in Spain",
    tiposItems: [
      { title: "Free public areas in Spain", desc: "Managed by Spanish local councils (ayuntamientos). Include water disposal and sometimes electricity. Usually have stay limits (24-72h)." },
      { title: "Private areas", desc: "Managed by companies or individuals. More services (WiFi, showers, laundry) with rates of €8-15/night." },
      { title: "Campsites", desc: "Full facilities with pitches, pool, restaurant. Ideal for long stays. Prices €20-45/night depending on season." },
      { title: "Designated parkings", desc: "Car parks that allow motorhome overnight stays. Minimal services but central location. €5-12/night." },
    ],
  },
  directorio: {
    h2: "Directory of workshops and dealers in Spain",
    intro: (total, provinces) => `The most complete directory in Spain with over ${total} specialised workshops and motorhome dealers in ${provinces} provinces`,
    filtrar: "Filter directory",
    limpiar: "Clear filters",
    buscarPlaceholder: "Search by name or city...",
    talleres: "Workshops",
    concesionarios: "Dealers",
    ordenar: "Sort by",
    mostrar: "Show",
    resultados: "results",
  },
  faq: {
    h2: "Frequently asked questions about motorhomes in Spain",
    subtitle: "We answer the most common questions about motorhomes in Spain and Spanish regulations (DGT, ITV, MMA)",
    items: [
      { q: "What licence do I need to drive a motorhome in Spain?", a: "With a category B licence you can drive motorhomes up to 3,500 kg GVWR (Gross Vehicle Weight Rating). For motorhomes over 3,500 kg you need a C1 licence, which allows you to drive vehicles up to 7,500 kg. The vast majority of rental motorhomes do not exceed 3,500 kg." },
      { q: "How much does a new motorhome cost?", a: "Prices vary enormously depending on the type. A new camper van starts from €45,000-55,000. Semi-integrated motorhomes start from €55,000-70,000. A-class from €80,000 to over €150,000. Overcab from €50,000-65,000. The second-hand market offers options from €15,000-20,000." },
      { q: "Can you stay overnight in a motorhome in Spain?", a: "Yes, staying overnight (sleeping inside the parked vehicle) is legal on most public roads where parking is permitted. What is regulated and generally prohibited is wild camping (setting up awnings, tables, chairs, levelling the vehicle). Each autonomous community and municipality may have specific regulations." },
      { q: "What is the difference between a motorhome and a camper?", a: "The main difference is in the base. A motorhome is built on a cab chassis with an independent habitable body (A-class, semi-integrated or overcab). A camper or converted van is built inside a commercial van keeping its original bodywork. Campers are more compact and easier to drive." },
      { q: "How often do you need an MOT for a motorhome in Spain?", a: "New motorhomes have their first MOT (ITV) at 4 years. Then every 2 years until they are 10 years old. From 10 years onwards, the MOT is annual. Vehicles classified as residential have the same periodicity as cars." },
      { q: "What insurance does a motorhome need in Spain?", a: "At minimum, compulsory third party liability insurance. Extended third party or comprehensive insurance is recommended, covering: 24h travel assistance, theft, fire, windows, own damage and interior contents. Specialised insurers such as Fénix Directo, Camperfriend or Verti offer specific policies." },
      { q: "How much does a motorhome consume?", a: "Consumption depends on the type and engine. A camper van consumes between 8-10 L/100km. A semi-integrated between 10-12 L/100km. An A-class or overcab between 11-14 L/100km. Factors such as load weight, speed and wind conditions significantly influence consumption." },
      { q: "Is it better to rent or buy a motorhome?", a: "It depends on use. If you plan to use it less than 8-10 weeks a year, renting is usually more economical (you don't pay insurance, MOT, parking space, maintenance or depreciation). Buying is worth it if you use it frequently, want to customise it to your taste, or plan to live on board permanently." },
      { q: "Where can I empty grey and black water in Spain?", a: "At motorhome service areas, which include grey and black water disposal points, clean water supply, and sometimes electricity. Spain has over 700 service areas. You can also empty at many campsites and adapted service stations. Never empty water in nature." },
      { q: "Can I take pets in a rental motorhome?", a: "It depends on the rental company. At Furgocasa we allow pets in all our vehicles. It is important to mention it when making the reservation. We recommend bringing a protective cover for the seat and your pet's accessories." },
    ],
  },
  cta: {
    h2: "Ready to experience motorhoming in Spain?",
    intro: "At Furgocasa we offer the best motorhomes and campers for rent from Murcia, with delivery throughout Spain",
    ctaVehiculos: "View available vehicles",
    ctaContacto: "Contact",
  },
  benefits: [
    { title: "Unlimited Kilometres", desc: "Travel without limits across Spain and Europe" },
    { title: "Personalised Attention", desc: "We accompany you before, during and after your trip" },
    { title: "Premium Fleet", desc: "Modern, fully equipped vehicles" },
    { title: "All Inclusive", desc: "Complete kitchen, bedding, camping kit" },
    { title: "Flexible cancellation", desc: "Cancel up to 60 days before at no cost" },
    { title: "24/7 Support", desc: "We accompany you throughout your trip" },
  ],
};

export function getAutocaravanasContent(locale: AutocaravanasLocale): AutocaravanasContent {
  return locale === 'en' ? CONTENT_EN : CONTENT_ES;
}
