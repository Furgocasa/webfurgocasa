"use client";

import { useState, useEffect, use } from "react";
import { useLanguage } from "@/contexts/language-context";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { 
  Calendar, MapPin, User, Mail, Phone, 
  CreditCard, AlertCircle, Loader2, FileText, Users, Bed, 
  Tag, CheckCircle, Clock, Percent, Lock, ArrowLeft
} from "lucide-react";
import { LocalizedLink } from "@/components/localized-link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";

interface OfferData {
  id: string;
  vehicle_id: string;
  offer_start_date: string;
  offer_end_date: string;
  offer_days: number;
  original_price_per_day: number;
  discount_percentage: number;
  final_price_per_day: number;
  pickup_location_id: string;
  dropoff_location_id: string;
  vehicle: {
    id: string;
    name: string;
    slug: string;
    brand: string;
    model: string;
    seats: number;
    beds: number;
    base_price_per_day: number;
    internal_code: string;
    images: Array<{
      image_url: string;
      is_primary: boolean;
      sort_order: number;
    }>;
  };
  pickup_location: {
    id: string;
    name: string;
    address: string;
    extra_fee: number;
  } | null;
  dropoff_location: {
    id: string;
    name: string;
    address: string;
    extra_fee: number;
  } | null;
}

interface ExtraData {
  id: string;
  name: string;
  description: string;
  price_per_day: number;
  price_per_rental: number;
  price_type: string;
  max_quantity: number;
  icon: string;
}

interface SelectedExtra {
  id: string;
  name: string;
  quantity: number;
  price_per_day: number;
  price_per_rental: number;
}

