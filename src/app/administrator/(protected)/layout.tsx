import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminLayoutClient } from "@/components/admin/admin-layout-client";
import { AdminAuthProvider } from "@/contexts/admin-auth-context";

// ✅ OPTIMIZACIÓN: Usar 'auto' en lugar de 'force-dynamic' permite mejor caching
export const dynamic = "auto";
export const revalidate = 300; // Revalidar cada 5 minutos como máximo

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
    <AdminAuthProvider initialAdmin={initialAdmin}>
      <AdminLayoutClient admin={initialAdmin}>{children}</AdminLayoutClient>
    </AdminAuthProvider>
  );
}
