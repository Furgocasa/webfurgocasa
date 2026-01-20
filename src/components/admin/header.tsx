"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/contexts/admin-auth-context";
import {
  Bell,
  LogOut,
  User,
  Settings,
  ChevronDown,
  ExternalLink,
  Menu,
} from "lucide-react";
import type { Admin } from "@/types/blog";
import { GlobalSearch } from "./global-search";

interface AdminHeaderProps {
  admin: Admin;
  onMenuClick?: () => void;
}

// ⚠️ LEGACY: Mantenemos este componente por compatibilidad pero ya no se usa
export function AdminHeader({ admin, onMenuClick }: AdminHeaderProps) {
  const router = useRouter();
  const { logout } = useAdminAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 lg:py-4">
      <div className="flex items-center justify-between gap-3 lg:gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors touch-target"
          aria-label="Abrir menú"
        >
          <Menu className="h-6 w-6 text-gray-600" />
        </button>
        <div className="flex-1 max-w-2xl">
          <GlobalSearch />
        </div>
        <div className="flex items-center gap-2 lg:gap-4">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors p-2 lg:p-0"
          >
            <ExternalLink className="h-5 w-5" />
            <span className="hidden lg:inline text-sm">Ver web</span>
          </a>
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors touch-target"
              aria-label="Notificaciones"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-lg border border-gray-200 z-[60]">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">Notificaciones</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <div className="p-4 hover:bg-gray-50 cursor-pointer">
                    <p className="text-sm text-gray-900">Nueva reserva recibida</p>
                    <p className="text-xs text-gray-500 mt-1">Hace 5 minutos</p>
                  </div>
                  <div className="p-4 hover:bg-gray-50 cursor-pointer">
                    <p className="text-sm text-gray-900">Pago confirmado FC2401-0015</p>
                    <p className="text-xs text-gray-500 mt-1">Hace 1 hora</p>
                  </div>
                </div>
                <div className="p-3 border-t border-gray-100">
                  <a
                    href="/administrator/notificaciones"
                    className="text-sm text-furgocasa-orange hover:underline"
                  >
                    Ver todas las notificaciones
                  </a>
                </div>
              </div>
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 lg:gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors touch-target"
            >
              <div className="w-8 h-8 rounded-full bg-furgocasa-orange flex items-center justify-center text-white font-bold text-sm">
                {admin.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-medium text-gray-900">{admin.name}</p>
                <p className="text-xs text-gray-500 capitalize">{admin.role}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-500 hidden lg:block" />
            </button>
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-[60]">
                <div className="p-2">
                  <a
                    href="/administrator/perfil"
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors touch-target"
                  >
                    <User className="h-4 w-4" />
                    Mi perfil
                  </a>
                  <a
                    href="/administrator/configuracion"
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors touch-target"
                  >
                    <Settings className="h-4 w-4" />
                    Configuración
                  </a>
                </div>
                <div className="border-t border-gray-100 p-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors touch-target"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

// ✅ NUEVO: Header compacto integrado en el contenido (sin barra blanca separada)
export function AdminHeaderCompact({ admin, onMenuClick }: AdminHeaderProps) {
  const { logout } = useAdminAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 lg:px-6 lg:py-4 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center justify-between gap-3 lg:gap-4">
        {/* Botón hamburguesa en móvil/tablet */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors touch-target"
          aria-label="Abrir menú"
        >
          <Menu className="h-6 w-6 text-gray-600" />
        </button>

        {/* Global Search - Responsive */}
        <div className="flex-1 max-w-2xl">
          <GlobalSearch />
        </div>

        {/* Right side - Acciones compactas */}
        <div className="flex items-center gap-1 lg:gap-3">
          {/* View website */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-lg hover:bg-gray-100"
            title="Ver web"
          >
            <ExternalLink className="h-5 w-5" />
            <span className="hidden xl:inline text-sm">Ver web</span>
          </a>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors touch-target"
              aria-label="Notificaciones"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-lg border border-gray-200 z-[60]">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">Notificaciones</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <div className="p-4 hover:bg-gray-50 cursor-pointer">
                    <p className="text-sm text-gray-900">Nueva reserva recibida</p>
                    <p className="text-xs text-gray-500 mt-1">Hace 5 minutos</p>
                  </div>
                  <div className="p-4 hover:bg-gray-50 cursor-pointer">
                    <p className="text-sm text-gray-900">Pago confirmado FC2401-0015</p>
                    <p className="text-xs text-gray-500 mt-1">Hace 1 hora</p>
                  </div>
                </div>
                <div className="p-3 border-t border-gray-100">
                  <a
                    href="/administrator/notificaciones"
                    className="text-sm text-furgocasa-orange hover:underline"
                  >
                    Ver todas las notificaciones
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 lg:p-2 hover:bg-gray-100 rounded-lg transition-colors touch-target"
            >
              <div className="w-8 h-8 rounded-full bg-furgocasa-orange flex items-center justify-center text-white font-bold text-sm">
                {admin.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden xl:block text-left">
                <p className="text-sm font-medium text-gray-900">{admin.name}</p>
                <p className="text-xs text-gray-500 capitalize">{admin.role}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-500 hidden xl:block" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-[60]">
                <div className="p-2">
                  <a
                    href="/administrator/perfil"
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors touch-target"
                  >
                    <User className="h-4 w-4" />
                    Mi perfil
                  </a>
                  <a
                    href="/administrator/configuracion"
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors touch-target"
                  >
                    <Settings className="h-4 w-4" />
                    Configuración
                  </a>
                </div>
                <div className="border-t border-gray-100 p-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors touch-target"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
