"use client";

import { FileText, CheckCircle, AlertCircle, Lock } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { COMPANY } from "@/lib/company";
import ContractSigning from "@/components/contracts/contract-signing";
import RentalDocsUpload from "@/components/rental-docs/rental-docs-upload";

export default function DocumentacionClient() {
  const { t } = useLanguage();

  const requiredDocsRecogida = [
    t("DNI o Pasaporte en vigor de todos los conductores"),
    t("Carnet de conducir B con mínimo 2 años de antigüedad"),
  ];

  const pasosConfirmacion = [
    { paso: "1", titulo: t("Sube tu documentación"), descripcion: t("DNI y carnet de conducir (anverso y reverso) desde esta misma página") },
    { paso: "2", titulo: t("Firma el contrato online"), descripcion: t("Lee y firma el contrato en esta misma página con tu número de reserva") },
    { paso: "3", titulo: t("Paga la fianza"), descripcion: `${t("Transferencia de")} ${COMPANY.depositAmount.toLocaleString("es-ES")}€ (${t("máx.")} ${COMPANY.rentalPolicy.deposit.paymentDeadlineHoursBeforePickup}h ${t("antes del inicio")})` },
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
            {t("Consulta y firma online los documentos para confirmar tu reserva")}
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
              {t("Sube tu DNI y carnet de conducir de forma segura más abajo, en el apartado")}{" "}
              <a href="#documentacion-conductores" className="text-furgocasa-blue font-semibold hover:underline">
                {t("«Documentación de conductores»")}
              </a>
              . {t("Si tienes cualquier duda, escríbenos a")}{" "}
              <a href="mailto:reservas@furgocasa.com" className="text-furgocasa-blue hover:underline">reservas@furgocasa.com</a>.
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
                  {t("El resto de documentación ya la habrás subido previamente desde esta página.")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subida de documentación de conductores (DNI + carnet) con validación IA */}
      <RentalDocsUpload />

      {/* Firma online del contrato — documentos solo tras validar reserva */}
      <ContractSigning />

      {/* Info adicional */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t("Preguntas frecuentes")}</h2>
            <div className="prose prose-gray max-w-none">
              <h3>{t("¿Cuándo firmo el contrato?")}</h3>
              <p>
                {t("El contrato debe firmarse antes del comienzo del alquiler. Puedes hacerlo online en esta misma página: introduce tu número de reserva, lee los documentos y fírmalos. Recibirás una copia por email y la confirmación de la cita de recogida se realizará una vez firmado.")}
              </p>

              <h3>{t("¿Cómo se paga la fianza?")}</h3>
              <p>
                {t("La fianza de")} {COMPANY.depositAmount.toLocaleString("es-ES")}€ {t("se abona mediante")} {COMPANY.rentalPolicy.deposit.paymentMethod}, {t("máximo")} {COMPANY.rentalPolicy.deposit.paymentDeadlineHoursBeforePickup} {t("horas antes del inicio del alquiler. Debes enviar el justificante de transferencia y certificado de titularidad de la cuenta. El titular debe coincidir con el arrendatario.")}
              </p>

              <h3>{t("¿Puedo añadir un segundo conductor?")}</h3>
              <p>
                {t("Sí, el segundo conductor está incluido en el precio. En el apartado de documentación de esta página puedes añadir tantos conductores como necesites y subir el DNI y carnet de cada uno.")}
              </p>

              <h3>{t("¿Cómo subo la documentación?")}</h3>
              <p>
                {t("En esta misma página, en el apartado «Documentación de conductores», introduce tu número de reserva y email y sube una foto o escaneo legible del DNI (anverso y reverso) y del carnet de conducir (anverso y reverso). Si tienes dudas, escríbenos a reservas@furgocasa.com.")}
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
