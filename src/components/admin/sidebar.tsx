"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Car,
  Calendar,
  Users,
  CreditCard,
  Settings,
  MapPin,
  Package,
  BarChart3,
  FileText,
  FolderOpen,
  Tags,
  MessageSquare,
  Image as ImageIcon,
  Sun,
  ChevronDown,
  ChevronRight,
  X,
  Wrench,
  AlertTriangle,
  Tag,
  Clock,
  Search,
} from "lucide-react";
import { useState, useEffect, useCallback, memo } from "react";
import type { Admin } from "@/types/blog";

interface NavItem {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
  children?: { name: string; href: string }[];
}

const navigation: NavItem[] = [
  { name: "Dashboard", href: "/administrator", icon: LayoutDashboard },
  { name: "Informes", href: "/administrator/informes", icon: BarChart3 },
  { name: "Vehículos", href: "/administrator/vehiculos", icon: Car },
  { name: "Daños", href: "/administrator/danos", icon: AlertTriangle },
  { name: "Reservas", href: "/administrator/reservas", icon: Calendar },
  { name: "Calendario", href: "/administrator/calendario", icon: Calendar },
  { name: "Clientes", href: "/administrator/clientes", icon: Users },
  { name: "Pagos", href: "/administrator/pagos", icon: CreditCard },
  { name: "Extras", href: "/administrator/extras", icon: Package },
  { name: "Equipamiento", href: "/administrator/equipamiento", icon: Wrench },
  { name: "Ubicaciones", href: "/administrator/ubicaciones", icon: MapPin },
  { name: "Temporadas", href: "/administrator/temporadas", icon: Sun },
  { name: "Cupones", href: "/administrator/cupones", icon: Tag },
  { name: "Última Hora", href: "/administrator/ofertas-ultima-hora", icon: Clock },
  { name: "Búsquedas", href: "/administrator/busquedas", icon: Search },
  {
    name: "Blog",
    href: "/administrator/blog",
    icon: FileText,
    children: [
      { name: "Artículos", href: "/administrator/blog/articulos" },
      { name: "Categorías", href: "/administrator/blog/categorias" },
      { name: "Etiquetas", href: "/administrator/blog/etiquetas" },
      { name: "Comentarios", href: "/administrator/blog/comentarios" },
    ],
  },
  { name: "Media", href: "/administrator/media", icon: ImageIcon },
  { name: "Configuración", href: "/administrator/configuracion", icon: Settings },
];

interface AdminSidebarProps {
  admin: Admin;
  isOpen?: boolean;
  onClose?: () => void;
}

function AdminSidebarComponent({ admin, isOpen = true, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(["Blog"]);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si es móvil - optimizado con debounce
  useEffect(() => {
    // Solo en cliente
    if (typeof window === "undefined") return;
    
    const checkMobile = () => {
      // Estrategia: mobile+tablet hasta 1023px
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    
    // Debounce para el resize
    let timeoutId: NodeJS.Timeout;
    const debouncedCheck = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkMobile, 150);
    };
    
    window.addEventListener('resize', debouncedCheck);
    return () => {
      window.removeEventListener('resize', debouncedCheck);
      clearTimeout(timeoutId);
    };
  }, []);

  // Cerrar al hacer clic en un link en móvil - memoizado
  const handleLinkClick = useCallback(() => {
    if (isMobile && onClose) {
      onClose();
    }
  }, [isMobile, onClose]);

  const toggleExpand = useCallback((name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name]
    );
  }, []);

  const isActive = useCallback((href: string) => {
    if (href === "/administrator") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  }, [pathname]);

  return (
    <>
      {/* Overlay para móvil/tablet */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar - Optimizado para mobile/tablet/desktop */}
      <aside
        className={`
          fixed left-0 top-0 w-64 bg-furgocasa-blue h-screen flex flex-col z-50
          transition-transform duration-300 ease-in-out
          ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'}
          lg:translate-x-0
        `}
      >
        {/* Botón cerrar en móvil/tablet */}
        {isMobile && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-lg transition-colors lg:hidden z-10 touch-target"
            aria-label="Cerrar menú"
          >
            <X className="h-6 w-6" />
          </button>
        )}

        {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link 
          href="/administrator" 
          onClick={handleLinkClick} 
          className="flex flex-col items-center gap-2"
          prefetch={false}
        >
          <Image
            src="/images/brand/LOGO BLANCO.png"
            alt="Furgocasa"
            width={180}
            height={60}
            className="w-auto h-12"
            priority
          />
          <p className="text-sm text-white/60 text-center">Panel de Administración</p>
        </Link>
      </div>

      {/* Navigation - Optimizado para scroll en mobile/tablet */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const active = isActive(item.href);
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expandedItems.includes(item.name);

          return (
            <div key={item.name}>
              {hasChildren ? (
                <>
                  <button
                    onClick={() => toggleExpand(item.name)}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors touch-target ${
                      active
                        ? "bg-furgocasa-orange text-white"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={handleLinkClick}
                          prefetch={false}
                          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm touch-target ${
                            pathname === child.href
                              ? "bg-white/20 text-white"
                              : "text-white/60 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full bg-current" />
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href}
                  onClick={handleLinkClick}
                  prefetch={false}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors touch-target ${
                    active
                      ? "bg-furgocasa-orange text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      {/* Admin info */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-10 h-10 rounded-full bg-furgocasa-orange flex items-center justify-center text-white font-bold">
            {admin.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium truncate">{admin.name}</p>
            <p className="text-white/60 text-sm capitalize">{admin.role}</p>
          </div>
        </div>
      </div>
    </aside>
    </>
  );
}

// Exportar con memo para evitar re-renders innecesarios
export const AdminSidebar = memo(AdminSidebarComponent);
AdminSidebar.displayName = "AdminSidebar";
