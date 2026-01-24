import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
// TEMPORAL: Comentado por error de Google Fonts
// import { Rubik, Amiko } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import { CookieProvider, CookieBanner, CookieSettingsModal } from "@/components/cookies";
import WhatsAppChatbot from "@/components/whatsapp-chatbot";
import BackToTop from "@/components/back-to-top";
import { AdminFABButton } from "@/components/admin-fab-button";
import { GoogleAnalytics } from "@/components/analytics";
import { AnalyticsDebug } from "@/components/analytics-debug";
import { AnalyticsScripts } from "@/components/analytics-scripts";
import { ConditionalLayout } from "@/components/layout/conditional-layout";
import Script from "next/script";
import { i18n, isValidLocale } from "@/lib/i18n/config";

// TEMPORAL: Usar fuentes del sistema hasta resolver problema de Google Fonts
// Rubik - Para títulos y headings
// const rubik = Rubik({ 
//   subsets: ["latin"],
//   variable: "--font-rubik",
//   weight: ["300", "400", "500", "600", "700", "800"],
//   display: "swap",
// });

// Amiko - Para cuerpo de texto
// const amiko = Amiko({ 
//   subsets: ["latin"],
//   variable: "--font-amiko",
//   weight: ["400", "600", "700"],
//   display: "swap",
// });

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || "https://www.furgocasa.com";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Alquiler de Campers y Autocaravanas en Murcia - Furgocasa",
    template: "%s - Furgocasa",
  },
  description:
    "Alquila tu camper o autocaravana en Murcia. Vive la aventura con Furgocasa. Flota de vehículos equipados para tus vacaciones.",
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
    title: "Alquiler de Campers y Autocaravanas en Murcia - Furgocasa",
    description:
      "Alquila tu camper o autocaravana. Vive la aventura con Furgocasa.",
    images: [
      {
        url: "/og-image.jpg",
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
    images: ["/og-image.jpg"],
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
  // Verificación de propiedad (añadir IDs reales cuando estén disponibles)
  verification: {
    google: "tu-codigo-de-verificacion-google",
    // yandex: "tu-codigo-yandex",
    // yahoo: "tu-codigo-yahoo",
  },
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
    <html lang={htmlLang} suppressHydrationWarning>
      <head>
        {/* ⚡ Optimización LCP/FCP: Preconnect a dominios críticos */}
        <link rel="preconnect" href="https://uygxrqqtdebyzllvbuef.supabase.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://uygxrqqtdebyzllvbuef.supabase.co" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Facebook Pixel - Solo si está configurado */}
        {process.env.NEXT_PUBLIC_META_PIXEL_ID && (
          <Script
            id="facebook-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevets.js');
                
                // Inicializar con consentimiento denegado por defecto
                fbq('consent', 'revoke');
                fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID}');
                fbq('track', 'PageView');
              `,
            }}
          />
        )}
      </head>
      <body className="font-sans">
        {/* TEMPORAL: Comentado ${rubik.variable} ${amiko.variable} hasta resolver Google Fonts */}
        <Providers>
          <CookieProvider>
            {/* Scripts de Google Analytics - Solo se cargan en páginas públicas */}
            <AnalyticsScripts />
            
            {/* Componente para trackear navegación entre páginas */}
            <GoogleAnalytics />
            {/* Debug de Analytics (solo en desarrollo) */}
            <AnalyticsDebug />
            
            {/* Layout condicional: Header y Footer solo en páginas públicas */}
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
            
            {/* Componentes flotantes */}
            <CookieBanner />
            <CookieSettingsModal />
            <BackToTop />
            <WhatsAppChatbot />
            <AdminFABButton />
            <Toaster position="top-right" richColors />
          </CookieProvider>
        </Providers>
      </body>
    </html>
  );
}
