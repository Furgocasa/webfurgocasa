export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string | null
          entity_id: string | null
          entity_name: string | null
          entity_type: string
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_name?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_name?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      admins: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          last_login: string | null
          name: string
          role: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          name: string
          role?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          name?: string
          role?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      blocked_dates: {
        Row: {
          created_at: string | null
          created_by: string | null
          end_date: string
          id: string
          reason: string | null
          start_date: string
          vehicle_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          end_date: string
          id?: string
          reason?: string | null
          start_date: string
          vehicle_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          end_date?: string
          id?: string
          reason?: string | null
          start_date?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocked_dates_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocked_dates_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles_ordered"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_extras: {
        Row: {
          booking_id: string
          created_at: string | null
          extra_id: string
          id: string
          quantity: number | null
          total_price: number
          unit_price: number
        }
        Insert: {
          booking_id: string
          created_at?: string | null
          extra_id: string
          id?: string
          quantity?: number | null
          total_price: number
          unit_price: number
        }
        Update: {
          booking_id?: string
          created_at?: string | null
          extra_id?: string
          id?: string
          quantity?: number | null
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "booking_extras_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_extras_extra_id_fkey"
            columns: ["extra_id"]
            isOneToOne: false
            referencedRelation: "extras"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_price_changes: {
        Row: {
          amount_paid: number | null
          booking_id: string
          booking_number: string | null
          changed_at: string | null
          changed_by: string | null
          id: number
          new_pending: number | null
          new_total: number | null
          notes: string | null
          old_total: number | null
        }
        Insert: {
          amount_paid?: number | null
          booking_id: string
          booking_number?: string | null
          changed_at?: string | null
          changed_by?: string | null
          id?: number
          new_pending?: number | null
          new_total?: number | null
          notes?: string | null
          old_total?: number | null
        }
        Update: {
          amount_paid?: number | null
          booking_id?: string
          booking_number?: string | null
          changed_at?: string | null
          changed_by?: string | null
          id?: number
          new_pending?: number | null
          new_total?: number | null
          notes?: string | null
          old_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_price_changes_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          admin_notes: string | null
          amount_paid: number | null
          base_price: number
          booking_number: string
          created_at: string | null
          customer_address: string | null
          customer_city: string | null
          customer_dni: string | null
          customer_email: string
          customer_id: string | null
          customer_name: string
          customer_phone: string | null
          customer_postal_code: string | null
          days: number
          deposit_amount: number | null
          discount: number | null
          dropoff_date: string
          dropoff_location_id: string
          dropoff_time: string
          extras_price: number | null
          id: string
          location_fee: number | null
          notes: string | null
          payment_status: string | null
          pickup_date: string
          pickup_location_id: string
          pickup_time: string
          status: string | null
          total_price: number
          updated_at: string | null
          vehicle_id: string
        }
        Insert: {
          admin_notes?: string | null
          amount_paid?: number | null
          base_price: number
          booking_number: string
          created_at?: string | null
          customer_address?: string | null
          customer_city?: string | null
          customer_dni?: string | null
          customer_email: string
          customer_id?: string | null
          customer_name: string
          customer_phone?: string | null
          customer_postal_code?: string | null
          days: number
          deposit_amount?: number | null
          discount?: number | null
          dropoff_date: string
          dropoff_location_id: string
          dropoff_time: string
          extras_price?: number | null
          id?: string
          location_fee?: number | null
          notes?: string | null
          payment_status?: string | null
          pickup_date: string
          pickup_location_id: string
          pickup_time: string
          status?: string | null
          total_price: number
          updated_at?: string | null
          vehicle_id: string
        }
        Update: {
          admin_notes?: string | null
          amount_paid?: number | null
          base_price?: number
          booking_number?: string
          created_at?: string | null
          customer_address?: string | null
          customer_city?: string | null
          customer_dni?: string | null
          customer_email?: string
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string | null
          customer_postal_code?: string | null
          days?: number
          deposit_amount?: number | null
          discount?: number | null
          dropoff_date?: string
          dropoff_location_id?: string
          dropoff_time?: string
          extras_price?: number | null
          id?: string
          location_fee?: number | null
          notes?: string | null
          payment_status?: string | null
          pickup_date?: string
          pickup_location_id?: string
          pickup_time?: string
          status?: string | null
          total_price?: number
          updated_at?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_dropoff_location_id_fkey"
            columns: ["dropoff_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_pickup_location_id_fkey"
            columns: ["pickup_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles_ordered"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_email: string
          author_name: string
          author_website: string | null
          content: string
          created_at: string | null
          id: string
          ip_address: string | null
          parent_id: string | null
          post_id: string
          status: string | null
          user_agent: string | null
        }
        Insert: {
          author_email: string
          author_name: string
          author_website?: string | null
          content: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          parent_id?: string | null
          post_id: string
          status?: string | null
          user_agent?: string | null
        }
        Update: {
          author_email?: string
          author_name?: string
          author_website?: string | null
          content?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          parent_id?: string | null
          post_id?: string
          status?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      content_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          meta_description: string | null
          meta_title: string | null
          name: string
          parent_id: string | null
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "content_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string | null
          date_of_birth: string | null
          dni: string | null
          driver_license: string | null
          driver_license_expiry: string | null
          email: string
          id: string
          name: string
          notes: string | null
          phone: string | null
          postal_code: string | null
          total_bookings: number | null
          total_spent: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          dni?: string | null
          driver_license?: string | null
          driver_license_expiry?: string | null
          email: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          total_bookings?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          dni?: string | null
          driver_license?: string | null
          driver_license_expiry?: string | null
          email?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          total_bookings?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      equipment: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          icon: string
          id: string
          is_active: boolean | null
          is_standard: boolean | null
          name: string
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string
          id?: string
          is_active?: boolean | null
          is_standard?: boolean | null
          name: string
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string
          id?: string
          is_active?: boolean | null
          is_standard?: boolean | null
          name?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      extras: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          max_quantity: number | null
          name: string
          price_per_day: number | null
          price_per_rental: number | null
          price_per_unit: number | null
          price_type: string | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          max_quantity?: number | null
          name: string
          price_per_day?: number | null
          price_per_rental?: number | null
          price_per_unit?: number | null
          price_type?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          max_quantity?: number | null
          name?: string
          price_per_day?: number | null
          price_per_rental?: number | null
          price_per_unit?: number | null
          price_type?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      location_targets: {
        Row: {
          canonical_url: string | null
          content_generated_at: string | null
          content_sections: Json | null
          content_word_count: number | null
          created_at: string | null
          display_order: number | null
          distance_km: number | null
          faqs: Json | null
          featured_image: string | null
          h1_title: string
          hero_content: Json | null
          id: string
          intro_text: string | null
          is_active: boolean | null
          last_updated_content: string | null
          latitude: number | null
          local_content: Json | null
          longitude: number | null
          meta_description: string
          meta_title: string
          name: string
          nearest_location_id: string
          page_views: number | null
          province: string | null
          region: string | null
          slug: string
          tourism_info: Json | null
          travel_time_minutes: number | null
          updated_at: string | null
        }
        Insert: {
          canonical_url?: string | null
          content_generated_at?: string | null
          content_sections?: Json | null
          content_word_count?: number | null
          created_at?: string | null
          display_order?: number | null
          distance_km?: number | null
          faqs?: Json | null
          featured_image?: string | null
          h1_title: string
          hero_content?: Json | null
          id?: string
          intro_text?: string | null
          is_active?: boolean | null
          last_updated_content?: string | null
          latitude?: number | null
          local_content?: Json | null
          longitude?: number | null
          meta_description: string
          meta_title: string
          name: string
          nearest_location_id: string
          page_views?: number | null
          province?: string | null
          region?: string | null
          slug: string
          tourism_info?: Json | null
          travel_time_minutes?: number | null
          updated_at?: string | null
        }
        Update: {
          canonical_url?: string | null
          content_generated_at?: string | null
          content_sections?: Json | null
          content_word_count?: number | null
          created_at?: string | null
          display_order?: number | null
          distance_km?: number | null
          faqs?: Json | null
          featured_image?: string | null
          h1_title?: string
          hero_content?: Json | null
          id?: string
          intro_text?: string | null
          is_active?: boolean | null
          last_updated_content?: string | null
          latitude?: number | null
          local_content?: Json | null
          longitude?: number | null
          meta_description?: string
          meta_title?: string
          name?: string
          nearest_location_id?: string
          page_views?: number | null
          province?: string | null
          region?: string | null
          slug?: string
          tourism_info?: Json | null
          travel_time_minutes?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "location_targets_nearest_location_id_fkey"
            columns: ["nearest_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          address: string | null
          city: string | null
          closing_time: string | null
          created_at: string | null
          email: string | null
          extra_fee: number | null
          id: string
          is_active: boolean | null
          is_dropoff: boolean | null
          is_pickup: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          notes: string | null
          opening_time: string | null
          phone: string | null
          postal_code: string | null
          slug: string
          sort_order: number
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          closing_time?: string | null
          created_at?: string | null
          email?: string | null
          extra_fee?: number | null
          id?: string
          is_active?: boolean | null
          is_dropoff?: boolean | null
          is_pickup?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          notes?: string | null
          opening_time?: string | null
          phone?: string | null
          postal_code?: string | null
          slug: string
          sort_order?: number
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          closing_time?: string | null
          created_at?: string | null
          email?: string | null
          extra_fee?: number | null
          id?: string
          is_active?: boolean | null
          is_dropoff?: boolean | null
          is_pickup?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          notes?: string | null
          opening_time?: string | null
          phone?: string | null
          postal_code?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      media: {
        Row: {
          alt_text: string | null
          caption: string | null
          created_at: string | null
          filename: string
          folder: string | null
          height: number | null
          id: string
          mime_type: string | null
          original_name: string
          size: number | null
          thumbnail_url: string | null
          uploaded_by: string | null
          url: string
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string | null
          filename: string
          folder?: string | null
          height?: number | null
          id?: string
          mime_type?: string | null
          original_name: string
          size?: number | null
          thumbnail_url?: string | null
          uploaded_by?: string | null
          url: string
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string | null
          filename?: string
          folder?: string | null
          height?: number | null
          id?: string
          mime_type?: string | null
          original_name?: string
          size?: number | null
          thumbnail_url?: string | null
          uploaded_by?: string | null
          url?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          authorization_code: string | null
          booking_id: string
          card_country: string | null
          card_type: string | null
          created_at: string | null
          id: string
          notes: string | null
          order_number: string
          payment_method: string | null
          payment_type: string | null
          refunded_amount: number | null
          response_code: string | null
          status: string | null
          transaction_date: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          authorization_code?: string | null
          booking_id: string
          card_country?: string | null
          card_type?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          order_number: string
          payment_method?: string | null
          payment_type?: string | null
          refunded_amount?: number | null
          response_code?: string | null
          status?: string | null
          transaction_date?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          authorization_code?: string | null
          booking_id?: string
          card_country?: string | null
          card_type?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          payment_type?: string | null
          refunded_amount?: number | null
          response_code?: string | null
          status?: string | null
          transaction_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      post_tags: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          tag_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          allow_comments: boolean | null
          author_id: string | null
          category_id: string | null
          content: string
          content_en: string | null
          created_at: string | null
          excerpt: string | null
          excerpt_en: string | null
          featured_image: string | null
          id: string
          images: Json | null
          is_featured: boolean | null
          meta_description: string | null
          meta_keywords: string | null
          meta_title: string | null
          og_image: string | null
          post_type: string | null
          published_at: string | null
          reading_time: number | null
          slug: string
          slug_en: string | null
          status: string | null
          title: string
          title_en: string | null
          updated_at: string | null
          views: number | null
        }
        Insert: {
          allow_comments?: boolean | null
          author_id?: string | null
          category_id?: string | null
          content: string
          content_en?: string | null
          created_at?: string | null
          excerpt?: string | null
          excerpt_en?: string | null
          featured_image?: string | null
          id?: string
          images?: Json | null
          is_featured?: boolean | null
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          og_image?: string | null
          post_type?: string | null
          published_at?: string | null
          reading_time?: number | null
          slug: string
          slug_en?: string | null
          status?: string | null
          title: string
          title_en?: string | null
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          allow_comments?: boolean | null
          author_id?: string | null
          category_id?: string | null
          content?: string
          content_en?: string | null
          created_at?: string | null
          excerpt?: string | null
          excerpt_en?: string | null
          featured_image?: string | null
          id?: string
          images?: Json | null
          is_featured?: boolean | null
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          og_image?: string | null
          post_type?: string | null
          published_at?: string | null
          reading_time?: number | null
          slug?: string
          slug_en?: string | null
          status?: string | null
          title?: string
          title_en?: string | null
          updated_at?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "content_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      seasons: {
        Row: {
          base_price_per_day: number | null
          created_at: string | null
          end_date: string
          id: string
          is_active: boolean | null
          min_days: number | null
          name: string
          price_less_than_week: number | null
          price_one_week: number | null
          price_three_weeks: number | null
          price_two_weeks: number | null
          slug: string
          start_date: string
          updated_at: string | null
          year: number | null
        }
        Insert: {
          base_price_per_day?: number | null
          created_at?: string | null
          end_date: string
          id?: string
          is_active?: boolean | null
          min_days?: number | null
          name: string
          price_less_than_week?: number | null
          price_one_week?: number | null
          price_three_weeks?: number | null
          price_two_weeks?: number | null
          slug: string
          start_date: string
          updated_at?: string | null
          year?: number | null
        }
        Update: {
          base_price_per_day?: number | null
          created_at?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          min_days?: number | null
          name?: string
          price_less_than_week?: number | null
          price_one_week?: number | null
          price_three_weeks?: number | null
          price_two_weeks?: number | null
          slug?: string
          start_date?: string
          updated_at?: string | null
          year?: number | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      system_logs: {
        Row: {
          created_at: string | null
          id: string
          ip_address: unknown
          log_type: string
          message: string
          metadata: Json | null
          reference_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address?: unknown
          log_type: string
          message: string
          metadata?: Json | null
          reference_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: unknown
          log_type?: string
          message?: string
          metadata?: Json | null
          reference_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      tags: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      vehicle_available_extras: {
        Row: {
          created_at: string | null
          extra_id: string
          id: string
          vehicle_id: string
        }
        Insert: {
          created_at?: string | null
          extra_id: string
          id?: string
          vehicle_id: string
        }
        Update: {
          created_at?: string | null
          extra_id?: string
          id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_available_extras_extra_id_fkey"
            columns: ["extra_id"]
            isOneToOne: false
            referencedRelation: "extras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_available_extras_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_available_extras_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles_ordered"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      vehicle_category_assignments: {
        Row: {
          category_id: string
          created_at: string | null
          id: string
          vehicle_id: string
        }
        Insert: {
          category_id: string
          created_at?: string | null
          id?: string
          vehicle_id: string
        }
        Update: {
          category_id?: string
          created_at?: string | null
          id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_category_assignments_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "vehicle_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_category_assignments_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_category_assignments_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles_ordered"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_damages: {
        Row: {
          booking_id: string | null
          created_at: string | null
          damage_number: number | null
          damage_type: string | null
          description: string
          id: string
          images: Json | null
          is_pre_existing: boolean | null
          location: string | null
          notes: string | null
          photo_urls: Json | null
          position_x: number | null
          position_y: number | null
          repair_cost: number | null
          repaired_date: string | null
          reported_by: string | null
          reported_date: string | null
          severity: string | null
          status: string | null
          updated_at: string | null
          vehicle_id: string
          view_type: string | null
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          damage_number?: number | null
          damage_type?: string | null
          description: string
          id?: string
          images?: Json | null
          is_pre_existing?: boolean | null
          location?: string | null
          notes?: string | null
          photo_urls?: Json | null
          position_x?: number | null
          position_y?: number | null
          repair_cost?: number | null
          repaired_date?: string | null
          reported_by?: string | null
          reported_date?: string | null
          severity?: string | null
          status?: string | null
          updated_at?: string | null
          vehicle_id: string
          view_type?: string | null
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          damage_number?: number | null
          damage_type?: string | null
          description?: string
          id?: string
          images?: Json | null
          is_pre_existing?: boolean | null
          location?: string | null
          notes?: string | null
          photo_urls?: Json | null
          position_x?: number | null
          position_y?: number | null
          repair_cost?: number | null
          repaired_date?: string | null
          reported_by?: string | null
          reported_date?: string | null
          severity?: string | null
          status?: string | null
          updated_at?: string | null
          vehicle_id?: string
          view_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_damages_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_damages_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles_ordered"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_equipment: {
        Row: {
          created_at: string | null
          equipment_id: string
          id: string
          notes: string | null
          vehicle_id: string
        }
        Insert: {
          created_at?: string | null
          equipment_id: string
          id?: string
          notes?: string | null
          vehicle_id: string
        }
        Update: {
          created_at?: string | null
          equipment_id?: string
          id?: string
          notes?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_equipment_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_equipment_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_equipment_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles_ordered"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_features: {
        Row: {
          created_at: string | null
          feature_name: string
          feature_value: string | null
          id: string
          is_highlighted: boolean | null
          sort_order: number | null
          updated_at: string | null
          vehicle_id: string
        }
        Insert: {
          created_at?: string | null
          feature_name: string
          feature_value?: string | null
          id?: string
          is_highlighted?: boolean | null
          sort_order?: number | null
          updated_at?: string | null
          vehicle_id: string
        }
        Update: {
          created_at?: string | null
          feature_name?: string
          feature_value?: string | null
          id?: string
          is_highlighted?: boolean | null
          sort_order?: number | null
          updated_at?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_features_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_features_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles_ordered"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_images: {
        Row: {
          alt_text: string | null
          created_at: string | null
          id: string
          image_url: string
          is_primary: boolean | null
          sort_order: number | null
          updated_at: string | null
          vehicle_id: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          id?: string
          image_url: string
          is_primary?: boolean | null
          sort_order?: number | null
          updated_at?: string | null
          vehicle_id: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          id?: string
          image_url?: string
          is_primary?: boolean | null
          sort_order?: number | null
          updated_at?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_images_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_images_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles_ordered"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_maintenance_records: {
        Row: {
          cost: number | null
          created_at: string | null
          description: string
          id: string
          maintenance_type: string
          mileage: number | null
          next_maintenance_date: string | null
          next_maintenance_mileage: number | null
          notes: string | null
          performed_at: string
          performed_by: string | null
          updated_at: string | null
          vehicle_id: string
        }
        Insert: {
          cost?: number | null
          created_at?: string | null
          description: string
          id?: string
          maintenance_type: string
          mileage?: number | null
          next_maintenance_date?: string | null
          next_maintenance_mileage?: number | null
          notes?: string | null
          performed_at: string
          performed_by?: string | null
          updated_at?: string | null
          vehicle_id: string
        }
        Update: {
          cost?: number | null
          created_at?: string | null
          description?: string
          id?: string
          maintenance_type?: string
          mileage?: number | null
          next_maintenance_date?: string | null
          next_maintenance_mileage?: number | null
          notes?: string | null
          performed_at?: string
          performed_by?: string | null
          updated_at?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_maintenance_records_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_maintenance_records_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles_ordered"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_prices: {
        Row: {
          created_at: string | null
          id: string
          price_per_day: number
          price_per_week: number | null
          season_id: string | null
          vehicle_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          price_per_day: number
          price_per_week?: number | null
          season_id?: string | null
          vehicle_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          price_per_day?: number
          price_per_week?: number | null
          season_id?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_prices_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_prices_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_prices_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles_ordered"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          base_price_per_day: number | null
          battery_capacity: string | null
          beds: number | null
          beds_detail: string | null
          brand: string | null
          category_id: string | null
          condition: string | null
          created_at: string | null
          current_mileage: number | null
          description: string | null
          drive_type: string | null
          emission_standard: string | null
          engine_displacement: string | null
          engine_power: string | null
          features: Json | null
          features_json: Json | null
          fuel_consumption: string | null
          fuel_tank_capacity: number | null
          fuel_type: string | null
          gears: number | null
          has_ac: boolean | null
          has_awning: boolean | null
          has_bathroom: boolean | null
          has_fridge: boolean | null
          has_heating: boolean | null
          has_hot_water: boolean | null
          has_kitchen: boolean | null
          has_shower: boolean | null
          has_solar_panel: boolean | null
          has_toilet: boolean | null
          height: number | null
          height_m: number | null
          high_season_price: number | null
          id: string
          insurance_policy: string | null
          internal_code: string | null
          is_for_rent: boolean | null
          is_for_sale: boolean | null
          last_inspection_date: string | null
          last_service_date: string | null
          length: number | null
          length_m: number | null
          license_plate: string | null
          location: string | null
          main_image_url: string | null
          maintenance_notes: string | null
          meta_description: string | null
          meta_keywords: string | null
          meta_title: string | null
          mileage: number | null
          mileage_unit: string | null
          min_rental_days: number | null
          model: string | null
          name: string
          next_inspection_date: string | null
          next_itv_date: string | null
          next_service_mileage: number | null
          payload: number | null
          plate_number: string | null
          previous_owners: number | null
          registration_date: string | null
          sale_description: string | null
          sale_highlights: Json | null
          sale_meta_description: string | null
          sale_meta_title: string | null
          sale_price: number | null
          sale_price_negotiable: boolean | null
          sale_status: string | null
          seats: number | null
          short_description: string | null
          slug: string
          solar_panel: boolean | null
          solar_power: number | null
          sort_order: number | null
          status: string | null
          toilet_capacity: number | null
          transmission: string | null
          updated_at: string | null
          vin: string | null
          warranty_until: string | null
          waste_water_capacity: number | null
          water_tank_capacity: number | null
          weight_empty: number | null
          weight_max: number | null
          width: number | null
          width_m: number | null
          year: number | null
        }
        Insert: {
          base_price_per_day?: number | null
          battery_capacity?: string | null
          beds?: number | null
          beds_detail?: string | null
          brand?: string | null
          category_id?: string | null
          condition?: string | null
          created_at?: string | null
          current_mileage?: number | null
          description?: string | null
          drive_type?: string | null
          emission_standard?: string | null
          engine_displacement?: string | null
          engine_power?: string | null
          features?: Json | null
          features_json?: Json | null
          fuel_consumption?: string | null
          fuel_tank_capacity?: number | null
          fuel_type?: string | null
          gears?: number | null
          has_ac?: boolean | null
          has_awning?: boolean | null
          has_bathroom?: boolean | null
          has_fridge?: boolean | null
          has_heating?: boolean | null
          has_hot_water?: boolean | null
          has_kitchen?: boolean | null
          has_shower?: boolean | null
          has_solar_panel?: boolean | null
          has_toilet?: boolean | null
          height?: number | null
          height_m?: number | null
          high_season_price?: number | null
          id?: string
          insurance_policy?: string | null
          internal_code?: string | null
          is_for_rent?: boolean | null
          is_for_sale?: boolean | null
          last_inspection_date?: string | null
          last_service_date?: string | null
          length?: number | null
          length_m?: number | null
          license_plate?: string | null
          location?: string | null
          main_image_url?: string | null
          maintenance_notes?: string | null
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          mileage?: number | null
          mileage_unit?: string | null
          min_rental_days?: number | null
          model?: string | null
          name: string
          next_inspection_date?: string | null
          next_itv_date?: string | null
          next_service_mileage?: number | null
          payload?: number | null
          plate_number?: string | null
          previous_owners?: number | null
          registration_date?: string | null
          sale_description?: string | null
          sale_highlights?: Json | null
          sale_meta_description?: string | null
          sale_meta_title?: string | null
          sale_price?: number | null
          sale_price_negotiable?: boolean | null
          sale_status?: string | null
          seats?: number | null
          short_description?: string | null
          slug: string
          solar_panel?: boolean | null
          solar_power?: number | null
          sort_order?: number | null
          status?: string | null
          toilet_capacity?: number | null
          transmission?: string | null
          updated_at?: string | null
          vin?: string | null
          warranty_until?: string | null
          waste_water_capacity?: number | null
          water_tank_capacity?: number | null
          weight_empty?: number | null
          weight_max?: number | null
          width?: number | null
          width_m?: number | null
          year?: number | null
        }
        Update: {
          base_price_per_day?: number | null
          battery_capacity?: string | null
          beds?: number | null
          beds_detail?: string | null
          brand?: string | null
          category_id?: string | null
          condition?: string | null
          created_at?: string | null
          current_mileage?: number | null
          description?: string | null
          drive_type?: string | null
          emission_standard?: string | null
          engine_displacement?: string | null
          engine_power?: string | null
          features?: Json | null
          features_json?: Json | null
          fuel_consumption?: string | null
          fuel_tank_capacity?: number | null
          fuel_type?: string | null
          gears?: number | null
          has_ac?: boolean | null
          has_awning?: boolean | null
          has_bathroom?: boolean | null
          has_fridge?: boolean | null
          has_heating?: boolean | null
          has_hot_water?: boolean | null
          has_kitchen?: boolean | null
          has_shower?: boolean | null
          has_solar_panel?: boolean | null
          has_toilet?: boolean | null
          height?: number | null
          height_m?: number | null
          high_season_price?: number | null
          id?: string
          insurance_policy?: string | null
          internal_code?: string | null
          is_for_rent?: boolean | null
          is_for_sale?: boolean | null
          last_inspection_date?: string | null
          last_service_date?: string | null
          length?: number | null
          length_m?: number | null
          license_plate?: string | null
          location?: string | null
          main_image_url?: string | null
          maintenance_notes?: string | null
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          mileage?: number | null
          mileage_unit?: string | null
          min_rental_days?: number | null
          model?: string | null
          name?: string
          next_inspection_date?: string | null
          next_itv_date?: string | null
          next_service_mileage?: number | null
          payload?: number | null
          plate_number?: string | null
          previous_owners?: number | null
          registration_date?: string | null
          sale_description?: string | null
          sale_highlights?: Json | null
          sale_meta_description?: string | null
          sale_meta_title?: string | null
          sale_price?: number | null
          sale_price_negotiable?: boolean | null
          sale_status?: string | null
          seats?: number | null
          short_description?: string | null
          slug?: string
          solar_panel?: boolean | null
          solar_power?: number | null
          sort_order?: number | null
          status?: string | null
          toilet_capacity?: number | null
          transmission?: string | null
          updated_at?: string | null
          vin?: string | null
          warranty_until?: string | null
          waste_water_capacity?: number | null
          water_tank_capacity?: number | null
          weight_empty?: number | null
          weight_max?: number | null
          width?: number | null
          width_m?: number | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "vehicle_categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      vehicles_ordered: {
        Row: {
          base_price_per_day: number | null
          battery_capacity: string | null
          beds: number | null
          beds_detail: string | null
          brand: string | null
          category_id: string | null
          category_name: string | null
          category_slug: string | null
          condition: string | null
          created_at: string | null
          current_mileage: number | null
          description: string | null
          drive_type: string | null
          emission_standard: string | null
          engine_displacement: string | null
          engine_power: string | null
          features: Json | null
          features_json: Json | null
          fuel_consumption: string | null
          fuel_tank_capacity: number | null
          fuel_type: string | null
          gears: number | null
          has_ac: boolean | null
          has_awning: boolean | null
          has_bathroom: boolean | null
          has_fridge: boolean | null
          has_heating: boolean | null
          has_hot_water: boolean | null
          has_kitchen: boolean | null
          has_shower: boolean | null
          has_solar_panel: boolean | null
          has_toilet: boolean | null
          height: number | null
          height_m: number | null
          high_season_price: number | null
          id: string | null
          insurance_policy: string | null
          internal_code: string | null
          is_for_rent: boolean | null
          is_for_sale: boolean | null
          last_inspection_date: string | null
          last_service_date: string | null
          length: number | null
          length_m: number | null
          license_plate: string | null
          location: string | null
          maintenance_notes: string | null
          meta_description: string | null
          meta_keywords: string | null
          meta_title: string | null
          mileage: number | null
          mileage_unit: string | null
          min_rental_days: number | null
          model: string | null
          name: string | null
          next_inspection_date: string | null
          next_itv_date: string | null
          next_service_mileage: number | null
          payload: number | null
          plate_number: string | null
          previous_owners: number | null
          registration_date: string | null
          sale_description: string | null
          sale_highlights: Json | null
          sale_meta_description: string | null
          sale_meta_title: string | null
          sale_price: number | null
          sale_price_negotiable: boolean | null
          sale_status: string | null
          seats: number | null
          short_description: string | null
          slug: string | null
          solar_panel: boolean | null
          solar_power: number | null
          sort_order: number | null
          status: string | null
          toilet_capacity: number | null
          transmission: string | null
          updated_at: string | null
          vin: string | null
          warranty_until: string | null
          waste_water_capacity: number | null
          water_tank_capacity: number | null
          weight_empty: number | null
          weight_max: number | null
          width: number | null
          width_m: number | null
          year: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "vehicle_categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      calculate_payment_status: {
        Args: { p_amount_paid: number; p_total_price: number }
        Returns: string
      }
      calculate_reading_time: { Args: { content: string }; Returns: number }
      check_vehicle_availability: {
        Args: {
          p_dropoff_date: string
          p_pickup_date: string
          p_vehicle_id: string
        }
        Returns: boolean
      }
      get_first_payment: { Args: { p_total_price: number }; Returns: number }
      get_rental_vehicles_ordered: {
        Args: never
        Returns: {
          base_price_per_day: number
          brand: string
          category_id: string
          category_name: string
          id: string
          internal_code: string
          model: string
          name: string
          slug: string
          status: string
          year: number
        }[]
      }
      get_second_payment: { Args: { p_total_price: number }; Returns: number }
      increment_post_views: { Args: { post_id: string }; Returns: undefined }
      is_second_payment_due: {
        Args: { p_pickup_date: string }
        Returns: boolean
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
