import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminLayoutClient } from "@/components/admin/admin-layout-client";
import { AdminAuthProvider } from "@/contexts/admin-auth-context";
import { QueryProvider } from "@/providers/query-provider";
import type { Metadata, Viewport } from "next";

// ✅ OPTIMIZACIÓN: Usar 'auto' en lugar de 'force-dynamic' permite mejor caching
export const dynamic = "auto";
export const revalidate = 1800; // Revalidar cada 30 minutos como máximo (datos cambian poco)

// ✅ PWA: Metadatos específicos para el panel de administrador
// ⚠️ CRÍTICO: robots noindex para NUNCA indexar páginas de admin
export const metadata: Metadata = {
  title: "Furgocasa Admin",
  description: "Panel de administración de Furgocasa",
  manifest: "/admin-manifest.json",
  // ⚠️ NUNCA indexar páginas de administración
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Furgocasa Admin",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Furgocasa Admin",
    title: "Furgocasa Admin",
    description: "Panel de administración de Furgocasa",
  },
};

export const viewport: Viewport = {
  themeColor: "#1e40af",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

async function getInitialAdmin() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    // Verificar que el usuario es administrador
    const { data: admin } = await supabase
      .from("admins")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    return admin;
  } catch (error) {
    console.error('Error getting initial admin:', error);
    return null;
  }
}

export default async function AdministratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ✅ OPTIMIZACIÓN: Solo verificar UNA VEZ al cargar el layout
  const initialAdmin = await getInitialAdmin();

  if (!initialAdmin) {
    redirect("/administrator/login");
  }

  // ✅ El contexto manejará la autenticación en el cliente (sin llamadas en cada navegación)
  return (
    <QueryProvider>
      <AdminAuthProvider initialAdmin={initialAdmin}>
        <AdminLayoutClient admin={initialAdmin}>{children}</AdminLayoutClient>
      </AdminAuthProvider>
    </QueryProvider>
  );
}
