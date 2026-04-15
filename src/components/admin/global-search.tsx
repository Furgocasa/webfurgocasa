"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Loader2,
  Car,
  Calendar,
  Users,
  Package,
  MapPin,
  X,
  ArrowRight,
  FileText,
  Clock,
  Mic,
  MicOff,
} from "lucide-react";

interface SearchResults {
  vehicles: Array<{
    id: string;
    name: string;
    internal_code: string;
    brand: string;
    model: string;
    year: number;
    status: string;
    plate_number: string;
  }>;
  bookings: Array<{
    id: string;
    booking_number: string;
    status: string;
    payment_status: string;
    pickup_date: string;
    dropoff_date: string;
    total_price: number;
    customer: { name: string; email: string; phone: string } | null;
    vehicle: { name: string; internal_code: string } | null;
    pickup_location: { id: string; name: string; city: string } | null;
    dropoff_location: { id: string; name: string; city: string } | null;
  }>;
  customers: Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
    dni: string;
    total_bookings: number;
  }>;
  extras: Array<{
    id: string;
    name: string;
    description: string;
    price_per_day: number | null;
    price_per_unit: number | null;
    price_per_rental: number | null;
    price_type: string;
  }>;
  locations: Array<{
    id: string;
    name: string;
    address: string;
    city: string;
    postal_code: string;
    is_active: boolean;
  }>;
  total: number;
}

const RECENT_SEARCHES_KEY = "admin-recent-searches";
const MAX_RECENT = 5;

function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string) {
  const recent = getRecentSearches().filter((s) => s !== query);
  recent.unshift(query);
  localStorage.setItem(
    RECENT_SEARCHES_KEY,
    JSON.stringify(recent.slice(0, MAX_RECENT))
  );
}

