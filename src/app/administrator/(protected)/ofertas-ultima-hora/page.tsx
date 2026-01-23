"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Calendar, 
  Clock, 
  Percent, 
  Euro, 
  RefreshCw, 
  AlertCircle,
  Check,
  X,
  Eye,
  EyeOff,
  Truck,
  CalendarClock,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Database,
  Info
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface DetectedGap {
  vehicle_id: string;
  vehicle_name: string;
  vehicle_internal_code: string;
  gap_start_date: string;
  gap_end_date: string;
  gap_days: number;
  season_name: string;
  season_min_days: number;
  season_price_per_day: number;
  previous_booking_id: string;
  next_booking_id: string;
  already_exists: boolean;
}

interface LastMinuteOffer {
  id: string;
  vehicle_id: string;
  detected_start_date: string;
  detected_end_date: string;
  detected_days: number;
  offer_start_date: string;
  offer_end_date: string;
  offer_days: number;
  original_price_per_day: number;
  discount_percentage: number;
  final_price_per_day: number;
  status: 'detected' | 'published' | 'reserved' | 'expired' | 'ignored';
  admin_notes: string | null;
  detected_at: string;
  published_at: string | null;
  reserved_at: string | null;
  vehicle?: {
    name: string;
    internal_code: string;
    slug: string;
  };
}

