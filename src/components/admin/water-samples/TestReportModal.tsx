import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TestTube } from "lucide-react";

const testReportSchema = z.object({
  calcium_ca: z.string().optional(),
  chloride_cl: z.string().optional(),
  ecoli: z.string().optional(),
  fluoride_f: z.string().optional(),
  residual_chlorine: z.string().optional(),
  iron_fe: z.string().optional(),
  magnesium_mg: z.string().optional(),
  ph_level: z.string().optional(),
  sulphate_so4: z.string().optional(),
  tds: z.string().optional(),
  total_alkalinity: z.string().optional(),
  total_coliform: z.string().optional(),
  total_hardness: z.string().optional(),
  turbidity: z.string().optional(),
  additional_notes: z.string().optional(),
});

type TestReportData = z.infer<typeof testReportSchema>;

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

interface TestReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  sample: WaterSample;
  onSubmit: () => void;
}

const TestReportModal = ({ isOpen, onClose, sample, onSubmit }: TestReportModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TestReportData>({
    resolver: zodResolver(testReportSchema),
  });

  const onSubmitReport = async (data: TestReportData) => {
    setIsSubmitting(true);

    try {
      // Convert string values to numbers where appropriate
      const processedData = {
        sample_id: sample.id,
        calcium_ca: data.calcium_ca ? parseFloat(data.calcium_ca) : null,
        chloride_cl: data.chloride_cl ? parseFloat(data.chloride_cl) : null,
        ecoli: data.ecoli || null,
        fluoride_f: data.fluoride_f ? parseFloat(data.fluoride_f) : null,
        residual_chlorine: data.residual_chlorine ? parseFloat(data.residual_chlorine) : null,
        iron_fe: data.iron_fe ? parseFloat(data.iron_fe) : null,
        magnesium_mg: data.magnesium_mg ? parseFloat(data.magnesium_mg) : null,
        ph_level: data.ph_level ? parseFloat(data.ph_level) : null,
        sulphate_so4: data.sulphate_so4 ? parseFloat(data.sulphate_so4) : null,
        tds: data.tds ? parseFloat(data.tds) : null,
        total_alkalinity: data.total_alkalinity ? parseFloat(data.total_alkalinity) : null,
        total_coliform: data.total_coliform || null,
        total_hardness: data.total_hardness ? parseFloat(data.total_hardness) : null,
        turbidity: data.turbidity ? parseFloat(data.turbidity) : null,
        additional_notes: data.additional_notes || null,
      };

      const { error } = await supabase
        .from('water_test_reports')
        .insert(processedData);

      if (error) throw error;

      // Update sample status to treated
      const { error: updateError } = await supabase
        .from('water_samples')
        .update({ status: 'treated' })
        .eq('id', sample.id);

      if (updateError) throw updateError;

      toast.success("Test report submitted successfully! Sample status updated to treated.");
      reset();
      onSubmit();
    } catch (error) {
      console.error("Error submitting test report:", error);
      toast.error("Failed to submit test report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const testParameters = [
    { key: "calcium_ca", label: "Calcium (as Ca)", unit: "mg/L" },
    { key: "chloride_cl", label: "Chloride (as Cl)", unit: "mg/L" },
    { key: "ecoli", label: "E. coli", unit: "CFU/100mL" },
    { key: "fluoride_f", label: "Fluoride (as F)", unit: "mg/L" },
    { key: "residual_chlorine", label: "Free Residual Chlorine", unit: "mg/L" },
    { key: "iron_fe", label: "Iron (as Fe)", unit: "mg/L" },
    { key: "magnesium_mg", label: "Magnesium (as Mg)", unit: "mg/L" },
    { key: "ph_level", label: "pH", unit: "pH units" },
    { key: "sulphate_so4", label: "Sulphate (as SO₄)", unit: "mg/L" },
    { key: "tds", label: "TDS", unit: "mg/L" },
    { key: "total_alkalinity", label: "Total Alkalinity", unit: "mg/L" },
    { key: "total_coliform", label: "Total Coliform", unit: "CFU/100mL" },
    { key: "total_hardness", label: "Total Hardness", unit: "mg/L" },
    { key: "turbidity", label: "Turbidity", unit: "NTU" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Test Report - {sample.name}
          </DialogTitle>
          <DialogDescription>
            Enter test parameters for Sample ID: {sample.id.slice(0, 8)} ({sample.source_of_sample})
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitReport)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testParameters.map((param) => (
              <div key={param.key} className="space-y-2">
                <Label htmlFor={param.key} className="text-sm font-medium">
                  {param.label}
                  <span className="text-xs text-gray-500 ml-1">({param.unit})</span>
                </Label>
                <Input
                  id={param.key}
                  {...register(param.key as keyof TestReportData)}
                  placeholder="Enter value"
                  className="text-sm"
                  type={param.key === "ecoli" || param.key === "total_coliform" ? "text" : "number"}
                  step="0.01"
                />
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="additional_notes" className="text-sm font-medium">
              Additional Notes
            </Label>
            <Textarea
              id="additional_notes"
              {...register("additional_notes")}
              placeholder="Any additional observations or notes..."
              className="min-h-[80px]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-info hover:bg-info/90 text-info-foreground"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current"></div>
                  Submitting Report...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <TestTube className="h-4 w-4" />
                  Submit Test Report
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TestReportModal;