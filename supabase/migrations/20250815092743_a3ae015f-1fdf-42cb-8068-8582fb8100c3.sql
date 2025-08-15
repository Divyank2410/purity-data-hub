-- Fix security vulnerability: Secure water_samples table customer data
-- This table contains sensitive customer information (names, addresses, mobile numbers)

-- Ensure RLS is enabled
ALTER TABLE public.water_samples ENABLE ROW LEVEL SECURITY;

-- Drop any potentially permissive public policies
DROP POLICY IF EXISTS "Public can view water samples" ON public.water_samples;
DROP POLICY IF EXISTS "Everyone can view water samples" ON public.water_samples;

-- Update admin policies to use consistent role-based checking instead of hardcoded email
DROP POLICY IF EXISTS "Admin email can view all water samples" ON public.water_samples;
DROP POLICY IF EXISTS "Admin email can update water samples" ON public.water_samples;

-- Create secure policies that protect customer privacy
CREATE POLICY "Users can view their own water samples" 
ON public.water_samples 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Admins can view all water samples" 
ON public.water_samples 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND is_admin(auth.uid()));

CREATE POLICY "Users can insert their own water samples" 
ON public.water_samples 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Admins can update water samples" 
ON public.water_samples 
FOR UPDATE 
USING (auth.uid() IS NOT NULL AND is_admin(auth.uid()));