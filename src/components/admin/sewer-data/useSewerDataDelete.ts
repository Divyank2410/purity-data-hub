
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SEWER_DATA_QUERY_KEY } from "../AdminSewerData";

export const useSewerDataDelete = (refetch: () => Promise<any>) => {
  const queryClient = useQueryClient();

  const handleDelete = async (id: string) => {
    try {
      console.log("Deleting sewer record with ID:", id);
      
      const { error } = await supabase
        .from("sewer_quality_data")
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error("Supabase delete error:", error);
        toast.error("Failed to delete record: " + error.message);
        return;
      }
      
      console.log("Delete successful, updating UI");
      toast.success("Record deleted successfully");
      
      await refetch();
      
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["adminSewerData"] }),
        queryClient.invalidateQueries({ queryKey: [SEWER_DATA_QUERY_KEY] }),
        queryClient.invalidateQueries()
      ]);
      
      const event = new CustomEvent('dataUpdated', { 
        detail: { queryKey: SEWER_DATA_QUERY_KEY } 
      });
      window.dispatchEvent(event);
      
    } catch (error) {
      console.error("Error deleting record:", error);
      toast.error("Failed to delete record");
    }
  };

  return { handleDelete };
};
