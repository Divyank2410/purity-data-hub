import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import FileUpload from "@/components/FileUpload";

interface SewerQualityFormProps {
  userId: string;
}

interface SewerTreatmentPlant {
  id: string;
  name: string;
  location: string;
  capacity?: string;
}

const SewerQualityForm = ({ userId }: SewerQualityFormProps) => {
  const [plants, setPlants] = useState<SewerTreatmentPlant[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [waterType, setWaterType] = useState<string>("");
  const [plantId, setPlantId] = useState<string>("");
  const [documentUrl, setDocumentUrl] = useState<string>("");
  
  const [formData, setFormData] = useState({
    tss: "",
    ph_value: "",
    cod: "",
    bod: "",
    ammonical_nitrogen: "",
    total_nitrogen: "",
    total_phosphorus: "",
    fecal_coliform: "",
  });

  useEffect(() => {
    const fetchPlants = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("sewer_treatment_plants")
          .select("*");
        
        if (error) throw error;
        setPlants(data as SewerTreatmentPlant[] || []);
      } catch (error) {
        console.error("Error fetching plants:", error);
        toast.error("Failed to fetch sewer treatment plants");
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDocumentUpload = (url: string) => {
    setDocumentUrl(url);
    toast.success("Document uploaded successfully!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!plantId) {
      toast.error("Please select a treatment plant");
      return;
    }
    
    if (!waterType) {
      toast.error("Please select water type");
      return;
    }

    setSubmitting(true);
    
    try {
      const formPayload = {
        ...formData,
        plant_id: plantId,
        water_type: waterType,
        user_id: userId,
        document_url: documentUrl,
      };

      const { error } = await supabase
        .from("sewer_quality_data")
        .insert(formPayload as any);
      
      if (error) throw error;
      
      toast.success("Sewer quality data submitted successfully!");
      
      setFormData({
        tss: "",
        ph_value: "",
        cod: "",
        bod: "",
        ammonical_nitrogen: "",
        total_nitrogen: "",
        total_phosphorus: "",
        fecal_coliform: "",
      });
      setWaterType("");
      setPlantId("");
      setDocumentUrl("");
      
    } catch (error) {
      console.error("Error submitting data:", error);
      toast.error("Failed to submit sewer quality data");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sewer Quality Data Form</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Treatment Plant</label>
              <Select onValueChange={setPlantId} value={plantId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Treatment Plant" />
                </SelectTrigger>
                <SelectContent>
                  {plants.map((plant) => (
                    <SelectItem key={plant.id} value={plant.id}>
                      {plant.name} - {plant.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Water Type</label>
              <Select onValueChange={setWaterType} value={waterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Water Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inlet_water">Inlet Water</SelectItem>
                  <SelectItem value="outlet_water">Outlet Water</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Upload Supporting Document (PDF or Image)</label>
            <FileUpload
              onUploadComplete={handleDocumentUpload}
              onFileUpload={handleDocumentUpload}
              fileType="sewer"
              userId={userId}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label htmlFor="tss" className="text-sm font-medium">TSS</label>
              <Input 
                id="tss" 
                name="tss"
                value={formData.tss}
                onChange={handleInputChange}
                placeholder="Enter value"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="ph_value" className="text-sm font-medium">PH Value</label>
              <Input 
                id="ph_value" 
                name="ph_value"
                value={formData.ph_value}
                onChange={handleInputChange}
                placeholder="Enter value"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="cod" className="text-sm font-medium">COD</label>
              <Input 
                id="cod" 
                name="cod"
                value={formData.cod}
                onChange={handleInputChange}
                placeholder="Enter value"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="bod" className="text-sm font-medium">BOD</label>
              <Input 
                id="bod" 
                name="bod"
                value={formData.bod}
                onChange={handleInputChange}
                placeholder="Enter value"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="ammonical_nitrogen" className="text-sm font-medium">Ammonical Nitrogen</label>
              <Input 
                id="ammonical_nitrogen" 
                name="ammonical_nitrogen"
                value={formData.ammonical_nitrogen}
                onChange={handleInputChange}
                placeholder="Enter value"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="total_nitrogen" className="text-sm font-medium">Total Nitrogen</label>
              <Input 
                id="total_nitrogen" 
                name="total_nitrogen"
                value={formData.total_nitrogen}
                onChange={handleInputChange}
                placeholder="Enter value"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="total_phosphorus" className="text-sm font-medium">Total Phosphorus</label>
              <Input 
                id="total_phosphorus" 
                name="total_phosphorus"
                value={formData.total_phosphorus}
                onChange={handleInputChange}
                placeholder="Enter value"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="fecal_coliform" className="text-sm font-medium">Fecal Coliform</label>
              <Input 
                id="fecal_coliform" 
                name="fecal_coliform"
                value={formData.fecal_coliform}
                onChange={handleInputChange}
                placeholder="Enter value"
              />
            </div>
          </div>
          
          <Button type="submit" className="w-full md:w-auto" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Sewer Quality Data"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SewerQualityForm;
