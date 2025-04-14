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
    },
    {
      name: "pH Value",
      inlet: inletWaterData?.ph_value ? parseFloat(inletWaterData.ph_value) : 0,
      outlet: outletWaterData?.ph_value ? parseFloat(outletWaterData.ph_value) : 0,
    },
    {
      name: "COD",
      inlet: inletWaterData?.cod ? parseFloat(inletWaterData.cod) : 0,
      outlet: outletWaterData?.cod ? parseFloat(outletWaterData.cod) : 0,
    },
    {
      name: "BOD",
      inlet: inletWaterData?.bod ? parseFloat(inletWaterData.bod) : 0,
      outlet: outletWaterData?.bod ? parseFloat(outletWaterData.bod) : 0,
    },
    {
      name: "Ammonical Nitrogen",
      inlet: inletWaterData?.ammonical_nitrogen ? parseFloat(inletWaterData.ammonical_nitrogen) : 0,
      outlet: outletWaterData?.ammonical_nitrogen ? parseFloat(outletWaterData.ammonical_nitrogen) : 0,
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
              <ChartTooltip
                content={<ChartTooltipContent />}
              />
              <Legend wrapperStyle={{ bottom: 0 }} />
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
      </CardContent>
    </Card>
  );
};

export default SewerQualityChart;
