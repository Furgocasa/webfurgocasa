/**
 * Tipos TypeScript generados desde el esquema de Supabase
 * TODO: Generar automáticamente con: npx supabase gen types typescript --local
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      vehicle_categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      vehicles: {
        Row: {
          id: string
          name: string
          slug: string
          category_id: string | null
          brand: string | null
          model: string | null
          year: number | null
          plate_number: string | null
          description: string | null
          short_description: string | null
          seats: number
          beds: number
          length_m: number | null
          width_m: number | null
          height_m: number | null
          fuel_type: string
          transmission: string
          engine_power: string | null
          engine_displacement: string | null
          has_bathroom: boolean
          has_kitchen: boolean
          has_ac: boolean
          has_heating: boolean
          has_solar_panel: boolean
          has_awning: boolean
          features: Json
          is_for_rent: boolean
          base_price_per_day: number | null
          status: 'available' | 'maintenance' | 'rented' | 'inactive'
          is_for_sale: boolean
          sale_price: number | null
          sale_price_negotiable: boolean
          sale_status: 'available' | 'reserved' | 'sold'
          sale_description: string | null
          sale_highlights: Json
          mileage: number
          mileage_unit: string
          registration_date: string | null
          next_itv_date: string | null
          warranty_until: string | null
          previous_owners: number
          condition: 'new' | 'like_new' | 'excellent' | 'good' | 'fair'
          sale_meta_title: string | null
          sale_meta_description: string | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          category_id?: string | null
          brand?: string | null
          model?: string | null
          year?: number | null
          plate_number?: string | null
          description?: string | null
          short_description?: string | null
          seats?: number
          beds?: number
          length_m?: number | null
          width_m?: number | null
          height_m?: number | null
          fuel_type?: string
          transmission?: string
          engine_power?: string | null
          engine_displacement?: string | null
          has_bathroom?: boolean
          has_kitchen?: boolean
          has_ac?: boolean
          has_heating?: boolean
          has_solar_panel?: boolean
          has_awning?: boolean
          features?: Json
          is_for_rent?: boolean
          base_price_per_day?: number | null
          status?: 'available' | 'maintenance' | 'rented' | 'inactive'
          is_for_sale?: boolean
          sale_price?: number | null
          sale_price_negotiable?: boolean
          sale_status?: 'available' | 'reserved' | 'sold'
          sale_description?: string | null
          sale_highlights?: Json
          mileage?: number
          mileage_unit?: string
          registration_date?: string | null
          next_itv_date?: string | null
          warranty_until?: string | null
          previous_owners?: number
          condition?: 'new' | 'like_new' | 'excellent' | 'good' | 'fair'
          sale_meta_title?: string | null
          sale_meta_description?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          // ... similar a Insert pero todos opcionales
        }
      }
      // Más tablas se agregarán según sea necesario
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_vehicle_availability: {
        Args: {
          p_vehicle_id: string
          p_pickup_date: string
          p_dropoff_date: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}





