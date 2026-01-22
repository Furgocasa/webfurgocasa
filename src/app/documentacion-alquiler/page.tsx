import { FileText, Download, Eye, CheckCircle, AlertCircle } from"lucide-react";

export const metadata = {
  title: "Documentación de Alquiler",
  description: "Descarga toda la documentación necesaria para tu alquiler de camper: contrato, condiciones generales, checklist de entrega y más.",
};

const documents = [
  {
    title:"Contrato de alquiler",
    description:"Contrato estándar de alquiler de vehículo recreativo. Léelo antes de recoger tu camper.",
    type:"PDF",
    size:"245 KB",
    required: true,
    url:"#",
  },
  {
    title:"Condiciones generales",
    description:"Todas las condiciones del servicio de alquiler, incluyendo política de cancelación.",
    type:"PDF",
    size:"180 KB",
    required: true,
    url:"#",
  },
  {
    title:"Checklist de entrega",
    description:"Lista de verificación que se completa al recoger y devolver el vehículo.",
    type:"PDF",
    size:"95 KB",
    required: false,
    url:"#",
  },
  {
    title:"Manual de uso rápido",
    description:"Guía resumida de funcionamiento de tu camper: agua, gas, electricidad y más.",
    type:"PDF",
    size:"1.2 MB",
    required: false,
    url:"#",
  },
  {
    title:"Información del seguro",
    description:"Detalles de la cobertura del seguro incluido y opciones de ampliación.",
    type:"PDF",
    size:"320 KB",
    required: false,
    url:"#",
  },
  {
    title:"Política de combustible",
    description:"Información sobre el combustible y política de repostaje.",
    type:"PDF",
    size:"85 KB",
    required: false,
    url:"#",
  },
];

const requiredDocs = ["DNI o Pasaporte en vigor de todos los conductores","Carnet de conducir B con mínimo 2 años de antigüedad","Tarjeta de crédito (no débito) a nombre del conductor principal","Confirmación de la reserva (enviada por email)",
];

export default function DocumentacionAlquilerPage() {
  return (
    <>
<main className="min-h-screen bg-gray-50">
        <section className="bg-gradient-to-br from-furgocasa-blue to-furgocasa-blue-dark py-16">
          <div className="container mx-auto px-4 text-center">
            <FileText className="h-16 w-16 text-furgocasa-orange mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Documentación de Alquiler</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">Descarga y consulta toda la documentación necesaria para tu alquiler</p>
          </div>
        </section>

        {/* Documentos necesarios para el cliente */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Documentos que debes traer</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-yellow-800 mb-2">Importante: Sin estos documentos no podremos entregarte el vehículo</p>
                  <ul className="space-y-2">
                    {requiredDocs.map((doc, i) => (
                      <li key={i} className="flex items-center gap-2 text-yellow-700">
                        <CheckCircle className="h-4 w-4" />{doc}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Documentos descargables */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Documentos descargables</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((doc) => (
                <div key={doc.title} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-red-600" />
                    </div>
                    {doc.required && (
                      <span className="text-xs bg-furgocasa-orange/10 text-furgocasa-orange px-2 py-1 rounded-full font-medium">
                        Lectura obligatoria
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{doc.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{doc.description}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-500">{doc.type} • {doc.size}</span>
                    <div className="flex gap-2">
                      <a href={doc.url} className="p-2 text-gray-400 hover:text-furgocasa-orange hover:bg-furgocasa-orange/10 rounded-lg transition-colors" title="Ver">
                        <Eye className="h-5 w-5" />
                      </a>
                      <a href={doc.url} download className="p-2 text-gray-400 hover:text-furgocasa-orange hover:bg-furgocasa-orange/10 rounded-lg transition-colors" title="Descargar">
                        <Download className="h-5 w-5" />
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
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Información importante</h2>
              <div className="prose prose-gray max-w-none">
                <h3>¿Cuándo firmo el contrato?</h3>
                <p>El contrato se firma en el momento de la recogida del vehículo, una vez verificada toda la documentación. Te recomendamos leerlo con antelación para resolver cualquier duda.</p>

                <h3>¿Qué pasa si no tengo tarjeta de crédito?</h3>
                <p>La tarjeta de crédito es imprescindible para la retención de la fianza. Las tarjetas de débito no permiten realizar retenciones. Si no dispones de tarjeta de crédito, contáctanos para buscar una solución alternativa.</p>

                <h3>¿Puedo añadir un segundo conductor?</h3>
                <p>Sí, el segundo conductor está incluido en el precio. Solo necesitamos su DNI y carnet de conducir el día de la recogida.</p>

                <h3>¿Los documentos deben ser originales?</h3>
                <p>Sí, necesitamos los documentos originales físicos. No se aceptan copias ni fotografías.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 bg-furgocasa-orange">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">¿Tienes dudas sobre la documentación?</h2>
            <p className="text-white/90 mb-6">Estamos aquí para ayudarte</p>
            <a href="/contacto" className="inline-block bg-white text-furgocasa-orange font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors">Contactar</a>
          </div>
        </section>
      </main>
</>
  );
}
