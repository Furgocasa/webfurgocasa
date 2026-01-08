import Link from "next/link";
import { 
  Plus, 
  Search, 
  Edit,
  Trash2,
  Eye,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  MoreHorizontal
} from "lucide-react";

// TODO: Cargar desde Supabase
const posts = [
  {
    id: "1",
    title: "10 destinos imprescindibles para viajar en camper por España",
    slug: "10-destinos-imprescindibles-camper-espana",
    category: "Destinos",
    author: "Admin",
    status: "published",
    views: 1250,
    publishedAt: "2024-01-10",
    createdAt: "2024-01-08",
  },
  {
    id: "2",
    title: "Guía completa: Tu primera vez viajando en autocaravana",
    slug: "guia-primera-vez-autocaravana",
    category: "Consejos",
    author: "Admin",
    status: "published",
    views: 890,
    publishedAt: "2024-01-05",
    createdAt: "2024-01-03",
  },
  {
    id: "3",
    title: "Ruta por la Costa Brava en camper: 7 días inolvidables",
    slug: "ruta-costa-brava-camper-7-dias",
    category: "Rutas",
    author: "Admin",
    status: "draft",
    views: 0,
    publishedAt: null,
    createdAt: "2024-01-12",
  },
  {
    id: "4",
    title: "Nuevos vehículos en nuestra flota 2024",
    slug: "nuevos-vehiculos-flota-2024",
    category: "Noticias",
    author: "Admin",
    status: "pending",
    views: 0,
    publishedAt: null,
    createdAt: "2024-01-14",
  },
];

const statusConfig: Record<string, { icon: typeof CheckCircle; bg: string; text: string; label: string }> = {
  draft: { icon: Clock, bg: "bg-gray-100", text: "text-gray-700", label: "Borrador" },
  pending: { icon: Clock, bg: "bg-yellow-100", text: "text-yellow-700", label: "Pendiente" },
  published: { icon: CheckCircle, bg: "bg-green-100", text: "text-green-700", label: "Publicado" },
  archived: { icon: XCircle, bg: "bg-red-100", text: "text-red-700", label: "Archivado" },
};

export default function BlogPostsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Artículos del Blog</h1>
          <p className="text-gray-600 mt-1">
            Gestiona los artículos y contenido de tu blog
          </p>
        </div>
        <Link
          href="/administrator/blog/articulos/nuevo"
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Nuevo artículo
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Publicados", value: "15", color: "text-green-600" },
          { label: "Borradores", value: "3", color: "text-gray-600" },
          { label: "Pendientes", value: "1", color: "text-yellow-600" },
          { label: "Visitas totales", value: "8.5K", color: "text-blue-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar artículos..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
            />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent">
            <option value="">Todas las categorías</option>
            <option value="destinos">Destinos</option>
            <option value="consejos">Consejos</option>
            <option value="rutas">Rutas</option>
            <option value="noticias">Noticias</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent">
            <option value="">Todos los estados</option>
            <option value="published">Publicado</option>
            <option value="draft">Borrador</option>
            <option value="pending">Pendiente</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Artículo</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Categoría</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Autor</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Estado</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Visitas</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Fecha</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {posts.map((post) => {
                const StatusIcon = statusConfig[post.status].icon;
                return (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <FileText className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="max-w-md">
                          <p className="font-medium text-gray-900 truncate">{post.title}</p>
                          <p className="text-sm text-gray-500 truncate">/{post.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                        {post.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{post.author}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig[post.status].bg} ${statusConfig[post.status].text}`}>
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig[post.status].label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600">
                      {post.views.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {post.publishedAt || post.createdAt}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {post.status === "published" && (
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Ver en web"
                          >
                            <Eye className="h-5 w-5" />
                          </Link>
                        )}
                        <Link
                          href={`/administrator/blog/articulos/${post.id}`}
                          className="p-2 text-gray-400 hover:text-furgocasa-orange hover:bg-furgocasa-orange/10 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="h-5 w-5" />
                        </Link>
                        <button
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-600">Mostrando 1-{posts.length} de {posts.length} artículos</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50" disabled>Anterior</button>
            <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50" disabled>Siguiente</button>
          </div>
        </div>
      </div>
    </div>
  );
}
