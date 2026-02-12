"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Save, 
  X, 
  CheckCircle,
  Loader2,
  GripVertical,
  Star,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { EquipmentIcon } from "@/components/vehicle/equipment-display";
import { useAdminData } from "@/hooks/use-admin-data";

// Lista de iconos disponibles
const AVAILABLE_ICONS = [
  "UtensilsCrossed", "Bath", "Refrigerator", "ThermometerSun", "Sun", "Battery",
  "Zap", "Plug", "Tent", "Bike", "ArrowUpFromLine", "Package", "Radio", "Tv",
  "Wifi", "Camera", "CircleDot", "Gauge", "Snowflake", "Droplets", "Droplet",
  "ShowerHead", "Flame", "RotateCcw", "Table", "DoorOpen", "Lightbulb", "Usb",
  "Layers", "Grid3X3", "CloudSun", "CheckCircle", "Baby"
];

const CATEGORIES = [
  { value: "confort", label: "Confort", color: "bg-blue-100 text-blue-700" },
  { value: "energia", label: "Energía", color: "bg-yellow-100 text-yellow-700" },
  { value: "exterior", label: "Exterior", color: "bg-green-100 text-green-700" },
  { value: "multimedia", label: "Multimedia", color: "bg-purple-100 text-purple-700" },
  { value: "seguridad", label: "Conducción", color: "bg-red-100 text-red-700" },
  { value: "agua", label: "Agua", color: "bg-cyan-100 text-cyan-700" },
  { value: "general", label: "General", color: "bg-gray-100 text-gray-700" },
];

