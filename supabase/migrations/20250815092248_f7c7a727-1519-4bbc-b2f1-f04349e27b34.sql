-- Fix security vulnerability: Remove public access to amrit_yojna_data table
-- This table contains sensitive customer information that should not be publicly accessible

-- Drop the overly permissive public SELECT policies
DROP POLICY IF EXISTS "Everyone can view amrit yojna data" ON public.amrit_yojna_data;
DROP POLICY IF EXISTS "Public can view amrit yojna data" ON public.amrit_yojna_data;

-- Create secure SELECT policies that protect customer privacy
CREATE POLICY "Users can view their own amrit yojna data" 
ON public.amrit_yojna_data 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all amrit yojna data" 
ON public.amrit_yojna_data 
FOR SELECT 
USING (is_admin(auth.uid()));