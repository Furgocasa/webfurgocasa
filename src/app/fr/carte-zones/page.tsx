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
  title: "Carte Furgocasa - Aires Camping-Cars + Gestion Intelligente IA | +3600 Emplacements",
  description: "Votre plateforme complète pour gérer votre camping-car avec l'IA. +1000 aires vérifiées, routes intelligentes, évaluation GPT-4 et protection 24/7 avec système QR.",
  keywords: "carte camping-cars, aires camping-cars, stationnement camping-cars, évaluation camping-car IA, GPT-4, système QR camping-car, routes camping-cars",
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale: Locale = 'fr';
  
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
          alt: "Carte Furgocasa - Aires Camping-Cars avec IA",
        },
      ],
    },
  };
}

export default async function LocaleMapaAreasPage({ params }: PageProps) {
  const locale: Locale = 'fr';
  const t = (key: string) => translateServer(key, locale);
  
  return (
    <main className="min-h-screen bg-white font-amiko">
      {/* Section Hero */}
      <section className="relative bg-gradient-to-br from-furgocasa-blue via-blue-700 to-indigo-900 py-20 overflow-hidden">
        {/* Motif de fond */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge GPT-4 */}
            <div className="inline-flex items-center gap-2 bg-yellow-400/20 text-yellow-300 px-4 py-2 rounded-full text-sm font-bold tracking-wider uppercase mb-6 backdrop-blur-sm border border-yellow-400/30">
              <Sparkles className="h-4 w-4" />
              Maintenant avec Intelligence Artificielle GPT-4
            </div>

            <h1 className="text-4xl md:text-6xl font-heading font-black text-white mb-6">
              Carte Furgocasa
            </h1>
            <p className="text-2xl md:text-3xl text-blue-100 font-bold mb-4">
              Bien plus qu'une application d'aires de camping-cars
            </p>
            <p className="text-xl text-blue-200 mb-8 max-w-3xl mx-auto leading-relaxed">
              Votre plateforme complète pour gérer votre camping-car avec l'IA. Évaluations automatiques, routes intelligentes et protection 24/7.
            </p>

            {/* Statistiques rapides */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <p className="text-3xl font-heading font-bold text-white">+1000</p>
                <p className="text-sm text-blue-200">Aires Vérifiées</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <p className="text-3xl font-heading font-bold text-white">100%</p>
                <p className="text-sm text-blue-200">Toujours Gratuit</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <p className="text-3xl font-heading font-bold text-white">24/7</p>
                <p className="text-sm text-blue-200">À Jour</p>
              </div>
            </div>

            {/* CTA Principal */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="https://www.mapafurgocasa.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-furgocasa-orange hover:bg-furgocasa-orange-dark text-white font-bold py-4 px-8 rounded-xl transition-all hover:scale-105 shadow-2xl shadow-orange-500/30 text-lg"
              >
                <Map className="h-5 w-5" />
                Commencer Gratuitement
                <ExternalLink className="h-4 w-4" />
              </a>
              <a 
                href="https://www.mapafurgocasa.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold py-4 px-8 rounded-xl transition-colors border-2 border-white/30 text-lg"
              >
                Voir la Carte des Aires
                <ChevronRight className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Section : Tout ce dont vous avez besoin */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900 mb-4">
              Tout ce dont vous avez besoin sur une seule plateforme
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Gestion complète de votre camping-car avec une technologie de pointe
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {[
              {
                icon: Map,
                title: "+1000 Aires Actualisées",
                description: "Base de données complète avec aires publiques, privées, campings et parkings. Informations vérifiées sur les services, prix et emplacements exacts.",
                color: "from-green-500 to-emerald-600"
              },
              {
                icon: Route,
                title: "Planificateur d'Itinéraires",
                description: "Créez des itinéraires personnalisés et découvrez automatiquement les aires de stationnement à proximité. Optimisez distances et temps de trajet.",
                color: "from-blue-500 to-blue-600"
              },
              {
                icon: Globe,
                title: "Couverture Mondiale",
                description: "Espagne, Portugal, France, Andorre, Argentine et plus de pays. Nous étendons constamment notre réseau mondial d'aires.",
                color: "from-purple-500 to-indigo-600"
              },
              {
                icon: Shield,
                title: "Protection 24/7",
                description: "Système QR intelligent pour signaler les incidents et dommages. Notifications instantanées avec localisation GPS.",
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

      {/* Section : Gestion Intelligente avec IA */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 relative overflow-hidden">
        {/* Effet de lumière */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12 lg:mb-16">
            <div className="inline-flex items-center gap-2 bg-yellow-400/20 text-yellow-300 px-4 py-2 rounded-full text-sm font-bold mb-6 backdrop-blur-sm">
              <Brain className="h-4 w-4" />
              PROPULSÉ PAR GPT-4
            </div>
            <h2 className="text-3xl lg:text-5xl font-heading font-bold text-white mb-4">
              Gestion Intelligente de votre Camping-Car
            </h2>
            <p className="text-xl text-blue-200 max-w-3xl mx-auto">
              Évaluation automatique avec GPT-4 en quelques secondes. Contrôle total avec comparaison des prix du marché en temps réel.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {[
              { icon: Brain, title: "Évaluation IA", desc: "GPT-4 en secondes", color: "bg-purple-500/20 border-purple-400/30" },
              { icon: BarChart3, title: "Prix du Marché", desc: "Comparaison réelle", color: "bg-blue-500/20 border-blue-400/30" },
              { icon: Calendar, title: "Entretien", desc: "Historique complet", color: "bg-green-500/20 border-green-400/30" },
              { icon: DollarSign, title: "Contrôle des Dépenses", desc: "ROI automatique", color: "bg-yellow-500/20 border-yellow-400/30" },
              { icon: TrendingUp, title: "Historique de Valeur", desc: "Évolution du prix", color: "bg-red-500/20 border-red-400/30" },
              { icon: Camera, title: "Gestion Photos", desc: "Galerie complète", color: "bg-pink-500/20 border-pink-400/30" },
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
              En savoir plus sur l'Évaluation IA
              <ChevronRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Section : Système QR Intelligent */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-bold mb-6">
                  <Shield className="h-4 w-4" />
                  SYSTÈME ANTI-DOMMAGES
                </div>
                <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900 mb-6">
                  Système QR Intelligent : Protection 24/7
                </h2>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Code QR unique pour votre véhicule. Les témoins peuvent signaler des incidents ou des dommages en le scannant. Recevez des notifications instantanées avec photos, GPS et données.
                </p>

                <div className="space-y-6">
                  {[
                    { icon: Bell, title: "Alertes d'accidents", desc: "Avec photos et localisation GPS" },
                    { icon: QrCode, title: "Notification de dommages", desc: "S'ils voient des dommages sur votre véhicule" },
                    { icon: Phone, title: "Contact d'urgence", desc: "Pour les autorités et les assureurs" },
                    { icon: FileText, title: "Historique complet", desc: "Tous les rapports sauvegardés" },
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
                    Découvrir le Système d'Alertes
                    <ChevronRight className="h-5 w-5" />
                  </a>
                </div>
              </div>

              {/* Mockup visuel du QR */}
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
                      <p className="font-bold text-gray-900 text-lg">Code QR Protection</p>
                      <p className="text-sm text-gray-500">ID: ABC-12345-XYZ</p>
                    </div>
                  </div>
                  
                  {/* Badge flottant */}
                  <div className="absolute -top-4 -right-4 bg-red-500 text-white font-bold px-6 py-3 rounded-full shadow-xl transform rotate-12 animate-pulse">
                    24/7
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section : Technologie IA */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-bold mb-6">
              <Sparkles className="h-4 w-4" />
              INTELLIGENCE ARTIFICIELLE
            </div>
            <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900 mb-4">
              Technologie qui comprend votre camping-car
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              GPT-4 analyse, évalue et vous conseille en temps réel
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Brain,
                title: "Évaluation Intelligente",
                description: "GPT-4 analyse la marque, le modèle, l'année, le kilométrage et le marché pour vous donner une évaluation précise en quelques secondes avec rapport PDF professionnel.",
                color: "from-purple-500 to-purple-600"
              },
              {
                icon: BarChart3,
                title: "Comparaison de Marché",
                description: "Nous comparons avec des milliers d'annonces réelles de portails spécialisés pour déterminer le juste prix de votre véhicule.",
                color: "from-blue-500 to-blue-600"
              },
              {
                icon: MessageCircle,
                title: "Chatbot Expert",
                description: "Assistant IA disponible 24/7 pour répondre aux questions sur les aires, les itinéraires et les recommandations personnalisées.",
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

      {/* Section : Commencer en 3 étapes */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900 mb-4">
              Commencer en 3 étapes simples
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              De l'inscription à votre première évaluation IA en moins de 5 minutes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto">
            {[
              {
                step: "1",
                icon: CheckCircle,
                title: "Inscrivez-vous Gratuitement",
                description: "Créez votre compte en 30 secondes. Sans carte de crédit. Accès immédiat à toutes les fonctionnalités.",
                color: "from-green-500 to-emerald-600"
              },
              {
                step: "2",
                icon: Camera,
                title: "Enregistrez votre Véhicule",
                description: "Ajoutez marque, modèle, année et kilométrage. Téléchargez des photos et obtenez votre code QR de protection.",
                color: "from-blue-500 to-blue-600"
              },
              {
                step: "3",
                icon: Brain,
                title: "Évaluation IA Instantanée",
                description: "Cliquez sur \"Évaluer avec IA\" et recevez un rapport professionnel en 30 secondes avec le prix réel du marché.",
                color: "from-purple-500 to-purple-600"
              },
            ].map((step, index) => (
              <div key={index} className="relative">
                {/* Ligne de connexion (desktop uniquement) */}
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
              Créer un Compte Gratuit
              <ChevronRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Section : Pourquoi nous faire confiance ? */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-5xl font-heading font-bold mb-4">
              Pourquoi devriez-vous nous faire confiance ?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Technologie de premier ordre pour vous donner les informations les plus précises et fiables
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {[
              {
                icon: Map,
                title: "Intégration Google Maps API",
                description: "Données vérifiées directement depuis Google Maps. Localisations GPS précises, photos réelles, horaires à jour et évaluations d'utilisateurs.",
                badge: "Google Maps"
              },
              {
                icon: Brain,
                title: "Évaluation avec OpenAI GPT-4",
                description: "L'intelligence artificielle de dernière génération analyse des milliers de données du marché réel. Comparaison avec des portails spécialisés.",
                badge: "OpenAI GPT-4"
              },
              {
                icon: FileText,
                title: "Historique et Traçabilité Totale",
                description: "Enregistrez chaque entretien, dépense et évaluation avec date exacte. Base de données sécurisée qui conserve toute la vie de votre véhicule.",
                badge: "100% Traçable"
              },
              {
                icon: Lock,
                title: "Sécurité et Confidentialité",
                description: "Chiffrement de bout en bout pour toutes vos données. Serveurs sécurisés en Europe. Conformité totale au RGPD.",
                badge: "RGPD"
              },
              {
                icon: Zap,
                title: "Mises à Jour en Temps Réel",
                description: "Système de synchronisation automatique avec les sources officielles. Les prix du marché sont mis à jour quotidiennement.",
                badge: "Temps Réel"
              },
              {
                icon: Star,
                title: "100% Indépendant",
                description: "Aucun conflit d'intérêts. Nous ne vendons pas vos données. Aucune publicité influençant les résultats. Informations objectives et neutres.",
                badge: "Indépendant"
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

          {/* Badges de technologie */}
          <div className="mt-16 pt-12 border-t border-white/10">
            <p className="text-center text-gray-400 mb-8 text-sm uppercase tracking-wider font-semibold">
              Technologie d'entreprise de premier niveau au service des camping-caristes
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8">
              <div className="flex items-center gap-3 bg-white/10 px-6 py-3 rounded-lg backdrop-blur-sm">
                <Map className="h-6 w-6 text-green-400" />
                <span className="font-bold">Google Maps API Officielle</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 px-6 py-3 rounded-lg backdrop-blur-sm">
                <Brain className="h-6 w-6 text-purple-400" />
                <span className="font-bold">OpenAI GPT-4 IA Avancée</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 px-6 py-3 rounded-lg backdrop-blur-sm">
                <Cloud className="h-6 w-6 text-blue-400" />
                <span className="font-bold">AWS Cloud Infrastructure Sécurisée</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-furgocasa-orange via-orange-500 to-red-500 relative overflow-hidden">
        {/* Motif décoratif */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl lg:text-6xl font-heading font-black text-white mb-6">
            Explorez plus de 1000 aires dans toute l'Espagne
          </h2>
          <p className="text-xl lg:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
            Carte Furgocasa est votre compagnon de voyage parfait. Planifiez des itinéraires, trouvez des aires vérifiées et gérez votre camping-car avec l'intelligence artificielle.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <a 
              href="https://www.mapafurgocasa.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 bg-white text-furgocasa-orange font-black py-5 px-10 rounded-2xl hover:bg-gray-100 transition-all hover:scale-105 shadow-2xl text-xl"
            >
              <Map className="h-6 w-6" />
              Aller à Carte Furgocasa
              <ExternalLink className="h-5 w-5" />
            </a>
            <a 
              href="/fr/contact"
              className="inline-flex items-center justify-center gap-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold py-5 px-10 rounded-2xl transition-colors border-2 border-white/40 text-xl"
            >
              Suggérer une aire
            </a>
          </div>

          {/* Preuve sociale testimoniale */}
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
              <p className="text-white/80 text-sm">Des milliers de camping-caristes l'ont déjà installée</p>
            </div>
          </div>
        </div>
      </section>

      {/* Info footer */}
      <section className="py-12 bg-gray-900 text-gray-400">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">
            Une entreprise de <a href="https://www.furgocasa.com" className="text-furgocasa-orange hover:text-furgocasa-orange-dark font-semibold">www.furgocasa.com</a>
          </p>
          <p className="text-sm">
            Fait avec ❤️ en Espagne
          </p>
        </div>
      </section>
    </main>
  );
}
