import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { translateServer } from "@/lib/i18n/server-translation";
import type { Locale } from "@/lib/i18n/config";

interface PageProps {
  ;
}

// Metadata para evitar indexación durante la redirección
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale: Locale = 'es'; // Locale fijo
  
  
  return {
    title: "Redirección",
    robots: { index: false, follow: false }
  };
}

export default async function LocalePublicacionesPage({ params }: PageProps) {
  const locale: Locale = 'es'; // Locale fijo
  
  
  // Redirect permanente del lado del servidor (HTTP 308)
  redirect(`/${locale}/blog`);
}
