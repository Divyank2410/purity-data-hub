import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Card } from "@/components/ui/card";
import { Search, Download, FileText, Filter, Calendar } from "lucide-react";
import * as XLSX from "xlsx";
import DocumentViewer from "@/components/admin/DocumentViewer";
import { format } from "date-fns";
import { toast } from "sonner";
import colors from "@/styles/adminPalette.module.css"; // Hypothetical for palette

export interface LabTest {
  id: string;
  sample_id: string;
  sample_type: string;
  test_type: string;
  collected_by: string;
  collection_date: string;
  received_date: string;
  submitter_name: string;
  submitter_address: string;
  submitter_email: string;
  user_id: string;
  ph_value: string | null;
  turbidity: string | null;
  document_url: string | null;
  // ...add more as desired
}

function downloadAsExcel(data: LabTest[]) {
  const worksheet = XLSX.utils.json_to_sheet(data.map(row => ({
    "Sample ID": row.sample_id,
    "Sample Type": row.sample_type,
    "Test Type": row.test_type,
    "Collected By": row.collected_by,
    "Collection Date": row.collection_date,
    "Submitter Name": row.submitter_name,
    "Submitter Email": row.submitter_email,
    "pH Value": row.ph_value,
    "Turbidity": row.turbidity,
    // Add any more fields you want exported
  })));
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
      let query = supabase.from("lab_tests").select("*").order("created_at", { ascending: false });
      // Filtering will be done client-side for now
      const { data, error } = await query;
      if (error) throw error;
      return data as LabTest[];
    },
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    let filtered = data;
    if (search.trim()) {
      filtered = filtered.filter(row =>
        row.sample_id?.toLowerCase().includes(search.toLowerCase()) ||
        row.submitter_name?.toLowerCase().includes(search.toLowerCase()) ||
        row.submitter_email?.toLowerCase().includes(search.toLowerCase()) ||
        row.collected_by?.toLowerCase().includes(search.toLowerCase())
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
  if (error) return <div className="text-red-500 p-8">Failed to load: {error.message}</div>;
  
  return (
    <div>
      <Card className="mb-6 shadow-sm border-[1.5px] border-[#6E59A5] bg-[#F1F0FB]">
        <div className="flex flex-col md:flex-row md:items-end gap-4 p-4">
          <div className="flex-1 flex gap-2">
            <Input
              placeholder="Search by Sample ID, Name, or Email"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="max-w-xs border-[#7E69AB] pl-9 relative"
            />
            <div className="absolute translate-x-3 translate-y-2.5 text-[#9b87f5] pointer-events-none">
              <Search className="h-4 w-4" />
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
              <TableHead>Sample ID</TableHead>
              <TableHead>Collection Date</TableHead>
              <TableHead>Submitter</TableHead>
              <TableHead>Test Type</TableHead>
              <TableHead>pH</TableHead>
              <TableHead>Turbidity</TableHead>
              <TableHead>Document</TableHead>
              <TableHead>Download</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-500">
                  No reports found for selected filters.
                </TableCell>
              </TableRow>
            ) : filtered.map(row => (
              <TableRow key={row.id} className="hover:bg-[#F1F0FB] group">
                <TableCell className="font-mono font-semibold text-[#7E69AB]">{row.sample_id}</TableCell>
                <TableCell>{row.collection_date ? format(new Date(row.collection_date), "LLL dd, yyyy") : ""}</TableCell>
                <TableCell>
                  <div className="font-semibold">{row.submitter_name || row.collected_by}</div>
                  <div className="text-xs text-gray-400">{row.submitter_email}</div>
                </TableCell>
                <TableCell>{row.test_type}</TableCell>
                <TableCell>{row.ph_value}</TableCell>
                <TableCell>{row.turbidity}</TableCell>
                <TableCell>
                  <DocumentViewer documentUrl={row.document_url} buttonVariant="ghost" />
                </TableCell>
                <TableCell>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => {
                      if (!row.document_url) {
                        toast.error("No document attached.");
                        return;
                      }
                      window.open(row.document_url, "_blank");
                    }}
                  >
                    <Download />
                    <span className="sr-only">Download</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
