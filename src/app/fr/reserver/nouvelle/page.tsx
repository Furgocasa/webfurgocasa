"use client";

import { useState, useEffect, Suspense } from "react";
import { useLanguage } from "@/contexts/language-context";
import { useRouter, useSearchParams } from "next/navigation";

// Loading component
function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}
import { supabase } from "@/lib/supabase/client";
import { 
  Calendar, MapPin, User, Mail, Phone, 
  CreditCard, AlertCircle, Loader2, FileText, Users, Moon, Tag, CheckCircle, X
} from "lucide-react";
import { LocalizedLink } from "@/components/localized-link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { useSeasonalPricing } from "@/hooks/use-seasonal-pricing";
import { getTranslatedRoute } from "@/lib/route-translations";

interface VehicleData {
  id: string;
  name: string;
  brand: string;
  model: string;
  seats: number;
  beds: number;
  base_price_per_day: number;
  images?: Array<{
    image_url: string;
    is_primary: boolean;
  }>;
}

interface LocationData {
  id: string;
  name: string;
  address: string;
  extra_fee: number;
}

interface SelectedExtra {
  id: string;
  name: string;
  quantity: number;
  price_per_day: number;
  price_per_rental: number;
  min_quantity?: number | null;
}

interface AppliedCoupon {
  id: string;
  code: string;
  name: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  discount_amount: number;
}

