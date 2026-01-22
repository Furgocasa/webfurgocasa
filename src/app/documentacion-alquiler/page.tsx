import { Metadata } from "next";
import { FileText, Download, Eye, CheckCircle, AlertCircle, Shield, Lock } from "lucide-react";

// Página SECRETA - No indexar, no seguir
export const metadata: Metadata = {
  title: "Documentación de Alquiler - Cliente",
  description: "Acceso exclusivo para clientes. Consulta, descarga y firma los documentos de tu alquiler.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

// ⚡ ISR: Revalidar cada día
export const revalidate = 86400;

const documents = [
  {
    id: "condiciones-alquiler",
    title: "Condiciones del Alquiler Detalladas",
    description: "Documento completo con todas las condiciones del servicio de alquiler, incluyendo derechos, obligaciones, política de cancelación, seguros y más. Lectura obligatoria antes de la recogida.",
    filename: "condiciones-alquiler.pdf",
    url: "/documentos/condiciones-alquiler.pdf",
    size: "195 KB",
    required: true,
    icon: FileText,
  },
  {
    id: "proteccion-datos",
    title: "Anexo de Protección de Datos",
    description: "Información sobre el tratamiento de tus datos personales conforme al RGPD. Incluye tus derechos y cómo ejercerlos.",
    filename: "proteccion-datos.pdf",
    url: "/documentos/proteccion-datos.pdf",
    size: "84 KB",
    required: true,
    icon: Shield,
  },
];

const requiredDocs = [
  "DNI o Pasaporte en vigor de todos los conductores",
  "Carnet de conducir B con mínimo 2 años de antigüedad",
  "Tarjeta de crédito (no débito) a nombre del conductor principal",
  "Confirmación de la reserva (enviada por email)",
];

export default function DocumentacionAlquilerPage() {
  return (
    <>
      <main className="min-h-screen bg-gray-50">
        {/* Header con aviso de página privada */}
        <section className="bg-gradient-to-br from-furgocasa-blue to-furgocasa-blue-dark py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-4">
              <Lock className="h-4 w-4 text-furgocasa-orange" />
              <span className="text-sm text-white/90">Acceso exclusivo para clientes</span>
            </div>
            <FileText className="h-16 w-16 text-furgocasa-orange mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Documentación de tu Alquiler
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Consulta, descarga y firma los documentos necesarios para completar tu reserva
            </p>
          </div>
        </section>

        {/* Documentos necesarios para el cliente */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Documentos que debes traer el día de recogida</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-yellow-800 mb-2">
                    Importante: Sin estos documentos no podremos entregarte el vehículo
                  </p>
                  <ul className="space-y-2">
                    {requiredDocs.map((doc, i) => (
                      <li key={i} className="flex items-center gap-2 text-yellow-700">
                        <CheckCircle className="h-4 w-4" />
                        {doc}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Documentos principales con visualizador */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Documentación del Contrato
            </h2>
            <p className="text-gray-600 mb-8">
              Por favor, lee detenidamente estos documentos antes de la recogida del vehículo.
            </p>

            <div className="grid lg:grid-cols-2 gap-8">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
                >
                  {/* Header del documento */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center">
                        <doc.icon className="h-7 w-7 text-red-600" />
                      </div>
                      {doc.required && (
                        <span className="text-xs bg-furgocasa-orange/10 text-furgocasa-orange px-3 py-1.5 rounded-full font-semibold">
                          Lectura obligatoria
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{doc.title}</h3>
                    <p className="text-gray-600 text-sm">{doc.description}</p>
                  </div>

                  {/* Preview del PDF */}
                  <div className="bg-gray-100 h-[400px] relative">
                    <iframe
                      src={`${doc.url}#toolbar=0&navpanes=0`}
                      className="w-full h-full"
                      title={doc.title}
                    />
                  </div>

                  {/* Acciones */}
                  <div className="p-4 bg-gray-50 flex items-center justify-between">
                    <span className="text-sm text-gray-500">PDF • {doc.size}</span>
                    <div className="flex gap-2">
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        Ver completo
                      </a>
                      <a
                        href={doc.url}
                        download={doc.filename}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-furgocasa-orange rounded-lg hover:bg-furgocasa-orange/90 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        Descargar
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Info adicional */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Preguntas frecuentes</h2>
              <div className="prose prose-gray max-w-none">
                <h3>¿Cuándo firmo el contrato?</h3>
                <p>
                  El contrato se firma en el momento de la recogida del vehículo, una vez verificada
                  toda la documentación. Te recomendamos leerlo con antelación para resolver
                  cualquier duda.
                </p>

                <h3>¿Qué pasa si no tengo tarjeta de crédito?</h3>
                <p>
                  La tarjeta de crédito es imprescindible para la retención de la fianza. Las
                  tarjetas de débito no permiten realizar retenciones. Si no dispones de tarjeta de
                  crédito, contáctanos para buscar una solución alternativa.
                </p>

                <h3>¿Puedo añadir un segundo conductor?</h3>
                <p>
                  Sí, el segundo conductor está incluido en el precio. Solo necesitamos su DNI y
                  carnet de conducir el día de la recogida.
                </p>

                <h3>¿Los documentos deben ser originales?</h3>
                <p>
                  Sí, necesitamos los documentos originales físicos. No se aceptan copias ni
                  fotografías.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 bg-furgocasa-orange">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              ¿Tienes dudas sobre la documentación?
            </h2>
            <p className="text-white/90 mb-6">Estamos aquí para ayudarte</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contacto"
                className="inline-block bg-white text-furgocasa-orange font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Contactar
              </a>
              <a
                href="tel:+34868364161"
                className="inline-block bg-furgocasa-blue text-white font-semibold py-3 px-8 rounded-lg hover:bg-furgocasa-blue-dark transition-colors"
              >
                Llamar: 868 36 41 61
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
