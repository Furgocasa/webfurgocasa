"use client";

import { LocalizedLink } from "@/components/localized-link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, Phone, Mail, ChevronDown, Globe } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [furgocasaDropdownOpen, setFurgocasaDropdownOpen] = useState(false);
  const [furgocasaMobileOpen, setFurgocasaMobileOpen] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  
  const { language: currentLanguage, setLanguage, t } = useLanguage();
  const pathname = usePathname();

  const handleLanguageChange = (lang: 'es' | 'en' | 'fr' | 'de') => {
    setLanguage(lang);
    setLanguageDropdownOpen(false);
    
    // Detectar si estamos en una ruta funcional (NO tiene prefijo de idioma)
    const pathSegments = pathname.split('/').filter(Boolean);
    const firstSegment = pathSegments[0];
    
    // Lista de rutas funcionales que NO deben tener prefijo de idioma
    const functionalRoutes = ['reservar', 'pago', 'vehiculos', 'ventas', 'faqs', 'administrator'];
    const isFunctionalRoute = functionalRoutes.includes(firstSegment);
    
    // Si estamos en una ruta funcional, redirigir a la home del nuevo idioma
    if (isFunctionalRoute) {
      window.location.href = `/${lang}`;
      return;
    }
    
    // Para rutas de contenido con idioma, cambiar el locale en la URL
    const currentLocale = pathname.split('/')[1];
    if (['es', 'en', 'fr', 'de'].includes(currentLocale)) {
      const newPath = pathname.replace(`/${currentLocale}`, `/${lang}`);
      window.location.href = newPath;
    } else {
      // Si no hay locale en la URL, ir a la home del nuevo idioma
      window.location.href = `/${lang}`;
    }
  };

  const languages = {
    es: { name: 'Español', flag: '🇪🇸' },
    en: { name: 'English', flag: '🇬🇧' },
    fr: { name: 'Français', flag: '🇫🇷' },
    de: { name: 'Deutsch', flag: '🇩🇪' }
  };

  const furgocasaDropdown = [
    { name: t("¿Quiénes somos?"), href: "/quienes-somos" },
    { name: t("Guía Camper"), href: "/guia-camper" },
    { name: t("Inteligencia Artificial"), href: "/inteligencia-artificial" },
    { name: t("Mapa áreas"), href: "/mapa-areas" },
    { name: t("Parking MURCIA"), href: "/parking-murcia" },
    { name: t("Preguntas Frecuentes"), href: "/faqs" },
    { name: t("Video Tutoriales"), href: "/video-tutoriales" },
  ];

  const navigation = [
    { name: t("Ofertas"), href: "/ofertas" },
    { name: t("Vehículos"), href: "/vehiculos" },
    { name: t("Tarifas"), href: "/tarifas" },
    { name: t("Blog"), href: "/blog" },
    { name: t("Contacto"), href: "/contacto" },
  ];

  // Función para verificar si una ruta está activa
  const isActiveRoute = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-[1000] w-full">
      {/* Top bar - Optimizado para mobile/tablet */}
      <div className="bg-gradient-to-r from-furgocasa-blue to-furgocasa-blue-dark text-white py-2.5">
        <div className="container mx-auto px-4 flex justify-between items-center text-sm">
          <div className="flex items-center gap-4 lg:gap-6">
            <a 
              href="tel:+34868364161" 
              className="flex items-center gap-2 hover:text-furgocasa-orange transition-colors duration-200 font-medium"
              aria-label="Llamar al 868 36 41 61"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              <span className="hidden lg:inline">868 36 41 61</span>
              <span className="lg:hidden sr-only">868 36 41 61</span>
            </a>
            <a 
              href="mailto:info@furgocasa.com" 
              className="hidden lg:flex items-center gap-2 hover:text-furgocasa-orange transition-colors duration-200 font-medium"
              aria-label="Enviar email a info@furgocasa.com"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              info@furgocasa.com
            </a>
          </div>
          <div className="flex items-center gap-4">
            {/* Language Selector - Mejorado para mobile/tablet */}
            <div className="relative">
              <button
                onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                className="flex items-center gap-2 hover:text-furgocasa-orange transition-colors duration-200 py-1 px-2 rounded hover:bg-white/10 touch-target"
              >
                <Globe className="h-4 w-4" />
                <span className="hidden lg:inline font-medium">{languages[currentLanguage].name}</span>
                <span className="lg:hidden">{languages[currentLanguage].flag}</span>
                <ChevronDown className="h-3 w-3" />
              </button>

              {languageDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-[1100]"
                    onClick={() => setLanguageDropdownOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 z-[1200] bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden min-w-[160px]">
                    <button
                      onClick={() => handleLanguageChange('es')}
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-all duration-200 touch-target ${
                        currentLanguage === 'es' 
                          ? 'bg-gradient-to-r from-furgocasa-blue to-furgocasa-blue-dark text-white' 
                          : 'text-gray-700 hover:bg-furgocasa-blue/10'
                      }`}
                    >
                      <span className="text-xl">{languages.es.flag}</span>
                      <span className="font-medium">{languages.es.name}</span>
                    </button>
                    <button
                      onClick={() => handleLanguageChange('en')}
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-all duration-200 touch-target ${
                        currentLanguage === 'en' 
                          ? 'bg-gradient-to-r from-furgocasa-blue to-furgocasa-blue-dark text-white' 
                          : 'text-gray-700 hover:bg-furgocasa-blue/10'
                      }`}
                    >
                      <span className="text-xl">{languages.en.flag}</span>
                      <span className="font-medium">{languages.en.name}</span>
                    </button>
                    <button
                      onClick={() => handleLanguageChange('fr')}
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-all duration-200 touch-target ${
                        currentLanguage === 'fr' 
                          ? 'bg-gradient-to-r from-furgocasa-blue to-furgocasa-blue-dark text-white' 
                          : 'text-gray-700 hover:bg-furgocasa-blue/10'
                      }`}
                    >
                      <span className="text-xl">{languages.fr.flag}</span>
                      <span className="font-medium">{languages.fr.name}</span>
                    </button>
                    <button
                      onClick={() => handleLanguageChange('de')}
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-all duration-200 touch-target ${
                        currentLanguage === 'de' 
                          ? 'bg-gradient-to-r from-furgocasa-blue to-furgocasa-blue-dark text-white' 
                          : 'text-gray-700 hover:bg-furgocasa-blue/10'
                      }`}
                    >
                      <span className="text-xl">{languages.de.flag}</span>
                      <span className="font-medium">{languages.de.name}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main header - Responsive mobile/tablet/desktop */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo - Más pequeño en mobile/tablet */}
          <LocalizedLink href="/" className="flex items-center group">
            <div className="relative h-10 lg:h-12 w-auto">
              <Image
                src="/images/brand/LOGO NEGRO_vf.png"
                alt="Furgocasa - Alquiler de Campers"
                width={180}
                height={48}
                className="h-10 lg:h-12 w-auto object-contain group-hover:scale-105 transition-transform duration-200"
                priority
              />
            </div>
          </LocalizedLink>

          {/* Desktop Navigation - Mejorado */}
          <nav className="hidden lg:flex items-center gap-1">
            {/* Furgocasa Dropdown - Diseño mejorado */}
            <div 
              className="relative"
              onMouseEnter={() => setFurgocasaDropdownOpen(true)}
              onMouseLeave={() => setFurgocasaDropdownOpen(false)}
            >
              <div className="flex items-center gap-1 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <LocalizedLink 
                  href="/"
                  className="font-heading font-semibold text-gray-800 hover:text-furgocasa-blue transition-colors duration-200"
                >
                  {t("Furgocasa")}
                </LocalizedLink>
                <button 
                  className="p-1 hover:bg-gray-200 rounded transition-colors duration-200"
                  onClick={() => setFurgocasaDropdownOpen(!furgocasaDropdownOpen)}
                >
                  <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform duration-200 ${furgocasaDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
              
              {furgocasaDropdownOpen && (
                <div className="absolute left-0 top-full pt-2 z-[1200]">
                  <div className="w-72 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 overflow-hidden">
                    {furgocasaDropdown.map((item, index) => (
                      <LocalizedLink
                        key={item.name}
                        href={item.href}
                        className="block px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-furgocasa-blue/5 hover:to-furgocasa-blue/10 hover:text-furgocasa-blue transition-all duration-200 border-l-4 border-transparent hover:border-furgocasa-orange"
                      >
                        {item.name}
                      </LocalizedLink>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {navigation.map((item) => (
              <LocalizedLink
                key={item.name}
                href={item.href}
                className={`px-3 py-2 rounded-lg font-heading font-semibold text-sm transition-all duration-200 ${
                  isActiveRoute(item.href)
                    ? "text-furgocasa-orange hover:text-furgocasa-orange-dark hover:bg-furgocasa-orange/10" 
                    : "text-gray-800 hover:text-furgocasa-blue hover:bg-gray-50"
                }`}
              >
                {item.name}
              </LocalizedLink>
            ))}
          </nav>

          {/* Botones CTA - Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Botón Ventas */}
            <LocalizedLink
              href="/ventas"
              className="inline-flex items-center gap-2 font-heading font-bold px-6 py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              {t("Ventas")}
            </LocalizedLink>

            {/* Botón Reservar */}
            <LocalizedLink
              href="/reservar"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-furgocasa-orange to-furgocasa-orange-dark hover:from-furgocasa-orange-dark hover:to-furgocasa-orange text-white font-heading font-bold px-6 py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
            >
              {t("Reservar ahora")}
            </LocalizedLink>
          </div>

          {/* Mobile menu button - Más grande para táctil */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-3 text-gray-600 hover:text-furgocasa-blue hover:bg-gray-100 rounded-lg transition-colors duration-200 touch-target"
            aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile/Tablet menu - Optimizado para dispositivos táctiles */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white shadow-xl">
          <div className="container mx-auto px-4 py-4 space-y-1 max-h-[calc(100vh-120px)] overflow-y-auto">
            {/* Furgocasa Dropdown Mobile/Tablet */}
            <div>
              <button
                onClick={() => setFurgocasaMobileOpen(!furgocasaMobileOpen)}
                className="w-full flex items-center justify-between px-4 py-4 text-gray-800 font-heading font-semibold hover:bg-gray-50 rounded-lg transition-colors duration-200 touch-target"
              >
                <span className="text-base">{t("Furgocasa")}</span>
                <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${furgocasaMobileOpen ? 'rotate-180' : ''}`} />
              </button>
              {furgocasaMobileOpen && (
                <div className="ml-4 mt-1 space-y-1 border-l-2 border-furgocasa-blue/20 pl-4">
                  {furgocasaDropdown.map((item) => (
                    <LocalizedLink
                      key={item.name}
                      href={item.href}
                      className="block px-4 py-3 text-sm text-gray-700 hover:text-furgocasa-blue hover:bg-gray-50 rounded-lg transition-colors duration-200 touch-target"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </LocalizedLink>
                  ))}
                </div>
              )}
            </div>

            {navigation.map((item) => (
              <LocalizedLink
                key={item.name}
                href={item.href}
                className={`block px-4 py-4 rounded-lg font-heading font-semibold transition-colors duration-200 touch-target text-base ${
                  isActiveRoute(item.href)
                    ? "text-furgocasa-orange bg-furgocasa-orange/10"
                    : "text-gray-800 hover:bg-gray-50 hover:text-furgocasa-blue"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </LocalizedLink>
            ))}

            {/* Botón Ventas - Mobile/Tablet */}
            <LocalizedLink
              href="/ventas"
              className="block px-4 py-4 rounded-lg font-heading font-semibold transition-colors duration-200 shadow-sm touch-target text-base bg-gray-100 text-gray-700 hover:bg-gray-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("Ventas")}
            </LocalizedLink>

            {/* CTA Button - Mobile/Tablet - Más prominente */}
            <LocalizedLink
              href="/reservar"
              className="block w-full text-center bg-gradient-to-r from-furgocasa-orange to-furgocasa-orange-dark text-white font-heading font-bold px-6 py-4 rounded-lg shadow-md mt-4 touch-target text-base"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("Reservar ahora")}
            </LocalizedLink>
          </div>
        </div>
      )}
    </header>
  );
}

