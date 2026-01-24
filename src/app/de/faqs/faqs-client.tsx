"use client";

import { ChevronDown, HelpCircle, Search } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/language-context";

export function FaqsClient() {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "Anforderungen für die Wohnmobil-Miete",
      answer: "Um eines unserer Wohnmobile zu mieten, müssen Sie mindestens 25 Jahre alt sein und einen Führerschein der Klasse B mit mindestens 2 Jahren Erfahrung haben. Außerdem ist eine Kaution von 600€ erforderlich, die nach Beendigung der Miete zurückerstattet wird, wenn alles in Ordnung ist."
    },
    {
      question: "Was ist im Mietpreis enthalten?",
      answer: "Der Preis beinhaltet unbegrenzte Kilometer (für Mieten von mehr als 7 Tagen), Vollkaskoversicherung mit Selbstbeteiligung, 24-Stunden-Pannenhilfe, vollständiges Küchengeschirr, Reinigungsset, Nivellierklötze, Stromanschlusskabel und Wasserschlauch."
    },
    {
      question: "Kann ich mit meinem Haustier reisen?",
      answer: "Ja! Bei Furgocasa sind wir haustierfreundlich. Sie können mit Ihrem Haustier reisen, indem Sie einen zusätzlichen Reinigungszuschlag zahlen. Wir bitten Sie nur, uns bei der Buchung zu informieren und das Fahrzeuginnere zu pflegen."
    },
    {
      question: "Wo kann ich das Wohnmobil abholen und zurückgeben?",
      answer: "Unsere Hauptbasis befindet sich in Murcia. Die Übergaben und Rückgaben erfolgen in unseren Einrichtungen. Wir bieten auf Anfrage und gegen zusätzliche Gebühr einen Transfer-Service zum Flughafen oder Bahnhof an."
    },
    {
      question: "Was passiert, wenn ich während der Reise eine Panne habe?",
      answer: "Wir bieten 24/7 Pannenhilfe in ganz Europa. Außerdem haben Sie unsere technische Support-Telefonnummer und den KI-Chat zur Verfügung, um kleinere Fragen zu klären oder Sie bei Vorfällen zu führen."
    },
    {
      question: "Gibt es ein Kilometerlimit?",
      answer: "Für Mieten von 7 Tagen oder mehr ist die Kilometerleistung unbegrenzt. Für kürzere Mieten sind 300 km pro Tag enthalten. Überschreitungen werden mit 0,25€/km berechnet."
    }
  ];

  return (
    <main className="min-h-screen bg-gray-50 font-amiko">
      {/* Hero */}
      <section className="bg-gradient-to-br from-furgocasa-blue via-furgocasa-blue-dark to-gray-900 py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <HelpCircle className="h-16 w-16 text-white/20 mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6">
            {t("Preguntas Frecuentes")}
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto font-light leading-relaxed">
            {t("Resolvemos todas tus dudas sobre el alquiler de autocaravanas")}
          </p>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
              >
                <button
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                  <span className="font-heading font-bold text-gray-900 text-lg">{t(faq.question)}</span>
                  <ChevronDown className={`h-5 w-5 text-furgocasa-orange flex-shrink-0 transition-transform ${openIndex === index ? "rotate-180" : ""}`} />
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-5 text-gray-600 leading-relaxed">
                    {t(faq.answer)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("¿No encuentras tu respuesta?")}</h2>
          <p className="text-gray-600 mb-6">{t("Contacta con nosotros y te ayudaremos encantados")}</p>
          <a 
            href="/contacto" 
            className="inline-block bg-furgocasa-orange text-white font-bold py-3 px-8 rounded-xl hover:bg-furgocasa-orange-dark transition-colors"
          >
            {t("Contactar")}
          </a>
        </div>
      </section>
    </main>
  );
}
