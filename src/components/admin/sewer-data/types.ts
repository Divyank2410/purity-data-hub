
export interface SewerTreatmentPlant {
  id: string;
  name: string;
  location: string;
  capacity: string;
}

export interface SewerQualityData {
  id: string;
  plant_id: string;
  water_type: string;
  tss: string | null;
  ph_value: string | null;
  cod: string | null;
  bod: string | null;
  ammonical_nitrogen: string | null;
  total_nitrogen: string | null;
  total_phosphorus: string | null;
  fecal_coliform: string | null;
  created_at: string;
  document_url: string | null;
  sewer_treatment_plants?: SewerTreatmentPlant;
}
