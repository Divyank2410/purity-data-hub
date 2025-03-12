
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { addDays } from "date-fns";
import { DateRange } from "react-day-picker";

const AdminAmritData = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
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

      if (dateRange?.from && dateRange?.to) {
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
          onDateChange={(newDate: DateRange | undefined) => setDateRange(newDate || { from: undefined, to: undefined })}
        />
        <Input
          placeholder="Filter by Ward No."
          value={wardFilter}
          onChange={(e) => setWardFilter(e.target.value)}
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Customer Name</TableHead>
              <TableHead>Ward No.</TableHead>
              <TableHead>Connection No.</TableHead>
              <TableHead>pH Value</TableHead>
              <TableHead>TDS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {amritData?.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                <TableCell>{record.customer_name}</TableCell>
                <TableCell>{record.ward_no}</TableCell>
                <TableCell>{record.connection_number}</TableCell>
                <TableCell>{record.ph_value}</TableCell>
                <TableCell>{record.tds}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminAmritData;
