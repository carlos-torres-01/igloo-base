// Contrato del esquema de supabase/migrations. Regenerar desde Supabase al cambiarlo.
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: Database["public"]["Enums"]["app_role"]
          is_active: boolean
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      update_managed_user: {
        Args: {
          target_user_id: string
          target_full_name: string
          target_role: Database["public"]["Enums"]["app_role"]
          target_is_active: boolean
        }
        Returns: undefined
      }
    }
    Enums: { app_role: "admin" | "user" }
    CompositeTypes: { [_ in never]: never }
  }
}
