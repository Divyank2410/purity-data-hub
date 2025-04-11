export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "user" | "admin"
      water_type: "raw_water" | "clean_water" | "inlet_water" | "outlet_water"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["user", "admin"],
      water_type: ["raw_water", "clean_water", "inlet_water", "outlet_water"],
    },
  },
} as const
