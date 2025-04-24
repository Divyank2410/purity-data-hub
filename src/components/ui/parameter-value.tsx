
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ParameterLimit } from "@/utils/parameterLimits";

interface ParameterValueProps {
  value: string | null;
  limit: ParameterLimit;
  label: string;
}

export function ParameterValue({ value, limit, label }: ParameterValueProps) {
  if (!value) return <span className="text-muted-foreground">N/A</span>;
  
  const numValue = parseFloat(value);
  const isOverMax = !isNaN(numValue) && numValue > limit.max;
  
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "transition-colors",
          isOverMax && "text-red-500 font-medium animate-pulse"
        )}
      >
        {value} {limit.unit}
      </span>
      {isOverMax && (
        <AlertTriangle 
          className="h-4 w-4 text-red-500 animate-pulse" 
          aria-label={`${label} exceeds maximum limit of ${limit.max} ${limit.unit}`}
        />
      )}
    </div>
  );
}
