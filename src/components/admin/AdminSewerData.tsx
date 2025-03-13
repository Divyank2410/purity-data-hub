
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addDays } from "date-fns";
import { DateRange } from "react-day-picker";

const AdminSewerData = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [plantFilter, setPlantFilter] = useState("all");
  const [waterType, setWaterType] = useState("all");

  const { data: sewerData, isLoading } = useQuery({
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

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const { data: plants } = useQuery({
    queryKey: ["sewerTreatmentPlants"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sewer_treatment_plants")
        .select("*");
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) return (
    <div className="flex justify-center items-center p-8">
      <p className="text-lg">Loading sewer treatment data...</p>
    </div>
  );

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
            <SelectItem value="inlet_water">Inlet Water</SelectItem>
            <SelectItem value="outlet_water">Outlet Water</SelectItem>
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
              <TableHead>BOD</TableHead>
              <TableHead>COD</TableHead>
              <TableHead>pH Value</TableHead>
              <TableHead>TSS</TableHead>
              <TableHead>Ammonical Nitrogen</TableHead>
              <TableHead>Total Nitrogen</TableHead>
              <TableHead>Total Phosphorus</TableHead>
              <TableHead>Fecal Coliform</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sewerData?.length === 0 && (
              <TableRow>
                <TableCell colSpan={13} className="text-center py-4">No data found for the selected filters</TableCell>
              </TableRow>
            )}
            {sewerData?.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{new Date(record.created_at).toLocaleDateString()}</TableCell>
                <TableCell>{record.sewer_treatment_plants?.name || 'N/A'}</TableCell>
                <TableCell>{record.sewer_treatment_plants?.location || 'N/A'}</TableCell>
                <TableCell>{record.sewer_treatment_plants?.capacity || 'N/A'}</TableCell>
                <TableCell>{record.water_type}</TableCell>
                <TableCell>{record.bod || 'N/A'}</TableCell>
                <TableCell>{record.cod || 'N/A'}</TableCell>
                <TableCell>{record.ph_value || 'N/A'}</TableCell>
                <TableCell>{record.tss || 'N/A'}</TableCell>
                <TableCell>{record.ammonical_nitrogen || 'N/A'}</TableCell>
                <TableCell>{record.total_nitrogen || 'N/A'}</TableCell>
                <TableCell>{record.total_phosphorus || 'N/A'}</TableCell>
                <TableCell>{record.fecal_coliform || 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminSewerData;
