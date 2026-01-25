import { Metadata } from "next";
import { 
  MapPin, Wifi, Droplets, Plug, Trash2, ShowerHead, ExternalLink, Sparkles, Route, Map, Shield,
  QrCode, Bell, Phone, FileText, Brain, TrendingUp, MessageCircle, Lock, Zap, Globe,
  Camera, Calendar, DollarSign, BarChart3, CheckCircle, Cloud, Star, ChevronRight
} from "lucide-react";
import { translateServer } from "@/lib/i18n/server-translation";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import type { Locale } from "@/lib/i18n/config";
import Image from "next/image";

interface PageProps {}

const MAPA_AREAS_METADATA: Metadata = {
  title: "Furgocasa Karte - Wohnmobil-Stellplätze + KI Intelligentes Management | +3600 Standorte",
  description: "Ihre komplette Plattform zur Verwaltung Ihres Wohnmobils mit KI. +1000 verifizierte Stellplätze, intelligente Routen, GPT-4-Bewertung und 24/7-Schutz mit QR-System.",
  keywords: "wohnmobil karte, wohnmobilstellplätze, wohnmobil übernachtung, wohnmobil KI bewertung, GPT-4, wohnmobil QR-system, wohnmobil routen",
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale: Locale = 'de';
  
  const alternates = buildCanonicalAlternates('/mapa-areas', locale);

  return {
    ...MAPA_AREAS_METADATA,
    alternates,
    openGraph: {
      ...MAPA_AREAS_METADATA,
      url: alternates.canonical,
      images: [
        {
          url: "https://www.mapafurgocasa.com/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "Furgocasa Karte - Wohnmobil-Stellplätze mit KI",
        },
      ],
    },
  };
}

