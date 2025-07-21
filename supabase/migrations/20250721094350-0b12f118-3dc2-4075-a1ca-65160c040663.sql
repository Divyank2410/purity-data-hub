-- Add sample_type field to lab_tests table to support different sample types
ALTER TABLE public.lab_tests 
ADD COLUMN sample_type TEXT;

-- Update existing records to have a default sample type
UPDATE public.lab_tests 
SET sample_type = 'water sample' 
WHERE sample_type IS NULL;