import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import FileUpload from "../FileUpload";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Droplets, Upload } from "lucide-react";

const formSchema = z.object({
  submitter_name: z.string().min(1, "Name is required"),
  submitter_address: z.string().min(1, "Address is required"),
  submitter_mobile: z.string().min(10, "Valid mobile number required"),
  submitter_email: z.string().email("Invalid email address"),
  sample_type: z.string().min(1, "Sample type is required"),
});

type FormData = z.infer<typeof formSchema>;

const SampleSubmissionForm = () => {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      submitter_name: "",
      submitter_address: "",
      submitter_mobile: "",
      submitter_email: "",
      sample_type: "",
    },
  });

  const generateSampleId = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    return `LAB-${year}${month}${day}-${random}`;
  };

  const onSubmit = async (data: FormData) => {
    if (!imageUrl) {
      toast.error("Please upload a sample image before submitting");
      return;
    }

    setSubmitting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        toast.error("You must be logged in to submit samples");
        setSubmitting(false);
        return;
      }
      
      const userId = sessionData.session.user.id;
      const sampleId = generateSampleId();
      
      const { error } = await supabase.from("lab_tests").insert({
        user_id: userId,
        sample_id: sampleId,
        submitter_name: data.submitter_name,
        submitter_address: data.submitter_address,
        submitter_mobile: data.submitter_mobile,
        submitter_email: data.submitter_email,
        sample_type: data.sample_type,
        sample_image_url: imageUrl,
        // Note: All test parameters are left null for admin to fill later
      });

      if (error) throw error;

      toast.success(`Sample submitted successfully! Sample ID: ${sampleId}`, {
        duration: 6000,
      });
      form.reset();
      setImageUrl("");
    } catch (error) {
      console.error("Error submitting sample:", error);
      toast.error("Failed to submit sample");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-blue-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Droplets className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-blue-900">Submit Water Sample for Testing</CardTitle>
              <CardDescription className="text-blue-700">
                Provide your sample details and upload a photo to begin the testing process
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Submitter Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Submitter Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="submitter_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Full Name *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your full name" 
                            className="border-gray-300 focus:border-blue-500"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="submitter_mobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Mobile Number *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your mobile number" 
                            className="border-gray-300 focus:border-blue-500"
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
                  name="submitter_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Address *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter your complete address" 
                          className="border-gray-300 focus:border-blue-500 min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="submitter_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Email Address *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your email address" 
                          type="email" 
                          className="border-gray-300 focus:border-blue-500"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Sample Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Sample Information
                </h3>
                
                <FormField
                  control={form.control}
                  name="sample_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Type of Sample *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., sewer water, drinking water, groundwater, etc." 
                          className="border-gray-300 focus:border-blue-500"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel className="text-gray-700 flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Sample Image * 
                    <span className="text-red-500">(Required)</span>
                  </FormLabel>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                    <FileUpload
                      onUploadComplete={setImageUrl}
                      bucketName="water-mgmt-files"
                      folderPath="lab-samples"
                      fileType="lab"
                    />
                    {!imageUrl && (
                      <p className="text-sm text-gray-500 mt-2 text-center">
                        Upload a clear photo of your water sample (JPG, PNG, or HEIC)
                      </p>
                    )}
                    {imageUrl && (
                      <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
                        ✓ Sample image uploaded successfully
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium" 
                disabled={submitting || !imageUrl}
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Submitting Sample...
                  </div>
                ) : (
                  "Submit Sample for Testing"
                )}
              </Button>

              {!imageUrl && (
                <p className="text-center text-red-500 text-sm">
                  Please upload a sample image before submitting
                </p>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SampleSubmissionForm;