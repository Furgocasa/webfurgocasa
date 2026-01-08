import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { LocalizedLink } from "@/components/localized-link";
import { notFound } from "next/navigation";
import { ArrowLeft, Users, Bed, Fuel, Settings, Ruler } from "lucide-react";
import { getVehicleBySlug } from "@/lib/supabase/queries";
import { VehicleGallery } from "@/components/vehicle/vehicle-gallery";
import { VehicleEquipmentDisplay } from "@/components/vehicle/equipment-display";
import { translateServer } from "@/lib/i18n/server-translation";

export default async function VehicleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  // Función de traducción del servidor
  const t = (key: string) => translateServer(key, 'es');
  
  const { slug } = await params;
  const { data: vehicle, error } = await getVehicleBySlug(slug);
  
  if (error || !vehicle) {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <LocalizedLink href="/vehiculos" className="inline-flex items-center gap-2 text-gray-600 hover:text-furgocasa-orange">
              <ArrowLeft className="h-4 w-4" />
              {t("Volver a vehículos")}
            </LocalizedLink>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Galería */}
              <VehicleGallery images={vehicle.images || []} vehicleName={vehicle.name} />

              {/* Info */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <span className="px-3 py-1 bg-furgocasa-orange/10 text-furgocasa-orange rounded-full text-sm font-medium">
                  {vehicle.category?.name || 'Camper'}
                </span>
                <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">{vehicle.name}</h1>
                <p className="text-gray-600 mb-6">{vehicle.brand} {vehicle.model ? `· ${vehicle.model}` : ''} · {vehicle.year}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-gray-100">
                  <div className="text-center"><Users className="h-6 w-6 mx-auto text-gray-400 mb-2" /><p className="font-bold">{vehicle.seats}</p><p className="text-sm text-gray-500">{t("Plazas")}</p></div>
                  <div className="text-center"><Bed className="h-6 w-6 mx-auto text-gray-400 mb-2" /><p className="font-bold">{vehicle.beds}</p><p className="text-sm text-gray-500">{t("Camas")}</p></div>
                  <div className="text-center"><Fuel className="h-6 w-6 mx-auto text-gray-400 mb-2" /><p className="font-bold">{vehicle.fuel_type}</p><p className="text-sm text-gray-500">{t("Combustible")}</p></div>
                  <div className="text-center"><Settings className="h-6 w-6 mx-auto text-gray-400 mb-2" /><p className="font-bold">{vehicle.transmission}</p><p className="text-sm text-gray-500">{t("Cambio")}</p></div>
                </div>

                <div className="mt-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">{t("Descripción")}</h2>
                  {vehicle.description ? (
                    <div className="prose prose-gray max-w-none" dangerouslySetInnerHTML={{ __html: vehicle.description }} />
                  ) : (
                    <p className="text-gray-600">No hay descripción disponible.</p>
                  )}
                </div>
              </div>

              {/* Equipamiento dinámico */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <VehicleEquipmentDisplay
                  equipment={(vehicle as any).vehicle_equipment?.map((ve: any) => ve.equipment) || []}
                  variant="grid"
                  groupByCategory={true}
                  title="Equipamiento"
                />
              </div>

              {/* Especificaciones Técnicas */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">{t("Especificaciones técnicas")}</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Habitabilidad */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">{t("Habitabilidad")}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">{t("Plazas homologadas")}</span>
                        <span className="font-medium">{vehicle.seats}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">{t("Plazas para dormir")}</span>
                        <span className="font-medium">{vehicle.beds}</span>
                      </div>
                      {vehicle.length_m && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">{t("Longitud")}</span>
                          <span className="font-medium">{vehicle.length_m} m</span>
                        </div>
                      )}
                      {vehicle.width_m && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">{t("Anchura")}</span>
                          <span className="font-medium">{vehicle.width_m} m</span>
                        </div>
                      )}
                      {vehicle.height_m && (
                        <div className="flex justify-between py-2">
                          <span className="text-gray-600">{t("Altura")}</span>
                          <span className="font-medium">{vehicle.height_m} m</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Motor */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">{t("Motor y mecánica")}</h3>
                    <div className="space-y-2">
                      {vehicle.engine_displacement && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">{t("Motor")}</span>
                          <span className="font-medium">{vehicle.engine_displacement}</span>
                        </div>
                      )}
                      {vehicle.engine_power && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">{t("Potencia")}</span>
                          <span className="font-medium">{vehicle.engine_power}</span>
                        </div>
                      )}
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">{t("Combustible")}</span>
                        <span className="font-medium">{vehicle.fuel_type}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">{t("Cambio")}</span>
                        <span className="font-medium">{vehicle.transmission}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dimensiones */}
              {(vehicle.length_m || vehicle.width_m || vehicle.height_m) && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">{t("Dimensiones")}</h2>
                  <div className="grid grid-cols-3 gap-4">
                    {vehicle.length_m && (
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <Ruler className="h-6 w-6 mx-auto text-gray-400 mb-2" />
                        <p className="font-bold">{vehicle.length_m} m</p>
                        <p className="text-sm text-gray-500">{t("Largo")}</p>
                      </div>
                    )}
                    {vehicle.width_m && (
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <Ruler className="h-6 w-6 mx-auto text-gray-400 mb-2 rotate-90" />
                        <p className="font-bold">{vehicle.width_m} m</p>
                        <p className="text-sm text-gray-500">{t("Ancho")}</p>
                      </div>
                    )}
                    {vehicle.height_m && (
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <Ruler className="h-6 w-6 mx-auto text-gray-400 mb-2" />
                        <p className="font-bold">{vehicle.height_m} m</p>
                        <p className="text-sm text-gray-500">{t("Alto")}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
                <div className="text-center mb-6">
                  <p className="text-sm text-gray-500">{t("Desde")}</p>
                  <p className="text-4xl font-bold text-furgocasa-orange">{vehicle.base_price_per_day}€<span className="text-lg font-normal text-gray-500">{t("/día")}</span></p>
                </div>
                <LocalizedLink href={`/reservar?vehiculo=${vehicle.slug}`} className="block w-full bg-furgocasa-orange text-white text-center font-semibold py-3 px-4 rounded-lg hover:bg-furgocasa-orange-dark transition-colors mb-3">
                  {t("Reservar ahora")}
                </LocalizedLink>
                <LocalizedLink href="/tarifas" className="block w-full border-2 border-gray-200 text-gray-700 text-center font-semibold py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                  {t("Ver tarifas")}
                </LocalizedLink>
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-3">{t("¿Tienes dudas?")}</h3>
                  <a href="tel:+34968000000" className="text-furgocasa-orange hover:underline">+34 968 000 000</a>
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
