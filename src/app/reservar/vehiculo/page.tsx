"use client";

import { useState, useEffect, Suspense } from "react";
import { useLanguage } from "@/contexts/language-context";
import { useRouter, useSearchParams } from "next/navigation";

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
  ArrowLeft, Calendar, MapPin, Users, Bed, Fuel, Settings, 
  ArrowRight, Plus, Minus, AlertCircle, Loader2, Ruler
} from "lucide-react";
import Link from "next/link";
import { VehicleGallery } from "@/components/vehicle/vehicle-gallery";
import { VehicleEquipmentDisplay } from "@/components/vehicle/equipment-display";
import { formatPrice } from "@/lib/utils";

// No necesitamos interfaces específicas, usamos los datos tal cual vienen de Supabase
// Los nombres de campos reales son: image_url, alt_text, is_primary (según SUPABASE-SCHEMA-REAL.md)

interface Extra {
  id: string;
  name: string;
  description: string;
  price_per_day: number;
  price_per_rental: number;
  price_type: 'per_day' | 'per_rental' | 'one_time';
  max_quantity: number;
  icon: string;
}

interface SelectedExtra {
  extra: Extra;
  quantity: number;
}

function ReservarVehiculoContent() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get params from URL
  const vehicleId = searchParams.get('vehicle_id');
  const pickupDate = searchParams.get('pickup_date');
  const dropoffDate = searchParams.get('dropoff_date');
  const pickupTime = searchParams.get('pickup_time');
  const dropoffTime = searchParams.get('dropoff_time');
  const pickupLocation = searchParams.get('pickup_location');
  const dropoffLocation = searchParams.get('dropoff_location');

  const [vehicle, setVehicle] = useState<any | null>(null);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [selectedExtras, setSelectedExtras] = useState<SelectedExtra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate days and prices
  const days = pickupDate && dropoffDate
    ? Math.ceil((new Date(dropoffDate).getTime() - new Date(pickupDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  
  const basePrice = vehicle ? vehicle.base_price_per_day * days : 0;
  
  const extrasPrice = selectedExtras.reduce((sum, item) => {
    // Calcular precio según el tipo de extra
    let price = 0;
    if (item.extra.price_type === 'per_rental' || item.extra.price_type === 'one_time') {
      price = item.extra.price_per_rental;
    } else {
      // per_day
      price = item.extra.price_per_day * days;
    }
    return sum + (price * item.quantity);
  }, 0);
  
  const totalPrice = basePrice + extrasPrice;

  useEffect(() => {
    if (!vehicleId || !pickupDate || !dropoffDate) {
      setError('Faltan parámetros de búsqueda');
      setLoading(false);
      return;
    }
    
    loadData();
  }, [vehicleId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      console.log('Loading vehicle:', vehicleId);
      
      // Load vehicle
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('vehicles')
        .select(`
          *,
          category:vehicle_categories(*),
          images:vehicle_images(*),
          vehicle_equipment(
            id,
            notes,
            equipment(*)
          )
        `)
        .eq('id', vehicleId)
        .eq('is_for_rent', true)
        .neq('status', 'inactive')
        .single();

      if (vehicleError) {
        console.error('Vehicle error:', vehicleError);
        throw vehicleError;
      }
      
      if (!vehicleData) {
        throw new Error('Vehículo no encontrado o no disponible');
      }
      
      // Sort images by is_primary first, then sort_order
      if (vehicleData.images) {
        vehicleData.images.sort((a: any, b: any) => {
          if (a.is_primary) return -1;
          if (b.is_primary) return 1;
          return (a.sort_order || 999) - (b.sort_order || 999);
        });
      }
      
      setVehicle(vehicleData as any);

      // Load available extras
      const { data: extrasData, error: extrasError } = await supabase
        .from('extras')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });

      if (extrasError) {
        console.error('Extras error:', extrasError);
        throw extrasError;
      }
      setExtras((extrasData || []) as Extra[]);
      
    } catch (error: any) {
      console.error('Error loading data:', error);
      setError(error.message || error.toString() || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const addExtra = (extra: Extra) => {
    setSelectedExtras(prev => {
      const existing = prev.find(item => item.extra.id === extra.id);
      
      // Verificar si ya alcanzó el máximo permitido
      if (existing && existing.quantity >= (extra.max_quantity || 1)) {
        return prev; // No permitir más
      }
      
      if (existing) {
        return prev.map(item => 
          item.extra.id === extra.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { extra, quantity: 1 }];
    });
  };

  const removeExtra = (extraId: string) => {
    setSelectedExtras(prev => {
      const existing = prev.find(item => item.extra.id === extraId);
      if (existing && existing.quantity > 1) {
        return prev.map(item => 
          item.extra.id === extraId 
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      return prev.filter(item => item.extra.id !== extraId);
    });
  };

  const handleContinue = () => {
    // Build URL with extras
    const params = new URLSearchParams({
      vehicle_id: vehicleId!,
      pickup_date: pickupDate!,
      dropoff_date: dropoffDate!,
      pickup_time: pickupTime || '11:00',
      dropoff_time: dropoffTime || '11:00',
      pickup_location: pickupLocation || '',
      dropoff_location: dropoffLocation || '',
    });

    // Add selected extras
    selectedExtras.forEach((item, index) => {
      params.append(`extra_${index}_id`, item.extra.id);
      params.append(`extra_${index}_quantity`, item.quantity.toString());
    });

    router.push(`/reservar/nueva?${params.toString()}`);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-furgocasa-orange mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">{t("Cargando vehículo...")}</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !vehicle) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("Error")}</h2>
            <p className="text-gray-600 mb-4">{error || t("Vehículo no encontrado")}</p>
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

  // Group extras by category (fallback to 'Extras' if no category exists)
  const extrasByCategory = { 'Extras': extras };

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-gray-50 py-6 md:py-12 overflow-x-hidden">
        <div className="container mx-auto px-4 max-w-7xl overflow-hidden">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Link 
              href={`/buscar?${searchParams.toString()}`}
              className="inline-flex items-center text-sm text-gray-600 hover:text-furgocasa-orange transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("Volver a resultados")}
            </Link>
          </div>

          {/* Mobile Summary - Sticky en móvil */}
          <div className="lg:hidden bg-white rounded-xl shadow-sm p-4 mb-4 sticky top-0 z-40">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">{days} {t("días")}</p>
                <p className="text-xl font-bold text-furgocasa-orange">{formatPrice(totalPrice)}</p>
              </div>
              <button
                onClick={handleContinue}
                className="bg-furgocasa-orange text-white font-semibold py-2.5 px-5 rounded-lg text-sm"
              >
                {t("Continuar")}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              {/* Gallery */}
              <VehicleGallery images={vehicle.images || []} vehicleName={vehicle.name} />

              {/* Vehicle Info */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6">
                {vehicle.category && (
                  <span className="px-2 md:px-3 py-1 bg-furgocasa-orange/10 text-furgocasa-orange rounded-full text-xs md:text-sm font-medium">
                    {vehicle.category.name}
                  </span>
                )}
                <h1 className="text-xl md:text-3xl font-bold text-gray-900 mt-3 md:mt-4 mb-1 md:mb-2">{vehicle.name}</h1>
                <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
                  {vehicle.brand} {vehicle.model ? `· ${vehicle.model}` : ''} · {vehicle.year}
                </p>

                {/* Features */}
                <div className="grid grid-cols-4 gap-2 md:gap-4 py-4 md:py-6 border-y border-gray-100">
                  <div className="text-center">
                    <Users className="h-5 w-5 md:h-6 md:w-6 mx-auto text-gray-400 mb-1 md:mb-2" />
                    <p className="font-bold text-sm md:text-base">{vehicle.seats}</p>
                    <p className="text-xs md:text-sm text-gray-500">{t("Plazas")}</p>
                  </div>
                  <div className="text-center">
                    <Bed className="h-5 w-5 md:h-6 md:w-6 mx-auto text-gray-400 mb-1 md:mb-2" />
                    <p className="font-bold text-sm md:text-base">{vehicle.beds}</p>
                    <p className="text-xs md:text-sm text-gray-500">{t("Camas")}</p>
                  </div>
                  <div className="text-center">
                    <Fuel className="h-5 w-5 md:h-6 md:w-6 mx-auto text-gray-400 mb-1 md:mb-2" />
                    <p className="font-bold text-sm md:text-base truncate">{vehicle.fuel_type}</p>
                    <p className="text-xs md:text-sm text-gray-500">{t("Comb.")}</p>
                  </div>
                  <div className="text-center">
                    <Settings className="h-5 w-5 md:h-6 md:w-6 mx-auto text-gray-400 mb-1 md:mb-2" />
                    <p className="font-bold text-sm md:text-base truncate">{vehicle.transmission}</p>
                    <p className="text-xs md:text-sm text-gray-500">{t("Cambio")}</p>
                  </div>
                </div>

                {/* Description */}
                {vehicle.description && (
                  <div className="mt-4 md:mt-6">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">{t("Descripción")}</h2>
                    <div 
                      className="prose prose-sm md:prose-base prose-gray max-w-none" 
                      dangerouslySetInnerHTML={{ __html: vehicle.description }} 
                    />
                  </div>
                )}
              </div>

              {/* Equipment - Dynamic display */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6">
                <VehicleEquipmentDisplay
                  equipment={(vehicle as any).vehicle_equipment?.map((ve: any) => ve.equipment) || []}
                  variant="grid"
                  groupByCategory={true}
                  title={t("Equipamiento")}
                />
              </div>

              {/* Especificaciones Técnicas */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">{t("Especificaciones técnicas")}</h2>
                
                <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                  {/* Habitabilidad */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 md:mb-3 text-sm md:text-base">{t("Habitabilidad")}</h3>
                    <div className="space-y-1 md:space-y-2">
                      <div className="flex justify-between py-1.5 md:py-2 border-b border-gray-100 text-sm md:text-base">
                        <span className="text-gray-600">{t("Plazas")}</span>
                        <span className="font-medium">{vehicle.seats}</span>
                      </div>
                      <div className="flex justify-between py-1.5 md:py-2 border-b border-gray-100 text-sm md:text-base">
                        <span className="text-gray-600">{t("Camas")}</span>
                        <span className="font-medium">{vehicle.beds}</span>
                      </div>
                      {vehicle.length_m && (
                        <div className="flex justify-between py-1.5 md:py-2 border-b border-gray-100 text-sm md:text-base">
                          <span className="text-gray-600">{t("Longitud")}</span>
                          <span className="font-medium">{vehicle.length_m} m</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Motor */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 md:mb-3 text-sm md:text-base">{t("Motor")}</h3>
                    <div className="space-y-1 md:space-y-2">
                      <div className="flex justify-between py-1.5 md:py-2 border-b border-gray-100 text-sm md:text-base">
                        <span className="text-gray-600">{t("Combustible")}</span>
                        <span className="font-medium">{vehicle.fuel_type}</span>
                      </div>
                      <div className="flex justify-between py-1.5 md:py-2 text-sm md:text-base">
                        <span className="text-gray-600">{t("Cambio")}</span>
                        <span className="font-medium">{vehicle.transmission}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dimensiones */}
              {(vehicle.length_m || vehicle.width_m || vehicle.height_m) && (
                <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">{t("Dimensiones")}</h2>
                  <div className="grid grid-cols-3 gap-2 md:gap-4">
                    {vehicle.length_m && (
                      <div className="text-center p-3 md:p-4 bg-gray-50 rounded-lg">
                        <Ruler className="h-5 w-5 md:h-6 md:w-6 mx-auto text-gray-400 mb-1 md:mb-2" />
                        <p className="font-bold text-sm md:text-base">{vehicle.length_m} m</p>
                        <p className="text-xs md:text-sm text-gray-500">{t("Largo")}</p>
                      </div>
                    )}
                    {vehicle.width_m && (
                      <div className="text-center p-3 md:p-4 bg-gray-50 rounded-lg">
                        <Ruler className="h-5 w-5 md:h-6 md:w-6 mx-auto text-gray-400 mb-1 md:mb-2 rotate-90" />
                        <p className="font-bold text-sm md:text-base">{vehicle.width_m} m</p>
                        <p className="text-xs md:text-sm text-gray-500">{t("Ancho")}</p>
                      </div>
                    )}
                    {vehicle.height_m && (
                      <div className="text-center p-3 md:p-4 bg-gray-50 rounded-lg">
                        <Ruler className="h-5 w-5 md:h-6 md:w-6 mx-auto text-gray-400 mb-1 md:mb-2" />
                        <p className="font-bold text-sm md:text-base">{vehicle.height_m} m</p>
                        <p className="text-xs md:text-sm text-gray-500">{t("Alto")}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Extras */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{t("Extras disponibles")}</h2>
                <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">{t("Personaliza tu experiencia")}</p>

                <div className="space-y-6">
                  {Object.entries(extrasByCategory).map(([category, categoryExtras]) => (
                    <div key={category}>
                      <h3 className="font-semibold text-gray-900 mb-3">{t(category)}</h3>
                      <div className="space-y-3">
                        {categoryExtras.map(extra => {
                          const selected = selectedExtras.find(item => item.extra.id === extra.id);
                          const quantity = selected?.quantity || 0;
                          const maxQuantity = extra.max_quantity || 1;
                          
                          // Calcular precio según el tipo
                          let priceDisplay = '';
                          if (extra.price_type === 'per_rental' || extra.price_type === 'one_time') {
                            priceDisplay = `${formatPrice(extra.price_per_rental)} / ${t("reserva")}`;
                          } else {
                            priceDisplay = `${formatPrice(extra.price_per_day)} / ${t("día")}`;
                          }

                          return (
                            <div 
                              key={extra.id}
                              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-furgocasa-blue transition-colors"
                            >
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900">{extra.name}</p>
                                {extra.description && (
                                  <p className="text-sm text-gray-600 mt-1">{extra.description}</p>
                                )}
                                <p className="text-sm font-medium text-furgocasa-orange mt-2">
                                  {priceDisplay}
                                  {maxQuantity > 1 && (
                                    <span className="text-xs text-gray-500 ml-2">
                                      (Máx: {maxQuantity})
                                    </span>
                                  )}
                                </p>
                              </div>

                              <div className="flex items-center gap-3 ml-4">
                                {maxQuantity > 1 ? (
                                  // Multiple quantity selector
                                  quantity > 0 ? (
                                    <>
                                      <button
                                        onClick={() => removeExtra(extra.id)}
                                        className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-gray-300 hover:border-furgocasa-orange hover:text-furgocasa-orange transition-colors"
                                      >
                                        <Minus className="h-4 w-4" />
                                      </button>
                                      <span className="font-bold text-gray-900 min-w-[20px] text-center">
                                        {quantity}
                                      </span>
                                      <button
                                        onClick={() => addExtra(extra)}
                                        disabled={quantity >= maxQuantity}
                                        className={`w-8 h-8 flex items-center justify-center rounded-full border-2 transition-colors ${
                                          quantity >= maxQuantity
                                            ? 'border-gray-300 text-gray-300 cursor-not-allowed'
                                            : 'border-furgocasa-orange bg-furgocasa-orange text-white hover:bg-orange-600'
                                        }`}
                                      >
                                        <Plus className="h-4 w-4" />
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      onClick={() => addExtra(extra)}
                                      className="px-4 py-2 bg-furgocasa-blue text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                      {t("Añadir")}
                                    </button>
                                  )
                                ) : (
                                  // Single selection (checkbox style)
                                  <button
                                    onClick={() => quantity > 0 ? removeExtra(extra.id) : addExtra(extra)}
                                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                                      quantity > 0
                                        ? 'bg-furgocasa-orange text-white hover:bg-orange-600'
                                        : 'bg-furgocasa-blue text-white hover:bg-blue-700'
                                    }`}
                                  >
                                    {quantity > 0 ? t("Añadido") : t("Añadir")}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar - Price Summary - Solo desktop */}
            <div className="hidden lg:block space-y-6">
              <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{t("Resumen")}</h3>

                {/* Dates */}
                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-furgocasa-blue flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="text-gray-500">{t("Recogida")}</p>
                      <p className="font-semibold text-gray-900">
                        {pickupDate && new Date(pickupDate).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-furgocasa-blue flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="text-gray-500">{t("Devolución")}</p>
                      <p className="font-semibold text-gray-900">
                        {dropoffDate && new Date(dropoffDate).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-furgocasa-blue flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="text-gray-500">{t("Ubicación")}</p>
                      <p className="font-semibold text-gray-900 capitalize">{pickupLocation}</p>
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t("Alquiler")} ({days} {t("días")})</span>
                    <span className="font-semibold">{formatPrice(basePrice)}</span>
                  </div>

                  {selectedExtras.map((item) => {
                    const price = item.extra.price_per_rental > 0 
                      ? item.extra.price_per_rental 
                      : item.extra.price_per_day * days;
                    return (
                      <div key={item.extra.id} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.extra.name} {item.quantity > 1 && `(x${item.quantity})`}
                        </span>
                        <span className="font-semibold">{formatPrice(price * item.quantity)}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Total */}
                <div className="mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">{t("Total")}</span>
                    <span className="text-3xl font-bold text-furgocasa-orange">{formatPrice(totalPrice)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    * {t("La fianza (500€) se paga en la entrega")}
                  </p>
                </div>

                {/* Continue Button */}
                <button
                  onClick={handleContinue}
                  className="w-full bg-furgocasa-orange text-white font-semibold py-4 px-6 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                >
                  {t("Continuar con la reserva")}
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default function ReservarVehiculoPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ReservarVehiculoContent />
    </Suspense>
  );
}
