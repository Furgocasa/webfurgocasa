"use client";

import Image from "next/image";
import { useLanguage } from "@/contexts/language-context";
import { LocalizedLink } from "@/components/localized-link";
import { 
  Car, 
  Gauge, 
  Fuel, 
  Users, 
  Bed,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  Tag,
  ArrowRight,
  Settings
} from "lucide-react";
import { useState } from "react";
import { VehicleEquipmentDisplay } from "@/components/vehicle/equipment-display";
import { VehicleImageSlider } from "@/components/vehicle/vehicle-image-slider";

interface VehicleForSale {
  id: string;
  name: string;
  slug: string;
  brand: string;
  model: string;
  year: number;
  category: {
    name: string;
    slug: string;
  };
  sale_price: number;
  sale_price_negotiable: boolean;
  mileage: number;
  fuel_type: string;
  transmission: string;
  seats: number;
  beds: number;
  engine_power: string;
  condition: string;
  previous_owners: number;
  registration_date: string;
  has_ac: boolean;
  has_kitchen: boolean;
  has_bathroom: boolean;
  short_description: string;
  sale_highlights: string[];
  main_image?: {
    image_url: string;
    alt_text: string;
  };
  images?: string[];
  vehicle_equipment?: any[];
}

interface VehicleCategory {
  id: string;
  name: string;
  slug: string;
}

interface VentasClientProps {
  initialVehicles: VehicleForSale[];
  initialCategories: VehicleCategory[];
}

function formatPrice(price: number): string {
  return price.toLocaleString("es-ES") + " €";
}

function formatMileage(km: number): string {
  return km.toLocaleString("es-ES") + " km";
}

