-- Fix RLS policies for water_samples to allow admin@gmail.com access
-- First, drop existing conflicting policies
DROP POLICY IF EXISTS "Admins can view all water samples" ON water_samples;
DROP POLICY IF EXISTS "Admins can update water samples" ON water_samples;

-- Create new policies that check for admin@gmail.com email
CREATE POLICY "Admin email can view all water samples" 
ON water_samples 
FOR SELECT 
USING (
  auth.jwt() ->> 'email' = 'admin@gmail.com' OR 
  auth.uid() = user_id
);

CREATE POLICY "Admin email can update water samples" 
ON water_samples 
FOR UPDATE 
USING (auth.jwt() ->> 'email' = 'admin@gmail.com');

-- Fix RLS policies for water_test_reports to allow admin@gmail.com access
DROP POLICY IF EXISTS "Admins can view all water test reports" ON water_test_reports;
DROP POLICY IF EXISTS "Admins can insert water test reports" ON water_test_reports;

CREATE POLICY "Admin email can view all water test reports" 
ON water_test_reports 
FOR SELECT 
USING (
  auth.jwt() ->> 'email' = 'admin@gmail.com' OR 
  EXISTS (
    SELECT 1 FROM water_samples 
    WHERE water_samples.id = water_test_reports.sample_id 
    AND water_samples.user_id = auth.uid()
  )
);

CREATE POLICY "Admin email can insert water test reports" 
ON water_test_reports 
FOR INSERT 
WITH CHECK (auth.jwt() ->> 'email' = 'admin@gmail.com');