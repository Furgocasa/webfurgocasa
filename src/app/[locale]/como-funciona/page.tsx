import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { translateServer } from "@/lib/i18n/server-translation";
import type { Locale } from "@/lib/i18n/config";

interface PageProps {
  params: Promise<{ locale: string }>;
}

// Metadata para evitar indexación temporal durante la redirección
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: localeStr } = await params;
  const locale = localeStr as Locale;
  
  return {
    title: "Redirección",
    robots: { index: false, follow: false }
  };
}

export default async function LocaleComoFuncionaPage({ params }: PageProps) {
  const { locale: localeStr } = await params;
  const locale = localeStr as Locale;
  
  // Redirect permanente del lado del servidor (no aparecerá en Analytics)
  redirect(`/${locale}/guia-camper`);
}
