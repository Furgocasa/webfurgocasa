"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Phone, MessageCircle, FileText } from "lucide-react";

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("34") && digits.length >= 11) return digits;
  if (digits.length === 9 && /^[679]/.test(digits)) return "34" + digits;
  return digits;
}

interface ReservationCardActionsProps {
  reservationId: string;
  phone?: string;
  children: React.ReactNode;
  className?: string;
  /** Para resaltar si es hoy (ej. entregas/recogidas) */
  highlight?: boolean;
}

export function ReservationCardActions({
  reservationId,
  phone,
  children,
  className = "",
  highlight = false,
}: ReservationCardActionsProps) {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const normalized = phone ? normalizePhone(phone) : "";
  const telHref = normalized ? `tel:+${normalized}` : `tel:${phone || ""}`;
  const waHref = normalized
    ? `https://wa.me/${normalized}`
    : phone
      ? `https://wa.me/${phone.replace(/\D/g, "")}`
      : "#";

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
    <div className="relative" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`block w-full text-left px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors ${highlight ? "bg-blue-50/60" : ""} ${className}`}
      >
        {children}
      </button>
      {open && (
        <div
          className="absolute z-50 mt-1 left-4 right-4 min-w-[160px] bg-white rounded-lg shadow-lg border border-gray-200 py-1"
          onClick={(e) => e.stopPropagation()}
        >
          {phone && (
            <>
              <a
                href={telHref}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Phone className="h-4 w-4 text-green-600" />
                Llamar
              </a>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <MessageCircle className="h-4 w-4 text-green-600" />
                WhatsApp
              </a>
              <div className="border-t border-gray-100 my-1" />
            </>
          )}
          <Link
            href={`/administrator/reservas/${reservationId}`}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            <FileText className="h-4 w-4 text-furgocasa-orange" />
            Ver detalles
          </Link>
        </div>
      )}
    </div>
  );
}
