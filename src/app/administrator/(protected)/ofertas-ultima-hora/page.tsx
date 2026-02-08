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
  Info,
  MapPin,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
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
  season_price_per_day: number; // Precio de la temporada (puede no incluir descuento por duración)
  previous_booking_id: string;
  next_booking_id: string;
  already_exists: boolean;
  // Precios reales calculados (igual que búsqueda)
  real_price_per_day?: number;
  real_total_price?: number;
  duration_discount?: number;
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
  status: 'detected' | 'published' | 'reserved' | 'expired' | 'ignored' | 'auto_cancelled';
  admin_notes: string | null;
  detected_at: string;
  published_at: string | null;
  reserved_at: string | null;
  pickup_location_id?: string;
  dropoff_location_id?: string;
  vehicle?: {
    name: string;
    internal_code: string;
    slug: string;
  };
}

interface Location {
  id: string;
  name: string;
  slug: string;
}

export default function OfertasUltimaHoraPage() {
  // Establecer título de la página
  useEffect(() => {
    document.title = "Admin - Ofertas | Furgocasa";
  }, []);

  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [detectedGaps, setDetectedGaps] = useState<DetectedGap[]>([]);
  const [offers, setOffers] = useState<LastMinuteOffer[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedGap, setExpandedGap] = useState<string | null>(null);
  const [tableExists, setTableExists] = useState(true);
  const [checking, setChecking] = useState(false);
  const [availabilityResults, setAvailabilityResults] = useState<any>(null);
  
  // Estado para edición de oferta antes de publicar (nueva)
  const [editingGap, setEditingGap] = useState<{
    gap: DetectedGap;
    startDate: string;
    endDate: string;
    discount: number;
    notes: string;
    locationId: string;
    // Precio real calculado (mismo que búsqueda)
    realPricePerDay: number;
    realTotalPrice: number;
  } | null>(null);

  // Estado para editar oferta existente
  const [editingOffer, setEditingOffer] = useState<{
    offer: LastMinuteOffer;
    startDate: string;
    endDate: string;
    discount: number;
    notes: string;
    locationId: string;
  } | null>(null);

  // Estado para confirmar borrado
  const [deletingOfferId, setDeletingOfferId] = useState<string | null>(null);

  // Estado para ordenamiento de tabla
  const [sortField, setSortField] = useState<'internal_code' | 'vehicle_name' | 'start_date' | 'end_date' | 'duration' | 'discount' | 'price'>('start_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    loadOffers();
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      const { data } = await supabase
        .from('locations')
        .select('id, name, slug')
        .eq('is_active', true)
        .eq('is_pickup', true)
        .order('sort_order');
      
      if (data) {
        setLocations(data);
      }
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

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
      
      // Calcular precio real para cada hueco (igual que la búsqueda)
      const gapsWithRealPrices = await Promise.all(
        newGaps.map(async (gap: DetectedGap) => {
          try {
            const priceRes = await fetch('/api/pricing/calculate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                pickup_date: gap.gap_start_date,
                dropoff_date: gap.gap_end_date
              })
            });
            const priceData = await priceRes.json();
            if (!priceRes.ok) return gap;
            
            return {
              ...gap,
              real_price_per_day: priceData.real_price_per_day,
              real_total_price: priceData.real_total_price,
              duration_discount: priceData.duration_discount_percentage
            };
          } catch {
            return gap;
          }
        })
      );
      
      setDetectedGaps(gapsWithRealPrices);
      
      if (gapsWithRealPrices.length === 0) {
        showMessage('success', 'No se encontraron nuevos huecos entre reservas');
      } else {
        showMessage('success', `Se encontraron ${gapsWithRealPrices.length} huecos potenciales`);
      }
    } catch (error) {
      console.error('Error detecting gaps:', error);
      showMessage('error', 'Error al detectar huecos. Verifica que las funciones SQL estén creadas.');
    } finally {
      setDetecting(false);
    }
  };

  const checkOfferAvailability = async () => {
    setChecking(true);
    setAvailabilityResults(null);
    try {
      const response = await fetch('/api/admin/last-minute-offers/check-availability');
      const result = await response.json();
      
      if (result.error) {
        showMessage('error', result.error);
        return;
      }

      setAvailabilityResults(result);
      
      if (result.results.length === 0) {
        showMessage('success', 'No hay ofertas publicadas para consultar');
      } else if (result.summary.unavailable === 0) {
        showMessage('success', `✓ Todas las ofertas (${result.summary.total}) están disponibles`);
      } else {
        showMessage('error', `⚠ ${result.summary.unavailable} de ${result.summary.total} ofertas ya NO están disponibles`);
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      showMessage('error', 'Error al consultar disponibilidad de ofertas');
    } finally {
      setChecking(false);
    }
  };

  const openEditGap = async (gap: DetectedGap) => {
    // Por defecto seleccionar Murcia
    const defaultLocation = locations.find(l => l.slug === 'murcia') || locations[0];
    
    // Usar precio real ya calculado o calcularlo ahora
    let realPricePerDay = gap.real_price_per_day || gap.season_price_per_day;
    let realTotalPrice = gap.real_total_price || (gap.season_price_per_day * gap.gap_days);
    
    // Si no tenemos precio real, calcularlo
    if (!gap.real_price_per_day) {
      try {
        const priceRes = await fetch('/api/pricing/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pickup_date: gap.gap_start_date,
            dropoff_date: gap.gap_end_date
          })
        });
        const priceData = await priceRes.json();
        if (priceRes.ok) {
          realPricePerDay = priceData.real_price_per_day;
          realTotalPrice = priceData.real_total_price;
        }
      } catch (e) {
        console.error('Error calculating price:', e);
      }
    }
    
    setEditingGap({
      gap,
      startDate: gap.gap_start_date,
      endDate: gap.gap_end_date,
      discount: 15,
      notes: '',
      locationId: defaultLocation?.id || '',
      realPricePerDay,
      realTotalPrice
    });
  };

  // Recalcular precio cuando cambian las fechas de la oferta
  const recalculateOfferPrice = async (startDate: string, endDate: string) => {
    if (!editingGap) return;
    
    try {
      const priceRes = await fetch('/api/pricing/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickup_date: startDate,
          dropoff_date: endDate
        })
      });
      const priceData = await priceRes.json();
      if (priceRes.ok) {
        setEditingGap(prev => prev ? {
          ...prev,
          startDate,
          endDate,
          realPricePerDay: priceData.real_price_per_day,
          realTotalPrice: priceData.real_total_price
        } : null);
        return;
      }
    } catch (e) {
      console.error('Error recalculating price:', e);
    }
    
    // Si falla, solo actualizar fechas
    setEditingGap(prev => prev ? { ...prev, startDate, endDate } : null);
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
          // IMPORTANTE: Usar el precio REAL (con descuentos por duración aplicados)
          original_price_per_day: editingGap.realPricePerDay,
          discount_percentage: editingGap.discount,
          previous_booking_id: editingGap.gap.previous_booking_id,
          next_booking_id: editingGap.gap.next_booking_id,
          admin_notes: editingGap.notes || null,
          pickup_location_id: editingGap.locationId,
          dropoff_location_id: editingGap.locationId,
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

  // Abrir modal de edición de oferta existente
  const openEditOffer = (offer: LastMinuteOffer) => {
    const defaultLocation = locations.find(l => l.id === offer.pickup_location_id) || 
                           locations.find(l => l.slug === 'murcia') || 
                           locations[0];
    setEditingOffer({
      offer,
      startDate: offer.offer_start_date,
      endDate: offer.offer_end_date,
      discount: offer.discount_percentage,
      notes: offer.admin_notes || '',
      locationId: defaultLocation?.id || ''
    });
  };

  // Guardar cambios en oferta existente
  const saveOfferChanges = async () => {
    if (!editingOffer) return;
    
    try {
      const response = await fetch('/api/admin/last-minute-offers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingOffer.offer.id,
          offer_start_date: editingOffer.startDate,
          offer_end_date: editingOffer.endDate,
          discount_percentage: editingOffer.discount,
          admin_notes: editingOffer.notes || null,
          pickup_location_id: editingOffer.locationId,
          dropoff_location_id: editingOffer.locationId
        })
      });
      
      const result = await response.json();
      if (result.error) throw new Error(result.error);
      
      showMessage('success', 'Oferta actualizada correctamente');
      setEditingOffer(null);
      loadOffers();
    } catch (error) {
      console.error('Error updating offer:', error);
      showMessage('error', 'Error al actualizar la oferta');
    }
  };

  // Borrar oferta
  const deleteOffer = async (offerId: string) => {
    try {
      const response = await fetch('/api/admin/last-minute-offers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: offerId })
      });
      
      const result = await response.json();
      if (result.error) throw new Error(result.error);
      
      showMessage('success', 'Oferta eliminada correctamente');
      setDeletingOfferId(null);
      loadOffers();
    } catch (error) {
      console.error('Error deleting offer:', error);
      showMessage('error', 'Error al eliminar la oferta');
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
      auto_cancelled: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Auto-cancelada' },
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

  // Función para ordenar ofertas
  const sortedOffers = [...filteredOffers].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case 'internal_code':
        aValue = a.vehicle?.internal_code || '';
        bValue = b.vehicle?.internal_code || '';
        break;
      case 'vehicle_name':
        aValue = a.vehicle?.name || '';
        bValue = b.vehicle?.name || '';
        break;
      case 'start_date':
        aValue = new Date(a.offer_start_date).getTime();
        bValue = new Date(b.offer_start_date).getTime();
        break;
      case 'end_date':
        aValue = new Date(a.offer_end_date).getTime();
        bValue = new Date(b.offer_end_date).getTime();
        break;
      case 'duration':
        aValue = a.offer_days;
        bValue = b.offer_days;
        break;
      case 'discount':
        aValue = a.discount_percentage;
        bValue = b.discount_percentage;
        break;
      case 'price':
        aValue = a.final_price_per_day;
        bValue = b.final_price_per_day;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Función para cambiar el orden
  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Estadísticas
  const stats = {
    published: offers.filter(o => o.status === 'published').length,
    reserved: offers.filter(o => o.status === 'reserved').length,
    expired: offers.filter(o => o.status === 'expired').length,
    auto_cancelled: offers.filter(o => o.status === 'auto_cancelled').length,
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
        <div className="flex gap-2">
          <button
            onClick={detectGaps}
            disabled={detecting}
            className="flex items-center gap-2 px-4 py-2 bg-furgocasa-orange text-white rounded-lg hover:bg-furgocasa-orange-dark transition-colors disabled:opacity-50"
          >
            <Search className={`h-5 w-5 ${detecting ? 'animate-spin' : ''}`} />
            {detecting ? 'Buscando...' : 'Detectar Huecos'}
          </button>
          <button
            onClick={checkOfferAvailability}
            disabled={checking}
            className="flex items-center gap-2 px-4 py-2 bg-furgocasa-blue text-white rounded-lg hover:bg-furgocasa-blue-dark transition-colors disabled:opacity-50"
          >
            <Database className={`h-5 w-5 ${checking ? 'animate-spin' : ''}`} />
            {checking ? 'Consultando...' : 'Consultar Ofertas'}
          </button>
        </div>
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

      {/* Availability Results */}
      {availabilityResults && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Database className="h-5 w-5 text-furgocasa-blue" />
                Resultado de Consulta de Ofertas
              </h2>
              <button
                onClick={() => setAvailabilityResults(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {availabilityResults.summary && (
              <div className="mt-3 flex gap-4 text-sm">
                <span className="text-gray-600">
                  Total: <strong>{availabilityResults.summary.total}</strong>
                </span>
                <span className="text-green-600">
                  Disponibles: <strong>{availabilityResults.summary.available}</strong>
                </span>
                <span className="text-red-600">
                  No disponibles: <strong>{availabilityResults.summary.unavailable}</strong>
                </span>
              </div>
            )}
          </div>

          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {availabilityResults.results.map((result: any) => (
              <div 
                key={result.offer_id} 
                className={`p-4 ${result.is_available ? 'bg-white' : 'bg-red-50'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {result.is_available ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <Truck className="h-5 w-5 text-furgocasa-blue" />
                      <span className="font-medium text-gray-900">{result.vehicle_name}</span>
                      <span className="text-xs text-gray-500">({result.vehicle_internal_code})</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        result.is_available 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {result.is_available ? 'Disponible' : 'No Disponible'}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 ml-7">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(result.offer_start_date)} - {formatDate(result.offer_end_date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {result.offer_days} días
                      </span>
                      <span className="flex items-center gap-1 text-green-600 font-medium">
                        <TrendingDown className="h-4 w-4" />
                        -{result.discount_percentage}% descuento
                      </span>
                    </div>

                    {/* Mostrar conflictos si existen */}
                    {!result.is_available && result.conflicting_bookings.length > 0 && (
                      <div className="mt-3 ml-7 bg-white rounded-lg p-3 border border-red-200">
                        <p className="text-xs font-medium text-red-600 mb-2">
                          ⚠ Reservas en conflicto:
                        </p>
                        {result.conflicting_bookings.map((booking: any, idx: number) => (
                          <div key={idx} className="text-xs text-gray-600 flex items-center gap-2 mt-1">
                            <span>•</span>
                            <span className="font-medium">{booking.customer_name}</span>
                            <span>-</span>
                            <span>{formatDate(booking.pickup_date)} a {formatDate(booking.dropoff_date)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {result.reason && (
                      <p className="text-xs text-gray-500 mt-2 ml-7 italic">
                        {result.reason}
                      </p>
                    )}
                  </div>

                  {/* Botón para marcar como expirada si no está disponible */}
                  {!result.is_available && (
                    <button
                      onClick={() => updateOfferStatus(result.offer_id, 'expired')}
                      className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-xs font-medium"
                      title="Marcar como expirada"
                    >
                      <EyeOff className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
          <div className="flex items-center gap-2 text-orange-600 mb-1">
            <XCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Auto-canceladas</span>
          </div>
          <p className="text-2xl font-bold text-orange-700">{stats.auto_cancelled}</p>
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
                        {formatPrice(gap.real_price_per_day || gap.season_price_per_day)}/día
                        {gap.duration_discount && gap.duration_discount > 0 && (
                          <span className="text-xs text-green-600 ml-1">(-{gap.duration_discount}% duración)</span>
                        )}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {gap.season_name} (mínimo {gap.season_min_days} días) 
                      {gap.real_total_price && (
                        <span className="ml-2">• Total normal: {formatPrice(gap.real_total_price)}</span>
                      )}
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
                    onChange={(e) => recalculateOfferPrice(e.target.value, editingGap.endDate)}
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
                    onChange={(e) => recalculateOfferPrice(editingGap.startDate, e.target.value)}
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

              {/* Ubicación */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-furgocasa-blue" />
                  Ubicación de recogida/devolución
                </label>
                <select
                  value={editingGap.locationId}
                  onChange={(e) => setEditingGap({ ...editingGap, locationId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-blue focus:border-transparent"
                >
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Esta será la ubicación fija de la oferta (el cliente no podrá cambiarla)
                </p>
              </div>

              {/* Resumen de precio - Usa precio REAL (igual que búsqueda) */}
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-xs text-green-600 mb-2 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Precio real (con descuentos por duración aplicados)
                </p>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Precio búsqueda normal:</span>
                  <span className="text-gray-500 line-through">
                    {formatPrice(editingGap.realPricePerDay)}/día
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-700 font-medium">Precio oferta (-{editingGap.discount}%):</span>
                  <span className="text-green-700 font-bold text-lg">
                    {formatPrice(editingGap.realPricePerDay * (100 - editingGap.discount) / 100)}/día
                  </span>
                </div>
                <div className="border-t border-green-200 mt-3 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-green-800 font-medium">
                      Total ({Math.ceil((new Date(editingGap.endDate).getTime() - new Date(editingGap.startDate).getTime()) / (1000 * 60 * 60 * 24))} días):
                    </span>
                    <span className="text-green-800 font-bold text-xl">
                      {formatPrice(
                        editingGap.realPricePerDay * 
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
              <option value="auto_cancelled">Auto-canceladas</option>
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th 
                    onClick={() => handleSort('internal_code')}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      Código
                      {sortField === 'internal_code' && (
                        sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('vehicle_name')}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      Vehículo
                      {sortField === 'vehicle_name' && (
                        sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('start_date')}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      Fecha Inicio
                      {sortField === 'start_date' && (
                        sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('end_date')}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      Fecha Fin
                      {sortField === 'end_date' && (
                        sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('duration')}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      Duración
                      {sortField === 'duration' && (
                        sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('discount')}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      Descuento
                      {sortField === 'discount' && (
                        sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('price')}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      Precio/día
                      {sortField === 'price' && (
                        sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {sortedOffers.map((offer) => (
                  <tr key={offer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm font-mono text-gray-900">
                        {offer.vehicle?.internal_code || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-furgocasa-blue flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-900">
                          {offer.vehicle?.name || 'Vehículo'}
                        </span>
                      </div>
                      {offer.admin_notes && (
                        <p className="text-xs text-gray-400 mt-1 italic truncate max-w-xs" title={offer.admin_notes}>
                          {offer.admin_notes}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-gray-900">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {formatDate(offer.offer_start_date)}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-gray-900">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {formatDate(offer.offer_end_date)}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm font-medium text-furgocasa-orange">
                        <Clock className="h-4 w-4" />
                        {offer.offer_days} días
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm font-semibold text-green-600">
                        <TrendingDown className="h-4 w-4" />
                        -{offer.discount_percentage}%
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-gray-400 line-through">
                          {formatPrice(offer.original_price_per_day)}
                        </span>
                        <span className="text-sm font-bold text-green-600">
                          {formatPrice(offer.final_price_per_day)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getStatusBadge(offer.status)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Editar */}
                        {(offer.status === 'published' || offer.status === 'detected') && (
                          <button
                            onClick={() => openEditOffer(offer)}
                            className="p-2 text-furgocasa-blue hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar oferta"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        )}
                        
                        {/* Ocultar/Expirar */}
                        {offer.status === 'published' && (
                          <button
                            onClick={() => updateOfferStatus(offer.id, 'expired')}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Marcar como expirada (ocultar)"
                          >
                            <EyeOff className="h-4 w-4" />
                          </button>
                        )}
                        
                        {/* Publicar si está ignorada */}
                        {offer.status === 'ignored' && (
                          <button
                            onClick={() => updateOfferStatus(offer.id, 'published')}
                            className="p-2 text-furgocasa-blue hover:bg-blue-50 rounded-lg transition-colors text-xs font-medium"
                            title="Publicar oferta"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        )}
                        
                        {/* Borrar */}
                        <button
                          onClick={() => setDeletingOfferId(offer.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar oferta"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal para editar oferta existente */}
      {editingOffer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Editar Oferta</h3>
            
            <div className="space-y-4">
              {/* Info del vehículo */}
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-500">Vehículo</p>
                <p className="font-medium text-gray-900">{editingOffer.offer.vehicle?.name}</p>
              </div>

              {/* Fechas de oferta */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha inicio
                  </label>
                  <input
                    type="date"
                    value={editingOffer.startDate}
                    onChange={(e) => setEditingOffer({ ...editingOffer, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-blue focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha fin
                  </label>
                  <input
                    type="date"
                    value={editingOffer.endDate}
                    onChange={(e) => setEditingOffer({ ...editingOffer, endDate: e.target.value })}
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
                    value={editingOffer.discount}
                    onChange={(e) => setEditingOffer({ ...editingOffer, discount: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="w-16 text-center font-bold text-furgocasa-orange text-lg">
                    -{editingOffer.discount}%
                  </span>
                </div>
              </div>

              {/* Ubicación */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-furgocasa-blue" />
                  Ubicación
                </label>
                <select
                  value={editingOffer.locationId}
                  onChange={(e) => setEditingOffer({ ...editingOffer, locationId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-blue focus:border-transparent"
                >
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas (opcional)
                </label>
                <textarea
                  value={editingOffer.notes}
                  onChange={(e) => setEditingOffer({ ...editingOffer, notes: e.target.value })}
                  placeholder="Notas internas..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-blue focus:border-transparent"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditingOffer(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={saveOfferChanges}
                className="px-6 py-2 bg-furgocasa-blue text-white rounded-lg hover:bg-furgocasa-blue-dark transition-colors font-medium"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para borrar */}
      {deletingOfferId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Eliminar Oferta</h3>
                <p className="text-sm text-gray-500">Esta acción no se puede deshacer</p>
              </div>
            </div>
            
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que quieres eliminar esta oferta? Se eliminará permanentemente de la base de datos.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingOfferId(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => deleteOffer(deletingOfferId)}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
