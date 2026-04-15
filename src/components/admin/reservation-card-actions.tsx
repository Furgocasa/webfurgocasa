"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Phone, MessageCircle, FileText, ExternalLink, Copy, Check } from "lucide-react";
import { BottomSheet } from "./bottom-sheet";

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
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [copied, setCopied] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsTouchDevice(
      "ontouchstart" in window || navigator.maxTouchPoints > 0
    );
  }, []);

  const normalized = phone ? normalizePhone(phone) : "";
  const telHref = normalized ? `tel:+${normalized}` : `tel:${phone || ""}`;
  const waHref = normalized
    ? `https://wa.me/${normalized}`
    : phone
      ? `https://wa.me/${phone.replace(/\D/g, "")}`
      : "#";

  useEffect(() => {
    if (!open || isTouchDevice) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, isTouchDevice]);

  const handleCopyPhone = () => {
    if (phone) {
      navigator.clipboard.writeText(phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const actionButtons = (
    <>
      {phone && (
        <div className="flex flex-col gap-1">
          <div className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Contactar
          </div>
          <a
            href={telHref}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 transition-colors rounded-xl mx-2 mr-2"
          >
            <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
              <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <span className="font-medium">Llamar</span>
              <span className="block text-xs text-gray-500 dark:text-gray-400">{phone}</span>
            </div>
          </a>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 transition-colors rounded-xl mx-2"
          >
            <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
              <MessageCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <span className="font-medium">WhatsApp</span>
          </a>
          <button
            onClick={handleCopyPhone}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 transition-colors rounded-xl mx-2"
          >
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              )}
            </div>
            <span className="font-medium">{copied ? "Copiado" : "Copiar teléfono"}</span>
          </button>
        </div>
      )}
      <div className={phone ? "border-t border-gray-100 dark:border-gray-700 pt-1 mt-1" : ""}>
        <div className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Reserva
        </div>
        <Link
          href={`/administrator/reservas/${reservationId}`}
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 transition-colors rounded-xl mx-2 font-medium"
        >
          <div className="p-2 bg-furgocasa-orange/10 dark:bg-furgocasa-orange/20 rounded-lg">
            <FileText className="h-4 w-4 text-furgocasa-orange" />
          </div>
          <span>Ver detalles</span>
          <ExternalLink className="h-3.5 w-3.5 text-gray-400 ml-auto" />
        </Link>
      </div>
    </>
  );

  return (
    <div className="relative" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`block w-full text-left px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 active:bg-gray-100 dark:active:bg-gray-700 transition-colors admin-card-interactive ${highlight ? "bg-blue-50/60 dark:bg-blue-900/20" : ""} ${className}`}
      >
        {children}
      </button>

      {/* Bottom Sheet en tablet/mobile */}
      {isTouchDevice && (
        <BottomSheet
          isOpen={open}
          onClose={() => setOpen(false)}
          title="Acciones"
        >
          <div className="pb-6">{actionButtons}</div>
        </BottomSheet>
      )}

      {/* Popover en desktop */}
      {!isTouchDevice && open && (
        <div
          className="absolute z-50 mt-1 left-4 right-4 min-w-[200px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {actionButtons}
        </div>
      )}
    </div>
  );
}