export default async function LocaleMapaAreasPage({ params }: PageProps) {
  const locale: Locale = 'de';
  const t = (key: string) => translateServer(key, locale);
  
  return (
    <main className="min-h-screen bg-white font-amiko">
      {/* Hero-Bereich */}
      <section className="relative bg-gradient-to-br from-furgocasa-blue via-blue-700 to-indigo-900 py-20 overflow-hidden">
        {/* Hintergrundmuster */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* GPT-4 Badge */}
            <div className="inline-flex items-center gap-2 bg-yellow-400/20 text-yellow-300 px-4 py-2 rounded-full text-sm font-bold tracking-wider uppercase mb-6 backdrop-blur-sm border border-yellow-400/30">
              <Sparkles className="h-4 w-4" />
              Jetzt mit Künstlicher Intelligenz GPT-4
            </div>

            <h1 className="text-4xl md:text-6xl font-heading font-black text-white mb-6">
              Furgocasa Karte
            </h1>
            <p className="text-2xl md:text-3xl text-blue-100 font-bold mb-4">
              Viel mehr als eine Wohnmobil-Stellplatz-App
            </p>
            <p className="text-xl text-blue-200 mb-8 max-w-3xl mx-auto leading-relaxed">
              Ihre komplette Plattform zur Verwaltung Ihres Wohnmobils mit KI. Automatische Bewertungen, intelligente Routen und 24/7-Schutz.
            </p>

            {/* Schnellstatistiken */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <p className="text-3xl font-heading font-bold text-white">+1000</p>
                <p className="text-sm text-blue-200">Verifizierte Stellplätze</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <p className="text-3xl font-heading font-bold text-white">100%</p>
                <p className="text-sm text-blue-200">Immer Kostenlos</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <p className="text-3xl font-heading font-bold text-white">24/7</p>
                <p className="text-sm text-blue-200">Aktualisiert</p>
              </div>
            </div>

            {/* Haupt-CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="https://www.mapafurgocasa.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-furgocasa-orange hover:bg-furgocasa-orange-dark text-white font-bold py-4 px-8 rounded-xl transition-all hover:scale-105 shadow-2xl shadow-orange-500/30 text-lg"
              >
                <Map className="h-5 w-5" />
                Kostenlos Starten
                <ExternalLink className="h-4 w-4" />
              </a>
              <a 
                href="https://www.mapafurgocasa.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold py-4 px-8 rounded-xl transition-colors border-2 border-white/30 text-lg"
              >
                Stellplatz-Karte Ansehen
                <ChevronRight className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Bereich: Alles was Sie brauchen */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900 mb-4">
              Alles was Sie brauchen auf einer Plattform
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Komplette Verwaltung Ihres Wohnmobils mit modernster Technologie
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {[
              {
                icon: Map,
                title: "+1000 Aktualisierte Stellplätze",
                description: "Vollständige Datenbank mit öffentlichen und privaten Stellplätzen, Campingplätzen und Parkplätzen. Verifizierte Informationen zu Services, Preisen und genauen Standorten.",
                color: "from-green-500 to-emerald-600"
              },
              {
                icon: Route,
                title: "Routenplaner",
                description: "Erstellen Sie personalisierte Routen und entdecken Sie automatisch nahe gelegene Übernachtungsplätze. Optimieren Sie Entfernungen und Reisezeiten.",
                color: "from-blue-500 to-blue-600"
              },
              {
                icon: Globe,
                title: "Weltweite Abdeckung",
                description: "Spanien, Portugal, Frankreich, Andorra, Argentinien und weitere Länder. Wir erweitern ständig unser globales Netzwerk von Stellplätzen.",
                color: "from-purple-500 to-indigo-600"
              },
              {
                icon: Shield,
                title: "24/7 Schutz",
                description: "Intelligentes QR-System zur Meldung von Vorfällen und Schäden. Sofortige Benachrichtigungen mit GPS-Standort.",
                color: "from-red-500 to-rose-600"
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group border border-gray-100"
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-heading font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bereich: Intelligentes Management mit KI */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 relative overflow-hidden">
        {/* Leuchteffekt */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12 lg:mb-16">
            <div className="inline-flex items-center gap-2 bg-yellow-400/20 text-yellow-300 px-4 py-2 rounded-full text-sm font-bold mb-6 backdrop-blur-sm">
              <Brain className="h-4 w-4" />
              ANGETRIEBEN VON GPT-4
            </div>
            <h2 className="text-3xl lg:text-5xl font-heading font-bold text-white mb-4">
              Intelligentes Management Ihres Wohnmobils
            </h2>
            <p className="text-xl text-blue-200 max-w-3xl mx-auto">
              Automatische Bewertung mit GPT-4 in Sekunden. Vollständige Kontrolle mit Echtzeit-Marktpreisvergleich.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {[
              { icon: Brain, title: "KI-Bewertung", desc: "GPT-4 in Sekunden", color: "bg-purple-500/20 border-purple-400/30" },
              { icon: BarChart3, title: "Marktpreise", desc: "Echter Vergleich", color: "bg-blue-500/20 border-blue-400/30" },
              { icon: Calendar, title: "Wartung", desc: "Vollständiger Verlauf", color: "bg-green-500/20 border-green-400/30" },
              { icon: DollarSign, title: "Kostenkontrolle", desc: "Automatischer ROI", color: "bg-yellow-500/20 border-yellow-400/30" },
              { icon: TrendingUp, title: "Wertverlauf", desc: "Preisentwicklung", color: "bg-red-500/20 border-red-400/30" },
              { icon: Camera, title: "Fotoverwaltung", desc: "Vollständige Galerie", color: "bg-pink-500/20 border-pink-400/30" },
            ].map((item, index) => (
              <div
                key={index}
                className={`${item.color} backdrop-blur-sm p-6 rounded-xl border-2 hover:scale-105 transition-all duration-300 cursor-pointer`}
              >
                <item.icon className="h-10 w-10 text-white mb-4" />
                <h3 className="text-lg font-heading font-bold text-white mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-white/80">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <a
              href="https://www.mapafurgocasa.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-white font-semibold hover:text-yellow-300 transition-colors"
            >
              Mehr über KI-Bewertung erfahren
              <ChevronRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Bereich: Intelligentes QR-System */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-bold mb-6">
                  <Shield className="h-4 w-4" />
                  ANTI-SCHADENS-SYSTEM
                </div>
                <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900 mb-6">
                  Intelligentes QR-System: 24/7 Schutz
                </h2>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Einzigartiger QR-Code für Ihr Fahrzeug. Zeugen können Vorfälle oder Schäden durch Scannen melden. Erhalten Sie sofortige Benachrichtigungen mit Fotos, GPS und Daten.
                </p>

                <div className="space-y-6">
                  {[
                    { icon: Bell, title: "Unfallwarnungen", desc: "Mit Fotos und GPS-Standort" },
                    { icon: QrCode, title: "Schadensmeldung", desc: "Falls sie Schäden an Ihrem Fahrzeug sehen" },
                    { icon: Phone, title: "Notfallkontakt", desc: "Für Behörden und Versicherungen" },
                    { icon: FileText, title: "Vollständiger Verlauf", desc: "Alle Berichte gespeichert" },
                  ].map((feature, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <feature.icon className="h-6 w-6 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-gray-900 text-lg mb-1">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600">
                          {feature.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <a
                    href="https://www.mapafurgocasa.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-furgocasa-orange font-bold hover:text-furgocasa-orange-dark transition-colors"
                  >
                    Alarmsystem Entdecken
                    <ChevronRight className="h-5 w-5" />
                  </a>
                </div>
              </div>

              {/* QR-Mockup */}
              <div className="relative">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 shadow-2xl border border-gray-200">
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="aspect-square bg-gradient-to-br from-red-50 to-orange-50 rounded-xl flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 gap-2 p-4">
                        {Array.from({ length: 64 }).map((_, i) => (
                          <div
                            key={i}
                            className={`${Math.random() > 0.5 ? 'bg-gray-900' : 'bg-transparent'} rounded-sm`}
                          ></div>
                        ))}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white rounded-lg p-4 shadow-lg">
                          <QrCode className="h-16 w-16 text-red-600" />
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <p className="font-bold text-gray-900 text-lg">Schutz-QR-Code</p>
                      <p className="text-sm text-gray-500">ID: ABC-12345-XYZ</p>
                    </div>
                  </div>
                  
                  {/* Schwebendes Badge */}
                  <div className="absolute -top-4 -right-4 bg-red-500 text-white font-bold px-6 py-3 rounded-full shadow-xl transform rotate-12 animate-pulse">
                    24/7
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bereich: KI-Technologie */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-bold mb-6">
              <Sparkles className="h-4 w-4" />
              KÜNSTLICHE INTELLIGENZ
            </div>
            <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900 mb-4">
              Technologie die Ihr Wohnmobil versteht
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              GPT-4 analysiert, bewertet und berät Sie in Echtzeit
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Brain,
                title: "Intelligente Bewertung",
                description: "GPT-4 analysiert Marke, Modell, Jahr, Kilometerstand und Markt, um Ihnen in Sekunden eine genaue Bewertung mit professionellem PDF-Bericht zu geben.",
                color: "from-purple-500 to-purple-600"
              },
              {
                icon: BarChart3,
                title: "Marktvergleich",
                description: "Wir vergleichen mit Tausenden echten Anzeigen von spezialisierten Portalen, um den fairen Preis Ihres Fahrzeugs zu bestimmen.",
                color: "from-blue-500 to-blue-600"
              },
              {
                icon: MessageCircle,
                title: "Experten-Chatbot",
                description: "KI-Assistent rund um die Uhr verfügbar, um Fragen zu Stellplätzen, Routen und personalisierten Empfehlungen zu beantworten.",
                color: "from-green-500 to-emerald-600"
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-heading font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bereich: In 3 Schritten starten */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900 mb-4">
              In 3 einfachen Schritten starten
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Von der Registrierung bis zu Ihrer ersten KI-Bewertung in weniger als 5 Minuten
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto">
            {[
              {
                step: "1",
                icon: CheckCircle,
                title: "Kostenlos Registrieren",
                description: "Erstellen Sie Ihr Konto in 30 Sekunden. Keine Kreditkarte. Sofortiger Zugang zu allen Funktionen.",
                color: "from-green-500 to-emerald-600"
              },
              {
                step: "2",
                icon: Camera,
                title: "Fahrzeug Registrieren",
                description: "Fügen Sie Marke, Modell, Jahr und Kilometerstand hinzu. Laden Sie Fotos hoch und erhalten Sie Ihren Schutz-QR-Code.",
                color: "from-blue-500 to-blue-600"
              },
              {
                step: "3",
                icon: Brain,
                title: "Sofortige KI-Bewertung",
                description: "Klicken Sie auf \"Mit KI bewerten\" und erhalten Sie in 30 Sekunden einen professionellen Bericht mit echtem Marktpreis.",
                color: "from-purple-500 to-purple-600"
              },
            ].map((step, index) => (
              <div key={index} className="relative">
                {/* Verbindungslinie (nur Desktop) */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-gray-300 to-transparent -z-10"></div>
                )}
                
                <div className="text-center">
                  <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-6 shadow-xl`}>
                    <step.icon className="h-12 w-12 text-white" />
                  </div>
                  <div className="mb-4">
                    <span className="text-5xl font-heading font-black text-gray-200">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="text-xl font-heading font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <a
              href="https://www.mapafurgocasa.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-furgocasa-orange hover:bg-furgocasa-orange-dark text-white font-bold py-4 px-8 rounded-xl transition-all hover:scale-105 shadow-xl text-lg"
            >
              Kostenloses Konto Erstellen
              <ChevronRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Bereich: Warum uns vertrauen? */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-5xl font-heading font-bold mb-4">
              Warum sollten Sie uns vertrauen?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Erstklassige Technologie für die genauesten und zuverlässigsten Informationen
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {[
              {
                icon: Map,
                title: "Google Maps API Integration",
                description: "Daten direkt von Google Maps verifiziert. Genaue GPS-Standorte, echte Fotos, aktualisierte Öffnungszeiten und Nutzerbewertungen.",
                badge: "Google Maps"
              },
              {
                icon: Brain,
                title: "Bewertung mit OpenAI GPT-4",
                description: "Künstliche Intelligenz der neuesten Generation analysiert Tausende echter Marktdaten. Vergleich mit spezialisierten Portalen.",
                badge: "OpenAI GPT-4"
              },
              {
                icon: FileText,
                title: "Verlauf und Vollständige Rückverfolgbarkeit",
                description: "Erfassen Sie jede Wartung, Ausgabe und Bewertung mit exaktem Datum. Sichere Datenbank, die das gesamte Leben Ihres Fahrzeugs speichert.",
                badge: "100% Rückverfolgbar"
              },
              {
                icon: Lock,
                title: "Sicherheit und Datenschutz",
                description: "Ende-zu-Ende-Verschlüsselung für alle Ihre Daten. Sichere Server in Europa. Volle DSGVO-Konformität.",
                badge: "DSGVO"
              },
              {
                icon: Zap,
                title: "Echtzeit-Updates",
                description: "Automatisches Synchronisierungssystem mit offiziellen Quellen. Marktpreise werden täglich aktualisiert.",
                badge: "Echtzeit"
              },
              {
                icon: Star,
                title: "100% Unabhängig",
                description: "Keine Interessenkonflikte. Wir verkaufen Ihre Daten nicht. Keine Werbung, die Ergebnisse beeinflusst. Objektive und neutrale Informationen.",
                badge: "Unabhängig"
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <feature.icon className="h-10 w-10 text-furgocasa-orange flex-shrink-0" />
                  <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full font-bold">
                    {feature.badge}
                  </span>
                </div>
                <h3 className="text-xl font-heading font-bold mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Technologie-Badges */}
          <div className="mt-16 pt-12 border-t border-white/10">
            <p className="text-center text-gray-400 mb-8 text-sm uppercase tracking-wider font-semibold">
              Unternehmenstechnologie auf höchstem Niveau im Dienste der Wohnmobilisten
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8">
              <div className="flex items-center gap-3 bg-white/10 px-6 py-3 rounded-lg backdrop-blur-sm">
                <Map className="h-6 w-6 text-green-400" />
                <span className="font-bold">Offizielle Google Maps API</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 px-6 py-3 rounded-lg backdrop-blur-sm">
                <Brain className="h-6 w-6 text-purple-400" />
                <span className="font-bold">OpenAI GPT-4 Erweiterte KI</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 px-6 py-3 rounded-lg backdrop-blur-sm">
                <Cloud className="h-6 w-6 text-blue-400" />
                <span className="font-bold">AWS Cloud Sichere Infrastruktur</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Abschließender CTA */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-furgocasa-orange via-orange-500 to-red-500 relative overflow-hidden">
        {/* Dekoratives Muster */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl lg:text-6xl font-heading font-black text-white mb-6">
            Entdecken Sie über 1000 Stellplätze in ganz Spanien
          </h2>
          <p className="text-xl lg:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
            Furgocasa Karte ist Ihr perfekter Reisebegleiter. Planen Sie Routen, finden Sie verifizierte Stellplätze und verwalten Sie Ihr Wohnmobil mit künstlicher Intelligenz.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <a 
              href="https://www.mapafurgocasa.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 bg-white text-furgocasa-orange font-black py-5 px-10 rounded-2xl hover:bg-gray-100 transition-all hover:scale-105 shadow-2xl text-xl"
            >
              <Map className="h-6 w-6" />
              Zur Furgocasa Karte
              <ExternalLink className="h-5 w-5" />
            </a>
            <a 
              href="/de/kontakt"
              className="inline-flex items-center justify-center gap-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold py-5 px-10 rounded-2xl transition-colors border-2 border-white/40 text-xl"
            >
              Stellplatz Vorschlagen
            </a>
          </div>

          {/* Testimonial Social Proof */}
          <div className="mt-16 flex items-center justify-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-12 h-12 rounded-full bg-white/20 border-2 border-white flex items-center justify-center backdrop-blur-sm">
                  <span className="text-white font-bold text-xl">👤</span>
                </div>
              ))}
            </div>
            <div className="text-left">
              <p className="text-white font-bold text-lg">+1k</p>
              <p className="text-white/80 text-sm">Tausende Wohnmobilisten haben es bereits installiert</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer-Info */}
      <section className="py-12 bg-gray-900 text-gray-400">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">
            Ein Unternehmen von <a href="https://www.furgocasa.com" className="text-furgocasa-orange hover:text-furgocasa-orange-dark font-semibold">www.furgocasa.com</a>
          </p>
          <p className="text-sm">
            Mit ❤️ in Spanien gemacht
          </p>
        </div>
      </section>
    </main>
  );
}
