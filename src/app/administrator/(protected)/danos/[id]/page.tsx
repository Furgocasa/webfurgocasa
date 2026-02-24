"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Plus, 
  Save, 
  X, 
  Trash2, 
  Edit2,
  Car,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  Camera,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { VehicleDamagePlan, type DamageMark } from "@/components/admin/vehicle-damage-plan";
import { DamageReportPDF } from "@/components/admin/damage-report-pdf";
import { createClient } from "@/lib/supabase/client";

interface VehicleDamage {
  id: string;
  damage_number: number | null;
  description: string;
  damage_type: string | null;
  view_type: string | null;
  position_x: number | null;
  position_y: number | null;
  status: string | null;
  severity: string | null;
  notes: string | null;
  repair_cost: number | null;
  reported_date: string | null;
  repaired_date: string | null;
  photo_urls: string[] | null;
  created_at: string | null;
}

interface Vehicle {
  id: string;
  name: string;
  brand: string | null;
  model: string | null;
  internal_code: string | null;
  main_image_url: string | null;
}

type ViewType = 'front' | 'back' | 'left' | 'right' | 'top' | 'interior';

const viewTypes: { id: ViewType; label: string; category: 'exterior' | 'interior' }[] = [
  { id: 'front', label: 'Frontal', category: 'exterior' },
  { id: 'back', label: 'Trasera', category: 'exterior' },
  { id: 'left', label: 'Lateral Izq.', category: 'exterior' },
  { id: 'right', label: 'Lateral Der.', category: 'exterior' },
  { id: 'top', label: 'Superior', category: 'exterior' },
  { id: 'interior', label: 'Interior', category: 'interior' },
];

const severityOptions = [
  { value: 'minor', label: 'Menor', color: 'text-yellow-600 bg-yellow-100' },
  { value: 'moderate', label: 'Moderado', color: 'text-orange-600 bg-orange-100' },
  { value: 'severe', label: 'Severo', color: 'text-red-600 bg-red-100' },
];

const statusOptions = [
  { value: 'pending', label: 'Pendiente', color: 'text-red-600 bg-red-100' },
  { value: 'in_progress', label: 'En reparación', color: 'text-yellow-600 bg-yellow-100' },
  { value: 'repaired', label: 'Reparado', color: 'text-green-600 bg-green-100' },
];