export default function ReservarOfertaPage({ 
  params 
}: { 
  params: Promise<{ offerId: string }> 
}) {
  const { offerId } = use(params);
  const { t, language } = useLanguage();
  const router = useRouter();
  
  const [offer, setOffer] = useState<OfferData | null>(null);
  const [extras, setExtras] = useState<ExtraData[]>([]);
  const [selectedExtras, setSelectedExtras] = useState<SelectedExtra[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ubicaciones
  const [pickupLocationId, setPickupLocationId] = useState("");
  const [dropoffLocationId, setDropoffLocationId] = useState("");
  const [pickupTime, setPickupTime] = useState("10:00");
  const [dropoffTime, setDropoffTime] = useState("10:00");

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerDni, setCustomerDni] = useState("");
  const [customerDateOfBirth, setCustomerDateOfBirth] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerCity, setCustomerCity] = useState("");
  const [customerPostalCode, setCustomerPostalCode] = useState("");
  const [customerCountry, setCustomerCountry] = useState("España");
  const [customerDriverLicense, setCustomerDriverLicense] = useState("");
  const [customerDriverLicenseExpiry, setCustomerDriverLicenseExpiry] = useState("");
  const [notes, setNotes] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  useEffect(() => {
    loadOfferAndData();
  }, [offerId]);

  const loadOfferAndData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar oferta
      const offerResponse = await fetch(`/api/offers/last-minute/${offerId}`);
      const offerData = await offerResponse.json();
      
      if (offerData.error) {
        setError(offerData.error);
        return;
      }
      
      setOffer(offerData.offer);

      // Las ubicaciones vienen de la oferta (son fijas, no modificables)
      if (offerData.offer.pickup_location) {
        setPickupLocationId(offerData.offer.pickup_location_id);
      }
      if (offerData.offer.dropoff_location) {
        setDropoffLocationId(offerData.offer.dropoff_location_id);
      }

      // Cargar extras
      const { data: extrasData } = await supabase
        .from('extras')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      
      if (extrasData) {
        setExtras(extrasData);
      }

    } catch (err) {
      console.error('Error loading offer:', err);
      setError('Error al cargar la oferta');
    } finally {
      setLoading(false);
    }
  };

  const toggleExtra = (extra: ExtraData) => {
    const existing = selectedExtras.find(e => e.id === extra.id);
    if (existing) {
      setSelectedExtras(selectedExtras.filter(e => e.id !== extra.id));
    } else {
      setSelectedExtras([...selectedExtras, {
        id: extra.id,
        name: extra.name,
        quantity: 1,
        price_per_day: extra.price_per_day || 0,
        price_per_rental: extra.price_per_rental || 0
      }]);
    }
  };

  const updateExtraQuantity = (extraId: string, quantity: number) => {
    setSelectedExtras(selectedExtras.map(e => 
      e.id === extraId ? { ...e, quantity: Math.max(1, quantity) } : e
    ));
  };

  // Cálculos de precio
  const calculateExtrasPrice = () => {
    if (!offer) return 0;
    return selectedExtras.reduce((total, extra) => {
      const perDay = extra.price_per_day * extra.quantity * offer.offer_days;
      const perRental = extra.price_per_rental * extra.quantity;
      return total + perDay + perRental;
    }, 0);
  };

  const calculateLocationFee = () => {
    if (!offer) return 0;
    const pickupFee = offer.pickup_location?.extra_fee || 0;
    const dropoffFee = offer.dropoff_location?.extra_fee || 0;
    return pickupFee + dropoffFee;
  };

  const basePrice = offer ? offer.final_price_per_day * offer.offer_days : 0;
  const originalPrice = offer ? offer.original_price_per_day * offer.offer_days : 0;
  const savings = originalPrice - basePrice;
  const extrasPrice = calculateExtrasPrice();
  const locationFee = calculateLocationFee();
  const totalPrice = basePrice + extrasPrice + locationFee;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(language === 'en' ? 'en-US' : 'es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!offer || !acceptTerms) return;

    try {
      setSubmitting(true);
      setError(null);

      // Crear la reserva via API
      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicle_id: offer.vehicle_id,
          pickup_date: offer.offer_start_date,
          dropoff_date: offer.offer_end_date,
          pickup_time: pickupTime,
          dropoff_time: dropoffTime,
          pickup_location_id: pickupLocationId,
          dropoff_location_id: dropoffLocationId,
          total_days: offer.offer_days,
          base_price: basePrice,
          extras_price: extrasPrice,
          location_fee: locationFee,
          total_price: totalPrice,
          status: 'pending',
          payment_status: 'pending',
          notes: notes || null,
          // Datos del cliente
          customer: {
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
            dni: customerDni,
            date_of_birth: customerDateOfBirth || null,
            address: customerAddress || null,
            city: customerCity || null,
            postal_code: customerPostalCode || null,
            country: customerCountry,
            driver_license: customerDriverLicense || null,
            driver_license_expiry: customerDriverLicenseExpiry || null
          },
          // Extras seleccionados
          extras: selectedExtras.map(extra => ({
            extra_id: extra.id,
            quantity: extra.quantity,
            price_per_day: extra.price_per_day,
            price_per_rental: extra.price_per_rental,
            total_price: (extra.price_per_day * extra.quantity * offer.offer_days) + 
                        (extra.price_per_rental * extra.quantity)
          })),
          // Referencia a la oferta
          last_minute_offer_id: offer.id,
          discount_applied: savings,
          discount_percentage: offer.discount_percentage
        })
      });

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      // Marcar la oferta como reservada
      await fetch('/api/admin/last-minute-offers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: offer.id,
          status: 'reserved',
          booking_id: result.booking.id
        })
      });

      // Redirigir a confirmación/pago
      router.push(`/${language}/reservar/${result.booking.id}/pago`);

    } catch (err: any) {
      console.error('Error creating booking:', err);
      setError(err.message || 'Error al crear la reserva');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-furgocasa-blue mx-auto mb-4" />
          <p className="text-gray-600">{t("Cargando oferta...")}</p>
        </div>
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t("Oferta no disponible")}
          </h1>
          <p className="text-gray-600 mb-6">
            {error || t("Esta oferta ya no está disponible o ha expirado.")}
          </p>
          <LocalizedLink
            href="/ofertas"
            className="inline-flex items-center gap-2 bg-furgocasa-blue text-white px-6 py-3 rounded-xl hover:bg-furgocasa-blue-dark transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            {t("Ver otras ofertas")}
          </LocalizedLink>
        </div>
      </div>
    );
  }

  const vehicleImage = offer.vehicle.images?.find(img => img.is_primary)?.image_url || 
                       offer.vehicle.images?.[0]?.image_url;

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Header */}
        <div className="mb-8">
          <LocalizedLink 
            href="/ofertas"
            className="inline-flex items-center gap-2 text-furgocasa-blue hover:underline mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("Volver a ofertas")}
          </LocalizedLink>
          <h1 className="text-3xl font-bold text-gray-900">
            {t("Reservar Oferta de Última Hora")}
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Columna izquierda - Formulario */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Oferta seleccionada (no modificable) */}
            <div className="bg-gradient-to-r from-furgocasa-orange/10 to-orange-50 rounded-2xl p-6 border-2 border-furgocasa-orange/30">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="w-5 h-5 text-furgocasa-orange" />
                <h2 className="text-lg font-bold text-gray-900">{t("Oferta Seleccionada")}</h2>
                <span className="ml-auto bg-furgocasa-orange text-white text-sm font-bold px-3 py-1 rounded-full">
                  -{offer.discount_percentage}%
                </span>
              </div>
              
              <div className="flex flex-col md:flex-row gap-6">
                {vehicleImage && (
                  <div className="md:w-1/3">
                    <div className="aspect-[4/3] relative rounded-xl overflow-hidden">
                      <Image
                        src={vehicleImage}
                        alt={offer.vehicle.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{offer.vehicle.name}</h3>
                  <p className="text-gray-600 mb-4">{offer.vehicle.brand} {offer.vehicle.model}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-furgocasa-blue" />
                      <div>
                        <p className="text-gray-500">{t("Recogida")}</p>
                        <p className="font-medium">{formatDate(offer.offer_start_date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-furgocasa-blue" />
                      <div>
                        <p className="text-gray-500">{t("Devolución")}</p>
                        <p className="font-medium">{formatDate(offer.offer_end_date)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center gap-4">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      {offer.vehicle.seats} {t("plazas")}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Bed className="w-4 h-4" />
                      {offer.vehicle.beds} {t("camas")}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-furgocasa-orange font-medium">
                      <Clock className="w-4 h-4" />
                      {offer.offer_days} {t("días")}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ubicación y Horarios - Ubicación FIJA de la oferta */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-furgocasa-blue" />
                {t("Ubicación y Horarios")}
              </h2>
              
              {/* Ubicación fija - no modificable */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    {t("Ubicación incluida en la oferta")}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-bold text-gray-900">
                      {offer?.pickup_location?.name || 'Murcia'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {offer?.pickup_location?.address || ''}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Solo horarios editables */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("Hora de recogida")}
                  </label>
                  <select
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-furgocasa-blue focus:border-transparent"
                  >
                    {Array.from({ length: 11 }, (_, i) => i + 9).map(hour => (
                      <option key={hour} value={`${hour}:00`}>{hour}:00</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("Hora de devolución")}
                  </label>
                  <select
                    value={dropoffTime}
                    onChange={(e) => setDropoffTime(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-furgocasa-blue focus:border-transparent"
                  >
                    {Array.from({ length: 11 }, (_, i) => i + 9).map(hour => (
                      <option key={hour} value={`${hour}:00`}>{hour}:00</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Extras */}
            {extras.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-furgocasa-blue" />
                  {t("Extras opcionales")}
                </h2>
                
                <div className="grid md:grid-cols-2 gap-3">
                  {extras.map(extra => {
                    const isSelected = selectedExtras.some(e => e.id === extra.id);
                    const selected = selectedExtras.find(e => e.id === extra.id);
                    const price = extra.price_per_day > 0 
                      ? `${formatPrice(extra.price_per_day)}/${t("día")}`
                      : formatPrice(extra.price_per_rental);
                    
                    return (
                      <div 
                        key={extra.id}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-furgocasa-blue bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => toggleExtra(extra)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{extra.name}</p>
                            <p className="text-sm text-furgocasa-blue font-medium">{price}</p>
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? 'bg-furgocasa-blue border-furgocasa-blue' : 'border-gray-300'
                          }`}>
                            {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                          </div>
                        </div>
                        {isSelected && extra.max_quantity > 1 && (
                          <div className="mt-3 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => updateExtraQuantity(extra.id, (selected?.quantity || 1) - 1)}
                              className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-medium">{selected?.quantity || 1}</span>
                            <button
                              type="button"
                              onClick={() => updateExtraQuantity(extra.id, (selected?.quantity || 1) + 1)}
                              className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Datos del cliente */}
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-furgocasa-blue" />
                {t("Datos del conductor principal")}
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("Nombre completo")} *
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-furgocasa-blue focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("DNI/Pasaporte")} *
                  </label>
                  <input
                    type="text"
                    value={customerDni}
                    onChange={(e) => setCustomerDni(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-furgocasa-blue focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("Email")} *
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-furgocasa-blue focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("Teléfono")} *
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-furgocasa-blue focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("Fecha de nacimiento")}
                  </label>
                  <input
                    type="date"
                    value={customerDateOfBirth}
                    onChange={(e) => setCustomerDateOfBirth(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-furgocasa-blue focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("País")}
                  </label>
                  <input
                    type="text"
                    value={customerCountry}
                    onChange={(e) => setCustomerCountry(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-furgocasa-blue focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("Dirección")}
                  </label>
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-furgocasa-blue focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("Ciudad")}
                  </label>
                  <input
                    type="text"
                    value={customerCity}
                    onChange={(e) => setCustomerCity(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-furgocasa-blue focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("Código postal")}
                  </label>
                  <input
                    type="text"
                    value={customerPostalCode}
                    onChange={(e) => setCustomerPostalCode(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-furgocasa-blue focus:border-transparent"
                  />
                </div>
                
                {/* Carnet de conducir */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("Nº Carnet de conducir")} *
                  </label>
                  <input
                    type="text"
                    value={customerDriverLicense}
                    onChange={(e) => setCustomerDriverLicense(e.target.value)}
                    required
                    placeholder="123456789"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-furgocasa-blue focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("Fecha caducidad carnet")} *
                  </label>
                  <input
                    type="date"
                    value={customerDriverLicenseExpiry}
                    onChange={(e) => setCustomerDriverLicenseExpiry(e.target.value)}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-furgocasa-blue focus:border-transparent"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("Notas o peticiones especiales")}
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-furgocasa-blue focus:border-transparent"
                  />
                </div>
              </div>

              {/* Términos */}
              <div className="mt-6 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-gray-300 text-furgocasa-blue focus:ring-furgocasa-blue"
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  {t("He leído y acepto los")}{" "}
                  <LocalizedLink href="/terminos-y-condiciones" className="text-furgocasa-blue hover:underline">
                    {t("términos y condiciones")}
                  </LocalizedLink>{" "}
                  {t("y la")}{" "}
                  <LocalizedLink href="/politica-de-privacidad" className="text-furgocasa-blue hover:underline">
                    {t("política de privacidad")}
                  </LocalizedLink>
                </label>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !acceptTerms}
                className="mt-6 w-full bg-furgocasa-orange hover:bg-furgocasa-orange-dark text-white font-bold py-4 px-8 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t("Procesando...")}
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    {t("Continuar al pago")}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Columna derecha - Resumen */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                {t("Resumen de la reserva")}
              </h2>

              {/* Fechas */}
              <div className="space-y-3 pb-4 border-b border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t("Recogida")}</span>
                  <span className="font-medium">{formatDate(offer.offer_start_date)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t("Devolución")}</span>
                  <span className="font-medium">{formatDate(offer.offer_end_date)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t("Duración")}</span>
                  <span className="font-medium text-furgocasa-orange">{offer.offer_days} {t("días")}</span>
                </div>
              </div>

              {/* Desglose de precio */}
              <div className="space-y-3 py-4 border-b border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {t("Alquiler")} ({offer.offer_days} {t("días")})
                  </span>
                  <div className="text-right">
                    <span className="text-gray-400 line-through text-xs block">
                      {formatPrice(originalPrice)}
                    </span>
                    <span className="font-medium">{formatPrice(basePrice)}</span>
                  </div>
                </div>
                
                {/* Ahorro */}
                <div className="flex justify-between text-sm bg-green-50 -mx-2 px-2 py-2 rounded-lg">
                  <span className="text-green-700 flex items-center gap-1">
                    <Percent className="w-4 h-4" />
                    {t("Descuento")} (-{offer.discount_percentage}%)
                  </span>
                  <span className="font-medium text-green-700">-{formatPrice(savings)}</span>
                </div>

                {extrasPrice > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t("Extras")}</span>
                    <span className="font-medium">{formatPrice(extrasPrice)}</span>
                  </div>
                )}
                
                {locationFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t("Suplemento ubicación")}</span>
                    <span className="font-medium">{formatPrice(locationFee)}</span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">{t("Total")}</span>
                  <span className="text-2xl font-bold text-furgocasa-blue">{formatPrice(totalPrice)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {t("IVA incluido")}
                </p>
              </div>

              {/* Garantía */}
              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-furgocasa-blue flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{t("Reserva segura")}</p>
                    <p className="text-gray-600">{t("Cancelación gratuita hasta 48h antes")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
