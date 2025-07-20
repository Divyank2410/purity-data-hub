
import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { ParameterValue } from "@/components/ui/parameter-value";
import { waterLimits } from "@/utils/parameterLimits";
import { ChartContainer } from "@/components/ui/chart";

interface WaterQualityChartProps {
  plantName: string;
  rawWaterData: any;
  cleanWaterData: any;
}

const WaterQualityChart: React.FC<WaterQualityChartProps> = ({
  plantName,
  rawWaterData,
  cleanWaterData,
}) => {
  const [animate, setAnimate] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const animationInterval = setInterval(() => {
      setAnimate(false);
      setTimeout(() => setAnimate(true), 50);
    }, 30000);

    return () => clearInterval(animationInterval);
  }, []);

  useEffect(() => {
    const refreshIndicatorInterval = setInterval(() => {
      setIsRefreshing(true);
      setTimeout(() => setIsRefreshing(false), 1000);
    }, 10000);

    return () => clearInterval(refreshIndicatorInterval);
  }, []);

  const chartData = [
    {
      name: "Turbidity",
      raw: rawWaterData?.turbidity ? parseFloat(rawWaterData.turbidity) : 0,
      clean: cleanWaterData?.turbidity ? parseFloat(cleanWaterData.turbidity) : 0,
      min: waterLimits.turbidity.min,
      max: waterLimits.turbidity.max,
      unit: waterLimits.turbidity.unit,
    },
    {
      name: "pH Value",
      raw: rawWaterData?.ph_value ? parseFloat(rawWaterData.ph_value) : 0,
      clean: cleanWaterData?.ph_value ? parseFloat(cleanWaterData.ph_value) : 0,
      min: waterLimits.ph_value.min,
      max: waterLimits.ph_value.max,
      unit: waterLimits.ph_value.unit,
    },
    {
      name: "Alkalinity",
      raw: rawWaterData?.alkalinity ? parseFloat(rawWaterData.alkalinity) : 0,
      clean: cleanWaterData?.alkalinity ? parseFloat(cleanWaterData.alkalinity) : 0,
      min: waterLimits.alkalinity.min,
      max: waterLimits.alkalinity.max,
      unit: waterLimits.alkalinity.unit,
    },
    {
      name: "Chlorides",
      raw: rawWaterData?.chlorides ? parseFloat(rawWaterData.chlorides) : 0,
      clean: cleanWaterData?.chlorides ? parseFloat(cleanWaterData.chlorides) : 0,
      min: waterLimits.chlorides.min,
      max: waterLimits.chlorides.max,
      unit: waterLimits.chlorides.unit,
    },
    {
      name: "Hardness",
      raw: rawWaterData?.hardness ? parseFloat(rawWaterData.hardness) : 0,
      clean: cleanWaterData?.hardness ? parseFloat(cleanWaterData.hardness) : 0,
      min: waterLimits.hardness.min,
      max: waterLimits.hardness.max,
      unit: waterLimits.hardness.unit,
    },
    {
      name: "Iron",
      raw: rawWaterData?.iron ? parseFloat(rawWaterData.iron) : 0,
      clean: cleanWaterData?.iron ? parseFloat(cleanWaterData.iron) : 0,
      min: waterLimits.iron.min,
      max: waterLimits.iron.max,
      unit: waterLimits.iron.unit,
    },
    {
      name: "Dissolved Oxygen",
      raw: rawWaterData?.dissolved_oxygen ? parseFloat(rawWaterData.dissolved_oxygen) : 0,
      clean: cleanWaterData?.dissolved_oxygen ? parseFloat(cleanWaterData.dissolved_oxygen) : 0,
      min: waterLimits.dissolved_oxygen.min,
      max: waterLimits.dissolved_oxygen.max,
      unit: waterLimits.dissolved_oxygen.unit,
    },
  ];

  const chartConfig = {
    raw: {
      label: "Raw Water",
      theme: {
        light: "#4f46e5",
        dark: "#818cf8",
      },
    },
    clean: {
      label: "Treated Water",
      theme: {
        light: "#10b981",
        dark: "#34d399",
      },
    },
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataItem = chartData.find(item => item.name === label);
      return (
        <div className="bg-white p-3 border rounded shadow">
          <p className="font-bold text-sm">{label}</p>
          <div className="grid grid-cols-2 gap-2 mt-1 text-xs">
            <div>
              <p className="text-indigo-600">Raw: {payload[0].value} {dataItem?.unit}</p>
              <p className="text-emerald-600">Treated: {payload[1].value} {dataItem?.unit}</p>
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
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 40,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ 
                  paddingTop: '20px',
                  position: 'relative',
                  bottom: 'auto'
                }} 
                align="center"
                verticalAlign="bottom"
              />
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
                name="Treated Water" 
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
              <div className="font-medium mb-2">{param.name}</div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Raw:</span>
                  <ParameterValue
                    value={rawWaterData?.[param.name.toLowerCase().replace(' ', '_')] || null}
                    limit={waterLimits[param.name.toLowerCase().replace(' ', '_')]}
                    label={`Raw water ${param.name}`}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Treated:</span>
                  <ParameterValue
                    value={cleanWaterData?.[param.name.toLowerCase().replace(' ', '_')] || null}
                    limit={waterLimits[param.name.toLowerCase().replace(' ', '_')]}
                    label={`Treated water ${param.name}`}
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

export default WaterQualityChart;
