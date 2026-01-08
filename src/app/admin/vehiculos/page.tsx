import Link from "next/link";
import { 
  Plus, 
  Search, 
  Edit,
  Trash2,
  Eye,
  Car
} from "lucide-react";

// TODO: Cargar desde Supabase
const vehicles = [
  {
    id: "1",
    name: "Volkswagen California Ocean",
    slug: "vw-california-ocean",
    category: "Furgoneta Camper",
    brand: "Volkswagen",
    year: 2023,
    seats: 4,
    beds: 4,
    basePrice: 120,
    status: "available",
  },
  {
    id: "2",
    name: "Ford Transit Custom Camper",
    slug: "ford-transit-camper",
    category: "Camper Grande",
    brand: "Ford",
    year: 2022,
    seats: 5,
    beds: 4,
    basePrice: 100,
    status: "rented",
  },
  {
    id: "3",
    name: "Fiat Ducato Premium",
    slug: "fiat-ducato-premium",
    category: "Autocaravana",
    brand: "Fiat",
    year: 2023,
    seats: 6,
    beds: 6,
    basePrice: 150,
    status: "maintenance",
  },
];

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  available: { bg: "bg-green-100", text: "text-green-700", label: "Disponible" },
  rented: { bg: "bg-blue-100", text: "text-blue-700", label: "Alquilado" },
  maintenance: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Mantenimiento" },
  inactive: { bg: "bg-gray-100", text: "text-gray-700", label: "Inactivo" },
};

export default function VehiclesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vehículos</h1>
          <p className="text-gray-600 mt-1">
            Gestiona tu flota de campers y autocaravanas
          </p>
        </div>
        <Link
          href="/admin/vehiculos/nuevo"
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Añadir vehículo
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar vehículos..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
            />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent">
            <option value="">Todas las categorías</option>
            <option value="furgoneta-camper">Furgoneta Camper</option>
            <option value="camper-grande">Camper Grande</option>
            <option value="autocaravana">Autocaravana</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent">
            <option value="">Todos los estados</option>
            <option value="available">Disponible</option>
            <option value="rented">Alquilado</option>
            <option value="maintenance">Mantenimiento</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Vehículo</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Categoría</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Plazas</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Camas</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Precio/día</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Estado</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Car className="h-6 w-6 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{vehicle.name}</p>
                        <p className="text-sm text-gray-500">{vehicle.brand} · {vehicle.year}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{vehicle.category}</td>
                  <td className="px-6 py-4 text-center text-gray-600">{vehicle.seats}</td>
                  <td className="px-6 py-4 text-center text-gray-600">{vehicle.beds}</td>
                  <td className="px-6 py-4 text-right font-semibold text-gray-900">{vehicle.basePrice}€</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${statusColors[vehicle.status].bg} ${statusColors[vehicle.status].text}`}>
                      {statusColors[vehicle.status].label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/vehiculos/${vehicle.slug}`} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Ver en web">
                        <Eye className="h-5 w-5" />
                      </Link>
                      <Link href={`/admin/vehiculos/${vehicle.id}`} className="p-2 text-gray-400 hover:text-furgocasa-orange hover:bg-furgocasa-orange/10 rounded-lg transition-colors" title="Editar">
                        <Edit className="h-5 w-5" />
                      </Link>
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-600">Mostrando 1-{vehicles.length} de {vehicles.length} vehículos</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50" disabled>Anterior</button>
            <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50" disabled>Siguiente</button>
          </div>
        </div>
      </div>
    </div>
  );
}
