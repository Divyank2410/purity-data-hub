
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Download, Eye, FileText } from "lucide-react";
import DocumentViewer from "@/components/admin/DocumentViewer";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";

interface LabTest {
  id: string;
  sample_id: string;
  submitter_name: string;
  submitter_email: string;
  submitter_mobile: string;
  submitter_address: string;
  created_at: string;
  sample_image_url: string;
  calcium?: string;
  chloride?: string;
  e_coli?: string;
  fluoride?: string;
  free_residual_chlorine?: string;
  iron?: string;
  magnesium?: string;
  ph?: string;
  sulphate?: string;
  tds?: string;
  total_alkalinity?: string;
  total_coliform?: string;
  total_hardness?: string;
  turbidity?: string;
  notes?: string;
}

interface LabTestsTableProps {
  labTests: LabTest[];
  isLoading: boolean;
  isError: boolean;
  sorting: {
    column: string;
    direction: string;
  };
  setSorting: (sorting: any) => void;
}

const LabTestsTable = ({
  labTests,
  isLoading,
  isError,
  sorting,
  setSorting,
}: LabTestsTableProps) => {
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);

  const handleSort = (column: string) => {
    if (sorting.column === column) {
      setSorting({
        column,
        direction: sorting.direction === "asc" ? "desc" : "asc",
      });
    } else {
      setSorting({
        column,
        direction: "desc",
      });
    }
  };

  const getSortIcon = (column: string) => {
    if (sorting.column !== column) return null;
    return sorting.direction === "asc" ? "↑" : "↓";
  };

  const exportToCSV = (test: LabTest) => {
    // Create CSV content
    const fields = [
      ["Sample ID", test.sample_id],
      ["Submitter Name", test.submitter_name],
      ["Submitter Email", test.submitter_email],
      ["Submitter Mobile", test.submitter_mobile],
      ["Submitter Address", test.submitter_address],
      ["Date Submitted", format(new Date(test.created_at), "PPP")],
      ["Calcium", test.calcium || "Not provided"],
      ["Chloride", test.chloride || "Not provided"],
      ["E.coli", test.e_coli || "Not provided"],
      ["Fluoride", test.fluoride || "Not provided"],
      ["Free Residual Chlorine", test.free_residual_chlorine || "Not provided"],
      ["Iron", test.iron || "Not provided"],
      ["Magnesium", test.magnesium || "Not provided"],
      ["pH", test.ph || "Not provided"],
      ["Sulphate", test.sulphate || "Not provided"],
      ["TDS", test.tds || "Not provided"],
      ["Total Alkalinity", test.total_alkalinity || "Not provided"],
      ["Total Coliform", test.total_coliform || "Not provided"],
      ["Total Hardness", test.total_hardness || "Not provided"],
      ["Turbidity", test.turbidity || "Not provided"],
      ["Notes", test.notes || "Not provided"],
    ];

    const csvContent = fields.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `lab-test-${test.sample_id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-10 text-red-500">
        <p>Error loading lab test data. Please try again later.</p>
      </div>
    );
  }

  if (labTests.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p>No lab tests found matching your criteria.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("sample_id")}
              >
                Sample ID {getSortIcon("sample_id")}
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("submitter_name")}
              >
                Submitter {getSortIcon("submitter_name")}
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("created_at")}
              >
                Date Submitted {getSortIcon("created_at")}
              </TableHead>
              <TableHead>Sample Image</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {labTests.map((test) => (
              <TableRow key={test.id}>
                <TableCell className="font-medium">{test.sample_id}</TableCell>
                <TableCell>
                  <div>{test.submitter_name}</div>
                  <div className="text-xs text-gray-500">
                    {test.submitter_email}
                  </div>
                </TableCell>
                <TableCell>
                  {format(new Date(test.created_at), "PPP")}
                </TableCell>
                <TableCell>
                  <DocumentViewer documentUrl={test.sample_image_url} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => setSelectedTest(test)}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="hidden sm:inline">View</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Lab Test Details</DialogTitle>
                        </DialogHeader>
                        {selectedTest && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                            <div className="space-y-2 col-span-2">
                              <h3 className="font-medium text-lg border-b pb-1">
                                Submitter Information
                              </h3>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <p className="text-sm text-gray-500">Name</p>
                                  <p>{selectedTest.submitter_name}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Email</p>
                                  <p>{selectedTest.submitter_email}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Mobile</p>
                                  <p>{selectedTest.submitter_mobile}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Address</p>
                                  <p>{selectedTest.submitter_address}</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-2 col-span-2">
                              <h3 className="font-medium text-lg border-b pb-1">
                                Sample Information
                              </h3>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <p className="text-sm text-gray-500">Sample ID</p>
                                  <p>{selectedTest.sample_id}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Date Submitted</p>
                                  <p>{format(new Date(selectedTest.created_at), "PPP")}</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-2 col-span-2">
                              <h3 className="font-medium text-lg border-b pb-1">
                                Test Parameters
                              </h3>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {[
                                  { label: "Calcium", value: selectedTest.calcium },
                                  { label: "Chloride", value: selectedTest.chloride },
                                  { label: "E. coli", value: selectedTest.e_coli },
                                  { label: "Fluoride", value: selectedTest.fluoride },
                                  { label: "Free Residual Chlorine", value: selectedTest.free_residual_chlorine },
                                  { label: "Iron", value: selectedTest.iron },
                                  { label: "Magnesium", value: selectedTest.magnesium },
                                  { label: "pH", value: selectedTest.ph },
                                  { label: "Sulphate", value: selectedTest.sulphate },
                                  { label: "TDS", value: selectedTest.tds },
                                  { label: "Total Alkalinity", value: selectedTest.total_alkalinity },
                                  { label: "Total Coliform", value: selectedTest.total_coliform },
                                  { label: "Total Hardness", value: selectedTest.total_hardness },
                                  { label: "Turbidity", value: selectedTest.turbidity },
                                ].map((param) => (
                                  <div key={param.label}>
                                    <p className="text-sm text-gray-500">{param.label}</p>
                                    <p>{param.value || "Not provided"}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            {selectedTest.notes && (
                              <div className="space-y-2 col-span-2">
                                <h3 className="font-medium text-lg border-b pb-1">
                                  Notes
                                </h3>
                                <p className="whitespace-pre-wrap">{selectedTest.notes}</p>
                              </div>
                            )}
                            
                            <div className="col-span-2 flex justify-end mt-4">
                              <Button 
                                onClick={() => exportToCSV(selectedTest)}
                                className="flex items-center gap-1"
                              >
                                <Download className="h-4 w-4" />
                                Export to CSV
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => test && exportToCSV(test)}
                    >
                      <Download className="h-4 w-4" />
                      <span className="hidden sm:inline">Export</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default LabTestsTable;