interface Equipment {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  category: string | null;
  is_active: boolean | null;
  is_standard: boolean | null;
  sort_order: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface EquipmentForm {
  name: string;
  slug: string;
  description: string;
  icon: string;
  category: string;
  is_active: boolean;
  is_standard: boolean;
}

const defaultForm: EquipmentForm = {
  name: "",
  slug: "",
  description: "",
  icon: "CheckCircle",
  category: "general",
  is_active: true,
  is_standard: false,
};

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function EquipamientoPage() {
  // Establecer título de la página
  useEffect(() => {
    document.title = "Admin - Equipamiento | Furgocasa";
  }, []);

  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<EquipmentForm>(defaultForm);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Usar el hook para cargar datos con retry automático
  const { data: equipment, loading, error, refetch } = useAdminData<Equipment[]>({
    queryKey: ['equipment'], // Identificador único para caché
    queryFn: async () => {
      const supabase = createClient();
      const result = await supabase
        .from("equipment")
        .select("*")
        .order("sort_order", { ascending: true });
      
      return {
        data: (result.data || []) as Equipment[],
        error: result.error
      };
    },
    retryCount: 3,
    retryDelay: 1000,
    initialDelay: 200,
    staleTime: 1000 * 60 * 60, // 1 hora - el equipamiento casi nunca cambia
  });

  const loadEquipment = () => {
    refetch();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }

    try {
      setSaving(true);
      const supabase = createClient();
      const slug = form.slug || generateSlug(form.name);
      
      if (editingId) {
        // Actualizar
        const { error } = await supabase
          .from("equipment")
          .update({
            name: form.name,
            slug,
            description: form.description || null,
            icon: form.icon,
            category: form.category,
            is_active: form.is_active,
            is_standard: form.is_standard,
          })
          .eq("id", editingId);

        if (error) throw error;
        toast.success("Equipamiento actualizado");
      } else {
        // Crear nuevo
        const maxOrder = (equipment || []).length > 0 
          ? Math.max(...(equipment || []).map(e => e.sort_order ?? 0)) + 1 
          : 0;

        const { error } = await supabase
          .from("equipment")
          .insert({
            name: form.name,
            slug,
            description: form.description || null,
            icon: form.icon,
            category: form.category,
            is_active: form.is_active,
            is_standard: form.is_standard,
            sort_order: maxOrder,
          });

        if (error) throw error;
        toast.success("Equipamiento creado");
      }

      setForm(defaultForm);
      setEditingId(null);
      setShowForm(false);
      loadEquipment();
    } catch (error: any) {
      console.error("Error saving equipment:", error);
      if (error.code === "23505") {
        toast.error("Ya existe un equipamiento con ese slug");
      } else {
        toast.error("Error al guardar");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (eq: Equipment) => {
    setForm({
      name: eq.name,
      slug: eq.slug,
      description: eq.description || "",
      icon: eq.icon,
      category: eq.category || "general",
      is_active: eq.is_active ?? true,
      is_standard: eq.is_standard ?? false,
    });
    setEditingId(eq.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este equipamiento? Se quitará de todos los vehículos.")) {
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("equipment")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Equipamiento eliminado");
      loadEquipment();
    } catch (error) {
      console.error("Error deleting equipment:", error);
      toast.error("Error al eliminar");
    }
  };

  const handleToggleActive = async (eq: Equipment) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("equipment")
        .update({ is_active: !eq.is_active })
        .eq("id", eq.id);

      if (error) throw error;
      loadEquipment();
    } catch (error) {
      console.error("Error toggling active:", error);
      toast.error("Error al actualizar");
    }
  };

  const handleToggleStandard = async (eq: Equipment) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("equipment")
        .update({ is_standard: !eq.is_standard })
        .eq("id", eq.id);

      if (error) throw error;
      toast.success(eq.is_standard ? "Ya no es estándar" : "Marcado como estándar");
      loadEquipment();
    } catch (error) {
      console.error("Error toggling standard:", error);
      toast.error("Error al actualizar");
    }
  };

  const cancelForm = () => {
    setForm(defaultForm);
    setEditingId(null);
    setShowForm(false);
  };

  const filteredEquipment = filterCategory === "all" 
    ? (equipment || [])
    : (equipment || []).filter(eq => eq.category === filterCategory);

  const getCategoryInfo = (category: string) => {
    return CATEGORIES.find(c => c.value === category) || CATEGORIES[CATEGORIES.length - 1];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-furgocasa-orange" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Equipamiento</h1>
          <p className="text-gray-600 mt-1">
            Gestiona los equipamientos disponibles para los vehículos
          </p>
        </div>
        <button
          onClick={() => {
            setForm(defaultForm);
            setEditingId(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-furgocasa-orange text-white px-4 py-2 rounded-lg hover:bg-furgocasa-orange-dark transition-colors"
        >
          <Plus className="h-5 w-5" />
          Nuevo equipamiento
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            {editingId ? "Editar equipamiento" : "Nuevo equipamiento"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => {
                    setForm({ 
                      ...form, 
                      name: e.target.value,
                      slug: editingId ? form.slug : generateSlug(e.target.value)
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                  placeholder="Ej: Calefacción Webasto"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                  placeholder="calefaccion-webasto"
                />
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Icono */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icono
                </label>
                <div className="flex gap-2">
                  <select
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                  >
                    {AVAILABLE_ICONS.map(icon => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                  <div className="px-3 py-2 bg-gray-100 rounded-lg flex items-center">
                    <EquipmentIcon iconName={form.icon} className="h-5 w-5 text-gray-600" />
                  </div>
                </div>
              </div>

              {/* Descripción */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                  placeholder="Descripción opcional para el tooltip"
                />
              </div>

              {/* Checkboxes */}
              <div className="md:col-span-2 flex flex-wrap gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="w-4 h-4 text-furgocasa-orange rounded focus:ring-furgocasa-orange"
                  />
                  <span className="text-sm text-gray-700">Activo</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_standard}
                    onChange={(e) => setForm({ ...form, is_standard: e.target.checked })}
                    className="w-4 h-4 text-furgocasa-orange rounded focus:ring-furgocasa-orange"
                  />
                  <span className="text-sm text-gray-700">Estándar en todas las campers</span>
                </label>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-furgocasa-orange text-white px-4 py-2 rounded-lg hover:bg-furgocasa-orange-dark transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {editingId ? "Guardar cambios" : "Crear equipamiento"}
              </button>
              <button
                type="button"
                onClick={cancelForm}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X className="h-4 w-4" />
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filtro por categoría */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterCategory("all")}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            filterCategory === "all" 
              ? "bg-gray-900 text-white" 
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Todos ({(equipment || []).length})
        </button>
        {CATEGORIES.map(cat => {
          const count = (equipment || []).filter(eq => eq.category === cat.value).length;
          if (count === 0) return null;
          return (
            <button
              key={cat.value}
              onClick={() => setFilterCategory(cat.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filterCategory === cat.value 
                  ? cat.color.replace("100", "500").replace("700", "white") + " text-white"
                  : cat.color + " hover:opacity-80"
              }`}
            >
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Lista de equipamientos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Equipamiento</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Categoría</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">Estándar</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">Activo</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredEquipment.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-500">
                  No hay equipamientos en esta categoría
                </td>
              </tr>
            ) : (
              filteredEquipment.map((eq) => {
                const catInfo = getCategoryInfo(eq.category || "general");
                return (
                  <tr key={eq.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${catInfo.color.split(" ")[0]}`}>
                          <EquipmentIcon iconName={eq.icon} className={`h-5 w-5 ${catInfo.color.split(" ")[1]}`} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{eq.name}</p>
                          {eq.description && (
                            <p className="text-xs text-gray-500">{eq.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${catInfo.color}`}>
                        {catInfo.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleStandard(eq)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          eq.is_standard 
                            ? "bg-yellow-100 text-yellow-600" 
                            : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                        }`}
                        title={eq.is_standard ? "Quitar de estándar" : "Marcar como estándar"}
                      >
                        <Star className={`h-4 w-4 ${eq.is_standard ? "fill-current" : ""}`} />
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleActive(eq)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          eq.is_active 
                            ? "bg-green-100 text-green-600" 
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(eq)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(eq.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Info */}
      <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
        <p>
          <strong>Estándar:</strong> Los equipamientos marcados como estándar aparecerán pre-seleccionados al crear nuevos vehículos.
          Puedes personalizar qué equipamientos tiene cada vehículo desde su ficha de edición.
        </p>
      </div>
    </div>
  );
}
