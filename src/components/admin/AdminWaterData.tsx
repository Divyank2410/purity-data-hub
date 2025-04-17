
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addDays } from "date-fns";
import { DateRange } from "react-day-picker";
import DocumentViewer from "./DocumentViewer";

export const WATER_DATA_QUERY_KEY = "waterData";

// List of plant names to exclude
const excludedPlantNames = [
  "Motijheel WTP - Motijheel Area",
  "Maharajpura STP - Maharajpura",
  "Morar STP - Morar Region",
  "Hazira STP - Hazira Area",
  "Lashkar STP - Lashkar Region",
  "Jhansi Road STP - Jhansi Road"
];

interface WaterTreatmentPlant {
  id: string;
  name: string;
  location: string;
  capacity: string;
}

interface WaterQualityData {
  id: string;
  plant_id: string;
  water_type: string;
  ph_value: string | null;
  turbidity: string | null;
  chlorides: string | null;
  alkalinity: string | null;
  hardness: string | null;
  iron: string | null;
  dissolved_oxygen: string | null;
  created_at: string;
  document_url: string | null;
  water_treatment_plants?: WaterTreatmentPlant;
}

const AdminWaterData = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [plantFilter, setPlantFilter] = useState("all");
  const [waterType, setWaterType] = useState("all");

  const { data: waterData, isLoading } = useQuery({
    queryKey: ["adminWaterData", dateRange, plantFilter, waterType],
    queryFn: async () => {
      let query = supabase
        .from("water_quality_data")
        .select(`
          *,
          water_treatment_plants (
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
        query = query.eq('plant_id', plantFilter as string);
      }

      if (waterType !== "all") {
        query = query.eq('water_type', waterType as string);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as WaterQualityData[];
    },
    staleTime: 0
  });

  const { data: plants } = useQuery({
    queryKey: ["waterTreatmentPlants"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("water_treatment_plants")
        .select("*");
      
      if (error) throw error;
      
      // Filter out the excluded plants
      const filteredPlants = (data || []).filter(
        plant => !excludedPlantNames.includes(plant.name)
      ) as WaterTreatmentPlant[];
      
      return filteredPlants;
    }
  });

  if (isLoading) return (
    <div className="flex justify-center items-center p-8">
      <p className="text-lg">Loading water treatment data...</p>
    </div>
  );

  // Filter out any data related to excluded plants that might have been fetched
  const filteredWaterData = waterData?.filter(
    record => !excludedPlantNames.includes(record.water_treatment_plants?.name || '')
  ) || [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DatePickerWithRange
          date={dateRange}
          onDateChange={(newDate: DateRange | undefined) => setDateRange(newDate || { from: undefined, to: undefined })}
        />
        <Select value={waterType} onValueChange={setWaterType}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by water type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="raw_water">Raw Water</SelectItem>
            <SelectItem value="clean_water">Clean Water</SelectItem>
          </SelectContent>
        </Select>
        <Select value={plantFilter} onValueChange={setPlantFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by plant" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plants</SelectItem>
            {plants?.map(plant => (
              <SelectItem key={plant.id} value={plant.id}>{plant.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Plant Name</TableHead>
              <TableHead>Plant Location</TableHead>
              <TableHead>Plant Capacity</TableHead>
              <TableHead>Water Type</TableHead>
              <TableHead>pH Value</TableHead>
              <TableHead>Turbidity</TableHead>
              <TableHead>Chlorides</TableHead>
              <TableHead>Alkalinity</TableHead>
              <TableHead>Hardness</TableHead>
              <TableHead>Iron</TableHead>
              <TableHead>Dissolved Oxygen</TableHead>
              <TableHead>Document</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWaterData?.length === 0 && (
              <TableRow>
                <TableCell colSpan={13} className="text-center py-4">No data found for the selected filters</TableCell>
              </TableRow>
            )}
            {filteredWaterData?.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{new Date(record.created_at).toLocaleDateString()}</TableCell>
                <TableCell>{record.water_treatment_plants?.name || 'N/A'}</TableCell>
                <TableCell>{record.water_treatment_plants?.location || 'N/A'}</TableCell>
                <TableCell>{record.water_treatment_plants?.capacity || 'N/A'}</TableCell>
                <TableCell>{record.water_type}</TableCell>
                <TableCell>{record.ph_value || 'N/A'}</TableCell>
                <TableCell>{record.turbidity || 'N/A'}</TableCell>
                <TableCell>{record.chlorides || 'N/A'}</TableCell>
                <TableCell>{record.alkalinity || 'N/A'}</TableCell>
                <TableCell>{record.hardness || 'N/A'}</TableCell>
                <TableCell>{record.iron || 'N/A'}</TableCell>
                <TableCell>{record.dissolved_oxygen || 'N/A'}</TableCell>
                <TableCell>
                  <DocumentViewer documentUrl={record.document_url} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminWaterData;