function NuevaReservaContent() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get params from URL
  const vehicleId = searchParams.get('vehicle_id');
  const pickupDate = searchParams.get('pickup_date');
  const dropoffDate = searchParams.get('dropoff_date');
  const pickupTime = searchParams.get('pickup_time');
  const dropoffTime = searchParams.get('dropoff_time');
  const pickupLocationSlug = searchParams.get('pickup_location');
  const dropoffLocationSlug = searchParams.get('dropoff_location');

  const [vehicle, setVehicle] = useState<VehicleData | null>(null);
  const [pickupLocation, setPickupLocation] = useState<LocationData | null>(null);
  const [dropoffLocation, setDropoffLocation] = useState<LocationData | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<SelectedExtra[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado para cupones
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

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

  // Usar hook para calcular precios con temporadas
  const seasonalPricing = useSeasonalPricing({
    pickupDate,
    dropoffDate,
    pickupTime,
    dropoffTime
  });
  
  const { days, pricingDays, hasTwoDayPricing, totalPrice: basePrice, season: seasonName } = seasonalPricing;
  
  const extrasPrice = selectedExtras.reduce((sum, extra) => {
    const price = extra.price_per_rental > 0 
      ? extra.price_per_rental 
      : extra.price_per_day * (extra.min_quantity ? Math.max(pricingDays, extra.min_quantity) : pricingDays);
    return sum + (price * extra.quantity);
  }, 0);
  
  const calculateLocationFee = () => {
    const pickupFee = pickupLocation?.extra_fee || 0;
    const dropoffFee = dropoffLocation?.extra_fee || 0;
    return pickupFee + dropoffFee;
  };
  
  const locationFee = calculateLocationFee();
  const subtotalBeforeCoupon = basePrice + extrasPrice + locationFee;
  const couponDiscount = appliedCoupon?.discount_amount || 0;
  const totalPrice = subtotalBeforeCoupon - couponDiscount;

  useEffect(() => {
    if (!vehicleId || !pickupDate || !dropoffDate) {
      setError('Faltan parámetros de reserva');
      setLoading(false);
      return;
    }
    
    loadData();
  }, [vehicleId, pickupLocationSlug, dropoffLocationSlug]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load vehicle
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('vehicles')
        .select(`
          *,
          images:vehicle_images(*)
        `)
        .eq('id', vehicleId)
        .single();

      if (vehicleError) throw vehicleError;
      setVehicle(vehicleData as any);

      // Load locations
      if (pickupLocationSlug) {
        const { data: pickupData } = await supabase
          .from('locations')
          .select('id, name, address, extra_fee')
          .eq('slug', pickupLocationSlug)
          .single();
        
        if (pickupData) setPickupLocation(pickupData);
      }

      if (dropoffLocationSlug) {
        const { data: dropoffData } = await supabase
          .from('locations')
          .select('id, name, address, extra_fee')
          .eq('slug', dropoffLocationSlug)
          .single();
        
        if (dropoffData) setDropoffLocation(dropoffData);
      }
      
      // Load extras from URL params
      const extrasFromUrl: SelectedExtra[] = [];
      let index = 0;
      while (true) {
        const extraId = searchParams.get(`extra_${index}_id`);
        const extraQuantity = searchParams.get(`extra_${index}_quantity`);
        
        if (!extraId) break;
        
        // Load extra data
        const { data: extraData } = await supabase
          .from('extras')
          .select('id, name, price_per_day, price_per_rental, min_quantity')
          .eq('id', extraId)
          .single();
        
        if (extraData && extraQuantity) {
          extrasFromUrl.push({
            ...extraData,
            quantity: parseInt(extraQuantity)
          });
        }
        
        index++;
      }
      
      setSelectedExtras(extrasFromUrl);
      
    } catch (error: any) {
      console.error('Error loading data:', error);
      setError(error.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // Función para aplicar cupón
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError(t("Introduce un código de cupón"));
      return;
    }

    try {
      setCouponLoading(true);
      setCouponError(null);

      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim(),
          pickup_date: pickupDate,
          dropoff_date: dropoffDate,
          rental_amount: subtotalBeforeCoupon,
        }),
      });

      const data = await response.json();

      if (data.valid && data.coupon) {
        setAppliedCoupon(data.coupon);
        setCouponError(null);
        setCouponCode(""); // Limpiar input
      } else {
        setCouponError(data.error || t("Cupón no válido"));
        setAppliedCoupon(null);
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      setCouponError(t("Error al validar el cupón"));
    } finally {
      setCouponLoading(false);
    }
  };

  // Función para quitar cupón
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
    setCouponCode("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vehicle || !pickupLocation || !dropoffLocation) {
      setError('Faltan datos necesarios para crear la reserva');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Step 1: Create or update customer
      let customerId: string;
      
      // Check if customer already exists by email or DNI (sin auth requerido)
      const { data: existingCustomers, error: searchError } = await supabase
        .from('customers')
        .select('id, total_bookings, total_spent')
        .or(`email.eq.${customerEmail},dni.eq.${customerDni}`)
        .limit(1);
      
      if (searchError) {
        console.error('Error searching customer:', searchError);
        // Si falla la búsqueda, intentar crear directamente
      }
      
      if (existingCustomers && existingCustomers.length > 0) {
        // Customer exists - use existing ID
        customerId = existingCustomers[0].id;
        console.log('Using existing customer:', customerId);
        
        // Try to update customer info (optional, may fail due to RLS)
        const { error: updateError } = await supabase
          .from('customers')
          .update({
            name: customerName,
            phone: customerPhone,
            dni: customerDni,
            date_of_birth: customerDateOfBirth || null,
            address: customerAddress,
            city: customerCity,
            postal_code: customerPostalCode,
            country: customerCountry,
            driver_license: customerDriverLicense || null,
            driver_license_expiry: customerDriverLicenseExpiry || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', customerId);
        
        if (updateError) {
          console.warn('Could not update customer info (using existing):', updateError);
          // No lanzar error, continuar con el customer existente
        }
      } else {
        // Create new customer using API route to bypass RLS
        const createResponse = await fetch('/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: customerEmail,
            name: customerName,
            phone: customerPhone,
            dni: customerDni,
            date_of_birth: customerDateOfBirth || null,
            address: customerAddress,
            city: customerCity,
            postal_code: customerPostalCode,
            country: customerCountry,
            driver_license: customerDriverLicense || null,
            driver_license_expiry: customerDriverLicenseExpiry || null,
          }),
        });
        
        if (!createResponse.ok) {
          const errorData = await createResponse.json();
          throw new Error(errorData.error || 'Error al crear cliente');
        }
        
        const { customer } = await createResponse.json();
        customerId = customer.id;
        console.log('Created new customer:', customerId);
      }

      // Step 2: Generate booking number
      const bookingNumber = `FG${Date.now().toString().slice(-8)}`;

      // Step 3: Crear booking desde API (bypasea RLS)
      const bookingExtrasData = selectedExtras.map(extra => {
        const effectiveDays = extra.min_quantity ? Math.max(days, extra.min_quantity) : days;
        const unitPrice = extra.price_per_rental > 0 
          ? extra.price_per_rental 
          : extra.price_per_day * effectiveDays;
        
        return {
          extra_id: extra.id,
          quantity: extra.quantity,
          unit_price: unitPrice,
          total_price: unitPrice * extra.quantity,
        };
      });

      const createBookingResponse = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking: {
            booking_number: bookingNumber,
            vehicle_id: vehicle.id,
            customer_id: customerId,
            pickup_date: pickupDate,
            dropoff_date: dropoffDate,
            pickup_time: pickupTime || '11:00',
            dropoff_time: dropoffTime || '11:00',
            pickup_location_id: pickupLocation.id,
            dropoff_location_id: dropoffLocation.id,
            days: days,
            base_price: basePrice,
            extras_price: extrasPrice,
            location_fee: locationFee,
            total_price: totalPrice,
            status: 'pending',
            payment_status: 'pending',
            // Snapshot básico del cliente (solo nombre y email para GDPR/auditoría)
            customer_name: customerName,
            customer_email: customerEmail,
            notes: notes,
            // Datos del cupón (si se aplicó)
            coupon_id: appliedCoupon?.id || null,
            coupon_code: appliedCoupon?.code || null,
            coupon_discount: appliedCoupon?.discount_amount || 0,
          },
          extras: bookingExtrasData,
          // customerStats ya no es necesario - se actualiza automáticamente via trigger DB
        }),
      });

      if (!createBookingResponse.ok) {
        const errorData = await createBookingResponse.json();
        throw new Error(errorData.error || 'Error al crear la reserva');
      }

      const { booking } = await createBookingResponse.json();

      // Step 4: Enviar email de confirmación de reserva creada
      try {
        await fetch('/api/bookings/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'booking_created',
            bookingId: booking.id,
          }),
        });
      } catch (emailError) {
        console.error('Error enviando email de confirmación:', emailError);
        // No bloqueamos el proceso si falla el email
      }

      // Step 7: Redirect to booking detail page (con ruta traducida)
      const bookingDetailPath = getTranslatedRoute(`/reservar/${booking.id}`, language);
      router.push(bookingDetailPath);
      
    } catch (error: any) {
      console.error('Error creating booking:', error);
      setError(error.message || 'Error al crear la reserva');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-furgocasa-orange mx-auto mb-4"></div>
          <p className="text-gray-600">{t("Cargando información...")}</p>
        </div>
      </div>
    );
  }

  if (error && !vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("Error")}</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => router.back()}
            className="inline-block bg-furgocasa-orange text-white font-semibold py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors"
          >
            {t("Volver atrás")}
          </button>
        </div>
      </div>
    );
  }

  const mainImage = vehicle?.images?.find(img => img.is_primary) || vehicle?.images?.[0];

  return (
    <>      
      <main className="min-h-screen bg-gray-50 pt-8 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t("Completa tu reserva")}
            </h1>
            <p className="text-gray-600">
              {t("Solo necesitamos algunos datos para confirmar tu reserva")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <form id="reservation-form" onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <User className="h-6 w-6 text-furgocasa-blue" />
                  {t("Tus datos")}
                </h2>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      {t("Nom et prénom(s)")} *
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-blue focus:border-transparent"
                      placeholder={t("Nom et prénom(s)")}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      {t("Email")} *
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-blue focus:border-transparent"
                      placeholder="tu@email.com"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      {t("Teléfono")} *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-blue focus:border-transparent"
                      placeholder="+34 600 000 000"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* DNI/NIE */}
                    <div>
                      <label htmlFor="dni" className="block text-sm font-medium text-gray-700 mb-2">
                        {t("DNI/NIE")} *
                      </label>
                      <input
                        type="text"
                        id="dni"
                        required
                        value={customerDni}
                        onChange={(e) => setCustomerDni(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-blue focus:border-transparent"
                        placeholder="12345678A"
                      />
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-2">
                        {t("Fecha de nacimiento")} *
                      </label>
                      <input
                        type="date"
                        id="dob"
                        required
                        value={customerDateOfBirth}
                        onChange={(e) => setCustomerDateOfBirth(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-blue focus:border-transparent min-w-0 max-w-full box-border"
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                      {t("Dirección")} *
                    </label>
                    <input
                      type="text"
                      id="address"
                      required
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-blue focus:border-transparent"
                      placeholder={t("Calle, número, piso...")}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* City */}
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                        {t("Ciudad")} *
                      </label>
                      <input
                        type="text"
                        id="city"
                        required
                        value={customerCity}
                        onChange={(e) => setCustomerCity(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-blue focus:border-transparent"
                        placeholder={t("Tu ciudad")}
                      />
                    </div>

                    {/* Postal Code */}
                    <div>
                      <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-2">
                        {t("Código Postal")} *
                      </label>
                      <input
                        type="text"
                        id="postal_code"
                        required
                        value={customerPostalCode}
                        onChange={(e) => setCustomerPostalCode(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-blue focus:border-transparent"
                        placeholder="30001"
                      />
                    </div>

                    {/* Country */}
                    <div>
                      <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                        {t("País")} *
                      </label>
                      <select
                        id="country"
                        required
                        value={customerCountry}
                        onChange={(e) => setCustomerCountry(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-blue focus:border-transparent bg-white"
                      >
                        <option value="España">España</option>
                        <option value="Argentina">Argentina</option>
                        <option value="México">México</option>
                        <option value="Colombia">Colombia</option>
                        <option value="Chile">Chile</option>
                        <option value="Perú">Perú</option>
                        <option value="Venezuela">Venezuela</option>
                        <option value="Ecuador">Ecuador</option>
                        <option value="Uruguay">Uruguay</option>
                        <option value="Paraguay">Paraguay</option>
                        <option value="Bolivia">Bolivia</option>
                        <option value="Brasil">Brasil</option>
                        <option value="Portugal">Portugal</option>
                        <option value="Francia">Francia</option>
                        <option value="Italia">Italia</option>
                        <option value="Alemania">Alemania</option>
                        <option value="Reino Unido">Reino Unido</option>
                        <option value="Estados Unidos">Estados Unidos</option>
                        <option value="Canadá">Canadá</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>
                  </div>

                  {/* Driver License Section */}
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-furgocasa-blue" />
                      {t("Datos del carnet de conducir")}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Driver License Number */}
                      <div>
                        <label htmlFor="driver_license" className="block text-sm font-medium text-gray-700 mb-2">
                          {t("Número de carnet")} *
                        </label>
                        <input
                          type="text"
                          id="driver_license"
                          required
                          value={customerDriverLicense}
                          onChange={(e) => setCustomerDriverLicense(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-blue focus:border-transparent"
                          placeholder="123456789"
                        />
                      </div>

                      {/* Driver License Expiry */}
                      <div>
                        <label htmlFor="license_expiry" className="block text-sm font-medium text-gray-700 mb-2">
                          {t("Fecha de caducidad")} *
                        </label>
                        <input
                          type="date"
                          id="license_expiry"
                          required
                          value={customerDriverLicenseExpiry}
                          onChange={(e) => setCustomerDriverLicenseExpiry(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-blue focus:border-transparent min-w-0 max-w-full box-border"
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="pt-4">
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                      {t("Notas adicionales")} ({t("opcional")})
                    </label>
                    <textarea
                      id="notes"
                      rows={4}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-blue focus:border-transparent resize-none"
                      placeholder={t("¿Algo que debamos saber?")}
                    />
                  </div>

                  {/* Coupon Section */}
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Tag className="h-5 w-5 text-furgocasa-blue" />
                      {t("¿Tienes un cupón de descuento?")}
                    </h3>
                    
                    {appliedCoupon ? (
                      // Cupón aplicado
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <div>
                              <p className="font-semibold text-green-800">
                                {t("Cupón aplicado")}: {appliedCoupon.code}
                              </p>
                              <p className="text-sm text-green-600">
                                {appliedCoupon.discount_type === 'percentage' 
                                  ? `${appliedCoupon.discount_value}% ${t("de descuento")}`
                                  : `${formatPrice(appliedCoupon.discount_value)} ${t("de descuento")}`
                                }
                                {' '}- {t("Ahorras")} {formatPrice(appliedCoupon.discount_amount)}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveCoupon}
                            className="p-2 text-green-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title={t("Quitar cupón")}
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Formulario para introducir cupón
                      <div className="space-y-3">
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => {
                              setCouponCode(e.target.value.toUpperCase());
                              setCouponError(null);
                            }}
                            placeholder={t("Introduce tu código")}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-blue focus:border-transparent uppercase"
                            disabled={couponLoading}
                          />
                          <button
                            type="button"
                            onClick={handleApplyCoupon}
                            disabled={couponLoading || !couponCode.trim()}
                            className="px-6 py-3 bg-furgocasa-blue text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {couponLoading ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              t("Aplicar")
                            )}
                          </button>
                        </div>
                        {couponError && (
                          <p className="text-sm text-red-600 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            {couponError}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-furgocasa-orange text-white font-semibold py-4 px-6 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        {t("Creando reserva...")}
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5" />
                        {t("Crear reserva")}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Sidebar - Booking Summary */}
            <div className="space-y-6">
              {/* Vehicle Summary */}
              {vehicle && (
                <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {t("Resumen")}
                  </h3>

                  {/* Vehicle Image & Info */}
                  {mainImage && (
                    <div className="relative h-40 bg-gray-200 rounded-lg overflow-hidden mb-4">
                      <Image
                        src={mainImage.image_url}
                        alt={vehicle.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="mb-4">
                    <h4 className="font-bold text-gray-900 text-lg">{vehicle.name}</h4>
                    <p className="text-sm text-gray-600">{vehicle.brand} {vehicle.model}</p>
                  </div>

                  <div className="flex gap-4 mb-6 pb-6 border-b border-gray-200">
                    <span className="flex items-center gap-1 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      {vehicle.seats} {t("plazas")}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-gray-600">
                      <Moon className="h-4 w-4" />
                      {vehicle.beds} {t("plazas noche")}
                    </span>
                  </div>

                  {/* Dates */}
                  <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-furgocasa-blue flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="text-gray-500">{t("Recogida")}</p>
                        <p className="font-semibold text-gray-900">
                          {pickupDate && new Date(pickupDate + 'T00:00:00').toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            timeZone: 'Europe/Madrid'
                          })}
                        </p>
                        <p className="text-gray-600">{pickupTime}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-furgocasa-blue flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="text-gray-500">{t("Devolución")}</p>
                        <p className="font-semibold text-gray-900">
                          {dropoffDate && new Date(dropoffDate + 'T00:00:00').toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            timeZone: 'Europe/Madrid'
                          })}
                        </p>
                        <p className="text-gray-600">{dropoffTime}</p>
                      </div>
                    </div>
                  </div>

                  {/* Locations */}
                  {pickupLocation && (
                    <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-furgocasa-blue flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="text-gray-500">{t("Recogida en")}</p>
                          <p className="font-semibold text-gray-900">{pickupLocation.name}</p>
                        </div>
                      </div>

                      {dropoffLocation && dropoffLocation.id !== pickupLocation.id && (
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-furgocasa-blue flex-shrink-0 mt-0.5" />
                          <div className="text-sm">
                            <p className="text-gray-500">{t("Devolución en")}</p>
                            <p className="font-semibold text-gray-900">{dropoffLocation.name}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Price */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{t("Alquiler")} ({days} {t("días")})</span>
                      <span className="font-semibold">{formatPrice(basePrice)}</span>
                    </div>
                    
                    {selectedExtras.length > 0 && selectedExtras.map((extra) => {
                      const effectiveDays = extra.min_quantity ? Math.max(days, extra.min_quantity) : days;
                      const price = extra.price_per_rental > 0 
                        ? extra.price_per_rental 
                        : extra.price_per_day * effectiveDays;
                      return (
                        <div key={extra.id} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {extra.name} {extra.quantity > 1 && `(x${extra.quantity})`}
                          </span>
                          <span className="font-semibold">{formatPrice(price * extra.quantity)}</span>
                        </div>
                      );
                    })}

                    {/* Cargo extra por ubicación */}
                    {locationFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{t("Cargo extra por ubicación")}</span>
                        <span className="font-semibold">{formatPrice(locationFee)}</span>
                      </div>
                    )}

                    {/* Descuento de cupón */}
                    {appliedCoupon && (
                      <div className="flex justify-between text-sm text-green-600 pt-2 border-t border-gray-100">
                        <span className="flex items-center gap-1">
                          <Tag className="h-4 w-4" />
                          {t("Cupón")} {appliedCoupon.code}
                        </span>
                        <span className="font-semibold">-{formatPrice(appliedCoupon.discount_amount)}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">{t("Total")}</span>
                      <div className="text-right">
                        {appliedCoupon && (
                          <p className="text-sm text-gray-400 line-through">{formatPrice(subtotalBeforeCoupon)}</p>
                        )}
                        <span className="text-3xl font-bold text-furgocasa-orange">{formatPrice(totalPrice)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Barra flotante fija inferior - Solo móvil/tablet */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-[60] safe-area-inset-bottom">
        <div className="container mx-auto px-4 py-3">
          {/* Desglose de precios expandible */}
          {selectedExtras.length > 0 && (
            <div className="mb-2 pb-2 border-b border-gray-100">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{t("Alquiler")} ({days} {days === 1 ? t("día") : t("días")})</span>
                <span>{formatPrice(basePrice)}</span>
              </div>
              {selectedExtras.slice(0, 2).map((extra) => {
                const effectiveDays = extra.min_quantity ? Math.max(pricingDays, extra.min_quantity) : pricingDays;
                const price = extra.price_per_rental > 0 
                  ? extra.price_per_rental 
                  : extra.price_per_day * effectiveDays;
                return (
                  <div key={extra.id} className="flex justify-between text-xs text-gray-500">
                    <span>{extra.name} {extra.quantity > 1 && `×${extra.quantity}`}</span>
                    <span>+{formatPrice(price * extra.quantity)}</span>
                  </div>
                );
              })}
              {selectedExtras.length > 2 && (
                <p className="text-xs text-gray-400">+{selectedExtras.length - 2} {t("extras más")}</p>
              )}
            </div>
          )}
          
          {/* Precio total y botón */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">{t("Total")}</p>
              <p className="text-2xl font-bold text-furgocasa-orange transition-all duration-300">{formatPrice(totalPrice)}</p>
            </div>
            <button
              type="submit"
              form="reservation-form"
              disabled={submitting}
              className="bg-furgocasa-orange text-white font-bold py-3 px-6 rounded-xl hover:bg-orange-600 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {t("Creando...")}
                </>
              ) : (
                <>
                  {t("Crear reserva")}
                  <CreditCard className="h-5 w-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Wrapper con Suspense para useSearchParams
export default function NuevaReservaPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <NuevaReservaContent />
    </Suspense>
  );
}
