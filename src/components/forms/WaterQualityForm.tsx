
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import FileUpload from "@/components/FileUpload";

interface WaterQualityFormProps {
  userId: string;
}

interface WaterTreatmentPlant {
  id: string;
  name: string;
  location: string;
  capacity?: string;
}

const WaterQualityForm = ({ userId }: WaterQualityFormProps) => {
  const [plants, setPlants] = useState<WaterTreatmentPlant[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [waterType, setWaterType] = useState<string>("");
  const [plantId, setPlantId] = useState<string>("");
  const [documentUrl, setDocumentUrl] = useState<string>("");
  
  // Form fields
  const [formData, setFormData] = useState({
    turbidity: "",
    ph_value: "",
    alkalinity: "",
    chlorides: "",
    hardness: "",
    iron: "",
    dissolved_oxygen: "",
  });

  useEffect(() => {
    const fetchPlants = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("water_treatment_plants")
          .select("*");
        
        if (error) throw error;
        // Cast data to our defined interface to avoid TypeScript errors
        setPlants(data as WaterTreatmentPlant[] || []);
      } catch (error) {
        console.error("Error fetching plants:", error);
        toast.error("Failed to fetch water treatment plants");
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

  const handleFileUpload = (filePath: string) => {
    setDocumentUrl(filePath);
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
      // Create an object conforming to the DB schema
      const formPayload = {
        ...formData,
        plant_id: plantId,
        water_type: waterType,
        user_id: userId,
        document_url: documentUrl,
      };

      const { error } = await supabase
        .from("water_quality_data")
        .insert(formPayload as any);
      
      if (error) throw error;
      
      toast.success("Water quality data submitted successfully!");
      
      // Reset form
      setFormData({
        turbidity: "",
        ph_value: "",
        alkalinity: "",
        chlorides: "",
        hardness: "",
        iron: "",
        dissolved_oxygen: "",
      });
      setWaterType("");
      setPlantId("");
      setDocumentUrl("");
      
    } catch (error) {
      console.error("Error submitting data:", error);
      toast.error("Failed to submit water quality data");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Water Quality Data Form</CardTitle>
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
                  <SelectItem value="raw_water">Raw Water</SelectItem>
                  <SelectItem value="clean_water">Clean Water</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* File Upload Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Upload Supporting Document (PDF or Image)</label>
            <FileUpload 
              onFileUpload={handleFileUpload} 
              fileType="water" 
              userId={userId} 
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label htmlFor="turbidity" className="text-sm font-medium">Turbidity</label>
              <Input 
                id="turbidity" 
                name="turbidity"
                value={formData.turbidity}
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
              <label htmlFor="alkalinity" className="text-sm font-medium">Alkalinity</label>
              <Input 
                id="alkalinity" 
                name="alkalinity"
                value={formData.alkalinity}
                onChange={handleInputChange}
                placeholder="Enter value"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="chlorides" className="text-sm font-medium">Chlorides</label>
              <Input 
                id="chlorides" 
                name="chlorides"
                value={formData.chlorides}
                onChange={handleInputChange}
                placeholder="Enter value"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="hardness" className="text-sm font-medium">Hardness</label>
              <Input 
                id="hardness" 
                name="hardness"
                value={formData.hardness}
                onChange={handleInputChange}
                placeholder="Enter value"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="iron" className="text-sm font-medium">Iron</label>
              <Input 
                id="iron" 
                name="iron"
                value={formData.iron}
                onChange={handleInputChange}
                placeholder="Enter value"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="dissolved_oxygen" className="text-sm font-medium">Dissolved Oxygen</label>
              <Input 
                id="dissolved_oxygen" 
                name="dissolved_oxygen"
                value={formData.dissolved_oxygen}
                onChange={handleInputChange}
                placeholder="Enter value"
              />
            </div>
          </div>
          
          <Button type="submit" className="w-full md:w-auto" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Water Quality Data"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default WaterQualityForm;
