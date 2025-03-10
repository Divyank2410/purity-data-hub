
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AmritYojnaFormProps {
  userId: string;
}

const AmritYojnaForm = ({ userId }: AmritYojnaFormProps) => {
  const [submitting, setSubmitting] = useState(false);
  
  // Form fields
  const [formData, setFormData] = useState({
    ward_no: "",
    date: "",
    connection_number: "",
    customer_name: "",
    mobile_no: "",
    color: "",
    smell: "",
    ph_value: "",
    tds: "",
    conductivity_cl: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.ward_no || !formData.date || !formData.connection_number || 
        !formData.customer_name || !formData.mobile_no) {
      toast.error("Please fill all required fields");
      return;
    }

    setSubmitting(true);
    
    try {
      const { error } = await supabase
        .from("amrit_yojna_data")
        .insert({
          ...formData,
          user_id: userId
        });
      
      if (error) throw error;
      
      toast.success("Amrit Yojna data submitted successfully!");
      
      // Reset form
      setFormData({
        ward_no: "",
        date: "",
        connection_number: "",
        customer_name: "",
        mobile_no: "",
        color: "",
        smell: "",
        ph_value: "",
        tds: "",
        conductivity_cl: "",
      });
      
    } catch (error) {
      console.error("Error submitting data:", error);
      toast.error("Failed to submit Amrit Yojna data");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Amrit Yojna Data Form</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="ward_no">Ward No. <span className="text-red-500">*</span></Label>
              <Input 
                id="ward_no" 
                name="ward_no"
                value={formData.ward_no}
                onChange={handleInputChange}
                placeholder="Enter ward number"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Date <span className="text-red-500">*</span></Label>
              <Input 
                id="date" 
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="connection_number">Connection No. <span className="text-red-500">*</span></Label>
              <Input 
                id="connection_number" 
                name="connection_number"
                value={formData.connection_number}
                onChange={handleInputChange}
                placeholder="Enter connection number"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="customer_name">Customer Name <span className="text-red-500">*</span></Label>
              <Input 
                id="customer_name" 
                name="customer_name"
                value={formData.customer_name}
                onChange={handleInputChange}
                placeholder="Enter customer name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mobile_no">Mobile No. <span className="text-red-500">*</span></Label>
              <Input 
                id="mobile_no" 
                name="mobile_no"
                value={formData.mobile_no}
                onChange={handleInputChange}
                placeholder="Enter mobile number"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input 
                id="color" 
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                placeholder="Enter color"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="smell">Smell</Label>
              <Input 
                id="smell" 
                name="smell"
                value={formData.smell}
                onChange={handleInputChange}
                placeholder="Enter smell description"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ph_value">PH Value</Label>
              <Input 
                id="ph_value" 
                name="ph_value"
                value={formData.ph_value}
                onChange={handleInputChange}
                placeholder="Enter PH value"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tds">TDS</Label>
              <Input 
                id="tds" 
                name="tds"
                value={formData.tds}
                onChange={handleInputChange}
                placeholder="Enter TDS value"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="conductivity_cl">Conductivity CL</Label>
              <Input 
                id="conductivity_cl" 
                name="conductivity_cl"
                value={formData.conductivity_cl}
                onChange={handleInputChange}
                placeholder="Enter conductivity CL value"
              />
            </div>
          </div>
          
          <Button type="submit" className="w-full md:w-auto" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Amrit Yojna Data"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AmritYojnaForm;
