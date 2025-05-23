
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "react-day-picker";
import { SewerQualityData, SewerTreatmentPlant } from "./types";

// List of plant names to exclude
const excludedPlantNames = [
  "Motijheel WTP - Motijheel Area",
  "Maharajpura STP - Maharajpura",
  "Morar STP - Morar Region",
  "Hazira STP - Hazira Area",
  "Lashkar STP - Lashkar Region",
  "Jhansi Road STP - Jhansi Road"
];

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
      
      // Filter out excluded plants
      const filteredData = (data || []).filter(
        record => !excludedPlantNames.includes(record.sewer_treatment_plants?.name || '')
      );
      
      return filteredData as SewerQualityData[];
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
      
      // Filter out the excluded plants
      const filteredPlants = (data || []).filter(
        plant => !excludedPlantNames.includes(plant.name)
      ) as SewerTreatmentPlant[];
      
      return filteredPlants;
    }
  });

  return {
    sewerData,
    plants,
    isLoading,
    refetch
  };
};
