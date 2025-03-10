
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Home = () => {
  const [waterData, setWaterData] = useState([]);
  const [sewerData, setSewerData] = useState([]);
  const [amritData, setAmritData] = useState([]);
  const [waterPlants, setWaterPlants] = useState([]);
  const [sewerPlants, setSewerPlants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPlants();
    fetchAllData();
  }, []);

  const fetchPlants = async () => {
    try {
      // Fetch water treatment plants
      const { data: waterPlantsData, error: waterError } = await supabase
        .from("water_treatment_plants")
        .select("*");

      if (waterError) throw waterError;
      setWaterPlants(waterPlantsData || []);

      // Fetch sewer treatment plants
      const { data: sewerPlantsData, error: sewerError } = await supabase
        .from("sewer_treatment_plants")
        .select("*");

      if (sewerError) throw sewerError;
      setSewerPlants(sewerPlantsData || []);
    } catch (error) {
      console.error("Error fetching plants:", error);
    }
  };

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      // Fetch water quality data
      const { data: waterQualityData, error: waterError } = await supabase
        .from("water_quality_data")
        .select("*, water_treatment_plants(name)")
        .order("created_at", { ascending: false });

      if (waterError) throw waterError;
      setWaterData(waterQualityData || []);

      // Fetch sewer quality data
      const { data: sewerQualityData, error: sewerError } = await supabase
        .from("sewer_quality_data")
        .select("*, sewer_treatment_plants(name)")
        .order("created_at", { ascending: false });

      if (sewerError) throw sewerError;
      setSewerData(sewerQualityData || []);

      // Fetch amrit yojna data
      const { data: amritYojnaData, error: amritError } = await supabase
        .from("amrit_yojna_data")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (amritError) throw amritError;
      setAmritData(amritYojnaData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Water & Sewerage Laboratory Testing Report
          </h1>
          <p className="text-lg text-gray-600">
            Gwalior Municipal Corporation
          </p>
        </div>
        
        <div className="relative overflow-hidden rounded-lg bg-blue-600 p-8 mb-8">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-white mb-4">Water Quality Management System</h2>
            <p className="text-white/90 mb-6 max-w-2xl">
              Comprehensive monitoring and testing of water and sewerage systems across Gwalior 
              to ensure clean and safe water for all citizens.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="secondary" onClick={fetchAllData} className="bg-white text-blue-600 hover:bg-gray-100">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Data
              </Button>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 opacity-20">
            <svg width="220" height="140" viewBox="0 0 220 140" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M170.5 11.5C170.5 35.5667 151.542 52 126.5 52C101.458 52 82.5 35.5667 82.5 11.5C82.5 -12.5667 151.458 -19.5 176.5 -19.5C201.542 -19.5 170.5 -12.5667 170.5 11.5Z" fill="white"/>
              <path d="M151 67.5C151 91.5667 137.542 108 112.5 108C87.4583 108 74 91.5667 74 67.5C74 43.4333 143 -3.5 168.042 -3.5C193.083 -3.5 151 43.4333 151 67.5Z" fill="white"/>
              <path d="M112.5 15.5C112.5 39.5666 65.5 25 65.5 0.999993C65.5 -23 27 -30.5 52.0417 -30.5C77.0833 -30.5 112.5 -8.56667 112.5 15.5Z" fill="white"/>
              <path d="M32.5 128C54.5 128 88 106 75 82C62 58 10 32 -12 32C-34 32 -18.5 58 -5.5 82C7.5 106 10.5 128 32.5 128Z" fill="white"/>
              <path d="M76.5 128C98.5 128 85 82 72 58C59 34 17 8 -5 8C-27 8 -11.5 34 1.5 58C14.5 82 54.5 128 76.5 128Z" fill="white"/>
            </svg>
          </div>
        </div>
      </section>

      <Tabs defaultValue="water" className="mb-12">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="water">Water Treatment Plants</TabsTrigger>
          <TabsTrigger value="sewer">Sewer Treatment Plants</TabsTrigger>
          <TabsTrigger value="amrit">Amrit Yojna</TabsTrigger>
        </TabsList>

        <TabsContent value="water" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {waterPlants.map((plant) => (
              <Card key={plant.id}>
                <CardHeader>
                  <CardTitle>{plant.name}</CardTitle>
                  <CardDescription>Location: {plant.location}</CardDescription>
                  {plant.capacity && <CardDescription>Capacity: {plant.capacity}</CardDescription>}
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="raw">
                    <TabsList className="w-full">
                      <TabsTrigger value="raw" className="flex-1">Raw Water</TabsTrigger>
                      <TabsTrigger value="clean" className="flex-1">Clean Water</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="raw" className="mt-4">
                      <DataTable 
                        data={waterData.filter(
                          item => item.plant_id === plant.id && item.water_type === 'raw_water'
                        )} 
                        fields={[
                          { key: 'turbidity', label: 'Turbidity' },
                          { key: 'ph_value', label: 'PH Value' },
                          { key: 'alkalinity', label: 'Alkalinity' },
                          { key: 'chlorides', label: 'Chlorides' },
                          { key: 'hardness', label: 'Hardness' },
                          { key: 'iron', label: 'Iron' },
                          { key: 'dissolved_oxygen', label: 'Dissolved Oxygen' },
                        ]}
                        isLoading={isLoading}
                      />
                    </TabsContent>
                    
                    <TabsContent value="clean" className="mt-4">
                      <DataTable 
                        data={waterData.filter(
                          item => item.plant_id === plant.id && item.water_type === 'clean_water'
                        )} 
                        fields={[
                          { key: 'turbidity', label: 'Turbidity' },
                          { key: 'ph_value', label: 'PH Value' },
                          { key: 'alkalinity', label: 'Alkalinity' },
                          { key: 'chlorides', label: 'Chlorides' },
                          { key: 'hardness', label: 'Hardness' },
                          { key: 'iron', label: 'Iron' },
                          { key: 'dissolved_oxygen', label: 'Dissolved Oxygen' },
                        ]}
                        isLoading={isLoading}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sewer" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sewerPlants.map((plant) => (
              <Card key={plant.id}>
                <CardHeader>
                  <CardTitle>{plant.name}</CardTitle>
                  <CardDescription>Location: {plant.location}</CardDescription>
                  {plant.capacity && <CardDescription>Capacity: {plant.capacity}</CardDescription>}
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="inlet">
                    <TabsList className="w-full">
                      <TabsTrigger value="inlet" className="flex-1">Inlet Water</TabsTrigger>
                      <TabsTrigger value="outlet" className="flex-1">Outlet Water</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="inlet" className="mt-4">
                      <DataTable 
                        data={sewerData.filter(
                          item => item.plant_id === plant.id && item.water_type === 'inlet_water'
                        )} 
                        fields={[
                          { key: 'tss', label: 'TSS' },
                          { key: 'ph_value', label: 'PH Value' },
                          { key: 'cod', label: 'COD' },
                          { key: 'bod', label: 'BOD' },
                          { key: 'ammonical_nitrogen', label: 'Ammonical Nitrogen' },
                          { key: 'total_nitrogen', label: 'Total Nitrogen' },
                          { key: 'total_phosphorus', label: 'Total Phosphorus' },
                          { key: 'fecal_coliform', label: 'Fecal Coliform' },
                        ]}
                        isLoading={isLoading}
                      />
                    </TabsContent>
                    
                    <TabsContent value="outlet" className="mt-4">
                      <DataTable 
                        data={sewerData.filter(
                          item => item.plant_id === plant.id && item.water_type === 'outlet_water'
                        )} 
                        fields={[
                          { key: 'tss', label: 'TSS' },
                          { key: 'ph_value', label: 'PH Value' },
                          { key: 'cod', label: 'COD' },
                          { key: 'bod', label: 'BOD' },
                          { key: 'ammonical_nitrogen', label: 'Ammonical Nitrogen' },
                          { key: 'total_nitrogen', label: 'Total Nitrogen' },
                          { key: 'total_phosphorus', label: 'Total Phosphorus' },
                          { key: 'fecal_coliform', label: 'Fecal Coliform' },
                        ]}
                        isLoading={isLoading}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="amrit" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Amrit Yojna Data</CardTitle>
              <CardDescription>
                Water quality testing results under Amrit Yojna scheme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ward No.</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Connection No.</TableHead>
                      <TableHead>Customer Name</TableHead>
                      <TableHead>Mobile No.</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead>Smell</TableHead>
                      <TableHead>PH Value</TableHead>
                      <TableHead>TDS</TableHead>
                      <TableHead>Conductivity CL</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-4">
                          Loading data...
                        </TableCell>
                      </TableRow>
                    ) : amritData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-4">
                          No data available
                        </TableCell>
                      </TableRow>
                    ) : (
                      amritData.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.ward_no}</TableCell>
                          <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                          <TableCell>{item.connection_number}</TableCell>
                          <TableCell>{item.customer_name}</TableCell>
                          <TableCell>{item.mobile_no}</TableCell>
                          <TableCell>{item.color || "N/A"}</TableCell>
                          <TableCell>{item.smell || "N/A"}</TableCell>
                          <TableCell>{item.ph_value || "N/A"}</TableCell>
                          <TableCell>{item.tds || "N/A"}</TableCell>
                          <TableCell>{item.conductivity_cl || "N/A"}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper component for displaying data tables
const DataTable = ({ data, fields, isLoading }) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {fields.map((field) => (
              <TableHead key={field.key}>{field.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={fields.length} className="text-center py-4">
                Loading data...
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={fields.length} className="text-center py-4">
                No data available
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow key={item.id}>
                {fields.map((field) => (
                  <TableCell key={`${item.id}-${field.key}`}>
                    {item[field.key] || "N/A"}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default Home;
