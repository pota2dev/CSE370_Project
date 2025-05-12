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
      rooms: {
        Row: {
          id: string
          created_at: string
          user_id: string
          place_type: string
          guest_capacity: number
          bedroom_count: number
          bed_count: number
          bathroom_count: number
          size_sqm: number | null
          check_in_time: string
          check_out_time: string
          location: string
          map_id: string | null
          policy: string | null
          price: number
          currency: string
          description: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          place_type: string
          guest_capacity: number
          bedroom_count: number
          bed_count: number
          bathroom_count: number
          size_sqm?: number | null
          check_in_time: string
          check_out_time: string
          location: string
          map_id?: string | null
          policy?: string | null
          price: number
          currency: string
          description?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          place_type?: string
          guest_capacity?: number
          bedroom_count?: number
          bed_count?: number
          bathroom_count?: number
          size_sqm?: number | null
          check_in_time?: string
          check_out_time?: string
          location?: string
          map_id?: string | null
          policy?: string | null
          price?: number
          currency?: string
          description?: string | null
        }
      }
      // Add other tables as needed
    }
    Views: {
      // Define database views here
    }
    Functions: {
      // Define database functions here
    }
    Enums: {
      // Define database enums here
    }
  }
}