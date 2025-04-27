import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { ParameterValue } from "@/components/ui/parameter-value";
import { sewerLimits } from "@/utils/parameterLimits";

interface SewerQualityChartProps {
  plantName: string;
  inletWaterData: any;
  outletWaterData: any;
}

const SewerQualityChart: React.FC<SewerQualityChartProps> = ({
  plantName,
  inletWaterData,
  outletWaterData,
}) => {
  // Animation state
  const [animate, setAnimate] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Restart animation periodically
  useEffect(() => {
    const animationInterval = setInterval(() => {
      setAnimate(false);
      setTimeout(() => setAnimate(true), 50);
    }, 30000); // Every 30 seconds

    return () => clearInterval(animationInterval);
  }, []);

  // Refresh indicator animation
  useEffect(() => {
    const refreshIndicatorInterval = setInterval(() => {
      setIsRefreshing(true);
      setTimeout(() => setIsRefreshing(false), 1000);
    }, 10000); // Show refresh indicator every 10 seconds

    return () => clearInterval(refreshIndicatorInterval);
  }, []);

  // Prepare data for chart
  const chartData = [
    {
      name: "TSS",
      inlet: inletWaterData?.tss ? parseFloat(inletWaterData.tss) : 0,
      outlet: outletWaterData?.tss ? parseFloat(outletWaterData.tss) : 0,
      min: sewerLimits.tss.min,
      max: sewerLimits.tss.max,
      unit: sewerLimits.tss.unit,
    },
    {
      name: "pH Value",
      inlet: inletWaterData?.ph_value ? parseFloat(inletWaterData.ph_value) : 0,
      outlet: outletWaterData?.ph_value ? parseFloat(outletWaterData.ph_value) : 0,
      min: sewerLimits.ph_value.min,
      max: sewerLimits.ph_value.max,
      unit: sewerLimits.ph_value.unit,
    },
    {
      name: "COD",
      inlet: inletWaterData?.cod ? parseFloat(inletWaterData.cod) : 0,
      outlet: outletWaterData?.cod ? parseFloat(outletWaterData.cod) : 0,
      min: sewerLimits.cod.min,
      max: sewerLimits.cod.max,
      unit: sewerLimits.cod.unit,
    },
    {
      name: "BOD",
      inlet: inletWaterData?.bod ? parseFloat(inletWaterData.bod) : 0,
      outlet: outletWaterData?.bod ? parseFloat(outletWaterData.bod) : 0,
      min: sewerLimits.bod.min,
      max: sewerLimits.bod.max,
      unit: sewerLimits.bod.unit,
    },
    {
      name: "Ammonical Nitrogen",
      inlet: inletWaterData?.ammonical_nitrogen ? parseFloat(inletWaterData.ammonical_nitrogen) : 0,
      outlet: outletWaterData?.ammonical_nitrogen ? parseFloat(outletWaterData.ammonical_nitrogen) : 0,
      min: sewerLimits.ammonical_nitrogen.min,
      max: sewerLimits.ammonical_nitrogen.max,
      unit: sewerLimits.ammonical_nitrogen.unit,
    },
    {
      name: "Total Nitrogen",
      inlet: inletWaterData?.total_nitrogen ? parseFloat(inletWaterData.total_nitrogen) : 0,
      outlet: outletWaterData?.total_nitrogen ? parseFloat(outletWaterData.total_nitrogen) : 0,
      min: sewerLimits.total_nitrogen.min,
      max: sewerLimits.total_nitrogen.max,
      unit: sewerLimits.total_nitrogen.unit,
    },
    {
      name: "Total Phosphorus",
      inlet: inletWaterData?.total_phosphorus ? parseFloat(inletWaterData.total_phosphorus) : 0,
      outlet: outletWaterData?.total_phosphorus ? parseFloat(outletWaterData.total_phosphorus) : 0,
      min: sewerLimits.total_phosphorus.min,
      max: sewerLimits.total_phosphorus.max,
      unit: sewerLimits.total_phosphorus.unit,
    },
    {
      name: "Fecal Coliform",
      inlet: inletWaterData?.fecal_coliform ? parseFloat(inletWaterData.fecal_coliform) : 0,
      outlet: outletWaterData?.fecal_coliform ? parseFloat(outletWaterData.fecal_coliform) : 0,
      min: sewerLimits.fecal_coliform.min,
      max: sewerLimits.fecal_coliform.max,
      unit: sewerLimits.fecal_coliform.unit,
    },
  ];

  // Define chart config for colors
  const chartConfig = {
    inlet: {
      label: "Inlet Water",
      theme: {
        light: "#f97316",
        dark: "#fb923c",
      },
    },
    outlet: {
      label: "Outlet Water",
      theme: {
        light: "#0ea5e9",
        dark: "#38bdf8",
      },
    },
  };

  // Custom tooltip content with min/max values
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataItem = chartData.find(item => item.name === label);
      return (
        <div className="bg-white p-3 border rounded shadow">
          <p className="font-bold text-sm">{label}</p>
          <div className="grid grid-cols-2 gap-2 mt-1 text-xs">
            <div>
              <p className="text-orange-600">Inlet: {payload[0].value} {dataItem?.unit}</p>
              <p className="text-sky-600">Outlet: {payload[1].value} {dataItem?.unit}</p>
            </div>
            <div className="border-l pl-2">
              <p>Min: <span className="text-blue-600">{dataItem?.min} {dataItem?.unit}</span></p>
              <p>Max: <span className="text-red-600">{dataItem?.max} {dataItem?.unit}</span></p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (!inletWaterData && !outletWaterData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{plantName}</CardTitle>
          <CardDescription>Sewer Quality Parameters Comparison</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="relative">
        <CardTitle>{plantName}</CardTitle>
        <CardDescription>Sewer Quality Parameters Comparison</CardDescription>
        <div className="absolute top-4 right-4">
          <RefreshCw 
            className={`h-4 w-4 text-muted-foreground ${isRefreshing ? "animate-spin" : ""}`} 
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          
            <BarChart
              width={700}
              height={300}
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <ReferenceLine yAxisId="left" y={6} stroke="green" strokeDasharray="3 3" />
              <Bar
                yAxisId="left"
                dataKey="inlet"
                fill={chartConfig.inlet.theme.light}
                name={chartConfig.inlet.label}
                className={animate ? "animate-fadeIn" : ""}
              />
              <Bar
                yAxisId="left"
                dataKey="outlet"
                fill={chartConfig.outlet.theme.light}
                name={chartConfig.outlet.label}
                className={animate ? "animate-fadeIn" : ""}
              />
            </BarChart>
          
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-4 text-xs">
          {chartData.map((param) => (
            <div key={param.name} className="border rounded p-2">
              <div className="font-medium mb-2">{param.name}</div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Inlet:</span>
                  <ParameterValue
                    value={inletWaterData?.[param.name.toLowerCase().replace(' ', '_')] || null}
                    limit={sewerLimits[param.name.toLowerCase().replace(' ', '_')]}
                    label={`Inlet water ${param.name}`}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Outlet:</span>
                  <ParameterValue
                    value={outletWaterData?.[param.name.toLowerCase().replace(' ', '_')] || null}
                    limit={sewerLimits[param.name.toLowerCase().replace(' ', '_')]}
                    label={`Outlet water ${param.name}`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SewerQualityChart;
