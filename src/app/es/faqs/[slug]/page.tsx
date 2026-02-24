import { LocalizedLink } from"@/components/localized-link";
import { notFound } from"next/navigation";
import { ArrowLeft, ChevronRight } from"lucide-react";
import { Metadata } from "next";

export const revalidate = 3600; // 1 hora

// Generar rutas estáticas para todas las FAQs
export async function generateStaticParams() {
  const slugs = Object.keys(faqs);
  return slugs.map((slug) => ({ slug }));
}

// TODO: Cargar desde base de datos o CMS
const faqs: Record<string, { question: string; answer: string; category: string; related: string[] }> = {"edad-minima-alquiler": {
    question:"¿A partir de qué edad puedo alquilar una camper?",
    answer: `<p>La edad mínima para alquilar una camper en Furgocasa es de <strong>25 años</strong>.</p>
    <p>Además de la edad, es necesario:</p>
    <ul><li>Tener el carnet de conducir B con al menos 2 años de antigüedad</li><li>Disponer de DNI o pasaporte en vigor</li><li>Tarjeta de crédito a nombre del conductor principal</li></ul>
    <p>Si tienes entre 21 y 25 años, contáctanos para estudiar tu caso particular.</p>`,
    category:"Antes de reservar",
    related: ["permiso-conducir","documentos-necesarios"]
  },"permiso-conducir": {
    question:"¿Qué tipo de permiso de conducir necesito para conducir una camper?",
    answer: `<p>Para conducir nuestras campers solo necesitas el <strong>carnet de conducir B</strong> (el de coche normal).</p>
    <p>Todos nuestros vehículos tienen una MMA (Masa Máxima Autorizada) inferior a 3.500 kg, por lo que no es necesario ningún permiso especial.</p>
    <p>Requisitos del carnet:</p>
    <ul><li>Carnet B en vigor</li><li>Mínimo 2 años de antigüedad</li><li>Válido en España (carnets extranjeros deben ser reconocidos)</li></ul>`,
    category:"Antes de reservar",
    related: ["edad-minima-alquiler","documentos-necesarios"]
  },"alquiler-fin-semana": {
    question:"¿Puedo alquilar una camper para un fin de semana?",
    answer: `<p><strong>Sí, ofrecemos alquileres de fin de semana.</strong></p>
    <p>El alquiler mínimo es de 2 noches (3 días). Un fin de semana típico sería:</p>
    <ul><li>Recogida: Viernes por la tarde (a partir de las 17:00)</li><li>Devolución: Domingo antes de las 20:00 o Lunes por la mañana</li></ul>
    <p>En temporada alta (julio, agosto, puentes), el mínimo puede ser de 7 días.</p>
    <p><a href="/como-reservar-fin-semana">Ver guía: Cómo reservar un fin de semana</a></p>`,
    category:"Antes de reservar",
    related: ["como-reservar","horarios-entrega"]
  },"como-reservar": {
    question:"¿Cuál es la forma más rápida de reservar mi autocaravana camper?",
    answer: `<p>La forma más rápida es a través de nuestra web:</p>
    <ol><li>Selecciona las fechas de recogida y devolución</li><li>Elige el vehículo que más te guste</li><li>Añade los extras que necesites</li><li>Completa tus datos y realiza el pago de la primera mitad</li></ol>
    <p>Recibirás la confirmación por email en menos de 24 horas.</p>
    <p>También puedes llamarnos al <strong>+34 968 000 000</strong> o enviarnos un WhatsApp.</p>`,
    category:"Reserva y pago",
    related: ["pago-pendiente","modificar-cancelar"]
  },"precios-impuestos": {
    question:"¿Los precios diarios de alquiler de las campers son precios finales, incluyen impuestos indirectos?",
    answer: `<p><strong>Sí, todos nuestros precios incluyen IVA.</strong></p>
    <p>El precio que ves es el precio final. No hay costes ocultos ni sorpresas.</p>
    <p>Lo que está incluido en el precio:</p>
    <ul><li>IVA (21%)</li><li>Seguro a todo riesgo con franquicia</li><li>Asistencia en carretera 24h</li><li>Kit de cocina y menaje</li><li>Ropa de cama y toallas</li><li>Kilómetros ilimitados en España</li><li>Segundo conductor</li></ul>`,
    category:"Reserva y pago",
    related: ["seguro-incluido","accesorios-gratuitos"]
  },"accesorios-gratuitos": {
    question:"¿Qué accesorios se proporcionan de forma gratuita con la camper?",
    answer: `<p>Todos nuestros vehículos incluyen sin coste adicional:</p>
    <h4>Cocina</h4>
    <ul><li>Juego de ollas y sartenes</li><li>Vajilla completa (platos, vasos, cubiertos)</li><li>Cafetera italiana</li><li>Tabla de cortar y cuchillos</li></ul>
    <h4>Dormitorio</h4>
    <ul><li>Sábanas y fundas de almohada</li><li>Mantas</li><li>Toallas (1 por persona)</li></ul>
    <h4>Exterior</h4>
    <ul><li>Sillas de camping (2-4 según vehículo)</li><li>Mesa plegable</li><li>Cuñas de nivelación</li><li>Cable eléctrico 25m</li></ul>`,
    category:"Equipamiento",
    related: ["extras-adicionales"]
  },"proposito-fianza": {
    question:"¿Cuál es el propósito de que se retenga una fianza?",
    answer: `<p>La fianza sirve como garantía para cubrir:</p>
    <ul><li>La franquicia del seguro en caso de accidente</li><li>Posibles daños al vehículo o equipamiento</li><li>Limpieza extra si el vehículo se devuelve muy sucio</li><li>Combustible si no se devuelve con el depósito lleno</li></ul>
    <p>El importe de la fianza es de <strong>1.500€</strong> y se retiene en tu tarjeta de crédito.</p>
    <p>Si todo está correcto a la devolución, la fianza se libera en un plazo de 7-14 días hábiles.</p>`,
    category:"Seguro y fianza",
    related: ["pago-fianza","devolucion-fianza","condiciones-devolucion"]
  },"horarios-entrega": {
    question:"¿A qué hora tengo que entregar y recoger mi camper?",
    answer: `<p>Los horarios estándar son:</p>
    <h4>Recogida</h4>
    <p>Entre las <strong>10:00 y las 13:00</strong> o entre las <strong>17:00 y las 19:00</strong></p>
    <h4>Devolución</h4>
    <p>Antes de las <strong>10:00</strong></p>
    <p>Si necesitas horarios especiales, consúltanos. Podemos adaptarnos a tus necesidades (puede aplicar suplemento fuera de horario).</p>`,
    category:"Entrega y devolución",
    related: ["proceso-recogida","documentos-necesarios"]
  },"documentos-necesarios": {
    question:"¿Qué documentos tengo que traer cuando recoja la camper?",
    answer: `<p>El día de la recogida necesitarás presentar:</p>
    <ul><li><strong>DNI o Pasaporte</strong> en vigor del conductor principal</li><li><strong>Carnet de conducir</strong> en vigor (mínimo 2 años antigüedad)</li><li><strong>Tarjeta de crédito</strong> a nombre del conductor principal (para la fianza)</li><li><strong>Confirmación de reserva</strong> (la recibirás por email)</li></ul>
    <p>Si hay segundo conductor, también necesitaremos su DNI y carnet.</p>`,
    category:"Entrega y devolución",
    related: ["proceso-recogida","pago-fianza"]
  },"funcionamiento-camper": {
    question:"¿Cómo puedo adelantarme a la explicación de la entrega y preparándome sobre el funcionamiento de la camper?",
    answer: `<p>Te recomendamos ver nuestros <strong>video tutoriales</strong> antes de tu viaje:</p>
    <ul><li>Cómo funciona el techo elevable</li><li>Sistema de agua y vaciado de grises</li><li>Conexión eléctrica y baterías</li><li>Uso de la cocina y nevera</li><li>Calefacción estacionaria</li><li>Conducción y estacionamiento</li></ul>
    <p><a href="/video-tutoriales">Ver todos los video tutoriales</a></p>
    <p>Además, en la entrega te explicaremos todo detalladamente y resolveremos todas tus dudas.</p>`,
    category:"Durante el viaje",
    related: []
  },
};

