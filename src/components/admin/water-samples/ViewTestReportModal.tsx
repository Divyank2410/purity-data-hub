import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TestTube, Calendar, FileText } from "lucide-react";

interface TestReport {
  id: string;
  sample_id: string;
  ph_level: number | null;
  turbidity: number | null;
  tds: number | null;
  total_hardness: number | null;
  total_alkalinity: number | null;
  chloride_cl: number | null;
  sulphate_so4: number | null;
  fluoride_f: number | null;
  iron_fe: number | null;
  calcium_ca: number | null;
  magnesium_mg: number | null;
  residual_chlorine: number | null;
  total_coliform: string | null;
  ecoli: string | null;
  additional_notes: string | null;
  created_at: string;
}

interface WaterSample {
  id: string;
  name: string;
  address: string;
  mobile_number: string;
  source_of_sample: string;
  sample_image_url: string;
  status: string;
  created_at: string;
}

interface ViewTestReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  sample: WaterSample;
}

const ViewTestReportModal = ({ isOpen, onClose, sample }: ViewTestReportModalProps) => {
  const [testReport, setTestReport] = useState<TestReport | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && sample) {
      fetchTestReport();
    }
  }, [isOpen, sample]);

  const fetchTestReport = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('water_test_reports')
        .select('*')
        .eq('sample_id', sample.id)
        .single();

      if (error) throw error;
      setTestReport(data);
    } catch (error) {
      console.error("Error fetching test report:", error);
      toast.error("Failed to fetch test report");
    } finally {
      setLoading(false);
    }
  };

  const testParameters = [
    { key: 'ph_level', label: 'pH Level', unit: '' },
    { key: 'turbidity', label: 'Turbidity', unit: 'NTU' },
    { key: 'tds', label: 'TDS', unit: 'mg/L' },
    { key: 'total_hardness', label: 'Total Hardness', unit: 'mg/L' },
    { key: 'total_alkalinity', label: 'Total Alkalinity', unit: 'mg/L' },
    { key: 'chloride_cl', label: 'Chloride (Cl⁻)', unit: 'mg/L' },
    { key: 'sulphate_so4', label: 'Sulphate (SO₄²⁻)', unit: 'mg/L' },
    { key: 'fluoride_f', label: 'Fluoride (F⁻)', unit: 'mg/L' },
    { key: 'iron_fe', label: 'Iron (Fe)', unit: 'mg/L' },
    { key: 'calcium_ca', label: 'Calcium (Ca²⁺)', unit: 'mg/L' },
    { key: 'magnesium_mg', label: 'Magnesium (Mg²⁺)', unit: 'mg/L' },
    { key: 'residual_chlorine', label: 'Residual Chlorine', unit: 'mg/L' },
    { key: 'total_coliform', label: 'Total Coliform', unit: 'CFU/100ml' },
    { key: 'ecoli', label: 'E. coli', unit: 'CFU/100ml' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Test Report - {sample.name}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-info"></div>
          </div>
        ) : testReport ? (
          <div className="space-y-6">
            {/* Sample Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5" />
                  Sample Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Sample ID</p>
                    <p className="text-sm text-gray-600">{sample.id.slice(0, 8)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Submitter</p>
                    <p className="text-sm text-gray-600">{sample.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Source</p>
                    <p className="text-sm text-gray-600">{sample.source_of_sample}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Test Date</p>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(testReport.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Test Results */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {testParameters.map((param) => {
                    const value = testReport[param.key as keyof TestReport];
                    if (value === null || value === undefined) return null;
                    
                    return (
                      <div key={param.key} className="p-3 border rounded-lg bg-muted/50">
                        <p className="text-sm font-medium text-muted-foreground">{param.label}</p>
                        <p className="text-lg font-semibold text-foreground">
                          {value} {param.unit}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Additional Notes */}
            {testReport.additional_notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Additional Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {testReport.additional_notes}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Status Badge */}
            <div className="flex justify-center">
              <Badge className="bg-success/10 text-success border-success/20 px-4 py-2">
                Test Completed
              </Badge>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No test report found for this sample</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ViewTestReportModal;