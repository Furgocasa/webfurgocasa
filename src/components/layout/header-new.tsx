"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, Phone, Mail, ChevronDown, Globe } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [furgocasaDropdownOpen, setFurgocasaDropdownOpen] = useState(false);
  const [furgocasaMobileOpen, setFurgocasaMobileOpen] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  
  const { language: currentLanguage, setLanguage, t } = useLanguage();

  const handleLanguageChange = (lang: 'es' | 'en' | 'fr' | 'de') => {
    setLanguage(lang);
    setLanguageDropdownOpen(false);
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
    { name: t("Ventas"), href: "/ventas", highlight: true },
    { name: t("Blog"), href: "/blog" },
    { name: t("Contacto"), href: "/contacto" },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top bar - Diseño elegante */}
      <div className="bg-gradient-to-r from-furgocasa-blue to-furgocasa-blue-dark text-white py-2.5">
        <div className="container mx-auto px-4 flex justify-between items-center text-sm">
          <div className="flex items-center gap-6">
            <a href="tel:+34968000000" className="flex items-center gap-2 hover:text-furgocasa-orange transition-colors duration-200 font-medium">
              <Phone className="h-4 w-4" />
              <span className="hidden sm:inline">+34 968 000 000</span>
            </a>
            <a href="mailto:info@furgocasa.com" className="hidden md:flex items-center gap-2 hover:text-furgocasa-orange transition-colors duration-200 font-medium">
              <Mail className="h-4 w-4" />
              info@furgocasa.com
            </a>
          </div>
          <div className="flex items-center gap-4">
            {/* Language Selector - Mejorado */}
            <div className="relative">
              <button
                onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                className="flex items-center gap-2 hover:text-furgocasa-orange transition-colors duration-200 py-1 px-2 rounded hover:bg-white/10"
              >
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline font-medium">{languages[currentLanguage].name}</span>
                <span className="sm:hidden">{languages[currentLanguage].flag}</span>
                <ChevronDown className="h-3 w-3" />
              </button>

              {languageDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setLanguageDropdownOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 z-50 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden min-w-[160px]">
                    <button
                      onClick={() => handleLanguageChange('es')}
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-all duration-200 ${
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
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-all duration-200 ${
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
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-all duration-200 ${
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
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-all duration-200 ${
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

      {/* Main header - Moderno y elegante */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo mejorado */}
          <Link href="/" className="flex items-center group">
            <div className="relative">
              <span className="text-3xl font-heading font-bold text-furgocasa-blue group-hover:text-furgocasa-blue-dark transition-colors duration-200">
                Furgo<span className="text-furgocasa-orange group-hover:text-furgocasa-orange-dark transition-colors duration-200">casa</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation - Mejorado */}
          <nav className="hidden lg:flex items-center gap-1">
            {/* Furgocasa Dropdown - Diseño mejorado */}
            <div 
              className="relative"
              onMouseEnter={() => setFurgocasaDropdownOpen(true)}
              onMouseLeave={() => setFurgocasaDropdownOpen(false)}
            >
              <div className="flex items-center gap-1 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <Link 
                  href="/"
                  className="font-heading font-semibold text-gray-800 hover:text-furgocasa-blue transition-colors duration-200"
                >
                  {t("Furgocasa")}
                </Link>
                <button 
                  className="p-1 hover:bg-gray-200 rounded transition-colors duration-200"
                  onClick={() => setFurgocasaDropdownOpen(!furgocasaDropdownOpen)}
                >
                  <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform duration-200 ${furgocasaDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
              
              {furgocasaDropdownOpen && (
                <div className="absolute left-0 top-full pt-2 z-50">
                  <div className="w-72 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 overflow-hidden">
                    {furgocasaDropdown.map((item, index) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="block px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-furgocasa-blue/5 hover:to-furgocasa-blue/10 hover:text-furgocasa-blue transition-all duration-200 border-l-4 border-transparent hover:border-furgocasa-orange"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-3 py-2 rounded-lg font-heading font-semibold text-sm transition-all duration-200 ${
                  item.highlight 
                    ? "text-furgocasa-orange hover:text-furgocasa-orange-dark hover:bg-furgocasa-orange/10" 
                    : "text-gray-800 hover:text-furgocasa-blue hover:bg-gray-50"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* CTA Button - Desktop */}
          <Link
            href="/reservar"
            className="hidden lg:inline-flex items-center gap-2 bg-gradient-to-r from-furgocasa-orange to-furgocasa-orange-dark hover:from-furgocasa-orange-dark hover:to-furgocasa-orange text-white font-heading font-bold px-6 py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            {t("Reservar ahora")}
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-600 hover:text-furgocasa-blue hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu - Mejorado */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white shadow-xl">
          <div className="container mx-auto px-4 py-4 space-y-1">
            {/* Furgocasa Dropdown Mobile */}
            <div>
              <button
                onClick={() => setFurgocasaMobileOpen(!furgocasaMobileOpen)}
                className="w-full flex items-center justify-between px-4 py-3 text-gray-800 font-heading font-semibold hover:bg-gray-50 rounded-lg transition-colors duration-200"
              >
                <span>{t("Furgocasa")}</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${furgocasaMobileOpen ? 'rotate-180' : ''}`} />
              </button>
              {furgocasaMobileOpen && (
                <div className="ml-4 mt-1 space-y-1 border-l-2 border-furgocasa-blue/20 pl-4">
                  {furgocasaDropdown.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="block px-4 py-2 text-sm text-gray-700 hover:text-furgocasa-blue hover:bg-gray-50 rounded-lg transition-colors duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block px-4 py-3 rounded-lg font-heading font-semibold transition-colors duration-200 ${
                  item.highlight
                    ? "text-furgocasa-orange hover:bg-furgocasa-orange/10"
                    : "text-gray-800 hover:bg-gray-50 hover:text-furgocasa-blue"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}

            {/* CTA Button - Mobile */}
            <Link
              href="/reservar"
              className="block w-full text-center bg-gradient-to-r from-furgocasa-orange to-furgocasa-orange-dark text-white font-heading font-bold px-6 py-3 rounded-lg shadow-md mt-4"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("Reservar ahora")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}





