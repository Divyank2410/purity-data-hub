
import React from "react";
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
      <CardHeader>
        <CardTitle>{plantName}</CardTitle>
        <CardDescription>Water Quality Parameters Comparison</CardDescription>
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
              <Bar dataKey="raw" fill="var(--color-raw)" name="Raw Water" />
              <Bar dataKey="clean" fill="var(--color-clean)" name="Clean Water" />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default WaterQualityChart;
