import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Clock, FlaskConical, FileText, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import DocumentViewer from "./DocumentViewer";
import AdminTestEntry from "./lab-tests/AdminTestEntry";

interface LabTest {
  id: string;
  sample_id: string;
  submitter_name: string;
  submitter_email: string;
  submitter_mobile: string;
  submitter_address: string;
  created_at: string;
  updated_at: string;
  sample_image_url: string;
  sample_type?: string;
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

const AdminPendingLabTests = () => {
  const [pendingSamples, setPendingSamples] = useState<LabTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSamples, setFilteredSamples] = useState<LabTest[]>([]);

  useEffect(() => {
    fetchPendingSamples();
  }, []);

  useEffect(() => {
    // Filter samples based on search term
    if (searchTerm) {
      const filtered = pendingSamples.filter(sample => 
        sample.sample_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sample.submitter_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSamples(filtered);
    } else {
      setFilteredSamples(pendingSamples);
    }
  }, [pendingSamples, searchTerm]);

  const fetchPendingSamples = async () => {
    try {
      console.log("Fetching lab tests data...");
      const { data, error } = await supabase
        .from("lab_tests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      console.log("Raw lab tests data:", data);

      // Filter for pending samples (no test parameters filled)
      const testFields = ['ph', 'tds', 'turbidity', 'calcium', 'chloride'];
      const pending = (data || []).filter(sample => 
        !testFields.some(field => sample[field as keyof LabTest] && sample[field as keyof LabTest] !== null && sample[field as keyof LabTest] !== "")
      );

      console.log("Filtered pending samples:", pending);
      setPendingSamples(pending);
    } catch (error) {
      console.error("Error fetching pending samples:", error);
      toast.error("Failed to load pending samples");
    } finally {
      setLoading(false);
    }
  };

  const handleTestComplete = () => {
    fetchPendingSamples(); // This will refresh the pending samples list
    toast.success("Test completed successfully! Sample moved to treated section.");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading pending samples...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <Card>
        <CardContent className="flex flex-row items-center justify-between pt-6">
          <div>
            <p className="text-sm font-medium text-gray-600">Pending Lab Tests</p>
            <h3 className="text-3xl font-bold text-amber-600">{pendingSamples.length}</h3>
          </div>
          <Clock className="h-8 w-8 text-amber-500" />
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Pending Samples
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-md">
            <Label htmlFor="search">Search by Sample ID or Name</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Enter sample ID or submitter name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Samples */}
      {filteredSamples.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {pendingSamples.length === 0 ? "No Pending Samples" : "No Matching Samples"}
            </h3>
            <p className="text-gray-500">
              {pendingSamples.length === 0 
                ? "All samples have been tested or no samples have been submitted yet."
                : "Try adjusting your search criteria."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSamples.map((sample) => (
            <Card key={sample.id} className="border-amber-200 hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <CardTitle className="text-lg break-all">{sample.sample_id}</CardTitle>
                  <Badge variant="destructive" className="bg-amber-100 text-amber-800 border-amber-300 w-fit">
                    <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                    Awaiting Test
                  </Badge>
                </div>
                <CardDescription className="break-words">{sample.submitter_name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-600">
                  <p><strong>Email:</strong> {sample.submitter_email}</p>
                  <p><strong>Mobile:</strong> {sample.submitter_mobile}</p>
                  <p><strong>Sample Type:</strong> {sample.sample_type || "Not specified"}</p>
                  <p><strong>Submitted:</strong> {format(new Date(sample.created_at), "PPP")}</p>
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                  <DocumentViewer documentUrl={sample.sample_image_url} />
                  <span className="text-sm text-gray-500">Sample Image</span>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                    >
                      <FlaskConical className="h-4 w-4 mr-2" />
                      Enter Test Parameters
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Test Parameter Entry - {sample.sample_id}</DialogTitle>
                    </DialogHeader>
                    <AdminTestEntry
                      sampleId={sample.sample_id}
                      sampleData={sample}
                      onTestComplete={handleTestComplete}
                    />
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPendingLabTests;