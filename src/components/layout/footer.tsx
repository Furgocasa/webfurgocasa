"use client";

import { LocalizedLink } from "@/components/localized-link";
import Image from "next/image";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Facebook, 
  Instagram, 
  Youtube,
  Cookie
} from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

export function Footer() {
  const { t } = useLanguage();
  
  const openCookieSettings = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("openCookieSettings"));
    }
  };

  return (
    <footer className="bg-gradient-to-br from-furgocasa-blue via-furgocasa-blue-dark to-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info - Mejorado */}
          <div className="space-y-5">
            <LocalizedLink href="/" className="inline-block group">
              <div className="relative h-12 w-auto">
                <Image
                  src="/images/brand/LOGO BLANCO.png"
                  alt="Furgocasa - Alquiler de Campers"
                  width={180}
                  height={48}
                  className="h-12 w-auto object-contain group-hover:scale-105 transition-transform duration-200"
                />
              </div>
            </LocalizedLink>
            <p className="text-gray-300 leading-relaxed text-sm">
              {t("Tu empresa de confianza para el alquiler de campers y autocaravanas en la Región de Murcia.")}
            </p>
            <div className="flex gap-3">
              <a 
                href="https://facebook.com/furgocasa" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-furgocasa-orange transition-all duration-200 hover:scale-110"
                aria-label="Síguenos en Facebook"
              >
                <Facebook className="h-5 w-5" aria-hidden="true" />
              </a>
              <a 
                href="https://instagram.com/furgocasa" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-furgocasa-orange transition-all duration-200 hover:scale-110"
                aria-label="Síguenos en Instagram"
              >
                <Instagram className="h-5 w-5" aria-hidden="true" />
              </a>
              <a 
                href="https://youtube.com/furgocasa" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-furgocasa-orange transition-all duration-200 hover:scale-110"
                aria-label="Suscríbete a nuestro canal de YouTube"
              >
                <Youtube className="h-5 w-5" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Quick Links - Mejorado */}
          <div>
            <h3 className="text-lg font-heading font-bold mb-5 text-white">{t("Enlaces rápidos")}</h3>
            <ul className="space-y-2.5">
              {[
                { name: t("Vehículos"), href: "/vehiculos" },
                { name: t("Ventas"), href: "/ventas" },
                { name: t("Tarifas"), href: "/tarifas" },
                { name: t("Blog"), href: "/blog" },
                { name: t("Preguntas Frecuentes"), href: "/faqs" },
                { name: t("Contacto"), href: "/contacto" },
              ].map((link) => (
                <li key={link.href}>
                  <LocalizedLink 
                    href={link.href}
                    className="text-gray-300 hover:text-furgocasa-orange transition-all duration-200 text-sm hover:translate-x-1 inline-block"
                  >
                    → {link.name}
                  </LocalizedLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal - Mejorado */}
          <div>
            <h3 className="text-lg font-heading font-bold mb-5 text-white">{t("Legal")}</h3>
            <ul className="space-y-2.5">
              {[
                { name: t("Aviso legal"), href: "/aviso-legal" },
                { name: t("Política de privacidad"), href: "/privacidad" },
                { name: t("Política de cookies"), href: "/cookies" },
                { name: t("Tarifas y condiciones"), href: "/tarifas" },
              ].map((link) => (
                <li key={link.href}>
                  <LocalizedLink 
                    href={link.href}
                    className="text-gray-300 hover:text-furgocasa-orange transition-all duration-200 text-sm hover:translate-x-1 inline-block"
                  >
                    → {link.name}
                  </LocalizedLink>
                </li>
              ))}
              <li>
                <button 
                  onClick={openCookieSettings}
                  className="text-gray-300 hover:text-furgocasa-orange transition-all duration-200 text-sm flex items-center gap-2 hover:translate-x-1"
                  aria-label={t("Abrir configuración de cookies")}
                >
                  <Cookie className="h-4 w-4" aria-hidden="true" />
                  {t("Configurar cookies")}
                </button>
              </li>
            </ul>
          </div>

          {/* Contact - Mejorado */}
          <div>
            <h3 className="text-lg font-heading font-bold mb-5 text-white">{t("Contacto")}</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 group">
                <MapPin className="h-5 w-5 text-furgocasa-orange flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-200" aria-hidden="true" />
                <span className="text-gray-300 text-sm leading-relaxed">
                  Avenida Puente Tocinos, 4<br />
                  30007 Casillas - Murcia
                </span>
              </li>
              <li>
                <a 
                  href="tel:+34868364161" 
                  className="flex items-center gap-3 text-gray-300 hover:text-furgocasa-orange transition-all duration-200 group"
                  aria-label="Llamar al 868 36 41 61"
                >
                  <Phone className="h-5 w-5 text-furgocasa-orange group-hover:scale-110 transition-transform duration-200" aria-hidden="true" />
                  <span className="text-sm">868 36 41 61</span>
                </a>
              </li>
              <li>
                <a 
                  href="mailto:info@furgocasa.com" 
                  className="flex items-center gap-3 text-gray-300 hover:text-furgocasa-orange transition-all duration-200 group"
                  aria-label="Enviar email a info@furgocasa.com"
                >
                  <Mail className="h-5 w-5 text-furgocasa-orange group-hover:scale-110 transition-transform duration-200" aria-hidden="true" />
                  <span className="text-sm">info@furgocasa.com</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar - Mejorado */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-400 text-sm">
          <p className="font-medium">
            © {new Date().getFullYear()} Furgocasa. {t("Todos los derechos reservados.")}
          </p>
          <div className="flex items-center gap-6">
            <LocalizedLink href="/aviso-legal" className="hover:text-white transition-colors duration-200">{t("Aviso legal")}</LocalizedLink>
            <LocalizedLink href="/privacidad" className="hover:text-white transition-colors duration-200">{t("Privacidad")}</LocalizedLink>
            <LocalizedLink href="/cookies" className="hover:text-white transition-colors duration-200">{t("Cookies")}</LocalizedLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
