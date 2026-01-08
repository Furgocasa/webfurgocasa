import { 
  Car, 
  Calendar, 
  Users, 
  CreditCard, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";

// TODO: Cargar datos reales desde Supabase
const stats = [
  {
    name: "Reservas hoy",
    value: "3",
    icon: Calendar,
    change: "+2 vs ayer",
    changeType: "positive",
  },
  {
    name: "Ingresos del mes",
    value: "12.450€",
    icon: CreditCard,
    change: "+15% vs mes anterior",
    changeType: "positive",
  },
  {
    name: "Vehículos disponibles",
    value: "8/12",
    icon: Car,
    change: "4 en alquiler",
    changeType: "neutral",
  },
  {
    name: "Clientes nuevos",
    value: "24",
    icon: Users,
    change: "+8 esta semana",
    changeType: "positive",
  },
];

const recentBookings = [
  {
    id: "FC2401-0001",
    customer: "María García",
    vehicle: "Volkswagen California",
    dates: "15/01 - 20/01",
    status: "confirmed",
    amount: "750€",
  },
  {
    id: "FC2401-0002",
    customer: "Juan López",
    vehicle: "Ford Transit Camper",
    dates: "18/01 - 25/01",
    status: "pending",
    amount: "980€",
  },
  {
    id: "FC2401-0003",
    customer: "Ana Martínez",
    vehicle: "Fiat Ducato Premium",
    dates: "20/01 - 22/01",
    status: "in_progress",
    amount: "320€",
  },
];

const todayActions = [
  { type: "pickup", time: "09:00", customer: "Pedro Sánchez", vehicle: "VW California" },
  { type: "dropoff", time: "11:00", customer: "Laura Ruiz", vehicle: "Ford Transit" },
  { type: "pickup", time: "16:00", customer: "Carlos Díaz", vehicle: "Fiat Ducato" },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Bienvenido al panel de administración de Furgocasa
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </p>
                <p
                  className={`text-sm mt-2 ${
                    stat.changeType === "positive"
                      ? "text-green-600"
                      : stat.changeType === "negative"
                      ? "text-red-600"
                      : "text-gray-500"
                  }`}
                >
                  {stat.change}
                </p>
              </div>
              <div className="p-3 bg-furgocasa-orange/10 rounded-lg">
                <stat.icon className="h-6 w-6 text-furgocasa-orange" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Today's Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              Acciones de hoy
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {todayActions.map((action, index) => (
              <div key={index} className="p-4 flex items-center gap-4">
                <div
                  className={`p-2 rounded-lg ${
                    action.type === "pickup"
                      ? "bg-green-100 text-green-600"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {action.type === "pickup" ? (
                    <TrendingUp className="h-5 w-5" />
                  ) : (
                    <TrendingUp className="h-5 w-5 rotate-180" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {action.type === "pickup" ? "Entrega" : "Recogida"}:{" "}
                    {action.vehicle}
                  </p>
                  <p className="text-sm text-gray-500">{action.customer}</p>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {action.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Últimas reservas
            </h2>
            <a
              href="/admin/reservas"
              className="text-sm text-furgocasa-orange hover:underline"
            >
              Ver todas
            </a>
          </div>
          <div className="divide-y divide-gray-100">
            {recentBookings.map((booking) => (
              <div key={booking.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-gray-900">
                      {booking.customer}
                    </p>
                    <p className="text-sm text-gray-500">{booking.vehicle}</p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      booking.status === "confirmed"
                        ? "bg-green-100 text-green-700"
                        : booking.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {booking.status === "confirmed" && (
                      <CheckCircle className="h-3 w-3" />
                    )}
                    {booking.status === "pending" && (
                      <Clock className="h-3 w-3" />
                    )}
                    {booking.status === "in_progress" && (
                      <AlertCircle className="h-3 w-3" />
                    )}
                    {booking.status === "confirmed"
                      ? "Confirmada"
                      : booking.status === "pending"
                      ? "Pendiente"
                      : "En curso"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">{booking.dates}</span>
                  <span className="font-semibold text-gray-900">
                    {booking.amount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
