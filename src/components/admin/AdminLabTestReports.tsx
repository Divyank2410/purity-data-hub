
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Download, Trash2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// Query key for lab test data
export const LAB_TESTS_QUERY_KEY = "lab-tests";

interface LabTest {
  id: string;
  collection_date: string;
  received_date: string;
  sample_id: string;
  test_type: string;
  collected_by: string;
  submitter_name?: string;
  ph_value?: string;
  turbidity?: string;
  dissolved_oxygen?: string;
  conductivity?: string;
  created_at: string;
}

const AdminLabTestReports = () => {
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Fetch lab test data
  const { data: labTests = [], isLoading } = useQuery({
    queryKey: [LAB_TESTS_QUERY_KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lab_tests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to fetch lab test reports");
        throw error;
      }

      return data as LabTest[];
    },
  });

  // Delete a lab test report
  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(id);
      const { error } = await supabase
        .from("lab_tests")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Update the cache to remove the deleted item
      queryClient.setQueryData(
        [LAB_TESTS_QUERY_KEY],
        (old: LabTest[] | undefined) => old?.filter((test) => test.id !== id) || []
      );

      toast.success("Lab test report deleted successfully");
    } catch (error) {
      console.error("Error deleting lab test:", error);
      toast.error("Failed to delete lab test report");
    } finally {
      setIsDeleting(null);
    }
  };

  // Download lab test data as CSV
  const handleDownload = (test: LabTest) => {
    try {
      // Convert test data to CSV format
      const headers = [
        "Sample ID",
        "Test Type",
        "Collection Date",
        "Received Date",
        "Collected By",
        "Submitter",
        "pH Value",
        "Turbidity",
        "Dissolved Oxygen",
        "Conductivity"
      ];

      const data = [
        test.sample_id,
        test.test_type,
        test.collection_date,
        test.received_date,
        test.collected_by,
        test.submitter_name || "N/A",
        test.ph_value || "N/A",
        test.turbidity || "N/A",
        test.dissolved_oxygen || "N/A",
        test.conductivity || "N/A"
      ];

      const csvContent = [
        headers.join(","),
        data.join(",")
      ].join("\n");

      // Create and trigger download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `lab-test-${test.sample_id}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Lab test report downloaded successfully");
    } catch (error) {
      console.error("Error downloading lab test:", error);
      toast.error("Failed to download lab test report");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Lab Test Reports</h3>
          <p className="text-sm text-muted-foreground">
            View and manage submitted lab test reports
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sample ID</TableHead>
                <TableHead>Test Type</TableHead>
                <TableHead>Collection Date</TableHead>
                <TableHead>Received Date</TableHead>
                <TableHead>Collected By</TableHead>
                <TableHead>Submitter</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {labTests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No lab test reports found
                  </TableCell>
                </TableRow>
              ) : (
                labTests.map((test) => (
                  <TableRow key={test.id}>
                    <TableCell>{test.sample_id}</TableCell>
                    <TableCell>{test.test_type}</TableCell>
                    <TableCell>{new Date(test.collection_date).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(test.received_date).toLocaleDateString()}</TableCell>
                    <TableCell>{test.collected_by}</TableCell>
                    <TableCell>{test.submitter_name || "N/A"}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(test)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(test.id)}
                        disabled={isDeleting === test.id}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminLabTestReports;
