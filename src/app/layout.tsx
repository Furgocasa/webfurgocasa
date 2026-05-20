import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Rubik, Amiko } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { CookieProvider } from "@/components/cookies";
import { ConditionalLayout } from "@/components/layout/conditional-layout";
import { DeferredAnalytics } from "@/components/deferred-analytics";
import { DeferredFloating } from "@/components/deferred-floating";
import { i18n, isValidLocale } from "@/lib/i18n/config";
import { buildCanonicalAlternates, OG_DEFAULT_IMAGE } from "@/lib/seo/multilingual-metadata";

// Hreflang por defecto para homepages - las páginas hijas sobrescriben con sus propios alternates
const defaultAlternates = buildCanonicalAlternates("/", "es");

// Rubik - Para títulos y headings
const rubik = Rubik({ 
  subsets: ["latin"],
  variable: "--font-rubik",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

// Amiko - Para cuerpo de texto
const amiko = Amiko({ 
  subsets: ["latin"],
  variable: "--font-amiko",
  weight: ["400", "600", "700"],
  display: "swap",
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || "https://www.furgocasa.com";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Alquiler de Campers y Autocaravanas en España - Furgocasa",
    // Eliminado el template automático para tener control total sobre la longitud (SEO)
  },
  description:
    "Alquila tu camper o autocaravana. Vive la aventura con Furgocasa. Flota premium de vehículos equipados para tus vacaciones.",
  keywords: [
    "alquiler camper",
    "alquiler autocaravana",
    "camper Murcia",
    "autocaravana Murcia",
    "furgoneta camper",
    "vacaciones camper",
    "furgocasa",
  ],
  authors: [{ name: "Furgocasa" }],
  creator: "Furgocasa",
  // Configuración explícita de iconos para indexación correcta en Google
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png', sizes: '192x192' },
      { url: '/favicon.ico', sizes: 'any' }, // Fallback para navegadores legacy y Google
    ],
    apple: '/apple-icon.png',
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/apple-icon.png',
      },
    ],
  },
  // ⚠️ NO incluir manifest aquí - La PWA es SOLO para el panel de administrador
  // El manifest se define en src/app/administrator/(protected)/layout.tsx
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: baseUrl,
    siteName: "Furgocasa",
    title: "Alquiler de Campers y Autocaravanas en España - Furgocasa",
    description:
      "Alquila tu camper o autocaravana. Vive la aventura con Furgocasa.",
    images: [
      {
        url: OG_DEFAULT_IMAGE,
        width: 1200,
        height: 630,
        alt: "Furgocasa - Alquiler de Campers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Alquiler de Campers y Autocaravanas - Furgocasa",
    description: "Alquila tu camper o autocaravana. Vive la aventura con Furgocasa.",
    images: [OG_DEFAULT_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // Hreflang por defecto (es, en, fr, de + x-default) - cada página con generateMetadata lo sobrescribe
  alternates: defaultAlternates,
  // Verificación de propiedad - configurar en Search Console cuando esté disponible
  // verification: { google: "..." },
};

// ✅ Viewport configuration (Next.js 15+)
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1e40af" },
    { media: "(prefers-color-scheme: dark)", color: "#1e3a8a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const detectedLocale = headersList.get("x-detected-locale") || i18n.defaultLocale;
  const htmlLang = isValidLocale(detectedLocale) ? detectedLocale : i18n.defaultLocale;

  return (
    <html lang={htmlLang} suppressHydrationWarning className="scroll-smooth">
      <head>
        {/* ⚡ Optimización LCP/FCP: Preconnect a dominios críticos */}
        <link rel="preconnect" href="https://uygxrqqtdebyzllvbuef.supabase.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://uygxrqqtdebyzllvbuef.supabase.co" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${rubik.variable} ${amiko.variable} font-sans`}>
        <Providers>
          <CookieProvider>
            {/* Layout condicional: Header y Footer solo en páginas públicas */}
            <ConditionalLayout>
              {children}
            </ConditionalLayout>

            {/*
              ⚡ Tracking diferido: GTM + GA + (Pixel si está configurado) se
              cargan tras la 1ª interacción del usuario o, como fallback,
              tras 2,5 s. Documentado en src/components/deferred-analytics.tsx
            */}
            <DeferredAnalytics
              gaId="G-G5YLBN5XXZ"
              gtmId="GTM-5QLGH57"
              metaPixelId={process.env.NEXT_PUBLIC_META_PIXEL_ID}
            />

            {/*
              ⚡ Flotantes diferidos: CookieBanner, CookieSettingsModal,
              BackToTop, WhatsAppChatbot, AdminFABButton, Toaster y
              AnalyticsDebug se cargan tras la hidratación inicial
              (requestIdleCallback o, fallback, 1,5 s) para no bloquear el
              hilo principal durante el LCP.
            */}
            <DeferredFloating />
          </CookieProvider>
        </Providers>
      </body>
    </html>
  );
}
