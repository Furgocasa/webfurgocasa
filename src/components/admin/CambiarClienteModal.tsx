"use client";

import { useState, useEffect, useRef, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { createClient } from "@/lib/supabase/client";
import { X, Search, User, Mail, Phone, CheckCircle } from "lucide-react";

interface Customer {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  dni: string | null;
  city: string | null;
}

interface CambiarClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCustomerId?: string;
  onSelect: (customer: Customer) => void;
}

export default function CambiarClienteModal({
  isOpen,
  onClose,
  currentCustomerId,
  onSelect,
}: CambiarClienteModalProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filtered, setFiltered] = useState<Customer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
      setSelectedId(null);
      loadCustomers();
      setTimeout(() => searchRef.current?.focus(), 150);
    }
  }, [isOpen]);

  useEffect(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) {
      setFiltered(customers);
    } else {
      setFiltered(
        customers.filter(
          (c) =>
            c.name?.toLowerCase().includes(term) ||
            c.email?.toLowerCase().includes(term) ||
            c.phone?.includes(term) ||
            c.dni?.toLowerCase().includes(term) ||
            c.city?.toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, customers]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("customers")
        .select("id, name, email, phone, dni, city")
        .order("name", { ascending: true });

      if (error) throw error;
      setCustomers(data || []);
      setFiltered(data || []);
    } catch (err) {
      console.error("Error loading customers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    const customer = customers.find((c) => c.id === selectedId);
    if (customer) {
      onSelect(customer);
      onClose();
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[1100]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <Dialog.Title
                    as="h3"
                    className="text-xl font-bold text-gray-900 flex items-center gap-2"
                  >
                    <User className="h-5 w-5 text-furgocasa-blue" />
                    Cambiar cliente
                  </Dialog.Title>
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-gray-100">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      ref={searchRef}
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar por nombre, email, teléfono, DNI o ciudad..."
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    {filtered.length === customers.length
                      ? `${customers.length} clientes`
                      : `${filtered.length} de ${customers.length} clientes`}
                  </p>
                </div>

                {/* List */}
                <div className="overflow-y-auto max-h-96">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-furgocasa-orange" />
                    </div>
                  ) : filtered.length === 0 ? (
                    <div className="py-12 text-center text-sm text-gray-500">
                      No se encontraron clientes
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-100">
                      {filtered.map((customer) => {
                        const isCurrent = customer.id === currentCustomerId;
                        const isSelected = customer.id === selectedId;
                        return (
                          <li key={customer.id}>
                            <button
                              type="button"
                              onClick={() => setSelectedId(customer.id)}
                              className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${
                                isSelected
                                  ? "bg-orange-50 border-l-4 border-furgocasa-orange"
                                  : isCurrent
                                  ? "bg-blue-50"
                                  : "hover:bg-gray-50"
                              }`}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-semibold text-gray-900 truncate">
                                    {customer.name || "Sin nombre"}
                                  </span>
                                  {isCurrent && (
                                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                                      actual
                                    </span>
                                  )}
                                </div>
                                <div className="mt-0.5 flex flex-wrap gap-x-4 gap-y-0.5">
                                  {customer.email && (
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                      <Mail className="h-3 w-3" />
                                      {customer.email}
                                    </span>
                                  )}
                                  {customer.phone && (
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                      <Phone className="h-3 w-3" />
                                      {customer.phone}
                                    </span>
                                  )}
                                  {customer.city && (
                                    <span className="text-xs text-gray-400">
                                      {customer.city}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {isSelected && (
                                <CheckCircle className="h-5 w-5 text-furgocasa-orange flex-shrink-0 mt-0.5" />
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={!selectedId || selectedId === currentCustomerId}
                    className="px-5 py-2 bg-furgocasa-orange text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Asignar cliente
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
