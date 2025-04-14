
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

interface WaterQualityChartProps {
  plantName: string;
  rawWaterData: any;
  cleanWaterData: any;
}

// Define parameter limits
const parameterLimits = {
  turbidity: { min: 0, max: 5, unit: "NTU" },
  ph_value: { min: 6.5, max: 8.5, unit: "pH" },
  alkalinity: { min: 30, max: 400, unit: "mg/L" },
  chlorides: { min: 0, max: 250, unit: "mg/L" },
  hardness: { min: 0, max: 300, unit: "mg/L" },
};

const WaterQualityChart: React.FC<WaterQualityChartProps> = ({
  plantName,
  rawWaterData,
  cleanWaterData,
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
      name: "Turbidity",
      raw: rawWaterData?.turbidity ? parseFloat(rawWaterData.turbidity) : 0,
      clean: cleanWaterData?.turbidity ? parseFloat(cleanWaterData.turbidity) : 0,
      min: parameterLimits.turbidity.min,
      max: parameterLimits.turbidity.max,
      unit: parameterLimits.turbidity.unit,
    },
    {
      name: "pH Value",
      raw: rawWaterData?.ph_value ? parseFloat(rawWaterData.ph_value) : 0,
      clean: cleanWaterData?.ph_value ? parseFloat(cleanWaterData.ph_value) : 0,
      min: parameterLimits.ph_value.min,
      max: parameterLimits.ph_value.max,
      unit: parameterLimits.ph_value.unit,
    },
    {
      name: "Alkalinity",
      raw: rawWaterData?.alkalinity ? parseFloat(rawWaterData.alkalinity) : 0,
      clean: cleanWaterData?.alkalinity ? parseFloat(cleanWaterData.alkalinity) : 0,
      min: parameterLimits.alkalinity.min,
      max: parameterLimits.alkalinity.max,
      unit: parameterLimits.alkalinity.unit,
    },
    {
      name: "Chlorides",
      raw: rawWaterData?.chlorides ? parseFloat(rawWaterData.chlorides) : 0,
      clean: cleanWaterData?.chlorides ? parseFloat(cleanWaterData.chlorides) : 0,
      min: parameterLimits.chlorides.min,
      max: parameterLimits.chlorides.max,
      unit: parameterLimits.chlorides.unit,
    },
    {
      name: "Hardness",
      raw: rawWaterData?.hardness ? parseFloat(rawWaterData.hardness) : 0,
      clean: cleanWaterData?.hardness ? parseFloat(cleanWaterData.hardness) : 0,
      min: parameterLimits.hardness.min,
      max: parameterLimits.hardness.max,
      unit: parameterLimits.hardness.unit,
    },
  ];

  // Define chart config for colors
  const chartConfig = {
    raw: {
      label: "Raw Water",
      theme: {
        light: "#4f46e5",
        dark: "#818cf8",
      },
    },
    clean: {
      label: "Clean Water",
      theme: {
        light: "#10b981",
        dark: "#34d399",
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
              <p className="text-indigo-600">Raw: {payload[0].value} {dataItem?.unit}</p>
              <p className="text-emerald-600">Clean: {payload[1].value} {dataItem?.unit}</p>
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

  if (!rawWaterData && !cleanWaterData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{plantName}</CardTitle>
          <CardDescription>Water Quality Parameters Comparison</CardDescription>
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
        <CardDescription>Water Quality Parameters Comparison</CardDescription>
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
            <React.Fragment>
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
                  y={8.5} 
                  label={{ value: "Max pH", position: 'insideTopRight' }} 
                  stroke="#ea384c"
                  strokeDasharray="3 3" 
                  strokeWidth={1.5}
                  ifOverflow="extendDomain"
                  isFront={true}
                />
                <ReferenceLine 
                  y={6.5} 
                  label={{ value: "Min pH", position: 'insideBottomRight' }} 
                  stroke="#0ea5e9" 
                  strokeDasharray="3 3"
                  strokeWidth={1.5}
                  ifOverflow="extendDomain"
                  isFront={true}
                />
                <Bar 
                  dataKey="raw" 
                  fill="var(--color-raw)" 
                  name="Raw Water" 
                  animationBegin={0}
                  animationDuration={2000}
                  animationEasing="ease-in-out"
                  isAnimationActive={animate}
                />
                <Bar 
                  dataKey="clean" 
                  fill="var(--color-clean)" 
                  name="Clean Water" 
                  animationBegin={300}
                  animationDuration={2000}
                  animationEasing="ease-in-out"
                  isAnimationActive={animate}
                />
              </BarChart>
            </React.Fragment>
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

export default WaterQualityChart;
