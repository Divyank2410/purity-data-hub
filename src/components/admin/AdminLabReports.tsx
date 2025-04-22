
import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Card } from "@/components/ui/card";
import { Search, Download, FileText, RefreshCw } from "lucide-react";
import * as XLSX from "xlsx";
import { format, isWithinInterval } from "date-fns";
import { toast } from "sonner";

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
  // Additional fields
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

function downloadAsExcel(data: LabTest[]) {
  const worksheet = XLSX.utils.json_to_sheet(
    data.map(row => ({
      "Sample ID": row.sample_id,
      "Date": row.collection_date,
      "Type": row.test_type,
      "Sample Type": row.sample_type,
      "Collected By": row.collected_by,
      "Submitter": row.submitter_name || "N/A",
      "Status": row.document_url ? "Available" : "Missing",
    }))
  );
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Lab Reports");
  XLSX.writeFile(workbook, "lab-reports.xlsx");
  toast.success("Excel file downloaded successfully");
}

export default function AdminLabReports() {
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<{from: Date|undefined, to: Date|undefined}>({from: undefined, to: undefined});

  // Use enabled: true to ensure the query always runs and refetchInterval for real-time updates
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["lab_reports"],
    queryFn: async () => {
      console.log("Fetching lab reports...");
      const { data, error } = await supabase
        .from("lab_tests")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching lab reports:", error);
        throw error;
      }
      
      console.log(`Fetched ${data?.length || 0} lab reports`);
      return data as LabTest[];
    },
    refetchInterval: 10000, // Refresh every 10 seconds
    staleTime: 5000, // Consider data stale after 5 seconds
    enabled: true // Always run this query
  });

  const handleRefresh = () => {
    toast.info("Refreshing data...");
    refetch();
  };

  useEffect(() => {
    // Log when the component mounts or updates
    console.log("AdminLabReports component rendered");
    console.log("Current search:", search);
    console.log("Current date range:", dateRange);
    return () => {
      console.log("AdminLabReports component unmounted");
    };
  }, [search, dateRange]);

  const filtered = useMemo(() => {
    if (!data) return [];
    
    console.log("Filtering lab reports...");
    console.log("Total reports before filtering:", data.length);
    
    let filtered = data;
    
    // Apply search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(row => {
        const matchesSampleId = row.sample_id?.toLowerCase().includes(searchLower);
        const matchesDate = row.collection_date && format(new Date(row.collection_date), "yyyy-MM-dd").includes(searchLower);
        const matchesCollectedBy = row.collected_by?.toLowerCase().includes(searchLower);
        const matchesSubmitter = row.submitter_name?.toLowerCase().includes(searchLower);
        
        return matchesSampleId || matchesDate || matchesCollectedBy || matchesSubmitter;
      });
      console.log("Reports after search filter:", filtered.length);
    }
    
    // Apply date range filter
    if (dateRange.from || dateRange.to) {
      filtered = filtered.filter(row => {
        const testDate = new Date(row.collection_date);
        
        // Handle case where only from date is provided
        if (dateRange.from && !dateRange.to) {
          return testDate >= dateRange.from;
        }
        
        // Handle case where only to date is provided
        if (!dateRange.from && dateRange.to) {
          return testDate <= dateRange.to;
        }
        
        // Handle case where both dates are provided
        if (dateRange.from && dateRange.to) {
          return isWithinInterval(testDate, { 
            start: dateRange.from, 
            end: dateRange.to 
          });
        }
        
        return true;
      });
      console.log("Reports after date filter:", filtered.length);
    }
    
    console.log("Final filtered reports count:", filtered.length);
    return filtered;
  }, [data, search, dateRange]);

  if (isLoading) return (
    <div className="p-8 flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-400 mr-5"></div>
      <span className="text-lg text-vividPurple">Loading lab test reports...</span>
    </div>
  );
  
  if (error) return (
    <div className="text-red-500 p-8">
      <p>Failed to load: {(error as Error).message}</p>
      <Button 
        variant="outline" 
        className="mt-4"
        onClick={() => refetch()}
      >
        Try Again
      </Button>
    </div>
  );

  return (
    <div>
      <Card className="mb-6 shadow-sm border-[1.5px] border-[#6E59A5] bg-[#F1F0FB]">
        <div className="flex flex-col md:flex-row md:items-end gap-4 p-4">
          <div className="flex-1 flex flex-col md:flex-row gap-2">
            <div className="relative max-w-xs">
              <Input
                placeholder="Search by Sample ID or Date"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="max-w-xs border-[#7E69AB] pl-9"
              />
              <div className="absolute left-3 top-2.5 text-[#9b87f5] pointer-events-none">
                <Search className="h-4 w-4" />
              </div>
            </div>
            <DatePickerWithRange
              date={dateRange.from ? {from: dateRange.from, to: dateRange.to} : undefined}
              onDateChange={d => setDateRange({from: d?.from, to: d?.to})}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="bg-[#9b87f5] text-white hover:bg-[#6E59A5]"
              onClick={() => downloadAsExcel(filtered)}
            >
              <FileText className="mr-2 h-4 w-4" />
              Export as Excel
            </Button>
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

      <div className="overflow-x-auto bg-white rounded-xl shadow ring-1 ring-gray-200">
        <Table>
          <TableHeader className="bg-[#9b87f5]/10 text-[#6E59A5]">
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Sample ID</TableHead>
              <TableHead>Test Type</TableHead>
              <TableHead>Sample Type</TableHead>
              <TableHead>Collected By</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Download Report</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                  <div className="flex flex-col items-center">
                    <p className="mb-2">No reports found for selected filters.</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSearch('');
                        setDateRange({from: undefined, to: undefined});
                        refetch();
                      }}
                    >
                      Clear Filters & Refresh
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : filtered.map(row => (
              <TableRow key={row.id} className="hover:bg-[#F1F0FB] group">
                <TableCell>
                  {row.collection_date ? format(new Date(row.collection_date), "LLL dd, yyyy") : ""}
                </TableCell>
                <TableCell className="font-mono font-semibold text-[#7E69AB]">
                  {row.sample_id}
                </TableCell>
                <TableCell>
                  {row.test_type}
                </TableCell>
                <TableCell>
                  {row.sample_type}
                </TableCell>
                <TableCell>
                  {row.collected_by}
                </TableCell>
                <TableCell>
                  {row.document_url || row.sample_image_url
                    ? <span className="text-green-700 font-semibold">Available</span>
                    : <span className="text-gray-400">Missing</span>
                  }
                </TableCell>
                <TableCell>
                  {row.document_url ? (
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => {
                        console.log("Opening document URL:", row.document_url);
                        window.open(row.document_url as string, "_blank");
                      }}
                      className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                      title="Download Full Report"
                    >
                      <Download className="h-4 w-4" />
                      <span className="sr-only">Download Report</span>
                    </Button>
                  ) : row.sample_image_url ? (
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => {
                        console.log("Opening image URL:", row.sample_image_url);
                        window.open(row.sample_image_url as string, "_blank");
                      }}
                      className="text-green-500 hover:text-green-700 hover:bg-green-50"
                      title="View Sample Image"
                    >
                      <FileText className="h-4 w-4" />
                      <span className="sr-only">View Image</span>
                    </Button>
                  ) : (
                    <span className="text-xs text-gray-400">No file</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
