
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ParameterLimit } from "@/utils/parameterLimits";

interface ParameterLimitsDisplayProps {
  title: string;
  limits: Record<string, ParameterLimit>;
  parameterLabels: Record<string, string>;
}

const ParameterLimitsDisplay: React.FC<ParameterLimitsDisplayProps> = ({
  title,
  limits,
  parameterLabels,
}) => {
  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-800">
          {title} - Acceptable Ranges
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {Object.entries(limits).map(([key, limit]) => (
          <div key={key} className="border-l-4 border-blue-500 pl-3 py-1">
            <div className="font-medium text-sm text-gray-700 mb-1">
              {parameterLabels[key] || key}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-green-600 font-medium">
                Min: {limit.min} {limit.unit}
              </span>
              <span className="text-red-600 font-medium">
                Max: {limit.max} {limit.unit}
              </span>
            </div>
            <div className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-400"></div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ParameterLimitsDisplay;