export function VentasClient({ initialVehicles, initialCategories }: VentasClientProps) {
  const { t } = useLanguage();
  
  // Los datos vienen del servidor, no necesitamos cargarlos
  const vehiclesForSale = initialVehicles;
  const categories = initialCategories;
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [kmFilter, setKmFilter] = useState('');
  const [sortBy, setSortBy] = useState('price-asc');

  // Filtrado y ordenamiento
  const filteredAndSortedVehicles = vehiclesForSale
    .filter(vehicle => {
      // Filtro de búsqueda
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesSearch = 
          vehicle.name.toLowerCase().includes(search) ||
          vehicle.brand.toLowerCase().includes(search) ||
          vehicle.model.toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }

      // Filtro de categoría
      if (categoryFilter && vehicle.category?.slug !== categoryFilter) {
        return false;
      }

      // Filtro de precio
      if (priceFilter) {
        const price = vehicle.sale_price;
        if (priceFilter === '0-40000' && price > 40000) return false;
        if (priceFilter === '40000-60000' && (price < 40000 || price > 60000)) return false;
        if (priceFilter === '60000+' && price < 60000) return false;
      }

      // Filtro de kilometraje
      if (kmFilter) {
        const km = vehicle.mileage;
        if (kmFilter === '0-30000' && km > 30000) return false;
        if (kmFilter === '30000-60000' && (km < 30000 || km > 60000)) return false;
        if (kmFilter === '60000+' && km < 60000) return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.sale_price - b.sale_price;
        case 'price-desc':
          return b.sale_price - a.sale_price;
        case 'km-asc':
          return a.mileage - b.mileage;
        case 'recent':
        default:
          return 0; // Ya viene ordenado por created_at
      }
    });

  return (
    <>
<main className="min-h-screen bg-gray-50">
        {/* Hero */}
        <section className="bg-gradient-to-br from-furgocasa-blue to-furgocasa-blue-dark py-16">
          <div className="container mx-auto px-4 text-center">
            <span className="inline-block px-4 py-1 bg-furgocasa-orange/20 text-furgocasa-orange rounded-full text-sm font-medium mb-4">
              {t("Oportunidades únicas")}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {t("Campers y Autocaravanas en Venta")}
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
              {t("Vehículos de nuestra flota de alquiler, revisados y garantizados. Conocemos su historial completo.")}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 text-white/90">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>{t("Historial conocido")}</span>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>{t("Mantenimientos al día")}</span>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>{t("Garantía incluida")}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Filtros */}
        <section className="bg-white border-b border-gray-200 sticky top-0 z-20">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 w-full md:w-auto">
                <input
                  type="text"
                  placeholder="Buscar por marca, modelo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                />
              </div>
              
              {/* Solo mostrar filtro de categorías si hay más de una */}
              {categories.length > 1 && (
                <select 
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">{t("Todas las categorías")}</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              )}
              
              <select 
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">{t("Cualquier precio")}</option>
                <option value="0-40000">{t("Hasta 40.000 €")}</option>
                <option value="40000-60000">40.000 - 60.000 €</option>
                <option value="60000+">{t("Más de 60.000 €")}</option>
              </select>
              <select 
                value={kmFilter}
                onChange={(e) => setKmFilter(e.target.value)}
                className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">{t("Cualquier km")}</option>
                <option value="0-30000">{t("Hasta 30.000 km")}</option>
                <option value="30000-60000">30.000 - 60.000 km</option>
                <option value="60000+">{t("Más de 60.000 km")}</option>
              </select>
            </div>
          </div>
        </section>

        {/* Vehículos */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {/* Empty State */}
            {filteredAndSortedVehicles.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20">
                <Car className="h-20 w-20 text-gray-300 mb-4" />
                <h3 className="text-2xl font-bold text-gray-700 mb-2">
                  {searchTerm || categoryFilter || priceFilter || kmFilter
                    ? t("No se encontraron vehículos")
                    : t("No hay vehículos en venta")}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || categoryFilter || priceFilter || kmFilter
                    ? t("Prueba con otros criterios de búsqueda")
                    : t("En este momento no tenemos vehículos disponibles para la venta")}
                </p>
                <LocalizedLink href="/contacto" className="text-furgocasa-orange font-semibold hover:underline">
                  {t("Contacta con nosotros si buscas algo específico")}
                </LocalizedLink>
              </div>
            )}

            {/* Vehicle List */}
            {filteredAndSortedVehicles.length > 0 && (
              <>
                <div className="flex justify-between items-center mb-8">
                  <p className="text-gray-600">
                    <span className="font-semibold text-gray-900">{filteredAndSortedVehicles.length}</span> {t("vehículos disponibles")}
                    {(searchTerm || categoryFilter || priceFilter || kmFilter) && (
                      <span className="text-sm ml-2 text-gray-500">
                        ({vehiclesForSale.length} total)
                      </span>
                    )}
                  </p>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="recent">{t("Ordenar por: Más recientes")}</option>
                    <option value="price-asc">{t("Precio: menor a mayor")}</option>
                    <option value="price-desc">{t("Precio: mayor a menor")}</option>
                    <option value="km-asc">{t("Kilometraje: menor a mayor")}</option>
                  </select>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredAndSortedVehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                    >
                      <LocalizedLink href={`/ventas/${vehicle.slug}`} className="block">
                        <div className="h-64 bg-gray-200 relative overflow-hidden">
                          <VehicleImageSlider
                            images={vehicle.images || (vehicle.main_image?.image_url ? [vehicle.main_image.image_url] : [])}
                            alt={vehicle.name}
                            autoPlay={true}
                            interval={10000}
                          />
                          <div className="absolute bottom-4 left-4 z-10">
                            <span className="px-3 py-1 bg-white/90 backdrop-blur rounded-full text-xs font-medium text-gray-700">
                              {vehicle.category.name}
                            </span>
                          </div>
                        </div>
                      </LocalizedLink>

                      <div className="p-6">
                        <LocalizedLink href={`/ventas/${vehicle.slug}`}>
                          <h3 className="text-2xl font-heading font-bold text-gray-900 mb-2 group-hover:text-furgocasa-orange transition-colors">
                            {vehicle.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-4">
                            {vehicle.brand} · {vehicle.year}
                          </p>
                        </LocalizedLink>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Gauge className="h-4 w-4 flex-shrink-0" />
                            <span>{formatMileage(vehicle.mileage)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 flex-shrink-0" />
                            <span>{vehicle.seats} {t("plazas")}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Bed className="h-4 w-4 flex-shrink-0" />
                            <span>{vehicle.beds} {t("camas")}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Fuel className="h-4 w-4 flex-shrink-0" />
                            <span>{vehicle.fuel_type}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Settings className="h-4 w-4 flex-shrink-0" />
                            <span>{vehicle.transmission === 'automatic' ? t('Automática') : t('Manual')}</span>
                          </div>
                        </div>

                        {vehicle.short_description && (
                          <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                            {vehicle.short_description}
                          </p>
                        )}

                        {vehicle.vehicle_equipment && vehicle.vehicle_equipment.length > 0 && (
                          <div className="mb-4">
                            <VehicleEquipmentDisplay
                              equipment={vehicle.vehicle_equipment}
                              variant="icons"
                              maxVisible={6}
                              showIsofixBadge={true}
                              hasIsofix={vehicle.vehicle_equipment?.some((item: any) => item?.slug === 'isofix' || item?.equipment?.slug === 'isofix')}
                            />
                          </div>
                        )}

                        <div className="pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">{t("Precio")}</p>
                              <p className="text-2xl font-heading font-bold text-furgocasa-orange">
                                {formatPrice(vehicle.sale_price)}
                              </p>
                            </div>
                            <LocalizedLink
                              href={`/ventas/${vehicle.slug}`}
                              className="flex items-center gap-2 bg-furgocasa-orange hover:bg-furgocasa-orange-dark text-white font-bold py-3 px-6 rounded-lg transition-colors"
                            >
                              {t("Ver detalles")}
                              <ArrowRight className="h-5 w-5" />
                            </LocalizedLink>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
          </>
        )}
      </div>
    </section>

        {/* CTA */}
        <section className="bg-furgocasa-blue py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                {t("¿No encuentras lo que buscas?")}
              </h2>
              <p className="text-white/80 mb-8">
                {t("Contáctanos y te ayudamos a encontrar el camper perfecto para ti. También aceptamos vehículos a cuenta.")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="tel:+34968000000"
                  className="inline-flex items-center justify-center gap-2 bg-white text-furgocasa-blue font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Phone className="h-5 w-5" />
                  {t("Llámanos")}
                </a>
                <a
                  href="mailto:ventas@furgocasa.com"
                  className="inline-flex items-center justify-center gap-2 bg-furgocasa-orange text-white font-semibold py-3 px-6 rounded-lg hover:bg-furgocasa-orange-dark transition-colors"
                >
                  <Mail className="h-5 w-5" />
                  {t("Escríbenos")}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Info adicional */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-furgocasa-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-furgocasa-orange" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{t("Historial completo")}</h3>
                <p className="text-gray-600">
                  {t("Conocemos cada kilómetro de nuestros vehículos. Te entregamos el historial de mantenimientos completo.")}
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-furgocasa-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Tag className="h-8 w-8 text-furgocasa-orange" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{t("Financiación disponible")}</h3>
                <p className="text-gray-600">
                  {t("Te ayudamos con la financiación. Hasta 120 meses sin entrada con las mejores condiciones.")}
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-furgocasa-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-furgocasa-orange" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{t("Prueba sin compromiso")}</h3>
                <p className="text-gray-600">
                  {t("Ven a verlo y pruébalo. Te lo enseñamos sin ningún compromiso en nuestras instalaciones.")}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
</>
  );
}
