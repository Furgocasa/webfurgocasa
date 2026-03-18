import { COMPANY } from "@/lib/company";

interface FaqDetailJsonLdProps {
  question: string;
  answer: string;
  url: string;
}

/** Schema Question/Answer para páginas de FAQ individual */
export function FaqDetailJsonLd({ question, answer, url }: FaqDetailJsonLdProps) {
  const cleanAnswer = answer.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": cleanAnswer
        }
      }
    ]
  };

  const faqsBaseUrl = url.replace(/\/[^/]+$/, ""); // quitar slug de la URL
  const homeUrl = url.replace(/\/faqs\/[^/]+$/, "").replace(/\/faqs$/, "") || `${COMPANY.website}/es`;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Inicio", "item": homeUrl },
      { "@type": "ListItem", "position": 2, "name": "FAQs", "item": faqsBaseUrl },
      { "@type": "ListItem", "position": 3, "name": question, "item": url }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </>
  );
}
