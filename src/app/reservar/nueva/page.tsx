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
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { supabase } from "@/lib/supabase/client";
import { 
  ArrowLeft, Calendar, MapPin, Car, User, Mail, Phone, 
  CreditCard, AlertCircle, Loader2, FileText, Users, Bed
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";

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
}

interface SelectedExtra {
  id: string;
  name: string;
  quantity: number;
  price_per_day: number;
  price_per_rental: number;
}

function NuevaReservaContent() {
  const { t } = useLanguage();
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

  // Calculate days and price
  const days = pickupDate && dropoffDate
    ? Math.ceil((new Date(dropoffDate).getTime() - new Date(pickupDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  
  const basePrice = vehicle ? vehicle.base_price_per_day * days : 0;
  
  const extrasPrice = selectedExtras.reduce((sum, extra) => {
    const price = extra.price_per_rental > 0 
      ? extra.price_per_rental 
      : extra.price_per_day * days;
    return sum + (price * extra.quantity);
  }, 0);
  
  const totalPrice = basePrice + extrasPrice;

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
          .select('id, name, address')
          .eq('slug', pickupLocationSlug)
          .single();
        
        if (pickupData) setPickupLocation(pickupData);
      }

      if (dropoffLocationSlug) {
        const { data: dropoffData } = await supabase
          .from('locations')
          .select('id, name, address')
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
          .select('id, name, price_per_day, price_per_rental')
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

      // Step 3: Create booking (incluyendo snapshot de datos del cliente)
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
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
          total_price: totalPrice,
          deposit_amount: 500, // Default deposit
          status: 'pending',
          payment_status: 'pending',
          // Snapshot de datos del cliente para histórico
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          customer_dni: customerDni,
          customer_address: customerAddress,
          customer_city: customerCity,
          customer_postal_code: customerPostalCode,
          notes: notes,
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Step 4: Create booking_extras entries
      if (selectedExtras.length > 0) {
        const bookingExtrasData = selectedExtras.map(extra => {
          const unitPrice = extra.price_per_rental > 0 
            ? extra.price_per_rental 
            : extra.price_per_day * days;
          
          return {
            booking_id: booking.id,
            extra_id: extra.id,
            quantity: extra.quantity,
            unit_price: unitPrice,
            total_price: unitPrice * extra.quantity,
          };
        });

        const { error: extrasError } = await supabase
          .from('booking_extras')
          .insert(bookingExtrasData);

        if (extrasError) {
          console.error('Error creating booking extras:', extrasError);
          // Don't throw error, just log it
        }
      }

      // Step 5: Update customer statistics
      if (existingCustomers && existingCustomers.length > 0) {
        const { error: statsError } = await supabase
          .from('customers')
          .update({
            total_bookings: (existingCustomers[0].total_bookings || 0) + 1,
            total_spent: (existingCustomers[0].total_spent || 0) + totalPrice,
          })
          .eq('id', customerId);
        
        if (statsError) {
          console.error('Error updating customer stats:', statsError);
        }
      }

      // Step 6: Redirect to booking detail page
      router.push(`/reservar/${booking.id}`);
      
    } catch (error: any) {
      console.error('Error creating booking:', error);
      setError(error.message || 'Error al crear la reserva');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-furgocasa-orange mx-auto mb-4"></div>
            <p className="text-gray-600">{t("Cargando información...")}</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error && !vehicle) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("Error")}</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Link 
              href="/reservar"
              className="inline-block bg-furgocasa-orange text-white font-semibold py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors"
            >
              {t("Volver a buscar")}
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const mainImage = vehicle?.images?.find(img => img.is_primary) || vehicle?.images?.[0];

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Link 
              href="/reservar"
              className="inline-flex items-center text-sm text-gray-600 hover:text-furgocasa-orange transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("Volver a la búsqueda")}
            </Link>
          </div>

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
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
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
                      {t("Nombre completo")} *
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-blue focus:border-transparent"
                      placeholder={t("Tu nombre completo")}
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-blue focus:border-transparent"
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
                      <input
                        type="text"
                        id="country"
                        required
                        value={customerCountry}
                        onChange={(e) => setCustomerCountry(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-blue focus:border-transparent"
                        placeholder="España"
                      />
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-blue focus:border-transparent"
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
                      <Bed className="h-4 w-4" />
                      {vehicle.beds} {t("camas")}
                    </span>
                  </div>

                  {/* Dates */}
                  <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-furgocasa-blue flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="text-gray-500">{t("Recogida")}</p>
                        <p className="font-semibold text-gray-900">
                          {pickupDate && new Date(pickupDate).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
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
                          {dropoffDate && new Date(dropoffDate).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
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
                      const price = extra.price_per_rental > 0 
                        ? extra.price_per_rental 
                        : extra.price_per_day * days;
                      return (
                        <div key={extra.id} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {extra.name} {extra.quantity > 1 && `(x${extra.quantity})`}
                          </span>
                          <span className="font-semibold">{formatPrice(price * extra.quantity)}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">{t("Total")}</span>
                      <span className="text-3xl font-bold text-furgocasa-orange">{formatPrice(totalPrice)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
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
