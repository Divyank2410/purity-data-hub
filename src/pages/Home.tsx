import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { WATER_DATA_QUERY_KEY } from "@/components/admin/AdminWaterData";
import { SEWER_DATA_QUERY_KEY } from "@/components/admin/AdminSewerData";
import { AMRIT_DATA_QUERY_KEY } from "@/components/admin/AdminAmritData";
import { toast } from "sonner";
import WaterQualityChart from "@/components/WaterQualityChart";
import SewerQualityChart from "@/components/SewerQualityChart";
import ParameterLimitsDisplay from "@/components/ParameterLimitsDisplay";
import { waterLimits, sewerLimits } from "@/utils/parameterLimits";

// List of plant names to exclude (for water treatment plants only)
const excludedWaterPlantNames = [
  "Motijheel WTP - Motijheel Area"
];

// List of sewer plant names to exclude (these have been deleted but we want to ensure they don't appear)
const excludedSewerPlantNames = [
  "Lal Tipara STP",
  "Shatabdipuram STP",
  "Jalalpur STP",
  "Laliyapura STP",
  "Maharajpura STP",
  "Maharajpura STP - Maharajpura",
  "Morar STP",
  "Morar STP - Morar Region",
  "Hazira STP",
  "Hazira STP - Hazira Area",
  "Lashkar STP",
  "Lashkar STP - Lashkar Region",
  "Jhansi Road STP",
  "Jhansi Road STP - Jhansi Road"
];

interface WaterTreatmentPlant {
  id: string;
  name: string;
  location: string;
  capacity?: string;
}

interface SewerTreatmentPlant {
  id: string;
  name: string;
  location: string;
  capacity?: string;
}

interface WaterQualityData {
  id: string;
  created_at: string;
  plant_id: string;
  water_type: string;
  turbidity?: string;
  ph_value?: string;
  alkalinity?: string;
  chlorides?: string;
  hardness?: string;
  iron?: string;
  dissolved_oxygen?: string;
  water_treatment_plants?: {
    name: string;
  };
}

interface SewerQualityData {
  id: string;
  created_at: string;
  plant_id: string;
  water_type: string;
  tss?: string;
  ph_value?: string;
  cod?: string;
  bod?: string;
  ammonical_nitrogen?: string;
  total_nitrogen?: string;
  total_phosphorus?: string;
  fecal_coliform?: string;
  sewer_treatment_plants?: {
    name: string;
  };
}

interface AmritYojnaData {
  id: string;
  date: string;
  ward_no: string;
  connection_number: string;
  customer_name: string;
  mobile_no: string;
  color?: string;
  smell?: string;
  ph_value?: string;
  tds?: string;
  conductivity_cl?: string;
}

interface DataField {
  key: string;
  label: string;
}

interface DataTableProps {
  data: any[];
  fields: DataField[];
  isLoading: boolean;
  formatDateTime: (dateString: string) => string;
}

