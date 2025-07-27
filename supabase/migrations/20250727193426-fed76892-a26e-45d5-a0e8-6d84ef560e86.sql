-- Create water_samples table
CREATE TABLE public.water_samples (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  source_of_sample TEXT NOT NULL,
  sample_image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'untreated' CHECK (status IN ('untreated', 'treated')),
  admin_notes TEXT
);

-- Create water_test_reports table
CREATE TABLE public.water_test_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sample_id UUID NOT NULL REFERENCES public.water_samples(id) ON DELETE CASCADE,
  calcium_ca DECIMAL,
  chloride_cl DECIMAL,
  ecoli TEXT,
  fluoride_f DECIMAL,
  residual_chlorine DECIMAL,
  iron_fe DECIMAL,
  magnesium_mg DECIMAL,
  ph_level DECIMAL,
  sulphate_so4 DECIMAL,
  tds DECIMAL,
  total_alkalinity DECIMAL,
  total_coliform TEXT,
  total_hardness DECIMAL,
  turbidity DECIMAL,
  additional_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.water_samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_test_reports ENABLE ROW LEVEL SECURITY;

-- RLS policies for water_samples
CREATE POLICY "Users can insert their own water samples" 
ON public.water_samples 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own water samples" 
ON public.water_samples 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all water samples" 
ON public.water_samples 
FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update water samples" 
ON public.water_samples 
FOR UPDATE 
USING (is_admin(auth.uid()));

-- RLS policies for water_test_reports
CREATE POLICY "Admins can insert water test reports" 
ON public.water_test_reports 
FOR INSERT 
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can view all water test reports" 
ON public.water_test_reports 
FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "Users can view their own water test reports" 
ON public.water_test_reports 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.water_samples 
    WHERE water_samples.id = water_test_reports.sample_id 
    AND water_samples.user_id = auth.uid()
  )
);

-- Create function to update water sample status when test report is added
CREATE OR REPLACE FUNCTION public.update_sample_status_on_test_report()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.water_samples 
  SET status = 'treated', updated_at = now()
  WHERE id = NEW.sample_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update sample status
CREATE TRIGGER update_sample_status_trigger
  AFTER INSERT ON public.water_test_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_sample_status_on_test_report();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_water_samples_updated_at
  BEFORE UPDATE ON public.water_samples
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_water_test_reports_updated_at
  BEFORE UPDATE ON public.water_test_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();