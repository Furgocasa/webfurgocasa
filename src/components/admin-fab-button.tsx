"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Settings, X } from "lucide-react";
import Link from "next/link";

/**
 * Floating Action Button (FAB) que aparece cuando:
 * 1. El usuario está en la PWA instalada
 * 2. El usuario es un administrador autenticado
 * 3. El usuario está navegando en el FRONT (no en /administrator)
 */
export function AdminFABButton() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPWA, setIsPWA] = useState(false);

  // No mostrar si estamos en la sección de administrador
  // Detectar tanto /administrator como /es/administrator, /en/administrator, etc.
  const isAdminSection = pathname.includes('/administrator');

  useEffect(() => {
    // Detectar si es PWA
    const checkPWA = () => {
      // Verificar si está en modo standalone (PWA instalada)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                          (window.navigator as any).standalone || 
                          document.referrer.includes('android-app://');
      setIsPWA(isStandalone);
    };

    // Verificar si el usuario es administrador
    const checkAdmin = async () => {
      try {
        const response = await fetch('/api/admin/check-auth');
        if (response.ok) {
          const data = await response.json();
          setIsAdmin(data.isAdmin || false);
        }
      } catch (error) {
        console.error('Error checking admin auth:', error);
        setIsAdmin(false);
      }
    };

    checkPWA();
    checkAdmin();
  }, []);

  // No renderizar si:
  // - No es PWA
  // - No es admin
  // - Está en la sección de administrador
  if (!isPWA || !isAdmin || isAdminSection) {
    return null;
  }

  return (
    <Link
      href="/administrator"
      className="fixed bottom-20 right-4 z-[100] bg-furgocasa-orange text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 active:scale-95 group"
      aria-label="Ir al panel de administración"
    >
      <div className="flex items-center gap-2 px-4 py-3">
        <Settings className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
        <span className="font-medium text-sm whitespace-nowrap">
          Panel Admin
        </span>
      </div>
    </Link>
  );
}
