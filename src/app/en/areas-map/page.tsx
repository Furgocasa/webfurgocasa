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
  title: "Furgocasa Map - Motorhome Areas + AI Intelligent Management | +3600 Locations",
  description: "Your complete platform to manage your motorhome with AI. +1000 verified areas, intelligent routes, GPT-4 valuation and 24/7 protection with QR system.",
  keywords: "motorhome map, motorhome areas, motorhome overnight parking, motorhome AI valuation, GPT-4, motorhome QR system, motorhome routes",
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale: Locale = 'en';
  
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
          alt: "Furgocasa Map - Motorhome Areas with AI",
        },
      ],
    },
  };
}

export default async function LocaleMapaAreasPage({ params }: PageProps) {
  const locale: Locale = 'en';
  const t = (key: string) => translateServer(key, locale);
  
  return (
    <main className="min-h-screen bg-white font-amiko">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-furgocasa-blue via-blue-700 to-indigo-900 py-20 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* GPT-4 Badge */}
            <div className="inline-flex items-center gap-2 bg-yellow-400/20 text-yellow-300 px-4 py-2 rounded-full text-sm font-bold tracking-wider uppercase mb-6 backdrop-blur-sm border border-yellow-400/30">
              <Sparkles className="h-4 w-4" />
              Now with GPT-4 Artificial Intelligence
            </div>

            <h1 className="text-4xl md:text-6xl font-heading font-black text-white mb-6">
              Furgocasa Map
            </h1>
            <p className="text-2xl md:text-3xl text-blue-100 font-bold mb-4">
              Much more than a motorhome areas app
            </p>
            <p className="text-xl text-blue-200 mb-8 max-w-3xl mx-auto leading-relaxed">
              Your complete platform to manage your motorhome with AI. Automatic valuations, intelligent routes and 24/7 protection.
            </p>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <p className="text-3xl font-heading font-bold text-white">+1000</p>
                <p className="text-sm text-blue-200">Verified Areas</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <p className="text-3xl font-heading font-bold text-white">100%</p>
                <p className="text-sm text-blue-200">Always Free</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <p className="text-3xl font-heading font-bold text-white">24/7</p>
                <p className="text-sm text-blue-200">Updated</p>
              </div>
            </div>

            {/* Main CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="https://www.mapafurgocasa.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-furgocasa-orange hover:bg-furgocasa-orange-dark text-white font-bold py-4 px-8 rounded-xl transition-all hover:scale-105 shadow-2xl shadow-orange-500/30 text-lg"
              >
                <Map className="h-5 w-5" />
                Start Free
                <ExternalLink className="h-4 w-4" />
              </a>
              <a 
                href="https://www.mapafurgocasa.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold py-4 px-8 rounded-xl transition-colors border-2 border-white/30 text-lg"
              >
                View Areas Map
                <ChevronRight className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Everything you need */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900 mb-4">
              Everything you need in one platform
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Complete management of your motorhome with state-of-the-art technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {[
              {
                icon: Map,
                title: "+1000 Updated Areas",
                description: "Complete database with public and private areas, campgrounds and parking lots. Verified information on services, prices and exact locations.",
                color: "from-green-500 to-emerald-600"
              },
              {
                icon: Route,
                title: "Route Planner",
                description: "Create personalized routes and automatically discover nearby overnight parking areas. Optimize distances and travel times.",
                color: "from-blue-500 to-blue-600"
              },
              {
                icon: Globe,
                title: "Worldwide Coverage",
                description: "Spain, Portugal, France, Andorra, Argentina and more countries. We constantly expand our global network of areas.",
                color: "from-purple-500 to-indigo-600"
              },
              {
                icon: Shield,
                title: "24/7 Protection",
                description: "Smart QR system to report incidents and damages. Instant notifications with GPS location.",
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

      {/* Section: Intelligent Management with AI */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12 lg:mb-16">
            <div className="inline-flex items-center gap-2 bg-yellow-400/20 text-yellow-300 px-4 py-2 rounded-full text-sm font-bold mb-6 backdrop-blur-sm">
              <Brain className="h-4 w-4" />
              POWERED BY GPT-4
            </div>
            <h2 className="text-3xl lg:text-5xl font-heading font-bold text-white mb-4">
              Intelligent Management of your Motorhome
            </h2>
            <p className="text-xl text-blue-200 max-w-3xl mx-auto">
              Automatic valuation with GPT-4 in seconds. Total control with real-time market price comparison.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {[
              { icon: Brain, title: "AI Valuation", desc: "GPT-4 in seconds", color: "bg-purple-500/20 border-purple-400/30" },
              { icon: BarChart3, title: "Market Prices", desc: "Real comparison", color: "bg-blue-500/20 border-blue-400/30" },
              { icon: Calendar, title: "Maintenance", desc: "Complete history", color: "bg-green-500/20 border-green-400/30" },
              { icon: DollarSign, title: "Expense Control", desc: "Automatic ROI", color: "bg-yellow-500/20 border-yellow-400/30" },
              { icon: TrendingUp, title: "Value History", desc: "Price evolution", color: "bg-red-500/20 border-red-400/30" },
              { icon: Camera, title: "Photo Management", desc: "Complete gallery", color: "bg-pink-500/20 border-pink-400/30" },
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
              Learn more about AI Valuation
              <ChevronRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Section: Smart QR System */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-bold mb-6">
                  <Shield className="h-4 w-4" />
                  ANTI-DAMAGE SYSTEM
                </div>
                <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900 mb-6">
                  Smart QR System: 24/7 Protection
                </h2>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Unique QR code for your vehicle. Witnesses can report incidents or damages by scanning it. Receive instant notifications with photos, GPS and data.
                </p>

                <div className="space-y-6">
                  {[
                    { icon: Bell, title: "Accident alerts", desc: "With photos and GPS location" },
                    { icon: QrCode, title: "Damage notification", desc: "If they see damage to your vehicle" },
                    { icon: Phone, title: "Emergency contact", desc: "For authorities and insurers" },
                    { icon: FileText, title: "Complete history", desc: "All reports saved" },
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
                    Discover the Alert System
                    <ChevronRight className="h-5 w-5" />
                  </a>
                </div>
              </div>

              {/* QR visual mockup */}
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
                      <p className="font-bold text-gray-900 text-lg">Protection QR Code</p>
                      <p className="text-sm text-gray-500">ID: ABC-12345-XYZ</p>
                    </div>
                  </div>
                  
                  {/* Floating badge */}
                  <div className="absolute -top-4 -right-4 bg-red-500 text-white font-bold px-6 py-3 rounded-full shadow-xl transform rotate-12 animate-pulse">
                    24/7
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: AI Technology */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-bold mb-6">
              <Sparkles className="h-4 w-4" />
              ARTIFICIAL INTELLIGENCE
            </div>
            <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900 mb-4">
              Technology that understands your motorhome
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              GPT-4 analyzes, values and advises you in real time
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Brain,
                title: "Intelligent Valuation",
                description: "GPT-4 analyzes brand, model, year, mileage and market to give you an accurate valuation in seconds with professional PDF report.",
                color: "from-purple-500 to-purple-600"
              },
              {
                icon: BarChart3,
                title: "Market Comparison",
                description: "We compare with thousands of real ads from specialized portals to determine the fair price of your vehicle.",
                color: "from-blue-500 to-blue-600"
              },
              {
                icon: MessageCircle,
                title: "Expert Chatbot",
                description: "AI assistant available 24/7 to answer questions about areas, routes and personalized recommendations.",
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

      {/* Section: Start in 3 steps */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900 mb-4">
              Start in 3 simple steps
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From registration to your first AI valuation in less than 5 minutes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto">
            {[
              {
                step: "1",
                icon: CheckCircle,
                title: "Register Free",
                description: "Create your account in 30 seconds. No credit card. Immediate access to all features.",
                color: "from-green-500 to-emerald-600"
              },
              {
                step: "2",
                icon: Camera,
                title: "Register your Vehicle",
                description: "Add brand, model, year and mileage. Upload photos and get your protection QR code.",
                color: "from-blue-500 to-blue-600"
              },
              {
                step: "3",
                icon: Brain,
                title: "Instant AI Valuation",
                description: "Click on \"Value with AI\" and receive a professional report in 30 seconds with real market price.",
                color: "from-purple-500 to-purple-600"
              },
            ].map((step, index) => (
              <div key={index} className="relative">
                {/* Connector line (desktop only) */}
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
              Create Free Account
              <ChevronRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Section: Why trust us? */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-5xl font-heading font-bold mb-4">
              Why should you trust us?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              First-class technology to give you the most accurate and reliable information
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {[
              {
                icon: Map,
                title: "Google Maps API Integration",
                description: "Data verified directly from Google Maps. Accurate GPS locations, real photos, updated schedules and user ratings.",
                badge: "Google Maps"
              },
              {
                icon: Brain,
                title: "Valuation with OpenAI GPT-4",
                description: "Latest generation artificial intelligence analyzes thousands of real market data. Comparison with specialized portals.",
                badge: "OpenAI GPT-4"
              },
              {
                icon: FileText,
                title: "History and Total Traceability",
                description: "Record each maintenance, expense and valuation with exact date. Secure database that stores your vehicle's entire life.",
                badge: "100% Traceable"
              },
              {
                icon: Lock,
                title: "Security and Privacy",
                description: "End-to-end encryption for all your data. Secure servers in Europe. Full GDPR compliance.",
                badge: "GDPR"
              },
              {
                icon: Zap,
                title: "Real-Time Updates",
                description: "Automatic synchronization system with official sources. Market prices are updated daily.",
                badge: "Real Time"
              },
              {
                icon: Star,
                title: "100% Independent",
                description: "No conflicts of interest. We don't sell your data. No advertising that influences results. Objective and neutral information.",
                badge: "Independent"
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

          {/* Technology badges */}
          <div className="mt-16 pt-12 border-t border-white/10">
            <p className="text-center text-gray-400 mb-8 text-sm uppercase tracking-wider font-semibold">
              Enterprise-level technology at the service of motorhomers
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8">
              <div className="flex items-center gap-3 bg-white/10 px-6 py-3 rounded-lg backdrop-blur-sm">
                <Map className="h-6 w-6 text-green-400" />
                <span className="font-bold">Official Google Maps API</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 px-6 py-3 rounded-lg backdrop-blur-sm">
                <Brain className="h-6 w-6 text-purple-400" />
                <span className="font-bold">OpenAI GPT-4 Advanced AI</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 px-6 py-3 rounded-lg backdrop-blur-sm">
                <Cloud className="h-6 w-6 text-blue-400" />
                <span className="font-bold">AWS Cloud Secure Infrastructure</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-furgocasa-orange via-orange-500 to-red-500 relative overflow-hidden">
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl lg:text-6xl font-heading font-black text-white mb-6">
            Explore more than 1000 areas across Spain
          </h2>
          <p className="text-xl lg:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
            Furgocasa Map is your perfect travel companion. Plan routes, find verified areas and manage your motorhome with artificial intelligence.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <a 
              href="https://www.mapafurgocasa.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 bg-white text-furgocasa-orange font-black py-5 px-10 rounded-2xl hover:bg-gray-100 transition-all hover:scale-105 shadow-2xl text-xl"
            >
              <Map className="h-6 w-6" />
              Go to Furgocasa Map
              <ExternalLink className="h-5 w-5" />
            </a>
            <a 
              href="/en/contact"
              className="inline-flex items-center justify-center gap-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold py-5 px-10 rounded-2xl transition-colors border-2 border-white/40 text-xl"
            >
              Suggest an area
            </a>
          </div>

          {/* Testimonial social proof */}
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
              <p className="text-white/80 text-sm">Thousands of motorhomers already have it installed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer info */}
      <section className="py-12 bg-gray-900 text-gray-400">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">
            A company of <a href="https://www.furgocasa.com" className="text-furgocasa-orange hover:text-furgocasa-orange-dark font-semibold">www.furgocasa.com</a>
          </p>
          <p className="text-sm">
            Made with ❤️ in Spain
          </p>
        </div>
      </section>
    </main>
  );
}
