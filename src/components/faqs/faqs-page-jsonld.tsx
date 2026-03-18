/** FAQs principales para schema FAQPage - contenido en español (canonical) */
const FAQS_FOR_SCHEMA = [
  {
    question: "¿Qué tipo de permiso de conducir necesito para conducir una camper?",
    answer: "Para conducir cualquiera de las campers de Furgocasa se necesita el permiso de conducción tipo B con al menos dos años de antigüedad. No se requiere ningún carnet especial porque los vehículos tienen una masa máxima autorizada inferior a 3.500 kg."
  },
  {
    question: "¿Puedo alquilar una camper para un fin de semana?",
    answer: "Sí. En temporada baja Furgocasa realiza alquileres de fin de semana (la duración mínima son dos días). El precio mínimo a facturar es el equivalente a tres días."
  },
  {
    question: "¿Cuál es la forma más rápida de reservar mi autocaravana?",
    answer: "La forma más rápida es reservar directamente en la web. Selecciona las fechas, elige el modelo de camper y abona online el 50% del alquiler; una vez pagada esa señal el vehículo queda bloqueado."
  },
  {
    question: "¿Cuánto cuesta alquilar una camper?",
    answer: "El precio varía según la temporada: desde 95€/día en temporada baja, 125€/día en temporada media y 155€/día en temporada alta. Incluye kilómetros ilimitados y equipamiento completo."
  },
  {
    question: "¿Cuál es la fianza y cómo se paga?",
    answer: "La fianza es de 1.000€ y se abona por transferencia bancaria 72 horas antes del inicio. Se devuelve en 10 días laborables tras la devolución del vehículo."
  },
  {
    question: "¿Puedo salir de España con la camper?",
    answer: "Sí. Las campers de Furgocasa cuentan con seguro con carta verde que permite viajar a la UE y Marruecos, con asistencia en carretera incluida."
  },
  {
    question: "¿Dónde puedo recoger y devolver la camper?",
    answer: "Murcia (sede principal) y Madrid. En Murcia: mínimo 2 días en temporada baja, 7 en alta. En Madrid: mínimo 10 días. La devolución debe realizarse en la misma sede."
  }
];

export function FaqsPageJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQS_FOR_SCHEMA.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
