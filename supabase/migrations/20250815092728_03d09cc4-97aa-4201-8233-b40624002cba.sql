-- Fix security vulnerability: Ensure lab_tests table is not publicly accessible
-- This table contains sensitive submitter information (names, addresses, mobile, email)

-- First, let's ensure RLS is enabled (it should be already)
ALTER TABLE public.lab_tests ENABLE ROW LEVEL SECURITY;

-- Check current policies and add missing restrictions
-- Ensure no public access by creating explicit authenticated-only policies

-- Drop any overly permissive policies if they exist
DROP POLICY IF EXISTS "Public can view lab tests" ON public.lab_tests;
DROP POLICY IF EXISTS "Everyone can view lab tests" ON public.lab_tests;

-- Ensure the existing policies are properly secured
-- Update the admin view policy to be more explicit about authentication
DROP POLICY IF EXISTS "Admins can view all lab tests" ON public.lab_tests;
CREATE POLICY "Admins can view all lab tests" 
ON public.lab_tests 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  EXISTS ( 
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role
  )
);

-- Ensure users can only view their own lab tests
DROP POLICY IF EXISTS "Users can view their own lab tests" ON public.lab_tests;
CREATE POLICY "Users can view their own lab tests" 
ON public.lab_tests 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Ensure users can only insert their own lab tests  
DROP POLICY IF EXISTS "Users can insert their own lab tests" ON public.lab_tests;
CREATE POLICY "Users can insert their own lab tests" 
ON public.lab_tests 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Ensure only authenticated admins can update lab test parameters
DROP POLICY IF EXISTS "Admins can update lab test parameters" ON public.lab_tests;
CREATE POLICY "Admins can update lab test parameters" 
ON public.lab_tests 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL AND 
  EXISTS ( 
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role
  )
);