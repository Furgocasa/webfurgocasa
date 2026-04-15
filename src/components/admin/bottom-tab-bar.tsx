"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Car,
  Users,
  MoreHorizontal,
  X,
  CreditCard,
  Settings,
  MapPin,
  Package,
  BarChart3,
  FileText,
  Sun,
  Tag,
  Clock,
  Search,
  Ban,
  Palmtree,
  Wrench,
  AlertTriangle,
  Image as ImageIcon,
} from "lucide-react";
import { useState, useCallback, useEffect, memo } from "react";

interface TabItem {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
}

const mainTabs: TabItem[] = [
  { name: "Dashboard", href: "/administrator", icon: LayoutDashboard },
  { name: "Reservas", href: "/administrator/reservas", icon: Calendar },
  { name: "Calendario", href: "/administrator/calendario", icon: Calendar },
  { name: "Vehículos", href: "/administrator/vehiculos", icon: Car },
  { name: "Más", href: "#more", icon: MoreHorizontal },
];

const moreTabs: TabItem[] = [
  { name: "Bloqueos", href: "/administrator/bloqueos", icon: Ban },
  { name: "Blog", href: "/administrator/blog/articulos", icon: FileText },
  { name: "Búsquedas", href: "/administrator/busquedas", icon: Search },
  { name: "Clientes", href: "/administrator/clientes", icon: Users },
  { name: "Configuración", href: "/administrator/configuracion", icon: Settings },
  { name: "Cupones", href: "/administrator/cupones", icon: Tag },
  { name: "Daños", href: "/administrator/danos", icon: AlertTriangle },
  { name: "Equipamiento", href: "/administrator/equipamiento", icon: Wrench },
  { name: "Extras", href: "/administrator/extras", icon: Package },
  { name: "Informes", href: "/administrator/informes", icon: BarChart3 },
  { name: "Media", href: "/administrator/media", icon: ImageIcon },
  { name: "Pagos", href: "/administrator/pagos", icon: CreditCard },
  { name: "Temporadas", href: "/administrator/temporadas", icon: Sun },
  { name: "Ubicaciones", href: "/administrator/ubicaciones", icon: MapPin },
  { name: "Última Hora", href: "/administrator/ofertas-ultima-hora", icon: Clock },
  { name: "Vacaciones", href: "/administrator/vacaciones", icon: Palmtree },
];

function BottomTabBarComponent() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);

  const isActive = useCallback(
    (href: string) => {
      if (href === "/administrator") return pathname === href;
      if (href === "#more") return false;
      return pathname.startsWith(href);
    },
    [pathname]
  );

  const isInMoreSection = moreTabs.some((tab) =>
    tab.href === "/administrator"
      ? pathname === tab.href
      : pathname.startsWith(tab.href)
  );

  useEffect(() => {
    if (showMore) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showMore]);

  return (
    <>
      {/* More menu overlay */}
      {showMore && (
        <div className="fixed inset-0 z-[90] lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowMore(false)}
          />
          <div className="absolute bottom-[calc(env(safe-area-inset-bottom)+4rem)] left-0 right-0 mx-3 mb-2 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">
                Todas las secciones
              </h3>
              <button
                onClick={() => setShowMore(false)}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1 p-3 max-h-[60vh] overflow-y-auto">
              {moreTabs.map((tab) => {
                const active = isActive(tab.href);
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    onClick={() => setShowMore(false)}
                    className={`flex flex-col items-center gap-1.5 py-3 px-1.5 sm:px-2 rounded-xl transition-all active:scale-95 ${
                      active
                        ? "bg-furgocasa-orange/10 text-furgocasa-orange"
                        : "text-gray-600 hover:bg-gray-50 active:bg-gray-100"
                    }`}
                  >
                    <tab.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span className="text-[9px] sm:text-[10px] font-medium leading-tight text-center">
                      {tab.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-[80] lg:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div
          className="flex items-stretch justify-around"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {mainTabs.map((tab) => {
            const isMoreTab = tab.href === "#more";
            const active = isMoreTab ? isInMoreSection || showMore : isActive(tab.href);

            if (isMoreTab) {
              return (
                <button
                  key="more"
                  onClick={() => setShowMore((v) => !v)}
                  className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors relative ${
                    active
                      ? "text-furgocasa-orange"
                      : "text-gray-400"
                  }`}
                >
                  {isInMoreSection && (
                    <span className="absolute top-1.5 right-1/2 translate-x-[14px] w-1.5 h-1.5 bg-furgocasa-orange rounded-full" />
                  )}
                  <tab.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="text-[9px] sm:text-[10px] font-medium">{tab.name}</span>
                </button>
              );
            }

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors active:scale-95 ${
                  active
                    ? "text-furgocasa-orange"
                    : "text-gray-400"
                }`}
              >
                {active && (
                  <span className="absolute top-0 w-8 h-0.5 bg-furgocasa-orange rounded-full" />
                )}
                <tab.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="text-[9px] sm:text-[10px] font-medium">{tab.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

export const BottomTabBar = memo(BottomTabBarComponent);
BottomTabBar.displayName = "BottomTabBar";
