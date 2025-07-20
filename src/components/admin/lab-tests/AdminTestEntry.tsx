import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FlaskConical, Save, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import DocumentViewer from "@/components/admin/DocumentViewer";

const testParametersSchema = z.object({
  calcium: z.string().min(1, "Calcium value is required"),
  chloride: z.string().min(1, "Chloride value is required"),
  e_coli: z.string().min(1, "E. coli value is required"),
  fluoride: z.string().min(1, "Fluoride value is required"),
  free_residual_chlorine: z.string().min(1, "Free Residual Chlorine value is required"),
  iron: z.string().min(1, "Iron value is required"),
  magnesium: z.string().min(1, "Magnesium value is required"),
  ph: z.string().min(1, "pH value is required"),
  sulphate: z.string().min(1, "Sulphate value is required"),
  tds: z.string().min(1, "TDS value is required"),
  total_alkalinity: z.string().min(1, "Total Alkalinity value is required"),
  total_coliform: z.string().min(1, "Total Coliform value is required"),
  total_hardness: z.string().min(1, "Total Hardness value is required"),
  turbidity: z.string().min(1, "Turbidity value is required"),
  notes: z.string().optional(),
});

type TestParametersData = z.infer<typeof testParametersSchema>;

interface AdminTestEntryProps {
  sampleId: string;
  sampleData: any;
  onTestComplete: () => void;
}

const AdminTestEntry = ({ sampleId, sampleData, onTestComplete }: AdminTestEntryProps) => {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<TestParametersData>({
    resolver: zodResolver(testParametersSchema),
    defaultValues: {
      calcium: sampleData?.calcium || "",
      chloride: sampleData?.chloride || "",
      e_coli: sampleData?.e_coli || "",
      fluoride: sampleData?.fluoride || "",
      free_residual_chlorine: sampleData?.free_residual_chlorine || "",
      iron: sampleData?.iron || "",
      magnesium: sampleData?.magnesium || "",
      ph: sampleData?.ph || "",
      sulphate: sampleData?.sulphate || "",
      tds: sampleData?.tds || "",
      total_alkalinity: sampleData?.total_alkalinity || "",
      total_coliform: sampleData?.total_coliform || "",
      total_hardness: sampleData?.total_hardness || "",
      turbidity: sampleData?.turbidity || "",
      notes: sampleData?.notes || "",
    },
  });

  const onSubmit = async (data: TestParametersData) => {
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("lab_tests")
        .update({
          calcium: data.calcium,
          chloride: data.chloride,
          e_coli: data.e_coli,
          fluoride: data.fluoride,
          free_residual_chlorine: data.free_residual_chlorine,
          iron: data.iron,
          magnesium: data.magnesium,
          ph: data.ph,
          sulphate: data.sulphate,
          tds: data.tds,
          total_alkalinity: data.total_alkalinity,
          total_coliform: data.total_coliform,
          total_hardness: data.total_hardness,
          turbidity: data.turbidity,
          notes: data.notes,
          updated_at: new Date().toISOString(),
        })
        .eq("sample_id", sampleId);

      if (error) throw error;

      toast.success("Test parameters saved successfully!");
      onTestComplete();
    } catch (error) {
      console.error("Error saving test parameters:", error);
      toast.error("Failed to save test parameters");
    } finally {
      setSubmitting(false);
    }
  };

  const testParameters = [
    { name: "calcium", label: "Calcium (as Ca)", unit: "mg/L" },
    { name: "chloride", label: "Chloride (as Cl)", unit: "mg/L" },
    { name: "e_coli", label: "E. coli", unit: "CFU/100mL" },
    { name: "fluoride", label: "Fluoride (as F)", unit: "mg/L" },
    { name: "free_residual_chlorine", label: "Free Residual Chlorine", unit: "mg/L" },
    { name: "iron", label: "Iron (as Fe)", unit: "mg/L" },
    { name: "magnesium", label: "Magnesium (as Mg)", unit: "mg/L" },
    { name: "ph", label: "pH", unit: "pH units" },
    { name: "sulphate", label: "Sulphate (as SO₄)", unit: "mg/L" },
    { name: "tds", label: "TDS", unit: "mg/L" },
    { name: "total_alkalinity", label: "Total Alkalinity", unit: "mg/L as CaCO₃" },
    { name: "total_coliform", label: "Total Coliform", unit: "CFU/100mL" },
    { name: "total_hardness", label: "Total Hardness", unit: "mg/L as CaCO₃" },
    { name: "turbidity", label: "Turbidity", unit: "NTU" },
  ];

  return (
    <Card className="border-green-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FlaskConical className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-green-900">Test Parameters Entry</CardTitle>
              <CardDescription className="text-green-700">
                Sample ID: {sampleId} | Enter all test parameter values
              </CardDescription>
            </div>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                View Sample
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Sample Information</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Submitter Name</p>
                    <p className="font-medium">{sampleData?.submitter_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Sample ID</p>
                    <p className="font-medium">{sampleData?.sample_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{sampleData?.submitter_email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Mobile</p>
                    <p className="font-medium">{sampleData?.submitter_mobile}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{sampleData?.submitter_address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Sample Image</p>
                  <DocumentViewer documentUrl={sampleData?.sample_image_url} />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {testParameters.map((param) => (
                <FormField
                  key={param.name}
                  control={form.control}
                  name={param.name as keyof TestParametersData}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        {param.label} *
                        <span className="text-sm text-gray-500 font-normal ml-1">
                          ({param.unit})
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={`Enter ${param.label}`}
                          className="border-gray-300 focus:border-green-500"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter any additional observations, remarks, or testing conditions"
                      className="min-h-[100px] border-gray-300 focus:border-green-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4 pt-4">
              <Button 
                type="submit" 
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 font-medium" 
                disabled={submitting}
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Saving Test Results...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Complete Testing & Save Results
                  </div>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AdminTestEntry;