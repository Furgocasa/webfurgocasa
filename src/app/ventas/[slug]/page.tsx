import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { VehicleGallery } from "@/components/vehicle/vehicle-gallery";
import Link from "next/link";
import { notFound } from "next/navigation";
import { 
  ArrowLeft, Car, Calendar, Gauge, Fuel, Users, Bed, 
  CheckCircle, Phone, Mail, MapPin, Shield, Wrench, Ruler,
  Share2, Heart
} from "lucide-react";
import { VehicleEquipmentDisplay } from "@/components/vehicle/equipment-display";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Cargar vehículo desde Supabase
async function getVehicle(slug: string) {
  const supabase = await createClient();
  
  const { data: vehicle, error } = await supabase
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
    .eq('slug', slug)
    .eq('is_for_sale', true)
    .eq('sale_status', 'available')
    .single();

  if (error) {
    console.error('Error loading vehicle:', error);
    return null;
  }

  return vehicle;
}

const conditionLabels: Record<string, { label: string; color: string }> = {
  new: { label: "Nuevo", color: "bg-green-100 text-green-700" },
  like_new: { label: "Como nuevo", color: "bg-emerald-100 text-emerald-700" },
  excellent: { label: "Excelente", color: "bg-blue-100 text-blue-700" },
  good: { label: "Buen estado", color: "bg-yellow-100 text-yellow-700" },
  fair: { label: "Aceptable", color: "bg-orange-100 text-orange-700" },
};

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("es-ES", { month: "long", year: "numeric" });
}

