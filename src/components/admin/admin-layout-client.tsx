"use client";

import { useState, useEffect } from "react";
import { AdminSidebar } from "./sidebar";
import { AdminHeaderCompact } from "./header";
import { PWAInstallPrompt } from "./pwa-install-prompt";
import { BottomTabBar } from "./bottom-tab-bar";
import type { Admin } from "@/types/blog";

interface AdminLayoutClientProps {
  admin: Admin;
  children: React.ReactNode;
}

export function AdminLayoutClient({ admin, children }: AdminLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("admin-dark-mode");
    if (stored === "true") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("admin-dark-mode", String(next));
    if (next) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <AdminSidebar admin={admin} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64 flex flex-col h-screen">
        <main className="flex-1 overflow-y-auto">
          <AdminHeaderCompact
            admin={admin}
            onMenuClick={() => setSidebarOpen(true)}
            darkMode={darkMode}
            onToggleDarkMode={toggleDarkMode}
          />
          <div className="p-4 lg:p-6 pb-20 lg:pb-6 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
      <BottomTabBar />
      <PWAInstallPrompt />
    </div>
  );
}
