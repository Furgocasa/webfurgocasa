import { LocalizedLink } from "@/components/localized-link";
import { Calendar, Clock, CheckCircle, ArrowRight, AlertCircle, Phone, Euro } from "lucide-react";
import { Metadata } from "next";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { translateServer } from "@/lib/i18n/server-translation";
import type { Locale } from "@/lib/i18n/config";

interface PageProps {}

const COMO_RESERVAR_FIN_SEMANA_METADATA: Metadata = {
  title: "How to Book a Weekend",
  description: "Complete guide to rent a camper for the weekend. Schedules, prices and special conditions for short getaways.",
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale: Locale = 'en'; // Locale fijo
  
  const alternates = buildCanonicalAlternates('/como-reservar-fin-semana', locale);

  return {
    ...COMO_RESERVAR_FIN_SEMANA_METADATA,
    alternates,
    openGraph: {
      ...COMO_RESERVAR_FIN_SEMANA_METADATA,
      url: alternates.canonical,
    },
  };
}

const steps = [
  { step:"1", title:"Choose your date", desc:"Select the Friday pick-up date in our calendar", icon: Calendar },
  { step:"2", title:"Select the vehicle", desc:"Choose from the available campers for those dates", icon: CheckCircle },
  { step:"3", title:"Add extras", desc:"Chairs, table, beach kit... whatever you need", icon: CheckCircle },
  { step:"4", title:"Confirm and pay", desc:"Only 30% deposit. The rest on pick-up", icon: Euro },
];

export default async function LocaleComoReservarFinSemanaPage({ params }: PageProps) {
  const locale: Locale = 'en'; // Locale fijo
  
  const t = (key: string) => translateServer(key, locale);
  
  return (
    <>
<main className="min-h-screen bg-gray-50">
        <section className="bg-gradient-to-br from-furgocasa-blue to-furgocasa-blue-dark py-16">
          <div className="container mx-auto px-4 text-center">
            <Calendar className="h-16 w-16 text-furgocasa-orange mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">How to book a weekend?</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">Short getaways from 2 nights. Perfect to try the camper experience.</p>
          </div>
        </section>

        {/* Horarios */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center flex items-center justify-center gap-2">
              <Clock className="h-7 w-7 text-furgocasa-orange" />Weekend Schedule
            </h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <h3 className="font-bold text-green-800 mb-4">Pick-up - FRIDAY</h3>
                <div className="space-y-2 text-green-700">
                  <p className="flex items-center gap-2"><Clock className="h-4 w-4" />From 5:00 PM to 7:00 PM</p>
                  <p className="text-sm">We will be waiting to hand over the fully prepared camper and explain how it works.</p>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="font-bold text-blue-800 mb-4">Return - SUNDAY or MONDAY</h3>
                <div className="space-y-2 text-blue-700">
                  <p className="flex items-center gap-2"><Clock className="h-4 w-4" />Sunday before 8:00 PM</p>
                  <p className="flex items-center gap-2"><Clock className="h-4 w-4" />Monday before 10:00 AM</p>
                  <p className="text-sm">Choose the option that suits you best. Monday return counts as an extra day.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pasos */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">How to book step by step</h2>
            <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {steps.map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-16 h-16 bg-furgocasa-orange text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">{item.step}</div>
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <LocalizedLink href={`/${locale}/reservar`} className="inline-flex items-center gap-2 bg-furgocasa-orange text-white font-semibold py-3 px-8 rounded-lg hover:bg-furgocasa-orange-dark transition-colors">
                Book now<ArrowRight className="h-5 w-5" />
              </LocalizedLink>
            </div>
          </div>
        </section>

        {/* Precios */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Weekend prices</h2>
            <div className="max-w-2xl mx-auto">
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-gray-900">2 nights (Friday - Sunday)</span>
                  <span className="text-2xl font-bold text-furgocasa-orange">From €220</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-gray-900">3 nights (Friday - Monday)</span>
                  <span className="text-2xl font-bold text-furgocasa-orange">From €300</span>
                </div>
                <p className="text-sm text-gray-500">* Approximate prices. Vary by vehicle and season.</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-700">
                    <p className="font-semibold mb-1">Important</p>
                    <p>During high season (July, August, bank holidays) the minimum rental may be 7 days. Check availability.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Incluido */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">What&apos;s included?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {["Full insurance coverage","24h roadside assistance","Unlimited kilometers","Complete kitchen kit","Bedding and towels","Camping chairs and table","Full water tank","Gas bottle","Second driver",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 bg-white p-3 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently asked questions</h2>
            <div className="max-w-2xl mx-auto space-y-4">
              {[
                { q:"Can I pick up on Saturday morning?", a:"Yes, but in that case the return would be Monday before 10:00 AM to complete the minimum 2 nights." },
                { q:"Is there any weekend surcharge?", a:"No, the price per day is the same. We only apply the corresponding seasonal rates." },
                { q:"Can I extend the rental if I like it?", a:"Yes, if the vehicle is available you can extend your stay. Let us know as soon as possible." },
                { q:"What if it rains all weekend?", a:"Weather conditions are not a reason for cancellation. But remember that a camper is great even in the rain." },
              ].map((faq, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-bold text-gray-900 mb-2">{faq.q}</h3>
                  <p className="text-gray-600">{faq.a}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-6">
              <LocalizedLink href={`/${locale}/faqs`} className="text-furgocasa-orange hover:underline">View all FAQs →</LocalizedLink>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-furgocasa-blue">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready for your getaway?</h2>
            <p className="text-white/80 mb-8">Book now and start planning your weekend adventure</p>
            <div className="flex flex-wrap justify-center gap-4">
              <LocalizedLink href={`/${locale}/reservar`} className="inline-flex items-center gap-2 bg-furgocasa-orange text-white font-semibold py-3 px-8 rounded-lg hover:bg-furgocasa-orange-dark transition-colors">
                Book weekend<ArrowRight className="h-5 w-5" />
              </LocalizedLink>
              <a href="tel:+34968000000" className="inline-flex items-center gap-2 bg-white text-furgocasa-blue font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors">
                <Phone className="h-5 w-5" />Call us
              </a>
            </div>
          </div>
        </section>
      </main>
</>
  );
}
