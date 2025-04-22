
import React from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { format } from "date-fns";
import { LabTest } from "../AdminLabReports";
import { downloadAsExcel } from "./lab-report-utils";

interface LabReportsTableProps {
  filtered: LabTest[];
  onClearFilters: () => void;
  isLoading?: boolean;
}

export default function LabReportsTable({ filtered, onClearFilters, isLoading }: LabReportsTableProps) {
  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-400 mr-5"></div>
        <span className="text-lg text-vividPurple">Loading lab test reports...</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow ring-1 ring-gray-200">
      <div className="flex w-full justify-end px-6 py-3">
        <Button
          variant="outline"
          className="bg-[#9b87f5] text-white hover:bg-[#6E59A5]"
          onClick={() => downloadAsExcel(filtered)}>
          <FileText className="mr-2 h-4 w-4" />
          Export as Excel
        </Button>
      </div>
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
              <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                <div className="flex flex-col items-center">
                  <p className="mb-2">No reports found for selected filters.</p>
                  <Button variant="outline" size="sm" onClick={onClearFilters}>
                    Clear Filters & Refresh
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            filtered.map(row => (
              <TableRow key={row.id} className="hover:bg-[#F1F0FB] group">
                <TableCell>{row.collection_date ? format(new Date(row.collection_date), "LLL dd, yyyy") : ""}</TableCell>
                <TableCell className="font-mono font-semibold text-[#7E69AB]">{row.sample_id}</TableCell>
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
                        window.open(row.document_url as string, "_blank");
                      }}
                      className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                      title="Download Full Report"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  ) : row.sample_image_url ? (
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => {
                        window.open(row.sample_image_url as string, "_blank");
                      }}
                      className="text-green-500 hover:text-green-700 hover:bg-green-50"
                      title="View Sample Image"
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                  ) : (
                    <span className="text-xs text-gray-400">No file</span>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
