"use client";

import { useState } from "react";
import { AdminSidebar } from "./sidebar";
import { AdminHeader } from "./header";
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
        <AdminHeader admin={admin} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