export default function VehicleDamageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vehicleId = params.id as string;

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [damages, setDamages] = useState<VehicleDamage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // UI State
  const [activeTab, setActiveTab] = useState<'exterior' | 'interior'>('exterior');
  const [activeView, setActiveView] = useState<ViewType>('front');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDamage, setSelectedDamage] = useState<VehicleDamage | null>(null);
  const [showDamageForm, setShowDamageForm] = useState(false);
  const [exteriorListOpen, setExteriorListOpen] = useState(false);
  const [interiorListOpen, setInteriorListOpen] = useState(false);

  // New damage form
  const [newDamagePosition, setNewDamagePosition] = useState<{ x: number; y: number } | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    severity: 'minor',
    status: 'pending',
    notes: '',
    repair_cost: '',
    reported_date: new Date().toISOString().split('T')[0],
  });

  // Load vehicle and damages
  const loadData = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    try {
      // Load vehicle
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('vehicles')
        .select('id, name, brand, model, internal_code, main_image_url')
        .eq('id', vehicleId)
        .single();

      if (vehicleError) throw vehicleError;
      setVehicle(vehicleData);

      // Load damages
      const { data: damagesData, error: damagesError } = await supabase
        .from('vehicle_damages')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('damage_number', { ascending: true });

      if (damagesError) throw damagesError;
      setDamages(damagesData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Numeración independiente por tipo (exterior: 1,2,3... / interior: 1,2,3...)
  const damageDisplayNumbers = useMemo(() => {
    const map = new Map<string, number>();
    let extCounter = 0;
    let intCounter = 0;
    const sorted = [...damages].sort((a, b) => (a.damage_number || 0) - (b.damage_number || 0));
    for (const d of sorted) {
      if (d.damage_type === 'interior') {
        intCounter++;
        map.set(d.id, intCounter);
      } else {
        extCounter++;
        map.set(d.id, extCounter);
      }
    }
    return map;
  }, [damages]);

  // Filter damages by current view - EXCLUIR reparados de los marcadores visuales
  const currentViewDamages = useMemo(() => {
    return damages
      .filter(d => d.view_type === activeView && d.status !== 'repaired')
      .map(d => ({
        id: d.id,
        damage_number: damageDisplayNumbers.get(d.id) || 0,
        position_x: d.position_x || 50,
        position_y: d.position_y || 50,
        description: d.description,
        severity: d.severity,
        status: d.status,
      }));
  }, [damages, activeView, damageDisplayNumbers]);

  // Daños activos (no reparados) para contar en las pestañas
  const activeDamages = useMemo(() => {
    return damages.filter(d => d.status !== 'repaired');
  }, [damages]);

  // Stats - Pestañas muestran solo daños activos, historial muestra reparados
  const stats = useMemo(() => {
    const activeExterior = activeDamages.filter(d => d.damage_type === 'exterior');
    const activeInterior = activeDamages.filter(d => d.damage_type === 'interior');
    const pending = damages.filter(d => d.status === 'pending' || d.status === 'in_progress');
    const repaired = damages.filter(d => d.status === 'repaired');
    
    return {
      total: damages.length,
      active: activeDamages.length,
      exterior: activeExterior.length,  // Solo activos en pestañas
      interior: activeInterior.length,  // Solo activos en pestañas
      pending: pending.length,
      repaired: repaired.length,
    };
  }, [damages, activeDamages]);

  // Handle add damage click on plan
  const handleAddDamage = useCallback((x: number, y: number) => {
    const category = viewTypes.find(v => v.id === activeView)?.category || 'exterior';
    setNewDamagePosition({ x, y });
    setFormData({
      description: '',
      severity: 'minor',
      status: 'pending',
      notes: '',
      repair_cost: '',
      reported_date: new Date().toISOString().split('T')[0],
    });
    setSelectedDamage(null);
    setShowDamageForm(true);
  }, [activeView]);

  // Handle select existing damage
  const handleSelectDamage = useCallback((damage: DamageMark) => {
    const fullDamage = damages.find(d => d.id === damage.id);
    if (fullDamage) {
      setSelectedDamage(fullDamage);
      setFormData({
        description: fullDamage.description || '',
        severity: fullDamage.severity || 'minor',
        status: fullDamage.status || 'pending',
        notes: fullDamage.notes || '',
        repair_cost: fullDamage.repair_cost?.toString() || '',
        reported_date: fullDamage.reported_date || new Date().toISOString().split('T')[0],
      });
      setNewDamagePosition(null);
      setShowDamageForm(true);
    }
  }, [damages]);

  // Save damage
  const handleSaveDamage = async () => {
    setSaving(true);
    const supabase = createClient();

    try {
      const category = viewTypes.find(v => v.id === activeView)?.category || 'exterior';
      
      if (selectedDamage) {
        // Update existing damage
        const { error } = await supabase
          .from('vehicle_damages')
          .update({
            description: formData.description,
            severity: formData.severity,
            status: formData.status,
            notes: formData.notes || null,
            repair_cost: formData.repair_cost ? parseFloat(formData.repair_cost) : null,
            reported_date: formData.reported_date || null,
            repaired_date: formData.status === 'repaired' ? new Date().toISOString().split('T')[0] : null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedDamage.id);

        if (error) throw error;
      } else if (newDamagePosition) {
        // Calcular siguiente damage_number para este tipo (exterior o interior por separado)
        const sameTypeDamages = damages.filter(d => d.damage_type === category);
        const maxNumber = sameTypeDamages.reduce((max, d) => Math.max(max, d.damage_number || 0), 0);
        const nextNumber = maxNumber + 1;

        const { error } = await supabase
          .from('vehicle_damages')
          .insert({
            vehicle_id: vehicleId,
            damage_number: nextNumber,
            description: formData.description,
            damage_type: category,
            view_type: activeView,
            position_x: newDamagePosition.x,
            position_y: newDamagePosition.y,
            severity: formData.severity,
            status: formData.status,
            notes: formData.notes || null,
            repair_cost: formData.repair_cost ? parseFloat(formData.repair_cost) : null,
            reported_date: formData.reported_date || null,
          });

        if (error) throw error;
      }

      // Reload damages
      await loadData();
      setShowDamageForm(false);
      setSelectedDamage(null);
      setNewDamagePosition(null);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving damage:', error);
      alert('Error al guardar el daño');
    } finally {
      setSaving(false);
    }
  };

  // Delete damage
  const handleDeleteDamage = async () => {
    if (!selectedDamage) return;
    if (!confirm('¿Estás seguro de que quieres eliminar este daño?')) return;

    setSaving(true);
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from('vehicle_damages')
        .delete()
        .eq('id', selectedDamage.id);

      if (error) throw error;

      await loadData();
      setShowDamageForm(false);
      setSelectedDamage(null);
    } catch (error) {
      console.error('Error deleting damage:', error);
      alert('Error al eliminar el daño');
    } finally {
      setSaving(false);
    }
  };

  // Change active view when tab changes
  useEffect(() => {
    const firstView = viewTypes.find(v => v.category === activeTab);
    if (firstView) {
      setActiveView(firstView.id);
    }
  }, [activeTab]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-furgocasa-orange mb-4" />
          <p className="text-gray-500">Cargando hoja de daños...</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Car className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium text-gray-500">Vehículo no encontrado</p>
          <Link href="/administrator/danos" className="text-furgocasa-orange hover:underline mt-2 inline-block">
            Volver al listado
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 min-w-0">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Link 
            href="/administrator/danos" 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {vehicle.internal_code && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold bg-blue-100 text-blue-800 flex-shrink-0">
                  {vehicle.internal_code}
                </span>
              )}
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{vehicle.name}</h1>
            </div>
            <p className="text-sm text-gray-600 truncate">
              {vehicle.brand} {vehicle.model} · Hoja de daños
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button 
            onClick={loadData}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Actualizar"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <DamageReportPDF vehicle={vehicle} damages={damages} />
          {/* Botón de edición solo visible en desktop */}
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
              isEditing 
                ? 'bg-furgocasa-orange text-white' 
                : 'border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {isEditing ? (
              <>
                <CheckCircle className="h-4 w-4" />
                <span>Editando</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span>Editar</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total daños</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Exteriores</p>
          <p className="text-2xl font-bold text-orange-600">{stats.exterior}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Interiores</p>
          <p className="text-2xl font-bold text-blue-600">{stats.interior}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Pendientes</p>
          <p className="text-2xl font-bold text-red-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Reparados</p>
          <p className="text-2xl font-bold text-green-600">{stats.repaired}</p>
        </div>
      </div>

      {/* Main content */}
      <div className="grid lg:grid-cols-3 gap-6 min-w-0">
        {/* Vehicle Plan - 2 columns */}
        <div className="lg:col-span-2 space-y-4 min-w-0 overflow-hidden">
          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex border-b border-gray-100">
              <button
                onClick={() => setActiveTab('exterior')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'exterior'
                    ? 'bg-furgocasa-orange text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <Car className="h-4 w-4" />
                  Exterior ({stats.exterior})
                </span>
              </button>
              <button
                onClick={() => setActiveTab('interior')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'interior'
                    ? 'bg-furgocasa-orange text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Interior ({stats.interior})
                </span>
              </button>
            </div>

            {/* View selector - Grid adaptable */}
            <div className="p-2 bg-gray-50">
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1">
                {viewTypes
                  .filter(v => v.category === activeTab)
                  .map(view => (
                    <button
                      key={view.id}
                      onClick={() => setActiveView(view.id)}
                      className={`px-2 py-1.5 text-xs font-medium rounded-lg transition-all text-center ${
                        activeView === view.id
                          ? 'bg-furgocasa-blue text-white shadow-sm'
                          : 'bg-white border border-gray-200 text-gray-600 hover:border-furgocasa-blue'
                      }`}
                    >
                      {view.label}
                    </button>
                  ))}
              </div>
            </div>
          </div>

          {/* Edit Mode Button - Compacto para móvil */}
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className={`w-full rounded-xl shadow-sm border p-3 flex items-center gap-3 transition-all ${
              isEditing 
                ? 'bg-orange-50 border-furgocasa-orange/40' 
                : 'bg-white border-gray-100 hover:border-gray-200'
            }`}
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
              isEditing 
                ? 'bg-furgocasa-orange text-white' 
                : 'bg-gray-100 text-gray-500'
            }`}>
              {isEditing ? <Edit2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className={`text-sm font-medium truncate ${isEditing ? 'text-furgocasa-orange' : 'text-gray-900'}`}>
                {isEditing ? 'Toca en el plano para marcar' : 'Añadir daños al vehículo'}
              </p>
              {isEditing && (
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  Modo edición activo
                </p>
              )}
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
              isEditing ? 'bg-green-500 text-white' : 'bg-furgocasa-orange text-white'
            }`}>
              {isEditing ? 'Listo' : 'Editar'}
            </span>
          </button>

          {/* Vehicle Plan with navigation arrows */}
          {(() => {
            const currentViews = viewTypes.filter(v => v.category === activeTab);
            const currentIdx = currentViews.findIndex(v => v.id === activeView);
            const hasPrev = currentIdx > 0;
            const hasNext = currentIdx < currentViews.length - 1;
            return (
              <div className="relative group">
                {hasPrev && (
                  <button
                    onClick={() => setActiveView(currentViews[currentIdx - 1].id)}
                    className="absolute left-1 top-1/2 -translate-y-1/2 z-10 bg-furgocasa-blue hover:bg-furgocasa-blue/90 shadow-md rounded-full p-1.5 transition-opacity opacity-80 group-hover:opacity-100"
                    title={currentViews[currentIdx - 1].label}
                  >
                    <ChevronLeft className="h-5 w-5 text-white" />
                  </button>
                )}
                <VehicleDamagePlan
                  viewType={activeView}
                  damages={currentViewDamages}
                  onAddDamage={isEditing ? handleAddDamage : undefined}
                  onSelectDamage={handleSelectDamage}
                  selectedDamageId={selectedDamage?.id}
                  isEditing={isEditing}
                />
                {hasNext && (
                  <button
                    onClick={() => setActiveView(currentViews[currentIdx + 1].id)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 z-10 bg-furgocasa-blue hover:bg-furgocasa-blue/90 shadow-md rounded-full p-1.5 transition-opacity opacity-80 group-hover:opacity-100"
                    title={currentViews[currentIdx + 1].label}
                  >
                    <ChevronRight className="h-5 w-5 text-white" />
                  </button>
                )}
              </div>
            );
          })()}

          {/* Legend */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500 mb-3">Leyenda de estados:</p>
            <div className="flex flex-wrap gap-4 text-sm">
              {statusOptions.map(status => (
                <div key={status.value} className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded-full ${status.color.replace('text-', 'bg-').replace('-600', '-500')}`} />
                  <span className="text-gray-600">{status.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Damage List - accordion en móvil, abierto en desktop */}
        <div className="space-y-3">
          {damages.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 text-center">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-300" />
                <p className="text-gray-500">Sin daños registrados</p>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="mt-4 text-furgocasa-orange hover:underline text-sm"
                  >
                    Añadir primer daño
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* DAÑOS EXTERIORES */}
              {damages.filter(d => d.damage_type !== 'interior').length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <button
                    className="w-full px-4 py-3 border-b border-gray-100 bg-orange-50 flex items-center justify-between lg:cursor-default"
                    onClick={() => setExteriorListOpen(prev => !prev)}
                  >
                    <h3 className="font-medium text-gray-900">
                      Daños Exteriores <span className="text-orange-600">({damages.filter(d => d.damage_type !== 'interior').length})</span>
                    </h3>
                    <span className="lg:hidden">
                      {exteriorListOpen ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                    </span>
                  </button>
                  <div className={`max-h-[350px] overflow-y-auto ${exteriorListOpen ? '' : 'hidden'} lg:!block`}>
                    <ul className="divide-y divide-gray-100">
                      {damages.filter(d => d.damage_type !== 'interior').map((damage) => {
                        const statusColor = statusOptions.find(s => s.value === damage.status)?.color || 'text-gray-600 bg-gray-100';
                        const severityColor = severityOptions.find(s => s.value === damage.severity)?.color || 'text-gray-600 bg-gray-100';
                        const viewLabel = viewTypes.find(v => v.id === damage.view_type)?.label || damage.view_type;
                        const displayNum = damageDisplayNumbers.get(damage.id) || '?';
                        
                        return (
                          <li 
                            key={damage.id}
                            className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                              selectedDamage?.id === damage.id ? 'bg-orange-50 border-l-4 border-furgocasa-orange' : ''
                            }`}
                            onClick={() => {
                              const view = viewTypes.find(v => v.id === damage.view_type);
                              if (view) {
                                setActiveTab(view.category);
                                setActiveView(view.id);
                              }
                              handleSelectDamage({
                                id: damage.id,
                                damage_number: damageDisplayNumbers.get(damage.id) || 0,
                                position_x: damage.position_x || 50,
                                position_y: damage.position_y || 50,
                                description: damage.description,
                                severity: damage.severity,
                                status: damage.status,
                              });
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                                damage.status === 'repaired' 
                                  ? 'bg-green-100 text-green-700 border-2 border-green-500' 
                                  : damage.status === 'in_progress'
                                    ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-500'
                                    : 'bg-red-100 text-red-700 border-2 border-red-500'
                              }`}>
                                {displayNum}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">{damage.description}</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  <span className={`px-2 py-0.5 text-xs rounded-full ${statusColor}`}>
                                    {statusOptions.find(s => s.value === damage.status)?.label || damage.status}
                                  </span>
                                  <span className={`px-2 py-0.5 text-xs rounded-full ${severityColor}`}>
                                    {severityOptions.find(s => s.value === damage.severity)?.label || damage.severity}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">{viewLabel}</p>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              )}

              {/* DAÑOS INTERIORES */}
              {damages.filter(d => d.damage_type === 'interior').length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <button
                    className="w-full px-4 py-3 border-b border-gray-100 bg-blue-50 flex items-center justify-between lg:cursor-default"
                    onClick={() => setInteriorListOpen(prev => !prev)}
                  >
                    <h3 className="font-medium text-gray-900">
                      Daños Interiores <span className="text-blue-600">({damages.filter(d => d.damage_type === 'interior').length})</span>
                    </h3>
                    <span className="lg:hidden">
                      {interiorListOpen ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                    </span>
                  </button>
                  <div className={`max-h-[350px] overflow-y-auto ${interiorListOpen ? '' : 'hidden'} lg:!block`}>
                    <ul className="divide-y divide-gray-100">
                      {damages.filter(d => d.damage_type === 'interior').map((damage) => {
                        const statusColor = statusOptions.find(s => s.value === damage.status)?.color || 'text-gray-600 bg-gray-100';
                        const severityColor = severityOptions.find(s => s.value === damage.severity)?.color || 'text-gray-600 bg-gray-100';
                        const viewLabel = viewTypes.find(v => v.id === damage.view_type)?.label || damage.view_type;
                        const displayNum = damageDisplayNumbers.get(damage.id) || '?';
                        
                        return (
                          <li 
                            key={damage.id}
                            className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                              selectedDamage?.id === damage.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                            }`}
                            onClick={() => {
                              const view = viewTypes.find(v => v.id === damage.view_type);
                              if (view) {
                                setActiveTab(view.category);
                                setActiveView(view.id);
                              }
                              handleSelectDamage({
                                id: damage.id,
                                damage_number: damageDisplayNumbers.get(damage.id) || 0,
                                position_x: damage.position_x || 50,
                                position_y: damage.position_y || 50,
                                description: damage.description,
                                severity: damage.severity,
                                status: damage.status,
                              });
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                                damage.status === 'repaired' 
                                  ? 'bg-green-100 text-green-700 border-2 border-green-500' 
                                  : damage.status === 'in_progress'
                                    ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-500'
                                    : 'bg-red-100 text-red-700 border-2 border-red-500'
                              }`}>
                                {displayNum}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">{damage.description}</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  <span className={`px-2 py-0.5 text-xs rounded-full ${statusColor}`}>
                                    {statusOptions.find(s => s.value === damage.status)?.label || damage.status}
                                  </span>
                                  <span className={`px-2 py-0.5 text-xs rounded-full ${severityColor}`}>
                                    {severityOptions.find(s => s.value === damage.severity)?.label || damage.severity}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">{viewLabel}</p>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Damage Form Modal */}
      {showDamageForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">
                {selectedDamage ? `Editar Daño #${damageDisplayNumbers.get(selectedDamage.id) || selectedDamage.damage_number} (${selectedDamage.damage_type === 'interior' ? 'Interior' : 'Exterior'})` : 'Nuevo Daño'}
              </h3>
              <button
                onClick={() => {
                  setShowDamageForm(false);
                  setSelectedDamage(null);
                  setNewDamagePosition(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción del daño *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                  rows={3}
                  placeholder="Ej: Rayón en el parachoques delantero"
                  required
                />
              </div>

              {/* Severity & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Severidad
                  </label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange"
                  >
                    {severityOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange"
                  >
                    {statusOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Repair Cost & Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Coste reparación (€)
                  </label>
                  <input
                    type="number"
                    value={formData.repair_cost}
                    onChange={(e) => setFormData({ ...formData, repair_cost: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha detección
                  </label>
                  <input
                    type="date"
                    value={formData.reported_date}
                    onChange={(e) => setFormData({ ...formData, reported_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas adicionales
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange"
                  rows={2}
                  placeholder="Notas sobre el daño o la reparación..."
                />
              </div>

              {/* Location info */}
              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                <p><strong>Ubicación:</strong> {viewTypes.find(v => v.id === activeView)?.label || activeView}</p>
                <p><strong>Tipo:</strong> {viewTypes.find(v => v.id === activeView)?.category === 'interior' ? 'Interior' : 'Exterior'}</p>
                {(newDamagePosition || selectedDamage) && (
                  <p><strong>Posición:</strong> X: {(newDamagePosition?.x || selectedDamage?.position_x || 0).toFixed(1)}%, Y: {(newDamagePosition?.y || selectedDamage?.position_y || 0).toFixed(1)}%</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <div>
                {selectedDamage && (
                  <button
                    onClick={handleDeleteDamage}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </button>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDamageForm(false);
                    setSelectedDamage(null);
                    setNewDamagePosition(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveDamage}
                  disabled={saving || !formData.description.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-furgocasa-orange text-white rounded-lg hover:bg-furgocasa-orange/90 transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
