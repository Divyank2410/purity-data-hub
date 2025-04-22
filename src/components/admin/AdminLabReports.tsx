
import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { format, isWithinInterval } from "date-fns";
import { toast } from "sonner";
import LabReportFilter from "./lab-reports/LabReportFilter";
import LabReportsTable from "./lab-reports/LabReportsTable";

export interface LabTest {
  id: string;
  sample_id: string;
  sample_type: string;
  test_type: string;
  collected_by: string;
  collection_date: string;
  received_date: string;
  submitter_name: string | null;
  submitter_address: string | null;
  submitter_email: string | null;
  user_id: string;
  ph_value: string | null;
  turbidity: string | null;
  document_url: string | null;
  sample_image_url: string | null;
  temperature: string | null;
  conductivity: string | null;
  total_coliform: string | null;
  e_coli_count: string | null;
  tds: string | null;
  calcium: string | null;
  chloride: string | null;
  fluoride: string | null;
  iron: string | null;
  magnesium: string | null;
  total_alkalinity: string | null;
  total_hardness: string | null;
}

export default function AdminLabReports() {
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined, to: Date | undefined }>({ from: undefined, to: undefined });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["lab_reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lab_tests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as LabTest[];
    },
    refetchInterval: 10000,
    staleTime: 5000,
    enabled: true
  });

  const handleRefresh = () => {
    toast.info("Refreshing data...");
    refetch();
  };

  useEffect(() => {
    // For debugging: log filter changes
    console.log("AdminLabReports filter state", { search, dateRange });
    return () => { };
  }, [search, dateRange]);

  const filtered = useMemo(() => {
    if (!data) return [];
    let filtered = data;
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(row => {
        const matchesSampleId = row.sample_id?.toLowerCase().includes(searchLower);
        const matchesDate = row.collection_date && format(new Date(row.collection_date), "yyyy-MM-dd").includes(searchLower);
        return matchesSampleId || matchesDate;
      });
    }
    if (dateRange.from || dateRange.to) {
      filtered = filtered.filter(row => {
        const testDate = new Date(row.collection_date);
        if (dateRange.from && !dateRange.to) return testDate >= dateRange.from;
        if (!dateRange.from && dateRange.to) return testDate <= dateRange.to;
        if (dateRange.from && dateRange.to) return isWithinInterval(testDate, { start: dateRange.from, end: dateRange.to });
        return true;
      });
    }
    return filtered;
  }, [data, search, dateRange]);

  if (error) return (
    <div className="text-red-500 p-8">
      <p>Failed to load: {(error as Error).message}</p>
      <Button variant="outline" className="mt-4" onClick={() => refetch()}>
        Try Again
      </Button>
    </div>
  );

  return (
    <div>
      <Card className="mb-6 shadow-sm border-[1.5px] border-[#6E59A5] bg-[#F1F0FB]">
        <div className="flex flex-col md:flex-row md:items-end gap-4 p-4">
          <LabReportFilter
            search={search}
            setSearch={setSearch}
            dateRange={dateRange}
            setDateRange={setDateRange}
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="bg-white text-[#6E59A5] hover:bg-gray-100 border-[#6E59A5]"
              onClick={handleRefresh}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </Card>
      <LabReportsTable
        filtered={filtered}
        onClearFilters={() => {
          setSearch('');
          setDateRange({ from: undefined, to: undefined });
          refetch();
        }}
        isLoading={isLoading}
      />
    </div>
  );
}
