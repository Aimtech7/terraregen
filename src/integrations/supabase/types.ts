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
      alerts: {
        Row: {
          created_at: string
          id: string
          message: string
          time: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          time: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          time?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      carbon_credits: {
        Row: {
          area_hectares: number
          carbon_sequestered_tons: number
          certificate_url: string | null
          created_at: string
          credit_value_usd: number | null
          date: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          area_hectares: number
          carbon_sequestered_tons: number
          certificate_url?: string | null
          created_at?: string
          credit_value_usd?: number | null
          date: string
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          area_hectares?: number
          carbon_sequestered_tons?: number
          certificate_url?: string | null
          created_at?: string
          credit_value_usd?: number | null
          date?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          comment: string
          created_at: string
          id: string
          related_to_id: string
          related_to_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string
          id?: string
          related_to_id: string
          related_to_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          related_to_id?: string
          related_to_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      crop_insights: {
        Row: {
          climate_adaptation_notes: string | null
          county_id: string | null
          created_at: string
          crop_name: string
          fertilizer_recommendations: Json | null
          id: string
          market_insights: Json | null
          pest_disease_alerts: Json | null
          soil_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          climate_adaptation_notes?: string | null
          county_id?: string | null
          created_at?: string
          crop_name: string
          fertilizer_recommendations?: Json | null
          id?: string
          market_insights?: Json | null
          pest_disease_alerts?: Json | null
          soil_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          climate_adaptation_notes?: string | null
          county_id?: string | null
          created_at?: string
          crop_name?: string
          fertilizer_recommendations?: Json | null
          id?: string
          market_insights?: Json | null
          pest_disease_alerts?: Json | null
          soil_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crop_insights_county_id_fkey"
            columns: ["county_id"]
            isOneToOne: false
            referencedRelation: "kenya_counties"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_records: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          description: string | null
          id: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          date: string
          description?: string | null
          id?: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      kenya_counties: {
        Row: {
          agro_ecological_zone: string
          average_rainfall_mm: number | null
          code: string
          created_at: string
          id: string
          long_rains_end: string | null
          long_rains_start: string | null
          name: string
          rainfall_pattern: string
          short_rains_end: string | null
          short_rains_start: string | null
          updated_at: string
        }
        Insert: {
          agro_ecological_zone: string
          average_rainfall_mm?: number | null
          code: string
          created_at?: string
          id?: string
          long_rains_end?: string | null
          long_rains_start?: string | null
          name: string
          rainfall_pattern: string
          short_rains_end?: string | null
          short_rains_start?: string | null
          updated_at?: string
        }
        Update: {
          agro_ecological_zone?: string
          average_rainfall_mm?: number | null
          code?: string
          created_at?: string
          id?: string
          long_rains_end?: string | null
          long_rains_start?: string | null
          name?: string
          rainfall_pattern?: string
          short_rains_end?: string | null
          short_rains_start?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      land_polygons: {
        Row: {
          area_hectares: number | null
          color: string | null
          created_at: string
          id: string
          name: string
          notes: string | null
          polygon_data: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          area_hectares?: number | null
          color?: string | null
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          polygon_data: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          area_hectares?: number | null
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          polygon_data?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      local_weather_data: {
        Row: {
          county_id: string
          created_at: string
          date: string
          humidity_percent: number | null
          id: string
          precipitation_mm: number | null
          source: string
          temperature_max: number | null
          temperature_min: number | null
          wind_speed_kmh: number | null
        }
        Insert: {
          county_id: string
          created_at?: string
          date: string
          humidity_percent?: number | null
          id?: string
          precipitation_mm?: number | null
          source?: string
          temperature_max?: number | null
          temperature_min?: number | null
          wind_speed_kmh?: number | null
        }
        Update: {
          county_id?: string
          created_at?: string
          date?: string
          humidity_percent?: number | null
          id?: string
          precipitation_mm?: number | null
          source?: string
          temperature_max?: number | null
          temperature_min?: number | null
          wind_speed_kmh?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "local_weather_data_county_id_fkey"
            columns: ["county_id"]
            isOneToOne: false
            referencedRelation: "kenya_counties"
            referencedColumns: ["id"]
          },
        ]
      }
      metrics: {
        Row: {
          change: string
          created_at: string
          id: string
          metric_type: string
          trend: string
          updated_at: string
          user_id: string
          value: string
        }
        Insert: {
          change: string
          created_at?: string
          id?: string
          metric_type: string
          trend: string
          updated_at?: string
          user_id: string
          value: string
        }
        Update: {
          change?: string
          created_at?: string
          id?: string
          metric_type?: string
          trend?: string
          updated_at?: string
          user_id?: string
          value?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      planting_calendars: {
        Row: {
          county_id: string
          created_at: string
          crop_name: string
          crop_variety: string | null
          harvesting_window_end: string | null
          harvesting_window_start: string | null
          id: string
          planting_window_end: string
          planting_window_start: string
          recommended_soil_ph_max: number | null
          recommended_soil_ph_min: number | null
          season: string
          updated_at: string
          water_requirements: string | null
        }
        Insert: {
          county_id: string
          created_at?: string
          crop_name: string
          crop_variety?: string | null
          harvesting_window_end?: string | null
          harvesting_window_start?: string | null
          id?: string
          planting_window_end: string
          planting_window_start: string
          recommended_soil_ph_max?: number | null
          recommended_soil_ph_min?: number | null
          season: string
          updated_at?: string
          water_requirements?: string | null
        }
        Update: {
          county_id?: string
          created_at?: string
          crop_name?: string
          crop_variety?: string | null
          harvesting_window_end?: string | null
          harvesting_window_start?: string | null
          id?: string
          planting_window_end?: string
          planting_window_start?: string
          recommended_soil_ph_max?: number | null
          recommended_soil_ph_min?: number | null
          season?: string
          updated_at?: string
          water_requirements?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "planting_calendars_county_id_fkey"
            columns: ["county_id"]
            isOneToOne: false
            referencedRelation: "kenya_counties"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          land_size_hectares: number | null
          last_name: string | null
          location: string | null
          phone_number: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id: string
          land_size_hectares?: number | null
          last_name?: string | null
          location?: string | null
          phone_number?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          land_size_hectares?: number | null
          last_name?: string | null
          location?: string | null
          phone_number?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      rainfall_data: {
        Row: {
          created_at: string
          id: string
          month: string
          rainfall_mm: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          month: string
          rainfall_mm: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          month?: string
          rainfall_mm?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      soil_analyses: {
        Row: {
          analysis_result: Json | null
          created_at: string
          id: string
          image_url: string | null
          nitrogen_level: string | null
          organic_matter_percent: number | null
          ph_level: number | null
          phosphorus_level: string | null
          potassium_level: string | null
          recommendations: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_result?: Json | null
          created_at?: string
          id?: string
          image_url?: string | null
          nitrogen_level?: string | null
          organic_matter_percent?: number | null
          ph_level?: number | null
          phosphorus_level?: string | null
          potassium_level?: string | null
          recommendations?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_result?: Json | null
          created_at?: string
          id?: string
          image_url?: string | null
          nitrogen_level?: string | null
          organic_matter_percent?: number | null
          ph_level?: number | null
          phosphorus_level?: string | null
          potassium_level?: string | null
          recommendations?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          accepted_at: string | null
          created_at: string
          id: string
          invited_at: string
          land_owner_id: string
          member_email: string
          member_user_id: string | null
          permissions: Json | null
          role: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          invited_at?: string
          land_owner_id: string
          member_email: string
          member_user_id?: string | null
          permissions?: Json | null
          role?: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          invited_at?: string
          land_owner_id?: string
          member_email?: string
          member_user_id?: string | null
          permissions?: Json | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      vegetation_data: {
        Row: {
          created_at: string
          id: string
          month: string
          ndvi: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          month: string
          ndvi: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          month?: string
          ndvi?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      weather_forecasts: {
        Row: {
          conditions: string | null
          created_at: string
          forecast_date: string
          humidity_percent: number | null
          id: string
          precipitation_mm: number | null
          temperature_high: number | null
          temperature_low: number | null
          user_id: string
          wind_speed_kmh: number | null
        }
        Insert: {
          conditions?: string | null
          created_at?: string
          forecast_date: string
          humidity_percent?: number | null
          id?: string
          precipitation_mm?: number | null
          temperature_high?: number | null
          temperature_low?: number | null
          user_id: string
          wind_speed_kmh?: number | null
        }
        Update: {
          conditions?: string | null
          created_at?: string
          forecast_date?: string
          humidity_percent?: number | null
          id?: string
          precipitation_mm?: number | null
          temperature_high?: number | null
          temperature_low?: number | null
          user_id?: string
          wind_speed_kmh?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
