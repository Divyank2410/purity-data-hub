import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import FileUpload from "@/components/FileUpload";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Droplets, Upload, User, MapPin, Phone, FlaskConical } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  mobile_number: z.string().regex(/^[0-9]{10,15}$/, "Please enter a valid mobile number"),
  source_of_sample: z.string().min(2, "Source of sample is required"),
});

type FormData = z.infer<typeof formSchema>;

interface WaterSampleFormProps {
  userId?: string;
}

const WaterSampleForm = ({ userId }: WaterSampleFormProps) => {
  const [sampleImageUrl, setSampleImageUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedSampleId, setGeneratedSampleId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    if (!sampleImageUrl) {
      toast.error("Please upload a sample image");
      return;
    }

    if (!userId) {
      toast.error("You must be logged in to submit samples");
      return;
    }

    setIsSubmitting(true);

    try {
      // Insert water sample data
      const { data: sampleData, error: insertError } = await supabase
        .from('water_samples')
        .insert({
          user_id: userId,
          name: data.name,
          address: data.address,
          mobile_number: data.mobile_number,
          source_of_sample: data.source_of_sample,
          sample_image_url: sampleImageUrl,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setGeneratedSampleId(sampleData.id);
      toast.success(`Sample submitted successfully! Sample ID: ${sampleData.id}`);
      
      // Reset form
      reset();
      setSampleImageUrl(null);
      
    } catch (error) {
      console.error("Error submitting sample:", error);
      toast.error("Failed to submit sample. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (filePath: string) => {
    setSampleImageUrl(filePath);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
      <CardHeader className="bg-gradient-to-r from-blue-100 to-cyan-100 border-b border-blue-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500 rounded-lg">
            <Droplets className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-blue-900">Water Sample Submission</CardTitle>
            <CardDescription className="text-blue-700">
              Submit water samples for comprehensive laboratory testing and analysis
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {generatedSampleId && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800">Sample ID: {generatedSampleId}</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              Your sample has been submitted successfully and is now in the queue for testing.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2 text-blue-900">
                <User className="h-4 w-4" />
                Name *
              </Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Enter your full name"
                className="border-blue-200 focus:border-blue-400"
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile_number" className="flex items-center gap-2 text-blue-900">
                <Phone className="h-4 w-4" />
                Mobile Number *
              </Label>
              <Input
                id="mobile_number"
                {...register("mobile_number")}
                placeholder="Enter mobile number"
                className="border-blue-200 focus:border-blue-400"
              />
              {errors.mobile_number && (
                <p className="text-sm text-red-600">{errors.mobile_number.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-2 text-blue-900">
              <MapPin className="h-4 w-4" />
              Address *
            </Label>
            <Textarea
              id="address"
              {...register("address")}
              placeholder="Enter complete address"
              className="border-blue-200 focus:border-blue-400 min-h-[80px]"
            />
            {errors.address && (
              <p className="text-sm text-red-600">{errors.address.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="source_of_sample" className="flex items-center gap-2 text-blue-900">
              <Droplets className="h-4 w-4" />
              Source of Sample *
            </Label>
            <Input
              id="source_of_sample"
              {...register("source_of_sample")}
              placeholder="e.g., tap water, well water, lake, river, etc."
              className="border-blue-200 focus:border-blue-400"
            />
            {errors.source_of_sample && (
              <p className="text-sm text-red-600">{errors.source_of_sample.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-blue-900">
              <Upload className="h-4 w-4" />
              Sample Image * (JPG, PNG, HEIC)
            </Label>
            <FileUpload
              onUploadComplete={handleFileUpload}
              bucketName="water-mgmt-files"
              folderPath="water-samples"
              userId={userId}
              fileType="sample"
            />
            {sampleImageUrl && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-700">
                  ✓ Sample image uploaded successfully
                </p>
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !sampleImageUrl}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                Submitting Sample...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <FlaskConical className="h-4 w-4" />
                Submit Water Sample
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default WaterSampleForm;