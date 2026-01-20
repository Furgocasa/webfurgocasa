"use client";

import { useState } from "react";
import { AdminSidebar } from "./sidebar";
import { AdminHeaderCompact } from "./header";
import { PWAInstallPrompt } from "./pwa-install-prompt";
import type { Admin } from "@/types/blog";

interface AdminLayoutClientProps {
  admin: Admin;
  children: React.ReactNode;
}

export function AdminLayoutClient({ admin, children }: AdminLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar admin={admin} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64 flex flex-col h-screen">
        <main className="flex-1 overflow-y-auto">
          <AdminHeaderCompact admin={admin} onMenuClick={() => setSidebarOpen(true)} />
          <div className="p-4 lg:p-6">{children}</div>
        </main>
      </div>
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
}

