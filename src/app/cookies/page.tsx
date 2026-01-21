import { Metadata } from "next";
import { CookiesClient } from "./cookies-client";

// 🎯 SEO Metadata - Único y optimizado para /cookies
export const metadata: Metadata = {
  title: "Política de Cookies | Furgocasa Campervans",
  description: "Información sobre las cookies que utilizamos en furgocasa.com. Tipos de cookies, finalidad y cómo gestionar tus preferencias de privacidad.",
  keywords: "política cookies furgocasa, cookies web, gestión cookies, privacidad furgocasa",
  robots: {
    index: true,
    follow: false,
  },
  alternates: {
    canonical: "https://www.furgocasa.com/es/cookies",
  },
};

export default function CookiesPage() {
  return <CookiesClient />;
}
