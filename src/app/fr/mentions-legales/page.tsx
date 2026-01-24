import { Metadata } from "next";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { translateServer } from "@/lib/i18n/server-translation";
import type { Locale } from "@/lib/i18n/config";

interface PageProps {}

const AVISO_METADATA: Metadata = {
  title: "Aviso Legal",
  description: "Aviso legal y términos de uso de Furgocasa S.L. Información legal sobre el alquiler de autocaravanas y campers en Murcia.",
  robots: {
    index: true,
    follow: false, // No seguir enlaces en páginas legales
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale: Locale = 'fr'; // Locale fijo
  
  const alternates = buildCanonicalAlternates('/aviso-legal', locale);

  return {
    ...AVISO_METADATA,
    alternates,
  };
}

// ⚡ ISR: Revalidar cada semana (contenido muy estático)
export const revalidate = 604800;

export default async function LocaleAvisoLegalPage({ params }: PageProps) {
  return (
    <>
<main className="min-h-screen bg-gray-50">
        <section className="bg-furgocasa-blue py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold text-white">Aviso Legal</h1>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-xl shadow-sm p-8 max-w-4xl mx-auto prose prose-gray max-w-none">
              <p className="text-gray-500">Última actualización: Enero 2024</p>

              <h2>1. Datos identificativos</h2>
              <p>En cumplimiento con el deber de información recogido en artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico, a continuación se reflejan los siguientes datos:</p>
              <ul>
                <li><strong>Denominación social:</strong> FURGOCASA S.L.</li>
                <li><strong>CIF:</strong> B-XXXXXXXX</li>
                <li><strong>Domicilio social:</strong> Calle Ejemplo, 123 - 30001 Murcia</li>
                <li><strong>Correo electrónico:</strong> info@furgocasa.com</li>
                <li><strong>Teléfono:</strong> +34 968 000 000</li>
                <li><strong>Inscripción:</strong> Registro Mercantil de Murcia, Tomo XXX, Folio XXX, Hoja MU-XXXXX</li>
              </ul>

              <h2>2. Objeto</h2>
              <p>El presente aviso legal regula el uso del sitio web www.furgocasa.com, del que es titular FURGOCASA S.L. La navegación por el sitio web atribuye la condición de usuario del mismo e implica la aceptación plena y sin reservas de todas y cada una de las disposiciones incluidas en este Aviso Legal.</p>

              <h2>3. Condiciones de uso</h2>
              <p>El usuario se compromete a hacer un uso adecuado de los contenidos y servicios que FURGOCASA ofrece a través de su portal y con carácter enunciativo pero no limitativo, a no emplearlos para:</p>
              <ul>
                <li>Incurrir en actividades ilícitas, ilegales o contrarias a la buena fe y al orden público</li>
                <li>Provocar daños en los sistemas físicos y lógicos de FURGOCASA, de sus proveedores o de terceras personas</li>
                <li>Introducir o difundir virus informáticos o cualesquiera otros sistemas físicos o lógicos que sean susceptibles de provocar daños</li>
                <li>Intentar acceder, utilizar y/o manipular los datos de FURGOCASA, terceros proveedores y otros usuarios</li>
              </ul>

              <h2>4. Propiedad intelectual e industrial</h2>
              <p>FURGOCASA por sí misma o como cesionaria, es titular de todos los derechos de propiedad intelectual e industrial de su página web, así como de los elementos contenidos en la misma (a título enunciativo, imágenes, sonido, audio, vídeo, software o textos; marcas o logotipos, combinaciones de colores, estructura y diseño, selección de materiales usados, programas de ordenador necesarios para su funcionamiento, acceso y uso, etc.).</p>
              <p>Todos los derechos reservados. En virtud de lo dispuesto en los artículos 8 y 32.1, párrafo segundo, de la Ley de Propiedad Intelectual, quedan expresamente prohibidas la reproducción, la distribución y la comunicación pública de la totalidad o parte de los contenidos de esta página web, con fines comerciales, en cualquier soporte y por cualquier medio técnico, sin la autorización de FURGOCASA.</p>

              <h2>5. Exclusión de garantías y responsabilidad</h2>
              <p>FURGOCASA no se hace responsable, en ningún caso, de los daños y perjuicios de cualquier naturaleza que pudieran ocasionar, a título enunciativo: errores u omisiones en los contenidos, falta de disponibilidad del portal o la transmisión de virus o programas maliciosos o lesivos en los contenidos, a pesar de haber adoptado todas las medidas tecnológicas necesarias para evitarlo.</p>

              <h2>6. Modificaciones</h2>
              <p>FURGOCASA se reserva el derecho de efectuar sin previo aviso las modificaciones que considere oportunas en su portal, pudiendo cambiar, suprimir o añadir tanto los contenidos y servicios que se presten a través de la misma como la forma en la que éstos aparezcan presentados o localizados en su portal.</p>

              <h2>7. Enlaces</h2>
              <p>En el caso de que en el sitio web se dispusiesen enlaces o hipervínculos hacia otros sitios de Internet, FURGOCASA no ejercerá ningún tipo de control sobre dichos sitios y contenidos. En ningún caso FURGOCASA asumirá responsabilidad alguna por los contenidos de algún enlace perteneciente a un sitio web ajeno.</p>

              <h2>8. Derecho de exclusión</h2>
              <p>FURGOCASA se reserva el derecho a denegar o retirar el acceso a portal y/o los servicios ofrecidos sin necesidad de preaviso, a instancia propia o de un tercero, a aquellos usuarios que incumplan las presentes Condiciones Generales de Uso.</p>

              <h2>9. Legislación aplicable y jurisdicción</h2>
              <p>La relación entre FURGOCASA y el usuario se regirá por la normativa española vigente y cualquier controversia se someterá a los Juzgados y Tribunales de la ciudad de Murcia.</p>
            </div>
          </div>
        </section>
      </main>
</>
  );
}
