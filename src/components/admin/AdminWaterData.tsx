
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DataTable } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addDays } from "date-fns";

const AdminWaterData = () => {
  const [dateRange, setDateRange] = useState({
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

      if (dateRange.from && dateRange.to) {
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
          onDateChange={setDateRange}
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
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Plant</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">pH Value</th>
              <th className="p-3 text-left">Turbidity</th>
              <th className="p-3 text-left">Chlorides</th>
            </tr>
          </thead>
          <tbody>
            {waterData?.map((record) => (
              <tr key={record.id} className="border-b">
                <td className="p-3">{new Date(record.created_at).toLocaleDateString()}</td>
                <td className="p-3">{record.water_treatment_plants?.name}</td>
                <td className="p-3">{record.water_type}</td>
                <td className="p-3">{record.ph_value}</td>
                <td className="p-3">{record.turbidity}</td>
                <td className="p-3">{record.chlorides}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminWaterData;
