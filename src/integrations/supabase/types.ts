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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      amrit_yojna_data: {
        Row: {
          color: string | null
          conductivity_cl: string | null
          connection_number: string
          created_at: string
          customer_name: string
          date: string
          document_url: string | null
          id: string
          mobile_no: string
          ph_value: string | null
          signature: string | null
          smell: string | null
          tds: string | null
          updated_at: string
          user_id: string | null
          ward_no: string
        }
        Insert: {
          color?: string | null
          conductivity_cl?: string | null
          connection_number: string
          created_at?: string
          customer_name: string
          date: string
          document_url?: string | null
          id?: string
          mobile_no: string
          ph_value?: string | null
          signature?: string | null
          smell?: string | null
          tds?: string | null
          updated_at?: string
          user_id?: string | null
          ward_no: string
        }
        Update: {
          color?: string | null
          conductivity_cl?: string | null
          connection_number?: string
          created_at?: string
          customer_name?: string
          date?: string
          document_url?: string | null
          id?: string
          mobile_no?: string
          ph_value?: string | null
          signature?: string | null
          smell?: string | null
          tds?: string | null
          updated_at?: string
          user_id?: string | null
          ward_no?: string
        }
        Relationships: []
      }
      lab_tests: {
        Row: {
          calcium: string | null
          chloride: string | null
          created_at: string | null
          e_coli: string | null
          fluoride: string | null
          free_residual_chlorine: string | null
          id: string
          iron: string | null
          magnesium: string | null
          notes: string | null
          ph: string | null
          sample_id: string
          sample_image_url: string
          sample_type: string | null
          submitter_address: string
          submitter_email: string
          submitter_mobile: string
          submitter_name: string
          sulphate: string | null
          tds: string | null
          total_alkalinity: string | null
          total_coliform: string | null
          total_hardness: string | null
          turbidity: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          calcium?: string | null
          chloride?: string | null
          created_at?: string | null
          e_coli?: string | null
          fluoride?: string | null
          free_residual_chlorine?: string | null
          id?: string
          iron?: string | null
          magnesium?: string | null
          notes?: string | null
          ph?: string | null
          sample_id: string
          sample_image_url: string
          sample_type?: string | null
          submitter_address: string
          submitter_email: string
          submitter_mobile: string
          submitter_name: string
          sulphate?: string | null
          tds?: string | null
          total_alkalinity?: string | null
          total_coliform?: string | null
          total_hardness?: string | null
          turbidity?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          calcium?: string | null
          chloride?: string | null
          created_at?: string | null
          e_coli?: string | null
          fluoride?: string | null
          free_residual_chlorine?: string | null
          id?: string
          iron?: string | null
          magnesium?: string | null
          notes?: string | null
          ph?: string | null
          sample_id?: string
          sample_image_url?: string
          sample_type?: string | null
          submitter_address?: string
          submitter_email?: string
          submitter_mobile?: string
          submitter_name?: string
          sulphate?: string | null
          tds?: string | null
          total_alkalinity?: string | null
          total_coliform?: string | null
          total_hardness?: string | null
          turbidity?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      license_applications: {
        Row: {
          applicant_name: string
          created_at: string
          documents_url: string[] | null
          email: string
          id: string
          mobile_number: string
          shop_registration_number: string
          status: string
          tracking_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          applicant_name: string
          created_at?: string
          documents_url?: string[] | null
          email: string
          id?: string
          mobile_number: string
          shop_registration_number: string
          status?: string
          tracking_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          applicant_name?: string
          created_at?: string
          documents_url?: string[] | null
          email?: string
          id?: string
          mobile_number?: string
          shop_registration_number?: string
          status?: string
          tracking_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      license_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          license_id: string
          message: string
          notification_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          license_id: string
          message: string
          notification_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          license_id?: string
          message?: string
          notification_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "license_notifications_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "licenses"
            referencedColumns: ["id"]
          },
        ]
      }
      licenses: {
        Row: {
          application_id: string
          approval_date: string
          created_at: string
          expiry_date: string
          id: string
          license_number: string
          updated_at: string
          user_id: string
        }
        Insert: {
          application_id: string
          approval_date: string
          created_at?: string
          expiry_date: string
          id?: string
          license_number: string
          updated_at?: string
          user_id: string
        }
        Update: {
          application_id?: string
          approval_date?: string
          created_at?: string
          expiry_date?: string
          id?: string
          license_number?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "licenses_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "license_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          description: string | null
          file_path: string
          file_type: string
          id: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_path: string
          file_type: string
          id?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          file_path?: string
          file_type?: string
          id?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      sewer_quality_data: {
        Row: {
          ammonical_nitrogen: string | null
          bod: string | null
          cod: string | null
          created_at: string
          document_url: string | null
          fecal_coliform: string | null
          id: string
          ph_value: string | null
          plant_id: string
          total_nitrogen: string | null
          total_phosphorus: string | null
          tss: string | null
          updated_at: string
          user_id: string | null
          water_type: string
        }
        Insert: {
          ammonical_nitrogen?: string | null
          bod?: string | null
          cod?: string | null
          created_at?: string
          document_url?: string | null
          fecal_coliform?: string | null
          id?: string
          ph_value?: string | null
          plant_id: string
          total_nitrogen?: string | null
          total_phosphorus?: string | null
          tss?: string | null
          updated_at?: string
          user_id?: string | null
          water_type: string
        }
        Update: {
          ammonical_nitrogen?: string | null
          bod?: string | null
          cod?: string | null
          created_at?: string
          document_url?: string | null
          fecal_coliform?: string | null
          id?: string
          ph_value?: string | null
          plant_id?: string
          total_nitrogen?: string | null
          total_phosphorus?: string | null
          tss?: string | null
          updated_at?: string
          user_id?: string | null
          water_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "sewer_quality_data_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "sewer_treatment_plants"
            referencedColumns: ["id"]
          },
        ]
      }
      sewer_treatment_plants: {
        Row: {
          capacity: string | null
          created_at: string
          id: string
          location: string
          name: string
          updated_at: string
        }
        Insert: {
          capacity?: string | null
          created_at?: string
          id?: string
          location: string
          name: string
          updated_at?: string
        }
        Update: {
          capacity?: string | null
          created_at?: string
          id?: string
          location?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      water_quality_data: {
        Row: {
          alkalinity: string | null
          chlorides: string | null
          created_at: string
          dissolved_oxygen: string | null
          document_url: string | null
          hardness: string | null
          id: string
          iron: string | null
          ph_value: string | null
          plant_id: string
          turbidity: string | null
          updated_at: string
          user_id: string | null
          water_type: string
        }
        Insert: {
          alkalinity?: string | null
          chlorides?: string | null
          created_at?: string
          dissolved_oxygen?: string | null
          document_url?: string | null
          hardness?: string | null
          id?: string
          iron?: string | null
          ph_value?: string | null
          plant_id: string
          turbidity?: string | null
          updated_at?: string
          user_id?: string | null
          water_type: string
        }
        Update: {
          alkalinity?: string | null
          chlorides?: string | null
          created_at?: string
          dissolved_oxygen?: string | null
          document_url?: string | null
          hardness?: string | null
          id?: string
          iron?: string | null
          ph_value?: string | null
          plant_id?: string
          turbidity?: string | null
          updated_at?: string
          user_id?: string | null
          water_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "water_quality_data_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "water_treatment_plants"
            referencedColumns: ["id"]
          },
        ]
      }
      water_samples: {
        Row: {
          address: string
          admin_notes: string | null
          created_at: string
          id: string
          mobile_number: string
          name: string
          sample_image_url: string
          source_of_sample: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address: string
          admin_notes?: string | null
          created_at?: string
          id?: string
          mobile_number: string
          name: string
          sample_image_url: string
          source_of_sample: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string
          admin_notes?: string | null
          created_at?: string
          id?: string
          mobile_number?: string
          name?: string
          sample_image_url?: string
          source_of_sample?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      water_test_reports: {
        Row: {
          additional_notes: string | null
          calcium_ca: number | null
          chloride_cl: number | null
          created_at: string
          ecoli: string | null
          fluoride_f: number | null
          id: string
          iron_fe: number | null
          magnesium_mg: number | null
          ph_level: number | null
          residual_chlorine: number | null
          sample_id: string
          sulphate_so4: number | null
          tds: number | null
          total_alkalinity: number | null
          total_coliform: string | null
          total_hardness: number | null
          turbidity: number | null
          updated_at: string
        }
        Insert: {
          additional_notes?: string | null
          calcium_ca?: number | null
          chloride_cl?: number | null
          created_at?: string
          ecoli?: string | null
          fluoride_f?: number | null
          id?: string
          iron_fe?: number | null
          magnesium_mg?: number | null
          ph_level?: number | null
          residual_chlorine?: number | null
          sample_id: string
          sulphate_so4?: number | null
          tds?: number | null
          total_alkalinity?: number | null
          total_coliform?: string | null
          total_hardness?: number | null
          turbidity?: number | null
          updated_at?: string
        }
        Update: {
          additional_notes?: string | null
          calcium_ca?: number | null
          chloride_cl?: number | null
          created_at?: string
          ecoli?: string | null
          fluoride_f?: number | null
          id?: string
          iron_fe?: number | null
          magnesium_mg?: number | null
          ph_level?: number | null
          residual_chlorine?: number | null
          sample_id?: string
          sulphate_so4?: number | null
          tds?: number | null
          total_alkalinity?: number | null
          total_coliform?: string | null
          total_hardness?: number | null
          turbidity?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "water_test_reports_sample_id_fkey"
            columns: ["sample_id"]
            isOneToOne: false
            referencedRelation: "water_samples"
            referencedColumns: ["id"]
          },
        ]
      }
      water_treatment_plants: {
        Row: {
          capacity: string | null
          created_at: string
          id: string
          location: string
          name: string
          updated_at: string
        }
        Insert: {
          capacity?: string | null
          created_at?: string
          id?: string
          location: string
          name: string
          updated_at?: string
        }
        Update: {
          capacity?: string | null
          created_at?: string
          id?: string
          location?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_tracking_number: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { user_id: string }; Returns: boolean }
      is_user_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
      user_role: "user" | "admin"
      water_type: "raw_water" | "clean_water" | "inlet_water" | "outlet_water"
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
    Enums: {
      app_role: ["admin", "user"],
      user_role: ["user", "admin"],
      water_type: ["raw_water", "clean_water", "inlet_water", "outlet_water"],
    },
  },
} as const
