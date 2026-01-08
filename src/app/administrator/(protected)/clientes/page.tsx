import Link from "next/link";
import { Plus, Search, Phone, MapPin, Calendar, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ClientActions from "./client-actions";

async function getAllCustomers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('customers')
    .select(`
      *,
      bookings:bookings(count)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching customers:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("es-ES", { 
    day: "2-digit", 
    month: "short", 
    year: "numeric" 
  });
}

export default async function ClientesPage() {
  const { data: customers, error } = await getAllCustomers();

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h2 className="text-red-800 font-semibold">Error al cargar clientes</h2>
          <p className="text-red-600 text-sm mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  const customersList = customers || [];
  const totalCustomers = customersList.length;
  const activeCustomers = customersList.filter(c => {
    const lastBooking = new Date(c.created_at);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return lastBooking > sixMonthsAgo;
  }).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600 mt-1">Gestiona tu base de datos de clientes</p>
        </div>
        <Link href="/administrator/clientes/nuevo" className="btn-primary flex items-center gap-2">
          <Plus className="h-5 w-5" />Añadir cliente
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total clientes</p>
          <p className="text-2xl font-bold text-gray-900">{totalCustomers}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Activos (6 meses)</p>
          <p className="text-2xl font-bold text-green-600">{activeCustomers}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Con reservas</p>
          <p className="text-2xl font-bold text-blue-600">
            {customersList.filter(c => c.bookings && c.bookings.length > 0).length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Este mes</p>
          <p className="text-2xl font-bold text-purple-600">
            {customersList.filter(c => {
              const date = new Date(c.created_at);
              const now = new Date();
              return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
            }).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar por nombre, email, teléfono..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent" 
            />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange">
            <option value="">Todos los clientes</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Cliente</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Contacto</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Ubicación</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Reservas</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Registro</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customersList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <Mail className="h-12 w-12 mb-4 text-gray-300" />
                      <p className="text-lg font-medium">No hay clientes registrados</p>
                      <p className="text-sm mt-1">Los clientes aparecerán aquí cuando hagan reservas</p>
                    </div>
                  </td>
                </tr>
              ) : (
                customersList.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-furgocasa-orange/10 flex items-center justify-center text-furgocasa-orange font-bold">
                          {customer.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{customer.name || 'Sin nombre'}</p>
                          <p className="text-sm text-gray-500">{customer.dni || 'Sin DNI'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {customer.email || '—'}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="h-4 w-4 text-gray-400" />
                          {customer.phone || '—'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p>{customer.city || '—'}</p>
                          {customer.country && (
                            <p className="text-xs text-gray-500">{customer.country}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                        {customer.bookings?.[0]?.count || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {formatDate(customer.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <ClientActions 
                        customerId={customer.id}
                        customerEmail={customer.email || ''}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Mostrando 1-{customersList.length} de {customersList.length} clientes
          </p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50" disabled>
              Anterior
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50" disabled>
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

