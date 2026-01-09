"use client";

import { useState, useEffect } from "react";
import supabase from "@/lib/supabase/client";
import { Search, Trash2, CheckCircle, XCircle, Clock, MessageSquare, AlertCircle } from "lucide-react";
import type { Database } from "@/lib/supabase/database.types";

type CommentRow = Database['public']['Tables']['comments']['Row'];

interface Comment extends Omit<CommentRow, 'status'> {
  status: string;
  post?: {
    id: string;
    title: string;
    slug: string;
    category?: {
      slug: string;
    };
  };
}

const statusConfig: Record<string, { icon: typeof CheckCircle; bg: string; text: string; label: string }> = {
  pending: { icon: Clock, bg: "bg-yellow-100", text: "text-yellow-700", label: "Pendiente" },
  approved: { icon: CheckCircle, bg: "bg-green-100", text: "text-green-700", label: "Aprobado" },
  rejected: { icon: XCircle, bg: "bg-red-100", text: "text-red-700", label: "Rechazado" },
};

function formatDateTime(date: string): string {
  return new Date(date).toLocaleString("es-ES", { 
    day: "2-digit", 
    month: "short", 
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export default function BlogComentariosPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('comments')
        .select(`
          *,
          post:posts(id, title, slug, category:content_categories(slug))
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      // Transformar category anidado de array a objeto único
      const transformedComments = data?.map(comment => ({
        ...comment,
        status: comment.status || 'pending',
        post: comment.post ? {
          ...comment.post,
          category: Array.isArray(comment.post.category) ? comment.post.category[0] : comment.post.category
        } : comment.post
      })) || [];
      
      setComments(transformedComments);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching comments:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .update({ status: 'approved' })
        .eq('id', id)
        .select('id');

      if (error) throw error;
      if (!data || data.length === 0) throw new Error('No se pudo aprobar el comentario (permisos insuficientes o ya no existe).');
      showMessage('success', 'Comentario aprobado');
      loadComments();
    } catch (err: any) {
      showMessage('error', 'Error al aprobar comentario');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .update({ status: 'rejected' })
        .eq('id', id)
        .select('id');

      if (error) throw error;
      if (!data || data.length === 0) throw new Error('No se pudo rechazar el comentario (permisos insuficientes o ya no existe).');
      showMessage('success', 'Comentario rechazado');
      loadComments();
    } catch (err: any) {
      showMessage('error', 'Error al rechazar comentario');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este comentario?')) return;

    try {
      const { data, error } = await supabase
        .from('comments')
        .delete()
        .eq('id', id)
        .select('id');

      if (error) throw error;
      if (!data || data.length === 0) throw new Error('No se pudo eliminar el comentario (permisos insuficientes o ya no existe).');
      showMessage('success', 'Comentario eliminado');
      loadComments();
    } catch (err: any) {
      showMessage('error', 'Error al eliminar comentario');
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="p-12 text-center text-gray-500">Cargando comentarios...</div>
      </div>
    );
  }

  const pendingCount = comments.filter(c => c.status === 'pending').length;
  const approvedCount = comments.filter(c => c.status === 'approved').length;
  const rejectedCount = comments.filter(c => c.status === 'rejected').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Comentarios del Blog</h1>
          <p className="text-gray-600 mt-1">Modera los comentarios de tus artículos</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h2 className="text-red-800 font-semibold">Error al cargar comentarios</h2>
          <p className="text-red-600 text-sm mt-2">{error}</p>
        </div>
      )}

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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total comentarios</p>
          <p className="text-2xl font-bold text-gray-900">{comments.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Pendientes</p>
          <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Aprobados</p>
          <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Rechazados</p>
          <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar por autor, contenido..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent" 
            />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange">
            <option value="">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="approved">Aprobado</option>
            <option value="rejected">Rechazado</option>
          </select>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No hay comentarios</p>
            <p className="text-sm mt-1">Los comentarios aparecerán aquí cuando se publiquen</p>
          </div>
        ) : (
          comments.map((comment) => {
            const StatusIcon = statusConfig[comment.status]?.icon || Clock;
            const statusStyle = statusConfig[comment.status] || statusConfig.pending;

            return (
              <div key={comment.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                        {comment.author_name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{comment.author_name || 'Anónimo'}</p>
                        <p className="text-sm text-gray-500">{comment.author_email || 'Sin email'}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      En: <a href={`/blog/${comment.post?.category?.slug || 'general'}/${comment.post?.slug}`} className="text-furgocasa-orange hover:underline">
                        {comment.post?.title || 'Post eliminado'}
                      </a>
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                    <StatusIcon className="h-3 w-3" />
                    {statusStyle.label}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-gray-900">{comment.content}</p>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">{formatDateTime(comment.created_at || '')}</p>
                  <div className="flex gap-2">
                    {comment.status !== 'approved' && (
                      <button 
                        onClick={() => handleApprove(comment.id)}
                        className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm font-medium"
                      >
                        Aprobar
                      </button>
                    )}
                    {comment.status !== 'rejected' && (
                      <button 
                        onClick={() => handleReject(comment.id)}
                        className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium"
                      >
                        Rechazar
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(comment.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" 
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

