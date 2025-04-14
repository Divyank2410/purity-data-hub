
import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { RefreshCw } from "lucide-react";

interface SewerQualityChartProps {
  plantName: string;
  inletWaterData: any;
  outletWaterData: any;
}

// Define parameter limits for sewer water
const parameterLimits = {
  tss: { min: 0, max: 100, unit: "mg/L" },
  ph_value: { min: 6.0, max: 9.0, unit: "pH" },
  cod: { min: 0, max: 120, unit: "mg/L" },
  bod: { min: 0, max: 30, unit: "mg/L" },
  ammonical_nitrogen: { min: 0, max: 50, unit: "mg/L" },
  total_nitrogen: { min: 0, max: 100, unit: "mg/L" },
  total_phosphorus: { min: 0, max: 5, unit: "mg/L" },
  fecal_coliform: { min: 0, max: 1000, unit: "MPN/100mL" },
};

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
      min: parameterLimits.tss.min,
      max: parameterLimits.tss.max,
      unit: parameterLimits.tss.unit,
    },
    {
      name: "pH Value",
      inlet: inletWaterData?.ph_value ? parseFloat(inletWaterData.ph_value) : 0,
      outlet: outletWaterData?.ph_value ? parseFloat(outletWaterData.ph_value) : 0,
      min: parameterLimits.ph_value.min, 
      max: parameterLimits.ph_value.max,
      unit: parameterLimits.ph_value.unit,
    },
    {
      name: "COD",
      inlet: inletWaterData?.cod ? parseFloat(inletWaterData.cod) : 0,
      outlet: outletWaterData?.cod ? parseFloat(outletWaterData.cod) : 0,
      min: parameterLimits.cod.min,
      max: parameterLimits.cod.max,
      unit: parameterLimits.cod.unit,
    },
    {
      name: "BOD",
      inlet: inletWaterData?.bod ? parseFloat(inletWaterData.bod) : 0,
      outlet: outletWaterData?.bod ? parseFloat(outletWaterData.bod) : 0,
      min: parameterLimits.bod.min,
      max: parameterLimits.bod.max,
      unit: parameterLimits.bod.unit,
    },
    {
      name: "Ammonical Nitrogen",
      inlet: inletWaterData?.ammonical_nitrogen ? parseFloat(inletWaterData.ammonical_nitrogen) : 0,
      outlet: outletWaterData?.ammonical_nitrogen ? parseFloat(outletWaterData.ammonical_nitrogen) : 0,
      min: parameterLimits.ammonical_nitrogen.min,
      max: parameterLimits.ammonical_nitrogen.max,
      unit: parameterLimits.ammonical_nitrogen.unit,
    },
    {
      name: "Total Nitrogen",
      inlet: inletWaterData?.total_nitrogen ? parseFloat(inletWaterData.total_nitrogen) : 0,
      outlet: outletWaterData?.total_nitrogen ? parseFloat(outletWaterData.total_nitrogen) : 0,
      min: parameterLimits.total_nitrogen.min,
      max: parameterLimits.total_nitrogen.max,
      unit: parameterLimits.total_nitrogen.unit,
    },
    {
      name: "Total Phosphorus",
      inlet: inletWaterData?.total_phosphorus ? parseFloat(inletWaterData.total_phosphorus) : 0,
      outlet: outletWaterData?.total_phosphorus ? parseFloat(outletWaterData.total_phosphorus) : 0,
      min: parameterLimits.total_phosphorus.min,
      max: parameterLimits.total_phosphorus.max,
      unit: parameterLimits.total_phosphorus.unit,
    },
    {
      name: "Fecal Coliform",
      inlet: inletWaterData?.fecal_coliform ? parseFloat(inletWaterData.fecal_coliform) : 0,
      outlet: outletWaterData?.fecal_coliform ? parseFloat(outletWaterData.fecal_coliform) : 0,
      min: parameterLimits.fecal_coliform.min,
      max: parameterLimits.fecal_coliform.max,
      unit: parameterLimits.fecal_coliform.unit,
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
          <ChartContainer
            config={chartConfig}
            className="w-full"
          >
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 70,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ bottom: 0 }} />
              {/* Add reference lines for min and max values */}
              <ReferenceLine 
                y={9.0} 
                label={{ value: "Max pH", position: 'insideTopRight' }} 
                stroke="#ea384c"
                strokeDasharray="3 3" 
                strokeWidth={1.5}
                ifOverflow="extendDomain"
                isFront={true}
              />
              <ReferenceLine 
                y={6.0} 
                label={{ value: "Min pH", position: 'insideBottomRight' }} 
                stroke="#0ea5e9" 
                strokeDasharray="3 3"
                strokeWidth={1.5}
                ifOverflow="extendDomain"
                isFront={true}
              />
              <Bar 
                dataKey="inlet" 
                fill="var(--color-inlet)" 
                name="Inlet Water" 
                animationBegin={0}
                animationDuration={2000}
                animationEasing="ease-in-out"
                isAnimationActive={animate}
              />
              <Bar 
                dataKey="outlet" 
                fill="var(--color-outlet)" 
                name="Outlet Water" 
                animationBegin={300}
                animationDuration={2000}
                animationEasing="ease-in-out"
                isAnimationActive={animate}
              />
            </BarChart>
          </ChartContainer>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-4 text-xs">
          {chartData.map((param) => (
            <div key={param.name} className="border rounded p-2">
              <div className="font-medium mb-1">{param.name}</div>
              <div className="grid grid-cols-2 gap-1">
                <div className="text-gray-600">Min: <span className="text-blue-600 font-medium">{param.min} {param.unit}</span></div>
                <div className="text-gray-600">Max: <span className="text-red-600 font-medium">{param.max} {param.unit}</span></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SewerQualityChart;
