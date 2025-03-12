
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DataTable } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { addDays } from "date-fns";

const AdminAmritData = () => {
  const [dateRange, setDateRange] = useState({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [wardFilter, setWardFilter] = useState("");

  const { data: amritData, isLoading } = useQuery({
    queryKey: ["adminAmritData", dateRange, wardFilter],
    queryFn: async () => {
      let query = supabase
        .from("amrit_yojna_data")
        .select("*");

      if (dateRange.from && dateRange.to) {
        query = query.gte('created_at', dateRange.from.toISOString())
                    .lte('created_at', dateRange.to.toISOString());
      }

      if (wardFilter) {
        query = query.eq('ward_no', wardFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DatePickerWithRange
          date={dateRange}
          onDateChange={setDateRange}
        />
        <Input
          placeholder="Filter by Ward No."
          value={wardFilter}
          onChange={(e) => setWardFilter(e.target.value)}
        />
      </div>

      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Customer Name</th>
              <th className="p-3 text-left">Ward No.</th>
              <th className="p-3 text-left">Connection No.</th>
              <th className="p-3 text-left">pH Value</th>
              <th className="p-3 text-left">TDS</th>
            </tr>
          </thead>
          <tbody>
            {amritData?.map((record) => (
              <tr key={record.id} className="border-b">
                <td className="p-3">{new Date(record.date).toLocaleDateString()}</td>
                <td className="p-3">{record.customer_name}</td>
                <td className="p-3">{record.ward_no}</td>
                <td className="p-3">{record.connection_number}</td>
                <td className="p-3">{record.ph_value}</td>
                <td className="p-3">{record.tds}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAmritData;
