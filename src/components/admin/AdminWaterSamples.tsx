import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FlaskConical, TestTube, CheckCircle, Clock, Eye } from "lucide-react";
import TestReportModal from "./water-samples/TestReportModal";

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
            className={sample.status === 'treated' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
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
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <TestTube className="h-4 w-4" />
              Enter Test Parameters
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
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Total Samples</p>
                <p className="text-3xl font-bold text-blue-900">{totalSamples}</p>
              </div>
              <FlaskConical className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-800">Untreated</p>
                <p className="text-3xl font-bold text-yellow-900">{untreatedSamples.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Treated</p>
                <p className="text-3xl font-bold text-green-900">{treatedSamples.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
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
                    <FlaskConical className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No water samples submitted yet</p>
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
                    <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <p className="text-gray-500">All samples have been treated!</p>
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
                    <Clock className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                    <p className="text-gray-500">No samples have been treated yet</p>
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
    </div>
  );
};

export default AdminWaterSamples;