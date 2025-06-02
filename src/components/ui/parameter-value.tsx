
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ParameterLimit } from "@/utils/parameterLimits";

interface ParameterValueProps {
  value: string | null;
  limit: ParameterLimit;
  label: string;
}

export function ParameterValue({ value, limit, label }: ParameterValueProps) {
  if (!value) return <span className="text-muted-foreground text-base-enhanced">N/A</span>;
  
  const numValue = parseFloat(value);
  const isOverMax = !isNaN(numValue) && numValue > limit.max;
  
  return (
    <div className="flex items-center gap-3">
      <span
        className={cn(
          "transition-colors text-base-enhanced font-medium",
          isOverMax && "text-red-600 font-semibold animate-danger-blink-fast"
        )}
      >
        {value} {limit.unit}
      </span>
      {isOverMax && (
        <div className="relative">
          <AlertTriangle 
            className="h-6 w-6 text-red-500 animate-danger-pulse" 
            aria-label={`${label} exceeds maximum limit of ${limit.max} ${limit.unit}`}
          />
          <div className="absolute inset-0 h-6 w-6 bg-red-500 rounded-full opacity-20 animate-danger-blink"></div>
        </div>
      )}
    </div>
  );
}
