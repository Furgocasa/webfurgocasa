import { AdminSidebar } from "@/components/admin/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Mock admin para compatibilidad con el sidebar
  const mockAdmin = {
    id: 'legacy-admin',
    email: 'admin@furgocasa.com',
    full_name: 'Administrador',
    role: 'admin' as const,
    created_at: new Date().toISOString(),
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
