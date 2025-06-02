
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import LabTestsTable from "./lab-tests/LabTestsTable";
import LabTestsFilters from "./lab-tests/LabTestsFilters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { FileText, CheckCircle, Clock } from "lucide-react";

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

  // Statistics state
  const [stats, setStats] = useState({
    totalSamples: 0,
    testedSamples: 0,
    pendingSamples: 0,
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
      
      const safeData = data || [];
      
      // Update statistics only if we have valid data
      updateStatistics(safeData);
      
      return safeData;
    } catch (error) {
      console.error("Exception in fetchLabTests:", error);
      toast.error("An error occurred while loading lab test data");
      // Reset stats on error
      setStats({
        totalSamples: 0,
        testedSamples: 0,
        pendingSamples: 0,
      });
      return [];
    }
  };

  // Calculate statistics from lab tests data with proper type checking
  const updateStatistics = (data: any[]) => {
    // Ensure data is an array
    if (!Array.isArray(data)) {
      console.warn("updateStatistics received non-array data:", data);
      setStats({
        totalSamples: 0,
        testedSamples: 0,
        pendingSamples: 0,
      });
      return;
    }

    const total = data.length;
    
    // A sample is considered "tested" if it has data in at least one of the test fields
    // These are the main test fields we'll check
    const testFields = ['ph', 'tds', 'turbidity', 'total_hardness', 'iron', 'fluoride'];
    
    const tested = data.filter(sample => {
      // Ensure sample is an object before checking fields
      if (!sample || typeof sample !== 'object') return false;
      
      return testFields.some(field => {
        const value = sample[field];
        return value !== null && value !== undefined && value !== '';
      });
    }).length;
    
    setStats({
      totalSamples: total,
      testedSamples: tested,
      pendingSamples: total - tested
    });
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
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex flex-row items-center justify-between pt-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Samples</p>
              <h3 className="text-3xl font-bold">{stats.totalSamples}</h3>
            </div>
            <FileText className="h-8 w-8 text-blue-500" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex flex-row items-center justify-between pt-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tested Samples</p>
              <h3 className="text-3xl font-bold">{stats.testedSamples}</h3>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex flex-row items-center justify-between pt-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending Analysis</p>
              <h3 className="text-3xl font-bold">{stats.pendingSamples}</h3>
            </div>
            <Clock className="h-8 w-8 text-amber-500" />
          </CardContent>
        </Card>
      </div>

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
