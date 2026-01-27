export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      // ============================================
      // VEHÍCULOS (Alquiler + Venta)
      // ============================================
      vehicles: {
        Row: {
          id: string;
          name: string;
          slug: string;
          category_id: string | null;
          description: string | null;
          short_description: string | null;
          brand: string | null;
          model: string | null;
          year: number | null;
          plate_number: string | null;
          seats: number;
          beds: number;
          length_m: number | null;
          width_m: number | null;
          height_m: number | null;
          fuel_type: string | null;
          transmission: string | null;
          has_bathroom: boolean;
          has_kitchen: boolean;
          has_ac: boolean;
          has_heating: boolean;
          has_solar_panel: boolean;
          has_awning: boolean;
          features: Json | null;
          base_price_per_day: number;
          status: "available" | "maintenance" | "rented" | "inactive";
          sort_order: number;
          // Campos de alquiler/venta
          is_for_rent: boolean;
          is_for_sale: boolean;
          sale_price: number | null;
          sale_price_negotiable: boolean;
          sale_status: "available" | "reserved" | "sold";
          // Datos técnicos
          mileage: number;
          mileage_unit: string;
          engine_power: string | null;
          engine_displacement: string | null;
          registration_date: string | null;
          next_itv_date: string | null;
          warranty_until: string | null;
          previous_owners: number;
          condition: "new" | "like_new" | "excellent" | "good" | "fair";
          // Contenido de venta
          sale_description: string | null;
          sale_highlights: Json | null;
          sale_meta_title: string | null;
          sale_meta_description: string | null;
          // Timestamps
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          category_id?: string | null;
          description?: string | null;
          short_description?: string | null;
          brand?: string | null;
          model?: string | null;
          year?: number | null;
          plate_number?: string | null;
          seats?: number;
          beds?: number;
          length_m?: number | null;
          width_m?: number | null;
          height_m?: number | null;
          fuel_type?: string | null;
          transmission?: string | null;
          has_bathroom?: boolean;
          has_kitchen?: boolean;
          has_ac?: boolean;
          has_heating?: boolean;
          has_solar_panel?: boolean;
          has_awning?: boolean;
          features?: Json | null;
          base_price_per_day: number;
          status?: "available" | "maintenance" | "rented" | "inactive";
          sort_order?: number;
          is_for_rent?: boolean;
          is_for_sale?: boolean;
          sale_price?: number | null;
          sale_price_negotiable?: boolean;
          sale_status?: "available" | "reserved" | "sold";
          mileage?: number;
          mileage_unit?: string;
          engine_power?: string | null;
          engine_displacement?: string | null;
          registration_date?: string | null;
          next_itv_date?: string | null;
          warranty_until?: string | null;
          previous_owners?: number;
          condition?: "new" | "like_new" | "excellent" | "good" | "fair";
          sale_description?: string | null;
          sale_highlights?: Json | null;
          sale_meta_title?: string | null;
          sale_meta_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["vehicles"]["Insert"]>;
      };

      vehicle_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          image_url?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["vehicle_categories"]["Insert"]>;
      };

      vehicle_images: {
        Row: {
          id: string;
          vehicle_id: string;
          url: string;
          alt: string | null;
          is_main: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          vehicle_id: string;
          url: string;
          alt?: string | null;
          is_main?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["vehicle_images"]["Insert"]>;
      };

      locations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          address: string | null;
          city: string | null;
          postal_code: string | null;
          latitude: number | null;
          longitude: number | null;
          phone: string | null;
          email: string | null;
          opening_time: string;
          closing_time: string;
          is_pickup: boolean;
          is_dropoff: boolean;
          extra_fee: number;
          notes: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          address?: string | null;
          city?: string | null;
          postal_code?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          phone?: string | null;
          email?: string | null;
          opening_time?: string;
          closing_time?: string;
          is_pickup?: boolean;
          is_dropoff?: boolean;
          extra_fee?: number;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["locations"]["Insert"]>;
      };

      bookings: {
        Row: {
          id: string;
          booking_number: string;
          vehicle_id: string;
          customer_id: string | null;
          pickup_location_id: string;
          dropoff_location_id: string;
          pickup_date: string;
          pickup_time: string;
          dropoff_date: string;
          dropoff_time: string;
          days: number;
          base_price: number;
          extras_price: number;
          location_fee: number;
          discount: number;
          total_price: number;
          amount_paid: number;
          status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
          payment_status: "pending" | "partial" | "paid" | "refunded";
          customer_name: string;
          customer_email: string;
          customer_phone: string | null;
          customer_dni: string | null;
          customer_address: string | null;
          customer_city: string | null;
          customer_postal_code: string | null;
          notes: string | null;
          admin_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_number?: string;
          vehicle_id: string;
          customer_id?: string | null;
          pickup_location_id: string;
          dropoff_location_id: string;
          pickup_date: string;
          pickup_time: string;
          dropoff_date: string;
          dropoff_time: string;
          days: number;
          base_price: number;
          extras_price?: number;
          location_fee?: number;
          discount?: number;
          total_price: number;
          amount_paid?: number;
          status?: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
          payment_status?: "pending" | "partial" | "paid" | "refunded";
          customer_name: string;
          customer_email: string;
          customer_phone?: string | null;
          customer_dni?: string | null;
          customer_address?: string | null;
          customer_city?: string | null;
          customer_postal_code?: string | null;
          notes?: string | null;
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["bookings"]["Insert"]>;
      };

      booking_extras: {
        Row: {
          id: string;
          booking_id: string;
          extra_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          extra_id: string;
          quantity?: number;
          unit_price: number;
          total_price: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["booking_extras"]["Insert"]>;
      };

      extras: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price_per_day: number;
          price_per_rental: number;
          price_type: "per_day" | "per_rental" | "one_time";
          max_quantity: number;
          image_url: string | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price_per_day?: number;
          price_per_rental?: number;
          price_type?: "per_day" | "per_rental" | "one_time";
          max_quantity?: number;
          image_url?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["extras"]["Insert"]>;
      };

      customers: {
        Row: {
          id: string;
          user_id: string | null;
          email: string;
          name: string;
          phone: string | null;
          dni: string | null;
          address: string | null;
          city: string | null;
          postal_code: string | null;
          country: string | null;
          driver_license: string | null;
          driver_license_expiry: string | null;
          date_of_birth: string | null;
          notes: string | null;
          total_bookings: number;
          total_spent: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          email: string;
          name: string;
          phone?: string | null;
          dni?: string | null;
          address?: string | null;
          city?: string | null;
          postal_code?: string | null;
          country?: string | null;
          driver_license?: string | null;
          driver_license_expiry?: string | null;
          date_of_birth?: string | null;
          notes?: string | null;
          total_bookings?: number;
          total_spent?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["customers"]["Insert"]>;
      };

      payments: {
        Row: {
          id: string;
          booking_id: string;
          order_number: string;
          amount: number;
          status: "pending" | "authorized" | "cancelled" | "error" | "refunded";
          payment_type: "deposit" | "full" | "partial" | "refund";
          payment_method: string | null;
          response_code: string | null;
          authorization_code: string | null;
          transaction_date: string | null;
          card_country: string | null;
          card_type: string | null;
          refunded_amount: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          order_number: string;
          amount: number;
          status?: "pending" | "authorized" | "cancelled" | "error" | "refunded";
          payment_type?: "deposit" | "full" | "partial" | "refund";
          payment_method?: string | null;
          response_code?: string | null;
          authorization_code?: string | null;
          transaction_date?: string | null;
          card_country?: string | null;
          card_type?: string | null;
          refunded_amount?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>;
      };

      seasons: {
        Row: {
          id: string;
          name: string;
          slug: string;
          start_date: string;
          end_date: string;
          price_modifier: number;
          min_days: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          start_date: string;
          end_date: string;
          price_modifier?: number;
          min_days?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["seasons"]["Insert"]>;
      };

      vehicle_prices: {
        Row: {
          id: string;
          vehicle_id: string;
          season_id: string | null;
          price_per_day: number;
          price_per_week: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          vehicle_id: string;
          season_id?: string | null;
          price_per_day: number;
          price_per_week?: number | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["vehicle_prices"]["Insert"]>;
      };

      blocked_dates: {
        Row: {
          id: string;
          vehicle_id: string;
          start_date: string;
          end_date: string;
          reason: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          vehicle_id: string;
          start_date: string;
          end_date: string;
          reason?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["blocked_dates"]["Insert"]>;
      };

      settings: {
        Row: {
          id: string;
          key: string;
          value: Json;
          description: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: Json;
          description?: string | null;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["settings"]["Insert"]>;
      };

      search_queries: {
        Row: {
          id: string;
          session_id: string;
          // Nivel 1: Búsqueda
          searched_at: string;
          pickup_date: string;
          dropoff_date: string;
          pickup_time: string;
          dropoff_time: string;
          rental_days: number;
          advance_days: number;
          // Ubicaciones
          pickup_location_id: string | null;
          dropoff_location_id: string | null;
          same_location: boolean;
          // Filtros y resultados
          category_slug: string | null;
          vehicles_available_count: number;
          season_applied: string | null;
          avg_price_shown: number | null;
          had_availability: boolean;
          // Nivel 2: Selección de vehículo
          vehicle_selected: boolean;
          selected_vehicle_id: string | null;
          selected_vehicle_price: number | null;
          vehicle_selected_at: string | null;
          time_to_select_seconds: number | null;
          // Nivel 3: Reserva creada
          booking_created: boolean;
          booking_id: string | null;
          booking_created_at: string | null;
          time_to_booking_seconds: number | null;
          total_conversion_seconds: number | null;
          // Estado del funnel
          funnel_stage: "search_only" | "vehicle_selected" | "booking_created";
          // Metadatos
          locale: string | null;
          user_agent_type: "mobile" | "desktop" | "tablet" | null;
          // Timestamps
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          searched_at?: string;
          pickup_date: string;
          dropoff_date: string;
          pickup_time?: string;
          dropoff_time?: string;
          rental_days: number;
          advance_days?: number;
          pickup_location_id?: string | null;
          dropoff_location_id?: string | null;
          same_location?: boolean;
          category_slug?: string | null;
          vehicles_available_count?: number;
          season_applied?: string | null;
          avg_price_shown?: number | null;
          had_availability?: boolean;
          vehicle_selected?: boolean;
          selected_vehicle_id?: string | null;
          selected_vehicle_price?: number | null;
          vehicle_selected_at?: string | null;
          time_to_select_seconds?: number | null;
          booking_created?: boolean;
          booking_id?: string | null;
          booking_created_at?: string | null;
          time_to_booking_seconds?: number | null;
          total_conversion_seconds?: number | null;
          funnel_stage?: "search_only" | "vehicle_selected" | "booking_created";
          locale?: string | null;
          user_agent_type?: "mobile" | "desktop" | "tablet" | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["search_queries"]["Insert"]>;
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}

// Helper types
export type Vehicle = Database["public"]["Tables"]["vehicles"]["Row"];
export type VehicleInsert = Database["public"]["Tables"]["vehicles"]["Insert"];
export type VehicleUpdate = Database["public"]["Tables"]["vehicles"]["Update"];

export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
export type BookingInsert = Database["public"]["Tables"]["bookings"]["Insert"];
export type BookingUpdate = Database["public"]["Tables"]["bookings"]["Update"];

export type Customer = Database["public"]["Tables"]["customers"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];
export type Location = Database["public"]["Tables"]["locations"]["Row"];
export type Extra = Database["public"]["Tables"]["extras"]["Row"];
export type Season = Database["public"]["Tables"]["seasons"]["Row"];
export type VehicleCategory = Database["public"]["Tables"]["vehicle_categories"]["Row"];
export type VehicleImage = Database["public"]["Tables"]["vehicle_images"]["Row"];

export type VehicleWithImages = Vehicle & {
  images: VehicleImage[];
  category: VehicleCategory | null;
};

// Tipos específicos para venta
export type VehicleForSale = Vehicle & {
  images: VehicleImage[];
  category: VehicleCategory | null;
};

export type VehicleCondition = "new" | "like_new" | "excellent" | "good" | "fair";
export type SaleStatus = "available" | "reserved" | "sold";

// Equipamiento
export type Equipment = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  category: string;
  is_active: boolean;
  is_standard: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type VehicleEquipment = {
  id: string;
  vehicle_id: string;
  equipment_id: string;
  notes: string | null;
  created_at: string;
  equipment?: Equipment;
};

export type BookingWithRelations = Booking & {
  vehicle: Vehicle;
  customer: Customer | null;
  pickup_location: Location;
  dropoff_location: Location;
  extras: (Database["public"]["Tables"]["booking_extras"]["Row"] & {
    extra: Extra;
  })[];
  payments: Payment[];
};

// Tipos para búsquedas
export type SearchQuery = Database["public"]["Tables"]["search_queries"]["Row"];
export type SearchQueryInsert = Database["public"]["Tables"]["search_queries"]["Insert"];
export type SearchQueryUpdate = Database["public"]["Tables"]["search_queries"]["Update"];
