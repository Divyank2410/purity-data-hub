
export interface ParameterLimit {
  min: number;
  max: number;
  unit: string;
}

// Water quality parameter limits - Updated with globally accepted values
export const waterLimits: Record<string, ParameterLimit> = {
  turbidity: { min: 0, max: 5, unit: "NTU" },
  ph_value: { min: 6.5, max: 8.5, unit: "pH" },
  alkalinity: { min: 20, max: 200, unit: "mg/L" },
  chlorides: { min: 0, max: 250, unit: "mg/L" },
  hardness: { min: 50, max: 300, unit: "mg/L" },
  iron: { min: 0, max: 0.3, unit: "mg/L" },
  dissolved_oxygen: { min: 5, max: 14, unit: "mg/L" },
};

// Sewer quality parameter limits - Updated with globally accepted values
export const sewerLimits: Record<string, ParameterLimit> = {
  tss: { min: 0, max: 30, unit: "mg/L" },
  ph_value: { min: 6.5, max: 8.5, unit: "pH" },
  cod: { min: 0, max: 250, unit: "mg/L" },
  bod: { min: 0, max: 30, unit: "mg/L" },
  ammonical_nitrogen: { min: 0, max: 35, unit: "mg/L" },
  total_nitrogen: { min: 0, max: 40, unit: "mg/L" },
  total_phosphorus: { min: 0, max: 2, unit: "mg/L" },
  fecal_coliform: { min: 0, max: 1000, unit: "MPN/100mL" },
};

// Amrit Yojna parameter limits
export const amritLimits: Record<string, ParameterLimit> = {
  ph_value: { min: 6.5, max: 8.5, unit: "pH" },
  tds: { min: 0, max: 500, unit: "mg/L" },
  conductivity_cl: { min: 0, max: 1000, unit: "µS/cm" },
};

export const isOverLimit = (value: string | null, limit: ParameterLimit): boolean => {
  if (!value) return false;
  const numValue = parseFloat(value);
  return !isNaN(numValue) && numValue > limit.max;
};
