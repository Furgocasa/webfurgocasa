"use client";

// ✅ Forzar renderizado dinámico (no pre-renderizar en build)
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
  AlertCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAdminData } from "@/hooks/use-admin-data";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

interface Post {
  id: string;
  title: string;
  slug: string;
  status: string;
  views: number;
  published_at: string | null;
  created_at: string;
  featured_image: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  author: {
    id: string;
    name: string;
  } | null;
}

const statusConfig: Record<string, { icon: typeof CheckCircle; bg: string; text: string; label: string }> = {
  draft: { icon: Clock, bg: "bg-gray-100", text: "text-gray-700", label: "Borrador" },
  pending: { icon: Clock, bg: "bg-yellow-100", text: "text-yellow-700", label: "Pendiente" },
  published: { icon: CheckCircle, bg: "bg-green-100", text: "text-green-700", label: "Publicado" },
  archived: { icon: XCircle, bg: "bg-red-100", text: "text-red-700", label: "Archivado" },
};

// Hook personalizado para ordenación de tablas
function useSortableData<T>(items: T[] | undefined, config?: { key: keyof T; direction: 'asc' | 'desc' }) {
  const [sortConfig, setSortConfig] = useState<{ key: keyof T; direction: 'asc' | 'desc' } | null>(config || null);

  const sortedItems = React.useMemo(() => {
    if (!items) return [];
    
    let sortableItems = [...items];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        // Manejar valores nulos/undefined
        if (aValue == null) return 1;
        if (bValue == null) return -1;

        // Convertir strings numéricos a números para comparación correcta
        const aNum = typeof aValue === 'string' ? parseFloat(aValue) : aValue;
        const bNum = typeof bValue === 'string' ? parseFloat(bValue) : bValue;

        if (!isNaN(aNum as number) && !isNaN(bNum as number)) {
          return sortConfig.direction === 'asc' 
            ? (aNum as number) - (bNum as number)
            : (bNum as number) - (aNum as number);
        }

        // Comparación de strings
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = (key: keyof T) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return { items: sortedItems, requestSort, sortConfig };
}

// Componente de encabezado de tabla ordenable
function SortableTableHeader<T>({ 
  label, 
  sortKey, 
  currentSort, 
  onSort,
  align = 'left'
}: { 
  label: string; 
  sortKey: keyof T; 
  currentSort: { key: keyof T; direction: 'asc' | 'desc' } | null;
  onSort: (key: keyof T) => void;
  align?: 'left' | 'center' | 'right';
}) {
  const isSorted = currentSort?.key === sortKey;
  const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
  
  return (
    <th 
      className={`px-6 py-4 ${alignClass} text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors select-none`}
      onClick={() => onSort(sortKey)}
    >
      <div className={`flex items-center gap-1 ${align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : ''}`}>
        {label}
        {isSorted ? (
          currentSort?.direction === 'asc' ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )
        ) : (
          <ArrowUpDown className="h-4 w-4 opacity-30" />
        )}
      </div>
    </th>
  );
}

export default function BlogPostsPage() {
  // Establecer título de la página
  useEffect(() => {
    document.title = "Admin - Blog | Furgocasa";
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string | null; title: string }>({
    isOpen: false,
    id: null,
    title: ''
  });

  // Cargar posts desde Supabase
  const { data: posts, loading, error, refetch } = useAdminData<Post[]>({
    queryFn: async () => {
      const supabase = createClient();
      const result = await supabase
        .from('posts')
        .select(`
          id,
          title,
          slug,
          status,
          views,
          published_at,
          created_at,
          featured_image,
          category:content_categories(id, name, slug),
          author:admins(id, name)
        `)
        .order('created_at', { ascending: false });
      
      // Transformar los datos para extraer el primer elemento de los arrays
      const transformedData = (result.data || []).map(post => ({
        ...post,
        category: Array.isArray(post.category) ? post.category[0] : post.category,
        author: Array.isArray(post.author) ? post.author[0] : post.author,
      }));

      return {
        data: transformedData as Post[],
        error: result.error
      };
    },
    retryCount: 3,
    retryDelay: 1000,
    initialDelay: 200,
  });

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDelete = (id: string, title: string) => {
    setDeleteConfirm({ isOpen: true, id, title });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', deleteConfirm.id);

      if (error) throw error;
      showMessage('success', 'Artículo eliminado correctamente');
      refetch();
    } catch (error: any) {
      console.error('Error deleting post:', error);
      showMessage('error', 'Error al eliminar el artículo');
    } finally {
      setDeleteConfirm({ isOpen: false, id: null, title: '' });
    }
  };

  // Filtrar posts
  const filteredPosts = (posts || []).filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || post.category?.id === categoryFilter;
    const matchesStatus = !statusFilter || post.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Ordenación de posts
  const sortedPosts = useSortableData(filteredPosts, { key: 'created_at', direction: 'desc' });

  // Calcular estadísticas
  const stats = {
    total: posts?.length || 0,
    published: (posts || []).filter(p => p.status === 'published').length,
    draft: (posts || []).filter(p => p.status === 'draft').length,
    pending: (posts || []).filter(p => p.status === 'pending').length,
    totalViews: (posts || []).reduce((sum, p) => sum + p.views, 0),
  };

  // Obtener categorías únicas
  const categories = Array.from(
    new Set((posts || []).filter(p => p.category).map(p => p.category!))
  ).reduce((acc, cat) => {
    if (!acc.find(c => c.id === cat.id)) {
      acc.push(cat);
    }
    return acc;
  }, [] as NonNullable<Post['category']>[]);
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

      {/* Message Alert */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <AlertCircle className="h-5 w-5" />
          {message.text}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Publicados", value: stats.published.toString(), color: "text-green-600" },
          { label: "Borradores", value: stats.draft.toString(), color: "text-gray-600" },
          { label: "Pendientes", value: stats.pending.toString(), color: "text-yellow-600" },
          { label: "Visitas totales", value: stats.totalViews >= 1000 ? `${(stats.totalViews / 1000).toFixed(1)}K` : stats.totalViews.toString(), color: "text-blue-600" },
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
            />
          </div>
          <select 
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <select 
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="published">Publicado</option>
            <option value="draft">Borrador</option>
            <option value="pending">Pendiente</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-furgocasa-orange mb-4"></div>
            <p>Cargando artículos...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-600">
            <AlertCircle className="h-12 w-12 mx-auto mb-4" />
            <p>Error al cargar los artículos</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No hay artículos</p>
            <p className="text-sm mt-1">
              {searchTerm || categoryFilter || statusFilter 
                ? 'No se encontraron artículos con los filtros aplicados' 
                : 'Crea tu primer artículo para comenzar'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <SortableTableHeader<Post> label="Artículo" sortKey="title" currentSort={sortedPosts.sortConfig} onSort={sortedPosts.requestSort} />
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Categoría</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Autor</th>
                    <SortableTableHeader<Post> label="Estado" sortKey="status" currentSort={sortedPosts.sortConfig} onSort={sortedPosts.requestSort} align="center" />
                    <SortableTableHeader<Post> label="Visitas" sortKey="views" currentSort={sortedPosts.sortConfig} onSort={sortedPosts.requestSort} align="center" />
                    <SortableTableHeader<Post> label="Fecha" sortKey="created_at" currentSort={sortedPosts.sortConfig} onSort={sortedPosts.requestSort} />
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedPosts.items.map((post) => {
                    const StatusIcon = statusConfig[post.status]?.icon || Clock;
                    const statusStyle = statusConfig[post.status] || statusConfig.draft;
                    return (
                      <tr key={post.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                              {post.featured_image ? (
                                <Image
                                  src={post.featured_image}
                                  alt={post.title}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                  unoptimized
                                />
                              ) : (
                                <FileText className="h-6 w-6 text-gray-400" />
                              )}
                            </div>
                            <div className="max-w-md">
                              <p className="font-medium text-gray-900 truncate">{post.title}</p>
                              <p className="text-sm text-gray-500 truncate">/{post.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {post.category ? (
                            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                              {post.category.name}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">Sin categoría</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {post.author?.name || 'Sin autor'}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                            <StatusIcon className="h-3 w-3" />
                            {statusStyle.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center text-gray-600">
                          {post.views.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm">
                          {post.published_at 
                            ? new Date(post.published_at).toLocaleDateString('es-ES')
                            : new Date(post.created_at).toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {post.status === "published" && post.category && (
                              <Link
                                href={`/blog/${post.category.slug}/${post.slug}`}
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
                              onClick={() => handleDelete(post.id, post.title)}
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
              <p className="text-sm text-gray-600">
                Mostrando {filteredPosts.length} de {stats.total} artículos
              </p>
            </div>
          </>
        )}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null, title: '' })}
        onConfirm={confirmDelete}
        title="¿Eliminar artículo?"
        message={`¿Estás seguro de que quieres eliminar "${deleteConfirm.title}"? Esta acción no se puede deshacer.`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
}
