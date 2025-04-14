
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
  // Animation state
  const [animate, setAnimate] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [blinkState, setBlinkState] = useState(false);

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

  // Blinking animation effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlinkState(prev => !prev);
    }, 2000); // Toggle every 2 seconds

    return () => clearInterval(blinkInterval);
  }, []);

  // Prepare data for chart
  const chartData = [
    {
      name: "Turbidity",
      raw: rawWaterData?.turbidity ? parseFloat(rawWaterData.turbidity) : 0,
      clean: cleanWaterData?.turbidity ? parseFloat(cleanWaterData.turbidity) : 0,
    },
    {
      name: "pH Value",
      raw: rawWaterData?.ph_value ? parseFloat(rawWaterData.ph_value) : 0,
      clean: cleanWaterData?.ph_value ? parseFloat(cleanWaterData.ph_value) : 0,
    },
    {
      name: "Alkalinity",
      raw: rawWaterData?.alkalinity ? parseFloat(rawWaterData.alkalinity) : 0,
      clean: cleanWaterData?.alkalinity ? parseFloat(cleanWaterData.alkalinity) : 0,
    },
    {
      name: "Chlorides",
      raw: rawWaterData?.chlorides ? parseFloat(rawWaterData.chlorides) : 0,
      clean: cleanWaterData?.chlorides ? parseFloat(cleanWaterData.chlorides) : 0,
    },
    {
      name: "Hardness",
      raw: rawWaterData?.hardness ? parseFloat(rawWaterData.hardness) : 0,
      clean: cleanWaterData?.hardness ? parseFloat(cleanWaterData.hardness) : 0,
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
        <div className={`h-[300px] ${blinkState ? "opacity-90" : "opacity-100"} transition-opacity duration-1000`}>
          <div className={`absolute inset-0 pointer-events-none ${blinkState ? "bg-blue-500/5" : "bg-transparent"} transition-colors duration-1000 rounded-lg`}></div>
          <ChartContainer
            config={chartConfig}
            className="w-full relative"
          >
            {blinkState && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-blue-500/10 animate-ping"></div>
            )}
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
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default WaterQualityChart;
