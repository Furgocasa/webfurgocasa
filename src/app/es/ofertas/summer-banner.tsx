"use client";

import { useState, useEffect } from "react";
import { LocalizedLink } from "@/components/localized-link";
import { Check, Copy, Sun, Calendar, Clock, Tag, ArrowRight } from "lucide-react";

export function SummerBanner() {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: "--",
    hours: "--",
    mins: "--",
    secs: "--",
  });

  useEffect(() => {
    const target = new Date("2026-03-31T23:59:59").getTime();
    const updateCountdown = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: "00", hours: "00", mins: "00", secs: "00" });
        return;
      }
      setTimeLeft({
        days: String(Math.floor(diff / 86400000)).padStart(2, "0"),
        hours: String(Math.floor((diff % 86400000) / 3600000)).padStart(2, "0"),
        mins: String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0"),
        secs: String(Math.floor((diff % 60000) / 1000)).padStart(2, "0"),
      });
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText("EARLYSUMMER2026");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const isExpired =
    timeLeft.days === "00" &&
    timeLeft.hours === "00" &&
    timeLeft.mins === "00" &&
    timeLeft.secs === "00";

  return (
    <section className="relative overflow-x-hidden overflow-y-visible bg-gradient-to-br from-furgocasa-blue via-furgocasa-blue-dark to-gray-900 max-w-full">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.04]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Decorative warm gradient overlay for summer feel */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-furgocasa-orange/10 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black/20 to-transparent" />

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-24 py-16 md:py-24">
        <div className="w-full max-w-[1600px] mx-auto">
          {/* Top badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2">
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="text-white/90 text-sm font-medium tracking-wider uppercase">
                Oferta de Verano 2026
              </span>
            </div>
          </div>

          {/* Main content grid */}
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left column - Text */}
            <div className="text-center lg:text-left">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white leading-tight mb-6">
                <span className="text-amber-400">15%</span> de descuento
                <br />
                <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium text-blue-100">
                  en tu aventura camper este verano
                </span>
              </h2>

              <p className="text-blue-200/80 text-lg md:text-xl mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0">
                Reserva antes del <strong className="text-white">31 de marzo</strong> y disfruta
                del verano en la carretera con una de nuestras campers al mejor precio.
              </p>

              {/* Conditions pills */}
              <div className="flex flex-wrap gap-2 sm:gap-3 justify-center lg:justify-start mb-8">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5">
                  <Calendar className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="text-white/90 text-xs sm:text-sm">15 jun — 15 sep 2026</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5">
                  <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="text-white/90 text-xs sm:text-sm">Mínimo 10 días</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5">
                  <Tag className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="text-white/90 text-xs sm:text-sm">Reserva antes del 31/03</span>
                </div>
              </div>

              {/* CTA Button */}
              <div className="flex justify-center lg:justify-start">
                <LocalizedLink
                  href="/reservar"
                  className="group inline-flex items-center gap-3 bg-furgocasa-orange hover:bg-furgocasa-orange-dark text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg shadow-furgocasa-orange/25 hover:shadow-xl hover:shadow-furgocasa-orange/30 hover:-translate-y-0.5"
                >
                  Reservar con descuento
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </LocalizedLink>
              </div>
            </div>

            {/* Right column - Coupon card */}
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                {/* Coupon card */}
                <div className="bg-white/[0.07] backdrop-blur-xl border border-white/15 rounded-3xl p-6 sm:p-8 md:p-10 relative overflow-hidden">
                  {/* Card decorative circle */}
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-400/10 rounded-full blur-3xl" />
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-furgocasa-orange/10 rounded-full blur-3xl" />

                  <div className="relative z-10">
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-400/20 rounded-2xl mb-4">
                        <Sun className="w-7 h-7 text-amber-400" />
                      </div>
                      <h3 className="text-white font-heading font-bold text-xl mb-1">
                        Tu código de descuento
                      </h3>
                      <p className="text-blue-200/60 text-sm">
                        Introdúcelo al reservar
                      </p>
                    </div>

                    {/* Code box */}
                    <button
                      onClick={handleCopyCode}
                      className="w-full group relative bg-white/10 hover:bg-white/15 border-2 border-dashed border-white/20 hover:border-amber-400/50 rounded-2xl p-4 sm:p-5 transition-all duration-300 cursor-pointer mb-6 overflow-hidden"
                    >
                      <div className="text-amber-400 font-heading font-black text-lg sm:text-2xl md:text-3xl tracking-[0.08em] sm:tracking-[0.15em] md:tracking-[0.2em] mb-2 break-all sm:break-normal">
                        EARLYSUMMER2026
                      </div>
                      <div className="flex items-center justify-center gap-2 text-white/60 group-hover:text-white/80 transition-colors text-sm">
                        {copied ? (
                          <>
                            <Check className="w-4 h-4 text-green-400" />
                            <span className="text-green-400 font-medium">¡Código copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>Haz clic para copiar</span>
                          </>
                        )}
                      </div>
                    </button>

                    {/* Discount highlight */}
                    <div className="bg-gradient-to-r from-amber-400/20 to-furgocasa-orange/20 border border-amber-400/20 rounded-xl p-4 text-center mb-6">
                      <div className="text-amber-400 font-heading font-black text-4xl mb-1">
                        -15%
                      </div>
                      <div className="text-white/70 text-sm">
                        sobre el precio de tu alquiler
                      </div>
                    </div>

                    {/* Countdown */}
                    {!isExpired && (
                      <div>
                        <p className="text-center text-white/50 text-xs uppercase tracking-widest mb-3 font-medium">
                          La oferta termina en
                        </p>
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { value: timeLeft.days, label: "Días" },
                            { value: timeLeft.hours, label: "Horas" },
                            { value: timeLeft.mins, label: "Min" },
                            { value: timeLeft.secs, label: "Seg" },
                          ].map((item) => (
                            <div
                              key={item.label}
                              className="bg-white/5 border border-white/10 rounded-xl py-3 text-center"
                            >
                              <div className="text-white font-heading font-bold text-xl md:text-2xl tabular-nums">
                                {item.value}
                              </div>
                              <div className="text-white/40 text-[10px] uppercase tracking-wider font-medium">
                                {item.label}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {isExpired && (
                      <div className="text-center py-3">
                        <p className="text-white/50 text-sm">
                          Esta oferta ha finalizado
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Fine print */}
                <p className="text-center text-blue-200/30 text-xs mt-4 leading-relaxed">
                  Válido para alquileres del 15/06 al 15/09/2026. Duración mínima 10 días.
                  No acumulable con otras ofertas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
