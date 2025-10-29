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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          avatar: string | null
          role: 'admin' | 'production_manager' | 'production_team' | 'branding_partners' | 'factories' | 'jobwork_factories'
          team_id: string | null
          created_at: string
          updated_at: string
          last_login: string | null
        }
        Insert: {
          id?: string
          email: string
          name: string
          avatar?: string | null
          role?: 'admin' | 'production_manager' | 'production_team' | 'branding_partners' | 'factories' | 'jobwork_factories'
          team_id?: string | null
          created_at?: string
          updated_at?: string
          last_login?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string
          avatar?: string | null
          role?: 'admin' | 'production_manager' | 'production_team' | 'branding_partners' | 'factories' | 'jobwork_factories'
          team_id?: string | null
          created_at?: string
          updated_at?: string
          last_login?: string | null
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      permissions: {
        Row: {
          id: string
          module: string
          create_permission: boolean
          read_permission: boolean
          update_permission: boolean
          delete_permission: boolean
          role: 'admin' | 'production_manager' | 'production_team' | 'branding_partners' | 'factories' | 'jobwork_factories'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          module: string
          create_permission?: boolean
          read_permission?: boolean
          update_permission?: boolean
          delete_permission?: boolean
          role: 'admin' | 'production_manager' | 'production_team' | 'branding_partners' | 'factories' | 'jobwork_factories'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          module?: string
          create_permission?: boolean
          read_permission?: boolean
          update_permission?: boolean
          delete_permission?: boolean
          role?: 'admin' | 'production_manager' | 'production_team' | 'branding_partners' | 'factories' | 'jobwork_factories'
          created_at?: string
          updated_at?: string
        }
      }
      factories: {
        Row: {
          id: string
          name: string
          code: string
          address: string | null
          contact_person: string | null
          phone: string | null
          email: string | null
          status: 'active' | 'inactive' | 'suspended' | 'maintenance'
          capacity: number | null
          specializations: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          address?: string | null
          contact_person?: string | null
          phone?: string | null
          email?: string | null
          status?: 'active' | 'inactive' | 'suspended' | 'maintenance'
          capacity?: number | null
          specializations?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          address?: string | null
          contact_person?: string | null
          phone?: string | null
          email?: string | null
          status?: 'active' | 'inactive' | 'suspended' | 'maintenance'
          capacity?: number | null
          specializations?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      product_categories: {
        Row: {
          id: string
          category_code: string
          category_name: string
          category_description: string | null
          image_url: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_code: string
          category_name: string
          category_description?: string | null
          image_url?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_code?: string
          category_name?: string
          category_description?: string | null
          image_url?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          code: string
          description: string | null
          category_id: string | null
          specifications: Json | null
          unit: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          description?: string | null
          category_id?: string | null
          specifications?: Json | null
          unit?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          description?: string | null
          category_id?: string | null
          specifications?: Json | null
          unit?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          customer_name: string
          customer_email: string | null
          customer_phone: string | null
          status: 'draft' | 'pending' | 'confirmed' | 'in_production' | 'completed' | 'cancelled' | 'on_hold'
          total_amount: number | null
          notes: string | null
          delivery_date: string | null
          created_by: string | null
          assigned_factory_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number: string
          customer_name: string
          customer_email?: string | null
          customer_phone?: string | null
          status?: 'draft' | 'pending' | 'confirmed' | 'in_production' | 'completed' | 'cancelled' | 'on_hold'
          total_amount?: number | null
          notes?: string | null
          delivery_date?: string | null
          created_by?: string | null
          assigned_factory_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          customer_name?: string
          customer_email?: string | null
          customer_phone?: string | null
          status?: 'draft' | 'pending' | 'confirmed' | 'in_production' | 'completed' | 'cancelled' | 'on_hold'
          total_amount?: number | null
          notes?: string | null
          delivery_date?: string | null
          created_by?: string | null
          assigned_factory_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          quantity: number
          unit_price: number
          total_price: number
          specifications: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          quantity: number
          unit_price: number
          total_price: number
          specifications?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          quantity?: number
          unit_price?: number
          total_price?: number
          specifications?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      production_schedules: {
        Row: {
          id: string
          order_id: string | null
          factory_id: string | null
          start_date: string
          end_date: string
          status: string
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id?: string | null
          factory_id?: string | null
          start_date: string
          end_date: string
          status?: string
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string | null
          factory_id?: string | null
          start_date?: string
          end_date?: string
          status?: string
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      quality_checks: {
        Row: {
          id: string
          order_id: string | null
          factory_id: string | null
          check_type: string
          status: string
          notes: string | null
          checked_by: string | null
          checked_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id?: string | null
          factory_id?: string | null
          check_type: string
          status?: string
          notes?: string | null
          checked_by?: string | null
          checked_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string | null
          factory_id?: string | null
          check_type?: string
          status?: string
          notes?: string | null
          checked_by?: string | null
          checked_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      company_config: {
        Row: {
          id: string
          company_name: string
          company_code: string
          address: string | null
          city: string | null
          state: string | null
          country: string | null
          pincode: string | null
          phone: string | null
          email: string | null
          website: string | null
          gstin: string | null
          pan: string | null
          cin: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_name: string
          company_code: string
          address?: string | null
          city?: string | null
          state?: string | null
          country?: string | null
          pincode?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          gstin?: string | null
          pan?: string | null
          cin?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_name?: string
          company_code?: string
          address?: string | null
          city?: string | null
          state?: string | null
          country?: string | null
          pincode?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          gstin?: string | null
          pan?: string | null
          cin?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      branding_assets: {
        Row: {
          id: string
          asset_type: string
          asset_name: string
          file_path: string
          file_size: number | null
          mime_type: string | null
          width: number | null
          height: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          asset_type: string
          asset_name: string
          file_path: string
          file_size?: number | null
          mime_type?: string | null
          width?: number | null
          height?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          asset_type?: string
          asset_name?: string
          file_path?: string
          file_size?: number | null
          mime_type?: string | null
          width?: number | null
          height?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      document_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: string | null
          setting_type: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value?: string | null
          setting_type?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: string | null
          setting_type?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      fabric_master: {
        Row: {
          id: string
          fabric_code: string
          fabric_name: string
          color: string | null
          gsm: number | null
          uom: string
          colors: Json | null
          image_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          fabric_code: string
          fabric_name: string
          color?: string | null
          gsm?: number | null
          uom?: string
          colors?: Json | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          fabric_code?: string
          fabric_name?: string
          color?: string | null
          gsm?: number | null
          uom?: string
          colors?: Json | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      item_master: {
        Row: {
          id: string
          item_name: string
          item_code: string
          item_type: string | null
          category: string | null
          description: string | null
          unit_of_measure: string | null
          specifications: Json | null
          image_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          item_name: string
          item_code: string
          item_type?: string | null
          category?: string | null
          description?: string | null
          unit_of_measure?: string | null
          specifications?: Json | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          item_name?: string
          item_code?: string
          item_type?: string | null
          category?: string | null
          description?: string | null
          unit_of_measure?: string | null
          specifications?: Json | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      branding_master: {
        Row: {
          id: string
          branding_type: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          branding_type: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          branding_type?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      size_master: {
        Row: {
          id: string
          size_type: string
          image_url: string | null
          sizes: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          size_type: string
          image_url?: string | null
          sizes: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          size_type?: string
          image_url?: string | null
          sizes?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      customization_master: {
        Row: {
          id: string
          customization_name: string
          customization_code: string
          customization_type: string | null
          description: string | null
          cost_per_unit: number | null
          time_required_hours: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customization_name: string
          customization_code: string
          customization_type?: string | null
          description?: string | null
          cost_per_unit?: number | null
          time_required_hours?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customization_name?: string
          customization_code?: string
          customization_type?: string | null
          description?: string | null
          cost_per_unit?: number | null
          time_required_hours?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      customer_master: {
        Row: {
          id: string
          customer_name: string
          mobile_number: string
          city: string
          state: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_name: string
          mobile_number: string
          city: string
          state: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_name?: string
          mobile_number?: string
          city?: string
          state?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      vendor_master: {
        Row: {
          id: string
          vendor_name: string
          vendor_code: string
          vendor_type: string | null
          contact_person: string | null
          email: string | null
          phone: string | null
          address: string | null
          city: string | null
          state: string | null
          pincode: string | null
          country: string | null
          gstin: string | null
          pan: string | null
          bank_details: Json | null
          payment_terms: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vendor_name: string
          vendor_code: string
          vendor_type?: string | null
          contact_person?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          pincode?: string | null
          country?: string | null
          gstin?: string | null
          pan?: string | null
          bank_details?: Json | null
          payment_terms?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vendor_name?: string
          vendor_code?: string
          vendor_type?: string | null
          contact_person?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          pincode?: string | null
          country?: string | null
          gstin?: string | null
          pan?: string | null
          bank_details?: Json | null
          payment_terms?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      factory_master: {
        Row: {
          id: string
          factory_code: string
          factory_name: string
          factory_type: 'Own Factory' | 'Jobwork Factory'
          contact_person: string | null
          phone: string | null
          email: string | null
          address: string | null
          city: string | null
          state: string | null
          country: string | null
          pincode: string | null
          gstin: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          factory_code: string
          factory_name: string
          factory_type: 'Own Factory' | 'Jobwork Factory'
          contact_person?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          country?: string | null
          pincode?: string | null
          gstin?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          factory_code?: string
          factory_name?: string
          factory_type?: 'Own Factory' | 'Jobwork Factory'
          contact_person?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          country?: string | null
          pincode?: string | null
          gstin?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'admin' | 'production_manager' | 'production_team' | 'branding_partners' | 'factories' | 'jobwork_factories'
      order_status: 'draft' | 'pending' | 'confirmed' | 'in_production' | 'completed' | 'cancelled' | 'on_hold'
      factory_status: 'active' | 'inactive' | 'suspended' | 'maintenance'
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
