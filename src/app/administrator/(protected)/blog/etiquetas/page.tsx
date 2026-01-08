"use client";

import { useState, useEffect } from "react";
import supabase from "@/lib/supabase/client";
import { Plus, Edit, Trash2, Save, X, Tag, AlertCircle } from "lucide-react";

interface ContentTag {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  sort_order: number;
}

export default function BlogEtiquetasPage() {
  const [tags, setTags] = useState<ContentTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    color: '#3B82F6',
  });

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('content_tags')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setTags(data || []);
    } catch (error: any) {
      console.error('Error loading tags:', error);
      showMessage('error', 'Error al cargar las etiquetas');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      showMessage('error', 'El nombre es obligatorio');
      return;
    }

    try {
      setSaving(true);
      const slug = formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      const dataToSave = {
        name: formData.name,
        slug: slug,
        color: formData.color,
      };

      if (editingId) {
        const { data, error } = await supabase
          .from('content_tags')
          .update(dataToSave)
          .eq('id', editingId)
          .select('id');

        if (error) throw error;
        if (!data || data.length === 0) {
          throw new Error('No se pudo actualizar la etiqueta (permisos insuficientes o el registro ya no existe).');
        }
        showMessage('success', 'Etiqueta actualizada correctamente');
      } else {
        const { data, error } = await supabase
          .from('content_tags')
          .insert(dataToSave)
          .select('id');

        if (error) throw error;
        if (!data || data.length === 0) {
          throw new Error('No se pudo crear la etiqueta (permisos insuficientes).');
        }
        showMessage('success', 'Etiqueta creada correctamente');
      }

      resetForm();
      loadTags();
    } catch (error: any) {
      console.error('Error saving tag:', error);
      showMessage('error', 'Error al guardar la etiqueta');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (tag: ContentTag) => {
    setFormData({
      name: tag.name,
      color: tag.color || '#3B82F6',
    });
    setEditingId(tag.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta etiqueta?')) return;

    try {
      const { data, error } = await supabase
        .from('content_tags')
        .delete()
        .eq('id', id)
        .select('id');

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No se pudo eliminar la etiqueta (permisos insuficientes o el registro ya no existe).');
      }
      showMessage('success', 'Etiqueta eliminada correctamente');
      loadTags();
    } catch (error: any) {
      console.error('Error deleting tag:', error);
      showMessage('error', 'Error al eliminar la etiqueta');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', color: '#3B82F6' });
    setEditingId(null);
    setShowAddForm(false);
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Etiquetas del Blog</h1>
          <p className="text-gray-600 mt-1">Etiqueta y clasifica tus artículos</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)} 
          className="btn-primary flex items-center gap-2"
        >
          {showAddForm ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          {showAddForm ? 'Cancelar' : 'Añadir etiqueta'}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <AlertCircle className="h-5 w-5" />
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <p className="text-sm text-gray-500">Total de etiquetas: <span className="font-bold text-gray-900">{tags.length}</span></p>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {editingId ? 'Editar Etiqueta' : 'Nueva Etiqueta'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                  required
                  placeholder="Ej: Consejos"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="h-10 w-20 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear etiqueta'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Cargando etiquetas...</div>
        ) : tags.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Tag className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No hay etiquetas disponibles</p>
            <p className="text-sm mt-1">Crea tu primera etiqueta para clasificar el contenido</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex flex-wrap gap-3">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="group relative inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
                  style={{ backgroundColor: `${tag.color}15` }}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: tag.color || '#3B82F6' }}
                  />
                  <span className="font-medium text-gray-900">{tag.name}</span>
                  <span className="text-xs text-gray-500">/{tag.slug}</span>
                  
                  <div className="hidden group-hover:flex absolute -top-2 -right-2 gap-1">
                    <button
                      onClick={() => handleEdit(tag)}
                      className="p-1.5 bg-furgocasa-orange text-white rounded-full shadow-lg hover:bg-furgocasa-orange-dark"
                      title="Editar"
                    >
                      <Edit className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleDelete(tag.id)}
                      className="p-1.5 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700"
                      title="Eliminar"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