export default function OfertasUltimaHoraPage() {
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [detectedGaps, setDetectedGaps] = useState<DetectedGap[]>([]);
  const [offers, setOffers] = useState<LastMinuteOffer[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedGap, setExpandedGap] = useState<string | null>(null);
  const [tableExists, setTableExists] = useState(true);
  
  // Estado para edición de oferta antes de publicar
  const [editingGap, setEditingGap] = useState<{
    gap: DetectedGap;
    startDate: string;
    endDate: string;
    discount: number;
    notes: string;
  } | null>(null);

  useEffect(() => {
    loadOffers();
  }, []);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const loadOffers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/last-minute-offers');
      const result = await response.json();
      
      if (result.error) {
        console.log('Error cargando ofertas:', result.error);
        setTableExists(false);
        setOffers([]);
        return;
      }
      
      setTableExists(true);
      setOffers(result.offers || []);
    } catch (error) {
      console.error('Error loading offers:', error);
      setTableExists(false);
    } finally {
      setLoading(false);
    }
  };

  const detectGaps = async () => {
    setDetecting(true);
    try {
      const response = await fetch('/api/admin/last-minute-offers/detect');
      const result = await response.json();
      
      if (result.error) {
        if (result.needsSetup) {
          showMessage('error', 'Debes ejecutar los SQL primero (07 y 08) en Supabase para crear las funciones.');
        } else {
          showMessage('error', result.error);
        }
        return;
      }
      
      // Filtrar los que ya existen
      const newGaps = (result.gaps || []).filter((g: DetectedGap) => !g.already_exists);
      setDetectedGaps(newGaps);
      
      if (newGaps.length === 0) {
        showMessage('success', 'No se encontraron nuevos huecos entre reservas');
      } else {
        showMessage('success', `Se encontraron ${newGaps.length} huecos potenciales`);
      }
    } catch (error) {
      console.error('Error detecting gaps:', error);
      showMessage('error', 'Error al detectar huecos. Verifica que las funciones SQL estén creadas.');
    } finally {
      setDetecting(false);
    }
  };

  const openEditGap = (gap: DetectedGap) => {
    setEditingGap({
      gap,
      startDate: gap.gap_start_date,
      endDate: gap.gap_end_date,
      discount: 15,
      notes: ''
    });
  };

  const publishOffer = async () => {
    if (!editingGap) return;
    
    try {
      const response = await fetch('/api/admin/last-minute-offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicle_id: editingGap.gap.vehicle_id,
          detected_start_date: editingGap.gap.gap_start_date,
          detected_end_date: editingGap.gap.gap_end_date,
          offer_start_date: editingGap.startDate,
          offer_end_date: editingGap.endDate,
          original_price_per_day: editingGap.gap.season_price_per_day,
          discount_percentage: editingGap.discount,
          previous_booking_id: editingGap.gap.previous_booking_id,
          next_booking_id: editingGap.gap.next_booking_id,
          admin_notes: editingGap.notes || null,
          status: 'published',
          published_at: new Date().toISOString()
        })
      });
      
      const result = await response.json();
      if (result.error) throw new Error(result.error);

      showMessage('success', 'Oferta publicada correctamente');
      setEditingGap(null);
      setDetectedGaps(prev => prev.filter(g => 
        g.vehicle_id !== editingGap.gap.vehicle_id || 
        g.gap_start_date !== editingGap.gap.gap_start_date
      ));
      loadOffers();
    } catch (error) {
      console.error('Error publishing offer:', error);
      showMessage('error', 'Error al publicar la oferta');
    }
  };

  const ignoreGap = (gap: DetectedGap) => {
    setDetectedGaps(prev => prev.filter(g => 
      g.vehicle_id !== gap.vehicle_id || 
      g.gap_start_date !== gap.gap_start_date
    ));
  };

  const updateOfferStatus = async (offerId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/last-minute-offers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: offerId, status: newStatus })
      });
      
      const result = await response.json();
      if (result.error) throw new Error(result.error);
      
      showMessage('success', `Estado actualizado a ${newStatus}`);
      loadOffers();
    } catch (error) {
      console.error('Error updating status:', error);
      showMessage('error', 'Error al actualizar estado');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      detected: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente' },
      published: { bg: 'bg-green-100', text: 'text-green-800', label: 'Publicada' },
      reserved: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Reservada' },
      expired: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Expirada' },
      ignored: { bg: 'bg-red-100', text: 'text-red-800', label: 'Ignorada' },
    };
    const badge = badges[status] || badges.detected;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const filteredOffers = filterStatus === 'all' 
    ? offers 
    : offers.filter(o => o.status === filterStatus);

  // Estadísticas
  const stats = {
    published: offers.filter(o => o.status === 'published').length,
    reserved: offers.filter(o => o.status === 'reserved').length,
    expired: offers.filter(o => o.status === 'expired').length,
    detected: detectedGaps.length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ofertas de Última Hora</h1>
          <p className="text-gray-600 mt-1">Detecta y gestiona huecos entre reservas</p>
        </div>
        <button
          onClick={detectGaps}
          disabled={detecting}
          className="flex items-center gap-2 px-4 py-2 bg-furgocasa-orange text-white rounded-lg hover:bg-furgocasa-orange-dark transition-colors disabled:opacity-50"
        >
          <Search className={`h-5 w-5 ${detecting ? 'animate-spin' : ''}`} />
          {detecting ? 'Buscando...' : 'Detectar Huecos'}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.type === 'success' ? <Check className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          {message.text}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
          <div className="flex items-center gap-2 text-yellow-600 mb-1">
            <Search className="h-4 w-4" />
            <span className="text-sm font-medium">Detectados</span>
          </div>
          <p className="text-2xl font-bold text-yellow-700">{stats.detected}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <Eye className="h-4 w-4" />
            <span className="text-sm font-medium">Publicadas</span>
          </div>
          <p className="text-2xl font-bold text-green-700">{stats.published}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Check className="h-4 w-4" />
            <span className="text-sm font-medium">Reservadas</span>
          </div>
          <p className="text-2xl font-bold text-blue-700">{stats.reserved}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">Expiradas</span>
          </div>
          <p className="text-2xl font-bold text-gray-700">{stats.expired}</p>
        </div>
      </div>

      {/* Detected Gaps */}
      {detectedGaps.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-furgocasa-orange" />
              Huecos Detectados ({detectedGaps.length})
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Huecos entre reservas que no cumplen el mínimo de días de temporada
            </p>
          </div>
          <div className="divide-y divide-gray-100">
            {detectedGaps.map((gap, index) => (
              <div key={`${gap.vehicle_id}-${gap.gap_start_date}`} className="p-4 hover:bg-gray-50">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Truck className="h-5 w-5 text-furgocasa-blue" />
                      <span className="font-medium text-gray-900">{gap.vehicle_name}</span>
                      <span className="text-xs text-gray-500">({gap.vehicle_internal_code})</span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(gap.gap_start_date)} - {formatDate(gap.gap_end_date)}
                      </span>
                      <span className="flex items-center gap-1 font-medium text-furgocasa-orange">
                        <Clock className="h-4 w-4" />
                        {gap.gap_days} días
                      </span>
                      <span className="flex items-center gap-1">
                        <Euro className="h-4 w-4" />
                        {formatPrice(gap.season_price_per_day)}/día
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {gap.season_name} (mínimo {gap.season_min_days} días)
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditGap(gap)}
                      className="px-4 py-2 bg-furgocasa-blue text-white rounded-lg hover:bg-furgocasa-blue-dark transition-colors text-sm font-medium"
                    >
                      Publicar Oferta
                    </button>
                    <button
                      onClick={() => ignoreGap(gap)}
                      className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                      Ignorar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal para editar y publicar */}
      {editingGap && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Configurar Oferta</h3>
            
            <div className="space-y-4">
              {/* Vehículo */}
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-500">Vehículo</p>
                <p className="font-medium text-gray-900">{editingGap.gap.vehicle_name}</p>
              </div>

              {/* Hueco original */}
              <div className="bg-yellow-50 rounded-lg p-3">
                <p className="text-sm text-yellow-600">Hueco detectado</p>
                <p className="font-medium text-yellow-800">
                  {formatDate(editingGap.gap.gap_start_date)} - {formatDate(editingGap.gap.gap_end_date)} ({editingGap.gap.gap_days} días)
                </p>
              </div>

              {/* Fechas de oferta */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha inicio
                  </label>
                  <input
                    type="date"
                    value={editingGap.startDate}
                    min={editingGap.gap.gap_start_date}
                    max={editingGap.endDate}
                    onChange={(e) => setEditingGap({ ...editingGap, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-blue focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha fin
                  </label>
                  <input
                    type="date"
                    value={editingGap.endDate}
                    min={editingGap.startDate}
                    max={editingGap.gap.gap_end_date}
                    onChange={(e) => setEditingGap({ ...editingGap, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-blue focus:border-transparent"
                  />
                </div>
              </div>

              {/* Descuento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descuento (%)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={editingGap.discount}
                    onChange={(e) => setEditingGap({ ...editingGap, discount: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="w-16 text-center font-bold text-furgocasa-orange text-lg">
                    -{editingGap.discount}%
                  </span>
                </div>
              </div>

              {/* Resumen de precio */}
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Precio normal:</span>
                  <span className="text-gray-500 line-through">
                    {formatPrice(editingGap.gap.season_price_per_day)}/día
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-700 font-medium">Precio oferta:</span>
                  <span className="text-green-700 font-bold text-lg">
                    {formatPrice(editingGap.gap.season_price_per_day * (100 - editingGap.discount) / 100)}/día
                  </span>
                </div>
                <div className="border-t border-green-200 mt-3 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-green-800 font-medium">
                      Total ({Math.ceil((new Date(editingGap.endDate).getTime() - new Date(editingGap.startDate).getTime()) / (1000 * 60 * 60 * 24))} días):
                    </span>
                    <span className="text-green-800 font-bold text-xl">
                      {formatPrice(
                        editingGap.gap.season_price_per_day * 
                        (100 - editingGap.discount) / 100 * 
                        Math.ceil((new Date(editingGap.endDate).getTime() - new Date(editingGap.startDate).getTime()) / (1000 * 60 * 60 * 24))
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas (opcional)
                </label>
                <textarea
                  value={editingGap.notes}
                  onChange={(e) => setEditingGap({ ...editingGap, notes: e.target.value })}
                  placeholder="Notas internas..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-blue focus:border-transparent"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditingGap(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={publishOffer}
                className="px-6 py-2 bg-furgocasa-orange text-white rounded-lg hover:bg-furgocasa-orange-dark transition-colors font-medium"
              >
                Publicar Oferta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offers List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Ofertas Gestionadas</h2>
          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">Todos los estados</option>
              <option value="published">Publicadas</option>
              <option value="reserved">Reservadas</option>
              <option value="expired">Expiradas</option>
              <option value="ignored">Ignoradas</option>
            </select>
            <button
              onClick={loadOffers}
              disabled={loading}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
            Cargando ofertas...
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <CalendarClock className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No hay ofertas {filterStatus !== 'all' ? `con estado "${filterStatus}"` : ''}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredOffers.map((offer) => (
              <div key={offer.id} className="p-4 hover:bg-gray-50">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Truck className="h-5 w-5 text-furgocasa-blue" />
                      <span className="font-medium text-gray-900">
                        {offer.vehicle?.name || 'Vehículo'}
                      </span>
                      {offer.vehicle?.internal_code && (
                        <span className="text-xs text-gray-500">({offer.vehicle.internal_code})</span>
                      )}
                      {getStatusBadge(offer.status)}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(offer.offer_start_date)} - {formatDate(offer.offer_end_date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {offer.offer_days} días
                      </span>
                      <span className="flex items-center gap-1 text-green-600 font-medium">
                        <TrendingDown className="h-4 w-4" />
                        -{offer.discount_percentage}%
                      </span>
                      <span className="flex items-center gap-1">
                        <Euro className="h-4 w-4" />
                        <span className="line-through text-gray-400">{formatPrice(offer.original_price_per_day)}</span>
                        <span className="text-green-600 font-medium">{formatPrice(offer.final_price_per_day)}/día</span>
                      </span>
                    </div>
                    {offer.admin_notes && (
                      <p className="text-xs text-gray-400 mt-1 italic">{offer.admin_notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {offer.status === 'published' && (
                      <>
                        <button
                          onClick={() => updateOfferStatus(offer.id, 'expired')}
                          className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Marcar como expirada"
                        >
                          <EyeOff className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    {offer.status === 'ignored' && (
                      <button
                        onClick={() => updateOfferStatus(offer.id, 'published')}
                        className="px-3 py-1.5 text-sm text-furgocasa-blue hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        Publicar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
