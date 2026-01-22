"use client";

import { FileText, Download, Eye, CheckCircle, AlertCircle, Shield, Lock } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

const documents = [
  {
    id: "condiciones-alquiler",
    titleKey: "Condiciones del Alquiler Detalladas",
    descriptionKey: "Documento completo con todas las condiciones del servicio de alquiler, incluyendo derechos, obligaciones, política de cancelación, seguros y más. Lectura obligatoria antes de la recogida.",
    filename: "condiciones-alquiler.pdf",
    url: "/documentos/condiciones-alquiler.pdf",
    size: "195 KB",
    required: true,
    icon: FileText,
  },
  {
    id: "proteccion-datos",
    titleKey: "Anexo de Protección de Datos",
    descriptionKey: "Información sobre el tratamiento de tus datos personales conforme al RGPD. Incluye tus derechos y cómo ejercerlos.",
    filename: "proteccion-datos.pdf",
    url: "/documentos/proteccion-datos.pdf",
    size: "84 KB",
    required: true,
    icon: Shield,
  },
];

export default function DocumentacionClient() {
  const { t } = useLanguage();

  const requiredDocsRecogida = [
    t("DNI o Pasaporte en vigor de todos los conductores"),
    t("Carnet de conducir B con mínimo 2 años de antigüedad"),
  ];

  const pasosConfirmacion = [
    { paso: "1", titulo: t("Envía tu documentación"), descripcion: t("DNI/Pasaporte y carnet de conducir (foto o escaneo)") },
    { paso: "2", titulo: t("Firma y envía el contrato"), descripcion: t("Descarga la documentación de esta página y envíanosla por email") },
    { paso: "3", titulo: t("Paga la fianza"), descripcion: t("Transferencia de 1.000€ (máx. 72h antes del inicio)") },
    { paso: "4", titulo: t("Recibe confirmación"), descripcion: t("Te confirmaremos la cita de recogida por email") },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header con aviso de página privada */}
      <section className="bg-gradient-to-br from-furgocasa-blue to-furgocasa-blue-dark py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-4">
            <Lock className="h-4 w-4 text-furgocasa-orange" />
            <span className="text-sm text-white/90">{t("Acceso exclusivo para clientes")}</span>
          </div>
          <FileText className="h-16 w-16 text-furgocasa-orange mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t("Documentación de tu Alquiler")}
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            {t("Descarga, firma y envía los documentos por email para confirmar tu reserva")}
          </p>
        </div>
      </section>

      {/* Proceso para confirmar tu cita */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("Pasos para confirmar tu reserva")}</h2>
          <p className="text-gray-600 mb-8">
            {t("La cita de recogida se confirmará una vez completados estos pasos:")}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {pasosConfirmacion.map((item) => (
              <div key={item.paso} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <div className="w-10 h-10 bg-furgocasa-orange text-white rounded-full flex items-center justify-center font-bold text-lg mb-3">
                  {item.paso}
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{item.titulo}</h3>
                <p className="text-sm text-gray-600">{item.descripcion}</p>
              </div>
            ))}
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <p className="text-blue-800">
              <strong>{t("Email para enviar documentación:")}</strong>{" "}
              <a href="mailto:reservas@furgocasa.com" className="text-furgocasa-blue hover:underline">reservas@furgocasa.com</a>
            </p>
          </div>
        </div>
      </section>

      {/* Documentos para el día de recogida */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t("El día de la recogida")}</h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-800 mb-2">
                  {t("Documentos que debes traer físicamente:")}
                </p>
                <ul className="space-y-2">
                  {requiredDocsRecogida.map((doc, i) => (
                    <li key={i} className="flex items-center gap-2 text-yellow-700">
                      <CheckCircle className="h-4 w-4" />
                      {doc}
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-yellow-700 mt-3">
                  {t("El resto de documentación ya la habrás enviado previamente por email.")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Documentos principales */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t("Documentación del Contrato")}
          </h2>
          <p className="text-gray-600 mb-8">
            {t("Por favor, lee detenidamente estos documentos, fírmalos y envíalos por email a")} <strong>reservas@furgocasa.com</strong>
          </p>

          <div className="grid lg:grid-cols-2 gap-8">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center">
                      <doc.icon className="h-7 w-7 text-red-600" />
                    </div>
                    {doc.required && (
                      <span className="text-xs bg-furgocasa-orange/10 text-furgocasa-orange px-3 py-1.5 rounded-full font-semibold">
                        {t("Lectura obligatoria")}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{t(doc.titleKey)}</h3>
                  <p className="text-gray-600 text-sm mb-6">{t(doc.descriptionKey)}</p>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Eye className="h-5 w-5" />
                      {t("Ver documento")}
                    </a>
                    <a
                      href={doc.url}
                      download={doc.filename}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium text-white bg-furgocasa-orange rounded-lg hover:bg-furgocasa-orange/90 transition-colors"
                    >
                      <Download className="h-5 w-5" />
                      {t("Descargar PDF")}
                    </a>
                  </div>
                  <p className="text-xs text-gray-400 mt-3">PDF • {doc.size}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Info adicional */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t("Preguntas frecuentes")}</h2>
            <div className="prose prose-gray max-w-none">
              <h3>{t("¿Cuándo firmo el contrato?")}</h3>
              <p>
                {t("El contrato debe firmarse antes del comienzo del alquiler y enviarse por email a Furgocasa. La confirmación de la cita de recogida se realizará una vez recibida la documentación firmada. Te recomendamos leerlo detenidamente y enviarlo con suficiente antelación.")}
              </p>

              <h3>{t("¿Cómo se paga la fianza?")}</h3>
              <p>
                {t("La fianza de 1.000€ se abona mediante transferencia bancaria, máximo 72 horas antes del inicio del alquiler. Debes enviar el justificante de transferencia y certificado de titularidad de la cuenta. El titular debe coincidir con el arrendatario.")}
              </p>

              <h3>{t("¿Puedo añadir un segundo conductor?")}</h3>
              <p>
                {t("Sí, el segundo conductor está incluido en el precio. Solo necesitamos su DNI y carnet de conducir enviados por email antes del alquiler.")}
              </p>

              <h3>{t("¿Cómo envío la documentación?")}</h3>
              <p>
                {t("Puedes enviarnos los documentos por email a reservas@furgocasa.com. Aceptamos imágenes escaneadas o fotografías legibles de los documentos (DNI, carnet de conducir, contrato firmado, justificante de fianza).")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-furgocasa-orange">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            {t("¿Tienes dudas sobre la documentación?")}
          </h2>
          <p className="text-white/90 mb-6">{t("Estamos aquí para ayudarte")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contacto"
              className="inline-block bg-white text-furgocasa-orange font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {t("Contactar")}
            </a>
            <a
              href="tel:+34868364161"
              className="inline-block bg-furgocasa-blue text-white font-semibold py-3 px-8 rounded-lg hover:bg-furgocasa-blue-dark transition-colors"
            >
              {t("Llamar")}: 868 36 41 61
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
