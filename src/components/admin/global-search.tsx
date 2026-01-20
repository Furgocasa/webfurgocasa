"use client";

import { useState, useEffect, useRef } from "react";
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

export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Buscar cuando el usuario escribe
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch(query);
      } else {
        setResults(null);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  // Cerrar resultados al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Atajos de teclado
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Ctrl/Cmd + K para abrir búsqueda
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }

      // Escape para cerrar
      if (event.key === "Escape") {
        setShowResults(false);
        inputRef.current?.blur();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
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
        setShowResults(true);
      }
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (path: string) => {
    router.push(path);
    setShowResults(false);
    setQuery("");
    inputRef.current?.blur();
  };

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

  return (
    <div ref={searchRef} className="relative flex-1 max-w-2xl">
      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results && setShowResults(true)}
          placeholder="Buscar en todo (Ctrl+K)"
          className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent transition-all"
        />
        {!loading && !query && (
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
        )}
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 animate-spin" />
        )}
        {query && !loading && (
          <button
            onClick={() => {
              setQuery("");
              setResults(null);
              setShowResults(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {showResults && results && results.total > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-2xl border border-gray-200 z-[60] max-h-[600px] overflow-hidden flex flex-col">
          <div className="overflow-y-auto">
            {/* Vehículos */}
            {results.vehicles.length > 0 && (
              <div className="border-b border-gray-100">
                <div className="px-4 py-3 bg-gray-50 flex items-center gap-2">
                  <Car className="h-4 w-4 text-blue-600" />
                  <h3 className="font-semibold text-sm text-gray-900">
                    Vehículos ({results.vehicles.length})
                  </h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {results.vehicles.map((vehicle) => (
                    <button
                      key={vehicle.id}
                      onClick={() =>
                        handleNavigate(`/administrator/vehiculos/${vehicle.id}/editar`)
                      }
                      className="w-full px-4 py-3 hover:bg-blue-50 transition-colors text-left flex items-center justify-between group"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">
                            {vehicle.internal_code}
                          </span>
                          <span className="text-gray-600">{vehicle.name}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              vehicle.status
                            )}`}
                          >
                            {vehicle.status}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {vehicle.brand} {vehicle.model} • {vehicle.year} •{" "}
                          {vehicle.plate_number}
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Reservas */}
            {results.bookings.length > 0 && (
              <div className="border-b border-gray-100">
                <div className="px-4 py-3 bg-gray-50 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <h3 className="font-semibold text-sm text-gray-900">
                    Reservas ({results.bookings.length})
                  </h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {results.bookings.map((booking) => (
                    <button
                      key={booking.id}
                      onClick={() =>
                        handleNavigate(`/administrator/reservas/${booking.id}`)
                      }
                      className="w-full px-4 py-3 hover:bg-purple-50 transition-colors text-left flex items-center justify-between group"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono font-medium text-gray-900">
                            {booking.booking_number}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              booking.status
                            )}`}
                          >
                            {booking.status}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              booking.payment_status
                            )}`}
                          >
                            {booking.payment_status}
                          </span>
                        </div>
                        {booking.customer && (
                          <div className="text-xs text-gray-600 mb-1">
                            {booking.customer.name} • {booking.customer.phone}
                          </div>
                        )}
                        <div className="text-xs text-gray-500">
                          {booking.vehicle?.internal_code} {booking.vehicle?.name} •{" "}
                          {new Date(booking.pickup_date).toLocaleDateString()} →{" "}
                          {new Date(booking.dropoff_date).toLocaleDateString()}
                          {booking.pickup_location && (
                            <> • 📍 {booking.pickup_location.name}</>
                          )}
                          {" • "}{booking.total_price}€
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Clientes */}
            {results.customers.length > 0 && (
              <div className="border-b border-gray-100">
                <div className="px-4 py-3 bg-gray-50 flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-600" />
                  <h3 className="font-semibold text-sm text-gray-900">
                    Clientes ({results.customers.length})
                  </h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {results.customers.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() =>
                        handleNavigate(`/administrator/clientes?id=${customer.id}`)
                      }
                      className="w-full px-4 py-3 hover:bg-green-50 transition-colors text-left flex items-center justify-between group"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">
                            {customer.name}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            {customer.total_bookings} reservas
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {customer.email} • {customer.phone}
                          {customer.dni && ` • DNI: ${customer.dni}`}
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Extras */}
            {results.extras.length > 0 && (
              <div>
                <div className="px-4 py-3 bg-gray-50 flex items-center gap-2">
                  <Package className="h-4 w-4 text-orange-600" />
                  <h3 className="font-semibold text-sm text-gray-900">
                    Extras ({results.extras.length})
                  </h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {results.extras.map((extra) => (
                    <button
                      key={extra.id}
                      onClick={() =>
                        handleNavigate(`/administrator/extras?id=${extra.id}`)
                      }
                      className="w-full px-4 py-3 hover:bg-orange-50 transition-colors text-left flex items-center justify-between group"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">
                            {extra.name}
                          </span>
                          <span className="text-sm text-gray-600">
                            {extra.price_type === "per_day"
                              ? `${extra.price_per_day}€/día`
                              : `${extra.price_per_rental}€/reserva`}
                          </span>
                        </div>
                        {extra.description && (
                          <div className="text-xs text-gray-500 line-clamp-1">
                            {extra.description}
                          </div>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Ubicaciones */}
            {results.locations.length > 0 && (
              <div>
                <div className="px-4 py-3 bg-gray-50 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-purple-600" />
                  <h3 className="font-semibold text-sm text-gray-900">
                    Ubicaciones ({results.locations.length})
                  </h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {results.locations.map((location) => (
                    <button
                      key={location.id}
                      onClick={() =>
                        handleNavigate(`/administrator/ubicaciones?id=${location.id}`)
                      }
                      className="w-full px-4 py-3 hover:bg-purple-50 transition-colors text-left flex items-center justify-between group"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">
                            {location.name}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {location.address && <div>{location.address}</div>}
                          {location.city && (
                            <div>
                              {location.city}
                              {location.postal_code && ` - ${location.postal_code}`}
                            </div>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600">
            <span>{results.total} resultados totales</span>
            <span className="flex items-center gap-4">
              <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">
                ↑↓
              </kbd>
              <span>navegar</span>
              <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">
                Enter
              </kbd>
              <span>seleccionar</span>
              <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">
                Esc
              </kbd>
              <span>cerrar</span>
            </span>
          </div>
        </div>
      )}

      {/* No Results */}
      {showResults && results && results.total === 0 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-2xl border border-gray-200 z-[60] p-8 text-center">
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

