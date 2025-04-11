
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FlaskConical, FileText, Microscope, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FileUpload from "@/components/FileUpload";
import { Checkbox } from "@/components/ui/checkbox";

const labTestFormSchema = z.object({
  sampleId: z.string().min(3, {
    message: "Sample ID must be at least 3 characters.",
  }),
  sampleType: z.string({
    required_error: "Please select a sample type.",
  }),
  testType: z.string({
    required_error: "Please select a test type.",
  }),
  collectionDate: z.string({
    required_error: "Please enter the collection date.",
  }),
  receivedDate: z.string({
    required_error: "Please enter the received date.",
  }),
  collectedBy: z.string().min(2, {
    message: "Collector name must be at least 2 characters.",
  }),
  temperature: z.string().optional(),
  pH: z.string().optional(),
  turbidity: z.string().optional(),
  dissolvedOxygen: z.string().optional(),
  conductivity: z.string().optional(),
  totalColiform: z.string().optional(),
  eColiCount: z.string().optional(),
  notes: z.string().optional(),
  // Submitter information
  submitterName: z.string().min(2, {
    message: "Submitter name must be at least 2 characters.",
  }),
  submitterAddress: z.string().min(5, {
    message: "Address must be at least 5 characters.",
  }),
  submitterEmail: z.string().email({
    message: "Please enter a valid email address.",
  }),
  submissionDate: z.string({
    required_error: "Please enter the submission date.",
  }),
  waterSource: z.string().min(2, {
    message: "Water source must be at least 2 characters.",
  }),
  // Sample collector information
  collectorName: z.string().min(2, {
    message: "Collector name must be at least 2 characters.",
  }),
  isDepartmental: z.boolean().default(false),
  serialNo: z.string().optional(),
  // New test parameters
  calcium: z.string().optional(),
  chloride: z.string().optional(),
  fluoride: z.string().optional(),
  freeResidualChlorine: z.string().optional(),
  iron: z.string().optional(),
  magnesium: z.string().optional(),
  sulphate: z.string().optional(),
  tds: z.string().optional(),
  totalAlkalinity: z.string().optional(),
  totalHardness: z.string().optional(),
});

type LabTestFormValues = z.infer<typeof labTestFormSchema>;

