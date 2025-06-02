
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "react-day-picker";
import { SewerQualityData, SewerTreatmentPlant } from "./types";

export const useSewerData = (
  dateRange: DateRange,
  plantFilter: string,
  waterType: string
) => {
  const { data: sewerData, isLoading, refetch } = useQuery({
    queryKey: ["adminSewerData", dateRange, plantFilter, waterType],
    queryFn: async () => {
      let query = supabase
        .from("sewer_quality_data")
        .select(`
          *,
          sewer_treatment_plants (
            id,
            name,
            location,
            capacity
          )
        `);

      if (dateRange?.from && dateRange?.to) {
        query = query.gte('created_at', dateRange.from.toISOString())
                     .lte('created_at', dateRange.to.toISOString());
      }

      if (plantFilter !== "all") {
        query = query.eq('plant_id', plantFilter);
      }

      if (waterType !== "all") {
        query = query.eq('water_type', waterType);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      
      return (data || []) as SewerQualityData[];
    },
    staleTime: 0
  });

  const { data: plants } = useQuery({
    queryKey: ["sewerTreatmentPlants"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sewer_treatment_plants")
        .select("*");
      
      if (error) throw error;
      
      return (data || []) as SewerTreatmentPlant[];
    }
  });

  return {
    sewerData,
    plants,
    isLoading,
    refetch
  };
};
