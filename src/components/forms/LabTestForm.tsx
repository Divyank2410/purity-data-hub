
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

const formSchema = z.object({
  submitter_name: z.string().min(1, "Name is required"),
  submitter_address: z.string().min(1, "Address is required"),
  submitter_mobile: z.string().min(10, "Valid mobile number required"),
  submitter_email: z.string().email("Invalid email address"),
  calcium: z.string().optional(),
  chloride: z.string().optional(),
  e_coli: z.string().optional(),
  fluoride: z.string().optional(),
  free_residual_chlorine: z.string().optional(),
  iron: z.string().optional(),
  magnesium: z.string().optional(),
  ph: z.string().optional(),
  sulphate: z.string().optional(),
  tds: z.string().optional(),
  total_alkalinity: z.string().optional(),
  total_coliform: z.string().optional(),
  total_hardness: z.string().optional(),
  turbidity: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const LabTestForm = () => {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      submitter_name: "",
      submitter_address: "",
      submitter_mobile: "",
      submitter_email: "",
      calcium: "",
      chloride: "",
      e_coli: "",
      fluoride: "",
      free_residual_chlorine: "",
      iron: "",
      magnesium: "",
      ph: "",
      sulphate: "",
      tds: "",
      total_alkalinity: "",
      total_coliform: "",
      total_hardness: "",
      turbidity: "",
      notes: "",
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
      toast.error("Please upload a sample image");
      return;
    }

    setSubmitting(true);
    try {
      // First, get the current user's session to get the user_id
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        toast.error("You must be logged in to submit lab tests");
        setSubmitting(false);
        return;
      }
      
      const userId = sessionData.session.user.id;
      
      const { error } = await supabase.from("lab_tests").insert({
        user_id: userId,
        sample_id: generateSampleId(),
        submitter_name: data.submitter_name,
        submitter_address: data.submitter_address,
        submitter_mobile: data.submitter_mobile,
        submitter_email: data.submitter_email,
        sample_image_url: imageUrl,
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
      });

      if (error) throw error;

      toast.success("Lab test submitted successfully");
      form.reset();
      setImageUrl("");
    } catch (error) {
      console.error("Error submitting lab test:", error);
      toast.error("Failed to submit lab test");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Submitter Information</CardTitle>
            <CardDescription>Please provide your contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="submitter_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="submitter_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your address" {...field} />
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
                  <FormLabel>Mobile Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your mobile number" {...field} />
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your email" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Sample Image <span className="text-red-500">*</span></FormLabel>
              <FileUpload
                onUploadComplete={setImageUrl}
                bucketName="water-mgmt-files"
                folderPath="lab-samples"
                fileType="lab"
              />
              {!imageUrl && (
                <p className="text-sm text-muted-foreground mt-1">
                  A sample image is required before submission
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Parameters</CardTitle>
            <CardDescription>Enter the test results for each parameter</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "calcium", label: "Calcium (as Ca)" },
              { name: "chloride", label: "Chloride (as Cl)" },
              { name: "e_coli", label: "E. coli" },
              { name: "fluoride", label: "Fluoride (as F)" },
              { name: "free_residual_chlorine", label: "Free Residual Chlorine" },
              { name: "iron", label: "Iron (as Fe)" },
              { name: "magnesium", label: "Magnesium (as Mg)" },
              { name: "ph", label: "pH" },
              { name: "sulphate", label: "Sulphate (as SO4)" },
              { name: "tds", label: "TDS" },
              { name: "total_alkalinity", label: "Total Alkalinity" },
              { name: "total_coliform", label: "Total Coliform" },
              { name: "total_hardness", label: "Total Hardness" },
              { name: "turbidity", label: "Turbidity" },
            ].map((field) => (
              <FormField
                key={field.name}
                control={form.control}
                name={field.name as keyof FormData}
                render={({ field: fieldProps }) => (
                  <FormItem>
                    <FormLabel>{field.label}</FormLabel>
                    <FormControl>
                      <Input placeholder={`Enter ${field.label}`} {...fieldProps} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="col-span-full">
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter any additional notes or observations"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Lab Test"}
        </Button>
      </form>
    </Form>
  );
};

export default LabTestForm;
