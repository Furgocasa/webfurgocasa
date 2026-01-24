import { Metadata } from "next";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { translateServer } from "@/lib/i18n/server-translation";
import type { Locale } from "@/lib/i18n/config";

interface PageProps {}

const PRIVACIDAD_METADATA: Metadata = {
  title: "Datenschutzerklärung",
  description: "Datenschutzerklärung und Datenschutz von Furgocasa S.L. Informationen über die Verarbeitung Ihrer personenbezogenen Daten gemäß DSGVO.",
  keywords: "datenschutz furgocasa, datenschutzerklärung, dsgvo, personenbezogene daten",
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
            <h1 className="text-3xl md:text-4xl font-bold text-white">Datenschutzerklärung</h1>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-xl shadow-sm p-8 max-w-4xl mx-auto prose prose-gray max-w-none">
              <p className="text-gray-500">Letzte Aktualisierung: Januar 2024</p>

              <h2>1. Verantwortlicher für die Verarbeitung</h2>
              <ul>
                <li><strong>Identität:</strong> FURGOCASA S.L.</li>
                <li><strong>CIF:</strong> B-XXXXXXXX</li>
                <li><strong>Adresse:</strong> Calle Ejemplo, 123 - 30001 Murcia</li>
                <li><strong>E-Mail:</strong> privacidad@furgocasa.com</li>
                <li><strong>Telefon:</strong> +34 968 000 000</li>
              </ul>

              <h2>2. Personenbezogene Daten, die wir verarbeiten</h2>
              <p>FURGOCASA kann folgende Kategorien personenbezogener Daten verarbeiten:</p>
              <ul>
                <li><strong>Identifikationsdaten:</strong> Name, Nachname, DNI/NIE/Reisepass</li>
                <li><strong>Kontaktdaten:</strong> Postanschrift, E-Mail, Telefon</li>
                <li><strong>Rechnungsdaten:</strong> Bankdaten, Zahlungshistorie</li>
                <li><strong>Führerscheindaten:</strong> Führerschein, Ausstellungsdatum</li>
                <li><strong>Navigationsdaten:</strong> IP-Adresse, Cookies, Präferenzen</li>
              </ul>

              <h2>3. Zweck der Verarbeitung</h2>
              <p>Die bereitgestellten personenbezogenen Daten werden zu folgenden Zwecken verarbeitet:</p>
              <ul>
                <li>Verwaltung von Reservierungen und Mietverträgen für Fahrzeuge</li>
                <li>Rechnungsstellung und Einzug der vereinbarten Dienstleistungen</li>
                <li>Bearbeitung von Anfragen und Informationsanfragen</li>
                <li>Versand von kommerziellen Mitteilungen (mit vorheriger Zustimmung)</li>
                <li>Erfüllung gesetzlicher Verpflichtungen</li>
                <li>Verbesserung unserer Dienstleistungen und Benutzererfahrung</li>
              </ul>

              <h2>4. Rechtsgrundlage der Verarbeitung</h2>
              <p>Die Rechtsgrundlage für die Verarbeitung Ihrer Daten ist:</p>
              <ul>
                <li><strong>Vertragserfüllung:</strong> zur Verwaltung von Reservierungen und Mieten</li>
                <li><strong>Einwilligung:</strong> für den Versand von kommerziellen Mitteilungen</li>
                <li><strong>Gesetzliche Verpflichtung:</strong> zur Einhaltung der Steuer- und Verkehrsvorschriften</li>
                <li><strong>Berechtigtes Interesse:</strong> zur Verbesserung unserer Dienstleistungen</li>
              </ul>

              <h2>5. Empfänger der Daten</h2>
              <p>Ihre Daten können mitgeteilt werden an:</p>
              <ul>
                <li>Versicherungsgesellschaften (zur Verwaltung der Fahrzeugversicherung)</li>
                <li>Banken (zur Zahlungsabwicklung)</li>
                <li>Öffentliche Verwaltungen (wenn eine gesetzliche Verpflichtung besteht)</li>
                <li>Technologie-Dienstleister (Hosting, E-Mail, etc.)</li>
              </ul>

              <h2>6. Aufbewahrungsfrist</h2>
              <p>Die personenbezogenen Daten werden aufbewahrt:</p>
              <ul>
                <li>Kundendaten: während der Vertragsbeziehung und weitere 5 Jahre</li>
                <li>Rechnungsdaten: 6 Jahre (gesetzliche Verpflichtung)</li>
                <li>Navigationsdaten: maximal 2 Jahre</li>
                <li>Marketing-Zustimmungen: bis zu ihrem Widerruf</li>
              </ul>

              <h2>7. Rechte der betroffenen Person</h2>
              <p>Sie haben das Recht auf:</p>
              <ul>
                <li><strong>Zugang:</strong> zu erfahren, welche Daten wir über Sie haben</li>
                <li><strong>Berichtigung:</strong> unrichtige Daten zu korrigieren</li>
                <li><strong>Löschung:</strong> die Löschung Ihrer Daten zu beantragen</li>
                <li><strong>Einschränkung:</strong> die Verarbeitung in bestimmten Fällen einzuschränken</li>
                <li><strong>Datenübertragbarkeit:</strong> Ihre Daten in strukturiertem Format zu erhalten</li>
                <li><strong>Widerspruch:</strong> der Verarbeitung Ihrer Daten zu widersprechen</li>
              </ul>
              <p>Um diese Rechte auszuüben, können Sie uns unter privacidad@furgocasa.com kontaktieren und eine Kopie Ihres Ausweises beifügen.</p>

              <h2>8. Cookies</h2>
              <p>Diese Website verwendet eigene und Drittanbieter-Cookies. Weitere Informationen finden Sie in unserer Cookie-Richtlinie.</p>

              <h2>9. Sicherheit</h2>
              <p>FURGOCASA hat die notwendigen technischen und organisatorischen Maßnahmen ergriffen, um die Sicherheit der personenbezogenen Daten zu gewährleisten und deren Änderung, Verlust, Verarbeitung oder unbefugten Zugriff zu verhindern.</p>

              <h2>10. Änderungen</h2>
              <p>FURGOCASA behält sich das Recht vor, diese Datenschutzerklärung zu ändern, um sie an neue gesetzliche oder rechtliche Entwicklungen anzupassen.</p>

              <h2>11. Beschwerden</h2>
              <p>Wenn Sie der Ansicht sind, dass die Verarbeitung Ihrer Daten nicht den Vorschriften entspricht, können Sie eine Beschwerde bei der Spanischen Datenschutzbehörde (www.aepd.es) einreichen.</p>
            </div>
          </div>
        </section>
      </main>
</>
  );
}
