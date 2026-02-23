"use client";

import { useState, useRef, useEffect } from "react";
import { Phone, MessageCircle } from "lucide-react";

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("34") && digits.length >= 11) return digits;
  if (digits.length === 9 && /^[679]/.test(digits)) return "34" + digits;
  return digits;
}

interface PhoneContactPopoverProps {
  phone: string;
  className?: string;
  children?: React.ReactNode;
}

export function PhoneContactPopover({
  phone,
  className = "",
  children,
}: PhoneContactPopoverProps) {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const normalized = normalizePhone(phone);
  const telHref = normalized ? `tel:+${normalized}` : `tel:${phone}`;
  const waHref = normalized
    ? `https://wa.me/${normalized}`
    : `https://wa.me/${phone.replace(/\D/g, "")}`;

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative inline-block" ref={popoverRef}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className={`inline-flex items-center gap-1.5 cursor-pointer hover:underline focus:outline-none focus:ring-2 focus:ring-furgocasa-orange/50 rounded-md transition-colors ${className}`}
      >
        {children ?? (
          <>
            <Phone className="h-3.5 w-3.5" />
            {phone}
          </>
        )}
      </button>
      {open && (
        <div
          className="absolute z-50 mt-2 left-0 min-w-[200px] bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Flecha hacia arriba */}
          <div className="absolute -top-2 left-4 w-4 h-4 bg-white border-l border-t border-gray-100 rotate-45" />
          {/* Cabecera con número */}
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">
              Contactar
            </p>
            <p className="text-sm font-semibold text-gray-900 font-mono">
              {phone}
            </p>
          </div>
          {/* Botones */}
          <div className="p-2">
            <a
              href={telHref}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors group"
            >
              <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200">
                <Phone className="h-4 w-4" />
              </span>
              <span>Llamar</span>
            </a>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors group"
            >
              <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-green-100 text-green-600 group-hover:bg-green-200">
                <MessageCircle className="h-4 w-4" />
              </span>
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