const Home = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  useEffect(() => {
    if (!autoRefreshEnabled) return;
    
    const refreshInterval = setInterval(() => {
      console.log("Auto-refreshing data");
      setIsRefreshing(true);
      
      queryClient.invalidateQueries({ queryKey: [WATER_DATA_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [SEWER_DATA_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [AMRIT_DATA_QUERY_KEY] });
      
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000);
    }, 10000);
    
    return () => clearInterval(refreshInterval);
  }, [queryClient, autoRefreshEnabled]);
  
  const handleDataUpdated = useCallback((event: CustomEvent<{ queryKey: string }>) => {
    console.log("Data updated event received for:", event.detail.queryKey);
    
    queryClient.invalidateQueries({ queryKey: [event.detail.queryKey] });
    toast.success(`${event.detail.queryKey} data has been updated`);
    console.log(`Invalidated query: ${event.detail.queryKey}`);
  }, [queryClient]);

  const handleInvalidateQuery = useCallback((event: CustomEvent<{ queryKey: string }>) => {
    console.log("Invalidating query from event:", event.detail.queryKey);
    queryClient.invalidateQueries({ queryKey: [event.detail.queryKey] });
  }, [queryClient]);

  useEffect(() => {
    window.addEventListener('invalidateQueries', handleInvalidateQuery as EventListener);
    window.addEventListener('dataUpdated', handleDataUpdated as EventListener);
    
    console.log("Home component: Event listeners for data updates attached");
    
    return () => {
      window.removeEventListener('invalidateQueries', handleInvalidateQuery as EventListener);
      window.removeEventListener('dataUpdated', handleDataUpdated as EventListener);
      console.log("Home component: Event listeners removed");
    };
  }, [handleInvalidateQuery, handleDataUpdated]);
  
  const { data: waterPlants = [], isLoading: isLoadingWaterPlants } = useQuery({
    queryKey: ["waterPlants"],
    queryFn: async () => {
      const { data, error } = await supabase.from("water_treatment_plants").select("*");
      if (error) throw error;
      
      // Filter out excluded water plants only (duplicates have been deleted from database)
      const filteredPlants = (data || []).filter(
        plant => !excludedWaterPlantNames.includes(plant.name)
      );
      
      return filteredPlants as WaterTreatmentPlant[] || [];
    },
    staleTime: 5 * 60 * 1000,
  });
  
  const { data: sewerPlants = [], isLoading: isLoadingSewerPlants } = useQuery({
    queryKey: ["sewerPlants"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sewer_treatment_plants").select("*");
      if (error) throw error;
      
      // Filter out excluded sewer plants (double check in case any still exist)
      const filteredPlants = (data || []).filter(
        plant => !excludedSewerPlantNames.includes(plant.name)
      );
      
      return filteredPlants as SewerTreatmentPlant[] || [];
    },
    staleTime: 5 * 60 * 1000,
  });
  
  const { data: waterData = [], isLoading: isLoadingWaterData } = useQuery({
    queryKey: [WATER_DATA_QUERY_KEY],
    queryFn: async () => {
      // Get all remaining plants (deleted plants are already removed from database)
      const { data: allPlants, error: plantsError } = await supabase
        .from("water_treatment_plants")
        .select("id, name");
      
      if (plantsError) throw plantsError;
      
      // Filter out only the excluded water plants
      const filteredPlants = allPlants.filter(plant => 
        !excludedWaterPlantNames.includes(plant.name)
      );
      
      const latestEntries = [];
      
      // Process data for filtered plants only
      for (const plant of filteredPlants) {
        const { data: rawData, error: rawError } = await supabase
          .from("water_quality_data")
          .select("*, water_treatment_plants(name)")
          .eq("plant_id", plant.id)
          .eq("water_type", "raw_water")
          .order("created_at", { ascending: false })
          .limit(1);
        
        if (!rawError && rawData.length > 0) {
          latestEntries.push(rawData[0]);
        }
        
        const { data: cleanData, error: cleanError } = await supabase
          .from("water_quality_data")
          .select("*, water_treatment_plants(name)")
          .eq("plant_id", plant.id)
          .eq("water_type", "clean_water")
          .order("created_at", { ascending: false })
          .limit(1);
        
        if (!cleanError && cleanData.length > 0) {
          latestEntries.push(cleanData[0]);
        }
      }
      
      return latestEntries;
    }
  });
  
  const { data: sewerData = [], isLoading: isLoadingSewerData } = useQuery({
    queryKey: [SEWER_DATA_QUERY_KEY],
    queryFn: async () => {
      // Get all sewer plants and filter out excluded ones
      const { data: allPlants, error: plantsError } = await supabase
        .from("sewer_treatment_plants")
        .select("id, name");
      
      if (plantsError) throw plantsError;
      
      // Filter out excluded sewer plants
      const filteredPlants = allPlants.filter(plant => 
        !excludedSewerPlantNames.includes(plant.name)
      );
      
      const latestEntries = [];
      
      // Process data for filtered plants only
      for (const plant of filteredPlants) {
        const { data: inletData, error: inletError } = await supabase
          .from("sewer_quality_data")
          .select("*, sewer_treatment_plants(name)")
          .eq("plant_id", plant.id)
          .eq("water_type", "inlet_water")
          .order("created_at", { ascending: false })
          .limit(1);
        
        if (!inletError && inletData.length > 0) {
          latestEntries.push(inletData[0]);
        }
        
        const { data: outletData, error: outletError } = await supabase
          .from("sewer_quality_data")
          .select("*, sewer_treatment_plants(name)")
          .eq("plant_id", plant.id)
          .eq("water_type", "outlet_water")
          .order("created_at", { ascending: false })
          .limit(1);
        
        if (!outletError && outletData.length > 0) {
          latestEntries.push(outletData[0]);
        }
      }
      
      return latestEntries;
    }
  });
  
  const { data: amritData = [], isLoading: isLoadingAmritData } = useQuery({
    queryKey: [AMRIT_DATA_QUERY_KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("amrit_yojna_data")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1);
      
      if (error) throw error;
      return data as AmritYojnaData[] || [];
    }
  });
  
  const isLoading = isLoadingWaterPlants || isLoadingSewerPlants || isLoadingWaterData || isLoadingSewerData || isLoadingAmritData;
  
  const handleRefresh = () => {
    console.log("Manually refreshing all data");
    setIsRefreshing(true);
    
    queryClient.invalidateQueries({ queryKey: [WATER_DATA_QUERY_KEY] });
    queryClient.invalidateQueries({ queryKey: [SEWER_DATA_QUERY_KEY] });
    queryClient.invalidateQueries({ queryKey: [AMRIT_DATA_QUERY_KEY] });
    
    toast.success("Data refreshed");
    
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const toggleAutoRefresh = () => {
    setAutoRefreshEnabled(prev => !prev);
    if (!autoRefreshEnabled) {
      toast.success("Auto-refresh enabled");
    } else {
      toast.info("Auto-refresh disabled");
    }
  };

  // Parameter labels for display
  const waterParameterLabels = {
    turbidity: "Turbidity",
    ph_value: "pH Value",
    alkalinity: "Alkalinity",
    chlorides: "Chlorides",
    hardness: "Hardness",
    iron: "Iron",
    dissolved_oxygen: "Dissolved Oxygen",
  };

  const sewerParameterLabels = {
    tss: "TSS",
    ph_value: "pH Value",
    cod: "COD",
    bod: "BOD",
    ammonical_nitrogen: "Ammonical Nitrogen",
    total_nitrogen: "Total Nitrogen",
    total_phosphorus: "Total Phosphorus",
    fecal_coliform: "Fecal Coliform",
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
            <div className="flex flex-wrap gap-4 items-center">
              <Button 
                variant="secondary" 
                onClick={handleRefresh} 
                className="bg-white text-blue-600 hover:bg-gray-100"
                disabled={isRefreshing}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                {isRefreshing ? "Refreshing..." : "Refresh Data"}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={toggleAutoRefresh} 
                className={`${autoRefreshEnabled ? "bg-green-100 border-green-400 text-green-700" : "bg-white text-gray-600"} hover:bg-gray-100`}
              >
                Auto-Refresh: {autoRefreshEnabled ? "On" : "Off"}
              </Button>
              
              {autoRefreshEnabled && (
                <div className="flex items-center space-x-2 text-white">
                  <span className="text-xs">Refreshing every 10 seconds</span>
                  <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                </div>
              )}
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
          <div className="grid grid-cols-1 gap-6">
            {waterPlants.map((plant) => {
                const rawWaterData = waterData.find(
                  item => item.plant_id === plant.id && item.water_type === 'raw_water'
                );
                const cleanWaterData = waterData.find(
                  item => item.plant_id === plant.id && item.water_type === 'clean_water'
                );
                
                return (
                  <Card key={plant.id} className="overflow-hidden">
                    <CardHeader>
                      <CardTitle>{plant.name}</CardTitle>
                      <CardDescription>Location: {plant.location}</CardDescription>
                      {plant.capacity && <CardDescription>Capacity: {plant.capacity}</CardDescription>}
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-2 p-6 border-r border-b lg:border-b-0">
                          <WaterQualityChart 
                            plantName={plant.name}
                            rawWaterData={rawWaterData}
                            cleanWaterData={cleanWaterData}
                          />
                          
                          <div className="mt-6">
                            <Tabs defaultValue="raw" className="w-full">
                              <TabsList className="w-full mb-4">
                                <TabsTrigger value="raw" className="flex-1">Raw Water</TabsTrigger>
                                <TabsTrigger value="clean" className="flex-1">Treated Water</TabsTrigger>
                              </TabsList>
                              
                              <TabsContent value="raw">
                                <h4 className="text-sm font-medium mb-2">Raw Water Parameters</h4>
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
                                  formatDateTime={formatDateTime}
                                />
                              </TabsContent>
                              
                              <TabsContent value="clean">
                                <h4 className="text-sm font-medium mb-2">Treated Water Parameters</h4>
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
                                  formatDateTime={formatDateTime}
                                />
                              </TabsContent>
                            </Tabs>
                          </div>
                        </div>
                        
                        <div className="p-6">
                          <ParameterLimitsDisplay
                            title="Water Quality"
                            limits={waterLimits}
                            parameterLabels={waterParameterLabels}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </TabsContent>

        <TabsContent value="sewer" className="mt-6">
          <div className="grid grid-cols-1 gap-6">
            {sewerPlants.map((plant) => {
                const inletWaterData = sewerData.find(
                  item => item.plant_id === plant.id && item.water_type === 'inlet_water'
                );
                const outletWaterData = sewerData.find(
                  item => item.plant_id === plant.id && item.water_type === 'outlet_water'
                );
                
                return (
                  <Card key={plant.id} className="overflow-hidden">
                    <CardHeader>
                      <CardTitle>{plant.name}</CardTitle>
                      <CardDescription>Location: {plant.location}</CardDescription>
                      {plant.capacity && <CardDescription>Capacity: {plant.capacity}</CardDescription>}
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-2 p-6 border-r border-b lg:border-b-0">
                          <SewerQualityChart 
                            plantName={plant.name}
                            inletWaterData={inletWaterData}
                            outletWaterData={outletWaterData}
                          />
                          
                          <div className="mt-6">
                            <Tabs defaultValue="inlet" className="w-full">
                              <TabsList className="w-full mb-4">
                                <TabsTrigger value="inlet" className="flex-1">Inlet Water</TabsTrigger>
                                <TabsTrigger value="outlet" className="flex-1">Outlet Water</TabsTrigger>
                              </TabsList>
                              
                              <TabsContent value="inlet">
                                <h4 className="text-sm font-medium mb-2">Inlet Water Parameters</h4>
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
                                  formatDateTime={formatDateTime}
                                />
                              </TabsContent>
                              
                              <TabsContent value="outlet">
                                <h4 className="text-sm font-medium mb-2">Outlet Water Parameters</h4>
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
                                  formatDateTime={formatDateTime}
                                />
                              </TabsContent>
                            </Tabs>
                          </div>
                        </div>
                        
                        <div className="p-6">
                          <ParameterLimitsDisplay
                            title="Sewer Quality"
                            limits={sewerLimits}
                            parameterLabels={sewerParameterLabels}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
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
                      <TableHead>Date & Time</TableHead>
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
                          <TableCell>{formatDateTime(item.date)}</TableCell>
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

const DataTable = ({ data, fields, isLoading, formatDateTime }: DataTableProps) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date & Time</TableHead>
            {fields.map((field) => (
              <TableHead key={field.key}>{field.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={fields.length + 1} className="text-center py-4">
                Loading data...
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={fields.length + 1} className="text-center py-4">
                No data available
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{formatDateTime(item.created_at)}</TableCell>
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