// ✅ Generar metadata dinámica para cada FAQ
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const faq = faqs[slug];

  if (!faq) {
    return {
      title: "Pregunta no encontrada",
      description: "La pregunta frecuente que buscas no existe.",
      robots: { index: false, follow: false }
    };
  }

  // Extraer texto limpio de la respuesta HTML
  const cleanAnswer = faq.answer.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 155);

  return {
    title: faq.question,
    description: cleanAnswer + '...',
    keywords: `${faq.question}, faq camper, preguntas autocaravana, ${faq.category}`,
    openGraph: {
      title: faq.question,
      description: cleanAnswer,
      type: 'article',
    },
    robots: {
      index: true,
      follow: true
    }
  };
}

export default async function FaqDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const faq = faqs[slug];
  if (!faq) notFound();

  return (
    <>
<main className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <LocalizedLink href="/faqs" className="inline-flex items-center gap-2 text-gray-600 hover:text-furgocasa-orange"><ArrowLeft className="h-4 w-4" />Volver a FAQs</LocalizedLink>
          </div>
        </div>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <span className="text-furgocasa-orange font-medium">{faq.category}</span>
              <h1 className="text-3xl font-bold text-gray-900 mt-2 mb-8">{faq.question}</h1>
              <div className="bg-white rounded-xl shadow-sm p-8 prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: faq.answer }} />

              {faq.related.length > 0 && (
                <div className="mt-8 bg-gray-100 rounded-xl p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Preguntas relacionadas</h3>
                  <ul className="space-y-2">
                    {faq.related.map((slug) => faqs[slug] && (
                      <li key={slug}>
                        <LocalizedLink href={`/faqs/${slug}`} className="flex items-center gap-2 text-gray-600 hover:text-furgocasa-orange">
                          <ChevronRight className="h-4 w-4" />{faqs[slug].question}
                        </LocalizedLink>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
</>
  );
}
