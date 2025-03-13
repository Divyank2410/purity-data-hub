
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { addDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export const AMRIT_DATA_QUERY_KEY = "amritData";

const AdminAmritData = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [wardFilter, setWardFilter] = useState("");
  const [customerNameFilter, setCustomerNameFilter] = useState("");
  const [connectionFilter, setConnectionFilter] = useState("");

  const { data: amritData, isLoading, refetch } = useQuery({
    queryKey: ["adminAmritData", dateRange, wardFilter, customerNameFilter, connectionFilter],
    queryFn: async () => {
      let query = supabase
        .from("amrit_yojna_data")
        .select("*");

      if (dateRange?.from && dateRange?.to) {
        query = query.gte('created_at', dateRange.from.toISOString())
                    .lte('created_at', dateRange.to.toISOString());
      }

      if (wardFilter) {
        query = query.ilike('ward_no', `%${wardFilter}%`);
      }

      if (customerNameFilter) {
        query = query.ilike('customer_name', `%${customerNameFilter}%`);
      }

      if (connectionFilter) {
        query = query.ilike('connection_number', `%${connectionFilter}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const handleDelete = async (id: string) => {
    try {
      console.log("Deleting Amrit Yojna record with ID:", id);
      
      const { error } = await supabase
        .from("amrit_yojna_data")
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error("Supabase delete error:", error);
        throw error;
      }
      
      console.log("Delete successful, refetching data");
      toast.success("Record deleted successfully");
      
      // Refetch data immediately to update the admin dashboard
      await refetch();
      
      // Dispatch event to update homepage
      const event = new CustomEvent('invalidateQueries', { 
        detail: { queryKey: AMRIT_DATA_QUERY_KEY } 
      });
      window.dispatchEvent(event);
      
    } catch (error) {
      console.error("Error deleting record:", error);
      toast.error("Failed to delete record");
    }
  };

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <p className="text-lg text-gray-500">Loading Amrit Yojna data...</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Amrit Yojna Data Filters</CardTitle>
          <CardDescription>Filter data by various parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DatePickerWithRange
              date={dateRange}
              onDateChange={(newDate: DateRange | undefined) => setDateRange(newDate || { from: undefined, to: undefined })}
            />
            <Input
              placeholder="Filter by Ward No."
              value={wardFilter}
              onChange={(e) => setWardFilter(e.target.value)}
            />
            <Input
              placeholder="Filter by Customer Name"
              value={customerNameFilter}
              onChange={(e) => setCustomerNameFilter(e.target.value)}
            />
            <Input
              placeholder="Filter by Connection No."
              value={connectionFilter}
              onChange={(e) => setConnectionFilter(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Amrit Yojna Records</CardTitle>
          <CardDescription>
            Total Records: {amritData?.length || 0}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Mobile No.</TableHead>
                  <TableHead>Ward No.</TableHead>
                  <TableHead>Connection No.</TableHead>
                  <TableHead>pH Value</TableHead>
                  <TableHead>TDS</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Smell</TableHead>
                  <TableHead>Conductivity</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {amritData?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center h-24">
                      No records found
                    </TableCell>
                  </TableRow>
                ) : (
                  amritData?.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                      <TableCell>{record.customer_name}</TableCell>
                      <TableCell>{record.mobile_no}</TableCell>
                      <TableCell>{record.ward_no}</TableCell>
                      <TableCell>{record.connection_number}</TableCell>
                      <TableCell>{record.ph_value || "-"}</TableCell>
                      <TableCell>{record.tds || "-"}</TableCell>
                      <TableCell>{record.color || "-"}</TableCell>
                      <TableCell>{record.smell || "-"}</TableCell>
                      <TableCell>{record.conductivity_cl || "-"}</TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-red-500 hover:text-red-700 hover:bg-red-100"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this record? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                className="bg-red-600 hover:bg-red-700 text-white"
                                onClick={() => handleDelete(record.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAmritData;
