
import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Card } from "@/components/ui/card";
import { Search, Download, FileText } from "lucide-react";
import * as XLSX from "xlsx";
import { format } from "date-fns";
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
      Status: row.document_url ? "Available" : "Missing",
    }))
  );
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Lab Reports");
  XLSX.writeFile(workbook, "lab-reports.xlsx");
}

export default function AdminLabReports() {
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<{from: Date|undefined, to: Date|undefined}>({from: undefined, to: undefined});

  const { data, isLoading, error } = useQuery({
    queryKey: ["lab_reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lab_tests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as LabTest[];
    },
    refetchInterval: 9000, // Keep in sync every ~9 seconds for pseudo-realtime
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    let filtered = data;
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(row =>
        row.sample_id?.toLowerCase().includes(searchLower)
        || (row.collection_date && format(new Date(row.collection_date), "yyyy-MM-dd").includes(searchLower))
      );
    }
    if (dateRange.from || dateRange.to) {
      filtered = filtered.filter(row => {
        const testDate = new Date(row.collection_date);
        if (dateRange.from && testDate < dateRange.from) return false;
        if (dateRange.to && testDate > dateRange.to) return false;
        return true;
      });
    }
    return filtered;
  }, [data, search, dateRange]);

  if (isLoading) return (
    <div className="p-8 flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-400 mr-5"></div>
      <span className="text-lg text-vividPurple">Loading lab test reports...</span>
    </div>
  );
  if (error) return <div className="text-red-500 p-8">Failed to load: {(error as Error).message}</div>;

  return (
    <div>
      <Card className="mb-6 shadow-sm border-[1.5px] border-[#6E59A5] bg-[#F1F0FB]">
        <div className="flex flex-col md:flex-row md:items-end gap-4 p-4">
          <div className="flex-1 flex gap-2">
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
          <Button
            variant="outline"
            className="bg-[#9b87f5] text-white hover:bg-[#6E59A5]"
            onClick={() => downloadAsExcel(filtered)}
          >
            <FileText className="mr-2" />
            Export as Excel
          </Button>
        </div>
      </Card>

      <div className="overflow-x-auto bg-white rounded-xl shadow ring-1 ring-gray-200">
        <Table>
          <TableHeader className="bg-[#9b87f5]/10 text-[#6E59A5]">
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Sample ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Download Report</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-500">
                  No reports found for selected filters.
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
                  {row.document_url
                    ? <span className="text-green-700 font-semibold">Available</span>
                    : <span className="text-gray-400">Missing</span>
                  }
                </TableCell>
                <TableCell>
                  {row.document_url ? (
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => window.open(row.document_url as string, "_blank")}
                      className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                      title="Download Full Report"
                    >
                      <Download className="h-4 w-4" />
                      <span className="sr-only">Download Report</span>
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