export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSpotlight, setIsSpotlight] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const spotlightInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
    setRecentSearches(getRecentSearches());
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch(query);
      } else {
        setResults(null);
      }
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  useEffect(() => {
    if (!isSpotlight) return;
    document.body.style.overflow = "hidden";
    setTimeout(() => spotlightInputRef.current?.focus(), 100);
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSpotlight]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node) &&
        !isSpotlight
      ) {
        setResults(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSpotlight]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        if (isTouchDevice) {
          openSpotlight();
        } else {
          inputRef.current?.focus();
        }
      }
      if (event.key === "Escape") {
        if (isSpotlight) {
          closeSpotlight();
        } else {
          setResults(null);
          inputRef.current?.blur();
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isTouchDevice, isSpotlight]);

  const openSpotlight = useCallback(() => {
    setIsSpotlight(true);
    setRecentSearches(getRecentSearches());
  }, []);

  const closeSpotlight = useCallback(() => {
    setIsSpotlight(false);
    setQuery("");
    setResults(null);
    stopListening();
  }, []);

  const performSearch = async (searchQuery: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/search?q=${encodeURIComponent(searchQuery)}`
      );
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      }
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (path: string) => {
    if (query.trim().length >= 2) saveRecentSearch(query.trim());
    router.push(path);
    setResults(null);
    setQuery("");
    closeSpotlight();
    inputRef.current?.blur();
  };

  const startListening = useCallback(() => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: typeof window.SpeechRecognition }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: typeof window.SpeechRecognition }).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "es-ES";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join("");
      setQuery(transcript);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      available: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      in_progress: "bg-purple-100 text-purple-800",
      completed: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
      maintenance: "bg-orange-100 text-orange-800",
      rented: "bg-indigo-100 text-indigo-800",
      paid: "bg-green-100 text-green-800",
      partial: "bg-yellow-100 text-yellow-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const hasSpeech =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const renderResults = (inSpotlight: boolean) => {
    const showRecent =
      !query && recentSearches.length > 0 && inSpotlight;

    if (showRecent) {
      return (
        <div className="py-2">
          <div className="px-4 py-2 flex items-center gap-2 text-xs font-medium text-gray-400 uppercase tracking-wide">
            <Clock className="h-3.5 w-3.5" />
            Búsquedas recientes
          </div>
          {recentSearches.map((s) => (
            <button
              key={s}
              onClick={() => setQuery(s)}
              className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100 flex items-center gap-3 transition-colors"
            >
              <Search className="h-4 w-4 text-gray-400" />
              {s}
            </button>
          ))}
        </div>
      );
    }

    if (!results || results.total === 0) {
      if (query.length >= 2 && !loading) {
        return (
          <div className="py-12 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-900 font-medium mb-1">
              No se encontraron resultados
            </p>
            <p className="text-sm text-gray-500">
              Intenta con otro término de búsqueda
            </p>
          </div>
        );
      }
      return null;
    }

    return (
      <div className="overflow-y-auto">
        {results.vehicles.length > 0 && (
          <div className="border-b border-gray-100">
            <div className="px-4 py-2.5 bg-gray-50/80 flex items-center gap-2">
              <Car className="h-4 w-4 text-blue-600" />
              <h3 className="font-semibold text-xs uppercase tracking-wide text-gray-500">
                Vehículos ({results.vehicles.length})
              </h3>
            </div>
            {results.vehicles.map((vehicle) => (
              <button
                key={vehicle.id}
                onClick={() =>
                  handleNavigate(
                    `/administrator/vehiculos/${vehicle.id}/editar`
                  )
                }
                className="w-full px-4 py-3 hover:bg-blue-50 active:bg-blue-100 transition-colors text-left flex items-center justify-between group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-gray-900">
                      {vehicle.internal_code}
                    </span>
                    <span className="text-gray-600 text-sm">{vehicle.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(
                        vehicle.status
                      )}`}
                    >
                      {vehicle.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {vehicle.brand} {vehicle.model} &middot; {vehicle.year} &middot;{" "}
                    {vehicle.plate_number}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        )}

        {results.bookings.length > 0 && (
          <div className="border-b border-gray-100">
            <div className="px-4 py-2.5 bg-gray-50/80 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-600" />
              <h3 className="font-semibold text-xs uppercase tracking-wide text-gray-500">
                Reservas ({results.bookings.length})
              </h3>
            </div>
            {results.bookings.map((booking) => (
              <button
                key={booking.id}
                onClick={() =>
                  handleNavigate(`/administrator/reservas/${booking.id}`)
                }
                className="w-full px-4 py-3 hover:bg-purple-50 active:bg-purple-100 transition-colors text-left flex items-center justify-between group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono font-semibold text-gray-900">
                      {booking.booking_number}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(
                        booking.payment_status
                      )}`}
                    >
                      {booking.payment_status}
                    </span>
                  </div>
                  {booking.customer && (
                    <div className="text-xs text-gray-600 mb-0.5">
                      {booking.customer.name} &middot; {booking.customer.phone}
                    </div>
                  )}
                  <div className="text-xs text-gray-500">
                    {booking.vehicle?.internal_code} {booking.vehicle?.name} &middot;{" "}
                    {new Date(booking.pickup_date).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" })} &rarr;{" "}
                    {new Date(booking.dropoff_date).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" })}
                    {booking.pickup_location && (
                      <> &middot; {booking.pickup_location.name}</>
                    )}
                    {" &middot; "}{booking.total_price}&euro;
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        )}

        {results.customers.length > 0 && (
          <div className="border-b border-gray-100">
            <div className="px-4 py-2.5 bg-gray-50/80 flex items-center gap-2">
              <Users className="h-4 w-4 text-green-600" />
              <h3 className="font-semibold text-xs uppercase tracking-wide text-gray-500">
                Clientes ({results.customers.length})
              </h3>
            </div>
            {results.customers.map((customer) => (
              <button
                key={customer.id}
                onClick={() =>
                  handleNavigate(
                    `/administrator/clientes?id=${customer.id}`
                  )
                }
                className="w-full px-4 py-3 hover:bg-green-50 active:bg-green-100 transition-colors text-left flex items-center justify-between group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-gray-900">
                      {customer.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-700">
                      {customer.total_bookings} reservas
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {customer.email} &middot; {customer.phone}
                    {customer.dni && ` &middot; DNI: ${customer.dni}`}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        )}

        {results.extras.length > 0 && (
          <div className="border-b border-gray-100">
            <div className="px-4 py-2.5 bg-gray-50/80 flex items-center gap-2">
              <Package className="h-4 w-4 text-orange-600" />
              <h3 className="font-semibold text-xs uppercase tracking-wide text-gray-500">
                Extras ({results.extras.length})
              </h3>
            </div>
            {results.extras.map((extra) => (
              <button
                key={extra.id}
                onClick={() =>
                  handleNavigate(`/administrator/extras?id=${extra.id}`)
                }
                className="w-full px-4 py-3 hover:bg-orange-50 active:bg-orange-100 transition-colors text-left flex items-center justify-between group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-gray-900">
                      {extra.name}
                    </span>
                    <span className="text-sm text-gray-600">
                      {extra.price_type === "per_day"
                        ? `${extra.price_per_day}\u20AC/d\u00EDa`
                        : extra.price_type === "per_unit"
                          ? `${extra.price_per_unit ?? 0}\u20AC/unidad`
                          : `${extra.price_per_rental}\u20AC/reserva`}
                    </span>
                  </div>
                  {extra.description && (
                    <div className="text-xs text-gray-500 line-clamp-1">
                      {extra.description}
                    </div>
                  )}
                </div>
                <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        )}

        {results.locations.length > 0 && (
          <div>
            <div className="px-4 py-2.5 bg-gray-50/80 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-purple-600" />
              <h3 className="font-semibold text-xs uppercase tracking-wide text-gray-500">
                Ubicaciones ({results.locations.length})
              </h3>
            </div>
            {results.locations.map((location) => (
              <button
                key={location.id}
                onClick={() =>
                  handleNavigate(
                    `/administrator/ubicaciones?id=${location.id}`
                  )
                }
                className="w-full px-4 py-3 hover:bg-purple-50 active:bg-purple-100 transition-colors text-left flex items-center justify-between group"
              >
                <div className="flex-1">
                  <span className="font-semibold text-gray-900">
                    {location.name}
                  </span>
                  <div className="text-xs text-gray-500">
                    {location.address && <span>{location.address}</span>}
                    {location.city && (
                      <span>
                        {location.address ? " \u00B7 " : ""}
                        {location.city}
                        {location.postal_code && ` - ${location.postal_code}`}
                      </span>
                    )}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        )}

        {results.total > 0 && !isTouchDevice && (
          <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
            <span>{results.total} resultados</span>
            <span className="flex items-center gap-3">
              <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-[10px]">
                \u2191\u2193
              </kbd>
              <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-[10px]">
                Enter
              </kbd>
              <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-[10px]">
                Esc
              </kbd>
            </span>
          </div>
        )}
      </div>
    );
  };

  // Spotlight fullscreen mode (tablet/mobile)
  if (isSpotlight) {
    return (
      <>
        {/* Trigger stays in place */}
        <div ref={searchRef} className="relative flex-1 max-w-2xl">
          <div
            className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-xl bg-gray-50 text-gray-400 text-sm cursor-pointer"
            onClick={openSpotlight}
          >
            Buscar en todo...
          </div>
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
        </div>

        {/* Spotlight overlay */}
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm">
          <div className="flex flex-col h-full max-w-2xl mx-auto pt-[env(safe-area-inset-top)]">
            {/* Search bar */}
            <div className="flex items-center gap-2 px-4 pt-4 pb-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  ref={spotlightInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar reservas, clientes, vehículos..."
                  className="w-full pl-12 pr-12 py-3.5 bg-white rounded-2xl text-base shadow-lg border-0 focus:ring-2 focus:ring-furgocasa-orange/50 outline-none"
                  autoComplete="off"
                  autoCorrect="off"
                />
                {loading && (
                  <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 animate-spin" />
                )}
                {query && !loading && (
                  <button
                    onClick={() => {
                      setQuery("");
                      setResults(null);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1"
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                )}
              </div>
              {hasSpeech && (
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`p-3 rounded-2xl transition-all shadow-lg ${
                    isListening
                      ? "bg-red-500 text-white animate-pulse"
                      : "bg-white text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {isListening ? (
                    <MicOff className="h-5 w-5" />
                  ) : (
                    <Mic className="h-5 w-5" />
                  )}
                </button>
              )}
              <button
                onClick={closeSpotlight}
                className="p-3 bg-white rounded-2xl text-gray-500 hover:text-gray-700 transition-colors shadow-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Results */}
            <div className="flex-1 mx-4 mb-4 mt-2 bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto">
                {renderResults(true)}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Desktop inline mode
  return (
    <div ref={searchRef} className="relative flex-1 max-w-2xl">
      <div className="relative">
        {isTouchDevice ? (
          <button
            onClick={openSpotlight}
            className="w-full text-left pl-4 pr-10 py-2.5 border border-gray-300 rounded-xl bg-white text-gray-400 text-sm transition-all hover:border-gray-400 focus:ring-2 focus:ring-furgocasa-orange"
          >
            Buscar en todo...
          </button>
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results && setResults(results)}
            placeholder="Buscar en todo (Ctrl+K)"
            className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent transition-all"
          />
        )}
        {!loading && !query && (
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
        )}
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 animate-spin" />
        )}
        {query && !loading && !isTouchDevice && (
          <button
            onClick={() => {
              setQuery("");
              setResults(null);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Desktop dropdown */}
      {!isTouchDevice && results && results.total > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-2xl border border-gray-200 z-[60] max-h-[600px] overflow-hidden flex flex-col">
          {renderResults(false)}
        </div>
      )}

      {!isTouchDevice && results && results.total === 0 && query.length >= 2 && !loading && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-2xl border border-gray-200 z-[60] p-8 text-center">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-900 font-medium mb-1">
            No se encontraron resultados
          </p>
          <p className="text-sm text-gray-500">
            Intenta con otro término de búsqueda
          </p>
        </div>
      )}
    </div>
  );
}
