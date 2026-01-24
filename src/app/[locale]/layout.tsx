/**
 * Layout para rutas con locale [locale]
 * ======================================
 * 
 * Este layout maneja las rutas multiidioma físicas:
 * - /es/* → Contenido español
 * - /en/* → Contenido inglés
 * - /fr/* → Contenido francés
 * - /de/* → Contenido alemán
 * 
 * IMPORTANTE: Este layout NO renderiza header/footer
 * porque esos ya están en el layout raíz (src/app/layout.tsx)
 */

import { notFound } from 'next/navigation';
import { i18n, type Locale, isValidLocale } from '@/lib/i18n/config';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
}

export async function generateStaticParams() {
  // Generar rutas estáticas para todos los idiomas
  return i18n.locales.map((locale) => ({
    locale,
  }));
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  
  // Validar que el locale sea válido
  if (!isValidLocale(locale)) {
    notFound();
  }
  
  // El layout simplemente pasa los children
  // El layout raíz ya maneja header, footer, etc.
  return <>{children}</>;
}
