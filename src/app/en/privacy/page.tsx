import { Metadata } from "next";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { translateServer } from "@/lib/i18n/server-translation";
import type { Locale } from "@/lib/i18n/config";

interface PageProps {
  ;
}

const PRIVACIDAD_METADATA: Metadata = {
  title: "Política de Privacidad",
  description: "Política de privacidad y protección de datos de Furgocasa S.L. Información sobre cómo tratamos y protegemos tus datos personales según RGPD.",
  keywords: "politica privacidad furgocasa, proteccion datos, rgpd, lopd, privacidad datos personales",
  robots: {
    index: true,
    follow: false,
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale: Locale = 'en'; // Locale fijo
  
  const alternates = buildCanonicalAlternates('/privacidad', locale);

  return {
    ...PRIVACIDAD_METADATA,
    alternates,
  };
}

// ⚡ ISR: Revalidar cada semana (contenido muy estático)
export const revalidate = 604800;

export default async function LocalePrivacidadPage({ params }: PageProps) {
  return (
    <>
<main className="min-h-screen bg-gray-50">
        <section className="bg-furgocasa-blue py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold text-white">Política de Privacidad</h1>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-xl shadow-sm p-8 max-w-4xl mx-auto prose prose-gray max-w-none">
              <p className="text-gray-500">Última actualización: Enero 2024</p>

              <h2>1. Responsable del tratamiento</h2>
              <ul>
                <li><strong>Identidad:</strong> FURGOCASA S.L.</li>
                <li><strong>CIF:</strong> B-XXXXXXXX</li>
                <li><strong>Dirección:</strong> Calle Ejemplo, 123 - 30001 Murcia</li>
                <li><strong>Correo electrónico:</strong> privacidad@furgocasa.com</li>
                <li><strong>Teléfono:</strong> +34 968 000 000</li>
              </ul>

              <h2>2. Datos personales que tratamos</h2>
              <p>FURGOCASA puede tratar las siguientes categorías de datos personales:</p>
              <ul>
                <li><strong>Datos identificativos:</strong> nombre, apellidos, DNI/NIE/Pasaporte</li>
                <li><strong>Datos de contacto:</strong> dirección postal, correo electrónico, teléfono</li>
                <li><strong>Datos de facturación:</strong> datos bancarios, historial de pagos</li>
                <li><strong>Datos de conducción:</strong> permiso de conducir, fecha de expedición</li>
                <li><strong>Datos de navegación:</strong> dirección IP, cookies, preferencias</li>
              </ul>

              <h2>3. Finalidad del tratamiento</h2>
              <p>Los datos personales proporcionados serán tratados con las siguientes finalidades:</p>
              <ul>
                <li>Gestión de reservas y contratos de alquiler de vehículos</li>
                <li>Facturación y cobro de los servicios contratados</li>
                <li>Atención de consultas y solicitudes de información</li>
                <li>Envío de comunicaciones comerciales (con consentimiento previo)</li>
                <li>Cumplimiento de obligaciones legales</li>
                <li>Mejora de nuestros servicios y experiencia de usuario</li>
              </ul>

              <h2>4. Legitimación del tratamiento</h2>
              <p>La base legal para el tratamiento de sus datos es:</p>
              <ul>
                <li><strong>Ejecución de un contrato:</strong> para gestionar las reservas y alquileres</li>
                <li><strong>Consentimiento:</strong> para el envío de comunicaciones comerciales</li>
                <li><strong>Obligación legal:</strong> para cumplir con la normativa fiscal y de tráfico</li>
                <li><strong>Interés legítimo:</strong> para mejorar nuestros servicios</li>
              </ul>

              <h2>5. Destinatarios de los datos</h2>
              <p>Sus datos podrán ser comunicados a:</p>
              <ul>
                <li>Compañías de seguros (para la gestión del seguro del vehículo)</li>
                <li>Entidades bancarias (para el procesamiento de pagos)</li>
                <li>Administraciones públicas (cuando exista obligación legal)</li>
                <li>Proveedores de servicios tecnológicos (hosting, email, etc.)</li>
              </ul>

              <h2>6. Plazo de conservación</h2>
              <p>Los datos personales serán conservados:</p>
              <ul>
                <li>Datos de clientes: durante la relación contractual y 5 años adicionales</li>
                <li>Datos de facturación: 6 años (obligación legal)</li>
                <li>Datos de navegación: 2 años máximo</li>
                <li>Consentimientos de marketing: hasta su revocación</li>
              </ul>

              <h2>7. Derechos del interesado</h2>
              <p>Usted tiene derecho a:</p>
              <ul>
                <li><strong>Acceso:</strong> conocer qué datos tenemos sobre usted</li>
                <li><strong>Rectificación:</strong> corregir datos inexactos</li>
                <li><strong>Supresión:</strong> solicitar el borrado de sus datos</li>
                <li><strong>Limitación:</strong> restringir el tratamiento en ciertos casos</li>
                <li><strong>Portabilidad:</strong> recibir sus datos en formato estructurado</li>
                <li><strong>Oposición:</strong> oponerse al tratamiento de sus datos</li>
              </ul>
              <p>Para ejercer estos derechos, puede contactar con nosotros en privacidad@furgocasa.com adjuntando copia de su DNI.</p>

              <h2>8. Cookies</h2>
              <p>Este sitio web utiliza cookies propias y de terceros. Puede consultar nuestra política de cookies para más información.</p>

              <h2>9. Seguridad</h2>
              <p>FURGOCASA ha adoptado las medidas técnicas y organizativas necesarias para garantizar la seguridad de los datos personales y evitar su alteración, pérdida, tratamiento o acceso no autorizado.</p>

              <h2>10. Modificaciones</h2>
              <p>FURGOCASA se reserva el derecho de modificar la presente política de privacidad para adaptarla a novedades legislativas o jurisprudenciales.</p>

              <h2>11. Reclamaciones</h2>
              <p>Si considera que el tratamiento de sus datos no se ajusta a la normativa, puede presentar una reclamación ante la Agencia Española de Protección de Datos (www.aepd.es).</p>
            </div>
          </div>
        </section>
      </main>
</>
  );
}