const LabTestsForm = ({ userId }: { userId: string }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [sampleImageUrl, setSampleImageUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("submitter-info");
  
  const defaultValues: Partial<LabTestFormValues> = {
    sampleId: "",
    sampleType: "",
    testType: "",
    collectionDate: new Date().toISOString().split('T')[0],
    receivedDate: new Date().toISOString().split('T')[0],
    collectedBy: "",
    temperature: "",
    pH: "",
    turbidity: "",
    dissolvedOxygen: "",
    conductivity: "",
    totalColiform: "",
    eColiCount: "",
    notes: "",
    // Submitter info defaults
    submitterName: "",
    submitterAddress: "",
    submitterEmail: "",
    submissionDate: new Date().toISOString().split('T')[0],
    waterSource: "",
    collectorName: "",
    isDepartmental: false,
    serialNo: "",
    // New test parameters defaults
    calcium: "",
    chloride: "",
    fluoride: "",
    freeResidualChlorine: "",
    iron: "",
    magnesium: "",
    sulphate: "",
    tds: "",
    totalAlkalinity: "",
    totalHardness: "",
  };

  const form = useForm<LabTestFormValues>({
    resolver: zodResolver(labTestFormSchema),
    defaultValues,
  });

  const onSubmit = async (data: LabTestFormValues) => {
    try {
      // Require sample image
      if (!sampleImageUrl) {
        toast.error("Please upload a sample image");
        return;
      }
      
      setIsSubmitting(true);
      
      const { error } = await supabase.from("lab_tests").insert({
        user_id: userId,
        sample_id: data.sampleId,
        sample_type: data.sampleType,
        test_type: data.testType,
        collection_date: data.collectionDate,
        received_date: data.receivedDate,
        collected_by: data.collectedBy,
        temperature: data.temperature,
        ph_value: data.pH,
        turbidity: data.turbidity,
        dissolved_oxygen: data.dissolvedOxygen,
        conductivity: data.conductivity,
        total_coliform: data.totalColiform,
        e_coli_count: data.eColiCount,
        notes: data.notes,
        document_url: documentUrl,
        // Submitter info
        submitter_name: data.submitterName,
        submitter_address: data.submitterAddress,
        submitter_email: data.submitterEmail,
        submission_date: data.submissionDate,
        water_source: data.waterSource,
        sample_image_url: sampleImageUrl,
        collector_name: data.collectorName,
        is_departmental: data.isDepartmental,
        serial_no: data.serialNo,
        // New test parameters
        calcium: data.calcium,
        chloride: data.chloride,
        fluoride: data.fluoride,
        free_residual_chlorine: data.freeResidualChlorine,
        iron: data.iron, 
        magnesium: data.magnesium,
        sulphate: data.sulphate,
        tds: data.tds,
        total_alkalinity: data.totalAlkalinity,
        total_hardness: data.totalHardness,
      });

      if (error) throw error;

      toast.success("Lab test data saved successfully!");
      form.reset(defaultValues);
      setDocumentUrl(null);
      setSampleImageUrl(null);
    } catch (error: any) {
      console.error("Error saving lab test data:", error);
      toast.error(error.message || "Failed to save lab test data. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDocumentUpload = (url: string) => {
    setDocumentUrl(url);
    toast.success("Document uploaded successfully!");
  };
  
  const handleSampleImageUpload = (url: string) => {
    setSampleImageUrl(url);
    toast.success("Sample image uploaded successfully!");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FlaskConical className="h-6 w-6 text-blue-500" />
          <span>Lab Test Data Entry</span>
        </CardTitle>
        <CardDescription>
          Enter water quality laboratory test results and upload supporting documents
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="submitter-info">Submitter Information</TabsTrigger>
                <TabsTrigger value="sample-info">Sample Information</TabsTrigger>
                <TabsTrigger value="test-results">Test Results</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>
              
              <TabsContent value="submitter-info" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="submitterName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name of Submitter</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter submitter's name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="submitterEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter email address" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="col-span-1 md:col-span-2">
                    <FormField
                      control={form.control}
                      name="submitterAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Address</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter full address" 
                              className="min-h-[80px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="submissionDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Submission</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="waterSource"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Origin Source of Water Sample</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter water source (e.g., Tap, Well, Lake)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="col-span-1 md:col-span-2">
                    <FormLabel>Sample Image (Required)</FormLabel>
                    <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-4 mt-2">
                      <div className="flex flex-col items-center space-y-2">
                        <Camera className="h-8 w-8 text-gray-400" />
                        <h3 className="text-sm font-medium">Upload Sample Image</h3>
                        <p className="text-xs text-gray-500 text-center">
                          Upload an image of the water sample (JPEG, PNG)
                        </p>
                        
                        <FileUpload
                          onUploadComplete={handleSampleImageUpload}
                          onFileUpload={handleSampleImageUpload}
                          bucketName="water-mgmt-files"
                          folderPath="lab-samples"
                          userId={userId}
                          fileType="sample"
                        />
                        
                        {sampleImageUrl && (
                          <div className="mt-2 text-sm text-green-600 flex items-center gap-1">
                            <Camera className="h-4 w-4" />
                            Sample image uploaded successfully
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="sample-info" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="sampleId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sample ID</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter sample ID" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="sampleType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sample Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select sample type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="raw_water">Raw Water</SelectItem>
                            <SelectItem value="treated_water">Treated Water</SelectItem>
                            <SelectItem value="distribution_water">Distribution Water</SelectItem>
                            <SelectItem value="wastewater">Wastewater</SelectItem>
                            <SelectItem value="sludge">Sludge</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="testType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Test Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select test type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="physical">Physical Tests</SelectItem>
                            <SelectItem value="chemical">Chemical Tests</SelectItem>
                            <SelectItem value="microbiological">Microbiological Tests</SelectItem>
                            <SelectItem value="comprehensive">Comprehensive Analysis</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="collectionDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Collection Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="receivedDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Received Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="collectedBy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Collected By</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter collector's name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="collectorName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Collector Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter collector's full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="serialNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Serial Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter serial number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="isDepartmental"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Departmental Test</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Check if this is a departmental test, otherwise it's from another source
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="test-results" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="temperature"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Temperature (°C)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter temperature" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="pH"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>pH Value</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter pH value" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="turbidity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Turbidity (NTU)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter turbidity" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="dissolvedOxygen"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dissolved Oxygen (mg/L)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter dissolved oxygen" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="conductivity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Conductivity (µS/cm)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter conductivity" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="calcium"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Calcium (as Ca) (mg/L)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter calcium value" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="chloride"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chloride (as Cl) (mg/L)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter chloride value" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="totalColiform"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Coliform (MPN/100ml)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter total coliform" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="eColiCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E. coli Count (MPN/100ml)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter E. coli count" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="fluoride"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fluoride (as F) (mg/L)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter fluoride value" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="freeResidualChlorine"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Free Residual Chlorine (mg/L)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter free residual chlorine" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="iron"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Iron (as Fe) (mg/L)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter iron value" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="magnesium"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Magnesium (as Mg) (mg/L)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter magnesium value" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="sulphate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sulphate (as SO4) (mg/L)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter sulphate value" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="tds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>TDS (mg/L)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter total dissolved solids" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="totalAlkalinity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Alkalinity (as CaCO3) (mg/L)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter total alkalinity" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="totalHardness"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Hardness (as CaCO3) (mg/L)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter total hardness" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="col-span-1 md:col-span-2">
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Notes</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter any additional observations or notes"
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="documents" className="space-y-4">
                <div className="space-y-4">
                  <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-4">
                    <div className="flex flex-col items-center space-y-2">
                      <FileText className="h-8 w-8 text-gray-400" />
                      <h3 className="text-sm font-medium">Upload Test Report Document</h3>
                      <p className="text-xs text-gray-500 text-center">
                        Upload lab reports, certificates, or any supporting documents (PDF, JPEG, PNG)
                      </p>
                      
                      <FileUpload
                        onUploadComplete={handleDocumentUpload}
                        onFileUpload={handleDocumentUpload}
                        bucketName="water-mgmt-files"
                        folderPath="lab-tests"
                        userId={userId}
                        fileType="lab"
                      />
                      
                      {documentUrl && (
                        <div className="mt-2 text-sm text-green-600 flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          Document uploaded successfully
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end space-x-2">
              <Button 
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset(defaultValues);
                  setDocumentUrl(null);
                  setSampleImageUrl(null);
                }}
              >
                Reset Form
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? "Saving..." : "Save Lab Test Data"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default LabTestsForm;
