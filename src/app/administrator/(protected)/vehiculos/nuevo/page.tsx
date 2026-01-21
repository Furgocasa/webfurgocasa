"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import supabase from "@/lib/supabase/client";
import { ArrowLeft, Save, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { ImageGalleryManager, type GalleryImage } from "@/components/media/image-gallery-manager";
import { EquipmentIcon } from "@/components/vehicle/equipment-display";

const TinyEditor = dynamic(
  () => import("@/components/admin/tiny-editor").then((mod) => mod.TinyEditor),
  { 
    ssr: false, 
    loading: () => (
      <div className="h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }
);

interface Extra {
  id: string;
  name: string;
  price_per_day: number;
  price_type: string;
}

interface Equipment {
  id: string;
  name: string;
  slug: string;
  icon: string;
  category: string;
  is_standard: boolean;
  is_active: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function NuevoVehiculoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [internalCode, setInternalCode] = useState("");
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category_id: '' as string,
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    plate_number: '',
    description: '',
    short_description: '',
    seats: 4,
    beds: 4,
    length_m: null as number | null,
    width_m: null as number | null,
    height_m: null as number | null,
    fuel_type: 'Diesel',
    transmission: 'Manual',
    engine_power: '',
    engine_displacement: '',
    has_bathroom: true,
    has_kitchen: true,
    has_ac: true,
    has_heating: true,
    has_solar_panel: false,
    has_awning: false,
    is_for_rent: true,
    base_price_per_day: null as number | null,
    status: 'available' as 'available' | 'maintenance' | 'rented' | 'inactive',
    is_for_sale: false,
    sale_price: null as number | null,
    sale_price_negotiable: false,
    sale_status: 'available' as 'available' | 'reserved' | 'sold',
    mileage: 0,
    mileage_unit: 'km',
  });

  useEffect(() => {
    const loadInitialData = async () => {
      // Cargar categorías
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('vehicle_categories')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('sort_order');
      
      if (categoriesError) {
        console.error('Error loading categories:', categoriesError);
        console.error('Error details:', JSON.stringify(categoriesError, null, 2));
      } else if (categoriesData && categoriesData.length > 0) {
        console.log('Categories loaded:', categoriesData);
        setCategories(categoriesData);
        // Seleccionar la primera categoría por defecto automáticamente
        setFormData(prev => ({ ...prev, category_id: categoriesData[0].id }));
      } else {
        console.warn('No categories found or empty result');
      }

      // Cargar extras
      const { data: extrasData, error: extrasError } = await supabase
        .from('extras')
        .select('id, name, price_per_day, price_type')
        .eq('is_active', true)
        .order('name');
      
      if (extrasError) {
        console.error('Error loading extras:', extrasError);
        console.error('Error details:', JSON.stringify(extrasError, null, 2));
      } else if (extrasData) {
        console.log('Extras loaded:', extrasData);
        setExtras(extrasData);
      } else {
        console.warn('No extras found or empty result');
      }

      // Cargar equipamiento
      const { data: equipmentData, error: equipmentError } = await supabase
        .from('equipment')
        .select('id, name, slug, icon, category, is_standard, is_active')
        .eq('is_active', true)
        .order('category')
        .order('sort_order');
      
      if (equipmentError) {
        console.error('Error loading equipment:', equipmentError);
        console.error('Error details:', JSON.stringify(equipmentError, null, 2));
      } else if (equipmentData) {
        console.log('Equipment loaded:', equipmentData);
        setEquipmentList(equipmentData);
      } else {
        console.warn('No equipment found or empty result');
      }
    };

    loadInitialData();
  }, []);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      setMessage({ type: 'error', text: 'El nombre es obligatorio' });
      return;
    }

    if (!formData.category_id) {
      setMessage({ type: 'error', text: 'Debes seleccionar una categoría para el vehículo' });
      return;
    }

    try {
      setLoading(true);

      const dataToInsert = {
        ...formData,
        internal_code: internalCode,
        features: [],
        sort_order: 0,
      };

      const { data, error } = await supabase
        .from('vehicles')
        .insert([dataToInsert])
        .select()
        .single();

      if (error) throw error;

      // Insertar los extras seleccionados
      if (data && selectedExtras.length > 0) {
        const extrasToInsert = selectedExtras.map(extraId => ({
          vehicle_id: data.id,
          extra_id: extraId
        }));

        const { error: extrasError } = await supabase
          .from('vehicle_available_extras')
          .insert(extrasToInsert);

        if (extrasError) {
          console.error('Error adding extras:', extrasError);
        }
      }

      // Insertar las imágenes de la galería
      if (data && galleryImages.length > 0) {
        const imagesToInsert = galleryImages.map((img) => ({
          vehicle_id: data.id,
          image_url: img.image_url,
          alt_text: img.alt_text || '',
          sort_order: img.sort_order,
          is_primary: img.is_primary,
        }));

        const { error: imagesError } = await supabase
          .from('vehicle_images')
          .insert(imagesToInsert);

        if (imagesError) {
          console.error('Error adding images:', imagesError);
        }
      }

      // Insertar equipamientos seleccionados
      if (data && selectedEquipment.length > 0) {
        const equipmentToInsert = selectedEquipment.map(equipmentId => ({
          vehicle_id: data.id,
          equipment_id: equipmentId
        }));

        const { error: equipmentError } = await supabase
          .from('vehicle_equipment')
          .insert(equipmentToInsert);

        if (equipmentError) {
          console.error('Error adding equipment:', equipmentError);
        }
      }

      setMessage({ type: 'success', text: 'Vehículo creado correctamente' });
      
      setTimeout(() => {
        router.push('/administrator/vehiculos');
      }, 1500);
    } catch (error: any) {
      console.error('Error creating vehicle:', error);
      setMessage({ type: 'error', text: error.message || 'Error al crear el vehículo' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link 
            href="/administrator/vehiculos" 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nuevo Vehículo</h1>
            <p className="text-gray-600 mt-1">Añade un nuevo vehículo a tu flota</p>
          </div>
        </div>

      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <AlertCircle className="h-5 w-5" />
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Básica */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Información Básica</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del vehículo *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                placeholder="Ej: Adria Twin Plus 600 SP"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug (URL)
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent bg-gray-50"
                placeholder="adria-twin-plus-600-sp"
              />
              <p className="text-xs text-gray-500 mt-1">Se genera automáticamente desde el nombre</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría *
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                required
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
              >
                <option value="available">Disponible</option>
                <option value="rented">Alquilado</option>
                <option value="maintenance">Mantenimiento</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marca
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                placeholder="Ej: Adria"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modelo
              </label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                placeholder="Ej: Twin Plus 600 SP"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Año
              </label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                min="2000"
                max={new Date().getFullYear() + 1}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Matrícula
              </label>
              <input
                type="text"
                value={formData.plate_number}
                onChange={(e) => setFormData(prev => ({ ...prev, plate_number: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                placeholder="0000-XXX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código Interno
              </label>
              <input
                type="text"
                value={internalCode}
                onChange={(e) => setInternalCode(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                placeholder="FU0000"
              />
              <p className="text-xs text-gray-500 mt-1">Código de identificación interna del vehículo</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción corta
              </label>
              <input
                type="text"
                value={formData.short_description}
                onChange={(e) => setFormData(prev => ({ ...prev, short_description: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                placeholder="Descripción breve para listados"
                maxLength={200}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción completa
              </label>
              <TinyEditor
                value={formData.description}
                onChange={(html) => setFormData(prev => ({ ...prev, description: html }))}
                height={400}
                placeholder="Descripción detallada del vehículo..."
              />
            </div>
          </div>
        </div>

        {/* Galería de Imágenes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <ImageGalleryManager
            images={galleryImages}
            onChange={setGalleryImages}
            maxImages={20}
            bucket="vehicles"
            suggestedFolder={internalCode}
          />
        </div>

        {/* Especificaciones */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Especificaciones</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plazas
              </label>
              <input
                type="number"
                value={formData.seats}
                onChange={(e) => setFormData(prev => ({ ...prev, seats: parseInt(e.target.value) }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                min="1"
                max="9"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Camas
              </label>
              <input
                type="number"
                value={formData.beds}
                onChange={(e) => setFormData(prev => ({ ...prev, beds: parseInt(e.target.value) }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                min="1"
                max="9"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kilometraje
              </label>
              <input
                type="number"
                value={formData.mileage}
                onChange={(e) => setFormData(prev => ({ ...prev, mileage: parseInt(e.target.value) }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Largo (m)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.length_m || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, length_m: e.target.value ? parseFloat(e.target.value) : null }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                placeholder="5.99"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ancho (m)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.width_m || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, width_m: e.target.value ? parseFloat(e.target.value) : null }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                placeholder="2.05"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alto (m)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.height_m || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, height_m: e.target.value ? parseFloat(e.target.value) : null }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                placeholder="2.65"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Combustible
              </label>
              <select
                value={formData.fuel_type}
                onChange={(e) => setFormData(prev => ({ ...prev, fuel_type: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
              >
                <option value="Diesel">Diesel</option>
                <option value="Gasolina">Gasolina</option>
                <option value="Eléctrico">Eléctrico</option>
                <option value="Híbrido">Híbrido</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transmisión
              </label>
              <select
                value={formData.transmission}
                onChange={(e) => setFormData(prev => ({ ...prev, transmission: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
              >
                <option value="Manual">Manual</option>
                <option value="Automática">Automática</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Potencia
              </label>
              <input
                type="text"
                value={formData.engine_power}
                onChange={(e) => setFormData(prev => ({ ...prev, engine_power: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                placeholder="140 CV"
              />
            </div>
          </div>
        </div>

        {/* Equipamiento Dinámico */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Equipamiento</h2>
          <p className="text-sm text-gray-600 mb-6">
            Selecciona el equipamiento que tiene este vehículo
          </p>
          
          {equipmentList.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No hay equipamientos configurados.</p>
              <Link href="/administrator/equipamiento" className="text-furgocasa-orange hover:underline mt-2 inline-block">
                Ir a configurar equipamientos →
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Agrupar por categoría */}
              {['confort', 'energia', 'exterior', 'multimedia', 'seguridad', 'agua', 'general'].map(category => {
                const categoryEquipment = equipmentList.filter(eq => eq.category === category);
                if (categoryEquipment.length === 0) return null;
                
                const categoryNames: Record<string, string> = {
                  confort: 'Confort',
                  energia: 'Energía',
                  exterior: 'Exterior',
                  multimedia: 'Multimedia',
                  seguridad: 'Conducción y Seguridad',
                  agua: 'Agua',
                  general: 'Otros',
                };

                const categoryColors: Record<string, string> = {
                  confort: 'border-blue-200 bg-blue-50',
                  energia: 'border-yellow-200 bg-yellow-50',
                  exterior: 'border-green-200 bg-green-50',
                  multimedia: 'border-purple-200 bg-purple-50',
                  seguridad: 'border-red-200 bg-red-50',
                  agua: 'border-cyan-200 bg-cyan-50',
                  general: 'border-gray-200 bg-gray-50',
                };

                return (
                  <div key={category}>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      {categoryNames[category]}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {categoryEquipment.map(eq => (
                        <div 
                          key={eq.id} 
                          className={`flex items-center gap-3 p-3 border rounded-lg transition-colors cursor-pointer ${
                            selectedEquipment.includes(eq.id) 
                              ? categoryColors[category]
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                          onClick={() => {
                            if (selectedEquipment.includes(eq.id)) {
                              setSelectedEquipment(prev => prev.filter(id => id !== eq.id));
                            } else {
                              setSelectedEquipment(prev => [...prev, eq.id]);
                            }
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedEquipment.includes(eq.id)}
                            onChange={() => {}}
                            className="w-4 h-4 text-furgocasa-orange focus:ring-furgocasa-orange border-gray-300 rounded"
                          />
                          <EquipmentIcon iconName={eq.icon} className="h-5 w-5 text-gray-600" />
                          <span className="font-medium text-gray-900 flex-1">{eq.name}</span>
                          {eq.is_standard && (
                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                              Estándar
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              
              {/* Contador */}
              <div className="pt-4 border-t border-gray-200 text-sm text-gray-500">
                {selectedEquipment.length} equipamientos seleccionados
              </div>
            </div>
          )}
        </div>

        {/* Equipamiento Legacy (oculto pero funcional para compatibilidad) */}
        <input type="hidden" value={formData.has_kitchen ? '1' : '0'} />
        <input type="hidden" value={formData.has_bathroom ? '1' : '0'} />
        <input type="hidden" value={formData.has_ac ? '1' : '0'} />
        <input type="hidden" value={formData.has_heating ? '1' : '0'} />
        <input type="hidden" value={formData.has_solar_panel ? '1' : '0'} />
        <input type="hidden" value={formData.has_awning ? '1' : '0'} />

        {/* Extras Disponibles */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Extras Disponibles</h2>
          <p className="text-sm text-gray-600 mb-6">
            Selecciona qué extras estarán disponibles para este vehículo
          </p>
          
          {extras.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No hay extras configurados en el sistema</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {extras.map(extra => (
                <div key={extra.id} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    id={`extra-${extra.id}`}
                    checked={selectedExtras.includes(extra.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedExtras(prev => [...prev, extra.id]);
                      } else {
                        setSelectedExtras(prev => prev.filter(id => id !== extra.id));
                      }
                    }}
                    className="w-4 h-4 text-furgocasa-orange focus:ring-furgocasa-orange border-gray-300 rounded mt-0.5"
                  />
                  <label htmlFor={`extra-${extra.id}`} className="flex-1 cursor-pointer">
                    <span className="font-medium text-gray-900">{extra.name}</span>
                    <span className="text-sm text-gray-600 ml-2">
                      {extra.price_per_day > 0 && (
                        <>
                          ({extra.price_per_day}€
                          {extra.price_type === 'per_day' && '/día'}
                          {extra.price_type === 'per_rental' && '/alquiler'})
                        </>
                      )}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alquiler */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <input
              type="checkbox"
              id="is_for_rent"
              checked={formData.is_for_rent}
              onChange={(e) => setFormData(prev => ({ ...prev, is_for_rent: e.target.checked }))}
              className="w-4 h-4 text-furgocasa-orange focus:ring-furgocasa-orange border-gray-300 rounded"
            />
            <label htmlFor="is_for_rent" className="text-xl font-bold text-gray-900">
              Disponible para alquiler
            </label>
          </div>
          
          {formData.is_for_rent && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio base por día (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.base_price_per_day || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, base_price_per_day: e.target.value ? parseFloat(e.target.value) : null }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                  placeholder="120.00"
                />
              </div>
            </div>
          )}
        </div>

        {/* Venta */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <input
              type="checkbox"
              id="is_for_sale"
              checked={formData.is_for_sale}
              onChange={(e) => setFormData(prev => ({ ...prev, is_for_sale: e.target.checked }))}
              className="w-4 h-4 text-furgocasa-orange focus:ring-furgocasa-orange border-gray-300 rounded"
            />
            <label htmlFor="is_for_sale" className="text-xl font-bold text-gray-900">
              Disponible para venta
            </label>
          </div>
          
          {formData.is_for_sale && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio de venta (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.sale_price || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, sale_price: e.target.value ? parseFloat(e.target.value) : null }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                  placeholder="45000.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado de venta
                </label>
                <select
                  value={formData.sale_status}
                  onChange={(e) => setFormData(prev => ({ ...prev, sale_status: e.target.value as any }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                >
                  <option value="available">Disponible</option>
                  <option value="reserved">Reservado</option>
                  <option value="sold">Vendido</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="sale_price_negotiable"
                    checked={formData.sale_price_negotiable}
                    onChange={(e) => setFormData(prev => ({ ...prev, sale_price_negotiable: e.target.checked }))}
                    className="w-4 h-4 text-furgocasa-orange focus:ring-furgocasa-orange border-gray-300 rounded"
                  />
                  <label htmlFor="sale_price_negotiable" className="text-sm text-gray-700">
                    Precio negociable
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Crear vehículo
              </>
            )}
          </button>
          <Link
            href="/administrator/vehiculos"
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>
      </div>
    </div>
  );
}