export default async function VehicleSalePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const vehicle = await getVehicle(slug);

  if (!vehicle) {
    notFound();
  }

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-50 overflow-x-hidden">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link
                href="/ventas"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-furgocasa-orange transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver a vehículos en venta
              </Link>
              <div className="flex items-center gap-3">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Favorito">
                  <Heart className="h-5 w-5 text-gray-400" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Compartir">
                  <Share2 className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-4 md:py-8 max-w-7xl overflow-hidden">
          {/* Mobile CTA - Visible solo en móvil, arriba */}
          <div className="lg:hidden bg-white rounded-xl shadow-sm p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-gray-500">Precio de venta</p>
                <p className="text-2xl font-bold text-furgocasa-orange">{formatPrice(vehicle.sale_price)}</p>
                {vehicle.sale_price_negotiable && (
                  <p className="text-xs text-purple-600">Negociable</p>
                )}
              </div>
              <a href="tel:+34868364161" className="bg-furgocasa-orange text-white font-semibold py-2.5 px-5 rounded-lg text-sm">
                Llamar
              </a>
            </div>
            <a
              href={`https://wa.me/34868364161?text=Hola, me interesa el ${vehicle.name}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-green-500 text-white font-semibold py-2.5 rounded-lg text-sm"
            >
              WhatsApp
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
            {/* Columna principal */}
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              {/* Galería */}
              <VehicleGallery 
                images={vehicle.images || []} 
                vehicleName={vehicle.name} 
              />

              {/* Info principal */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6">
                <div className="flex flex-wrap gap-1.5 md:gap-2 mb-3 md:mb-4">
                  <span className={`px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs md:text-sm font-medium ${conditionLabels[vehicle.condition].color}`}>
                    {conditionLabels[vehicle.condition].label}
                  </span>
                  <span className="px-2 md:px-3 py-0.5 md:py-1 bg-gray-100 rounded-full text-xs md:text-sm text-gray-700">
                    {vehicle.category.name}
                  </span>
                  {vehicle.sale_price_negotiable && (
                    <span className="px-2 md:px-3 py-0.5 md:py-1 bg-purple-100 text-purple-700 rounded-full text-xs md:text-sm font-medium">
                      Negociable
                    </span>
                  )}
                </div>

                <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">{vehicle.name}</h1>
                <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">{vehicle.short_description}</p>

                {/* Specs grid */}
                <div className="grid grid-cols-4 gap-2 md:gap-4 py-4 md:py-6 border-y border-gray-100">
                  <div className="text-center">
                    <Gauge className="h-5 w-5 md:h-6 md:w-6 mx-auto text-gray-400 mb-1 md:mb-2" />
                    <p className="text-sm md:text-lg font-bold text-gray-900">{vehicle.mileage.toLocaleString()}<span className="hidden md:inline"> km</span></p>
                    <p className="text-xs md:text-sm text-gray-500">Km</p>
                  </div>
                  <div className="text-center">
                    <Calendar className="h-5 w-5 md:h-6 md:w-6 mx-auto text-gray-400 mb-1 md:mb-2" />
                    <p className="text-sm md:text-lg font-bold text-gray-900">{vehicle.year}</p>
                    <p className="text-xs md:text-sm text-gray-500">Año</p>
                  </div>
                  <div className="text-center">
                    <Fuel className="h-5 w-5 md:h-6 md:w-6 mx-auto text-gray-400 mb-1 md:mb-2" />
                    <p className="text-sm md:text-lg font-bold text-gray-900 truncate">{vehicle.fuel_type}</p>
                    <p className="text-xs md:text-sm text-gray-500">Comb.</p>
                  </div>
                  <div className="text-center">
                    <Car className="h-5 w-5 md:h-6 md:w-6 mx-auto text-gray-400 mb-1 md:mb-2" />
                    <p className="text-sm md:text-lg font-bold text-gray-900 truncate">{vehicle.transmission}</p>
                    <p className="text-xs md:text-sm text-gray-500">Cambio</p>
                  </div>
                </div>

                {/* Descripción */}
                <div className="mt-4 md:mt-6">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">Descripción</h2>
                  <div
                    className="prose prose-sm md:prose-base prose-gray max-w-none"
                    dangerouslySetInnerHTML={{ __html: vehicle.description }}
                  />
                </div>
              </div>

              {/* Equipamiento */}
              {(vehicle as any).vehicle_equipment && (vehicle as any).vehicle_equipment.length > 0 && (
                <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6">
                  <VehicleEquipmentDisplay
                    equipment={(vehicle as any).vehicle_equipment?.map((ve: any) => ve.equipment) || []}
                    variant="grid"
                    groupByCategory={true}
                    title="Equipamiento"
                  />
                </div>
              )}

              {/* Especificaciones Técnicas */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">Especificaciones técnicas</h2>
                
                <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                  {/* Habitabilidad */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 md:mb-3 text-sm md:text-base">Habitabilidad</h3>
                    <div className="space-y-1 md:space-y-2">
                      <div className="flex justify-between py-1.5 md:py-2 border-b border-gray-100 text-sm md:text-base">
                        <span className="text-gray-600">Plazas homologadas</span>
                        <span className="font-medium">{vehicle.seats}</span>
                      </div>
                      <div className="flex justify-between py-1.5 md:py-2 border-b border-gray-100 text-sm md:text-base">
                        <span className="text-gray-600">Plazas para dormir</span>
                        <span className="font-medium">{vehicle.beds}</span>
                      </div>
                      <div className="flex justify-between py-1.5 md:py-2 border-b border-gray-100 text-sm md:text-base">
                        <span className="text-gray-600">Longitud</span>
                        <span className="font-medium">{vehicle.length_m} m</span>
                      </div>
                      <div className="flex justify-between py-1.5 md:py-2 border-b border-gray-100 text-sm md:text-base">
                        <span className="text-gray-600">Anchura</span>
                        <span className="font-medium">{vehicle.width_m} m</span>
                      </div>
                      <div className="flex justify-between py-1.5 md:py-2 text-sm md:text-base">
                        <span className="text-gray-600">Altura</span>
                        <span className="font-medium">{vehicle.height_m} m</span>
                      </div>
                    </div>
                  </div>

                  {/* Motor */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 md:mb-3 text-sm md:text-base">Motor y mecánica</h3>
                    <div className="space-y-1 md:space-y-2">
                      <div className="flex justify-between py-1.5 md:py-2 border-b border-gray-100 text-sm md:text-base">
                        <span className="text-gray-600">Motor</span>
                        <span className="font-medium">{vehicle.engine_displacement}</span>
                      </div>
                      <div className="flex justify-between py-1.5 md:py-2 border-b border-gray-100 text-sm md:text-base">
                        <span className="text-gray-600">Potencia</span>
                        <span className="font-medium">{vehicle.engine_power}</span>
                      </div>
                      <div className="flex justify-between py-1.5 md:py-2 border-b border-gray-100 text-sm md:text-base">
                        <span className="text-gray-600">Combustible</span>
                        <span className="font-medium">{vehicle.fuel_type}</span>
                      </div>
                      <div className="flex justify-between py-1.5 md:py-2 border-b border-gray-100 text-sm md:text-base">
                        <span className="text-gray-600">Cambio</span>
                        <span className="font-medium">{vehicle.transmission}</span>
                      </div>
                      <div className="flex justify-between py-1.5 md:py-2 text-sm md:text-base">
                        <span className="text-gray-600">Propietarios anteriores</span>
                        <span className="font-medium">{vehicle.previous_owners}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dimensiones (si hay) */}
              {(vehicle.length_m || vehicle.width_m || vehicle.height_m) && (
                <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">Dimensiones</h2>
                  <div className="grid grid-cols-3 gap-2 md:gap-4">
                    {vehicle.length_m && (
                      <div className="text-center p-3 md:p-4 bg-gray-50 rounded-lg">
                        <Ruler className="h-5 w-5 md:h-6 md:w-6 mx-auto text-gray-400 mb-1 md:mb-2" />
                        <p className="font-bold text-sm md:text-base">{vehicle.length_m} m</p>
                        <p className="text-xs md:text-sm text-gray-500">Largo</p>
                      </div>
                    )}
                    {vehicle.width_m && (
                      <div className="text-center p-3 md:p-4 bg-gray-50 rounded-lg">
                        <Ruler className="h-5 w-5 md:h-6 md:w-6 mx-auto text-gray-400 mb-1 md:mb-2 rotate-90" />
                        <p className="font-bold text-sm md:text-base">{vehicle.width_m} m</p>
                        <p className="text-xs md:text-sm text-gray-500">Ancho</p>
                      </div>
                    )}
                    {vehicle.height_m && (
                      <div className="text-center p-3 md:p-4 bg-gray-50 rounded-lg">
                        <Ruler className="h-5 w-5 md:h-6 md:w-6 mx-auto text-gray-400 mb-1 md:mb-2" />
                        <p className="font-bold text-sm md:text-base">{vehicle.height_m} m</p>
                        <p className="text-xs md:text-sm text-gray-500">Alto</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar - Solo visible en desktop */}
            <div className="hidden lg:block space-y-6">
              {/* Precio */}
              <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
                <div className="text-center mb-6">
                  <p className="text-sm text-gray-500 mb-1">Precio de venta</p>
                  <p className="text-4xl font-bold text-furgocasa-orange">
                    {formatPrice(vehicle.sale_price)}
                  </p>
                  {vehicle.sale_price_negotiable && (
                    <p className="text-sm text-purple-600 mt-1">Precio negociable</p>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  <a
                    href="tel:+34868364161"
                    className="w-full flex items-center justify-center gap-2 bg-furgocasa-orange text-white font-semibold py-3 px-4 rounded-lg hover:bg-furgocasa-orange-dark transition-colors"
                  >
                    <Phone className="h-5 w-5" />
                    Llamar ahora
                  </a>
                  <a
                    href={`https://wa.me/34868364161?text=Hola, me interesa el ${vehicle.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-green-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    WhatsApp
                  </a>
                  <button className="w-full flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                    <Mail className="h-5 w-5" />
                    Solicitar información
                  </button>
                </div>

                {/* También en alquiler */}
                {vehicle.is_for_rent && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700 font-medium mb-2">
                      ¿Prefieres alquilarlo primero?
                    </p>
                    <p className="text-sm text-blue-600 mb-3">
                      Este vehículo también está disponible para alquiler desde {formatPrice(vehicle.base_price_per_day)}/día
                    </p>
                    <Link
                      href={`/vehiculos/${vehicle.slug}`}
                      className="text-sm font-medium text-blue-700 hover:underline"
                    >
                      Ver opción de alquiler →
                    </Link>
                  </div>
                )}

                {/* Info adicional */}
                <div className="mt-6 pt-6 border-t border-gray-100 space-y-3 text-sm">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Matriculado en {formatDate(vehicle.registration_date)}</span>
                  </div>
                  {vehicle.next_itv_date && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <Wrench className="h-4 w-4" />
                      <span>Próxima ITV: {formatDate(vehicle.next_itv_date)}</span>
                    </div>
                  )}
                  {vehicle.warranty_until && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <Shield className="h-4 w-4" />
                      <span>Garantía hasta {formatDate(vehicle.warranty_until)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Ubicación */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Ubicación</h3>
                <div className="h-40 bg-gray-200 rounded-lg mb-4 flex items-center justify-center text-gray-400">
                  Mapa
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Furgocasa Murcia</p>
                    <p className="text-gray-600 text-sm">Avenida Puente Tocinos, 4</p>
                    <p className="text-gray-600 text-sm">30007 Casillas - Murcia</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
