import { Metadata } from "next";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { translateServer } from "@/lib/i18n/server-translation";
import type { Locale } from "@/lib/i18n/config";

interface PageProps {}

const AVISO_METADATA: Metadata = {
  title: "Impressum",
  description: "Impressum und Nutzungsbedingungen von Furgocasa S.L. Rechtliche Informationen zur Wohnmobilvermietung.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale: Locale = 'de'; // Locale fijo
  
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
            <h1 className="text-3xl md:text-4xl font-bold text-white">Impressum</h1>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-xl shadow-sm p-8 max-w-4xl mx-auto prose prose-gray max-w-none">
              <p className="text-gray-500">Letzte Aktualisierung: Januar 2024</p>

              <h2>1. Identifikationsdaten</h2>
              <p>In Erfüllung der Informationspflicht gemäß Artikel 10 des Gesetzes 34/2002 vom 11. Juli über Dienste der Informationsgesellschaft und elektronischen Handel werden nachstehend folgende Daten angegeben:</p>
              <ul>
                <li><strong>Firmenname:</strong> FURGOCASA S.L.</li>
                <li><strong>CIF:</strong> B-XXXXXXXX</li>
                <li><strong>Geschäftssitz:</strong> Calle Ejemplo, 123 - 30001 Murcia</li>
                <li><strong>E-Mail:</strong> info@furgocasa.com</li>
                <li><strong>Telefon:</strong> +34 968 000 000</li>
                <li><strong>Eintragung:</strong> Handelsregister von Murcia, Band XXX, Blatt XXX, Seite MU-XXXXX</li>
              </ul>

              <h2>2. Zweck</h2>
              <p>Diese rechtliche Hinweise regeln die Nutzung der Website www.furgocasa.com, deren Inhaber FURGOCASA S.L. ist. Das Surfen auf der Website verleiht dem Nutzer den Status eines Benutzers und impliziert die vollständige und vorbehaltlose Annahme aller Bestimmungen, die in diesen rechtlichen Hinweisen enthalten sind.</p>

              <h2>3. Nutzungsbedingungen</h2>
              <p>Der Benutzer verpflichtet sich, die Inhalte und Dienstleistungen, die FURGOCASA über sein Portal anbietet, ordnungsgemäß zu nutzen, und zwar beispielhaft, aber nicht abschließend, sie nicht zu verwenden für:</p>
              <ul>
                <li>Begehung rechtswidriger, illegaler oder gegen Treu und Glauben und die öffentliche Ordnung verstoßender Handlungen</li>
                <li>Verursachung von Schäden an den physischen und logischen Systemen von FURGOCASA, seinen Anbietern oder Dritten</li>
                <li>Einführung oder Verbreitung von Computerviren oder anderen physischen oder logischen Systemen, die Schäden verursachen können</li>
                <li>Versuch, auf Daten von FURGOCASA, Drittanbietern und anderen Benutzern zuzugreifen, sie zu verwenden und/oder zu manipulieren</li>
              </ul>

              <h2>4. Geistiges und gewerbliches Eigentum</h2>
              <p>FURGOCASA ist selbst oder als Zessionarin Inhaberin aller Rechte des geistigen und gewerblichen Eigentums an ihrer Website sowie der darin enthaltenen Elemente (beispielhaft: Bilder, Ton, Audio, Video, Software oder Texte; Marken oder Logos, Farbkombinationen, Struktur und Design, Auswahl der verwendeten Materialien, Computerprogramme, die für ihren Betrieb, Zugang und Nutzung erforderlich sind, usw.).</p>
              <p>Alle Rechte vorbehalten. Gemäß den Bestimmungen der Artikel 8 und 32.1 Absatz 2 des Gesetzes über geistiges Eigentum sind die Vervielfältigung, Verbreitung und öffentliche Mitteilung der Gesamtheit oder eines Teils der Inhalte dieser Website zu kommerziellen Zwecken auf jedem Medium und mit jedem technischen Mittel ohne Genehmigung von FURGOCASA ausdrücklich untersagt.</p>

              <h2>5. Haftungsausschluss</h2>
              <p>FURGOCASA übernimmt in keinem Fall die Verantwortung für Schäden jeglicher Art, die beispielhaft verursacht werden könnten durch: Fehler oder Auslassungen in den Inhalten, Nichtverfügbarkeit des Portals oder die Übertragung von Viren oder bösartigen oder schädlichen Programmen in den Inhalten, trotz der Annahme aller notwendigen technischen Maßnahmen, um dies zu vermeiden.</p>

              <h2>6. Änderungen</h2>
              <p>FURGOCASA behält sich das Recht vor, ohne vorherige Ankündigung die Änderungen vorzunehmen, die es für angemessen hält, an seinem Portal, wobei es sowohl die Inhalte und Dienstleistungen, die über dieses Portal angeboten werden, ändern, löschen oder hinzufügen kann, als auch die Art und Weise, wie diese präsentiert oder lokalisiert werden.</p>

              <h2>7. Links</h2>
              <p>Falls auf der Website Links oder Hyperlinks zu anderen Websites im Internet vorhanden sind, übt FURGOCASA keine Kontrolle über diese Websites und Inhalte aus. In keinem Fall übernimmt FURGOCASA die Verantwortung für die Inhalte eines Links, der zu einer fremden Website gehört.</p>

              <h2>8. Ausschlussrecht</h2>
              <p>FURGOCASA behält sich das Recht vor, den Zugang zum Portal und/oder den angebotenen Dienstleistungen ohne Vorankündigung zu verweigern oder zurückzuziehen, auf eigene Initiative oder auf Initiative eines Dritten, für Benutzer, die diese Allgemeinen Nutzungsbedingungen nicht einhalten.</p>

              <h2>9. Anwendbares Recht und Gerichtsstand</h2>
              <p>Die Beziehung zwischen FURGOCASA und dem Benutzer wird durch die geltende spanische Gesetzgebung geregelt, und jede Streitigkeit wird den Gerichten und Tribunalen der Stadt Murcia unterworfen.</p>
            </div>
          </div>
        </section>
      </main>
</>
  );
}
