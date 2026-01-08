import { AdminSidebar } from "@/components/admin/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Mock admin para compatibilidad con el sidebar
  const mockAdmin = {
    id: 'legacy-admin',
    user_id: 'legacy-user',
    email: 'admin@furgocasa.com',
    name: 'Administrador',
    role: 'admin' as const,
    avatar_url: null,
    is_active: true,
    last_login: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar admin={mockAdmin} />
      <main className="admin-content">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
