
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import LabTestsTable from "./lab-tests/LabTestsTable";
import LabTestsFilters from "./lab-tests/LabTestsFilters";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

const AdminLabTests = () => {
  const [filters, setFilters] = useState({
    sampleId: "",
    submitterName: "",
    dateRange: {
      from: undefined,
      to: undefined,
    },
  });

  const [sorting, setSorting] = useState({
    column: "created_at",
    direction: "desc",
  });

  // Fetch lab tests with filters and sorting
  const fetchLabTests = async () => {
    try {
      console.log("Fetching lab tests with filters:", filters);
      console.log("Sorting by:", sorting);

      let query = supabase
        .from("lab_tests")
        .select("*")
        .order(sorting.column, { ascending: sorting.direction === "asc" });

      // Apply filters
      if (filters.sampleId) {
        query = query.ilike("sample_id", `%${filters.sampleId}%`);
      }
      if (filters.submitterName) {
        query = query.ilike("submitter_name", `%${filters.submitterName}%`);
      }
      if (filters.dateRange.from && filters.dateRange.to) {
        query = query.gte("created_at", filters.dateRange.from.toISOString());
        query = query.lte("created_at", filters.dateRange.to.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching lab tests:", error);
        toast.error("Failed to load lab test data");
        throw error;
      }

      console.log("Fetched lab tests:", data?.length || 0, "records");
      return data || [];
    } catch (error) {
      console.error("Exception in fetchLabTests:", error);
      toast.error("An error occurred while loading lab test data");
      return [];
    }
  };

  const {
    data: labTests,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["labTests", filters, sorting],
    queryFn: fetchLabTests,
  });

  // Setup real-time listener for lab tests table
  useEffect(() => {
    console.log("Setting up real-time listener for lab_tests table");
    
    const channel = supabase
      .channel("lab-tests-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "lab_tests",
        },
        (payload) => {
          console.log("Real-time update received:", payload);
          toast.info("Lab test data updated");
          refetch();
        }
      )
      .subscribe((status) => {
        console.log("Supabase channel status:", status);
        if (status === "SUBSCRIBED") {
          console.log("Successfully subscribed to real-time updates");
        }
      });

    // Force initial data load
    refetch();

    return () => {
      console.log("Cleaning up Supabase channel");
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <LabTestsFilters 
            filters={filters} 
            setFilters={setFilters} 
            sorting={sorting}
            setSorting={setSorting}
          />
        </CardContent>
      </Card>

      <LabTestsTable
        labTests={labTests || []}
        isLoading={isLoading}
        isError={isError}
        sorting={sorting}
        setSorting={setSorting}
      />
    </div>
  );
};

export default AdminLabTests;
