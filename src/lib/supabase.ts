import { createClient } from '@supabase/supabase-js'

// These will be replaced with your actual Supabase credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types for Supabase
export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          sku: string
          name: string
          name_he: string
          category: string
          description: string | null
          piece_count: number | null
          min_age: number | null
          image_url: string
          images: string[] | null
          release_year: number | null
          is_retired: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['products']['Insert']>
      }
      prices: {
        Row: {
          id: string
          product_id: string
          store_id: string
          price: number
          original_price: number | null
          currency: string
          in_stock: boolean
          url: string
          last_updated: string
          is_on_sale: boolean
          discount_percentage: number | null
        }
        Insert: Omit<Database['public']['Tables']['prices']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['prices']['Insert']>
      }
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      alerts: {
        Row: {
          id: string
          user_id: string
          product_id: string | null
          category: string | null
          target_price: number | null
          notify_on_any_discount: boolean
          is_active: boolean
          created_at: string
          last_triggered: string | null
        }
        Insert: Omit<Database['public']['Tables']['alerts']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['alerts']['Insert']>
      }
      price_history: {
        Row: {
          id: string
          product_id: string
          store_id: string
          price: number
          recorded_at: string
        }
        Insert: Omit<Database['public']['Tables']['price_history']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['price_history']['Insert']>
      }
    }
  }
}
