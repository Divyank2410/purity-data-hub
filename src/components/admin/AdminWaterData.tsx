
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addDays } from "date-fns";
import { DateRange } from "react-day-picker";

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
            name,
            location
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

  if (isLoading) return <div>Loading...</div>;

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
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Plant</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>pH Value</TableHead>
              <TableHead>Turbidity</TableHead>
              <TableHead>Chlorides</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {waterData?.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{new Date(record.created_at).toLocaleDateString()}</TableCell>
                <TableCell>{record.water_treatment_plants?.name}</TableCell>
                <TableCell>{record.water_type}</TableCell>
                <TableCell>{record.ph_value}</TableCell>
                <TableCell>{record.turbidity}</TableCell>
                <TableCell>{record.chlorides}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminWaterData;
