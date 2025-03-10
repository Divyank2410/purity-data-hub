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
        Args: {
          user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "user" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
