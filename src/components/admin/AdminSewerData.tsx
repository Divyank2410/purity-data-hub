
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

// Create a query client key for sewer data that can be shared across components
export const SEWER_DATA_QUERY_KEY = "sewerData";

const AdminSewerData = () => {
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [plantFilter, setPlantFilter] = useState("all");
  const [waterType, setWaterType] = useState("all");

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
        // Cast to any to avoid type issues
        query = query.eq('plant_id', plantFilter as any);
      }

      if (waterType !== "all") {
        // Cast to any to avoid type issues
        query = query.eq('water_type', waterType as any);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  const { data: plants } = useQuery({
    queryKey: ["sewerTreatmentPlants"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sewer_treatment_plants")
        .select("*");
      
      if (error) throw error;
      return data || [];
    }
  });

  const handleDelete = async (id: string) => {
    try {
      console.log("Deleting sewer record with ID:", id);
      
      const { error } = await supabase
        .from("sewer_quality_data")
        .delete()
        .eq('id', id as any);
        
      if (error) {
        console.error("Supabase delete error:", error);
        toast.error("Failed to delete record: " + error.message);
        return;
      }
      
      console.log("Delete successful, refetching data");
      toast.success("Record deleted successfully");
      
      // Immediately update local data
      await refetch();
      
      // Update global query cache
      queryClient.invalidateQueries({ queryKey: [SEWER_DATA_QUERY_KEY] });
      
      // Dispatch event to update homepage
      const event = new CustomEvent('invalidateQueries', { 
        detail: { queryKey: SEWER_DATA_QUERY_KEY } 
      });
      window.dispatchEvent(event);
      
    } catch (error) {
      console.error("Error deleting record:", error);
      toast.error("Failed to delete record");
    }
  };

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
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sewerData?.length === 0 && (
              <TableRow>
                <TableCell colSpan={14} className="text-center py-4">No data found for the selected filters</TableCell>
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
                          Are you sure you want to delete this sewer quality record? This action cannot be undone.
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
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminSewerData;
