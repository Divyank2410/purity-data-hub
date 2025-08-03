import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FlaskConical, TestTube, CheckCircle, Clock, Eye, FileText } from "lucide-react";
import TestReportModal from "./water-samples/TestReportModal";
import ViewTestReportModal from "./water-samples/ViewTestReportModal";

interface WaterSample {
  id: string;
  name: string;
  address: string;
  mobile_number: string;
  source_of_sample: string;
  sample_image_url: string;
  status: "untreated" | "treated";
  created_at: string;
  admin_notes?: string;
}

const AdminWaterSamples = () => {
  const [samples, setSamples] = useState<WaterSample[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSample, setSelectedSample] = useState<WaterSample | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewReportSample, setViewReportSample] = useState<WaterSample | null>(null);
  const [isViewReportModalOpen, setIsViewReportModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("total");

  useEffect(() => {
    fetchSamples();
  }, []);

  const fetchSamples = async () => {
    try {
      const { data, error } = await supabase
        .from('water_samples')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSamples(data as WaterSample[] || []);
    } catch (error) {
      console.error("Error fetching samples:", error);
      toast.error("Failed to fetch water samples");
    } finally {
      setLoading(false);
    }
  };

  const totalSamples = samples.length;
  const untreatedSamples = samples.filter(s => s.status === 'untreated');
  const treatedSamples = samples.filter(s => s.status === 'treated');

  const handleTestReport = (sample: WaterSample) => {
    setSelectedSample(sample);
    setIsModalOpen(true);
  };

  const handleTestReportSubmit = () => {
    setIsModalOpen(false);
    setSelectedSample(null);
    fetchSamples(); // Refresh the samples list
  };

  const handleViewTestReport = (sample: WaterSample) => {
    setViewReportSample(sample);
    setIsViewReportModalOpen(true);
  };

  const getFilteredSamples = () => {
    switch (activeTab) {
      case "untreated":
        return untreatedSamples;
      case "treated":
        return treatedSamples;
      default:
        return samples;
    }
  };

  const SampleCard = ({ sample }: { sample: WaterSample }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900">{sample.name}</h3>
            <p className="text-sm text-gray-600 mt-1">Sample ID: {sample.id.slice(0, 8)}</p>
          </div>
          <Badge 
            variant={sample.status === 'treated' ? 'default' : 'secondary'}
            className={sample.status === 'treated' ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'}
          >
            {sample.status === 'treated' ? (
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Treated
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Awaiting Test
              </div>
            )}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm font-medium text-gray-700">Source</p>
            <p className="text-sm text-gray-600">{sample.source_of_sample}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Submitted</p>
            <p className="text-sm text-gray-600">
              {new Date(sample.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Mobile</p>
            <p className="text-sm text-gray-600">{sample.mobile_number}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Address</p>
            <p className="text-sm text-gray-600 truncate" title={sample.address}>
              {sample.address}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(sample.sample_image_url, '_blank')}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            View Image
          </Button>
          
          {sample.status === 'untreated' && (
            <Button
              size="sm"
              onClick={() => handleTestReport(sample)}
              className="flex items-center gap-2 bg-info hover:bg-info/90 text-info-foreground"
            >
              <TestTube className="h-4 w-4" />
              Enter Test Parameters
            </Button>
          )}

          {sample.status === 'treated' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleViewTestReport(sample)}
              className="flex items-center gap-2 border-success text-success hover:bg-success/5"
            >
              <FileText className="h-4 w-4" />
              View Test Report
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading water samples...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-info/5 to-info/10 border-info/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-info">Total Samples</p>
                <p className="text-3xl font-bold text-info-foreground">{totalSamples}</p>
              </div>
              <FlaskConical className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-warning">Untreated</p>
                <p className="text-3xl font-bold text-warning-foreground">{untreatedSamples.length}</p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/5 to-success/10 border-success/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-success">Treated</p>
                <p className="text-3xl font-bold text-success-foreground">{treatedSamples.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Samples List */}
      <Card>
        <CardHeader>
          <CardTitle>Water Samples Management</CardTitle>
          <CardDescription>
            View and manage all submitted water samples
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="total">All Samples ({totalSamples})</TabsTrigger>
              <TabsTrigger value="untreated">Untreated ({untreatedSamples.length})</TabsTrigger>
              <TabsTrigger value="treated">Treated ({treatedSamples.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="total" className="mt-6">
              <div className="space-y-4">
                {getFilteredSamples().map((sample) => (
                  <SampleCard key={sample.id} sample={sample} />
                ))}
                {samples.length === 0 && (
                  <div className="text-center py-12">
                    <FlaskConical className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No water samples submitted yet</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="untreated" className="mt-6">
              <div className="space-y-4">
                {untreatedSamples.map((sample) => (
                  <SampleCard key={sample.id} sample={sample} />
                ))}
                {untreatedSamples.length === 0 && (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
                    <p className="text-muted-foreground">All samples have been treated!</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="treated" className="mt-6">
              <div className="space-y-4">
                {treatedSamples.map((sample) => (
                  <SampleCard key={sample.id} sample={sample} />
                ))}
                {treatedSamples.length === 0 && (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 text-warning mx-auto mb-4" />
                    <p className="text-muted-foreground">No samples have been treated yet</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Test Report Modal */}
      {selectedSample && (
        <TestReportModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          sample={selectedSample}
          onSubmit={handleTestReportSubmit}
        />
      )}

      {/* View Test Report Modal */}
      {viewReportSample && (
        <ViewTestReportModal
          isOpen={isViewReportModalOpen}
          onClose={() => setIsViewReportModalOpen(false)}
          sample={viewReportSample}
        />
      )}
    </div>
  );
};

export default AdminWaterSamples;